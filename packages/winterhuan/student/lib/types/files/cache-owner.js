/** Host lifetime for validated observations; read-only adapters use the independent cache. */
import { Service } from '@deepseek-ai/cordis';
import { StudyReadCache } from "./cache.js";
/** Teardown releases source bytes; another Host starts without this Host's validation history. */
export class StudyReadCacheOwner extends Service {
    cache = new StudyReadCache();
    /** @param ctx - Host context owning the cached observations. */
    constructor(ctx) {
        super(ctx, 'studentReadCache');
        ctx.effect(() => () => this.cache.clear(), 'student: validated read cache');
    }
}
//# sourceMappingURL=cache-owner.js.map