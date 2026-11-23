import { studyDay } from "../learning/shared.js";
function before(answer, reveal) {
    if (!answer || !reveal || answer.kind === 'unknown' || reveal.kind === 'unknown')
        return false;
    const answerDay = answer.kind === 'day' ? answer.day : studyDay(answer.at);
    const revealDay = reveal.kind === 'day' ? reveal.day : studyDay(reveal.at);
    return answerDay < revealDay || answer.kind === 'instant' && reveal.kind === 'instant' && answer.at < reveal.at;
}
/**
 * Check whether this frozen instance's answer could already have been revealed.
 * @param file - original question and response owner.
 * @param response - answer being assessed, retaining actual date precision.
 * @returns true unless the answer is demonstrably before every explicit reveal and other worked example.
 */
export function answerWasExposed(file, response) {
    const date = response.answerDate ?? (file.kind === 'worksheet' ? file.answerDate : undefined);
    if (file.kind === 'block' && file.answerReveals?.some(reveal => reveal.questionId === response.questionId && !before(date, { kind: 'instant', at: reveal.at, basis: 'current-manual', sourceVersion: 'answer-reveal' })))
        return true;
    return file.responses.some(other => other.id !== response.id && other.questionId === response.questionId && other.assistance === 'worked-example' && !before(date, other.answerDate ?? (file.kind === 'worksheet' ? file.answerDate : undefined)));
}
//# sourceMappingURL=answer-exposure.js.map