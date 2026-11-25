/** Installed headless composition: original skills/components and one protected credential store. */
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFile, spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { mkdtemp, mkdir, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { setTimeout } from 'node:timers/promises'
import yaml from 'js-yaml'

const execute = promisify(execFile)
const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const dshBin = await realpath(process.env.DSH_BIN ?? (await execute(process.platform === 'win32' ? 'where' : 'which', ['dsh'])).stdout.trim().split(/\r?\n/u)[0])
const runtime = createRequire(dshBin)
const root = process.env.STUDENT_OPENMAIC_EVIDENCE_DIR ?? await mkdtemp(join(tmpdir(), 'student-openmaic-native-'))
const project = join(root, 'project')
const env = { ...process.env, DSH_HOME: join(root, 'home'), DSH_AGENTS_HOME: join(root, 'agents'), DSH_TELEMETRY_DISABLED: '1' }
const dsh = (...args) => execute(process.execPath, [dshBin, ...args], { cwd: project, env, timeout: 90000, maxBuffer: 16 * 1024 * 1024 })
const schema = yaml.DEFAULT_SCHEMA.extend(new yaml.Type('tag:yaml.org,2002:js', { kind: 'scalar', construct: value => value }))
function entries(rows) { return rows.flatMap(row => [row, ...(row.group ? entries(row.config) : [])]) }
async function dump(...args) { return entries(yaml.load((await dsh('--profile', 'openmaic', '--dump-config', ...args)).stdout, { schema })) }
function observationPolicy(rows) {
  const policy = rows.filter(row => row.id === 'fs-observation-policy')
  assert.equal(policy.length, 1, 'Student reuses the first base filesystem intent decider')
  assert.equal(policy[0].disabled, false)
  assert.ok(rows.indexOf(policy[0]) < rows.findIndex(row => row.id === 'tool-fs'), 'Policy must register before native file tools')
}

try {
  await mkdir(project)
  assert.equal((await dsh('--version')).stdout.trim(), '0.2.2-rc.5')
  await dsh('--profile', 'openmaic', '--from-default-profile', 'headless', '--dump-config')
  let installSource = process.env.STUDENT_PACKAGE_SOURCE
  if (!installSource) {
    const packed = JSON.parse((await execute('npm', ['pack', '--ignore-scripts', '--json', '--pack-destination', root], { cwd: packageRoot })).stdout)[0]
    await writeFile(join(root, 'pack.json'), JSON.stringify(packed, null, 2))
    installSource = join(root, packed.filename)
  }
  await writeFile(join(root, 'install-source.json'), JSON.stringify({ source: installSource }, null, 2))
  await dsh('plugin', '--profile', 'openmaic', 'add', installSource)
  await writeFile(join(root, 'installed-config.json'), JSON.stringify(await dump(), null, 2))
  const credentials = (await dump()).filter(row => row.id === 'credentials')
  assert.equal(credentials.length, 1, 'Student must reuse the shared provider')
  assert.equal(credentials[0].disabled, false, 'First install must restore the headless credential provider')
  assert.equal(credentials[0].name, '@deepseek-ai/dsh-credentials-local')
  observationPolicy(await dump())

  const overlay = join(root, 'fixture.overlay.json')
  const model = join(root, 'model.mjs')
  const result = join(root, 'result.json')
  const store = join(root, 'custom.credentials.yaml')
  await writeFile(join(env.DSH_HOME, 'profiles/openmaic/cordis.patch.yml'), yaml.dump([{ id: 'credentials', config: { path: store, watch: false } }]))
  assert.deepEqual((await dump()).find(row => row.id === 'credentials').config, { path: store, watch: false })
  const disabled = join(root, 'disabled.overlay.json')
  await writeFile(disabled, JSON.stringify([{ id: 'credentials', disabled: true }]))
  assert.equal((await dump('--patch', disabled)).find(row => row.id === 'credentials').disabled, true, 'Explicit user overrides remain authoritative')

  await writeFile(model, `import {writeFile} from 'node:fs/promises';
import {LlmAdapter} from ${JSON.stringify(pathToFileURL(runtime.resolve('@deepseek-ai/dsh-llm')).href)};
import {credentialKey} from ${JSON.stringify(pathToFileURL(runtime.resolve('@deepseek-ai/dsh-credentials')).href)};
export const inject=['llm','agentPresets','student','studentOpenmaic','credentials','skills'];
export function apply(ctx,config){let native;ctx.on('agent/created',async({agent})=>{if(agent.session.header.origin!=='subagent'){if(config.student)await ctx.agentPresets.mount(agent.ctx,'student');native=agent;}});
class Fixture extends LlmAdapter{index=0;requests=[];async listModels(provider){return [{provider,id:'openmaic-fixture',name:'OpenMAIC fixture',contextWindow:1000000,maxTokens:16000}];}
async *stream(options){options.signal?.throwIfAborted();const next=config.calls[this.index++];this.requests.push({tools:(options.tools??[]).map(t=>t.name),skills:(await ctx.skills.list({scope:native})).map(skill=>skill.name),results:options.messages.filter(message=>message.role==='tool')});
if(next?.[2]?.externalWrite)await writeFile(next[2].externalWrite.path,next[2].externalWrite.content);
if(next){const[name,args]=next;if(!(options.tools??[]).some(t=>t.name===name))throw new Error('Missing native tool '+name);const id='openmaic-'+this.index;yield{type:'block-start',index:0,blockType:'tool-call'};yield{type:'tool-call-delta',index:0,id,name,argumentsDelta:JSON.stringify(args)};yield{type:'block-end',index:0,block:{type:'tool-call',id,name,arguments:JSON.stringify(args)}};yield{type:'finish',reason:{kind:'tool-calls'}};}
else{if(!ctx.studentOpenmaic)throw new Error('OpenMAIC Host transport is unavailable');const key=credentialKey('student-openmaic','composition-fixture');const previous=await ctx.credentials.readRecord(key);await ctx.credentials.modifyRecord(key,async()=>({kind:'grant',payload:{fixture:true}}));const saved=await ctx.credentials.readRecord(key);
await writeFile(config.result,JSON.stringify({requests:this.requests,previous,saved}));const text='Original OpenMAIC components completed.';yield{type:'block-start',index:0,blockType:'text'};yield{type:'text-delta',index:0,text};yield{type:'block-end',index:0,block:{type:'text',text}};yield{type:'finish',reason:{kind:'stop'}};}}}
ctx.effect(()=>ctx.llm.registerAdapter(['openmaic-fixture'],new Fixture()));}
`)
  const calls = [
    ['skill', { name: 'openmaic-teach' }], ['skill', { name: 'openmaic-widget' }],
    ['openmaic_widget', { html: '<!doctype html><html><body><button>Explore</button></body></html>', widgetType: 'simulation', title: 'Explore addition' }],
    ['skill', { name: 'openmaic-render' }], ['openmaic_render', { fragment: '<h2>Try 9 + 5</h2>', title: 'Independent question' }],
    ['skill', { name: 'openmaic-slide' }], ['openmaic_slide', { title: 'Make ten', slide: { background: { type: 'solid', color: '#ffffff' }, elements: [{ id: 'title', type: 'text', left: 80, top: 80, width: 1080, height: 76, content: '<p>Make ten, then add the rest.</p>', defaultFontName: '', defaultColor: '#333333' }] } }],
  ]
  async function run(calls, student = true) {
    await writeFile(overlay, JSON.stringify([
      { id: 'agent-default-model', config: { provider: 'openmaic-fixture', model: 'openmaic-fixture' } },
      { id: 'session-title-llm', disabled: true }, { id: 'session-telemetry-otel', disabled: true }, { id: 'llm-deepseek', disabled: true }, { id: 'llm-deepseek-account', disabled: true },
      { insert: [{ id: 'agent-preset-registry', name: '@deepseek-ai/dsh-agent-preset-registry', config: { default: 'student' } }, { id: 'openmaic-fixture', name: model, config: { calls, result, student } }] },
    ]))
    const output = await dsh('--profile', 'openmaic', '--patch', overlay, '--permission-mode', 'danger-full-access', '--json', '/study Verify independent OpenMAIC teaching components.')
    await writeFile(join(root, student ? 'student.native.jsonl' : 'ordinary.native.jsonl'), output.stdout)
    await writeFile(join(root, student ? 'student.native.stderr' : 'ordinary.native.stderr'), output.stderr)
    const events = output.stdout.trim().split('\n').map(line => JSON.parse(line))
    assert.equal(events.at(-1).reason.kind, 'completed')
    const tools = events.filter(event => event.type === 'tool_result')
    assert.equal(tools.length, calls.length)
    for (let index = 0; index < tools.length; index++) if (!calls[index][2]?.failure) assert.equal(tools[index].status, 'completed', JSON.stringify(tools[index]))
    return JSON.parse(await readFile(result, 'utf8'))
  }
  const ordinary = await run([], false)
  assert.deepEqual(ordinary.requests[0].tools.filter(name => name.startsWith('openmaic_')), [], 'Official tools must be absent from ordinary sessions')
  assert.deepEqual(ordinary.requests[0].skills.filter(name => name.startsWith('openmaic-')), [], 'Official skills must be absent from ordinary sessions')
  await writeFile(join(root, 'ordinary.catalog.json'), JSON.stringify(ordinary.requests, null, 2))
  const first = await run(calls)
  await writeFile(join(root, 'student.catalog.json'), JSON.stringify(first.requests, null, 2))
  for (const name of ['openmaic_generate', 'openmaic_widget', 'openmaic_render', 'openmaic_slide']) assert.ok(first.requests[0].tools.includes(name), name)
  for (const name of ['openmaic-teach', 'openmaic-widget', 'openmaic-render', 'openmaic-slide']) assert.ok(first.requests[0].skills.includes(name), name)
  assert.deepEqual(first.saved, { kind: 'grant', payload: { fixture: true } })
  // Windows does not expose POSIX credential permission bits.
  if (process.platform !== 'win32') assert.equal((await stat(store)).mode & 0o077, 0, 'Protected records must be owner-only')
  assert.deepEqual((await run([])).previous, first.saved, 'The same configured store must survive process restart')
  const guarded = join(project, 'guarded.json')
  const created = join(project, 'concurrent.json')
  await writeFile(guarded, 'original')
  const protection = await run([
    ['write', { file_path: guarded, content: 'unread overwrite' }, { failure: true }],
    ['read', { file_path: guarded }],
    ['write', { file_path: guarded, content: 'stale overwrite' }, { failure: true, externalWrite: { path: guarded, content: 'parent changed' } }],
    ['read', { file_path: guarded }],
    ['edit', { file_path: guarded, old_string: 'parent changed', new_string: 'merged' }],
    ['read', { file_path: created }, { failure: true }],
    ['write', { file_path: created, content: 'clobber creator' }, { failure: true, externalWrite: { path: created, content: 'concurrent creator' } }],
  ])
  assert.equal(await readFile(guarded, 'utf8'), 'merged')
  assert.equal(await readFile(created, 'utf8'), 'concurrent creator')
  const failures = JSON.stringify(protection.requests.at(-1).results)
  assert.match(failures, /file has not been read/u)
  assert.match(failures, /re-read the file/u)
  await writeFile(join(root, 'native-file-protection.json'), JSON.stringify(protection.requests, null, 2))
  await dsh('--profile', 'openmaic-web', '--from-default-profile', 'web', '--dump-config')
  await dsh('plugin', '--profile', 'openmaic-web', 'add', installSource)
  observationPolicy(entries(yaml.load((await dsh('--profile', 'openmaic-web', '--dump-config')).stdout, { schema })))
  const clientResult = join(root, 'client.json')
  const observer = fileURLToPath(new URL('./openmaic-client-observer.mjs', import.meta.url))
  const clientOverlay = join(root, 'client.overlay.json')
  await writeFile(clientOverlay, JSON.stringify([{ insert: [{ id: 'client-observer', name: observer, config: { result: clientResult } }] }]))
  const web = spawn(process.execPath, [dshBin, '--profile', 'openmaic-web', '--patch', clientOverlay, '--host', '127.0.0.1', '--port', '0', '--no-open'], { cwd: project, env, stdio: ['ignore', 'pipe', 'pipe'] })
  const stdout = [], stderr = []
  web.stdout.on('data', chunk => stdout.push(chunk))
  web.stderr.on('data', chunk => stderr.push(chunk))
  const closed = new Promise(resolve => web.once('close', resolve))
  try {
    const deadline = Date.now() + 90000
    let observed
    while (Date.now() < deadline) {
      try { observed = JSON.parse(await readFile(clientResult, 'utf8')); break } catch (error) { if (error.code !== 'ENOENT') throw error }
      if (web.exitCode !== null) throw new Error('Web carrier exited before publishing the official client')
      await setTimeout(100)
    }
    assert.ok(observed, 'Web carrier must publish the original client before the deadline')
    assert.equal(observed.error, undefined, JSON.stringify(observed))
    assert.equal(observed.factoryId, '@openmaic/dsh-openmaic')
    const officialSource = createRequire(join(packageRoot, 'package.json'))
    const expectedClient = await readFile(officialSource.resolve('@openmaic/dsh-openmaic/client'))
    assert.equal(observed.clientSha256, createHash('sha256').update(expectedClient).digest('hex'), 'Installed client must match the independent fixed official dependency')
  } finally {
    web.kill('SIGTERM')
    await closed
    await writeFile(join(root, 'web.stdout'), Buffer.concat(stdout))
    await writeFile(join(root, 'web.stderr'), Buffer.concat(stderr))
  }
  console.log('Default standalone install and ordinary mode isolation: 4 official tools, 4 skills, 3 component calls; protected shared store, user overrides and byte-identical official client publication passed.')
} finally {
  if (!process.env.STUDENT_OPENMAIC_EVIDENCE_DIR) await rm(root, { recursive: true, force: true })
}
