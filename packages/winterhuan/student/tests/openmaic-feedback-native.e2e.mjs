import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath, pathToFileURL } from 'node:url'
const execute = promisify(execFile)
const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const dshBin = await realpath(process.env.DSH_BIN ?? '/Users/winter/.nvm/versions/node/v24.22.2/bin/dsh')
const runtime = createRequire(dshBin)
const root = await mkdtemp(join(tmpdir(), 'student-openmaic-native-'))
const project = join(root, 'project')
const outputRoot = process.env.STUDENT_EVIDENCE_DIR
// Online evidence retains an existing original job/capture; the fixture imports protected metadata only.
const onlineRoot = process.env.STUDENT_OPENMAIC_ONLINE_DIR
const online = onlineRoot ? { job: JSON.parse(await readFile(join(onlineRoot, 'job.json'), 'utf8')), auth: JSON.parse(await readFile(join(onlineRoot, 'auth.json'), 'utf8')), capture: JSON.parse(await readFile(join(onlineRoot, 'capture.json'), 'utf8')) } : undefined
if (online && !outputRoot) throw new Error('Online acceptance requires a private evidence directory.')
const { nodeStudyFiles, readWorkspace, queryWorkspace } = await import(pathToFileURL(join(packageRoot, 'lib/files.js')).href)
let records = []
let sourceReads = 0
let generations = 0
const generationRequirements = []
const snapshot = { id: 'official-q', type: 'single', question: '9 − 4 equals?', options: [{ value: 'A', label: '5' }, { value: 'B', label: '5.0' }], answer: ['A'], analysis: '5.0 and 5 are the same value.' }
const snapshots = [snapshot, { ...snapshot, id: 'official-q-2', question: '8 − 3 equals?' }, { ...snapshot, id: 'official-q-3', question: '7 − 2 equals?' }]
const attemptRecords = index => ['submitted', 'reviewed'].map((phase, seq) => ({ id: `attempt-${index}-record-${seq}`, sessionId: `attempt-${index}`, seq, sceneId: 'scene-1', createdAt: '2026-11-20T01:00:00Z', payload: { payloadVersion: 1, phase, answers: { [snapshots[index - 1].id]: 'B' }, ...(phase === 'reviewed' ? { results: [{ questionId: snapshots[index - 1].id, correct: false, status: 'incorrect', earned: 0 }] } : {}) } }))
const server = createServer(async (req, res) => {
  const url = new URL(req.url, 'http://fixture.test')
  const path = url.pathname
  let value
  if (path === '/fixture/submit') { records = [1, 2].flatMap(attemptRecords); value = { submitted: true } }
  else if (path === '/fixture/later-session') { records.push(...attemptRecords(3)); value = { submitted: true } }
  else if (path.endsWith('/learner-key')) value = { learnerKey: 'user:fixture-parent' }
  else if (path === '/api/generate-classroom') { let body = ''; for await (const chunk of req) body += chunk; generationRequirements.push(JSON.parse(body).requirement); generations++; value = { jobId: `job-${generations}`, pollUrl: `/api/generate-classroom/job-${generations}` } }
  else if (path.startsWith('/api/generate-classroom/job-')) value = { status: 'succeeded', result: { classroomId: 'stage-' + path.split('job-')[1] } }
  else if (path.endsWith('/manifest')) value = { rev: 1, scenes: [{ id: 'scene-1', order: 0, rev: 1 }] }
  else if (path === '/api/persistence/documents/stage-1') value = { dslVersion: '0.3.0', stage: { id: 'stage-1' }, scenes: [{ id: 'scene-1', stageId: 'stage-1', type: 'quiz', content: { type: 'quiz', questions: snapshots } }] }
  else { sourceReads++; const sessions = [...new Set(records.map(record => record.sessionId))].map(id => ({ id, runtimeDslVersion: '0.1.0', kind: 'quizAttempt', stageId: 'stage-1', learnerKey: 'user:fixture-parent', status: 'completed', createdAt: '2026-11-20T01:00:00Z', updatedAt: '2026-11-20T01:00:00Z' })); value = path.endsWith('/records') ? records.filter(record => path.includes('/' + record.sessionId + '/')) : path.endsWith('/sessions') ? sessions : sessions.find(session => path.endsWith('/' + session.id)) }
  res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(value))
})
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
const address = server.address(); assert.ok(address && typeof address !== 'string')
const base = online?.job.baseUrl ?? `http://127.0.0.1:${address.port}`
const token = online?.auth.token ?? `fixture.${Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 7 * 86400 })).toString('base64url')}.signature`
const env = { ...process.env, DSH_HOME: join(root, 'home'), DSH_AGENTS_HOME: join(root, 'agents'), DSH_TELEMETRY_DISABLED: '1', NO_PROXY: '127.0.0.1,localhost', STUDENT_FIXTURE_TOKEN: token }
const quote = value => `'${value.replaceAll("'", "'\\''")}'`
const now = Date.parse('2026-11-20T01:00:00Z')
const profile = { nickname: 'Official fixture', region: '上海市', grade: 2, term: 'first', schoolYear: '2026-2027', schoolSystem: 'five-four', schoolAlias: '', parentConfirmation: 'Fixture parent confirms the profile.' }
const settings = { format: 2, kind: 'term-settings', learnerId: online?.job.learnerId ?? 'fixture-child', termId: online?.job.termId ?? 'fixture-term', revision: 1, updatedAt: now, profile, materials: [], courses: [] }
const seed = { id: 'seed', objectiveId: online?.capture.binding.goalId ?? 'm.sub', capability: online ? { goalId: online.capture.binding.goalId, familyId: online.capture.binding.familyId, scope: online.capture.binding.scope } : { goalId: 'm.sub', familyId: 'math.sub-basic', scope: { id: 'within20', description: 'Written subtraction without borrowing within20', modality: 'written', numberMax: 20 } }, source: { kind: 'authored', description: 'Original fixture target' }, topic: 'Subtraction', prompt: '9 − 4?', answer: '5', explanation: 'Remove four', answerEvidence: '9 − 4 = 5' }
if (online) Object.assign(seed, { topic: 'Addition by making ten', prompt: '9 + 5 equals?', answer: '14', explanation: '9 + 1 + 4 = 14', answerEvidence: 'Split five into one and four, make ten, then add four.' })
const block = { format: 2, kind: 'block', learnerId: settings.learnerId, termId: settings.termId, id: online?.job.blockId ?? 'fixture-block', subject: 'math', mode: 'foundation', startedAt: now, context: { profile }, currentQuestionId: seed.id, questions: [seed], responses: [], hints: [], assessments: [] }
const owner = { learnerId: settings.learnerId, termId: settings.termId, blockId: block.id }
const dsh = async (...args) => { try { return await execute(process.execPath, [dshBin, ...args], { cwd: project, env, timeout: 120000, maxBuffer: 32 * 1024 * 1024 }) } catch (error) { if (!online) throw error; await mkdir(outputRoot, { recursive: true, mode: 0o700 }); await writeFile(join(outputRoot, 'failed.stdout.jsonl'), error.stdout ?? '', { mode: 0o600 }); await writeFile(join(outputRoot, 'failed.stderr.log'), error.stderr ?? '', { mode: 0o600 }); throw new Error('Online native acceptance failed; protected diagnostic output saved in the private evidence directory.') } }
try {
  await mkdir(project)
  if (outputRoot) await mkdir(outputRoot, { recursive: true, mode: 0o700 })
  await dsh('--profile', 'feedback', '--from-default-profile', 'headless', '--dump-config')
  await dsh('plugin', '--profile', 'feedback', 'add', `link:${packageRoot}`)
  const wrapper = join(root, 'validate.mjs')
  await writeFile(wrapper, `import assert from 'node:assert/strict';import {execFile} from 'node:child_process';import {readFile,readdir,stat,appendFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {promisify} from 'node:util';
const cwd=process.argv[2];async function snapshot(){const result=[];for(const name of (await readdir(cwd+'/.study',{recursive:true})).sort()){const path=cwd+'/.study/'+name;const info=await stat(path,{bigint:true});if(info.isFile())result.push([name,info.size.toString(),info.mtimeNs.toString(),createHash('sha256').update(await readFile(path)).digest('hex')]);}return result;}
const before=await snapshot();const result=await promisify(execFile)(process.execPath,[${JSON.stringify(join(packageRoot, 'lib/cli.js'))},'validate','--workspace',cwd]);assert.deepEqual(await snapshot(),before);const cli=JSON.parse(result.stdout);assert.equal(cli.ok,true);assert.equal(cli.status,'valid');assert.deepEqual(cli.issues,[]);await appendFile(${JSON.stringify(join(root, 'cli.jsonl'))},JSON.stringify({cli,bytesAndVersionsInvariant:true})+'\\n');console.log(JSON.stringify(cli));`)
  const fixture = join(root, 'model.mjs')
  const protectedMetadata = join(root, 'protected.json')
  if (online) await writeFile(protectedMetadata, JSON.stringify(online), { mode: 0o600 })
  await writeFile(fixture, `import {appendFile,readFile} from 'node:fs/promises';import {createHash} from 'node:crypto';import {credentialKey} from ${JSON.stringify(pathToFileURL(runtime.resolve('@deepseek-ai/dsh-credentials')).href)};import {LlmAdapter} from ${JSON.stringify(pathToFileURL(runtime.resolve('@deepseek-ai/dsh-llm')).href)};
export const inject=['llm','credentials'];export async function apply(ctx,config){if(config.online){const online=JSON.parse(await readFile(config.metadata,'utf8'));const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');const jobKey=credentialKey('student-openmaic','job-'+digest([config.workspace,online.job.learnerId,online.job.termId,online.job.blockId]));await ctx.credentials.modifyRecord(jobKey,async current=>current??{kind:'grant',payload:online.job});await ctx.credentials.modifyRecord(credentialKey('student-openmaic','capture-'+config.partition),async current=>current??{kind:'grant',payload:online.capture});}class Fixture extends LlmAdapter{index=0;lesson;block=${JSON.stringify(block)};async listModels(provider){return [{provider,id:'student-feedback-fixture',name:'Student feedback fixture',contextWindow:1000000,maxTokens:16000}];}async *stream(options){options.signal?.throwIfAborted();const prior=options.messages.filter(message=>message.role==='tool').at(-1);let value;try{value=JSON.parse(prior?.content.filter(block=>block.type==='text').map(block=>block.text).join('')??'null');}catch{};const write=(file_path,content)=>['write',{file_path,content:JSON.stringify(content,null,2)+'\\n'}];const edit=(file_path,before,after)=>['edit',{file_path,old_string:JSON.stringify(before,null,2),new_string:JSON.stringify(after,null,2)}];const validate=['bash',{command:${JSON.stringify(`${quote(process.execPath)} ${quote(wrapper)} ${quote(project)}`)},description:'Run built read-only CLI and verify byte/version invariance',timeoutMs:30000,run_in_background:false}];let next;
if(config.restart){if(this.index===0)next=['study_status',{kind:'learning-context'}];}
else switch(this.index){
case 0:next=write('.study/settings.json',${JSON.stringify(settings)});break;
case 1:next=write(${JSON.stringify('.study/blocks/'+block.id+'.json')},this.block);break;
case 2:next=['openmaic_generate',${JSON.stringify(online ? { ...owner, jobId: online.job.jobId } : { ...owner, requirement: 'Subtraction within20 without borrowing; compare equivalent numeric representations.' })}];break;
case 3:next=['openmaic_generate',{...${JSON.stringify(owner)},jobId:value.jobId}];break;
case 4:this.lesson={id:'fixture-lesson',...value,subject:'math',objectiveId:${JSON.stringify(seed.objectiveId)},title:'Subtraction',requirement:'Subtraction within20',createdAt:new Date(${now}).toISOString(),updatedAt:new Date(${now}).toISOString()};next=write('.study/openmaic-lessons.json',{format:1,lessons:[this.lesson]});break;
case 5:next=['openmaic_feedback',{action:'prepare',lessonId:'fixture-lesson'}];break;
case 6:{const old={format:1,lessons:[this.lesson]};this.lesson={...this.lesson,feedback:value.feedback};next=edit('.study/openmaic-lessons.json',old,{format:1,lessons:[this.lesson]});break;}
case 7:next=config.online?['study_status',{kind:'learning-context'}]:['bash',{command:${JSON.stringify(`${quote(process.execPath)} -e ${quote(`fetch('${base}/fixture/submit',{method:'POST'}).then(r=>r.json()).then(x=>console.log(JSON.stringify(x)))`)}`)},description:'Submit only the synthetic official HTTP source fixture after frozen capture',timeoutMs:30000,run_in_background:false}];break;
case 8:next=['openmaic_feedback',{action:'read',lessonId:'fixture-lesson'}];break;
case 9:{if(value.consumption.status!=='pending')throw new Error('Interrupted import must remain pending');const records=value.records;if(value.nextOffset!==null)throw new Error('Online acceptance needs bounded all-record pagination');const record=records[0];this.block={...this.block,currentQuestionId:record.question.id,currentResponseId:record.response.id,questions:[...this.block.questions,...records.map(row=>row.question).filter((question,index,all)=>all.findIndex(item=>item.id===question.id)===index)],responses:records.map(row=>row.response),assessments:records.map(row=>row.assessment)};next=write(${JSON.stringify('.study/blocks/'+block.id+'.json')},this.block);break;}
case 10:next=validate;break;
case 11:next=['study_status',{kind:'learning-context'}];break;
case 12:next=['openmaic_feedback',{action:'read',lessonId:'fixture-lesson'}];break;
case 13:{if(!config.online&&JSON.stringify(value.consumption.checkpoint?.attempts)!==JSON.stringify([{attemptId:'attempt-1',seq:1},{attemptId:'attempt-2',seq:1}]))throw new Error('Distinct question sessions must keep their separate sequence zero submissions');if(value.consumption.status!=='accepted')throw new Error('Independent reader did not accept the saved import');const before={format:1,lessons:[this.lesson]};this.lesson={...this.lesson,checkpoint:value.consumption.checkpoint};next=edit('.study/openmaic-lessons.json',before,{format:1,lessons:[this.lesson]});break;}
case 14:next=validate;break;
case 15:next=['study_status',{kind:'learning-context'}];break;
case 16:if(!config.online){if(value.data.nextAction.kind!=='supplement')throw new Error('Accepted official answer must request only missing evidence');this.requirement=value.data.nextAction.requirement;this.block={...this.block,endedAt:${now}};next=write(${JSON.stringify('.study/blocks/'+block.id+'.json')},this.block);}break;
case 17:if(!config.online){this.followup={...${JSON.stringify(block)},id:'fixture-followup'};next=write('.study/blocks/fixture-followup.json',this.followup);}break;
case 18:if(!config.online)next=['study_status',{kind:'learning-context'}];break;
case 19:if(!config.online){if(value.status!=='valid')throw new Error('Followup formal files must be independently valid');next=['openmaic_generate',{...${JSON.stringify(owner)},blockId:'fixture-followup',requirement:this.requirement}];}break;
case 20:if(!config.online)next=['openmaic_generate',{...${JSON.stringify(owner)},blockId:'fixture-followup',jobId:value.jobId}];break;
case 21:if(!config.online){const questions=['check-1','check-2','check-3'].map(id=>({...${JSON.stringify(seed)},id}));this.followup={...this.followup,currentQuestionId:'check-3',questions:[...this.followup.questions,...questions],rounds:[{id:'native-check',kind:'check',startedAt:${now},members:[${JSON.stringify(seed.capability)}],enteredFamilyIds:[${JSON.stringify(seed.capability.familyId)}],presentedQuestionIds:questions.map(question=>question.id)}]};next=write('.study/blocks/fixture-followup.json',this.followup);}break;
case 22:if(!config.online)next=validate;break;
case 23:if(!config.online)next=['study_status',{kind:'learning-context'}];break;
case 24:if(!config.online){if(value.data.round?.remaining!==0||value.data.nextAction.kind!=='answer')throw new Error('The third presented instance must retain its answer action without granting a fourth');this.followup={...this.followup,endedAt:${now+1},rounds:this.followup.rounds.map(round=>({...round,endedAt:${now+1},endReason:'budget-exhausted'}))};next=write('.study/blocks/fixture-followup.json',this.followup);}break;
case 25:if(!config.online)next=validate;break;
case 26:if(!config.online)next=['study_status',{kind:'learning-context'}];break;
case 27:if(!config.online&&value.data.nextAction.reason!=='check-budget-exhausted')throw new Error('Ending the block must preserve the exhausted check allowance');if(!config.online)next=['study_status',{kind:'learning-context'}];break;
case 28:if(!config.online)next=['bash',{command:${JSON.stringify(`${quote(process.execPath)} -e ${quote(`fetch('${base}/fixture/later-session',{method:'POST'}).then(r=>r.json()).then(x=>console.log(JSON.stringify(x)))`)}`)},description:'Add a later synthetic session after the earlier checkpoint was accepted',timeoutMs:30000,run_in_background:false}];break;
case 29:if(!config.online)next=['openmaic_feedback',{action:'read',lessonId:'fixture-lesson'}];break;
case 30:if(!config.online){if(value.records.length!==3||value.consumption.status!=='pending')throw new Error('A newly discovered session must remain pending until its native import');const records=value.records;this.block={...this.block,questions:[${JSON.stringify(seed)},...records.map(row=>row.question)],responses:records.map(row=>row.response),assessments:records.map(row=>row.assessment)};next=write(${JSON.stringify('.study/blocks/'+block.id+'.json')},this.block);}break;
case 31:if(!config.online)next=validate;break;
case 32:if(!config.online)next=['study_status',{kind:'learning-context'}];break;
case 33:if(!config.online)next=['openmaic_feedback',{action:'read',lessonId:'fixture-lesson'}];break;
case 34:if(!config.online){if(value.consumption.status!=='accepted'||value.consumption.checkpoint.attempts.length!==3)throw new Error('Later session must be independently accepted before checkpoint advancement');const before={format:1,lessons:[this.lesson]};this.lesson={...this.lesson,checkpoint:value.consumption.checkpoint};next=edit('.study/openmaic-lessons.json',before,{format:1,lessons:[this.lesson]});}break;
case 35:if(!config.online)next=validate;break;
case 36:if(!config.online)next=['study_status',{kind:'learning-context'}];break;
case 37:if(!config.online&&value.data.officialFeedback.length!==3)throw new Error('Independent consumer must retain all three distinct question sessions');break;


}
this.index++;await appendFile(config.telemetry,JSON.stringify({index:this.index,action:next?.[0]??'final',messages:options.messages,tools:options.tools??[],promptCharacters:JSON.stringify(options.messages).length})+'\\n');if(next){const [name,args]=next;if(!(options.tools??[]).some(tool=>tool.name===name))throw new Error('Missing native '+name);const id='feedback-'+this.index;yield {type:'block-start',index:0,blockType:'tool-call'};yield {type:'tool-call-delta',index:0,id,name,argumentsDelta:JSON.stringify(args)};yield {type:'block-end',index:0,block:{type:'tool-call',id,name,arguments:JSON.stringify(args)}};yield {type:'finish',reason:{kind:'tool-calls'}};}else{const text='Native source import and independent file consumption finished.';yield {type:'block-start',index:0,blockType:'text'};yield {type:'text-delta',index:0,text};yield {type:'block-end',index:0,block:{type:'text',text}};yield {type:'finish',reason:{kind:'stop'}};}}}ctx.effect(()=>ctx.llm.registerAdapter(['student-feedback-fixture'],new Fixture()));}`)
  const runs = []
  for (const restart of [false, true]) {
    const name = restart ? 'restart' : 'import'
    const telemetry = join(root, `${name}.requests.jsonl`)
    const overlay = join(root, `${name}.overlay.json`)
    await writeFile(overlay, JSON.stringify([
      { id: 'credentials', disabled: false }, { id: 'agent-default-model', config: { provider: 'student-feedback-fixture', model: 'student-feedback-fixture' } }, { id: 'session-title-llm', disabled: true }, { id: 'session-telemetry-otel', disabled: true }, { id: 'llm-deepseek', disabled: true }, { id: 'llm-deepseek-account', disabled: true },
      { id: 'student', config: { openmaic: { baseUrl: base, accountBaseUrl: `${base}/api`, tokenRef: 'STUDENT_FIXTURE_TOKEN', accountRef: '', passwordRef: '', accessCodeRef: '', accountId: '', browserProfileRoot: join(root, 'browser') } } },
      { id: 'preset-student', disabled: true },
      { insert: [{ id: 'student-headless-capabilities', name: join(packageRoot, 'lib/agent.js') }, { id: 'feedback-fixture', name: fixture, config: { restart, telemetry, online: !!online, metadata: protectedMetadata, workspace: await realpath(project), partition: online ? createHash('sha256').update(JSON.stringify([online.capture.base, online.capture.stageId, online.capture.learnerKey])).digest('hex') : '' } }] },
    ]))
    const result = await dsh('--profile', 'feedback', '--patch', overlay, '--permission-mode', 'danger-full-access', '--json', online ? 'Read the authorized original official classroom records and import them through native tools. Confirmed original learner and tested scope are retained.' : 'Execute the authorized synthetic official-source/native-authoring fixture. Fixture confirmations are explicit.')
    assert.equal(result.signal, undefined)
    const requests = (await readFile(telemetry, 'utf8')).trim().split('\n').map(JSON.parse)
    const events = result.stdout.trim().split('\n').map(JSON.parse)
    const statuses = requests.flatMap(request => request.messages.filter(message => message.role === 'tool').flatMap(message => { try { const value = JSON.parse(message.content.filter(block => block.type === 'text').map(block => block.text).join('')); return value.data?.officialFeedback ? [value.data] : [] } catch { return [] } }))
    assert.ok(statuses.some(value => value.officialFeedback.some(item => item.sourceStatus === 'known' && item.result === 'correct' && item.grading === (online ? 'aligned' : 'equivalent') && item.assistance === 'unknown' && item.answerDate.kind === 'unknown')))
    assert.equal(requests.at(-1).action, 'final')
    if (outputRoot) { await mkdir(outputRoot, { recursive: true, mode: 0o700 }); await writeFile(join(outputRoot, `${name}.requests.jsonl`), await readFile(telemetry)); await writeFile(join(outputRoot, `${name}.events.jsonl`), result.stdout); await writeFile(join(outputRoot, `${name}.stderr.log`), result.stderr) }
    runs.push({ name, toolCalls: events.filter(event => event.type === 'tool_call').length, nativeTools: [...new Set(requests.map(request => request.action))], independentAcceptedSources: statuses.at(-1)?.officialFeedback.length ?? 0, firstPromptCharacters: requests[0].promptCharacters })
  }
  const read = await readWorkspace(nodeStudyFiles(project), new AbortController().signal)
  assert.equal(read.status, 'valid')
  const saved = read.workspace.blocks.find(item => item.id === block.id)
  assert.equal(saved.responses.length, 3)
  assert.equal(saved.assessments.length, 3)
  if (!online) { assert.deepEqual(saved.responses.map(response => [response.source.attemptId, response.source.submission.seq]).sort(), [['attempt-1', 0], ['attempt-2', 0], ['attempt-3', 0]]); assert.equal(saved.responses[0].rawResponse, '"B"'); assert.equal(saved.assessments[0].official.result.correct, false); assert.equal(saved.assessments[0].result, 'correct') }
  else { assert.equal(saved.assessments.filter(item => item.result === 'correct').length, 2); assert.equal(saved.assessments.filter(item => item.result === 'incorrect').length, 1) }
  assert.equal(queryWorkspace(read, { kind: 'summary' }, Date.now()).data.masteredGoals, 0)
  assert.equal(queryWorkspace(read, { kind: 'learning-context' }, Date.now()).data.officialFeedback[0].sourceStatus, 'unknown')
  const lessons = JSON.parse(await readFile(join(project, '.study/openmaic-lessons.json'), 'utf8'))
  if (!online) assert.deepEqual(lessons.lessons[0].checkpoint.attempts, [{ attemptId: 'attempt-1', seq: 1 }, { attemptId: 'attempt-2', seq: 1 }, { attemptId: 'attempt-3', seq: 1 }]); else assert.ok(lessons.lessons[0].checkpoint.attempts.length)
  const cli = (await readFile(join(root, 'cli.jsonl'), 'utf8')).trim().split('\n').map(JSON.parse)
  assert.equal(cli.length, online ? 2 : 6)
  assert.ok(cli.every(row => row.bytesAndVersionsInvariant))
  assert.equal(generations, online ? 0 : 2)
  if (!online) {
    const requirement = JSON.parse(generationRequirements[1])
    assert.equal(requirement.goalId, 'm.sub')
    assert.equal(requirement.action, 'supplement')
    assert.ok(requirement.missingCriteria.some(item => item.criteria.includes('method') && item.criteria.includes('variation') && !item.criteria.includes('basic')))
    assert.ok(requirement.feedback.some(item => item.result === 'correct' && item.assistance === 'unknown' && item.answerDate.kind === 'unknown'))
    assert.equal(read.workspace.blocks.find(item => item.id === 'fixture-followup').responses.length, 0)
    assert.notEqual(generationRequirements[0], generationRequirements[1])
    const continuation = queryWorkspace(read, { kind: 'learning-context', subject: 'english' }, now + 86400000).data
    assert.equal(continuation.round.id, 'native-check')
    assert.equal(continuation.round.remaining, 0)
    assert.equal(continuation.nextAction.reason, 'check-budget-exhausted')
    assert.deepEqual(continuation.legalActions, ['request-teaching', 'switch-block', 'rest'])
  }
  const summary = { runs, generations, sourceReads: online ? 'Authorized original transport rereads; private native receipts retained.' : sourceReads, cliInvocations: cli.length, nativeAuthoring: true, feedbackDrivenNextGeneration: !online, distinctQuestionSessionsStartingAtZero: !online, laterSessionImportedAfterCheckpoint: !online, restartIndependentRead: true, persistedNativeCheckAllowance: !online, checkpointAfterIndependentAcceptance: true, unknownDatesAndHelpPreserved: true, agentOnlyAcademicWrites: true, sourceWithoutAuthorizationExcluded: true, networkAndModel: online ? 'Actual authorized official records with a scripted native model. Protected original job/capture metadata is seeded; academic writes are exclusively native tools. Original classroom generation is validated separately.' : 'Synthetic HTTP source and scripted model; all native tools, protected transport, formal writer, built CLI and independent Student reader are real.', cleanup: 'Awaited subprocess and server closure before temporary directory removal.' }
  if (outputRoot) { await writeFile(join(outputRoot, 'summary.json'), JSON.stringify(summary, null, 2)); await writeFile(join(outputRoot, 'cli.jsonl'), await readFile(join(root, 'cli.jsonl'))); await writeFile(join(outputRoot, 'final-block.json'), JSON.stringify(saved)); await writeFile(join(outputRoot, 'final-lessons.json'), JSON.stringify(lessons)) }
  console.log(JSON.stringify(summary, null, 2))
} finally {
  server.closeAllConnections()
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  await rm(root, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 })
}
