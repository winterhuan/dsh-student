/** Validated source and query caches belong to a Host instance or one read-only adapter. */
import { Service, type Context } from '@deepseek-ai/cordis'
import type { FsVersion } from '@deepseek-ai/dsh-fs'
import type { OfficialFile } from './schema.ts'
import type { ObservedBackup } from './recovery.ts'
import type { StudyState } from '../schema.ts'
import type { weeklySummary } from '../learning/status.ts'

/** A version-bound compatibility projection and its bounded query results. */
export interface WorkspaceProjectionCache {
  signature: string; state: StudyState; at: number; refreshAfter: number
  summary?: ReturnType<typeof weeklySummary>; queries: Map<string, Record<string, unknown>>
}

/** Read-only adapters retain their own observations; application adapters share a disposable Host owner. */
export class StudyReadCache {
  readonly files: Map<string, { version: FsVersion; bytes: Uint8Array; value: unknown; file?: OfficialFile }> = new Map()
  readonly backups: Map<string, { version: string; backup: ObservedBackup }> = new Map()
  readonly queries: Map<string, WorkspaceProjectionCache> = new Map()
  readonly legacy: Map<string, { version: string; state: StudyState }> = new Map()
  readonly entities: Map<string, { signature: string; state: StudyState; at: number; refreshAfter: number }> = new Map()
  /** Release retained source bytes and every derived projection together. */
  clear(): void { this.files.clear(); this.backups.clear(); this.queries.clear(); this.legacy.clear(); this.entities.clear() }
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** Host-owned validated observations shared across requests to its filesystem. */
    studentReadCache: StudyReadCacheOwner
  }
}

/** Teardown releases source bytes; another Host starts without this Host's validation history. */
export class StudyReadCacheOwner extends Service {
  readonly cache: StudyReadCache = new StudyReadCache()
  /** @param ctx - Host context owning the cached observations. */
  constructor(ctx: Context) {
    super(ctx, 'studentReadCache')
    ctx.effect(() => () => this.cache.clear(), 'student: validated read cache')
  }
}
