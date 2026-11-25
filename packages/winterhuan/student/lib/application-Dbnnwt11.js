import { rn as StudyReadCache } from "./read-WhSEc1TX.js";
import { Service } from "@deepseek-ai/cordis";
//#region lib/types/files/backup-retention.js
/** Host-lifetime serialization keeps independently observed backup versions within shared bounds. */
/** Serializes retention and waits for all owned operations during Host teardown. */
var StudyBackupRetention = class extends Service {
	tails = /* @__PURE__ */ new Map();
	lifetime = new AbortController();
	/** @param ctx - Host context whose lifetime owns all backup operations. */
	constructor(ctx) {
		super(ctx, "studentBackups");
		ctx.effect(() => async () => {
			this.lifetime.abort();
			await Promise.all(this.tails.values());
		}, "student: backup retention");
	}
	async run(identity, operation, signal) {
		this.lifetime.signal.throwIfAborted();
		const combined = AbortSignal.any([signal, this.lifetime.signal]);
		combined.throwIfAborted();
		const operationResult = (this.tails.get(identity) ?? Promise.resolve()).then(() => {
			combined.throwIfAborted();
			return operation(combined);
		});
		const completed = operationResult.then(() => {}, () => {});
		this.tails.set(identity, completed);
		completed.then(() => {
			if (this.tails.get(identity) === completed) this.tails.delete(identity);
		});
		return new Promise((resolve, reject) => {
			const abort = () => reject(combined.reason);
			combined.addEventListener("abort", abort, { once: true });
			operationResult.then(resolve, reject).finally(() => combined.removeEventListener("abort", abort));
			if (combined.aborted) abort();
		});
	}
};
//#endregion
//#region lib/types/files/cache-owner.js
/** Host lifetime for validated observations; read-only adapters use the independent cache. */
/** Teardown releases source bytes; another Host starts without this Host's validation history. */
var StudyReadCacheOwner = class extends Service {
	cache = new StudyReadCache();
	/** @param ctx - Host context owning the cached observations. */
	constructor(ctx) {
		super(ctx, "studentReadCache");
		ctx.effect(() => () => this.cache.clear(), "student: validated read cache");
	}
};
//#endregion
//#region lib/types/files/application.js
/**
* Bind official-file reads and guarded manual writes to the calling execution world.
* @param exec - current registered agent and cancellation signal.
* @returns filesystem adapter that preserves DSH containment and write policy.
*/
function applicationStudyFiles(exec) {
	const agent = exec.agent;
	if (!agent?.session.header.cwd) throw new Error("Open a Student workspace before reading its files.");
	const availableFs = agent.ctx.get("fs");
	const policy = agent.ctx.get("sandboxPolicy");
	if (!availableFs || !policy) throw new Error("Student requires the DSH filesystem and sandbox policy services.");
	const fs = availableFs;
	const cwd = agent.session.header.cwd;
	const retention = agent.ctx.root.get("studentBackups") ?? new StudyBackupRetention(agent.ctx.root);
	const cache = agent.ctx.root.get("studentReadCache") ?? new StudyReadCacheOwner(agent.ctx.root);
	async function target(path, signal) {
		const root = await fs.resolve(cwd, { signal });
		const resolved = await fs.resolve(path, {
			cwd,
			signal
		});
		if (!fs.contains(root, resolved)) throw new Error("学习档案必须位于当前工作区内。");
		return resolved;
	}
	return {
		cache: cache.cache,
		backupRetention: retention,
		async stat(path, signal) {
			const resolved = await target(path, signal);
			const info = await fs.stat(resolved, signal);
			return info ? {
				...info,
				targetKey: resolved.targetKey
			} : void 0;
		},
		async list(path, signal) {
			const resolved = await target(path, signal);
			if (!await fs.stat(resolved, signal)) return [];
			return (await fs.listDir(resolved, signal)).map((entry) => ({
				name: entry.name,
				type: entry.type
			}));
		},
		async read(path, signal, limit) {
			return fs.readBytes(await target(path, signal), signal, limit);
		},
		async write(path, content, intent, signal) {
			return (await fs.writeText(await target(path, signal), content, intent, signal, policy.resolve({ session: agent.session }))).version;
		},
		async remove(path, version, signal) {
			await fs.deleteFile(await target(path, signal), { version }, signal, policy.resolve({ session: agent.session }));
		}
	};
}
//#endregion
export { StudyReadCacheOwner as n, StudyBackupRetention as r, applicationStudyFiles as t };
