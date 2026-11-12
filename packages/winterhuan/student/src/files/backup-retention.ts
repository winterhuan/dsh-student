/** Host-lifetime serialization keeps independently observed backup versions within shared bounds. */
import { Service, type Context } from '@deepseek-ai/cordis'

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** One queue owner shared by application reads and manual saves. */
    studentBackups: StudyBackupRetention
  }
}
/** Per-workspace retention owner; read-only adapters have none. */
export interface BackupRetentionQueue {
  /**
   * Serialize a complete backup read/prune/write operation for one actual workspace identity.
   * @param identity - current settings file's filesystem target identity.
   * @param operation - complete retention operation, awaited before the next starts.
   * @param signal - cancellation checked after the predecessor settles.
   * @returns the operation result, or rejection when canceled or the owner is disposing.
   */
  run<T>(identity: string, operation: (signal: AbortSignal) => Promise<T>, signal: AbortSignal): Promise<T>
}
/** Serializes retention and waits for all owned operations during Host teardown. */
export class StudyBackupRetention extends Service implements BackupRetentionQueue {
  private readonly tails = new Map<string, Promise<void>>()
  private readonly lifetime = new AbortController()
  /** @param ctx - Host context whose lifetime owns all backup operations. */
  constructor(ctx: Context) {
    super(ctx, 'studentBackups')
    ctx.effect(() => async () => { this.lifetime.abort(); await Promise.all(this.tails.values()) }, 'student: backup retention')
  }
  async run<T>(identity: string, operation: (signal: AbortSignal) => Promise<T>, signal: AbortSignal): Promise<T> {
    this.lifetime.signal.throwIfAborted()
    const combined = AbortSignal.any([signal, this.lifetime.signal])
    combined.throwIfAborted()
    const previous = this.tails.get(identity) ?? Promise.resolve()
    const operationResult = previous.then(() => { combined.throwIfAborted(); return operation(combined) })
    // A rejected operation settles its queue slot; its caller still receives that rejection.
    const completed = operationResult.then(() => {}, () => {})
    this.tails.set(identity, completed)
    void completed.then(() => { if (this.tails.get(identity) === completed) this.tails.delete(identity) })
    return new Promise<T>((resolve, reject) => {
      const abort = () => reject(combined.reason)
      combined.addEventListener('abort', abort, { once: true })
      operationResult.then(resolve, reject).finally(() => combined.removeEventListener('abort', abort))
      if (combined.aborted) abort()
    })
  }
}
