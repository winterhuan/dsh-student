import { type Command, type StudyState } from '../../schema.ts';
/** Context handed to every action handler: the clone to mutate, the input state, the active block and the clock. */
export interface UpdateContext<K extends Command['action'] = Command['action']> {
    previous: StudyState;
    state: StudyState;
    now: number;
    active: StudyState['sessions'][number] | undefined;
    command: Extract<Command, {
        action: K;
    }>;
}
/** Notice text appended to a status result when the model sends a field the mode ignores. */
export declare function updateNotices(input: unknown): string[];
/** Apply one validated command end to end: clone, dispatch, and re-derive review schedules for mutations. */
export declare function rawApply(previous: StudyState, command: Command, now: number): StudyState;
/** Apply one validated mutation without changing the input; setup creates the first state or updates the existing profile in place. */
export declare function updateStudy(previous: StudyState | undefined, input: unknown, now: number): StudyState;
//# sourceMappingURL=index.d.ts.map