import { dashboard } from "../dashboard.js";
import { checkInHistory, curriculumView, exercisesFor, objectiveElements, reviewPlan } from "./view.js";
import { evidenceOf } from "./evidence.js";
import { studyDay, taughtUnit, canonical } from "./shared.js";
import { projectWorkspace } from "../files/projection.js";
import { diagnosticFor, insightSummary, studyInsight } from "./mastery.js";
import { studyStatus, weeklySummary, timeStatus, summaryMinutes } from "./status.js";
import { builtinObjectiveAnywhere, curriculumFor, subjectExercises, subjectIdeas } from "../curriculum.js";
import { z } from 'zod';
import { StudyReadCache } from "../files/cache.js";
function workspaceProjection(read, now) {
    const workspaceQueryCache = (read.cache ??= new StudyReadCache()).queries;
    const workspace = read.workspace;
    const identity = read.files.find(file => file.path === '.study/settings.json').targetKey;
    const signature = JSON.stringify([read.files.map(({ path, targetKey, version }) => ({ path, targetKey, version })), workspace.nativeSources ?? []]);
    let cached = workspaceQueryCache.get(identity);
    if (!cached || cached.signature !== signature || now >= cached.refreshAfter || now < cached.at) {
        const state = projectWorkspace(workspace, now);
        cached = { signature, state, at: now, refreshAfter: nextRefreshAfter(state, now), queries: new Map() };
        if (workspaceQueryCache.size >= 8)
            workspaceQueryCache.clear();
        workspaceQueryCache.set(identity, cached);
    }
    return cached;
}
/**
 * Read a dashboard using the same version- and time-bound projection as other workspace queries.
 * @param read - independently validated current files.
 * @param now - caller clock.
 * @param options - selected dashboard page and scope.
 * @param lessons - separately read classroom status.
 * @returns current data only for a fully valid workspace; failures retain their file issues.
 */
