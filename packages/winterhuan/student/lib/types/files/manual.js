import { updateStudy } from "../learning/update/index.js";
import { canonical } from "../learning/shared.js";
import { projectWorkspace } from "./projection.js";
import { readWorkspace } from "./read.js";
import { validateStudyFiles } from "./validation.js";
import { readBackups, backupVersions, retainObservedBackups } from "./recovery.js";
/**
 * Capture exactly the fields a typed manual intent edits.
 * @param read - current valid relevant owner.
 * @param intent - intended settings save or worksheet corrections.
 * @returns edited field values suitable for the draft baseline and conflict display.
 */
export function manualFields(read, intent) {
    const workspace = read.workspace;
    if (!workspace)
        return {};
    if (intent.kind === 'worksheet-assessments') {
        const sheet = workspace.worksheets.find(sheet => sheet.id === intent.worksheetId);
        return Object.fromEntries([
            ...intent.assessments.map(assessment => [`assessment:${assessment.responseId}`, sheet?.assessments.find(current => current.responseId === assessment.responseId) ?? null]),
            ...(intent.answerDate ? [['answerDate', sheet?.answerDate ?? null]] : []),
            ...(intent.responseUpdates ?? []).map(update => { const response = sheet?.responses.find(response => response.id === update.responseId); return [`response:${update.responseId}`, { ...(update.assistance ? { assistance: response?.assistance ?? null } : {}), ...(update.answerDate ? { answerDate: response?.answerDate ?? null } : {}) }]; }),
        ]);
    }
    const settings = workspace.settings;
    const command = intent.command;
    switch (command.action) {
        case 'setup': return Object.fromEntries(intent.editedProfileFields.map(field => [`profile:${field}`, settings.profile[field]]));
        case 'interests': return { interests: settings.interests ?? null };
        case 'openmaic-settings': return { openmaic: settings.openmaic ?? null };
        case 'configure-course': return {
            [`material:${command.material.id}`]: settings.materials.find(material => material.id === command.material.id) ?? null,
            [`course:${command.course.subject}`]: settings.courses.find(course => course.subject === command.course.subject) ?? null,
        };
        case 'school-progress': return { [`progress:${command.subject}`]: settings.courses.find(course => course.subject === command.subject)?.progress ?? null };
    }
}
/**
 * Save a manual draft after checking edited-field baselines, term and every related actual file version.
 * Unrelated version changes may rebase; a relevant change returns current values and preserves the caller's draft.
 * @param fs - DSH-backed adapter with guarded write capability.
 * @param request - typed intent with original edited fields and observed versions.
 * @param now - current application clock.
 * @param signal - cancellation signal.
 * @returns saved, unchanged or explicit conflict/invalid/unknown result with independently reread files.
 */
