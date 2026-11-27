import { defineTool } from '@deepseek-ai/dsh-tools';
import { z } from 'zod';
import { readStudentWorkspace } from "./transport.js";
import { queryWorkspace } from "./learning/queries.js";
function boundedRead(result, paths) {
    const versions = result.versions.filter(file => paths.includes(file.path));
    return { ...result, versions: versions.slice(0, 20), omittedVersions: result.versions.length - Math.min(versions.length, 20), issues: result.issues?.slice(0, 20).map(issue => ({ path: issue.path.slice(0, 240), field: issue.field.slice(0, 240), rule: issue.rule.slice(0, 80), correction: issue.correction.slice(0, 500) })), omittedIssues: Math.max(0, (result.issues?.length ?? 0) - 20) };
}
/** Register the bounded read-only Student lookup in DSH's native tool runtime. */
export function registerStudyTools(context) {
    context.tools.register(defineTool({
        name: 'study_status',
        description: 'Read validated Student files, observed versions, pending work and learning context. Load the study skill to author official files and run the packaged read-only CLI.',
        parameters: {
            kind: { type: 'string', enum: ['status', 'daily-plan', 'capability-progress', 'capabilities', 'families', 'knowledge-sources', 'legacy-references', 'learning-context', 'files', 'settings', 'summary', 'materials', 'mistakes', 'due', 'pending', 'attempts', 'sessions', 'progress', 'concepts', 'objectives', 'relations', 'worksheets', 'paper-results', 'curriculum', 'weak', 'elements', 'exercises', 'diagnose', 'review-sheet'], description: 'daily-plan returns the deterministic preview, saved arrangement, legal continuation and actual summary; capability-progress returns the shared capability/range evidence projection. status (default) returns validated status and learning context; capabilities and families page source-backed goals and canonical mothers (optional subject/id); knowledge-sources returns official curriculum sources and coverage limits; legacy-references pages pending old-ID routes and never grants mastery; learning-context returns current block/question, saved responses, pending assessment, selected scope, target facts/method and at most three seeds; files pages official file identities and paths; settings returns term setup; materials pages registered sources and lists available knowledge maps and default textbook indexes for the current profile; summary returns seven Shanghai calendar days; collections page 20 records with offset. curriculum needs subject (grade and term browse another map); elements needs subject and returns question-writing elements, exercises and the hint ladder; exercises pages shipped and workspace exercises (optional subject, unit or id/objectiveId); diagnose returns check-in plans (grade, term or unit narrow the scope); review-sheet needs subject; weak lists weak points.' },
            offset: { type: 'integer', description: 'Zero-based collection offset; defaults to 0.' },
            id: { type: 'string', description: 'Optional exact record ID (or objectiveId for kind=exercises) for materials, mistakes, attempts, sessions, concepts, objectives, exercises or worksheets.' },
            subject: { type: 'string', enum: ['chinese', 'math', 'english'], description: 'Optional subject filter for subject-owned records; required for kind=curriculum and kind=elements.' },
            unit: { type: 'string', description: 'Optional map unit filter for kind=elements and kind=exercises; for kind=diagnose with grade/term, narrow the cross-grade plan to one unit.' },
            grade: { type: 'integer', description: 'Optional grade (1 or 2) to browse another map (kind=curriculum) or build a cross-grade check-in plan (kind=diagnose); defaults to the learner profile.' },
            term: { type: 'string', enum: ['first', 'second'], description: 'Optional term for kind=curriculum and kind=diagnose; defaults to the learner profile.' },
        },
        output: { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
        isConcurrencySafe: () => true,
        async execute(args, exec) {
            const offset = args.offset ?? 0;
            if (offset < 0)
                throw new Error('offset 不能为负数。');
            const { read, native: source, backupIssues } = await readStudentWorkspace(exec, undefined, undefined, args.kind === 'daily-plan' && args.id && /^\d{4}-\d{2}-\d{2}$/u.test(args.id) ? args.id : undefined);
            const now = Date.now();
            const active = read.workspace?.blocks.find(block => block.endedAt === undefined);
            const paths = ['.study/settings.json', ...read.files.filter(file => file.file?.kind === 'daily-plan').map(file => file.path), ...(active ? [`.study/blocks/${active.id}.json`] : []), ...read.files.filter(file => file.file && 'id' in file.file && file.file.id === args.id).map(file => file.path)];
            const result = boundedRead(queryWorkspace(read, { ...args, kind: args.kind ?? 'status', offset }, now), paths);
            if (args.kind === 'files') {
                const matching = read.files.filter(file => args.id === undefined || (file.file && 'id' in file.file && file.file.id === args.id));
                result.data = { total: matching.length, items: matching.slice(offset, offset + 20).map(file => ({ path: file.path, version: file.version, kind: file.file?.kind, termId: file.file?.termId, ...(file.file && 'id' in file.file ? { id: file.file.id } : {}) })), nextOffset: offset + 20 < matching.length ? offset + 20 : null };
            }
            if (args.kind === 'capability-progress' && Array.isArray(result.data)) {
                const items = result.data;
                result.data = { items: items.slice(offset, offset + 20), total: items.length, nextOffset: offset + 20 < items.length ? offset + 20 : null };
            }
            if (args.kind === 'curriculum' && result.data) {
                const data = z.record(z.string(), z.unknown()).parse(result.data);
                if (data.curriculum !== null) {
                    const curriculum = z.record(z.string(), z.unknown()).parse(data.curriculum);
                    result.data = { curriculum: { ...Object.fromEntries(['id', 'subject', 'grade', 'term', 'title', 'scope', 'units'].filter(key => key in curriculum).map(key => [key, curriculum[key]])), more: 'Use elements with a subject and goal ID for facts/methods, or read the matching installed knowledge/curriculum JSON for the full map.' } };
                }
            }
            const context = args.kind === 'learning-context' ? result : args.kind === undefined || args.kind === 'status' ? boundedRead(queryWorkspace(read, { kind: 'learning-context', ...(args.subject ? { subject: args.subject } : {}) }, now), paths) : undefined;
            if (context?.data) {
                const data = z.record(z.string(), z.unknown()).parse(context.data);
                const responses = z.array(z.record(z.string(), z.unknown())).parse(data.responses);
                const saved = z.record(z.string(), z.unknown()).nullable().parse(data.savedResponse);
                const selected = responses.filter(response => response.id === saved?.id);
                data.goalProgress = Array.isArray(data.goalProgress) ? data.goalProgress.filter(item => item && typeof item === 'object' && 'id' in item && item.id === data.nextAction?.goalId).slice(0, 3) : [];
                delete data.activeQuestions;
                if (data.daily && typeof data.daily === 'object') {
                    const daily = data.daily;
                    data.daily = { day: daily.day, phase: daily.phase, currentTaskId: daily.currentTaskId, planId: daily.saved?.id ?? null, revision: daily.saved?.revision ?? null, nextAction: daily.nextAction, more: 'Read study_status kind=daily-plan for the arrangement and choices.' };
                }
                delete data.responses;
                data.omittedResponses = responses.length - selected.length;
                delete data.assessments;
                context.data = data;
            }
            if (args.kind === undefined || args.kind === 'status') {
                const data = result.data ? z.record(z.string(), z.unknown()).parse(result.data) : undefined;
                if (data)
                    result.data = Object.fromEntries(['phase', 'profile', 'interests', 'interestFocus', 'time', 'openmaic', 'unconfirmedSubjects', 'recommendation', 'weakPoints', 'dueToday'].filter(key => key in data).map(key => [key, data[key]]));
            }
            const native = { status: source.status, cut: source.cut, inputs: source.inputs.slice(-1), admissions: source.admissions.slice(-3), omitted: source.omitted + Math.max(0, source.inputs.length - 1), omittedAdmissions: source.omittedAdmissions + Math.max(0, source.admissions.length - 3), reason: source.reason };
            const payload = { ...result, native, backupIssues: backupIssues.slice(0, 20).map(issue => ({ path: issue.path.slice(0, 240), field: issue.field.slice(0, 240), rule: issue.rule.slice(0, 80), correction: issue.correction.slice(0, 500) })), omittedBackupIssues: Math.max(0, backupIssues.length - 20), ...(args.kind === undefined || args.kind === 'status' ? { learningContext: context } : {}) };
            const renderedBytes = () => Buffer.byteLength(JSON.stringify([{ type: 'text', text: JSON.stringify(payload) }]));
            while (renderedBytes() > 32768 && native.inputs.length > 0) {
                native.inputs.shift();
                native.omitted += 1;
            }
            while (renderedBytes() > 32768 && native.admissions.length > 0) {
                native.admissions.shift();
                native.omittedAdmissions += 1;
            }
            if (renderedBytes() > 32768) {
                payload.data = { omitted: true, reason: 'Requested records exceed the bounded tool result. Read their official files with native read.', paths };
                if (payload.learningContext)
                    payload.learningContext.data = { omitted: true, reason: 'Read the active block for full question and response content.', path: active ? `.study/blocks/${active.id}.json` : '.study/settings.json' };
            }
            while (renderedBytes() > 32768) {
                if (payload.versions.length > 0) {
                    payload.versions.pop();
                    payload.omittedVersions += 1;
                }
                else if (payload.learningContext?.versions.length) {
                    payload.learningContext.versions.pop();
                    payload.learningContext.omittedVersions += 1;
                }
                else if (payload.issues?.length) {
                    payload.issues.pop();
                    payload.omittedIssues += 1;
                }
                else if (payload.learningContext?.issues?.length) {
                    payload.learningContext.issues.pop();
                    payload.learningContext.omittedIssues += 1;
                }
                else if (payload.backupIssues.length) {
                    payload.backupIssues.pop();
                    payload.omittedBackupIssues += 1;
                }
                else
                    break;
            }
            return z.json().parse(JSON.parse(JSON.stringify(payload)));
        },
    }));
}
//# sourceMappingURL=tools.js.map