export function queryWorkspaceDashboard(read, now, options = {}, lessons) {
    const facts = { status: read.status, versions: read.files.map(({ path, targetKey, version }) => ({ path, targetKey, version })), issues: read.issues };
    return read.status === 'valid' && read.workspace ? { ...facts, data: queryDashboard(workspaceProjection(read, now).state, now, options, lessons) } : facts;
}
export function queryWorkspace(read, request, now) {
    const versions = read.files.map(({ path, targetKey, version }) => ({ path, targetKey, version }));
    const relevantInvalid = request.kind === 'files' ? false : request.kind === 'settings' || request.kind === 'materials' ? read.issues.some(issue => issue.path === '.study/settings.json') : request.kind === 'learning-context' ? read.issues.some(issue => issue.path === '.study/settings.json' || issue.path.startsWith('.study/blocks')) : read.status !== 'valid';
    if (!read.workspace || relevantInvalid || ['changing', 'legacy', 'archived', 'missing'].includes(read.status))
        return { status: read.status, issues: read.issues, versions };
    const workspace = read.workspace;
    if (request.kind === 'files')
        return { status: read.status === 'valid' ? 'valid' : 'partial', issues: read.issues, versions, data: workspace };
    if (request.kind === 'settings')
        return { status: read.status === 'valid' ? 'valid' : 'partial', issues: read.issues, versions, data: workspace.settings };
    const cached = workspaceProjection(read, now);
    const { state, refreshAfter } = cached;
    const index = evidenceOf(state);
    if (request.kind === 'learning-context') {
        const active = workspace.blocks.find(block => block.endedAt === undefined);
        const currentQuestion = active?.questions.find(question => question.id === active.currentQuestionId);
        const originals = active?.responses.filter(response => response.questionId === currentQuestion?.id) ?? [];
        const selected = originals.find(response => response.id === active?.currentResponseId) ?? originals.at(-1);
        const recent = originals.slice(-20);
        if (selected && !recent.some(response => response.id === selected.id))
            recent[0] = selected;
        const responses = recent.map(response => ({ ...response, answerDate: index.entries.find(item => item.ownerId === active?.id && item.responseId === response.id)?.answerDate ?? { kind: 'unknown' } }));
        const target = currentQuestion && typeof currentQuestion.objectiveId === 'string' ? builtinObjectiveAnywhere(currentQuestion.objectiveId) ?? workspace.collections?.objectives.find(goal => goal.id === currentQuestion.objectiveId) : undefined;
        const selectedProfile = active?.context.profile ? { ...active.context.profile, ...active.context.scope } : state.profile;
        const scopedState = { ...state, profile: selectedProfile };
        const elements = currentQuestion && typeof currentQuestion.objectiveId === 'string' ? objectiveElements(scopedState, currentQuestion.objectiveId) : undefined;
        const savedResponse = responses.find(response => response.id === active?.currentResponseId) ?? responses.at(-1) ?? null;
        const savedAssessment = savedResponse ? active?.assessments.find(assessment => assessment.responseId === savedResponse.id) ?? null : null;
        return { status: read.status === 'valid' ? 'valid' : 'partial', issues: read.issues, versions, refreshAfter, data: { termId: workspace.settings.termId,
                activeBlock: active ? { id: active.id, subject: active.subject, mode: active.mode, context: active.context, currentQuestionId: active.currentQuestionId } : null, currentQuestion: currentQuestion ?? null, responses,
                assessments: active?.assessments.filter(assessment => responses.some(response => response.id === assessment.responseId)) ?? [], savedResponse, savedAssessment, pendingAssessment: savedResponse !== null && savedAssessment === null,
                target: target ? { id: target.id, title: target.title, goal: target.goal, method: target.method, source: currentQuestion?.source, facts: elements?.facts ?? [] } : null,
                pendingFacts: index.entries.filter(item => item.answerDate.kind === 'unknown' || item.assistance === 'unknown' || item.sourceStatus === 'unknown' || !item.objectiveId).map(item => ({ ownerId: item.ownerId, responseId: item.responseId, fields: [...(item.answerDate.kind === 'unknown' ? ['answerDate'] : []), ...(item.assistance === 'unknown' ? ['assistance'] : []), ...(item.sourceStatus === 'unknown' ? ['source'] : []), ...(item.basisStatus ? ['answerBasis'] : !item.objectiveId ? ['objectiveId'] : [])] })).slice(0, 20),
                seeds: currentQuestion && typeof currentQuestion.objectiveId === 'string' ? subjectExercises(active.subject).filter(item => item.objectiveId === currentQuestion.objectiveId).slice(0, 3) : [],
                elements: elements ? { ...elements, exercises: elements.exercises.slice(0, 3) } : null,
                legalActions: active ? currentQuestion ? savedResponse ? savedAssessment ? ['next-question', 'end-block', 'switch-block'] : ['request-assessment', 'end-block', 'switch-block'] : ['answer', 'request-hint', 'end-block', 'switch-block'] : ['start-question', 'end-block', 'switch-block'] : ['start-block'], } };
    }
    if (request.kind === 'summary') {
        const summary = cached.summary ??= weeklySummary(state, now, studyInsight(state, now));
        const minutesByDay = summaryMinutes(state, now);
        return { status: 'valid', versions, refreshAfter, data: { ...summary, minutesByDay, activeDays: minutesByDay.filter(item => item.minutes > 0).length } };
    }
    const key = canonical(request);
    let data = cached.queries.get(key);
    if (!data) {
        data = queryStudy(state, request.kind, request.offset ?? 0, request, now);
        if (cached.queries.size >= 8)
            cached.queries.clear();
        cached.queries.set(key, data);
    }
    return { status: read.status === 'valid' ? 'valid' : 'partial', issues: read.issues, versions, refreshAfter, data: request.kind === 'status' ? { ...data, ...timeStatus(state, now) } : data };
}
/**
 * Bounded history and status queries. Only the requested collection is computed; offset pagination applies to every collection.
 * @param state - current durable learning state, or undefined before setup.
 * @param kind - record collection or projection to read.
 * @param offset - zero-based collection offset.
 * @param options - optional exact record ID, subject and unit filters, grade/term for browsing another knowledge map or a cross-grade check-in plan.
 * @param now - explicit query clock; legacy tool callers default to the host clock.
 * @returns the projection or one page of records.
 */
