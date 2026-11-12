#!/usr/bin/env node
import { T as officialFileSchemas, a as lessonFileSchema, ct as stateSchema, d as backupVersions, h as readBackups, l as readLessonFile, st as figureSchema, v as readWorkspace } from "./openmaic-LJGZi6qr.js";
import { t as nodeStudyFiles } from "./node-BHVvVtYI.js";
import { z } from "zod";
import { parseArgs } from "node:util";
//#region lib/types/files/resources.js
/** Authoring resources derive structural constraints from the shared input schemas. */
const schemas = {
	...officialFileSchemas,
	"openmaic-lessons": lessonFileSchema,
	figure: figureSchema
};
/**
* Generate the structural JSON schema without losing branded identifier input constraints.
* @param kind - official file kind or the shared figure union.
* @returns strict input JSON schema; relational rules require the read-only CLI.
*/
function authoringSchema(kind) {
	return {
		...z.toJSONSchema(schemas[kind], { io: "input" }),
		$comment: "Validate cross-file identities, scope, frozen content and source facts with the packaged Student CLI. JSON Schema covers structural input constraints."
	};
}
function sample(schema) {
	if (typeof schema === "boolean") throw new Error("Authoring resources require explicit schemas.");
	if (schema.default !== void 0) return schema.default;
	if (schema.const !== void 0) return schema.const;
	if (schema.enum) return schema.enum[0];
	const variant = schema.oneOf?.[0] ?? schema.anyOf?.[0];
	if (variant) return sample(variant);
	if (schema.type === "object") return Object.fromEntries((schema.required ?? []).map((name) => [name, sample(schema.properties?.[name] ?? true)]));
	if (schema.type === "array") {
		if (!schema.items || Array.isArray(schema.items)) throw new Error("Authoring arrays require one item schema.");
		const items = schema.items;
		return Array.from({ length: schema.minItems ?? 0 }, () => sample(items));
	}
	if (schema.type === "integer" || schema.type === "number") return Math.max(schema.minimum ?? 0, 0);
	if (schema.type === "boolean") return false;
	if (schema.type === "string") return "example".padEnd(schema.minLength ?? 0, "x");
	throw new Error(`Unsupported authoring example type: ${String(schema.type)}`);
}
/**
* Generate schema-checked starting examples; these are examples, never learner evidence.
* @param kind - resource to instantiate; figure returns every supported variant.
* @returns examples checked by the same source definitions as official file readers.
*/
function authoringExample(kind) {
	if (kind === "figure") return figureSchema.options.map((option) => {
		const value = z.record(z.string(), z.unknown()).parse(sample(z.toJSONSchema(option, { io: "input" })));
		if (value.kind === "number-line") Object.assign(value, {
			from: 0,
			to: 10,
			step: 1
		});
		if (value.kind === "wall") value.rows = [[""], ["", ""]];
		return figureSchema.parse(value);
	});
	const value = z.record(z.string(), z.unknown()).parse(sample(authoringSchema(kind)));
	const profile = stateSchema.shape.profile.parse(sample(z.toJSONSchema(stateSchema.shape.profile, { io: "input" })));
	if (kind === "block" || kind === "worksheet") {
		value.subject = "math";
		value.context = { profile };
		if (kind === "worksheet") {
			const items = z.array(z.record(z.string(), z.unknown())).parse(value.items);
			for (const item of items) item.objectiveId = "m2a-o-sub";
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
function authoringKind(name) {
	if (name === void 0 || !Object.hasOwn(schemas, name)) throw new Error(`Choose ${Object.keys(schemas).join(", ")}.`);
	return name;
}
//#endregion
//#region lib/types/cli.js
/** Read-only Student validation and on-demand authoring resources for native shell calls. */
try {
	const { values, positionals } = parseArgs({
		allowPositionals: true,
		options: {
			workspace: { type: "string" },
			help: { type: "boolean" }
		}
	});
	if (values.help) console.log("node <installed-package>/lib/cli.js validate [--workspace <root>]\nnode <installed-package>/lib/cli.js schema|example <term-settings|block|worksheet|collections|openmaic-lessons|figure>\nRead-only validation and on-demand source-derived resources. No writes, revisions, backups or repairs.");
	else if (positionals.length === 2 && (positionals[0] === "schema" || positionals[0] === "example")) {
		const kind = authoringKind(positionals[1]);
		console.log(JSON.stringify(positionals[0] === "schema" ? authoringSchema(kind) : authoringExample(kind), null, 2));
	} else {
		if (positionals.length !== 1 || positionals[0] !== "validate") throw new Error("Use validate [--workspace <root>], or --help.");
		const signal = new AbortController().signal;
		const fs = nodeStudyFiles(values.workspace ?? process.cwd());
		const backups = await readBackups(fs, signal);
		const read = await readWorkspace(fs, signal, backupVersions(backups.backups));
		const lessons = await readLessonFile(fs, signal);
		const ok = ["valid", "archived"].includes(read.status) && ["valid", "missing"].includes(lessons.status);
		const issues = [...read.issues, ...lessons.issues];
		if (!ok && issues.length === 0) issues.push({
			path: ".study/settings.json",
			field: "",
			rule: read.status,
			correction: read.status === "legacy" ? "Preserve the legacy source and explicitly migrate it before publishing format 2 files." : "Create valid term settings, then validate the complete operation."
		});
		const files = read.files.map((file) => ({
			path: file.path,
			version: file.version,
			...file.file ? {
				kind: file.file.kind,
				termId: file.file.termId,
				..."id" in file.file ? { id: file.file.id } : {}
			} : {}
		}));
		if (lessons.observation) files.push({
			path: ".study/openmaic-lessons.json",
			version: lessons.observation.version,
			kind: "openmaic-lessons"
		});
		const output = {
			ok,
			status: read.status,
			lessons: lessons.status,
			fileCount: files.length,
			files: files.slice(0, 100),
			omittedFiles: Math.max(0, files.length - 100),
			issues: issues.slice(0, 20).map((issue) => ({
				path: issue.path.slice(0, 240),
				field: issue.field.slice(0, 240),
				rule: issue.rule.slice(0, 80),
				correction: issue.correction.slice(0, 500)
			})),
			omittedIssues: Math.max(0, issues.length - 20),
			nativeDates: "Native declarations require independent Host matching; this CLI supplies no consumed-input observations."
		};
		while (Buffer.byteLength(JSON.stringify(output)) > 32767) if (output.files.length > 0) {
			output.files.pop();
			output.omittedFiles += 1;
		} else {
			output.issues.pop();
			output.omittedIssues += 1;
		}
		console.log(JSON.stringify(output));
		process.exitCode = ok ? 0 : 1;
	}
} catch (error) {
	console.log(JSON.stringify({
		ok: false,
		issues: [{
			path: ".study",
			field: "",
			rule: "cli",
			correction: (error instanceof Error ? error.message : "Inspect the workspace and invoke the CLI again.").slice(0, 500)
		}]
	}));
	process.exitCode = 1;
}
//#endregion
export {};