export async function saveManual(fs, request, now, signal) {
    const backups = await readBackups(fs, signal);
    const read = await readWorkspace(fs, signal, backupVersions(backups.backups));
    const current = manualFields(read, request.intent);
    const path = request.intent.kind === 'settings' ? '.study/settings.json' : `.study/worksheets/${request.intent.worksheetId}.json`;
    if (!read.workspace || read.issues.some(issue => issue.path === path || path.startsWith(`${issue.path}/`) || issue.path === '.study/settings.json') || !fs.write)
        return { status: 'invalid', current, read };
    if (read.workspace.settings.termId !== request.termId)
        return { status: 'old-term', current, read };
    if (!request.expectedVersions.some(entry => entry.path === path) || canonical(current) !== canonical(request.baseline))
        return { status: 'conflict', current, read };
    const observed = read.files.find(file => file.path === path);
    if (!observed?.file)
        return { status: 'invalid', current, read };
    await retainObservedBackups(fs, read, now, signal);
    let next = structuredClone(observed.file);
    if (request.intent.kind === 'settings') {
        const previous = projectWorkspace(read.workspace, now);
        let command = request.intent.command;
        if (command.action === 'setup') {
            const draft = command.profile;
            command = { ...command, profile: { ...previous.profile, ...Object.fromEntries(request.intent.editedProfileFields.map(field => [field, draft[field]])) } };
        }
        let updated;
        try {
            updated = updateStudy(previous, command, now);
        }
        catch (error) {
            return { status: 'invalid', current, read, reason: error instanceof Error ? error.message : 'Correct the invalid settings command.' };
        }
        if (updated === previous)
            return { status: 'unchanged', current, read };
        const settings = { ...read.workspace.settings, revision: read.workspace.settings.revision + 1, updatedAt: now,
            profile: updated.profile, materials: updated.materials, courses: updated.courses,
            ...(updated.interests ? { interests: updated.interests } : {}), ...(updated.openmaic ? { openmaic: updated.openmaic } : {}) };
        if (!updated.openmaic)
            delete settings.openmaic;
        next = settings;
    }
    else {
        if (next.kind !== 'worksheet')
            return { status: 'invalid', current, read };
        if (request.intent.answerDate)
            next.answerDate = request.intent.answerDate;
        for (const update of request.intent.responseUpdates ?? []) {
            const response = next.responses.find(response => response.id === update.responseId);
            if (!response || !update.userConfirmation.trim())
                return { status: 'invalid', current, read };
            if (update.assistance) {
                response.assistance = update.assistance;
                response.assistanceConfirmation = update.userConfirmation;
            }
            if (update.answerDate)
                response.answerDate = update.answerDate;
        }
        for (const assessment of request.intent.assessments) {
            const existing = next.assessments.findIndex(item => item.responseId === assessment.responseId);
            if (existing < 0)
                next.assessments.push(assessment);
            else {
                const previous = next.assessments[existing];
                const comparison = { ...assessment, assessedAt: previous.assessedAt };
                if (previous.correctedAt !== undefined)
                    comparison.correctedAt = previous.correctedAt;
                else
                    delete comparison.correctedAt;
                if (canonical(comparison) !== canonical(previous))
                    next.assessments[existing] = { ...assessment, assessedAt: previous.assessedAt, correctedAt: now };
            }
        }
        if (canonical(next) === canonical(observed.file))
            return { status: 'unchanged', current, read };
    }
    const validation = validateStudyFiles(read.files.flatMap(file => file.file ? [{ path: file.path, value: file.path === path ? next : file.file }] : []), read.files.flatMap(file => file.file ? [{ path: file.path, file: file.file }] : []));
    if (validation.issues.some(issue => issue.path === path || issue.path === '.study/settings.json'))
        return { status: 'invalid', current, read: { ...read, issues: [...read.issues, ...validation.issues] } };
    // Every related file is observed again immediately before guarded single-file publication.
    for (const file of read.files.filter(file => file.path === path || request.expectedVersions.some(expected => expected.path === file.path))) {
        if ((await fs.stat(file.path, signal))?.version !== file.version)
            return { status: 'conflict', current, read };
    }
    try {
        await fs.write(path, `${JSON.stringify(next, null, 2)}\n`, { kind: 'replaceIfVersion', version: observed.version }, signal);
    }
    catch (error) {
        if (signal.aborted)
            throw error;
        const latest = await readWorkspace(fs, signal);
        const conflict = error instanceof Error && 'code' in error && ['FS_STALE_VERSION', 'FS_NOT_OBSERVED'].includes(String(error.code));
        return { status: conflict ? 'conflict' : 'unknown', current: manualFields(latest, request.intent), read: latest, reason: error instanceof Error ? error.message : 'The file write outcome is unknown.' };
    }
    const latest = await readWorkspace(fs, signal);
    if (latest.status === 'valid')
        await retainObservedBackups(fs, latest, now, signal);
    return { status: latest.files.some(file => file.path === path && file.file && canonical(file.file) === canonical(next)) ? 'saved' : 'unknown', current: manualFields(latest, request.intent), read: latest };
}
//# sourceMappingURL=manual.js.map