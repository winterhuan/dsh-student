/** Authorized official-service reads and recoverable generation; never writes learning records. */
import { constants, publicEncrypt } from 'node:crypto'
import { z } from 'zod'
import { normalizeOpenmaicBase } from '../openmaic.ts'

/** Host configuration carries credential references rather than secret values. */
export interface OpenmaicConnectionConfig { baseUrl: string; accountBaseUrl: string; accountRef: string; passwordRef: string; accessCodeRef: string; tokenRef: string; accountId: string; requestTimeoutMs?: number; operationTimeoutMs?: number }
/** Private storage implemented by the DSH credential provider. */
export interface OpenmaicSecretStore { resolve(ref: string): Promise<string | undefined>; load(): Promise<unknown>; save(value: unknown): Promise<void> }
/** External wire and clock dependencies; production uses Node fetch and RSA-OAEP. */
export interface OpenmaicNetwork { fetch?: typeof fetch; now?: () => number; encryptPassword?: (password: string, key: string) => Promise<string> }
const authSchema = z.object({ token: z.string().min(1), accountId: z.string().min(1), learnerKey: z.string().min(1), expiresAt: z.number(), baseUrl: z.string(), accountBaseUrl: z.string() })
const jsonObject = z.record(z.string(), z.unknown())
/** Credential failures expose only actionable codes, never server messages or secret payloads. */
export class OpenmaicError extends Error {
  constructor(readonly code: 'login-required' | 'login-challenge' | 'identity-changed' | 'permission-denied' | 'not-found' | 'service-unavailable' | 'invalid-response' | 'unsafe-origin' | 'generation-unknown' | 'browser-unavailable' | 'operation-timeout' | 'operation-canceled' | 'response-too-large', readonly status?: number) { super(`OpenMAIC ${code}. ${code === 'login-required' || code === 'login-challenge' ? 'A parent can restore authorization using the official sign-in page or Host credential settings.' : 'Keep the current activity and retry its existing identity after checking the service.'}`) }
}
/**
 * Bound local waiting without reporting that the remote job was canceled.
 * @param signal - Caller cancellation; its arbitrary reason is never exposed.
 * @param timeoutMs - Total operation deadline in milliseconds.
 * @param operation - Work receiving the combined cancellation signal.
 * @returns The operation result, or a sanitized cancellation/deadline failure.
 */
export async function boundedOpenmaicOperation<T>(signal: AbortSignal, timeoutMs: number, operation: (signal: AbortSignal) => Promise<T>): Promise<T> {
  const timeout = new AbortController()
  const bounded = AbortSignal.any([signal, timeout.signal])
  const failure = () => new OpenmaicError(signal.aborted ? 'operation-canceled' : 'operation-timeout')
  if (bounded.aborted) throw failure()
  const timer = setTimeout(() => timeout.abort(), timeoutMs)
  timer.unref()
  let onAbort: () => void = () => {}
  try {
    return await Promise.race([operation(bounded), new Promise<never>((_resolve, reject) => { onAbort = () => reject(failure()); bounded.addEventListener('abort', onAbort, { once: true }); if (bounded.aborted) onAbort() })])
  } catch (error) { if (bounded.aborted) throw failure(); throw error }
  finally { clearTimeout(timer); bounded.removeEventListener('abort', onAbort) }
}
/** Safe public account identity; no access code, password or token crosses this view. */
export interface OpenmaicIdentity { baseUrl: string; accountId: string; learnerKey: string; expiresAt: number }

