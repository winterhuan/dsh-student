/** Deterministic native Harness + HTTPS acceptance fixture, loaded only by the isolated test. */
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { randomBytes, randomUUID } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { request } from 'node:https'
import { join } from 'node:path'
import { setTimeout } from 'node:timers/promises'

const runtime = createRequire(process.env.STUDENT_TEST_DSH_BIN)
const { LlmAdapter } = await import(runtime.resolve('@deepseek-ai/dsh-llm'))
const { defineTool } = await import(runtime.resolve('@deepseek-ai/dsh-tools'))
export const inject = ['llm', 'tools', 'studentTextbooks']

export function apply(ctx, config) {
  const calls = []
  let failParse = false
  class Fixture extends LlmAdapter {
    async listModels(provider) { return [{ provider, id: 'textbook-fixture', name: 'Textbook fixture', inputModalities: ['text', 'image'], contextWindow: 128000, maxTokens: 8000 }] }
    async *stream(options) {
      const names = (options.tools ?? []).map(tool => tool.name)
      const parser = names.includes('textbook_submit')
      if (!parser && !config.ui) assert.ok(names.includes('verify_textbooks'), `Missing verification tool; service ready: ${!!ctx.studentTextbooks}; tools: ${names.join(',')}`)
      calls.push({ parser, tools: names })
      if (parser) {
        assert.deepEqual(names, ['textbook_submit'], 'Parsing must not receive shell, general file or admin tools')
        if (failParse) throw new Error('Deterministic provider offline')
      }
      if (options.messages.at(-1)?.role === 'tool' || config.ui && !parser) {
        yield { type: 'block-start', index: 0, blockType: 'text' }
        yield { type: 'text-delta', index: 0, text: 'Saved.' }
        yield { type: 'block-end', index: 0, block: { type: 'text', text: 'Saved.' } }
        yield { type: 'finish', reason: { kind: 'stop' } }
        return
      }
      const name = parser ? 'textbook_submit' : 'verify_textbooks'
      const args = parser ? { markdown: ['# 完整课文', '$a < b$', '|字|音|\n|---|---|\n|学|xué|', '![插图](asset:1)'].join('\n\n'), issues: ['请核对原图中的小字'], crops: [{ left: 10, top: 10, width: 40, height: 30 }] } : {}
      const id = randomUUID()
      yield { type: 'block-start', index: 0, blockType: 'tool-call' }
      yield { type: 'tool-call-delta', index: 0, id, name, argumentsDelta: JSON.stringify(args) }
      yield { type: 'block-end', index: 0, block: { type: 'tool-call', id, name, arguments: JSON.stringify(args) } }
      yield { type: 'finish', reason: { kind: 'tool-calls' } }
    }
  }
  ctx.effect(() => ctx.tools.register(defineTool({
    name: 'verify_textbooks', description: 'Run deterministic isolated textbook acceptance.', parameters: {},
    output: { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
    async execute(_args, exec) {
      const agent = exec.agent
      const service = ctx.studentTextbooks
      const pair = service.pair(agent)
      const cert = await readFile(config.cert)
      const device = { code: pair.code, id: randomUUID(), name: 'Test phone', token: randomBytes(32).toString('base64url') }
      const token = `Bearer ${device.id}.${device.token}`
      async function http(path, body, authorization = token, headers = {}) {
        const bytes = body === undefined ? undefined : Buffer.isBuffer(body) ? body : Buffer.from(JSON.stringify(body))
        return new Promise((resolve, reject) => {
          const req = request(pair.url + path, { ca: cert, method: bytes ? 'POST' : 'GET', headers: { ...(authorization ? { authorization } : {}), ...(bytes ? { 'content-length': bytes.length, 'content-type': 'application/json' } : {}), ...headers } }, res => {
            const chunks = []; res.on('data', bytes => chunks.push(bytes)); res.on('error', reject); res.on('end', () => { const bytes = Buffer.concat(chunks); resolve({ status: res.statusCode, bytes, json: res.headers['content-type']?.includes('json') ? JSON.parse(bytes) : undefined }) })
          })
          req.on('error', reject); req.end(bytes)
        })
      }
      assert.equal((await http('/command', { action: 'list' }, '')).status, 401)
      assert.equal((await http('/pair', device, '')).status, 200)
      assert.equal((await http('/pair', device, '')).status, 200, 'Pairing retries are idempotent')
      assert.equal((await http('/pair', { ...device, id: randomUUID() }, '')).status, 401)
      assert.equal((await http('/command', { action: 'list' }, token, { origin: 'https://evil.invalid' })).status, 401)
      assert.equal((await http('/command', { action: 'list', workspace: '/tmp' })).status, 400)
      assert.equal((await http('/command', { action: 'create', id: 'book', title: '测试课本', subject: 'math', expectedPages: 1 })).status, 200)
      const photo = await readFile(config.photo)
      const uploadPath = '/upload?bookId=book&pageId=page-1&position=1&printedPage=1'
      let page = (await http(uploadPath, photo)).json.page
      assert.equal((await http(uploadPath, photo)).json.page.revision, page.revision)
      assert.equal((await http('/file?bookId=book&pageId=page-1&kind=original')).bytes.compare(photo), 0)
      const command = body => service.command(agent, body)
      const job = { action: 'queue', bookId: 'book', pageId: page.id, revision: page.revision, requestId: 'parse-first' }
      await command(job)
      async function waitFor(status) {
        const deadline = Date.now() + 30000
        do { const reply = await command({ action: 'page', bookId: 'book', pageId: 'page-1' }); if (reply.page.status === status) return reply; if (reply.page.status === 'failed') throw new Error(JSON.stringify({ page: reply.page, calls })); await setTimeout(100) } while (Date.now() < deadline)
        throw new Error(`Page never reached ${status}`)
      }
      let result = await waitFor('review')
      assert.match(result.markdown, /完整课文/u)
      assert.match(result.markdown, /\.\.\/assets\//u)
      assert.equal((await command(job)).page.revision, result.page.revision, 'Lost queue acknowledgments must not run the model twice')
      assert.equal((await http('/file?bookId=book&pageId=page-1&kind=asset&index=0&revision=0')).status, 409)
      const asset = await http(`/file?bookId=book&pageId=page-1&kind=asset&index=0&revision=${result.page.revision}`)
      assert.equal(asset.status, 200)
      assert.ok(asset.bytes.length > 50)
      const revision = result.page.revision
      result = await command({ action: 'edit', bookId: 'book', pageId: 'page-1', revision, markdown: '# 人工校对后的完整课文', position: 1, printedPage: '1', confirm: true, useCandidate: false })
      assert.equal((await http('/command', { action: 'edit', bookId: 'book', pageId: 'page-1', revision, markdown: 'stale', position: 1, printedPage: '1', confirm: true, useCandidate: false })).status, 409)
      const book = (await command({ action: 'book', bookId: 'book' })).book
      assert.ok((await command({ action: 'complete', bookId: 'book', revision: book.revision })).book.confirmedAt)
      await command({ action: 'queue', bookId: 'book', pageId: 'page-1', revision: result.page.revision, requestId: 'parse-again' })
      result = await waitFor('review')
      assert.equal(result.markdown, '# 人工校对后的完整课文')
      assert.match(result.candidateMarkdown, /完整课文/u)
      failParse = true
      await command({ action: 'queue', bookId: 'book', pageId: 'page-1', revision: result.page.revision, requestId: 'parse-offline' })
      result = await waitFor('failed')
      assert.equal(result.markdown, '# 人工校对后的完整课文')
      assert.equal((await http('/file?bookId=book&pageId=page-1&kind=original')).bytes.compare(photo), 0)
      await service.devices(agent, device.id)
      assert.equal((await http('/command', { action: 'list' })).status, 401)
      const evidence = { ok: true, parsingCalls: calls.filter(call => call.parser).length, parserTools: calls.find(call => call.parser).tools, assertions: ['TLS authentication', 'one-time pairing and retry', 'origin rejection', 'workspace isolation', 'durable image upload', 'native restricted parsing', 'Markdown and crops', 'idempotent jobs', 'revision conflicts', 'human correction preservation', 'provider failure', 'device revocation'] }
      await writeFile(config.result, JSON.stringify(evidence, null, 2))
      return evidence
    },
  })))
  ctx.effect(() => ctx.llm.registerAdapter(['textbook-fixture'], new Fixture()))
  ctx.provide('textbookAcceptanceReady', true)
}
