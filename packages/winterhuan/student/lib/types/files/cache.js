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
//# sourceMappingURL=cache.js.map