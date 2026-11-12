/** DSH filesystem and sandbox-policy adapter; native and shell writes remain outside application CAS. */
import type { ToolExecution } from '@deepseek-ai/dsh-tools'
import type {} from '@deepseek-ai/dsh-sandbox-policy'
import type { StudyFiles } from './read.ts'

/**
 * Bind official-file reads and guarded manual writes to the calling execution world.
 * @param exec - current registered agent and cancellation signal.
 * @returns filesystem adapter that preserves DSH containment and write policy.
 */
export function applicationStudyFiles(exec: Pick<ToolExecution, 'agent' | 'signal'>): StudyFiles {
  const agent = exec.agent
  if (!agent?.session.header.cwd) throw new Error('Open a Student workspace before reading its files.')
  const availableFs = agent.ctx.get('fs')
  const policy = agent.ctx.get('sandboxPolicy')
  if (!availableFs || !policy) throw new Error('Student requires the DSH filesystem and sandbox policy services.')
  const fs = availableFs
  const cwd = agent.session.header.cwd
  async function target(path: string, signal: AbortSignal) {
    const root = await fs.resolve(cwd, { signal })
    const resolved = await fs.resolve(path, { cwd, signal })
    if (!fs.contains(root, resolved)) throw new Error('学习档案必须位于当前工作区内。')
    return resolved
  }
  return {
    async stat(path, signal) { const resolved = await target(path, signal); const info = await fs.stat(resolved, signal); return info ? { ...info, targetKey: resolved.targetKey } : undefined },
    async list(path, signal) { const resolved = await target(path, signal); if (!await fs.stat(resolved, signal)) return []; return (await fs.listDir(resolved, signal)).map(entry => ({ name: entry.name, type: entry.type })) },
    async read(path, signal, limit) { return fs.readBytes(await target(path, signal), signal, limit) },
    async write(path, content, intent, signal) { return (await fs.writeText(await target(path, signal), content, intent, signal, policy.resolve({ session: agent.session }))).version },
    async remove(path, version, signal) { await fs.deleteFile(await target(path, signal), { version }, signal, policy.resolve({ session: agent.session })) },
  }
}
