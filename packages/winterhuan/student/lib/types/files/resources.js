/** Authoring resources derive structural constraints from the shared input schemas. */
import { z } from 'zod';
import { officialFileSchemas } from "./schema.js";
import { figureSchema, stateSchema } from "../schema.js";
import { lessonFileSchema } from "../openmaic.js";
const schemas = { ...officialFileSchemas, 'openmaic-lessons': lessonFileSchema, figure: figureSchema };
/**
 * Generate the structural JSON schema without losing branded identifier input constraints.
 * @param kind - official file kind or the shared figure union.
 * @returns strict input JSON schema; relational rules require the read-only CLI.
 */
export function authoringSchema(kind) {
    return { ...z.toJSONSchema(schemas[kind], { io: 'input' }), $comment: 'Validate cross-file identities, scope, frozen content and source facts with the packaged Student CLI. JSON Schema covers structural input constraints.' };
}
function sample(schema) {
    if (typeof schema === 'boolean')
        throw new Error('Authoring resources require explicit schemas.');
    if (schema.default !== undefined)
        return schema.default;
    if (schema.const !== undefined)
        return schema.const;
    if (schema.enum)
        return schema.enum[0];
    const variant = schema.oneOf?.[0] ?? schema.anyOf?.[0];
    if (variant)
        return sample(variant);
    if (schema.type === 'object')
        return Object.fromEntries((schema.required ?? []).map(name => [name, sample(schema.properties?.[name] ?? true)]));
    if (schema.type === 'array') {
        if (!schema.items || Array.isArray(schema.items))
            throw new Error('Authoring arrays require one item schema.');
        const items = schema.items;
        return Array.from({ length: schema.minItems ?? 0 }, () => sample(items));
    }
    if (schema.type === 'integer' || schema.type === 'number')
        return Math.max(schema.minimum ?? 0, 0);
    if (schema.type === 'boolean')
        return false;
    if (schema.type === 'string')
        return 'example'.padEnd(schema.minLength ?? 0, 'x');
    throw new Error(`Unsupported authoring example type: ${String(schema.type)}`);
}
/**
 * Generate schema-checked starting examples; these are examples, never learner evidence.
 * @param kind - resource to instantiate; figure returns every supported variant.
 * @returns examples checked by the same source definitions as official file readers.
 */
export function authoringExample(kind) {
    if (kind === 'figure')
        return figureSchema.options.map(option => {
            const value = z.record(z.string(), z.unknown()).parse(sample(z.toJSONSchema(option, { io: 'input' })));
            if (value.kind === 'number-line')
                Object.assign(value, { from: 0, to: 10, step: 1 });
            if (value.kind === 'wall')
                value.rows = [[''], ['', '']];
            return figureSchema.parse(value);
        });
    const value = z.record(z.string(), z.unknown()).parse(sample(authoringSchema(kind)));
    const profile = stateSchema.shape.profile.parse(sample(z.toJSONSchema(stateSchema.shape.profile, { io: 'input' })));
    if (kind === 'block' || kind === 'worksheet') {
        value.subject = 'math';
        value.context = { profile };
        if (kind === 'worksheet') {
            const items = z.array(z.record(z.string(), z.unknown())).parse(value.items);
            for (const item of items)
                item.objectiveId = 'm2a-o-sub';
            value.items = items;
        }
    }
    return schemas[kind].parse(value);
}
/**
 * Check a command resource selector against the installed schema catalog.
 * @param name - native shell command argument.
 * @returns the known selector or an actionable error.
 */
export function authoringKind(name) {
    if (name === undefined || !Object.hasOwn(schemas, name))
        throw new Error(`Choose ${Object.keys(schemas).join(', ')}.`);
    return name;
}
//# sourceMappingURL=resources.js.map