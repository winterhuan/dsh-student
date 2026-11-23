/** Capability contracts shared by the browser and Host. Packaged content is loaded by the Host. */
import { z } from 'zod';
/** Stable capability, family and source IDs admit dots; entity filenames retain their existing alphabet. */
export const knowledgeIdSchema = z.string().regex(/^[a-zA-Z0-9_.-]{1,80}$/u);
const text = z.string().trim().min(1).max(4000);
const ids = z.array(knowledgeIdSchema).max(500);
const subject = z.enum(['chinese', 'math', 'english']);
/** The tested range is explicit; a broader range never inherits merely by goal name. */
export const capabilityScopeSchema = z.object({
    id: knowledgeIdSchema, description: text,
    modality: z.enum(['written', 'oral', 'listening', 'audiovisual', 'performed']),
    numberMax: z.number().int().positive().max(10000).optional(), vocabulary: z.array(text.max(240)).max(2000).optional(),
}).strict();
/** Source-backed capability with criteria, prerequisites and independent course associations. */
export const capabilityGoalSchema = z.object({
    id: knowledgeIdSchema, subject, domain: knowledgeIdSchema, title: text, scope: text, criterion: text,
    prerequisites: ids, familyIds: ids, sourceIds: ids, curriculumAssociationIds: ids,
    titleEn: text.optional(), criterionEn: text.optional(), curriculumAssociationGap: text.optional(),
    coverageStatus: text.optional(), activation: text.optional(), evidenceRequirements: z.array(text).max(20).optional(),
    progressKind: text.optional(), prerequisitePolicy: text.optional(), requirementIds: ids.optional(),
    sourceLocators: z.array(z.object({ sourceId: knowledgeIdSchema, pdfPages: z.array(z.number().int().positive()).max(120).optional(), section: text }).strict()).max(20).optional(),
}).strict();
/** One method/structure family owns exactly one representative exercise. Stimuli are blueprints, not completed media evidence. */
export const questionFamilySchema = z.object({
    id: knowledgeIdSchema, subject, coreMethod: text, structure: text, goalIds: ids.min(1), variationAxes: z.array(text).min(1).max(20), boundary: text,
    representative: z.object({ id: knowledgeIdSchema, prompt: text, rubric: text, stimulus: z.json().optional() }).strict(),
    signature: z.object({ capabilityIds: ids.min(1), coreMethod: text, problemStructure: text }).strict(),
}).strict();
/** Workspace content extensions stay in the existing collection; this is not a second question bank. */
export const knowledgeExtensionSchema = z.object({ goals: z.array(capabilityGoalSchema).max(1000), families: z.array(questionFamilySchema).max(1000) }).strict();
//# sourceMappingURL=capability-schema.js.map