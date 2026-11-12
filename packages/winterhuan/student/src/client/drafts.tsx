/** Browser draft storage is optional and never supplies saved business facts. */
export function useDraftStorage(entity: string, namespace = 'student:standalone') {
  const key = `${namespace}:${entity}`
  return {
    key,
    read(): string | undefined { try { return window.sessionStorage.getItem(key) ?? undefined } catch { return undefined } },
    write(value: string) { try { window.sessionStorage.setItem(key, value) } catch { /* The mounted form still retains its values when browser storage is blocked. */ } },
    clear() { try { window.sessionStorage.removeItem(key) } catch { /* Clearing a browser draft does not change business files. */ } },
  }
}
