/** Authorized official-service reads and recoverable generation; never writes learning records. */
import { constants, publicEncrypt } from 'node:crypto'
import { z } from 'zod'
import { normalizeOpenmaicBase } from '../openmaic.ts'

/** Host configuration carries credential references rather than secret values. */
export interface OpenmaicConnectionConfig { baseUrl: string; accountBaseUrl: string; accountRef: string; passwordRef: string; accessCodeRef: string; tokenRef: string; accountId: string }
/** Private storage implemented by the DSH credential provider. */
export interface OpenmaicSecretStore { resolve(ref: string): Promise<string | undefined>; load(): Promise<unknown>; save(value: unknown): Promise<void> }
/** External wire and clock dependencies; production uses Node fetch and RSA-OAEP. */
export interface OpenmaicNetwork { fetch?: typeof fetch; now?: () => number; encryptPassword?: (password: string, key: string) => Promise<string> }
const authSchema = z.object({ token: z.string().min(1), accountId: z.string().min(1), learnerKey: z.string().min(1), expiresAt: z.number(), baseUrl: z.string(), accountBaseUrl: z.string() })
const jsonObject = z.record(z.string(), z.unknown())
/** Credential failures expose only actionable codes, never server messages or secret payloads. */
export class OpenmaicError extends Error {
  constructor(readonly code: 'login-required' | 'login-challenge' | 'identity-changed' | 'permission-denied' | 'not-found' | 'service-unavailable' | 'invalid-response' | 'unsafe-origin' | 'generation-unknown' | 'browser-unavailable', readonly status?: number) { super(`OpenMAIC ${code}. ${code === 'login-required' || code === 'login-challenge' ? 'A parent can restore authorization using the official sign-in page or Host credential settings.' : 'Keep the current activity and retry its existing identity after checking the service.'}`) }
}
/** Safe public account identity; no access code, password or token crosses this view. */
export interface OpenmaicIdentity { baseUrl: string; accountId: string; learnerKey: string; expiresAt: number }

/** Same-account login renewal is serialized and replacement follows learner verification. */
export class OpenmaicConnection {
  /** Normalized official classroom origin used by tools and safe links. */
  readonly baseUrl: string
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
  }
  private async wire(url: string, init: RequestInit, signal: AbortSignal): Promise<Response> {
    signal.throwIfAborted()
    try { return await this.external(url, { ...init, signal, redirect: 'error' }) }
    catch (error) { if (signal.aborted) throw error; throw new OpenmaicError('service-unavailable') }
  }
  private async body(response: Response): Promise<unknown> {
    if (!response.ok) throw new OpenmaicError(response.status === 401 ? 'login-required' : response.status === 403 ? 'permission-denied' : response.status === 404 ? 'not-found' : 'service-unavailable', response.status)
    try { return await response.json() }
    catch { throw new OpenmaicError('invalid-response') }
  }
  private async account(path: string, input: unknown, signal: AbortSignal): Promise<unknown> {
    const reply = jsonObject.safeParse(await this.body(await this.wire(`${this.accountBaseUrl}/${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(input) }, signal)))
    if (!reply.success) throw new OpenmaicError('invalid-response')
    const data = 'content' in reply.data ? jsonObject.safeParse(reply.data.content) : reply
    if (!data.success || data.data.is_success !== true) throw new OpenmaicError('login-challenge')
    return data.data.data
  }
  private async learner(token: string, signal: AbortSignal): Promise<string> {
    const data = jsonObject.safeParse(await this.body(await this.wire(`${this.baseUrl}/api/persistence/learner-key`, { headers: { cookie: `auth_token=${token}` } }, signal)))
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
  async identity(signal: AbortSignal): Promise<OpenmaicIdentity> { const { token: _token, accountBaseUrl: _accountBase, ...identity } = await this.auth(signal); return identity }
  /**
   * Read authorized persistence JSON without login loops for permission or not-found refusals.
   * @param path - Same-origin persistence API path without a query or fragment.
   * @param signal - Cancellation for this source read.
   * @returns Original official source JSON without evaluating learning results.
   */
  async read(path: string, signal: AbortSignal): Promise<unknown> {
    const url = new URL(path, this.baseUrl)
    if (!path.startsWith('/api/persistence/') || !url.pathname.startsWith('/api/persistence/') || url.origin !== new URL(this.baseUrl).origin || url.search || url.hash) throw new OpenmaicError('unsafe-origin')
    return this.request(path, {}, signal)
  }
  /**
   * Request the same-origin service; retry a confirmed 401 once with a verified login.
   * @param path - Official service path or same-origin URL.
   * @param init - Non-secret request payload and options; Host adds authorization.
   * @param signal - Cancellation for this request and renewal.
   * @returns Official response JSON.
   */
  async request(path: string, init: RequestInit, signal: AbortSignal): Promise<unknown> {
    const url = new URL(path, `${this.baseUrl}/`)
    if (url.origin !== new URL(this.baseUrl).origin || url.username || url.password || url.hash) throw new OpenmaicError('unsafe-origin')
    let auth = await this.auth(signal)
    let response = await this.wire(url.href, { ...init, headers: { ...Object.fromEntries(new Headers(init.headers)), cookie: `auth_token=${auth.token}${this.accessCookie ? `; openmaic_access=${this.accessCookie}` : ''}` } }, signal)
    if (response.status === 401) { auth = await this.auth(signal, true); response = await this.wire(url.href, { ...init, headers: { ...Object.fromEntries(new Headers(init.headers)), cookie: `auth_token=${auth.token}${this.accessCookie ? `; openmaic_access=${this.accessCookie}` : ''}` } }, signal) }
    return this.body(response)
  }
  /**
   * Verify the separate generation access code without exposing its value to a tool.
   * @param signal - Cancellation for access verification.
   */
  async prepareGeneration(signal: AbortSignal): Promise<void> {
    const code = this.config.accessCodeRef ? await this.store.resolve(this.config.accessCodeRef) : undefined
    if (!code) return
    const auth = await this.auth(signal)
    const response = await this.wire(`${this.baseUrl}/api/access-code/verify`, { method: 'POST', headers: { 'content-type': 'application/json', cookie: `auth_token=${auth.token}` }, body: JSON.stringify({ code }) }, signal)
    const result = jsonObject.safeParse(await this.body(response))
    if (!result.success || result.data.success === false) throw new OpenmaicError('permission-denied')
    this.accessCookie = /(?:^|[;,\s])openmaic_access=([^;,\s]+)/u.exec(response.headers.get('set-cookie') ?? '')?.[1] ?? ''
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
