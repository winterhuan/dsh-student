"""Validate capability sources and generate the packaged runtime copy without touching learner records."""

import copy
import hashlib
import json
import pathlib
import sys
from collections import Counter


ROOT = pathlib.Path(__file__).resolve().parents[2]
HERE = pathlib.Path(__file__).resolve().parent


def require(condition, message):
    if not condition:
        raise ValueError(message)


def index(items, key):
    values = [item[key] for item in items]
    require(len(values) == len(set(values)), f"duplicate {key}")
    return dict(zip(values, items))


def verify(catalog, mapping, sources):
    require(catalog['status'] == 'review-draft-not-runtime-data', 'catalog is not runtime data')
    require(mapping['status'] == 'review-draft-not-migration', 'mapping is not a migration')
    goals = index(catalog['goals'], 'id')
    families = index(catalog['families'], 'id')
    source_ids = index(sources['sources'], 'id')
    requirements = index(sources['coverage'], 'id')
    require(set(catalog['gradeScope']) == {1, 2}, 'wrong grade scope')
    require(set(catalog['termScope']) == {'first', 'second'}, 'wrong term scope')
    signatures = set()
    for family in families.values():
        signature = (tuple(sorted(family['goalIds'])), family['coreMethod'], family['structure'])
        require(signature not in signatures, f"duplicate family signature: {family['id']}")
        signatures.add(signature)
        require(family['signature'] == {
            'capabilityIds': sorted(family['goalIds']),
            'coreMethod': family['coreMethod'],
            'problemStructure': family['structure'],
        }, 'stale family signature')
        require(family['goalIds'], 'unowned family')
        require(family['representative']['id'] == family['id'] + '.mother', 'one mother ID required')
        require(family['representative']['prompt'] and family['representative']['rubric'], 'incomplete mother')
        require(family['boundary'] and family['variationAxes'], 'missing variation boundary')
        for goal_id in family['goalIds']:
            require(goal_id in goals, f"unknown family goal: {goal_id}")
            require(family['id'] in goals[goal_id]['familyIds'], 'family relation not reciprocal')
            require(goals[goal_id]['subject'] == family['subject'], 'cross-subject family')
    for goal in goals.values():
        for field in ['title', 'titleEn', 'scope', 'criterion', 'criterionEn', 'sourceLocators', 'familyIds', 'evidenceRequirements']:
            require(goal[field], f"missing {field}: {goal['id']}")
        require(len(goal['prerequisites']) == len(set(goal['prerequisites'])), 'duplicate prerequisite')
        require(len(goal['familyIds']) == len(set(goal['familyIds'])), 'duplicate family reference')
        for prerequisite in goal['prerequisites']:
            require(prerequisite in goals, f"unknown prerequisite: {prerequisite}")
            require(goals[prerequisite]['subject'] == goal['subject'], 'cross-subject prerequisite')
        for family_id in goal['familyIds']:
            require(family_id in families, f"unknown family: {family_id}")
            require(goal['id'] in families[family_id]['goalIds'], 'goal relation not reciprocal')
        for locator in goal['sourceLocators']:
            require(locator['sourceId'] in source_ids, 'unknown source')
            for page in locator.get('pdfPages', []):
                require(1 <= page <= source_ids[locator['sourceId']]['pdfPages'], 'invalid source page')
        require(set(goal['sourceIds']) == {item['sourceId'] for item in goal['sourceLocators']}, 'inconsistent source references')
        for requirement_id in goal['requirementIds']:
            require(requirement_id in requirements, 'unknown source requirement')
            require(goal['id'] in requirements[requirement_id]['goalIds'], 'requirement relation not reciprocal')
        if goal['coverageStatus'] == 'curriculum-extension-needs-confirmation':
            require(goal['activation'] == 'only-with-confirmed-curriculum-scope', 'extension enabled by default')
        if goal['subject'] == 'english' and goal['domain'] in {'reading', 'writing'}:
            require(goal['activation'] == 'only-with-confirmed-curriculum-scope', 'preparatory reading/writing default')
    visiting, visited = set(), set()

    def visit(goal_id):
        require(goal_id not in visiting, f"prerequisite cycle: {goal_id}")
        if goal_id in visited:
            return
        visiting.add(goal_id)
        for prerequisite in goals[goal_id]['prerequisites']:
            visit(prerequisite)
        visiting.remove(goal_id)
        visited.add(goal_id)

    for goal_id in goals:
        visit(goal_id)
    curriculum = ROOT / 'packages/winterhuan/student/knowledge/curriculum'
    old_goals, old_exercises = {}, {}
    for path in curriculum.glob('*-grade*.json'):
        data = json.loads(path.read_text())
        for objective in data['objectives']:
            old_goals[objective['id']] = (data, objective)
    for path in (curriculum / 'exercises').glob('*.json'):
        for exercise in json.loads(path.read_text())['exercises']:
            old_exercises[exercise['id']] = exercise
    legacy = index(mapping['objectives'], 'oldObjectiveId')
    questions = index(mapping['exercises'], 'oldExerciseId')
    require(set(legacy) == set(old_goals), 'legacy objective coverage differs from source')
    require(set(questions) == set(old_exercises), 'legacy exercise coverage differs from source')
    for old_id, record in legacy.items():
        data, objective = old_goals[old_id]
        units = {item['id'] for item in data['units']}
        require(record['oldTitle'] == objective['title'], 'changed legacy title')
        require(record['unitIds'] and set(record['unitIds']) <= units, 'invalid legacy unit')
        require(record['candidateGoalIds'], 'unmapped legacy goal')
        require(record['classification'] in {
            'course-wrapper', 'course-bundle', 'reference-wrapper', 'revision-wrapper',
            'split-bundle', 'equivalent-scoped',
        }, 'unknown mapping classification')
        require(record['inheritance'].startswith('never-by-old-goal-status'), 'unsafe status inheritance')
        for goal_id in record['candidateGoalIds']:
            require(goal_id in goals and goals[goal_id]['subject'] == data['subject'], 'invalid legacy candidate')
    for old_id, record in questions.items():
        original = old_exercises[old_id]
        require(record['originalPrompt'] == original['prompt'], 'changed original question')
        require(record['oldObjectiveId'] == original['objectiveId'], 'changed legacy question owner')
        require(record['routes'] or record['pendingReasons'], 'question has no route or pending reason')
        for route in record['routes']:
            require(route['goalId'] in goals and route['familyId'] in families, 'unresolved question route')
            require(route['familyId'] in goals[route['goalId']]['familyIds'], 'incompatible question family')
            require(goals[route['goalId']]['subject'] == original['subject'], 'cross-subject question route')
            require(route['goalId'] in legacy[original['objectiveId']]['candidateGoalIds'], 'missing candidate')
            require(route['evidenceGates'] and route['creditPolicy'].startswith('diagnostic-until-all-gates-proven'), 'unguarded legacy credit')
    for goal in goals.values():
        for old_id in goal['curriculumAssociationIds']:
            require(old_id in legacy and goal['id'] in legacy[old_id]['candidateGoalIds'], 'invalid curricular association')
    for requirement in requirements.values():
        require(requirement['sourceId'] in source_ids, 'coverage has no primary source')
        require(all(goal_id in goals for goal_id in requirement['goalIds']), 'coverage has unknown goal')
        require(all(requirement['id'] in goals[goal_id]['requirementIds'] for goal_id in requirement['goalIds']), 'coverage relation not reciprocal')
    for fingerprint in mapping['sourceFingerprints']:
        path = ROOT / fingerprint['path']
        require(hashlib.sha256(path.read_bytes()).hexdigest() == fingerprint['sha256'], 'legacy source changed; review mapping again')
    return {
        'goalsBySubject': dict(Counter(goal['subject'] for goal in goals.values())),
        'families': len(families), 'mappedOldObjectives': len(legacy), 'mappedOldExercises': len(questions),
        'diagnosticOnlyExercises': [item['oldExerciseId'] for item in questions.values() if not item['routes']],
        'goalsNeedingSchoolAssociation': [goal['id'] for goal in goals.values() if not goal['curriculumAssociationIds']],
    }


