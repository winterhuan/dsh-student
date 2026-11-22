import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:http'
import { chromium } from 'playwright-core'
import { expect, it, onTestFinished } from 'vitest'
import { OpenmaicBrowser } from '../src/openmaic/browser.ts'

it('reopens its persisted sign-in, renews expiring playback and disposes every owned browser', async () => {
  let logins = 0
  let now = Date.now()
  let root: string | undefined
  const browsers: OpenmaicBrowser[] = []
  const closed: boolean[] = []
  const server = createServer(async (req, res) => {
    const url = new URL(req.url!, 'http://localhost')
    if (url.pathname === '/api/auth/login') { res.writeHead(302, { location: '/signin' }); res.end(); return }
    if (url.pathname === '/signin' && req.method === 'GET') { res.setHeader('content-type', 'text/html; charset=utf-8'); res.end('<form method="post"><input id="account" name="account" placeholder="账号、手机号或邮箱"><input type="password" name="password"><button type="submit">立即登录</button></form>'); return }
    if (url.pathname === '/signin') {
      let body = ''; for await (const part of req) body += String(part)
      const form = new URLSearchParams(body)
      if (form.get('account') !== 'parent' || form.get('password') !== 'fixture-secret') { res.writeHead(403); res.end(); return }
      logins++
      const token = `header.${Buffer.from(JSON.stringify({ exp: (now + 7 * 86400000) / 1000 })).toString('base64url')}.signature`
      res.writeHead(302, { location: '/classroom/stage-one', 'set-cookie': `auth_token=${token}; Path=/; SameSite=Lax; Max-Age=604800` }); res.end(); return
    }
    if (url.pathname === '/api/persistence/learner-key') { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ learnerKey: req.headers.cookie?.includes('auth_token=') ? 'user:parent' : 'anon:guest' })); return }
    res.setHeader('content-type', 'text/html; charset=utf-8'); res.end('<h1>Classroom: count to ten</h1>')
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  onTestFinished(async () => {
    for (const browser of browsers) await browser.dispose()
    server.closeAllConnections()
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
    if (root) await rm(root, { recursive: true, force: true })
  })
  const address = server.address(); if (!address || typeof address === 'string') throw new Error('missing fixture address')
  const baseUrl = `http://127.0.0.1:${address.port}`
  root = await mkdtemp(join(tmpdir(), 'student-openmaic-browser-'))
  const createBrowser = () => {
    const browser = new OpenmaicBrowser({ baseUrl, async identity() { return { baseUrl, learnerKey: 'user:parent', accountId: 'parent', expiresAt: now + 7 * 86400000 } } }, { profileRoot: root!, async credentials() { return { account: 'parent', password: 'fixture-secret' } } }, { now: () => now, async launch(path, options) {
      const context = await chromium.launchPersistentContext(path, { ...options, channel: 'chrome', headless: true })
      const index = closed.push(false) - 1
      context.on('close', () => { closed[index] = true })
      return context
    } })
    browsers.push(browser)
    return browser
  }
  const browser = createBrowser()
  expect(await browser.open('stage-one', new AbortController().signal)).toMatchObject({ status: 'opened', browser: 'dedicated-chrome' })
  await browser.dispose()
  expect(closed).toEqual([true])
  await expect(browser.open('stage-one', new AbortController().signal)).rejects.toMatchObject({ code: 'browser-unavailable' })
  const reopened = createBrowser()
  expect(await reopened.open('stage-one', new AbortController().signal)).toMatchObject({ status: 'opened' })
  expect(logins).toBe(1)
  now += 6 * 86400000 + 1
  expect(await reopened.open('stage-one', new AbortController().signal)).toMatchObject({ status: 'opened' })
  expect(logins).toBe(2)
  await reopened.dispose()
  expect(closed).toEqual([true, true])
})
