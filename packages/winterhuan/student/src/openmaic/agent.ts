/** Reuse the fixed official bundle; adapt only its account and generation transport. */
import type { Context } from '@deepseek-ai/cordis'
import { apply as officialApply } from '@openmaic/dsh-openmaic'
import { z } from 'zod'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type {} from './service.ts'
import { readStudentWorkspace } from '../transport.ts'
import { registerOpenmaicFeedback } from './feedback-agent.ts'
import { applicationStudyFiles } from '../files/application.ts'
import { readLessonFile } from '../files/lessons.ts'
import { validateCourseWorkspace } from '../files/course-validation.ts'
import { sectionReadiness } from '../courses.ts'
import { courseReviewInput, reviewedCourseRequirement } from './review-input.ts'
import { courseReviewModel } from './review.ts'
import { generationRequestSchema } from './generation.ts'

export const name = 'student-openmaic-agent'
export const inject = ['llm', 'studentOpenmaic', 'tools', 'skills', 'systemPrompt']
/** Official render/widget/slide and four bundled skills retain their original implementations. */
export function apply(ctx: Context): void {
  registerOpenmaicFeedback(ctx)
  const generate = defineTool({
    name: 'openmaic_generate',
    description: 'Start one official OpenMAIC classroom and return its structured job identity immediately. Continue with the same learner, term, block and jobId to poll after interruption; generating and failed jobs are not learning evidence.',
    parameters: {
      learnerId: { type: 'string', required: true, description: 'Stable Student learner identity from the validated profile.' },
      termId: { type: 'string', required: true, description: 'Original learning term identity.' },
      blockId: { type: 'string', required: true, description: 'Original active learning block identity. One generated classroom per block.' },
      requirement: { type: 'string', description: 'Concrete goal, scope, gaps and teaching activity. Required for the initial submission.' },
      jobId: { type: 'string', description: 'Original returned job identity when continuing. Never replace it after timeout.' },
      language: { type: 'string', enum: ['zh-CN', 'en-US'], description: 'Classroom language.' },
      enableWebSearch: { type: 'boolean', description: 'Search factual sources for this lesson.' },
      enableImageGeneration: { type: 'boolean', description: 'Generate slide images.' },
      enableVideoGeneration: { type: 'boolean', description: 'Generate lesson video.' },
      enableTTS: { type: 'boolean', description: 'Generate spoken narration.' },
      agentMode: { type: 'string', enum: ['default', 'generate'], description: 'Official classroom generation mode.' },
    },
    output: { schema: { type: 'json' }, render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }] },
    isConcurrencySafe: () => true,
    async execute(args, exec) {
      const request = generationRequestSchema.parse(args)
      const workspace = exec.agent?.session.header.cwd
      if (!workspace) throw new Error('OpenMAIC requires the current Student workspace.')
      const { read } = await readStudentWorkspace(exec)
      const settings = z.object({ learnerId: z.string(), termId: z.string() }).safeParse(read.workspace?.settings)
      if (!settings.success || settings.data.learnerId !== request.learnerId || settings.data.termId !== request.termId || !read.workspace?.blocks.some(block => block.id === request.blockId)) throw new Error('Confirm the original Student learner, term and learning block before generating or continuing a classroom.')
      if (request.requirement && !request.jobId) {
        const lessons = await readLessonFile(applicationStudyFiles(exec), exec.signal)
        const lesson = lessons.file?.lessons.find(item => item.blockId === request.blockId && item.learnerId === request.learnerId && item.termId === request.termId)
        if (!lesson?.purpose || !lesson.teaching || lessons.status !== 'valid' || !read.workspace || validateCourseWorkspace(lessons.file!, read.workspace).length) throw new Error('Save and validate the unit section or explicitly chosen foundational lesson and full teaching plan before submission. Read references/unit-courses.md.')
        const course = lessons.file!.courses?.find(item => item.id === lesson.course?.id)
        if (lesson.course && (!course || sectionReadiness(course, lesson.course.sectionId) !== 'ready')) throw new Error('Confirm the material and school position before generating this section.')
        if (request.requirement !== lesson.requirement) throw new Error('Use the saved teaching requirement without replacing the original request.')
        const input = await courseReviewInput(applicationStudyFiles(exec), workspace, lesson, lessons.file!, exec.signal)
        request.requirement = reviewedCourseRequirement(input)
        const model = courseReviewModel(ctx, exec)
        const review = await ctx.studentOpenmaic.reviewer.review(input, model.model, model.generate, exec.signal)
        if (review.status !== 'passed') return { status: 'review-rejected', submitted: false, lessonId: lesson.id, reviewId: review.reviewId, issues: review.issues }
        request.reviewId = review.reviewId
        const latest = await readLessonFile(applicationStudyFiles(exec), exec.signal)
        if (latest.observation?.version !== lessons.observation?.version || latest.observation?.targetKey !== lessons.observation?.targetKey) throw new Error('The lesson changed during review. Read the current version before submission.')
        await courseReviewInput(applicationStudyFiles(exec), workspace, lesson, lessons.file!, exec.signal)

      }
      if ((request.requirement?.length ?? 0) > 8000) throw new Error('Keep the saved requirement and teaching plan within 8000 characters in total before submitting.')
      return z.json().parse(await ctx.studentOpenmaic.generation(workspace).run(request, exec.signal))
    },
  })
  const tools = new Proxy(ctx.tools, { get(target, key, receiver) {
    if (key === 'register') return (tool: Parameters<typeof ctx.tools.register>[0]) => target.register(tool.name === 'openmaic_generate' ? generate : tool)
    return Reflect.get(target, key, receiver)
  } })
  const systemPrompt = new Proxy(ctx.systemPrompt, { get(target, key, receiver) {
    if (key === 'section') return (section: Parameters<typeof ctx.systemPrompt.section>[0]) => target.section(section.name === 'tool:dsh-openmaic' ? { ...section, text: 'Use openmaic_generate for a complete classroom. It returns the official job identity promptly; continue the same job, then let the agent save validated lesson metadata. New learning starts with a full classroom. Use inline OpenMAIC widgets, slides and cards for targeted explanation and later review; review begins with recall or an attempt. Read study references/unit-courses.md and save the teaching and question plans before generation; questions receive independent review. Once ready, use openmaic_feedback action=review and save its returned quality, binding and questions. Load the matching authoring skill first.' } : section)
    return Reflect.get(target, key, receiver)
  } })
  officialApply(new Proxy(ctx, { get(target, key, receiver) { if (key === 'tools') return tools; if (key === 'systemPrompt') return systemPrompt; return Reflect.get(target, key, receiver) } }), { baseUrl: ctx.studentOpenmaic.connection.baseUrl })
}
