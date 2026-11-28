/** Build-dependent, keyless acceptance through a real isolated DSH headless profile. */
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { mkdtemp, mkdir, readFile, realpath, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { createServer } from 'node:net'
import sharp from 'sharp'

const exec = promisify(execFile)
const root = await mkdtemp(join(tmpdir(), 'student-textbook-native-'))
const cwd = join(root, 'workspace')
await mkdir(cwd)
const dshBin = await realpath((await exec('which', ['dsh'])).stdout.trim())
const env = { ...process.env, DSH_HOME: join(root, 'home'), DSH_AGENTS_HOME: join(root, 'agents'), DSH_TELEMETRY_DISABLED: '1', STUDENT_TEST_DSH_BIN: dshBin }
const dsh = (...args) => exec(process.execPath, [dshBin, ...args], { cwd, env, timeout: 180000, maxBuffer: 16 * 1024 * 1024 })
const cert = join(root, 'cert.pem'), key = join(root, 'key.pem'), result = join(root, 'result.json'), photo = join(root, 'page.png')
await exec('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', cert, '-days', '1', '-subj', '/CN=127.0.0.1', '-addext', 'subjectAltName=IP:127.0.0.1'])
await sharp({ create: { width: 120, height: 160, channels: 3, background: '#ffffff' } }).png().toFile(photo)
const probe = createServer()
await new Promise(resolve => probe.listen(0, '127.0.0.1', resolve))
const port = probe.address().port
await new Promise(resolve => probe.close(resolve))
await dsh('--profile', 'textbook-test', '--from-default-profile', 'headless', '--dump-config')
const packed = JSON.parse((await exec('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', root], { cwd: fileURLToPath(new URL('..', import.meta.url)) })).stdout)[0]
await dsh('plugin', '--profile', 'textbook-test', 'add', join(root, packed.filename))
const patch = join(root, 'test.patch.json')
await writeFile(patch, JSON.stringify([
  { id: 'student', config: { textbooks: { host: '127.0.0.1', port, certFile: cert, keyFile: key, pollIntervalMs: 1000, parseTimeoutMs: 30000 } } },
  { id: 'agent-default-model', config: { provider: 'textbook-fixture', model: 'textbook-fixture' } },
  { id: 'session-title-llm', disabled: true }, { id: 'session-telemetry-otel', disabled: true },
  { id: 'headless-runner', inject: ['headlessStartup', 'textbookAcceptanceReady'] },
  { insert: [{ id: 'agent-preset-registry', name: '@deepseek-ai/dsh-agent-preset-registry', config: { default: 'student' } }, { id: 'textbook-test-fixture', name: fileURLToPath(new URL('./textbook-native-fixture.mjs', import.meta.url)), config: { cert, result, photo } }] },
]))
try {
  const output = await dsh('--profile', 'textbook-test', '--patch', patch, '--permission-mode', 'danger-full-access', '--json', 'Run verify_textbooks exactly once and finish.')
  await writeFile(join(root, 'native.jsonl'), output.stdout)
  await writeFile(join(root, 'stderr.log'), output.stderr)
  const evidence = JSON.parse(await readFile(result, 'utf8'))
  assert.equal(evidence.ok, true)
  console.log(JSON.stringify({ root, ...evidence }, null, 2))
} catch (error) {
  if (error.stdout) await writeFile(join(root, 'native.jsonl'), error.stdout)
  if (error.stderr) await writeFile(join(root, 'stderr.log'), error.stderr)
  console.error(`Textbook acceptance failed; evidence: ${root}`)
  throw error
}