def preview(catalog, language):
    subjects = {'chinese': ('语文', 'Chinese'), 'math': ('数学', 'Math'), 'english': ('英语', 'English')}
    domains = {
        'number': ('数的认识', 'Numbers'), 'operation': ('运算与数量关系', 'Operations and quantity relationships'),
        'geometry': ('图形与方位', 'Shapes and position'), 'measurement': ('测量与生活应用', 'Measurement and everyday use'),
        'data': ('分类与记录', 'Classification and records'), 'extension': ('确认后的教材拓展', 'Confirmed curriculum extensions'),
        'practice': ('实践与参与记录', 'Practice and participation'), 'literacy': ('识字与拼音', 'Literacy and pinyin'),
        'expression': ('句子与写话', 'Sentences and writing'), 'reading': ('阅读理解', 'Reading'),
        'accumulation': ('语言与文化积累', 'Language and cultural accumulation'),
        'communication': ('倾听与交流', 'Listening and communication'), 'inquiry': ('梳理与探究', 'Organization and inquiry'),
        'listening': ('听力与视听', 'Listening and audiovisual understanding'), 'sound': ('语音', 'Speech sounds'),
        'writing': ('书写', 'Writing'), 'speaking': ('口语', 'Speaking'),
    }
    lang_index = 0 if language == 'zh' else 1
    lines = []
    for subject, names in subjects.items():
        subject_goals = [goal for goal in catalog['goals'] if goal['subject'] == subject]
        for domain in dict.fromkeys(goal['domain'] for goal in subject_goals):
            lines += [f"### {names[lang_index]} · {domains[domain][lang_index]}", '']
            lines += ['| 稳定 ID | 能力 | 检验判据 |' if language == 'zh' else '| Stable ID | Capability | Assessment criterion |', '| --- | --- | --- |']
            for goal in subject_goals:
                if goal['domain'] == domain:
                    title = goal['title'] if language == 'zh' else goal['titleEn']
                    criterion = goal['criterion'] if language == 'zh' else goal['criterionEn']
                    lines.append(f"| `{goal['id']}` | {title} | {criterion} |")
            lines.append('')
    return '\n'.join(lines)


