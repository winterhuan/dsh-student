import { B as deriveEvidence, C as officialFileSchemas, D as responseSourceSchema, E as responseSchema, H as evidenceDay, I as readLessonFile, N as lessonFileSchema, O as termSettingsSchema, P as lessonSchema, R as attachEvidence, S as collectionsSchema, T as questionSourceSchema, U as evidenceOf, V as evidenceAtCutoff, _ as validateStudyFiles, a as projectWorkspace, b as assistanceSchema, c as StudyBackupRetention, d as describeArchive, f as describeMigration, g as sourceSha256, h as retainObservedBackups, i as queryWorkspace, k as worksheetSchema, l as backupSchema, m as readBackups, n as queryDashboard, o as readWorkspace, p as describeRestore, r as queryStudy, s as applicationStudyFiles, t as nextRefreshAfter, u as backupVersions, v as answerDateSchema, w as questionSchema, x as blockSchema, y as assessmentSchema, z as demonstrablyAfter } from "./queries-CqfPsje6.js";
import { n as saveManual, t as manualFields } from "./manual-D6200iES.js";
import { readFile, readdir, realpath, stat } from "node:fs/promises";
import { FsTargetKey, FsVersion } from "@deepseek-ai/dsh-fs";
import { isAbsolute, relative, resolve } from "node:path";
//#region lib/types/files/node.js
/** Node filesystem adapter for the packaged read-only validator. */
/**
* Create a read-only adapter contained in one local workspace.
* @param cwd - workspace root; symlink aliases resolve to their actual stable identity.
* @returns adapter with no business-write or repair capability.
*/
function nodeStudyFiles(cwd) {
	const root = resolve(cwd);
	const actualRoot = realpath(root);
	async function target(path) {
		const full = resolve(root, path);
		let actual;
		try {
			actual = await realpath(full);
		} catch (error) {
			if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
			const parent = resolve(full, "..");
			if (parent === full) throw error;
			const relativeParent = relative(root, parent);
			actual = resolve(await target(relativeParent), full.slice(parent.length + 1));
		}
		const child = relative(await actualRoot, actual);
		if (child.startsWith("..") || isAbsolute(child)) throw new Error("Study files must remain inside the current workspace.");
		return actual;
	}
	return {
		async stat(path, signal) {
			signal.throwIfAborted();
			const full = await target(path);
			try {
				const info = await stat(full, { bigint: true });
				return {
					targetKey: FsTargetKey(full),
					version: FsVersion(`${info.dev}:${info.ino}:${info.size}:${info.mtimeNs}:${info.ctimeNs}`),
					type: info.isFile() ? "file" : info.isDirectory() ? "directory" : "other",
					size: Number(info.size)
				};
			} catch (error) {
				if (error instanceof Error && "code" in error && error.code === "ENOENT") return void 0;
				throw error;
			}
		},
		async list(path, signal) {
			signal.throwIfAborted();
			try {
				return (await readdir(await target(path), { withFileTypes: true })).map((entry) => ({
					name: entry.name,
					type: entry.isFile() ? "file" : entry.isDirectory() ? "directory" : "other"
				}));
			} catch (error) {
				if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
				throw error;
			}
		},
		async read(path, signal, limit) {
			const full = await target(path);
			const info = await stat(full);
			if (!info.isFile() || info.size > limit) throw new Error(`${path} must be a regular file of at most ${limit} bytes.`);
			const bytes = await readFile(full, { signal });
			if (bytes.length > limit) throw new Error(`${path} exceeds its read limit.`);
			return bytes;
		}
	};
}
//#endregion
export { StudyBackupRetention, answerDateSchema, applicationStudyFiles, assessmentSchema, assistanceSchema, attachEvidence, backupSchema, backupVersions, blockSchema, collectionsSchema, demonstrablyAfter, deriveEvidence, describeArchive, describeMigration, describeRestore, evidenceAtCutoff, evidenceDay, evidenceOf, lessonFileSchema, lessonSchema, manualFields, nextRefreshAfter, nodeStudyFiles, officialFileSchemas, projectWorkspace, queryDashboard, queryStudy, queryWorkspace, questionSchema, questionSourceSchema, readBackups, readLessonFile, readWorkspace, responseSchema, responseSourceSchema, retainObservedBackups, saveManual, sourceSha256, termSettingsSchema, validateStudyFiles, worksheetSchema };
