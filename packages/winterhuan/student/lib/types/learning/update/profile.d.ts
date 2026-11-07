import { type UpdateContext } from './index.ts';
import { type Command, type StudyState } from '../../schema.ts';
/** Create the first learner profile for a workspace. */
export declare function applySetup(command: Extract<Command, {
    action: 'setup';
}>, now: number): StudyState;
/** Update the existing learner profile in place, preserving all learning evidence. */
export declare function applyUpdateProfile(ctx: UpdateContext<'setup'>): StudyState;
/** Save a material and its course atomically under one revision. */
export declare function applyConfigureCourse(ctx: UpdateContext<'configure-course'>): StudyState;
/** Register one course material; an identical retry is a no-op. */
export declare function applyMaterial(ctx: UpdateContext<'material'>): StudyState;
/** Confirm a material as the subject course, keeping confirmed school progress. */
export declare function applyCourse(ctx: UpdateContext<'course'>): StudyState;
/** Record the parent-confirmed school frontier unit. */
export declare function applySchoolProgress(ctx: UpdateContext<'school-progress'>): StudyState;
/**
 * Save or clear the parent OpenMAIC origin.
 * An empty base removes the override. An active learning block does not block this; the address is not learning evidence.
 */
export declare function applyOpenmaicSettings(ctx: UpdateContext<'openmaic-settings'>): StudyState;
/**
 * Save the parent's theme tags. Duplicates collapse; fewer than three distinct tags is rejected.
 */
export declare function applyInterests(ctx: UpdateContext<'interests'>): StudyState;
/** Archive the finished term: keep the profile for reference, drop all evidence (exported beforehand by the store) and mark the file archived. */
export declare function applyArchiveTerm(ctx: UpdateContext<'archive-term'>): StudyState;
//# sourceMappingURL=profile.d.ts.map