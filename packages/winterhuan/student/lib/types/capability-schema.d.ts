/** Capability contracts shared by the browser and Host. Packaged content is loaded by the Host. */
import { z } from 'zod';
/** Stable capability, family and source IDs admit dots; entity filenames retain their existing alphabet. */
export declare const knowledgeIdSchema: z.ZodString;
/** The tested range is explicit; a broader range never inherits merely by goal name. */
export declare const capabilityScopeSchema: z.ZodObject<{
    id: z.ZodString;
    description: z.ZodString;
    modality: z.ZodEnum<{
        written: "written";
        oral: "oral";
        listening: "listening";
        audiovisual: "audiovisual";
        performed: "performed";
    }>;
    numberMax: z.ZodOptional<z.ZodNumber>;
    vocabulary: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strict>;
/** One concrete demonstrated range, separate from grade and textbook association. */
export type CapabilityScope = z.infer<typeof capabilityScopeSchema>;
/** Source-backed capability with criteria, prerequisites and independent course associations. */
export declare const capabilityGoalSchema: z.ZodObject<{
    id: z.ZodString;
    subject: z.ZodEnum<{
        chinese: "chinese";
        math: "math";
        english: "english";
    }>;
    domain: z.ZodString;
    title: z.ZodString;
    scope: z.ZodString;
    criterion: z.ZodString;
    prerequisites: z.ZodArray<z.ZodString>;
    familyIds: z.ZodArray<z.ZodString>;
    sourceIds: z.ZodArray<z.ZodString>;
    curriculumAssociationIds: z.ZodArray<z.ZodString>;
    titleEn: z.ZodOptional<z.ZodString>;
    criterionEn: z.ZodOptional<z.ZodString>;
    curriculumAssociationGap: z.ZodOptional<z.ZodString>;
    coverageStatus: z.ZodOptional<z.ZodString>;
    activation: z.ZodOptional<z.ZodString>;
    evidenceRequirements: z.ZodOptional<z.ZodArray<z.ZodString>>;
    progressKind: z.ZodOptional<z.ZodString>;
    prerequisitePolicy: z.ZodOptional<z.ZodString>;
    requirementIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
    sourceLocators: z.ZodOptional<z.ZodArray<z.ZodObject<{
        sourceId: z.ZodString;
        pdfPages: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
        section: z.ZodString;
    }, z.core.$strict>>>;
}, z.core.$strict>;
/** One method/structure family owns exactly one representative exercise. Stimuli are blueprints, not completed media evidence. */
export declare const questionFamilySchema: z.ZodObject<{
    id: z.ZodString;
    subject: z.ZodEnum<{
        chinese: "chinese";
        math: "math";
        english: "english";
    }>;
    coreMethod: z.ZodString;
    structure: z.ZodString;
    goalIds: z.ZodArray<z.ZodString>;
    variationAxes: z.ZodArray<z.ZodString>;
    boundary: z.ZodString;
    representative: z.ZodObject<{
        id: z.ZodString;
        prompt: z.ZodString;
        rubric: z.ZodString;
        stimulus: z.ZodOptional<z.ZodJSONSchema>;
    }, z.core.$strict>;
    signature: z.ZodObject<{
        capabilityIds: z.ZodArray<z.ZodString>;
        coreMethod: z.ZodString;
        problemStructure: z.ZodString;
    }, z.core.$strict>;
}, z.core.$strict>;
/** Validated learning goal. */
export type CapabilityGoal = z.infer<typeof capabilityGoalSchema>;
/** Validated question family and its single source exercise. */
export type QuestionFamily = z.infer<typeof questionFamilySchema>;
/** Workspace content extensions stay in the existing collection; this is not a second question bank. */
export declare const knowledgeExtensionSchema: z.ZodObject<{
    goals: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        domain: z.ZodString;
        title: z.ZodString;
        scope: z.ZodString;
        criterion: z.ZodString;
        prerequisites: z.ZodArray<z.ZodString>;
        familyIds: z.ZodArray<z.ZodString>;
        sourceIds: z.ZodArray<z.ZodString>;
        curriculumAssociationIds: z.ZodArray<z.ZodString>;
        titleEn: z.ZodOptional<z.ZodString>;
        criterionEn: z.ZodOptional<z.ZodString>;
        curriculumAssociationGap: z.ZodOptional<z.ZodString>;
        coverageStatus: z.ZodOptional<z.ZodString>;
        activation: z.ZodOptional<z.ZodString>;
        evidenceRequirements: z.ZodOptional<z.ZodArray<z.ZodString>>;
        progressKind: z.ZodOptional<z.ZodString>;
        prerequisitePolicy: z.ZodOptional<z.ZodString>;
        requirementIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
        sourceLocators: z.ZodOptional<z.ZodArray<z.ZodObject<{
            sourceId: z.ZodString;
            pdfPages: z.ZodOptional<z.ZodArray<z.ZodNumber>>;
            section: z.ZodString;
        }, z.core.$strict>>>;
    }, z.core.$strict>>;
    families: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        subject: z.ZodEnum<{
            chinese: "chinese";
            math: "math";
            english: "english";
        }>;
        coreMethod: z.ZodString;
        structure: z.ZodString;
        goalIds: z.ZodArray<z.ZodString>;
        variationAxes: z.ZodArray<z.ZodString>;
        boundary: z.ZodString;
        representative: z.ZodObject<{
            id: z.ZodString;
            prompt: z.ZodString;
            rubric: z.ZodString;
            stimulus: z.ZodOptional<z.ZodJSONSchema>;
        }, z.core.$strict>;
        signature: z.ZodObject<{
            capabilityIds: z.ZodArray<z.ZodString>;
            coreMethod: z.ZodString;
            problemStructure: z.ZodString;
        }, z.core.$strict>;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** Existing workspace-owned content extensions. */
export type KnowledgeExtension = z.infer<typeof knowledgeExtensionSchema>;
//# sourceMappingURL=capability-schema.d.ts.map