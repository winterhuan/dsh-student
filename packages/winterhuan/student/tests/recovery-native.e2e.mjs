import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { zstdDecompressSync } from 'node:zlib'

const execute = promisify(execFile)
const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const filesUrl = pathToFileURL(join(packageRoot, 'lib/files.js')).href
const { nodeStudyFiles, readWorkspace, queryWorkspace, describeMigration, describeArchive, describeRestore, readBackups } = await import(filesUrl)
const dshBin = await realpath(process.env.DSH_BIN ?? '/Users/winter/.nvm/versions/node/v24.22.2/bin/dsh')
const runtime = createRequire(dshBin)
const root = await mkdtemp(join(tmpdir(), 'student-recovery-native-'))
const project = join(root, 'documents', 'recovery')
const env = { ...process.env, DSH_HOME: join(root, 'home'), DSH_AGENTS_HOME: join(root, 'agents'), DSH_TELEMETRY_DISABLED: '1' }
const outputRoot = process.env.STUDENT_EVIDENCE_DIR
const json = value => `${JSON.stringify(value, null, 2)}\n`
const quote = value => `'${value.replaceAll("'", "'\\''")}'`
const hash = value => createHash('sha256').update(value).digest('hex')
const signal = new AbortController().signal
const flows = []
const evidence = []
const write = (file_path, content) => ['write', { file_path, content }]
const edit = (file_path, old_string, new_string) => ['edit', { file_path, old_string, new_string }]
const bash = command => ['bash', { command, description: 'Inspect or recover the explicitly confirmed fixture operation', timeoutMs: 30000, run_in_background: false }]
const status = kind => ['study_status', { kind }]
const dsh = (...args) => execute(process.execPath, [dshBin, ...args], { cwd: project, env, timeout: 90000, maxBuffer: 16 * 1024 * 1024 })

async function save(name, content) {
  if (outputRoot) { await mkdir(outputRoot, { recursive: true }); await writeFile(join(outputRoot, name), content) }
}
async function bytesAndVersions() {
  const result = []
  for (const name of (await readdir(join(project, '.study'), { recursive: true })).sort()) {
    const path = join(project, '.study', name), info = await stat(path, { bigint: true })
    if (info.isFile()) result.push([name, info.size.toString(), info.mtimeNs.toString(), info.ctimeNs.toString(), hash(await readFile(path))])
  }
  return result
}
function archiveFiles(fs, termId) {
  const path = value => value.replace(/^\.study/u, `.study/archives/${termId}`)
  return { stat: (value, signal) => fs.stat(path(value), signal), list: (value, signal) => fs.list(path(value), signal), read: (value, signal, limit) => fs.read(path(value), signal, limit) }
}
async function migration() {
  const fs = nodeStudyFiles(project)
  const legacy = await readWorkspace({ ...fs, stat: (path, signal) => path === '.study/state.json' ? fs.stat(path, signal) : Promise.resolve(undefined), list: async () => [] }, signal)
  const backupPath = '.study/v1-original.json'
  const backup = { ...await fs.stat(backupPath, signal), path: backupPath, bytes: await fs.read(backupPath, signal, 8_388_608) }
  const current = await readWorkspace(fs, signal)
  return describeMigration(legacy, backup, current.files.flatMap(row => row.file ? [{ path: row.path, file: row.file }] : []))
}
async function observe(label, expectedExit) {
  const before = await bytesAndVersions()
  let stdout, code = 0
  try { ({ stdout } = await execute(process.execPath, [join(packageRoot, 'lib/cli.js'), 'validate', '--workspace', project], { env, timeout: 30000 })) }
  catch (error) { assert.equal(error.signal, null, 'CLI must exit rather than hit its deadline'); code = error.code; stdout = error.stdout }
  assert.equal(code, expectedExit, label)
  assert.deepEqual(await bytesAndVersions(), before, 'The packaged CLI must preserve bytes and observed versions, including backups')
  const read = await readWorkspace(nodeStudyFiles(project), signal)
  const row = { label, cliExit: code, cli: JSON.parse(stdout), consumerStatus: read.status, issues: read.issues, files: read.files.map(({ path, file, bytes }) => ({ path, file, sha256: hash(bytes) })), bytesAndVersionsInvariant: true }
  evidence.push(row)
  return { row, read }
}