export function queryStudy(state, kind, offset, options = {}, now = Date.now()) {
    if (!state)
        return { phase: 'setup-required', path: '.study/state.json' };
    const { id, subject, unit } = options;
    if (kind === 'status') {
        const summary = studyStatus(state, now);
        return { ...summary, ...insightSummary(studyInsight(state, now)),
            progress: summary.progress.slice(0, 20), progressCount: summary.progress.length,
            dueMistakes: summary.dueMistakes.slice(0, 20), dueMistakeCount: summary.dueMistakes.length,
            pendingMistakes: summary.pendingMistakes.slice(0, 20), pendingMistakeCount: summary.pendingMistakes.length,
            teachingQueue: state.teachingQueue.slice(0, 20), teachingQueueCount: state.teachingQueue.length,
            workbookDrafts: state.workbookDrafts.slice(0, 20), workbookDraftCount: state.workbookDrafts.length,
            workbookResults: state.workbookResults.slice(-20).reverse(), workbookResultCount: state.workbookResults.length,
            more: 'The study skill owns what to do next; kind=progress, due, weak, exercises or curriculum with offset pages more records. Preserve unfinished work and explicitly selected goals before recommendations. interests and interestFocus wrap question context; facts stay on the knowledge map. dueToday lists at most two optional reviews. openmaic.baseUrl is the interactive-lesson service; author its independent lesson log and validate it with the packaged CLI.',
        };
    }
    if (kind === 'curriculum') {
        if (!subject)
            throw new Error('知识地图查询需要指定科目（subject）。');
        const scope = options.grade !== undefined || options.term !== undefined ? { grade: options.grade ?? state.profile.grade, term: options.term ?? state.profile.term } : undefined;
        return { revision: state.revision, curriculum: curriculumView(state, subject, studyInsight(state, now), scope) };
    }
    if (kind === 'elements') {
        if (!subject)
            throw new Error('知识要素查询需要指定科目（subject）。');
        if (options.grade !== undefined || options.term !== undefined)
            throw new Error('知识要素只支持当前学期的知识地图。');
        const file = curriculumFor(state.profile, subject);
        if (!file)
            throw new Error('当前档案没有该科知识地图。');
        const page = file.objectives
            .filter(objective => {
            const unitId = file.concepts.find(concept => concept.id === objective.conceptIds[0])?.unit ?? '';
            if (!taughtUnit(state, subject, unitId))
                return false;
            if (unit !== undefined && unitId !== unit)
                return false;
            return id === undefined || objective.id === id;
        })
            .map(objective => {
            const elements = objectiveElements(state, objective.id);
            const unitId = file.concepts.find(concept => concept.id === objective.conceptIds[0])?.unit ?? '';
            return {
                id: objective.id, title: objective.title, goal: objective.goal, method: objective.method, unit: unitId,
                errorTypes: elements?.errorTypes ?? [], questionPoints: elements?.questionPoints ?? [], variationAxes: elements?.variationAxes ?? [],
                misconceptions: elements?.misconceptions ?? [], examples: elements?.examples ?? [], hintLadder: elements?.hintLadder ?? ['', '', ''],
                exercises: elements?.exercises ?? [],
                knowledgePoints: file.concepts.filter(concept => objective.conceptIds.includes(concept.id)).map(concept => ({
                    id: concept.id, name: concept.name, definition: concept.definition, example: concept.example,
                    ...((concept.ideaIds?.length ?? 0) > 0 ? { ideas: subjectIdeas(subject).filter(idea => concept.ideaIds?.includes(idea.id)).map(idea => ({ id: idea.id, name: idea.name, definition: idea.definition, example: idea.example })) } : {}),
                    ...(concept.facts !== undefined ? { facts: concept.facts } : {}),
                    ...(concept.misconceptions !== undefined ? { misconceptions: concept.misconceptions } : {}),
                    ...(concept.examples !== undefined ? { examples: concept.examples } : {}),
                })),
            };
        });
        return {
            revision: state.revision, subject, objectives: page.slice(offset, offset + 20),
            nextOffset: offset + 20 < page.length ? offset + 20 : null,
            more: 'Write questions and hints from these elements, reference exercises and the hint ladder; the full rules live in the study skill.',
        };
    }
    if (kind === 'exercises') {
        const subjects = subject ? [subject] : ['chinese', 'math', 'english'];
        const saved = state.exercises.filter(item => !subject || item.subject === subject);
        const seen = new Set(saved.map(item => item.id));
        const shipped = subjects.flatMap(sub => subjectExercises(sub)).filter(item => !seen.has(item.id));
        const all = [...saved.map(item => ({ ...item, source: 'workspace' })), ...shipped.map(item => ({ ...item, source: 'shipped' }))];
        const filtered = all.filter(item => {
            if (id !== undefined && item.id !== id && item.objectiveId !== id)
                return false;
            if (unit !== undefined) {
                const objective = builtinObjectiveAnywhere(item.objectiveId);
                if (objective?.unit !== unit)
                    return false;
            }
            return true;
        });
        return {
            revision: state.revision, total: filtered.length, items: filtered.slice(offset, offset + 20),
            nextOffset: offset + 20 < filtered.length ? offset + 20 : null,
        };
    }
    if (kind === 'review-sheet') {
        if (!subject)
            throw new Error('巩固卷查询需要指定科目（subject）。');
        return { revision: state.revision, ...reviewPlan(state, subject, now),
            more: 'Write one new question per pick and one per objectiveFill; variant distance and reuse limits are schema-enforced and explained in the study skill.', };
    }
    if (kind === 'diagnose') {
        const scope = options.grade !== undefined || options.term !== undefined
            ? { grade: options.grade ?? state.profile.grade, term: options.term ?? state.profile.term, ...(options.unit !== undefined ? { units: [options.unit] } : {}) }
            : undefined;
        if (scope && !subject)
            throw new Error('跨年级摸底计划需要指定科目（subject）。');
        const diagnostics = (scope && subject ? [diagnosticFor(state, subject, now, scope)] : studyInsight(state, now).diagnostics)
            .filter(plan => !subject || plan.subject === subject)
            .map(plan => ({
            ...plan,
            sample: plan.sample.map(sample => {
                const exercise = exercisesFor(state, sample.id).find(item => item.role === 'diagnose') ?? exercisesFor(state, sample.id)[0];
                return { ...sample, ...(exercise !== undefined ? { exercise } : {}) };
            }),
        }));
        return { revision: state.revision, diagnostics,
            history: checkInHistory(state).filter(item => !subject || item.subject === subject),
            more: 'Ask one short task per sampled objective and record each answer; the study skill describes the flow and intensities, and grade/term narrows the scope.', };
    }
    if (kind === 'weak') {
        const insight = studyInsight(state, now);
        return { revision: state.revision, ...insightSummary(insight),
            weakPoints: insight.weakPoints.map(item => ({ id: item.id, subject: item.subject, title: item.title, goal: item.goal, level: item.level, priority: item.priority, reasons: item.reasons })),
            practised: insight.objectives.filter(item => item.attempts > 0 || item.activeMistakes > 0).map(item => ({ id: item.id, subject: item.subject, title: item.title, level: item.level, independentDays: item.independentDays, attempts: item.attempts, helpedOrWrong: item.helpedOrWrong, activeMistakes: item.activeMistakes, dueMistakes: item.dueMistakes })),
            more: 'Use kind=curriculum with a subject for the map behind these weak points.',
        };
    }
    const collections = {
        due: () => state.mistakes.filter(item => item.dueAt !== undefined && item.dueAt <= now),
        pending: () => state.mistakes.filter(item => item.confirmedAt === undefined),
        progress: () => studyStatus(state, now).progress,
        concepts: () => state.concepts, objectives: () => state.objectives, relations: () => state.relations,
        worksheets: () => state.worksheets.map(sheet => ({ ...sheet, drafts: state.paperDrafts.filter(draft => draft.worksheetId === sheet.id) })),
        'paper-results': () => state.paperResults, materials: () => state.materials, mistakes: () => state.mistakes,
        sessions: () => state.sessions, attempts: () => state.attempts,
    };
    const chosen = Object.hasOwn(collections, kind) ? collections[kind] : undefined;
    if (chosen === undefined)
        throw new Error(`未知的查询类型：${kind}。可用的类型见 study_status 工具说明。`);
    const selected = chosen().filter(item => {
        if (id && (!('id' in item) || item.id !== id))
            return false;
        if (!subject)
            return true;
        if ('subject' in item)
            return item.subject === subject;
        if ('fromId' in item)
            return state.concepts.some(concept => concept.id === item.fromId && concept.subject === subject);
        if ('worksheetId' in item)
            return state.worksheets.some(sheet => sheet.id === item.worksheetId && sheet.subject === subject);
        return true;
    });
    return { revision: state.revision, total: selected.length, items: selected.slice(offset, offset + 20), nextOffset: offset + 20 < selected.length ? offset + 20 : null };
}
/**
 * Compute the next relevant evidence, diagnosis, due-date or Shanghai-day refresh.
 * @param state - current normalized display state.
 * @param now - explicit query clock.
 * @returns the earliest future projection threshold in milliseconds.
 */
