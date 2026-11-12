import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createRequire } from 'node:module'
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { zstdDecompressSync } from 'node:zlib'

const execute = promisify(execFile)
const packageRoot = fileURLToPath(new URL('..', import.meta.url))
await import(pathToFileURL(join(packageRoot, 'lib/files.js')).href)
const dshBin = await realpath(process.env.DSH_BIN ?? '/Users/winter/.nvm/versions/node/v24.22.2/bin/dsh')
const runtime = createRequire(dshBin)
const root = await mkdtemp(join(tmpdir(), 'student-native-cli-'))
const project = join(root, 'project')
const env = { ...process.env, DSH_HOME: join(root, 'home'), DSH_AGENTS_HOME: join(root, 'agents'), DSH_TELEMETRY_DISABLED: '1' }
const outputRoot = process.env.STUDENT_EVIDENCE_DIR
const summaries = []
const quote = value => `'${value.replaceAll("'", "'\\''")}'`
const json = value => `${JSON.stringify(value, null, 2)}\n`
const now = Date.parse('2026-11-12T09:00:00+08:00')
const profile = { nickname: 'Native fixture', region: '上海市', grade: 2, term: 'first', schoolYear: '2026-2027', schoolSystem: 'five-four', schoolAlias: '', parentConfirmation: 'Fixture parent confirms the profile.' }
const settings = { format: 2, kind: 'term-settings', termId: 'native-term', revision: 1, updatedAt: now, profile, materials: [], courses: [] }
const question = { id: 'q1', objectiveId: 'm2a-o-sub', source: { kind: 'authored', description: 'Original deterministic fixture' }, topic: 'Subtraction', prompt: '18 − 7?', answer: '11', explanation: 'Subtract seven ones', answerEvidence: '18 − 7 = 11; 11 + 7 = 18', phase: 'try' }
const block = { format: 2, kind: 'block', termId: settings.termId, id: 'native-block', subject: 'math', mode: 'foundation', startedAt: now, context: { profile, scope: { grade: 2, term: 'first', objectiveIds: ['m2a-o-sub'] } }, currentQuestionId: 'q1', questions: [question], responses: [], hints: [], assessments: [] }
const response = { id: 'r1', questionId: 'q1', rawResponse: '11', assistance: 'unknown', answerDate: { kind: 'unknown' }, source: { kind: 'unknown' } }
const assessment = { id: 'a1', responseId: 'r1', result: 'correct', assistance: 'unknown', feedback: 'Correct', answerEvidence: question.answerEvidence, assessedAt: now }
const draft = { id: 'draft1', questionId: 'q1', response: '11', result: 'correct', assistance: 'unknown', confidence: 'high', uncertainties: '', imagePaths: ['photo.png'], receivedAt: now }
const worksheet = { format: 2, kind: 'worksheet', termId: settings.termId, id: 'native-photo', subject: 'math', origin: 'workbook', createdAt: now, context: { profile }, items: [question], responses: [], assessments: [], drafts: [draft] }
const sheet = { ...worksheet, id: 'native-sheet', origin: 'prepared', worksheetKind: 'practice', drafts: [] }
const write = (file_path, value) => ['write', { file_path, content: json(value) }]
const edit = (file_path, old_string, new_string) => ['edit', { file_path, old_string, new_string }]
let cliCommand
const validate = () => ['bash', { command: cliCommand, description: 'Run the packaged read-only CLI and independently observe business facts', timeoutMs: 30000, run_in_background: false }]
const status = () => ['study_status', { kind: 'learning-context' }]
const dsh = (...args) => execute(process.execPath, [dshBin, ...args], { cwd: project, env, timeout: 60000, maxBuffer: 16 * 1024 * 1024 })
try {
  await mkdir(project)
  assert.equal((await dsh('--version')).stdout.trim(), '0.2.2-rc.1')
  await dsh('--profile', 'native-cli', '--from-default-profile', 'headless', '--dump-config')
  await dsh('plugin', '--profile', 'native-cli', 'add', `link:${packageRoot}`)
  const wrapper = join(root, 'observe-cli.mjs')
  await writeFile(wrapper, `import assert from 'node:assert/strict';
import {execFile} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readFile,readdir,stat,appendFile} from 'node:fs/promises';
import {promisify} from 'node:util';
import {nodeStudyFiles,readWorkspace,queryWorkspace} from ${JSON.stringify(pathToFileURL(join(packageRoot, 'lib/files.js')).href)};
const cwd=process.argv[2];
async function snapshot(){const names=await readdir(cwd+'/.study',{recursive:true});const result=[];for(const name of names.sort()){const path=cwd+'/.study/'+name;const info=await stat(path,{bigint:true});if(info.isFile())result.push([name,info.size.toString(),info.mtimeNs.toString(),info.ctimeNs.toString(),createHash('sha256').update(await readFile(path)).digest('hex')]);}return result;}
const before=await snapshot();
let code=0,stdout='',stderr='';
try{const run=await promisify(execFile)(process.execPath,[${JSON.stringify(join(packageRoot, 'lib/cli.js'))},'validate','--workspace',cwd]);stdout=run.stdout;stderr=run.stderr;}catch(error){assert.equal(error.signal,null);code=error.code;stdout=error.stdout;stderr=error.stderr;}
assert.deepEqual(await snapshot(),before);
const read=await readWorkspace(nodeStudyFiles(cwd),new AbortController().signal);
const result={cliExit:code,cli:JSON.parse(stdout),cliStdout:stdout,cliStderr:stderr,bytesAndVersionsInvariant:true,consumer:queryWorkspace(read,{kind:'learning-context'},${now})};
await appendFile(${JSON.stringify(join(root, 'cli-evidence.jsonl'))},JSON.stringify(result)+'\\n');
console.log(JSON.stringify(result));
process.exitCode=code;
`)
  cliCommand = `${quote(process.execPath)} ${quote(wrapper)} ${quote(project)}`
  const fixture = join(root, 'model.mjs')
  await writeFile(fixture, `import {appendFile} from 'node:fs/promises';
import {LlmAdapter} from ${JSON.stringify(pathToFileURL(runtime.resolve('@deepseek-ai/dsh-llm')).href)};
import {estimateMessage,estimateToolsTokens} from ${JSON.stringify(pathToFileURL(runtime.resolve('@deepseek-ai/dsh-token-meter/estimate')).href)};
export const inject=['llm','agentPresets'];
export function apply(ctx,config){
ctx.on('agent/created',async ({agent})=>{if(agent.session.header.origin!=='subagent')await ctx.agentPresets.mount(agent.ctx,'student');});
class Fixture extends LlmAdapter{
index=0;
async listModels(provider){return [{provider,id:'student-cli-fixture',name:'Student CLI fixture',contextWindow:1000000,maxTokens:16000}];}
async *stream(options){options.signal?.throwIfAborted();const next=config.calls[this.index++];const action=next?.[0]??'final';
const row={dispatch:this.index,action,purpose:options.purpose??null,provider:options.provider,model:options.model,messages:options.messages,tools:options.tools??[],promptUtf16Chars:JSON.stringify(options.messages).length,promptUtf8Bytes:Buffer.byteLength(JSON.stringify(options.messages)),toolSchemaUtf16Chars:JSON.stringify(options.tools??[]).length,fixedDensityRequestEstimate:options.messages.reduce((sum,message)=>sum+estimateMessage(message),0)+estimateToolsTokens({tools:options.tools??[]}),usage:null};
await appendFile(config.telemetry,JSON.stringify(row)+'\\n');
if(next){const [name,args]=next;if(!(options.tools??[]).some(tool=>tool.name===name))throw new Error('Missing real native tool '+name);const id='native-'+this.index;yield {type:'block-start',index:0,blockType:'tool-call'};yield {type:'tool-call-delta',index:0,id,name,argumentsDelta:JSON.stringify(args)};yield {type:'block-end',index:0,block:{type:'tool-call',id,name,arguments:JSON.stringify(args)}};yield {type:'finish',reason:{kind:'tool-calls'}};}
else{const text='Deterministic '+config.flow+' operation completed; saved files and CLI/consumer results were inspected.';yield {type:'block-start',index:0,blockType:'text'};yield {type:'text-delta',index:0,text};yield {type:'block-end',index:0,block:{type:'text',text}};yield {type:'finish',reason:{kind:'stop'}};}
}}
ctx.effect(()=>ctx.llm.registerAdapter(['student-cli-fixture'],new Fixture()));
}
`)
  const answered = { ...block, responses: [response], currentResponseId: 'r1' }
  const invalid = { ...answered, assessments: [{ ...assessment, responseId: 'missing-response' }] }
  const assessed = { ...answered, assessments: [assessment] }
  const confirmedPhoto = { ...worksheet, drafts: [], responses: [{ ...response, source: { kind: 'paper', imagePaths: ['photo.png'], parentConfirmation: 'Fixture parent confirms original wording; help and date unknown.' } }], assessments: [{ ...assessment, userConfirmation: 'Fixture parent confirms this correct result.' }] }
  const flows = [
    ['setup', [
      ['read', { file_path: join(packageRoot, 'knowledge/skills/study/SKILL.md') }],
      ['bash', { command: `${quote(process.execPath)} ${quote(join(packageRoot, 'lib/cli.js'))} schema term-settings > .study-settings.schema.json`, description: 'Generate source-derived setup constraints', timeoutMs: 30000, run_in_background: false }],
      ['read', { file_path: '.study-settings.schema.json' }], write('.study/settings.json', settings), validate(), status(),
    ]],
    ['learning-and-repair', [write('.study/blocks/native-block.json', block), validate(), edit('.study/blocks/native-block.json', json(block).trim(), json(answered).trim()), validate(), status(), edit('.study/blocks/native-block.json', json(answered).trim(), json(invalid).trim()), validate(), status(), edit('.study/blocks/native-block.json', 'missing-response', 'r1'), validate(), status(), edit('.study/blocks/native-block.json', json(assessed).trim(), json({ ...assessed, endedAt: now + 1 }).trim()), validate()]],
    ['photo-confirmation', [write('.study/worksheets/native-photo.json', worksheet), validate(), edit('.study/worksheets/native-photo.json', json(worksheet).trim(), json(confirmedPhoto).trim()), validate(), ['study_status', { kind: 'worksheets', id: 'native-photo' }]]],
    ['worksheet', [write('.study/worksheets/native-sheet.json', sheet), validate(), ['study_status', { kind: 'worksheets', id: 'native-sheet' }]]],
    ['archive', [
      ['bash', { command: `${quote(process.execPath)} -e ${quote(`const fs=require('node:fs');fs.cpSync('.study/settings.json','.study/archives/native-term/settings.json',{recursive:true});fs.cpSync('.study/blocks','.study/archives/native-term/blocks',{recursive:true});fs.cpSync('.study/worksheets','.study/archives/native-term/worksheets',{recursive:true});`)}`, description: 'Preserve the confirmed term under its stable identity', timeoutMs: 30000, run_in_background: false }],
      edit('.study/settings.json', json(settings).trim(), json({ ...settings, archivedAt: now + 2 }).trim()), validate(), status(),
    ]],
  ]
  for (const [flow, calls] of flows) {
    if (flow !== 'setup') {
      const kind = flow === 'learning-and-repair' ? 'block' : flow === 'archive' ? 'term-settings' : 'worksheet'
      const schemaPath = `.study-${flow}.schema.json`
      const schema = JSON.parse((await execute(process.execPath, [join(packageRoot, 'lib/cli.js'), 'schema', kind])).stdout)
      const lineCount = json(schema).split('\n').length
      const references = flow === 'archive' ? ['files.md'] : ['files.md', 'questions.md', ...(flow === 'learning-and-repair' ? ['teaching.md'] : [])]
      calls.unshift(['read', { file_path: join(packageRoot, 'knowledge/skills/study/SKILL.md') }], ...references.map(name => ['read', { file_path: join(packageRoot, 'knowledge/skills/study/references', name) }]), ['bash', { command: `${quote(process.execPath)} ${quote(join(packageRoot, 'lib/cli.js'))} schema ${kind} > ${quote(schemaPath)}`, description: 'Generate source-derived authoring schema', timeoutMs: 30000, run_in_background: false }], ...Array.from({ length: Math.ceil(lineCount / 500) }, (_, index) => ['read', { file_path: schemaPath, offset: index * 500 + 1, limit: 500 }]))
    }
    calls.unshift(['study_status', {}])
    const telemetry = join(root, `${flow}.requests.jsonl`)
    const overlay = join(root, `${flow}.overlay.json`)
    await writeFile(overlay, JSON.stringify([
      { id: 'agent-default-model', config: { provider: 'student-cli-fixture', model: 'student-cli-fixture' } },
      { id: 'session-title-llm', disabled: true }, { id: 'session-telemetry-otel', disabled: true }, { id: 'llm-deepseek', disabled: true }, { id: 'llm-deepseek-account', disabled: true },
      { insert: [{ id: 'agent-preset-registry', name: '@deepseek-ai/dsh-agent-preset-registry', config: { default: 'student' } }, { id: 'student-fixture', name: fixture, config: { flow, calls, telemetry } }] },
    ]))
    const result = await dsh('--profile', 'native-cli', '--patch', overlay, '--permission-mode', 'danger-full-access', '--json', `Execute the deterministic ${flow} fixture. Parent confirmations and answers are fixture facts.`)
    if (outputRoot) {
      await mkdir(outputRoot, { recursive: true })
      await writeFile(join(outputRoot, `${flow}.requests.jsonl`), await readFile(telemetry))
      await writeFile(join(outputRoot, `${flow}.stdout.jsonl`), result.stdout)
      await writeFile(join(outputRoot, `${flow}.stderr.log`), result.stderr)
    }
    assert.equal(result.signal, undefined)
    const requests = (await readFile(telemetry, 'utf8')).trim().split('\n').map(line => JSON.parse(line))
    assert.equal(requests.length, calls.length + 1)
    assert.equal(requests.at(-1).action, 'final')
    const studentTools = requests[0].tools.filter(tool => tool.name.startsWith('study_'))
    assert.deepEqual(studentTools.map(tool => tool.name), ['study_status'])
    const resident = studentTools.reduce((sum, tool) => sum + JSON.stringify(tool.parameters).length, 0)
    assert.ok(resident <= 30000)
    const events = result.stdout.trim().split('\n').map(line => JSON.parse(line))
    const sessionId = events.find(event => event.type === 'session').sessionId
    const statusIds = new Set(events.filter(event => event.type === 'tool_call' && event.tool === 'study_status').map(event => event.callId))
    const statuses = events.filter(event => event.type === 'tool_result' && statusIds.has(event.callId))
    assert.equal(statuses.length, statusIds.size)
    assert.ok(statuses.every(status => status.status === 'completed'))
    const admitted = new Map(requests.flatMap(request => request.messages.filter(message => message.role === 'tool' && statusIds.has(message.toolCallId)).map(message => [message.toolCallId, message.content])))
    assert.equal(admitted.size, statusIds.size)
    for (const content of admitted.values()) {
      assert.ok(Buffer.byteLength(JSON.stringify(content)) <= 32768)
      const native = JSON.parse(content.filter(block => block.type === 'text').map(block => block.text).join('')).native
      assert.equal(native.status, 'available')
      assert.equal(native.cut.sessionId, sessionId)
      assert.ok(native.inputs.some(input => input.receipt.kind === 'known'))
      assert.ok(native.admissions.some(admission => admission.status === 'consumed' && native.inputs.some(input => input.messageId === admission.messageId)))
      assert.equal('observations' in native, false)
    }
    const summary = { flow, nativeToolCalls: calls.length, harnessDispatches: requests.length, firstTurnPromptUtf16Chars: requests[0].promptUtf16Chars, continuationPromptUtf16Chars: requests.slice(1).map(row => row.promptUtf16Chars), fullRequestPromptUtf16Chars: requests.reduce((sum, row) => sum + row.promptUtf16Chars, 0), fixedDensityFirstRequestEstimate: requests[0].fixedDensityRequestEstimate, fixedDensityContinuationEstimates: requests.slice(1).map(row => row.fixedDensityRequestEstimate), fixedDensityTotalRequestEstimate: requests.reduce((sum, row) => sum + row.fixedDensityRequestEstimate, 0), residentParameterUtf16Chars: resident, schemaAndReferenceReads: calls.filter(([name]) => name === 'read').map(([, args]) => args), providerUsage: null, paidProviderRequests: 0, titleProducer: 'disabled', compaction: 'Student preset enabled; no triggered compaction asserted', textOnlyPhotoFixture: flow === 'photo-confirmation', headlessEvents: events.length }
    summaries.push(summary)
  }
  const cliEvidence = (await readFile(join(root, 'cli-evidence.jsonl'), 'utf8')).trim().split('\n').map(line => JSON.parse(line))
  assert.equal(cliEvidence.filter(row => row.cliExit !== 0).length, 1)
  assert.equal(cliEvidence.every(row => row.bytesAndVersionsInvariant), true)
  assert.equal(cliEvidence.find(row => row.cliExit !== 0).consumer.data, undefined)
  assert.equal(cliEvidence.at(-1).cli.status, 'archived')
  const archived = await readFile(join(project, '.study/archives/native-term/blocks/native-block.json'))
  assert.deepEqual(archived, await readFile(join(project, '.study/blocks/native-block.json')))
  const sessionRoot = join(env.DSH_HOME, 'sessions')
  const names = await readdir(sessionRoot, { recursive: true })
  const generations = new Map()
  for (const name of names.filter(name => /session\.v\d+\.jsonl\.zstd$/u.test(name))) {
    const group = dirname(name), version = Number(/session\.v(\d+)/u.exec(name)[1])
    if (!generations.has(group) || generations.get(group).version < version) generations.set(group, { name, version })
  }
  let persistedCalls = 0, retries = 0, usageSamples = 0
  for (const [group, { name }] of generations) {
    const text = zstdDecompressSync(await readFile(join(sessionRoot, name))).toString()
    const events = text.trim().split('\n').map(line => JSON.parse(line))
    persistedCalls += events.filter(event => event.type === 'tool/call').length
    retries += events.filter(event => event.type === 'llm/retry' || event.type === 'llm/retry-started').length
    usageSamples += events.filter(event => event.type === 'assistant/message' && event.data.usage).length
    assert.deepEqual(events.filter(event => event.type === 'turn/end').map(event => event.data.reason), [{ kind: 'completed' }])
    if (outputRoot) await writeFile(join(outputRoot, `${group.split('/').at(-1)}.session.jsonl`), text)
  }
  assert.equal(persistedCalls, summaries.reduce((sum, row) => sum + row.nativeToolCalls, 0))
  if (outputRoot) await writeFile(join(outputRoot, 'cli-evidence.jsonl'), await readFile(join(root, 'cli-evidence.jsonl')))
  const final = { flows: summaries, cliInvocations: cliEvidence.length, invalidValidations: 1, businessRepairEdits: 1, persistedCalls, harnessDispatches: summaries.reduce((sum, row) => sum + row.harnessDispatches, 0), retries, usageSamples, tokenUsage: 'unavailable: keyless adapter emits no provider usage', photoLimit: 'Persisted transcription/confirmation mechanics only; native image admission, OCR and image-token costs belong to integrated acceptance.', archiveLimit: 'Known fixture term files preserved; interrupted migration/explicit restore belong to integrated acceptance.', cleanup: 'awaited subprocess exit before temporary root removal' }
  if (outputRoot) await writeFile(join(outputRoot, 'summary.json'), json(final))
  process.stdout.write(json(final))
} finally {
  await rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
}