/** Same-account login renewal is serialized and replacement follows learner verification. */
export class OpenmaicConnection {
  /** Normalized official classroom origin used by tools and safe links. */
  readonly baseUrl: string
  /** Total local wait limit shared by authorization, generation and continuation. */
  readonly operationTimeoutMs: number
  private readonly accountBaseUrl: string
  private readonly external: typeof fetch
  private readonly now: () => number
  private renewal: Promise<z.infer<typeof authSchema>> | undefined
  private loaded?: z.infer<typeof authSchema>
  private accessCookie = ''
  constructor(private readonly config: OpenmaicConnectionConfig, private readonly store: OpenmaicSecretStore, private readonly network: OpenmaicNetwork = {}) {
    const base = normalizeOpenmaicBase(config.baseUrl)
    const account = normalizeOpenmaicBase(config.accountBaseUrl)
    if (!base || !account) throw new OpenmaicError('unsafe-origin')
    this.baseUrl = base
    this.accountBaseUrl = account
    this.external = network.fetch ?? fetch
    this.now = network.now ?? Date.now
    this.operationTimeoutMs = config.operationTimeoutMs ?? 120000
  }
  private async wire<T>(url: string, init: RequestInit, signal: AbortSignal, consume: (response: Response) => Promise<T>): Promise<T> {
    return boundedOpenmaicOperation(signal, this.config.requestTimeoutMs ?? 30000, async signal => {
      try {
        const origin = new URL(url).origin
        for (let redirects = 0; redirects <= 5; redirects++) {
          const response = await this.external(url, { ...init, signal, redirect: 'manual' })
          if (![301, 302, 303, 307, 308].includes(response.status)) return await consume(response)
          const location = response.headers.get('location')
          await response.body?.cancel()
          let target: URL
          try { if (!location) throw new Error(); target = new URL(location, url) } catch { throw new OpenmaicError('unsafe-origin') }
          if (!['http:', 'https:'].includes(target.protocol) || target.origin !== origin || target.username || target.password || target.hash) throw new OpenmaicError('unsafe-origin')
          // A redirect does not establish that a submission was unaccepted.
          if (!['GET', 'HEAD'].includes((init.method ?? 'GET').toUpperCase()) || redirects === 5) throw new OpenmaicError('service-unavailable')
          url = target.href
        }
        throw new OpenmaicError('service-unavailable')
      }
      catch (error) { if (signal.aborted || error instanceof OpenmaicError) throw error; throw new OpenmaicError('service-unavailable') }
    })
  }
  private async body(response: Response): Promise<unknown> {
    if (!response.ok) { await response.body?.cancel(); throw new OpenmaicError(response.status === 401 ? 'login-required' : response.status === 403 ? 'permission-denied' : response.status === 404 ? 'not-found' : 'service-unavailable', response.status) }
    if (!response.body) throw new OpenmaicError('invalid-response')
    const reader = response.body.getReader()
    const chunks: Uint8Array[] = []
    let bytes = 0
    try {
      for (;;) {
        const part = await reader.read()
        if (part.done) break
        bytes += part.value.byteLength
        if (bytes > 8 * 1024 * 1024) { await reader.cancel(); throw new OpenmaicError('response-too-large') }
        chunks.push(part.value)
      }
      return JSON.parse(Buffer.concat(chunks, bytes).toString('utf8'))
    } catch (error) { if (error instanceof OpenmaicError) throw error; throw new OpenmaicError('invalid-response') }
    finally { reader.releaseLock() }
  }
  private async account(path: string, input: unknown, signal: AbortSignal): Promise<unknown> {
    const reply = jsonObject.safeParse(await this.wire(`${this.accountBaseUrl}/${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }, signal, response => this.body(response)))
    if (!reply.success) throw new OpenmaicError('invalid-response')
    const data = 'content' in reply.data ? jsonObject.safeParse(reply.data.content) : reply
    if (!data.success || data.data.is_success !== true) throw new OpenmaicError('login-challenge')
    return data.data.data
  }
  private async learner(token: string, signal: AbortSignal): Promise<string> {
    const data = jsonObject.safeParse(await this.wire(`${this.baseUrl}/api/persistence/learner-key`, { headers: { cookie: `auth_token=${token}` } }, signal, response => this.body(response)))
    if (!data.success || typeof data.data.learnerKey !== 'string' || !data.data.learnerKey.startsWith('user:')) throw new OpenmaicError('invalid-response')
    return data.data.learnerKey
  }
  private expires(token: string): number {
    try { const exp = z.object({ exp: z.number() }).parse(JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString())).exp * 1000; if (exp <= this.now()) throw new Error(); return exp }
    catch { throw new OpenmaicError('login-required') }
  }
  private async renew(signal: AbortSignal): Promise<z.infer<typeof authSchema>> {
    const account = await this.store.resolve(this.config.accountRef)
    const password = await this.store.resolve(this.config.passwordRef)
    if (!account || !password) throw new OpenmaicError('login-required')
    const key = z.string().safeParse(await this.account('user/get_public_key', {}, signal))
    if (!key.success) throw new OpenmaicError('invalid-response')
    const encrypt = this.network.encryptPassword ?? (async (plain, publicKey) => publicEncrypt({ key: publicKey, padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }, Buffer.from(plain)).toString('base64'))
    let encrypted: string
    try { encrypted = await encrypt(password, key.data) } catch { throw new OpenmaicError('login-challenge') }
    let data = jsonObject.safeParse(await this.account('user/login', { account, password: encrypted, platform: 'WEB', domain: new URL(this.baseUrl).hostname }, signal))
    if (!data.success) throw new OpenmaicError('invalid-response')
    if (typeof data.data.token !== 'string') {
      const accounts = z.array(z.object({ account_user_id: z.string() })).safeParse(data.data.accounts)
      const selected = accounts.success ? accounts.data.filter(item => !this.config.accountId || item.account_user_id === this.config.accountId) : []
      if (selected.length !== 1 || typeof data.data.auth_token !== 'string') throw new OpenmaicError('login-challenge')
      data = jsonObject.safeParse(await this.account('user/account/sign', { auth_token: data.data.auth_token, account_user_id: selected[0]!.account_user_id }, signal))
    }
    if (!data.success || typeof data.data.token !== 'string' || typeof data.data.id !== 'string') throw new OpenmaicError('invalid-response')
    const token = data.data.token
    const learnerKey = await this.learner(token, signal)
    if (this.loaded && (this.loaded.accountId !== data.data.id || this.loaded.learnerKey !== learnerKey)) throw new OpenmaicError('identity-changed')
    if (this.config.accountId && this.config.accountId !== data.data.id) throw new OpenmaicError('identity-changed')
    const fresh = { token, accountId: data.data.id, learnerKey, expiresAt: this.expires(token), baseUrl: this.baseUrl, accountBaseUrl: this.accountBaseUrl }
    await this.store.save(fresh)
    this.loaded = fresh
    return fresh
  }
  private async auth(signal: AbortSignal, force = false): Promise<z.infer<typeof authSchema>> {
    if (this.renewal) return this.renewal
    if (!this.loaded) {
      const saved = authSchema.safeParse(await this.store.load())
      if (saved.success && saved.data.baseUrl === this.baseUrl && saved.data.accountBaseUrl === this.accountBaseUrl) this.loaded = saved.data
      else if (this.config.tokenRef) {
        const token = await this.store.resolve(this.config.tokenRef)
        if (token) { const learnerKey = await this.learner(token, signal); this.loaded = { token, learnerKey, accountId: learnerKey.slice(5), expiresAt: this.expires(token), baseUrl: this.baseUrl, accountBaseUrl: this.accountBaseUrl } }
      }
    }
    if (this.renewal) return this.renewal
    if (!force && this.loaded && this.loaded.expiresAt - this.now() >= 86400000) return this.loaded
    const renewal = this.renew(signal)
    this.renewal = renewal
    try { return await renewal } finally { if (this.renewal === renewal) this.renewal = undefined }
  }
  /**
   * Read safe current account facts after renewal when less than 24 hours remain.
   * @param signal - Cancellation for authorized account operations.
   * @returns Verified account identity without secret values.
   */
  async identity(signal: AbortSignal): Promise<OpenmaicIdentity> { return boundedOpenmaicOperation(signal, this.operationTimeoutMs, async signal => { const { token: _token, accountBaseUrl: _accountBase, ...identity } = await this.auth(signal); return identity }) }
  /**
   * Read authorized persistence JSON without login loops for permission or not-found refusals.
   * @param path - Same-origin persistence API path without a query or fragment.
   * @param signal - Cancellation for this source read.
   * @returns Original official source JSON without evaluating learning results.
   */
  async read(path: string, signal: AbortSignal): Promise<unknown> {
    let url: URL
    try { url = new URL(path, this.baseUrl) } catch { throw new OpenmaicError('unsafe-origin') }
    if (!path.startsWith('/api/persistence/') || !url.pathname.startsWith('/api/persistence/') || url.origin !== new URL(this.baseUrl).origin || url.search || url.hash) throw new OpenmaicError('unsafe-origin')
    return this.request(path, {}, signal)
  }
  /**
   * Request the same-origin service; safe reads retry a 401 once, submissions never replay.
   * @param path - Official service path or same-origin URL.
   * @param init - Non-secret request payload and options; Host adds authorization.
   * @param signal - Cancellation for this request and renewal.
   * @returns Official response JSON.
   */
  async request(path: string, init: RequestInit, signal: AbortSignal): Promise<unknown> {
    return boundedOpenmaicOperation(signal, this.operationTimeoutMs, signal => this.performRequest(path, init, signal))
  }
  private async performRequest(path: string, init: RequestInit, signal: AbortSignal): Promise<unknown> {
    let url: URL
    try { url = new URL(path, `${this.baseUrl}/`) } catch { throw new OpenmaicError('unsafe-origin') }
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== new URL(this.baseUrl).origin || url.username || url.password || url.hash) throw new OpenmaicError('unsafe-origin')
    let auth = await this.auth(signal)
    const send = () => this.wire(url.href, { ...init, headers: { ...Object.fromEntries(new Headers(init.headers)), cookie: `auth_token=${auth.token}${this.accessCookie ? `; openmaic_access=${this.accessCookie}` : ''}` } }, signal, response => this.body(response))
    try { return await send() }
    catch (error) {
      if (!(error instanceof OpenmaicError) || error.status !== 401 || !['GET', 'HEAD'].includes((init.method ?? 'GET').toUpperCase())) throw error
      auth = await this.auth(signal, true)
      return send()
    }
  }
  /**
   * Verify the separate generation access code without exposing its value to a tool.
   * @param signal - Cancellation for access verification.
   */
  async prepareGeneration(signal: AbortSignal): Promise<void> {
    return boundedOpenmaicOperation(signal, this.operationTimeoutMs, signal => this.verifyAccess(signal))
  }
  private async verifyAccess(signal: AbortSignal): Promise<void> {
    const code = this.config.accessCodeRef ? await this.store.resolve(this.config.accessCodeRef) : undefined
    if (!code) return
    const auth = await this.auth(signal)
    await this.wire(`${this.baseUrl}/api/access-code/verify`, { method: 'POST', headers: { 'content-type': 'application/json', cookie: `auth_token=${auth.token}` }, body: JSON.stringify({ code }) }, signal, async response => {
      const result = jsonObject.safeParse(await this.body(response))
      if (!result.success || result.data.success === false) throw new OpenmaicError('permission-denied')
      this.accessCookie = /(?:^|[;,\s])openmaic_access=([^;,\s]+)/u.exec(response.headers.get('set-cookie') ?? '')?.[1] ?? ''
    })
  }
  /**
   * Build an official browser sign-in recovery URL, separate from Host renewal.
   * @param classroomId - Original classroom identity to resume after sign-in.
   * @returns A safe parent-sign-in URL with no token.
   */
  browserHandoff(classroomId: string): { url: string; automatic: false } {
    const classroom = new URL(`/classroom/${encodeURIComponent(classroomId)}`, this.baseUrl)
    return { url: `${this.baseUrl}/api/auth/login?from=${encodeURIComponent(classroom.href)}`, automatic: false }
  }
}