export function nextRefreshAfter(state, now) {
    const thresholds = [Date.parse(`${studyDay(now)}T00:00:00+08:00`) + 86_400_000];
    for (const entry of evidenceOf(state).entries) {
        if (entry.answerDate.kind === 'unknown')
            continue;
        const at = entry.answerDate.kind === 'instant' ? entry.answerDate.at : Date.parse(`${entry.answerDate.day}T00:00:00+08:00`) + 86_400_000;
        thresholds.push(at + 10 * 86_400_000 + 1, at + 14 * 86_400_000 + 1, at + 35 * 86_400_000);
    }
    for (const mistake of state.mistakes)
        if (mistake.dueAt !== undefined)
            thresholds.push(mistake.dueAt);
    for (const block of state.sessions)
        if (block.mode === 'diagnose')
            thresholds.push(block.startedAt + 14 * 86_400_000);
    return Math.min(...thresholds.filter(at => at > now));
}
const DASHBOARD_CACHE = Symbol('studentDashboardCache');
/**
 * Reuse expensive map/mastery projections until an actual file version or time threshold changes.
 * @param state - version-cached current state, or undefined before setup.
 * @param now - explicit query clock.
 * @param options - selected page and scope.
 * @param lessons - independently read external-classroom projection.
 * @returns current elapsed fields, summary minutes and cached business projections with refreshAfter.
 */
