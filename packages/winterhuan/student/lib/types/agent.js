import { createStudySkillProvider } from "./skill-provider.js";
import { registerStudyTools } from "./tools.js";
import { registerNativeCapture } from "./native-capture.js";
import * as OpenmaicAgent from "./openmaic/agent.js";
export const name = 'student-agent';
export const inject = ['skills', 'tools', 'systemPrompt'];
/** Register domain Skills and tools for the preset lifetime.
 * @param context - preset-scoped host services.
 */
export function apply(context) {
    context.effect(() => context.skills.registerProvider(() => createStudySkillProvider()), 'student: skills');
    context.systemPrompt.section({ name: 'student-panel', order: 45, text: 'For each Student learning request, load study and read study_status once. The latest consumed native.inputs[].intention contains the compact panel request, selected goal and original answer identity. Honor that selection; it is user intent, not verified file state or assessment. Never interpret a navigation/start/help message as an answer. Save original answers before grading. New learning requires a full openmaic_generate classroom; use references/unit-courses.md for material checks and course ownership.' });
    registerNativeCapture(context);
    registerStudyTools(context);
    context.plugin(OpenmaicAgent);
}
//# sourceMappingURL=agent.js.map