/** Host-lifetime serialization keeps independently observed backup versions within shared bounds. */
import { Service } from '@deepseek-ai/cordis';
/** Serializes retention and waits for all owned operations during Host teardown. */
export class StudyBackupRetention extends Service {
    tails = new Map();
    lifetime = new AbortController();
    /** @param ctx - Host context whose lifetime owns all backup operations. */
    constructor(ctx) {
        super(ctx, 'studentBackups');
        ctx.effect(() => async () => { this.lifetime.abort(); await Promise.all(this.tails.values()); }, 'student: backup retention');
    }
    async run(identity, operation, signal) {
        this.lifetime.signal.throwIfAborted();
        const combined = AbortSignal.any([signal, this.lifetime.signal]);
        combined.throwIfAborted();
        const previous = this.tails.get(identity) ?? Promise.resolve();
        const operationResult = previous.then(() => { combined.throwIfAborted(); return operation(combined); });
        // A rejected operation settles its queue slot; its caller still receives that rejection.
        const completed = operationResult.then(() => { }, () => { });
        this.tails.set(identity, completed);
        void completed.then(() => { if (this.tails.get(identity) === completed)
            this.tails.delete(identity); });
        return new Promise((resolve, reject) => {
            const abort = () => reject(combined.reason);
            combined.addEventListener('abort', abort, { once: true });
            operationResult.then(resolve, reject).finally(() => combined.removeEventListener('abort', abort));
            if (combined.aborted)
                abort();
        });
    }
}
//# sourceMappingURL=backup-retention.js.map