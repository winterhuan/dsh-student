/** Host lifetime for validated observations; read-only adapters use the independent cache. */
import { Service, type Context } from '@deepseek-ai/cordis'
import { StudyReadCache } from './cache.ts'

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
