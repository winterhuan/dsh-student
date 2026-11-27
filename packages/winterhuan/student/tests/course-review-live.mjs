/** Opt-in real-model evaluation; never writes learner records or submits OpenMAIC generation. */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { createRequire } from 'node:module'
import { readFile, writeFile, realpath, mkdir } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { join, resolve } from 'node:path'
const run = promisify(execFile)
const profile = process.env.STUDENT_REVIEW_PROFILE
const evidence = process.env.STUDENT_REVIEW_EVIDENCE
if (!profile || !evidence || !process.env.STUDENT_REVIEW_ROUTE) throw new Error('Set STUDENT_REVIEW_PROFILE, STUDENT_REVIEW_ROUTE and STUDENT_REVIEW_EVIDENCE explicitly; this evaluation makes three paid model calls.')
const output = resolve(evidence)
await mkdir(output, { recursive: true, mode: 0o700 })
const packageRoot = fileURLToPath(new URL('..', import.meta.url))
const bin = await realpath((await run(process.platform === 'win32' ? 'where' : 'which', ['dsh'])).stdout.trim().split(/\r?\n/u)[0])
const runtime = createRequire(bin)
const fixture = JSON.parse(await readFile(new URL('./fixtures/course-language-regressions.json', import.meta.url), 'utf8'))
const route = JSON.parse(process.env.STUDENT_REVIEW_ROUTE)
const plugin = join(output, 'review-evaluation-plugin.mjs'), patch = join(output, 'review-evaluation-patch.json'), result = join(output, 'review-evaluation.json')
await writeFile(plugin, `import {writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {LlmAdapter} from ${JSON.stringify(pathToFileURL(runtime.resolve('@deepseek-ai/dsh-llm')).href)};
import {CourseReviewer,courseReviewModel} from ${JSON.stringify(pathToFileURL(join(packageRoot, 'lib/types/openmaic/review.js')).href)};
export const inject=['llm'];
export function apply(ctx){class Evaluation extends LlmAdapter{
async listModels(provider){return [{provider,id:'review-evaluation',name:'Review evaluation',contextWindow:100000,maxTokens:1000}]}
async *stream(options){const fixture=${JSON.stringify(fixture)},route=${JSON.stringify(route)};
const source=fixture.source,hash=createHash('sha256').update(source).digest('hex');
const teaching={revision:'v1',goal:'认识山和水',scope:'只判断字义，不测试读音',materialLimitations:'自编基础材料',introduction:'联系山水生活经验',explanation:'解释山和水的含义',demonstration:'示范根据字义理解山水',guidedPractice:'教师引导辨别山和水',independentPractice:'独立检验三题',summary:'回顾山和水',maxAssessmentQuestions:3};
const base={owner:{workspace:'synthetic-evaluation',learnerId:'synthetic-review',termId:'term',blockId:'block',lessonId:'lesson'},lessonContext:{purpose:'foundation'},subject:'chinese',requirement:'根据自编材料认识山和水的字义。',source,teaching};
const fixed=[{id:'q1',type:'single',question:'“山”通常指什么？',options:[{value:'A',label:'地面上高起的部分'},{value:'B',label:'可以流动的液体'}],answer:'A',analysis:'山是地面上高起的部分。'}, {id:'q2',type:'single',question:'小狗在（水）中游泳。句中的“水”指什么？',options:[{value:'A',label:'地面上高起的部分'},{value:'B',label:'一种液体'}],answer:'B',analysis:'水是液体，小狗在水中游泳。'}, {id:'q3',type:'single',question:'河流中流动的是（  ）。应填哪个字？',options:[{value:'A',label:'山'},{value:'B',label:'水'}],answer:'B',analysis:'河流中有水，所以填“水”。'}];
const make=questions=>({...base,plan:{revision:'v1',source:{path:'material.md',sha256:hash},target:{goalId:'c.recognize',familyId:'context',scope:{id:'meaning',description:'山水字义',modality:'written'}},questions:questions.map(q=>({...q,sourceQuote:source,completedAnswer:'待独立复核'}))}});
const cases=[{name:'observed-errors',input:make(fixture.questions),expected:'rejected'},{name:'corrected-control',input:make(fixed),expected:'passed'},{name:'ambiguous-control',input:make([{...fixed[2],question:'哪个地方有水？',options:[{value:'A',label:'河流'},{value:'B',label:'湖泊'}],answer:'A',analysis:'河流中有水。'}]),expected:'rejected'}];
const rows=[];for(const item of cases){const records=new Map();const reviewer=new CourseReviewer({load:async id=>records.get(id),save:async(id,value)=>{records.set(id,value)}});const model=courseReviewModel(ctx,{agent:{model:{current:()=>route}},signal:options.signal});const started=Date.now();try{const review=await reviewer.review(item.input,model.model,model.generate,options.signal);rows.push({name:item.name,expected:item.expected,elapsedMs:Date.now()-started,review})}catch(error){rows.push({name:item.name,expected:item.expected,elapsedMs:Date.now()-started,error:String(error)})}await writeFile(${JSON.stringify(result)},JSON.stringify({route,rows},null,2));}
const text='Independent review evaluation completed.';yield{type:'block-start',index:0,blockType:'text'};yield{type:'text-delta',index:0,text};yield{type:'block-end',index:0,block:{type:'text',text}};yield{type:'finish',reason:{kind:'stop'}};
}}
ctx.effect(()=>ctx.llm.registerAdapter(['student-review-evaluation'],new Evaluation()));}
`)
await writeFile(patch, JSON.stringify([{ id: 'credentials', disabled: false }, { id: 'agent-default-model', config: { provider: 'student-review-evaluation', model: 'review-evaluation' } }, { id: 'session-title-llm', disabled: true }, { insert: [{ id: 'student-review-evaluation', name: plugin }] }]))
const completed = await run(process.execPath, [bin, '--profile', profile, '--patch', patch, '--json', 'Run the isolated course-content review evaluation.'], { cwd: process.cwd(), timeout: 420000, maxBuffer: 4000000 })
await writeFile(join(output, 'review-evaluation.native.jsonl'), completed.stdout)
await writeFile(join(output, 'review-evaluation.stderr'), completed.stderr)
const report = JSON.parse(await readFile(result, 'utf8'))
for (const row of report.rows) console.log(JSON.stringify({ name: row.name, expected: row.expected, actual: row.review?.status, elapsedMs: row.elapsedMs, error: row.error, questions: row.review?.verdict.questions.map(q => ({ key: q.key, grammar: q.grammar, facts: q.facts, uniqueAnswer: q.uniqueAnswer, analysisCheck: q.analysisCheck, reason: q.reason })) }))
const observed = report.rows.find(row => row.name === 'observed-errors')?.review?.verdict.questions
const detected = observed?.find(q => q.key === 'q2')?.analysisCheck.correct === false && observed?.find(q => q.key === 'q3')?.grammar === false
const ambiguous = report.rows.find(row => row.name === 'ambiguous-control')?.review?.verdict.questions.find(q => q.key === 'q3')?.uniqueAnswer === false
if (!detected || !ambiguous || report.rows.some(row => row.review?.status !== row.expected)) process.exitCode = 1
