import { describe, expect, it } from 'vitest'
import { OpenmaicConnection, type OpenmaicSecretStore } from '../src/openmaic/connection.ts'

const token = (exp: number) => `test.${Buffer.from(JSON.stringify({ exp })).toString('base64url')}.signature`
function store(): OpenmaicSecretStore {
  let value: unknown
  return { async resolve(ref) { return { account: 'parent', password: 'fixture-secret', access: 'fixture-access' }[ref] }, async load() { return value }, async save(next) { value = structuredClone(next) } }
}
const config = { baseUrl: 'https://classroom.test', accountBaseUrl: 'https://account.test/api', accountRef: 'account', passwordRef: 'password', accessCodeRef: 'access', tokenRef: '', accountId: '' }
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json' } })

describe('Host authorized OpenMAIC connection', () => {
  it('renews one account once for simultaneous reads inside the 24 hour threshold', async () => {
    let logins = 0
    let now = 0
    const external: typeof fetch = async (url) => {
      const path = new URL(String(url)).pathname
      if (path.endsWith('get_public_key')) return json({ is_success: true, data: 'key' })
      if (path.endsWith('/user/login')) { logins++; return json({ is_success: true, data: { token: token((now + 7 * 86400000) / 1000), id: 'account-1' } }) }
      if (path.endsWith('/learner-key')) return json({ learnerKey: 'user:account-1' })
      return json({ records: ['submitted'] })
    }
    const connection = new OpenmaicConnection(config, store(), { fetch: external, now: () => now, encryptPassword: async () => 'encrypted' })
    const identities = await Promise.all([connection.identity(new AbortController().signal), connection.identity(new AbortController().signal)])
    expect(identities).toMatchObject([{ learnerKey: 'user:account-1' }, { learnerKey: 'user:account-1' }])
    expect(logins).toBe(1)
    now = 6 * 86400000 + 1
    const answers = await Promise.all([connection.read('/api/persistence/test', new AbortController().signal), connection.read('/api/persistence/test', new AbortController().signal)])
    expect(answers).toEqual([{ records: ['submitted'] }, { records: ['submitted'] }])
    expect(logins).toBe(2)
    expect(JSON.stringify(await connection.identity(new AbortController().signal))).not.toContain('fixture-secret')
  })
})

import { OpenmaicGeneration } from '../src/openmaic/generation.ts'
it('persists the generation identity before returning and resumes it after a Host restart', async () => {
  let submissions = 0
  let saved: unknown
  const external: typeof fetch = async (url) => {
    const path = new URL(String(url)).pathname
    if (path.endsWith('get_public_key')) return json({ is_success: true, data: 'key' })
    if (path.endsWith('/user/login')) return json({ is_success: true, data: { token: token(7 * 86400), id: 'account-1' } })
    if (path.endsWith('/learner-key')) return json({ learnerKey: 'user:account-1' })
    if (path === '/api/generate-classroom') { submissions++; return json({ jobId: 'job-1', pollUrl: '/api/generate-classroom/job-1', status: 'queued' }, 202) }
    return json({ jobId: 'job-1', status: 'succeeded', result: { classroomId: 'stage-1', url: 'https://classroom.test/classroom/stage-1' } })
  }
  const connection = new OpenmaicConnection(config, store(), { fetch: external, now: () => 0, encryptPassword: async () => 'encrypted' })
  const jobs = { async load() { return saved }, async save(_owner: unknown, value: unknown) { saved = structuredClone(value) } }
  const request = { learnerId: 'student-1', termId: 'term-1', blockId: 'block-1', requirement: 'Count to ten' }
  expect(await new OpenmaicGeneration(connection, jobs).run(request, new AbortController().signal)).toMatchObject({ status: 'generating', jobId: 'job-1' })
  expect(await new OpenmaicGeneration(connection, jobs).run({ ...request, jobId: 'job-1' }, new AbortController().signal)).toMatchObject({ status: 'ready', classroomId: 'stage-1' })
  expect(submissions).toBe(1)
  await expect(new OpenmaicGeneration(connection, jobs).run({ ...request, learnerId: 'other-child', jobId: 'job-1' }, new AbortController().signal)).rejects.toMatchObject({ code: 'identity-changed' })
})

