#!/usr/bin/env node
/** Read-only Student validation and on-demand authoring resources for native shell calls. */
import { parseArgs } from 'node:util';
import { readWorkspace } from "./files/read.js";
import { nodeStudyFiles } from "./files/node.js";
import { readLessonFile } from "./files/lessons.js";
import { readBackups, backupVersions } from "./files/recovery.js";
import { authoringKind, authoringSchema, authoringExample } from "./files/resources.js";
try {
    const { values, positionals } = parseArgs({ allowPositionals: true, options: { workspace: { type: 'string' }, help: { type: 'boolean' } } });
    if (values.help) {
        console.log('node <installed-package>/lib/cli.js validate [--workspace <root>]\nnode <installed-package>/lib/cli.js schema|example <term-settings|block|worksheet|collections|openmaic-lessons|figure>\nRead-only validation and on-demand source-derived resources. No writes, revisions, backups or repairs.');
    }
    else if (positionals.length === 2 && (positionals[0] === 'schema' || positionals[0] === 'example')) {
        const kind = authoringKind(positionals[1]);
        console.log(JSON.stringify(positionals[0] === 'schema' ? authoringSchema(kind) : authoringExample(kind), null, 2));
    }
    else {
        if (positionals.length !== 1 || positionals[0] !== 'validate')
            throw new Error('Use validate [--workspace <root>], or --help.');
        const signal = new AbortController().signal;
        const fs = nodeStudyFiles(values.workspace ?? process.cwd());
        const backups = await readBackups(fs, signal);
        const read = await readWorkspace(fs, signal, backupVersions(backups.backups));
        const lessons = await readLessonFile(fs, signal);
        const ok = ['valid', 'archived'].includes(read.status) && ['valid', 'missing'].includes(lessons.status);
        const issues = [...read.issues, ...lessons.issues];
        if (!ok && issues.length === 0)
            issues.push({ path: '.study/settings.json', field: '', rule: read.status, correction: read.status === 'legacy' ? 'Preserve the legacy source and explicitly migrate it before publishing format 2 files.' : 'Create valid term settings, then validate the complete operation.' });
        const files = read.files.map(file => ({ path: file.path, version: file.version, ...(file.file ? { kind: file.file.kind, termId: file.file.termId, ...('id' in file.file ? { id: file.file.id } : {}) } : {}) }));
        if (lessons.observation)
            files.push({ path: '.study/openmaic-lessons.json', version: lessons.observation.version, kind: 'openmaic-lessons' });
        const output = { ok, status: read.status, lessons: lessons.status, fileCount: files.length, files: files.slice(0, 100), omittedFiles: Math.max(0, files.length - 100), issues: issues.slice(0, 20).map(issue => ({ path: issue.path.slice(0, 240), field: issue.field.slice(0, 240), rule: issue.rule.slice(0, 80), correction: issue.correction.slice(0, 500) })), omittedIssues: Math.max(0, issues.length - 20), backupIssues: backups.issues.slice(0, 20).map(issue => ({ path: issue.path.slice(0, 240), field: issue.field.slice(0, 240), rule: issue.rule.slice(0, 80), correction: issue.correction.slice(0, 500) })), omittedBackupIssues: Math.max(0, backups.issues.length - 20), nativeDates: 'Native declarations require independent Host matching; this CLI supplies no consumed-input observations.' };
        while (Buffer.byteLength(JSON.stringify(output)) > 32767) {
            if (output.files.length > 0) {
                output.files.pop();
                output.omittedFiles += 1;
            }
            else if (output.issues.length > 0) {
                output.issues.pop();
                output.omittedIssues += 1;
            }
            else {
                output.backupIssues.pop();
                output.omittedBackupIssues += 1;
            }
        }
        console.log(JSON.stringify(output));
        process.exitCode = ok ? 0 : 1;
    }
}
catch (error) {
    console.log(JSON.stringify({ ok: false, issues: [{ path: '.study', field: '', rule: 'cli', correction: (error instanceof Error ? error.message : 'Inspect the workspace and invoke the CLI again.').slice(0, 500) }] }));
    process.exitCode = 1;
}
//# sourceMappingURL=cli.js.map