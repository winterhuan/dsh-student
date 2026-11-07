import { z } from 'zod';
/** Default OpenMAIC origin when the parent has not saved one and OPENMAIC_BASE is unset. */
export declare const DEFAULT_OPENMAIC_BASE = "http://localhost:3000";
/** Lesson log written by the tutor shell. It is not learning evidence and is not inside state.json. */
export declare const OPENMAIC_LESSONS_PATH = ".study/openmaic-lessons.json";
/** Cookie jar shared by generate, poll, retry and stage reads. Never copy it into chat or state. */
export declare const OPENMAIC_COOKIE_PATH = ".study/openmaic-cookies.txt";
/**
 * Accept an http(s) origin or origin-plus-path. Credentials, queries and hashes are rejected
 * so a saved address cannot smuggle a secret.
 * @param value - parent input or environment value.
 * @returns the normalized base, an empty string when the input is blank, or undefined when it is unsafe.
 */
export declare function normalizeOpenmaicBase(value: string): string | undefined;
/**
 * Parent setting wins, then OPENMAIC_BASE, then the localhost default.
 * An invalid saved or environment value is skipped rather than failing a status read.
 */
export declare function effectiveOpenmaicBase(saved: string | undefined, env: string | undefined): string;
/** An http(s) URL with no embedded credentials, or undefined when the browser must not open it. */
export declare function lessonHttpUrl(value: string): string | undefined;
declare const lessonSchema: z.ZodObject<{
    id: z.ZodString;
    status: z.ZodEnum<{
        generating: "generating";
        ready: "ready";
        failed: "failed";
    }>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    title: z.ZodString;
    requirement: z.ZodString;
    subject: z.ZodOptional<z.ZodEnum<{
        chinese: "chinese";
        math: "math";
        english: "english";
    }>>;
    objectiveId: z.ZodOptional<z.ZodString>;
    base: z.ZodString;
    jobId: z.ZodOptional<z.ZodString>;
    pollUrl: z.ZodOptional<z.ZodString>;
    runId: z.ZodOptional<z.ZodString>;
    commandId: z.ZodOptional<z.ZodString>;
    retryable: z.ZodOptional<z.ZodBoolean>;
    classroomId: z.ZodOptional<z.ZodString>;
    url: z.ZodOptional<z.ZodString>;
    warning: z.ZodOptional<z.ZodString>;
    error: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodObject<{
        fetchedAt: z.ZodString;
        outline: z.ZodString;
        scenes: z.ZodArray<z.ZodObject<{
            title: z.ZodString;
            summary: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
/** One interactive lesson row stored in the workspace log. */
export type InteractiveLesson = z.infer<typeof lessonSchema>;
/** Lesson log projection served with the workbench payload. */
export interface InteractiveLessons {
    baseUrl: string;
    lessonsPath: typeof OPENMAIC_LESSONS_PATH;
    cookiePath: typeof OPENMAIC_COOKIE_PATH;
    lessons: InteractiveLesson[];
    /** Set when the file exists but some or all of it cannot be shown. The rest of the desk still loads. */
    error?: string;
}
/** Build the settings half of the projection before a file read. */
export declare function interactiveLessonsView(savedBase: string | undefined, lessons?: InteractiveLesson[], error?: string): InteractiveLessons;
/**
 * Parse the tutor-written lesson log. Invalid rows are dropped so one bad write does not hide the rest.
 * @param text - UTF-8 contents of `.study/openmaic-lessons.json`.
 */
export declare function parseInteractiveLessons(text: string): {
    lessons: InteractiveLesson[];
    error?: string;
};
/**
 * Read the lesson log from the session workspace.
 * A missing file is an empty list. A bad file sets `error` and does not fail the workspace request.
 * The file is not cached: the tutor rewrites it without bumping the study revision, and the desk poll must see that write.
 */
export declare function readInteractiveLessons(agent: {
    ctx?: {
        get(name: string): unknown;
    };
    session?: {
        header?: {
            cwd?: string;
        };
    };
}, signal: AbortSignal, savedBase: string | undefined): Promise<InteractiveLessons>;
export {};
//# sourceMappingURL=openmaic.d.ts.map