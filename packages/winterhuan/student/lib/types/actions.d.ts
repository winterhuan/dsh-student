import type { Command } from './schema.ts';
/** Per-action metadata: the surfaces that may submit the action and the update family that owns its handler. */
export interface ActionMeta {
    /** Whether the workbench panel may submit this action through the workspace API. */
    panel: boolean;
    /** The update handler family that owns this action. */
    group: 'profile' | 'session' | 'mistakes' | 'paper';
}
/** Every study action with its submission surface and owning handler family; keyed exhaustively by the command schema. */
export declare const actionMeta: Record<Command['action'], ActionMeta>;
/** Actions the workbench panel may submit directly; tutor assessment and rewards stay with the model tools. */
export declare const panelActions: ReadonlySet<Command['action']>;
//# sourceMappingURL=actions.d.ts.map