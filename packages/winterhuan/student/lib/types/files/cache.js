/** Validated source and query caches belong to a Host instance or one read-only adapter. */
import { Service } from '@deepseek-ai/cordis';
/** Read-only adapters retain their own observations; application adapters share a disposable Host owner. */
export class StudyReadCache {
    files = new Map();
    backups = new Map();
    queries = new Map();
    legacy = new Map();
    entities = new Map();
    /** Release retained source bytes and every derived projection together. */
    clear() { this.files.clear(); this.backups.clear(); this.queries.clear(); this.legacy.clear(); this.entities.clear(); }
}
/** Teardown releases source bytes; another Host starts without this Host's validation history. */
export class StudyReadCacheOwner extends Service {
    cache = new StudyReadCache();
    /** @param ctx - Host context owning the cached observations. */
    constructor(ctx) {
        super(ctx, 'studentReadCache');
        ctx.effect(() => () => this.cache.clear(), 'student: validated read cache');
    }
}
//# sourceMappingURL=cache.js.map