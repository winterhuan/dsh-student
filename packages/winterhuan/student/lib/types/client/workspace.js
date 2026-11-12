import { useCallback, useEffect, useRef, useState } from 'react';
/** Poll visible workbenches; preserve data on failure and discard obsolete responses. */
export function useStudy(sessionId, visible, networkError, query) {
    const [data, setData] = useState();
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);
    const latest = useRef(0);
    const alive = useRef(true);
    const writing = useRef(false);
    const offset = useRef(0);
    const controllers = useRef(new Set());
    const request = useCallback(async (change, revision) => {
        const sequence = ++latest.current;
        const controller = new AbortController();
        controllers.current.add(controller);
        try {
            const scope = `${query.mapGrade !== undefined ? `&mapGrade=${query.mapGrade}` : ''}${query.mapTerm !== undefined ? `&mapTerm=${query.mapTerm}` : ''}${query.diagGrade !== undefined ? `&diagGrade=${query.diagGrade}` : ''}${query.diagTerm !== undefined ? `&diagTerm=${query.diagTerm}` : ''}${query.diagUnit !== undefined && query.diagUnit !== '' ? `&diagUnit=${encodeURIComponent(query.diagUnit)}` : ''}`;
            const response = await fetch(`/student/workspace?sessionId=${encodeURIComponent(sessionId)}&tab=${query.tab}&mistakeOffset=${query.offset}&subject=${query.subject}&mistakeStatus=${query.status}${scope}`, {
                signal: controller.signal, ...(change ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ revision, change }) } : {}),
            });
            const value = await response.json();
            if (!response.ok)
                throw new Error(value.error ?? networkError);
            if (alive.current && sequence === latest.current) {
                offset.current = value.serverNow - Date.now();
                setData(value);
                setError('');
            }
            return value;
        }
        catch (reason) {
            if (alive.current && !controller.signal.aborted && sequence === latest.current)
                setError(reason instanceof Error ? reason.message : networkError);
            throw reason;
        }
        finally {
            controllers.current.delete(controller);
        }
    }, [sessionId, networkError, query.tab, query.offset, query.subject, query.status, query.mapGrade, query.mapTerm, query.diagGrade, query.diagTerm, query.diagUnit]);
    const reload = useCallback(async () => {
        if (writing.current)
            return;
        await request().catch(() => { });
    }, [request]);
    useEffect(() => {
        alive.current = true;
        return () => { alive.current = false; latest.current++; for (const controller of controllers.current)
            controller.abort(); };
    }, []);
    useEffect(() => {
        if (!visible)
            return;
        void reload();
        const timer = window.setInterval(() => { if (document.visibilityState !== 'hidden')
            void reload(); }, 3000);
        return () => window.clearInterval(timer);
    }, [visible, reload]);
    const change = useCallback(async (command, revision = data?.revision ?? 0) => {
        if (writing.current)
            throw new Error(networkError);
        writing.current = true;
        setBusy(true);
        try {
            return await request(command, revision);
        }
        finally {
            writing.current = false;
            if (alive.current)
                setBusy(false);
        }
    }, [request, data?.revision, networkError]);
    return { data, error, busy, reload, change, offset };
}
//# sourceMappingURL=workspace.js.map