export function queryDashboard(state, now, options = {}, lessons) {
    if (!state)
        return { ...dashboard(state, now, options, lessons), refreshAfter: Date.parse(`${studyDay(now)}T00:00:00+08:00`) + 86_400_000 };
    const key = canonical(options);
    const owner = state;
    const entries = owner[DASHBOARD_CACHE] ?? new Map();
    let cached = entries.get(key);
    if (!cached || now >= cached.refreshAfter || now < cached.value.serverNow) {
        cached = { refreshAfter: nextRefreshAfter(state, now), value: dashboard(state, now, options, lessons) };
        if (entries.size >= 8)
            entries.clear();
        entries.set(key, cached);
        Object.defineProperty(owner, DASHBOARD_CACHE, { value: entries, configurable: true });
    }
    const value = cached.value;
    return { ...value, serverNow: now, refreshAfter: cached.refreshAfter, interactiveLessons: lessons ?? value.interactiveLessons,
        study: value.study ? { ...value.study, ...timeStatus(state, now), weekly: { ...value.study.weekly, minutesByDay: summaryMinutes(state, now), activeDays: summaryMinutes(state, now).filter(item => item.minutes > 0).length } } : null };
}
/**
 * Serialize a shared query projection for both CLI and typed Remote consumers.
 * @param result - shared query facts and projection.
 * @returns JSON-compatible data without absent optional fields.
 */
export function queryJsonData(result) {
    return result.data === undefined ? null : z.json().parse(JSON.parse(JSON.stringify(result.data)));
}
//# sourceMappingURL=queries.js.map