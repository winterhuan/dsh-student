import { B as evidenceAtCutoff, C as questionSchema, D as termSettingsSchema, E as responseSourceSchema, F as readLessonFile, H as evidenceOf, L as attachEvidence, M as lessonFileSchema, N as lessonSchema, O as worksheetSchema, R as demonstrablyAfter, S as officialFileSchemas, T as responseSchema, U as canonical, V as evidenceDay, _ as answerDateSchema, a as projectWorkspace, b as blockSchema, c as backupSchema, d as describeMigration, f as describeRestore, g as validateStudyFiles, h as sourceSha256, i as queryWorkspace, j as updateStudy, l as backupVersions, m as retainObservedBackups, n as queryDashboard, o as readWorkspace, p as readBackups, r as queryStudy, s as applicationStudyFiles, t as nextRefreshAfter, u as describeArchive, v as assessmentSchema, w as questionSourceSchema, x as collectionsSchema, y as assistanceSchema, z as deriveEvidence } from "./queries-6rHAUo8u.js";
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
//#region lib/types/files/manual.js
/**
* Capture exactly the fields a typed manual intent edits.
* @param read - current valid relevant owner.
* @param intent - intended settings save or worksheet corrections.
* @returns edited field values suitable for the draft baseline and conflict display.
*/
function manualFields(read, intent) {
	const workspace = read.workspace;
	if (!workspace) return {};
	if (intent.kind === "worksheet-assessments") {
		const sheet = workspace.worksheets.find((sheet) => sheet.id === intent.worksheetId);
		return Object.fromEntries([
			...intent.assessments.map((assessment) => [`assessment:${assessment.responseId}`, sheet?.assessments.find((current) => current.responseId === assessment.responseId) ?? null]),
			...intent.answerDate ? [["answerDate", sheet?.answerDate ?? null]] : [],
			...(intent.responseUpdates ?? []).map((update) => {
				const response = sheet?.responses.find((response) => response.id === update.responseId);
				return [`response:${update.responseId}`, {
					...update.assistance ? { assistance: response?.assistance ?? null } : {},
					...update.answerDate ? { answerDate: response?.answerDate ?? null } : {}
				}];
			})
		]);
	}
	const settings = workspace.settings;
	const command = intent.command;
	switch (command.action) {
		case "setup": return Object.fromEntries(intent.editedProfileFields.map((field) => [`profile:${field}`, settings.profile[field]]));
		case "interests": return { interests: settings.interests ?? null };
		case "openmaic-settings": return { openmaic: settings.openmaic ?? null };
		case "configure-course": return {
			[`material:${command.material.id}`]: settings.materials.find((material) => material.id === command.material.id) ?? null,
			[`course:${command.course.subject}`]: settings.courses.find((course) => course.subject === command.course.subject) ?? null
		};
		case "school-progress": return { [`progress:${command.subject}`]: settings.courses.find((course) => course.subject === command.subject)?.progress ?? null };
	}
}
/**
* Save a manual draft after checking edited-field baselines, term and every related actual file version.
* Unrelated version changes may rebase; a relevant change returns current values and preserves the caller's draft.
* @param fs - DSH-backed adapter with guarded write capability.
* @param request - typed intent with original edited fields and observed versions.
* @param now - current application clock.
* @param signal - cancellation signal.
* @returns saved, unchanged or explicit conflict/invalid/unknown result with independently reread files.
*/
async function saveManual(fs, request, now, signal) {
	const backups = await readBackups(fs, signal);
	const read = await readWorkspace(fs, signal, backupVersions(backups.backups));
	const current = manualFields(read, request.intent);
	const path = request.intent.kind === "settings" ? ".study/settings.json" : `.study/worksheets/${request.intent.worksheetId}.json`;
	if (!read.workspace || read.issues.some((issue) => issue.path === path || path.startsWith(`${issue.path}/`) || issue.path === ".study/settings.json") || !fs.write) return {
		status: "invalid",
		current,
		read
	};
	if (read.workspace.settings.termId !== request.termId) return {
		status: "old-term",
		current,
		read
	};
	if (!request.expectedVersions.some((entry) => entry.path === path) || canonical(current) !== canonical(request.baseline)) return {
		status: "conflict",
		current,
		read
	};
	const observed = read.files.find((file) => file.path === path);
	if (!observed?.file) return {
		status: "invalid",
		current,
		read
	};
	await retainObservedBackups(fs, read, now, signal);
	let next = structuredClone(observed.file);
	if (request.intent.kind === "settings") {
		const previous = projectWorkspace(read.workspace, now);
		let command = request.intent.command;
		if (command.action === "setup") {
			const draft = command.profile;
			command = {
				...command,
				profile: {
					...previous.profile,
					...Object.fromEntries(request.intent.editedProfileFields.map((field) => [field, draft[field]]))
				}
			};
		}
		let updated;
		try {
			updated = updateStudy(previous, command, now);
		} catch (error) {
			return {
				status: "invalid",
				current,
				read,
				reason: error instanceof Error ? error.message : "Correct the invalid settings command."
			};
		}
		if (updated === previous) return {
			status: "unchanged",
			current,
			read
		};
		const settings = {
			...read.workspace.settings,
			revision: read.workspace.settings.revision + 1,
			updatedAt: now,
			profile: updated.profile,
			materials: updated.materials,
			courses: updated.courses,
			...updated.interests ? { interests: updated.interests } : {},
			...updated.openmaic ? { openmaic: updated.openmaic } : {}
		};
		if (!updated.openmaic) delete settings.openmaic;
		next = settings;
	} else {
		if (next.kind !== "worksheet") return {
			status: "invalid",
			current,
			read
		};
		if (request.intent.answerDate) next.answerDate = request.intent.answerDate;
		for (const update of request.intent.responseUpdates ?? []) {
			const response = next.responses.find((response) => response.id === update.responseId);
			if (!response || !update.userConfirmation.trim()) return {
				status: "invalid",
				current,
				read
			};
			if (update.assistance) {
				response.assistance = update.assistance;
				response.assistanceConfirmation = update.userConfirmation;
			}
			if (update.answerDate) response.answerDate = update.answerDate;
		}
		for (const assessment of request.intent.assessments) {
			const existing = next.assessments.findIndex((item) => item.responseId === assessment.responseId);
			if (existing < 0) next.assessments.push(assessment);
			else {
				const previous = next.assessments[existing];
				const comparison = {
					...assessment,
					assessedAt: previous.assessedAt
				};
				if (previous.correctedAt !== void 0) comparison.correctedAt = previous.correctedAt;
				else delete comparison.correctedAt;
				if (canonical(comparison) !== canonical(previous)) next.assessments[existing] = {
					...assessment,
					assessedAt: previous.assessedAt,
					correctedAt: now
				};
			}
		}
		if (canonical(next) === canonical(observed.file)) return {
			status: "unchanged",
			current,
			read
		};
	}
	const validation = validateStudyFiles(read.files.flatMap((file) => file.file ? [{
		path: file.path,
		value: file.path === path ? next : file.file
	}] : []), read.files.flatMap((file) => file.file ? [{
		path: file.path,
		file: file.file
	}] : []));
	if (validation.issues.some((issue) => issue.path === path || issue.path === ".study/settings.json")) return {
		status: "invalid",
		current,
		read: {
			...read,
			issues: [...read.issues, ...validation.issues]
		}
	};
	for (const file of read.files.filter((file) => file.path === path || request.expectedVersions.some((expected) => expected.path === file.path))) if ((await fs.stat(file.path, signal))?.version !== file.version) return {
		status: "conflict",
		current,
		read
	};
	try {
		await fs.write(path, `${JSON.stringify(next, null, 2)}\n`, {
			kind: "replaceIfVersion",
			version: observed.version
		}, signal);
	} catch (error) {
		if (signal.aborted) throw error;
		const latest = await readWorkspace(fs, signal);
		return {
			status: error instanceof Error && "code" in error && ["FS_STALE_VERSION", "FS_NOT_OBSERVED"].includes(String(error.code)) ? "conflict" : "unknown",
			current: manualFields(latest, request.intent),
			read: latest,
			reason: error instanceof Error ? error.message : "The file write outcome is unknown."
		};
	}
	const latest = await readWorkspace(fs, signal);
	if (latest.status === "valid") await retainObservedBackups(fs, latest, now, signal);
	return {
		status: latest.files.some((file) => file.path === path && file.file && canonical(file.file) === canonical(next)) ? "saved" : "unknown",
		current: manualFields(latest, request.intent),
		read: latest
	};
}
//#endregion
export { answerDateSchema, applicationStudyFiles, assessmentSchema, assistanceSchema, attachEvidence, backupSchema, backupVersions, blockSchema, collectionsSchema, demonstrablyAfter, deriveEvidence, describeArchive, describeMigration, describeRestore, evidenceAtCutoff, evidenceDay, evidenceOf, lessonFileSchema, lessonSchema, manualFields, nextRefreshAfter, nodeStudyFiles, officialFileSchemas, projectWorkspace, queryDashboard, queryStudy, queryWorkspace, questionSchema, questionSourceSchema, readBackups, readLessonFile, readWorkspace, responseSchema, responseSourceSchema, retainObservedBackups, saveManual, sourceSha256, termSettingsSchema, validateStudyFiles, worksheetSchema };
