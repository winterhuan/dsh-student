import { z } from 'zod';
import { type CapabilityScope, type KnowledgeExtension } from './capability-schema.ts';
export * from './capability-schema.ts';
declare const routeSchema: z.ZodObject<{
    goalId: z.ZodString;
    familyId: z.ZodString;
    evidenceGates: z.ZodArray<z.ZodString>;
    creditPolicy: z.ZodString;
    evidenceUse: z.ZodString;
}, z.core.$strict>;
/** Effective catalog records aliases of equivalent workspace mothers rather than exposing duplicate mothers. */
export interface EffectiveKnowledge extends KnowledgeExtension {
    familyAliases: Record<string, string>;
}
/**
 * Resolve built-in and workspace content into one effective capability/family index.
 * @param extension - content in the existing workspace collection, without learner facts.
 * @returns deeply frozen borrowed content and canonical family aliases; incompatible duplicates throw.
 */
export declare function effectiveKnowledge(extension?: KnowledgeExtension): EffectiveKnowledge;
/** Explicit old-ID routes never grant whole-goal mastery or guess unknown workspace content. */
export interface LegacyReference {
    kind: 'objective' | 'exercise';
    oldId: string;
    status: 'pending' | 'review-required';
    candidateGoalIds: string[];
    routes: z.infer<typeof routeSchema>[];
    pendingReasons: string[];
    originalPrompt?: string;
}
/**
 * Resolve an old course or exercise identity, retaining uncertainty for unenumerated workspace banks.
 * @param kind - course objective or concrete source exercise.
 * @param oldId - exact preserved identity.
 * @returns deeply frozen borrowed candidate routes and evidence requirements, never mastery credit.
 */
export declare function resolveLegacyReference(kind: LegacyReference['kind'], oldId: string): LegacyReference;
/**
 * Check whether independently tested evidence covers a requested range.
 * @param tested - original demonstrated modality and range.
 * @param requested - current teaching range; missing range facts cannot establish compatibility.
 * @returns true for the same modality and a contained numeric/vocabulary range, or the exact unexpanded scope.
 */
export declare function scopeSupports(tested: CapabilityScope, requested: CapabilityScope): boolean;
declare const sourceCatalogSchema: z.ZodObject<{
    retrievedOn: z.ZodString;
    sources: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        label: z.ZodString;
        url: z.ZodOptional<z.ZodString>;
        sha256: z.ZodOptional<z.ZodString>;
        pdfPages: z.ZodOptional<z.ZodNumber>;
        retrievedOn: z.ZodOptional<z.ZodString>;
        paths: z.ZodOptional<z.ZodArray<z.ZodString>>;
        status: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
    coverage: z.ZodArray<z.ZodJSONSchema>;
    quantitativeCoverageLedgers: z.ZodArray<z.ZodJSONSchema>;
    scopeCaveats: z.ZodArray<z.ZodString>;
}, z.core.$strict>;
/**
 * Read immutable packaged curriculum sources, capability decomposition and quantitative activity limits.
 * @returns deeply frozen borrowed source locators and coverage policies, never learner evidence.
 */
export declare function knowledgeSources(): z.infer<typeof sourceCatalogSchema>;
//# sourceMappingURL=capabilities.d.ts.map