/** Compatibility display projection; normalized evidence remains attached to the official read. */
import { stateSchema } from "../schema.js";
import { attachEvidence, deriveEvidence } from "../learning/evidence.js";
import { scheduleMistakes } from "../learning/schedule.js";
/**
 * Project official entities into the existing dashboard's display fields.
 * @param workspace - validated current official files.
 * @param now - explicit query cutoff.
 * @returns display state with the official normalized evidence used by every metric owner.
 */
export function projectWorkspace(workspace, now) {
    const { settings, blocks, worksheets, collections } = workspace;
    const state = stateSchema.parse({ format: 1, revision: settings.revision, updatedAt: settings.updatedAt,
        profile: settings.profile, materials: settings.materials, courses: settings.courses, interests: settings.interests, openmaic: settings.openmaic,
        ...(collections ? { exercises: collections.exercises, concepts: collections.concepts, objectives: collections.objectives, relations: collections.relations, teachingQueue: collections.teachingQueue } : {}),
        sessions: blocks.map(block => ({ id: block.id, subject: block.subject, mode: block.mode, startedAt: block.startedAt,
            ...(block.intensity ? { intensity: block.intensity } : {}), ...(block.endedAt !== undefined ? { endedAt: block.endedAt } : {}),
            ...(block.spentMs !== undefined ? { spentMs: block.spentMs } : {}), ...(block.reflection !== undefined ? { reflection: block.reflection } : {}),
            ...(block.context.scope ? { scope: block.context.scope } : {}), ...(block.context.material ? { materialId: block.context.material.id } : {}) })),
        attempts: blocks.flatMap(block => block.responses.map(response => {
            const question = block.questions.find(question => question.id === response.questionId);
            const assessment = block.assessments.find(assessment => assessment.responseId === response.id);
            return { id: response.id, questionId: question.id, responseId: response.id, sessionId: block.id, subject: block.subject, topic: question.topic, prompt: question.prompt, response: response.response ?? response.rawResponse,
                rawResponse: response.rawResponse, result: assessment?.result ?? 'unassessed', assistance: response.assistance, feedback: assessment?.feedback ?? 'Pending assessment', answerEvidence: assessment?.answerEvidence ?? question.answerEvidence,
                at: assessment?.assessedAt ?? block.startedAt, ...(typeof question.objectiveId === 'string' ? { objectiveId: question.objectiveId } : {}), ...(question.mistakeId ? { mistakeId: question.mistakeId } : {}) };
        })),
        worksheets: worksheets.map(sheet => ({ id: sheet.id, subject: sheet.subject, createdAt: sheet.createdAt,
            ...(sheet.worksheetKind ? { kind: sheet.worksheetKind } : {}), ...(sheet.discardedAt !== undefined ? { discardedAt: sheet.discardedAt } : {}),
            items: sheet.items.map(item => ({ id: item.id, prompt: item.prompt, answer: item.answer, explanation: item.explanation, answerEvidence: item.answerEvidence,
                ...(typeof item.objectiveId === 'string' ? { objectiveId: item.objectiveId } : {}), ...(item.mistakeId ? { mistakeId: item.mistakeId } : {}), ...(item.figure ? { figure: item.figure } : {}), ...(item.space ? { space: item.space } : {}) })) })),
        paperResults: worksheets.flatMap(sheet => sheet.assessments.map(assessment => {
            const response = sheet.responses.find(response => response.id === assessment.responseId);
            return { worksheetId: sheet.id, itemId: response.questionId, response: response.response ?? response.rawResponse, result: assessment.result === 'stuck' ? 'unassessed' : assessment.result, assistance: response.assistance,
                feedback: assessment.feedback, answerEvidence: assessment.answerEvidence, userConfirmation: assessment.userConfirmation, receivedAt: assessment.assessedAt };
        })),
        paperDrafts: worksheets.flatMap(sheet => sheet.drafts.map(draft => ({ worksheetId: sheet.id, itemId: draft.questionId, response: draft.response, result: draft.result === 'stuck' ? 'unassessed' : draft.result,
            assistance: draft.assistance, uncertainties: draft.uncertainties, confidence: draft.confidence, receivedAt: draft.receivedAt }))),
        mistakes: collections?.mistakes ?? [], rewards: collections?.rewards ?? [], });
    const active = blocks.find(block => block.endedAt === undefined);
    const question = active?.questions.find(question => question.id === active.currentQuestionId);
    if (active && question) {
        const candidates = active.responses.filter(response => response.questionId === question.id);
        const response = active.currentResponseId ? candidates.find(response => response.id === active.currentResponseId) : candidates.length === 1 ? candidates[0] : undefined;
        const actualDate = deriveEvidence(workspace).entries.find(entry => entry.ownerId === active.id && entry.responseId === response?.id)?.answerDate;
        state.task = { id: question.id, sessionId: active.id, subject: active.subject, topic: question.topic, prompt: question.prompt,
            hintLevel: Math.max(0, ...active.hints.filter(hint => hint.questionId === question.id).map(hint => hint.level)),
            ...(question.figure ? { figure: question.figure } : {}), ...(question.choices ? { choices: question.choices } : {}), ...(question.steps ? { steps: question.steps } : {}), ...(question.phase ? { phase: question.phase } : {}),
            ...(typeof question.objectiveId === 'string' ? { objectiveId: question.objectiveId } : {}),
            ...(response ? { responseId: response.id, response: response.response ?? response.rawResponse, rawResponse: response.rawResponse, ...(actualDate?.kind === 'instant' ? { answeredAt: actualDate.at } : {}) } : {}) };
    }
    attachEvidence(state, deriveEvidence(workspace));
    return scheduleMistakes(state, now);
}
//# sourceMappingURL=projection.js.map