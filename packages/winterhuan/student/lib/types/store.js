import { readBackups, backupVersions, retainObservedBackups } from "./files/recovery.js";
import { applicationStudyFiles } from "./files/application.js";
import { readWorkspace } from "./files/read.js";
import { projectWorkspace } from "./files/projection.js";
import { nextRefreshAfter } from "./learning/queries.js";
import { stateSchema } from "./schema.js";
import { scheduleMistakes } from "./learning/schedule.js";
const MAX_BYTES = 8_388_608;
import { migrateStudyFile } from "./files/legacy.js";
export { migrateStudyFile } from "./files/legacy.js";
/**
 * Read validated v2 files or preserved legacy v1 bytes in the calling Session's filesystem.
 * Reads preserve absence and legacy bytes; current valid v2 observations can retain bounded backups.
 * @param exec - calling agent and cancellation signal.
 * @returns current projected state, or undefined before setup/after archive.
 * @throws StudyDataUnavailable for invalid current v2 files.
 */
export async function studyStore(exec) {
    const agent = exec.agent;
    if (!agent?.session.header.cwd)
        throw new Error('请先在 DSH 中打开学习工作区。');
    exec.signal.throwIfAborted();
    const fs = agent.ctx.get('fs');
    const policy = agent.ctx.get('sandboxPolicy');
    if (!fs || !policy)
        throw new Error('学生插件需要 DSH 文件系统和沙箱策略服务。');
    const cwd = agent.session.header.cwd;
    const files = applicationStudyFiles(exec);
    const stateCache = files.cache.legacy;
    const entityCache = files.cache.entities;
    if (await files.stat('.study/settings.json', exec.signal)) {
        const backups = await readBackups(files, exec.signal);
        const read = await readWorkspace(files, exec.signal, backupVersions(backups.backups));
        if (read.status === 'valid')
            await retainObservedBackups(files, read, Date.now(), exec.signal);
        if (read.status === 'archived')
            return undefined;
        if (read.status !== 'valid' || !read.workspace)
            throw new StudyDataUnavailable(read);
        const identity = read.files.find(file => file.path === '.study/settings.json').targetKey;
        const signature = JSON.stringify(read.files.map(file => [file.targetKey, file.version]));
        const cached = entityCache.get(identity);
        const now = Date.now();
        if (cached?.signature === signature && now >= cached.at && now < cached.refreshAfter)
            return cached.state;
        const state = projectWorkspace(read.workspace, now);
        if (entityCache.size >= 8)
            entityCache.clear();
        entityCache.set(identity, { signature, state, at: now, refreshAfter: nextRefreshAfter(state, now) });
        return state;
    }
    const root = await fs.resolve(cwd, { signal: exec.signal });
    const target = await fs.resolve('.study/state.json', { cwd, signal: exec.signal });
    if (!fs.contains(root, target))
        throw new Error('学习档案必须位于当前工作区内。');
    const before = await fs.stat(target, exec.signal);
    let state;
    if (before) {
        if (before.type !== 'file')
            throw new Error('.study/state.json 必须是普通文件。');
        const cached = stateCache.get(target.targetKey);
        if (cached && cached.version === before.version) {
            state = cached.state;
        }
        else {
            const bytes = await fs.readBytes(target, exec.signal, MAX_BYTES);
            const after = await fs.stat(target, exec.signal);
            if (after?.version !== before.version)
                throw new Error('学习档案已更新，请查询最新状态后重试。');
            const parsed = stateSchema.parse(migrateStudyFile(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes))));
            state = parsed.archivedAt !== undefined ? undefined : scheduleMistakes(parsed);
            if (state !== undefined) {
                if (stateCache.size >= 8)
                    stateCache.clear();
                stateCache.set(target.targetKey, { version: after?.version ?? before.version, state });
            }
        }
    }
    return state;
}
export { queryStudy } from "./learning/queries.js";
/** Invalid current official files keep prior displays stale until an explicit repair is validated. */
export class StudyDataUnavailable extends Error {
    read;
    constructor(read) {
        super(read.issues[0]?.correction ?? 'Current Student files are unavailable.');
        this.read = read;
    }
}
//# sourceMappingURL=store.js.map