try {
  await mkdir(join(project, '.study'), { recursive: true })
  assert.equal((await dsh('--version')).stdout.trim(), '0.2.2-rc.1')
  await dsh('--profile', 'recovery', '--from-default-profile', 'headless', '--dump-config')
  await dsh('plugin', '--profile', 'recovery', 'add', `link:${packageRoot}`)
  const model = join(root, 'model.mjs')
  await writeFile(model, `import {writeFile} from 'node:fs/promises';
import {LlmAdapter} from ${JSON.stringify(pathToFileURL(runtime.resolve('@deepseek-ai/dsh-llm')).href)};
export const inject=['llm','agentPresets','student'];
export function apply(ctx,config){
let agent;
ctx.on('agent/created',async event=>{agent=event.agent;if(agent.session.header.origin!=='subagent')await ctx.agentPresets.mount(agent.ctx,'student');});
class Fixture extends LlmAdapter{
index=0;requests=[];
async listModels(provider){return [{provider,id:'recovery-fixture',name:'Recovery fixture',contextWindow:1000000,maxTokens:16000}];}
async *stream(options){
options.signal?.throwIfAborted();const next=config.calls[this.index++];this.requests.push({action:next?.[0]??'final',messages:options.messages,tools:options.tools??[]});
if(next){const [name,args]=next;if(!(options.tools??[]).some(tool=>tool.name===name))throw new Error('Missing native tool '+name);const id='recovery-'+this.index;yield {type:'block-start',index:0,blockType:'tool-call'};yield {type:'tool-call-delta',index:0,id,name,argumentsDelta:JSON.stringify(args)};yield {type:'block-end',index:0,block:{type:'tool-call',id,name,arguments:JSON.stringify(args)}};yield {type:'finish',reason:{kind:'tool-calls'}};}
else{
const query=await ctx.student.query(agent.session.id,{kind:'learning-context'},options.signal);
const settings=await ctx.student.query(agent.session.id,{kind:'settings'},options.signal);
const intent={kind:'settings',command:{action:'setup',profile:config.profile},editedProfileFields:['nickname']};
const context=await ctx.student.manualContext(agent.session.id,intent,options.signal);
const request={termId:context.termId,expectedVersions:context.versions,baseline:context.baseline,intent};
const manual=config.manualRequest?await ctx.student.saveManual(agent.session.id,config.manualRequest,options.signal):null;
const rejected=[];for(const id of [agent.session.id+'-absent',...config.deniedSessions??[]]){try{await ctx.student.query(id,{kind:'settings'},options.signal);throw new Error('Unauthorized Session was accepted');}catch(error){if(error.code!=='student/main-session-required')throw error;rejected.push({sessionId:id,code:error.code});}}
await writeFile(config.result,JSON.stringify({query,settings,context,request,manual,rejected,requests:this.requests}));
const text='Recovery fixture completed with independently queried Student facts.';yield {type:'block-start',index:0,blockType:'text'};yield {type:'text-delta',index:0,text};yield {type:'block-end',index:0,block:{type:'text',text}};yield {type:'finish',reason:{kind:'stop'}};
}}
}ctx.effect(()=>ctx.llm.registerAdapter(['recovery-fixture'],new Fixture()));}
`)
  const legacyBytes = await readFile(new URL('./fixtures/legacy-recovery.json', import.meta.url))
  const legacy = JSON.parse(legacyBytes)
  const profile = legacy.profile
  async function run(flow, calls, extras = {}) {
    const resultPath = join(root, `${flow}.json`)
    const overlay = join(root, `${flow}.overlay.json`)
    await writeFile(overlay, JSON.stringify([
      { id: 'agent-default-model', config: { provider: 'recovery-fixture', model: 'recovery-fixture' } },
      { id: 'session-title-llm', disabled: true }, { id: 'session-telemetry-otel', disabled: true }, { id: 'llm-deepseek', disabled: true }, { id: 'llm-deepseek-account', disabled: true },
      { insert: [{ id: 'agent-preset-registry', name: '@deepseek-ai/dsh-agent-preset-registry', config: { default: 'student' } }, { id: 'recovery-fixture', name: model, config: { calls, result: resultPath, profile, ...extras } }] },
    ]))
    const output = await dsh('--profile', 'recovery', '--patch', overlay, '--permission-mode', 'danger-full-access', '--json', `/study Rehearse ${flow}. Fixture parent explicitly confirms the described operation.`)
    assert.equal(output.signal, undefined)
    await save(`${flow}.stdout.jsonl`, output.stdout)
    await save(`${flow}.stderr.log`, output.stderr)
    const result = JSON.parse(await readFile(resultPath, 'utf8'))
    await save(`${flow}.consumer.json`, json(result))
    const events = output.stdout.trim().split('\n').map(line => JSON.parse(line))
    const sessionId = events.find(event => event.type === 'session').sessionId
    assert.equal(result.requests.length, calls.length + 1)
    assert.equal(result.requests.at(-1).action, 'final')
    const toolCalls = events.filter(event => event.type === 'tool_call')
    assert.equal(toolCalls.length, calls.length)
    assert.ok(events.filter(event => event.type === 'tool_result').every(event => event.status === 'completed'))
    assert.ok(result.requests.some(request => JSON.stringify(request.messages).includes('<skill_content name=\\"study\\">')), '/study must load the bundled user-invocable skill')
    assert.equal(result.rejected.length, 1 + (extras.deniedSessions?.length ?? 0))
    flows.push({ flow, sessionId, nativeToolCalls: toolCalls.length, consumerStatus: result.query.status, manualStatus: result.manual?.status, deniedSessions: result.rejected.length })
    return result
  }
  const cli = bash(`${quote(process.execPath)} ${quote(join(packageRoot, 'lib/cli.js'))} validate --workspace ${quote(project)}`)
  await run('legacy-read-and-preserve', [write('.study/state.json', legacyBytes.toString()), status('learning-context'), ['read', { file_path: '.study/state.json' }], write('.study/v1-original.json', legacyBytes.toString())])
  assert.deepEqual(await readFile(join(project, '.study/state.json')), legacyBytes)
  assert.deepEqual(await readFile(join(project, '.study/v1-original.json')), legacyBytes)
  await save('v1-original.json', legacyBytes)
  const initial = await migration()
  assert.equal(initial.status, 'ready')
  assert.ok(initial.pending.some(fact => fact.fields.includes('answerDate')))
  const outputs = initial.outputs
  const settings = outputs.find(output => output.file.kind === 'term-settings')
  const interrupted = await run('migration-interrupted', [write(settings.path, json(settings.file)), cli, status('learning-context')])
  assert.equal(interrupted.query.status, 'invalid', 'Missing migration outputs must not appear as a complete current workspace')
  assert.equal(interrupted.query.data, null)
  const incomplete = await observe('interrupted migration', 1)
  assert.ok(incomplete.row.issues.some(issue => issue.rule === 'migration-incomplete'))
  const resumed = await migration()
  assert.equal(resumed.termId, initial.termId)
  assert.equal(resumed.outputs.find(output => output.path === settings.path).status, 'already-valid')
  assert.ok(resumed.outputs.some(output => output.status === 'missing'))
  await save('migration-interrupted.plan.json', json(resumed))
  await run('migration-source-change', [edit('.study/state.json', 'Recovery fixture', 'Changed legacy source'), cli, status('learning-context')])
  const changed = await observe('changed migration source', 1)
  assert.ok(changed.row.issues.some(issue => issue.rule === 'migration-source'))
  assert.equal(changed.read.workspace, undefined)
  assert.equal((await migration()).status, 'blocked')
  assert.deepEqual(await readFile(join(project, '.study/v1-original.json')), legacyBytes)
  await run('migration-source-repair-and-resume', [write('.study/state.json', legacyBytes.toString()), ...resumed.outputs.filter(output => output.status === 'missing').map(output => write(output.path, json(output.file))), cli, status('learning-context')])
  const migrated = await observe('completed migration', 0)
  assert.equal(migrated.read.status, 'valid')
  const correct = migrated.read.workspace.worksheets.find(sheet => sheet.id === 'workbook-legacy-correct')
  const helped = migrated.read.workspace.worksheets.find(sheet => sheet.id === 'workbook-legacy-helped')
  assert.equal(correct.responses[0].rawResponse, 'I got eleven.')
  assert.equal(correct.responses[0].assistance, 'unknown')
  assert.deepEqual(correct.responses[0].answerDate, { kind: 'unknown' })
  assert.equal(helped.responses[0].assistance, 'hint')
  assert.equal((await migration()).outputs.every(output => output.status === 'already-valid'), true)
  assert.equal(queryWorkspace(migrated.read, { kind: 'summary' }, legacy.updatedAt).data.practisedGoals, 0)
  assert.equal(queryWorkspace(migrated.read, { kind: 'summary' }, legacy.updatedAt).data.masteredGoals, 0)

  const names = ['Observed version one', 'Observed version two', 'Observed version three', profile.nickname]
  let nickname = profile.nickname
  const retentionCalls = []
  for (const next of names) {
    retentionCalls.push(edit('.study/settings.json', nickname, next), status('settings'))
    nickname = next
  }
  await run('bounded-observed-backups', retentionCalls)

  const baseline = await run('backup-observation-and-restart', [cli, status('settings')])
  const backupSet = await readBackups(nodeStudyFiles(project), signal)
  assert.equal(backupSet.issues.length, 0)
  assert.equal(backupSet.backups.filter(candidate => candidate.backup.sourcePath === '.study/settings.json').length, 3)
  assert.ok(backupSet.backups.length <= 128)
  assert.ok(backupSet.backups.reduce((sum, candidate) => sum + Buffer.byteLength(candidate.backup.bytesBase64, 'base64'), 0) <= 33_554_432)
  const restoredHash = hash(await readFile(join(project, '.study/settings.json')))
  const chosen = backupSet.backups.find(candidate => candidate.backup.sourcePath === '.study/settings.json' && candidate.backup.sha256 === restoredHash)
  assert.ok(chosen, 'An actual application observation must retain recovery material')
  const invalid = '{"format":2,"kind":"term-settings", invalid original\n'
  const broken = await run('invalid-file-pauses-manual-save', [write('.study/settings.json', invalid), cli, status('learning-context')], { manualRequest: baseline.request })
  assert.equal(broken.query.data, null)
  assert.equal(broken.manual.status, 'invalid')
  assert.equal(await readFile(join(project, '.study/settings.json'), 'utf8'), invalid)
  await observe('invalid current original', 1)
  const restore = describeRestore(await readWorkspace(nodeStudyFiles(project), signal), chosen)
  assert.equal(restore.status, 'available')
  assert.equal(restore.preserveCurrent.sha256, hash(invalid))
  await save('explicit-restore-choice.json', json({ chosen, restore }))
  await run('explicit-backup-restore', [write('.study/invalid-settings-original.json', invalid), write('.study/settings.json', Buffer.from(chosen.backup.bytesBase64, 'base64').toString()), cli, status('settings')])
  assert.equal(await readFile(join(project, '.study/invalid-settings-original.json'), 'utf8'), invalid)
  assert.deepEqual(await readFile(join(project, '.study/settings.json')), Buffer.from(chosen.backup.bytesBase64, 'base64'))
  await observe('explicit restored version', 0)

  const source = await readWorkspace(nodeStudyFiles(project), signal)
  const termId = source.workspace.settings.termId
  const archivePath = `.study/archives/${termId}`
  const archiveOutput = source.files.filter(row => row.file)
  await run('archive-partial-export', [write(`${archivePath}/settings.json`, json(source.workspace.settings)), status('settings')])
  const fs = nodeStudyFiles(project)
  const archive = () => readWorkspace(archiveFiles(fs, termId), signal)
  const partial = describeArchive(source, await archive(), await readWorkspace(fs, signal))
  assert.equal(partial.status, 'export-needed')
  assert.ok(partial.missingPaths.includes('.study/worksheets/workbook-legacy-correct.json'))
  await save('archive-partial.json', json(partial))
  await run('archive-export-complete-active-retained', [
    ...archiveOutput.filter(row => row.path !== '.study/settings.json').map(row => write(row.path.replace(/^\.study/u, archivePath), Buffer.from(row.bytes).toString())),
    write(`${archivePath}/state.json`, legacyBytes.toString()), write(`${archivePath}/v1-original.json`, legacyBytes.toString()), cli, status('settings'),
  ])
  assert.equal(describeArchive(source, await archive(), await readWorkspace(fs, signal)).status, 'export-valid-active-retained')
  for (const row of archiveOutput) assert.deepEqual(await readFile(join(project, row.path.replace(/^\.study/u, archivePath))), Buffer.from(row.bytes))
  const oldRequest = (await run('archive-before-replacement-restart', [cli, status('settings')])).request
  await run('archive-active-replacement-interrupted', [write('.study/settings.json', invalid), cli])
  assert.equal(describeArchive(source, await archive(), await readWorkspace(fs, signal)).status, 'export-valid-active-unknown')
  const nextSettings = { ...source.workspace.settings, termId: 'new-term', profile: { ...profile }, revision: source.workspace.settings.revision }
  delete nextSettings.migration
  await run('new-term-old-request-denied', [bash(`${quote(process.execPath)} -e ${quote("const fs=require('node:fs');for(const path of ['.study/blocks','.study/worksheets','.study/collections.json'])fs.rmSync(path,{recursive:true,force:true});")}`), write('.study/settings.json', json(nextSettings)), cli, status('settings')], { manualRequest: oldRequest, deniedSessions: flows.map(flow => flow.sessionId) })
  assert.equal(flows.at(-1).manualStatus, 'old-term')
  assert.equal(describeArchive(source, await archive(), await readWorkspace(fs, signal)).status, 'complete')
  const restarted = await run('new-term-restart', [cli, status('settings')], { manualRequest: oldRequest })
  assert.equal(restarted.query.data.termId, 'new-term')
  assert.equal(restarted.manual.status, 'old-term')
  assert.equal(restarted.settings.data.revision, source.workspace.settings.revision)
  await observe('new term after process restart', 0)
  assert.deepEqual(await readFile(join(project, `${archivePath}/v1-original.json`)), legacyBytes)
  assert.equal(await readFile(join(project, '.study/invalid-settings-original.json'), 'utf8'), invalid)

  const sessionRoot = join(env.DSH_HOME, 'sessions')
  const generations = new Map()
  for (const name of (await readdir(sessionRoot, { recursive: true })).filter(name => /session\.v\d+\.jsonl\.zstd$/u.test(name))) {
    const key = dirname(name), version = Number(/session\.v(\d+)/u.exec(name)[1])
    if (!generations.has(key) || generations.get(key).version < version) generations.set(key, { name, version })
  }
  let persistedCalls = 0
  for (const [key, { name }] of generations) {
    const text = zstdDecompressSync(await readFile(join(sessionRoot, name))).toString()
    const events = text.trim().split('\n').map(line => JSON.parse(line))
    assert.deepEqual(events.filter(event => event.type === 'turn/end').map(event => event.data.reason), [{ kind: 'completed' }])
    persistedCalls += events.filter(event => event.type === 'tool/call').length
    await save(`${key.split('/').at(-1)}.session.jsonl`, text)
  }
  assert.equal(generations.size, flows.length)
  assert.equal(persistedCalls, flows.reduce((sum, flow) => sum + flow.nativeToolCalls, 0))
  await save('observations.json', json(evidence))
  const summary = { flows, persistedCalls, cliReadOnlyObservations: evidence.length, v1Sha256: hash(legacyBytes), migratedTermId: termId, newTermId: 'new-term', legacyFacts: { originalResponses: 2, helpedResponses: 1, unknownAnswerDates: 2, unknownAssistance: 1, practisedGoals: 0, masteredGoals: 0 }, recovery: { originalBytesPreserved: true, partialMigrationResumed: true, changedSourceRejected: true, observedBackupVersionsPerSettings: 3, explicitRestoreRevalidated: true, partialArchiveResumed: true, equalRevisionOldTermRejected: true }, limits: ['Synthetic copied real-format v1 material; no private learner history.', 'Headless has no Web listener; real browser and fixed Git install are separate acceptance.', 'Keyless scripted tool calls do not establish tutoring, OCR, OpenMAIC or printer quality.'], cleanup: 'Owned subprocess exits awaited before temporary Home/Documents removal.' }
  await save('summary.json', json(summary))
  process.stdout.write(json(summary))
} finally {
  await rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
}
