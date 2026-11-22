/** Installed headless composition: original skills/components and one protected credential store. */
import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createRequire } from 'node:module'
import { mkdtemp, mkdir, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath, pathToFileURL } from 'node:url'
import yaml from 'js-yaml'

const execute = promisify(execFile)
const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const dshBin = await realpath(process.env.DSH_BIN ?? (await execute(process.platform === 'win32' ? 'where' : 'which', ['dsh'])).stdout.trim().split(/\r?\n/u)[0])
const runtime = createRequire(dshBin)
const root = await mkdtemp(join(tmpdir(), 'student-openmaic-native-'))
const project = join(root, 'project')
const env = { ...process.env, DSH_HOME: join(root, 'home'), DSH_AGENTS_HOME: join(root, 'agents'), DSH_TELEMETRY_DISABLED: '1' }
const dsh = (...args) => execute(process.execPath, [dshBin, ...args], { cwd: project, env, timeout: 90000, maxBuffer: 16 * 1024 * 1024 })
const schema = yaml.DEFAULT_SCHEMA.extend(new yaml.Type('tag:yaml.org,2002:js', { kind: 'scalar', construct: value => value }))
function entries(rows) { return rows.flatMap(row => [row, ...(row.group ? entries(row.config) : [])]) }
async function dump(...args) { return entries(yaml.load((await dsh('--profile', 'openmaic', '--dump-config', ...args)).stdout, { schema })) }

try {
  await mkdir(project)
  assert.equal((await dsh('--version')).stdout.trim(), '0.2.2-rc.1')
  await dsh('--profile', 'openmaic', '--from-default-profile', 'headless', '--dump-config')
  await dsh('plugin', '--profile', 'openmaic', 'add', `link:${packageRoot}`)
  const credentials = (await dump()).filter(row => row.id === 'credentials')
  assert.equal(credentials.length, 1, 'Student must reuse the shared provider')
  assert.equal(credentials[0].disabled, false, 'First install must restore the headless credential provider')
  assert.equal(credentials[0].name, '@deepseek-ai/dsh-credentials-local')

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
export const inject=['llm','agentPresets','student','studentOpenmaic','credentials'];
export function apply(ctx,config){ctx.on('agent/created',async({agent})=>{if(agent.session.header.origin!=='subagent')await ctx.agentPresets.mount(agent.ctx,'student');});
class Fixture extends LlmAdapter{index=0;requests=[];async listModels(provider){return [{provider,id:'openmaic-fixture',name:'OpenMAIC fixture',contextWindow:1000000,maxTokens:16000}];}
async *stream(options){options.signal?.throwIfAborted();const next=config.calls[this.index++];this.requests.push({tools:(options.tools??[]).map(t=>t.name)});
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
  async function run(calls) {
    await writeFile(overlay, JSON.stringify([
      { id: 'agent-default-model', config: { provider: 'openmaic-fixture', model: 'openmaic-fixture' } },
      { id: 'session-title-llm', disabled: true }, { id: 'session-telemetry-otel', disabled: true }, { id: 'llm-deepseek', disabled: true }, { id: 'llm-deepseek-account', disabled: true },
      { insert: [{ id: 'agent-preset-registry', name: '@deepseek-ai/dsh-agent-preset-registry', config: { default: 'student' } }, { id: 'openmaic-fixture', name: model, config: { calls, result } }] },
    ]))
    const output = await dsh('--profile', 'openmaic', '--patch', overlay, '--permission-mode', 'danger-full-access', '--json', '/study Verify independent OpenMAIC teaching components.')
    const events = output.stdout.trim().split('\n').map(line => JSON.parse(line))
    assert.equal(events.at(-1).reason.kind, 'completed')
    const tools = events.filter(event => event.type === 'tool_result')
    assert.equal(tools.length, calls.length)
    for (const event of tools) assert.equal(event.status, 'completed', JSON.stringify(event))
    return JSON.parse(await readFile(result, 'utf8'))
  }
  const first = await run(calls)
  for (const name of ['openmaic_generate', 'openmaic_widget', 'openmaic_render', 'openmaic_slide']) assert.ok(first.requests[0].tools.includes(name), name)
  assert.deepEqual(first.saved, { kind: 'grant', payload: { fixture: true } })
  // Windows does not expose POSIX credential permission bits.
  if (process.platform !== 'win32') assert.equal((await stat(store)).mode & 0o077, 0, 'Protected records must be owner-only')
  assert.deepEqual((await run([])).previous, first.saved, 'The same configured store must survive process restart')
  console.log('Default headless: 4 official tools, 4 skills, 3 component calls; protected shared store and user overrides passed.')
} finally {
  await rm(root, { recursive: true, force: true })
}
