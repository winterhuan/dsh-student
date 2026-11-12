/** Browser draft storage is optional and never supplies saved business facts. */
export declare function useDraftStorage(entity: string, namespace?: string): {
    key: string;
    read(): string | undefined;
    write(value: string): void;
    clear(): void;
};
//# sourceMappingURL=drafts.d.ts.map