def check_preview(catalog, write):
    begin = '<!-- capability-goals:start -->'
    end = '<!-- capability-goals:end -->'
    for language, name in [('zh', 'README.zh.md'), ('en', 'README.md')]:
        path = HERE / name
        text = path.read_text()
        require(text.count(begin) == 1 and text.count(end) == 1, 'invalid preview markers')
        before, rest = text.split(begin)
        current, after = rest.split(end)
        generated = '\n' + preview(catalog, language)
        if write:
            path.write_text(before + begin + generated + end + after)
        else:
            require(current == generated, f'stale preview: {name}; run --write-preview')


if __name__ == '__main__':
    documents = [json.loads((HERE / name).read_text()) for name in ['catalog.json', 'legacy-map.json', 'sources.json']]
    print(json.dumps(verify(*documents), ensure_ascii=False, indent=2))
    check_preview(documents[0], '--write-preview' in sys.argv)
    runtime = ROOT / 'packages/winterhuan/student/knowledge/curriculum/capabilities'
    for name, original in zip(['catalog.json', 'legacy-map.json', 'sources.json'], documents):
        published = copy.deepcopy(original)
        if name == 'catalog.json':
            published['status'] = 'source-backed-runtime-content; activate-within-parent-confirmed-scope'
        elif name == 'legacy-map.json':
            published['status'] = 'reference-routing; never-automatic-mastery-credit'
        path = runtime / name
        if '--write-runtime' in sys.argv:
            runtime.mkdir(parents=True, exist_ok=True)
            path.write_text(json.dumps(published, ensure_ascii=False, indent=2) + '\n')
        else:
            require(path.exists() and json.loads(path.read_text()) == published, f'stale runtime content: {name}; run --write-runtime')
    if '--self-test' in sys.argv:
        mutations = [
            lambda c, m: c['goals'][0]['prerequisites'].append(c['goals'][0]['id']),
            lambda c, m: c['families'].append(copy.deepcopy(c['families'][0])),
            lambda c, m: m['objectives'].pop(),
            lambda c, m: m['exercises'][0]['routes'][0].update(creditPolicy='grant-whole-goal'),
            lambda c, m: c['goals'][0]['familyIds'].append('unknown'),
        ]
        for mutation in mutations:
            catalog, mapping, sources = copy.deepcopy(documents)
            mutation(catalog, mapping)
            try:
                verify(catalog, mapping, sources)
            except ValueError:
                continue
            raise AssertionError('invalid catalog was accepted')
        print('Rejected all 5 invalid cases.')
