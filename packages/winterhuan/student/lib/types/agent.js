import { createStudySkillProvider } from "./skill-provider.js";
import { registerStudyTools } from "./tools.js";
export const name = 'student-agent';
export const inject = ['skills', 'tools'];
/** Register domain Skills and tools for the preset lifetime.
 * @param context - preset-scoped host services.
 */
export function apply(context) {
    context.effect(() => context.skills.registerProvider(() => createStudySkillProvider()), 'student: skills');
    registerStudyTools(context);
}
//# sourceMappingURL=agent.js.map