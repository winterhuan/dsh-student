/** Isolated browser acceptance server; never reads daily profiles or real learner files. */
import { execFile, spawn } from 'node:child_process'
import { mkdtemp, mkdir, writeFile, realpath } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
const exec = promisify(execFile)
const root = await mkdtemp(join(tmpdir(), 'student-textbook-web-'))
const cwd = join(root, 'workspace')
await mkdir(cwd)
const dshBin = await realpath((await exec('which', ['dsh'])).stdout.trim())
const env = { ...process.env, DSH_HOME: join(root, 'home'), DSH_AGENTS_HOME: join(root, 'agents'), DSH_TELEMETRY_DISABLED: '1', STUDENT_TEST_DSH_BIN: dshBin }
const dsh = (...args) => exec(process.execPath, [dshBin, ...args], { cwd, env, timeout: 120000, maxBuffer: 16 * 1024 * 1024 })
await dsh('--profile', 'textbook-web', '--from-default-profile', 'web', '--dump-config')
const packed = JSON.parse((await exec('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', root], { cwd: fileURLToPath(new URL('..', import.meta.url)) })).stdout)[0]
await dsh('plugin', '--profile', 'textbook-web', 'add', join(root, packed.filename))
const cert = join(root, 'cert.pem'), key = join(root, 'key.pem'), patch = join(root, 'web.patch.json')
await exec('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', key, '-out', cert, '-days', '1', '-subj', '/CN=127.0.0.1', '-addext', 'subjectAltName=IP:127.0.0.1'])
await writeFile(patch, JSON.stringify([
  { id: 'workspace-controller', config: { documentsDirectory: cwd } },
  { id: 'student', config: { textbooks: { host: '127.0.0.1', port: 13083, certFile: cert, keyFile: key } } },
  { id: 'agent-default-model', config: { provider: 'textbook-fixture', model: 'textbook-fixture' } },
  { id: 'agent-preset-registry', config: { default: 'student' } },
  { id: 'session-title-llm', disabled: true }, { id: 'session-telemetry-otel', disabled: true },
  { insert: [{ id: 'textbook-test-fixture', name: fileURLToPath(new URL('./textbook-native-fixture.mjs', import.meta.url)), config: { ui: true } }] },
]))
const child = spawn(process.execPath, [dshBin, '--profile', 'textbook-web', '--patch', patch, '--host', '127.0.0.1', '--port', '13082', '--no-open'], { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] })
let log = ''
for (const stream of [child.stdout, child.stderr]) stream.on('data', value => { log += value; void writeFile(join(root, 'server.log'), log) })
console.log(JSON.stringify({ root, cwd, url: 'http://127.0.0.1:13082' }))
process.on('SIGINT', () => child.kill('SIGINT'))
process.on('SIGTERM', () => child.kill('SIGTERM'))
child.on('exit', code => { process.exitCode = code ?? 1 })
