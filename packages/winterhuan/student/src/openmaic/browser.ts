/** Dedicated Chrome uses official sign-in; no cookie injection or token-bearing Student link. */
import { createHash } from 'node:crypto'
import { chmod, lstat, mkdir } from 'node:fs/promises'
import { resolve, join } from 'node:path'
import { chromium, type BrowserContext, type Page } from 'playwright-core'
import type { OpenmaicIdentity } from './connection.ts'
import { OpenmaicError } from './connection.ts'
/** Safe account facts provided by the Host connection, without secret values. */
export interface OpenmaicBrowserAccount { baseUrl: string; identity(signal: AbortSignal): Promise<OpenmaicIdentity> }
/** Browser secrets are resolved within Host and never become model parameters. */
export interface OpenmaicBrowserConfig { profileRoot: string; credentials(): Promise<{ account: string; password: string } | undefined> }
/** Browser process factory and clock; production uses installed Chrome. */
export interface OpenmaicBrowserRuntime { launch?: (profile: string, options: NonNullable<Parameters<typeof chromium.launchPersistentContext>[1]>) => Promise<BrowserContext>; now?: () => number }
/** Playback authorization distinguishes open content from a retained parent sign-in window. */
export interface OpenmaicBrowserResult { status: 'opened' | 'login-required' | 'identity-mismatch'; browser: 'dedicated-chrome'; classroomUrl: string; loginUrl?: string; reason?: 'credentials-missing' | 'form-unavailable' | 'callback-pending' }
/** Owns its private browser profile and closes its browser at Host disposal. */
export class OpenmaicBrowser {
  private context: BrowserContext | undefined
  private readonly pages = new Map<string, Page>()
  private serial: Promise<unknown> = Promise.resolve()
  private disposed = false
  private readonly lifetime = new AbortController()
  constructor(private readonly account: OpenmaicBrowserAccount, private readonly config: OpenmaicBrowserConfig, private readonly runtime: OpenmaicBrowserRuntime = {}) {}
  /**
   * Open the original classroom, renewing its browser login inside 24 hours of expiry.
   * @param classroomId - Original official classroom identity.
   * @param signal - Cancellation for this opening operation.
   * @returns Safe playback or parent-sign-in outcome.
   */
  open(classroomId: string, signal: AbortSignal): Promise<OpenmaicBrowserResult> {
    const deadline = AbortSignal.any([signal, this.lifetime.signal, AbortSignal.timeout(30_000)])
    const work = this.serial.then(() => this.perform(classroomId, deadline))
    this.serial = work.catch((_error: unknown) => { /* The returned operation owns its failure; later opens remain available. */ })
    return work
  }
  private async browser(identity: OpenmaicIdentity): Promise<BrowserContext> {
    if (this.disposed) throw new OpenmaicError('browser-unavailable')
    if (this.context) return this.context
    const root = resolve(this.config.profileRoot)
    await mkdir(root, { recursive: true, mode: 0o700 })
    const info = await lstat(root)
    if (!info.isDirectory() || info.isSymbolicLink()) throw new OpenmaicError('browser-unavailable')
    if (process.platform !== 'win32') await chmod(root, 0o700)
    const profile = join(root, createHash('sha256').update(JSON.stringify([identity.baseUrl, identity.accountId, identity.learnerKey])).digest('hex'))
    await mkdir(profile, { recursive: true, mode: 0o700 })
    const profileInfo = await lstat(profile)
    if (!profileInfo.isDirectory() || profileInfo.isSymbolicLink()) throw new OpenmaicError('browser-unavailable')
    if (process.platform !== 'win32') await chmod(profile, 0o700)
    const launch = this.runtime.launch ?? ((path, options) => chromium.launchPersistentContext(path, options))
    const context = await launch(profile, { env: Object.fromEntries(Object.entries(process.env).filter(([name, value]) => value !== undefined && !/KEY|SECRET|TOKEN|PASSWORD/iu.test(name))), channel: 'chrome', headless: false, viewport: null, acceptDownloads: false, timeout: 30_000 })
    if (this.disposed) { await context.close(); throw new OpenmaicError('browser-unavailable') }
    context.on('close', () => { if (this.context === context) { this.context = undefined; this.pages.clear() } })
    this.context = context
    return context
  }
  private async learner(page: Page): Promise<string | undefined> {
    const result = await page.evaluate(async () => {
      const response = await fetch('/api/persistence/learner-key', { credentials: 'same-origin', signal: AbortSignal.timeout(30_000) })
      if (!response.ok) return undefined
      const value: unknown = await response.json()
      return typeof value === 'object' && value !== null && 'learnerKey' in value && typeof value.learnerKey === 'string' ? value.learnerKey : undefined
    })
    return result
  }
  private async perform(classroomId: string, signal: AbortSignal): Promise<OpenmaicBrowserResult> {
    signal.throwIfAborted()
    if (!/^[a-zA-Z0-9_-]{1,200}$/u.test(classroomId)) throw new OpenmaicError('invalid-response')
    const identity = await this.account.identity(signal)
    const classroomUrl = new URL(`/classroom/${classroomId}`, identity.baseUrl).href
    const loginUrl = `${identity.baseUrl}/api/auth/login?from=${encodeURIComponent(classroomUrl)}`
    let page: Page | undefined
    try {
      const browser = await this.browser(identity)
      page = this.pages.get(classroomId)
      if (!page || page.isClosed()) { page = await browser.newPage(); this.pages.set(classroomId, page) }
      const target = page
      const aborted = () => { void target.close().catch((_error: unknown) => { /* User closure already stopped this operation. */ }) }
      signal.addEventListener('abort', aborted, { once: true })
      try {
        await page.goto(classroomUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
        signal.throwIfAborted()
        const learner = await this.learner(page)
        signal.throwIfAborted()
        if (learner?.startsWith('user:') && learner !== identity.learnerKey) return { status: 'identity-mismatch', browser: 'dedicated-chrome', classroomUrl }
        const cookie = (await browser.cookies(identity.baseUrl)).find(item => item.name === 'auth_token')
        let expiresAt = 0
        try { const payload: unknown = JSON.parse(Buffer.from(cookie?.value.split('.')[1] ?? '', 'base64url').toString()); if (typeof payload === 'object' && payload !== null && 'exp' in payload && typeof payload.exp === 'number') expiresAt = payload.exp * 1000 } catch (_error: unknown) { /* Missing or malformed browser authorization requires official sign-in. */ }
        if (learner === identity.learnerKey && expiresAt - (this.runtime.now ?? Date.now)() >= 86400000) { await page.bringToFront(); return { status: 'opened', browser: 'dedicated-chrome', classroomUrl } }
        await page.goto(loginUrl, { waitUntil: 'domcontentloaded', timeout: 30000 })
        const accountOrigin = new URL(page.url()).origin
        if (accountOrigin !== 'https://maic.chat' && accountOrigin !== new URL(identity.baseUrl).origin) throw new OpenmaicError('unsafe-origin')
        const credentials = await this.config.credentials()
        if (!credentials) return { status: 'login-required', browser: 'dedicated-chrome', classroomUrl, loginUrl, reason: 'credentials-missing' }
        try { await page.locator('[role=tab], input[type="password"]').first().waitFor({ state: 'visible', timeout: 30000 }) } catch (_error: unknown) { return { status: 'login-required', browser: 'dedicated-chrome', classroomUrl, loginUrl, reason: 'form-unavailable' } }
        const password = page.locator('input[type="password"]').first()
        if (!(await password.isVisible())) {
          const switcher = page.getByRole('tab', { name: '账号密码登录', exact: true })
          if (await switcher.isVisible()) await switcher.click()
        }
        try { await password.waitFor({ state: 'visible', timeout: 30000 }) } catch (_error: unknown) { return { status: 'login-required', browser: 'dedicated-chrome', classroomUrl, loginUrl, reason: 'form-unavailable' } }
        signal.throwIfAborted()
        await page.locator('input[placeholder="账号、手机号或邮箱"]').fill(credentials.account)
        await password.fill(credentials.password)
        const agreement = page.locator('input[type="checkbox"]').first()
        if (await agreement.isVisible() && !(await agreement.isChecked())) await agreement.check()
        await page.getByRole('button', { name: '立即登录', exact: true }).click()
        try { await page.waitForURL(url => url.origin === new URL(identity.baseUrl).origin && url.pathname === `/classroom/${classroomId}` && !url.searchParams.has('token'), { timeout: 30000, waitUntil: 'domcontentloaded' }) }
        catch (_error: unknown) { return { status: 'login-required', browser: 'dedicated-chrome', classroomUrl, loginUrl, reason: 'callback-pending' } }
        signal.throwIfAborted()
        const confirmed = await this.learner(page)
        signal.throwIfAborted()
        await page.bringToFront()
        return { status: confirmed === identity.learnerKey ? 'opened' : confirmed?.startsWith('user:') ? 'identity-mismatch' : 'login-required', browser: 'dedicated-chrome', classroomUrl, ...(confirmed === identity.learnerKey ? {} : { loginUrl }) }
      } finally { signal.removeEventListener('abort', aborted) }
    } catch (error) { if (signal.aborted) { if (page && !page.isClosed()) await page.close(); signal.throwIfAborted() } if (error instanceof OpenmaicError) throw error; throw new OpenmaicError('browser-unavailable') }
  }
  /** Cancel queued and active operations, close owned Chrome, then await quiescence. */
  async dispose(): Promise<void> { this.disposed = true; this.lifetime.abort(new OpenmaicError('browser-unavailable')); await this.context?.close(); await this.serial; this.context = undefined; this.pages.clear() }
}