it('retries a confirmed expired authorization once, while permission refusals never restart login', async () => {
  let logins = 0
  let reads = 0
  let denied = false
  const external: typeof fetch = async (url) => {
    const path = new URL(String(url)).pathname
    if (path.endsWith('get_public_key')) return json({ is_success: true, data: 'key' })
    if (path.endsWith('/user/login')) { logins++; return json({ is_success: true, data: { token: token(7 * 86400), id: 'account-1' } }) }
    if (path.endsWith('/learner-key')) return json({ learnerKey: 'user:account-1' })
    reads++
    if (denied) return json({ message: 'fixture-secret' }, 403)
    return reads === 1 ? json({ message: 'fixture-secret' }, 401) : json({ answer: 'B' })
  }
  const connection = new OpenmaicConnection(config, store(), { fetch: external, now: () => 0, encryptPassword: async () => 'encrypted' })
  expect(await connection.read('/api/persistence/test', new AbortController().signal)).toEqual({ answer: 'B' })
  expect(logins).toBe(2)
  denied = true
  await expect(connection.read('/api/persistence/test', new AbortController().signal)).rejects.toMatchObject({ code: 'permission-denied' })
  expect(logins).toBe(2)
  await expect(connection.read('//other.test/api/persistence/test', new AbortController().signal)).rejects.toMatchObject({ code: 'unsafe-origin' })
  await expect(connection.read('/api/persistence/../../private', new AbortController().signal)).rejects.toMatchObject({ code: 'unsafe-origin' })
})

it('preserves the old learner cache when renewal resolves a different account partition', async () => {
  let now = 0
  let changed = false
  let saved: unknown
  const secrets = { ...store(), async load() { return saved }, async save(value: unknown) { saved = structuredClone(value) } }
  const external: typeof fetch = async (url) => {
    const path = new URL(String(url)).pathname
    if (path.endsWith('get_public_key')) return json({ is_success: true, data: 'key' })
    if (path.endsWith('/user/login')) return json({ is_success: true, data: { token: token((now + 7 * 86400000) / 1000), id: 'account-1' } })
    return json({ learnerKey: changed ? 'user:other-child' : 'user:account-1' })
  }
  const connection = new OpenmaicConnection(config, secrets, { fetch: external, now: () => now, encryptPassword: async () => 'encrypted' })
  await connection.identity(new AbortController().signal)
  changed = true; now = 7 * 86400000
  await expect(connection.identity(new AbortController().signal)).rejects.toMatchObject({ code: 'identity-changed' })
  expect(saved).toMatchObject({ learnerKey: 'user:account-1' })
})

it('requires an explicit account partition when official login offers more than one', async () => {
  let selected: unknown
  const external: typeof fetch = async (url, init) => {
    const path = new URL(String(url)).pathname
    if (path.endsWith('get_public_key')) return json({ is_success: true, data: 'key' })
    if (path.endsWith('/user/login')) return json({ is_success: true, data: { auth_token: 'fixture-selection-secret', accounts: [{ account_user_id: 'parent-one' }, { account_user_id: 'parent-two' }] } })
    if (path.endsWith('/account/sign')) { selected = JSON.parse(String(init?.body)); return json({ is_success: true, data: { token: token(7 * 86400), id: 'parent-two' } }) }
    return json({ learnerKey: 'user:parent-two' })
  }
  const runtime = { fetch: external, now: () => 0, encryptPassword: async () => 'encrypted' }
  await expect(new OpenmaicConnection(config, store(), runtime).identity(new AbortController().signal)).rejects.toMatchObject({ code: 'login-challenge' })
  expect(selected).toBeUndefined()
  const identity = await new OpenmaicConnection({ ...config, accountId: 'parent-two' }, store(), runtime).identity(new AbortController().signal)
  expect(identity).toMatchObject({ accountId: 'parent-two', learnerKey: 'user:parent-two' })
  expect(selected).toMatchObject({ account_user_id: 'parent-two' })
  expect(JSON.stringify(identity)).not.toContain('fixture-selection-secret')
})

it('retains an unknown submission and never creates another classroom when its response is lost', async () => {
  let submissions = 0
  let saved: unknown
  const external: typeof fetch = async (url) => {
    const path = new URL(String(url)).pathname
    if (path.endsWith('get_public_key')) return json({ is_success: true, data: 'key' })
    if (path.endsWith('/user/login')) return json({ is_success: true, data: { token: token(7 * 86400), id: 'account-1' } })
    if (path.endsWith('/learner-key')) return json({ learnerKey: 'user:account-1' })
    if (path.endsWith('/access-code/verify')) return json({ success: true })
    submissions++; throw new Error('Lost response after server acceptance')
  }
  const connection = new OpenmaicConnection(config, store(), { fetch: external, now: () => 0, encryptPassword: async () => 'encrypted' })
  const jobs = { async load() { return saved }, async save(_owner: unknown, value: unknown) { saved = structuredClone(value) } }
  const input = { learnerId: 'student-1', termId: 'term-1', blockId: 'block-1', requirement: 'Count to ten' }
  await expect(new OpenmaicGeneration(connection, jobs).run(input, new AbortController().signal)).rejects.toMatchObject({ code: 'service-unavailable' })
  await expect(new OpenmaicGeneration(connection, jobs).run(input, new AbortController().signal)).rejects.toMatchObject({ code: 'generation-unknown' })
  expect(submissions).toBe(1)
})
