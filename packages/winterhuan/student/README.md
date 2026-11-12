---
description: "Install and use short primary-school learning with confirmed textbooks, local progress, virtual rewards and spaced mistake review; no time limits."
kind: "package-bundle"
---

# @winterhuan/dsh-student

English | [中文](README.zh.md)

## Summary

Guide a primary-school learner through short Chinese, mathematics and English activities from the Learning desk sidebar or `/study`. Keep answers, reflections, mistake reviews and virtual stars across conversations. Parents confirm the curriculum; there is no time limit. The first teaching reference targets Shanghai, grade two, first term. This package uses DSH chat and images, ships grade-two first-term Chinese and mathematics textbook pages, knowledge maps for grades one and two, and a validated exercise bank keyed to learning goals with mastery, weak points and a daily recommendation.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Install the prebuilt release through the [plugin market](https://winterhuan.github.io/dsh-creative/index.json), or use this pinned Git source with DSH `0.2.2-rc.1`:

```sh
dsh plugin --profile market add 'git+https://github.com/winterhuan/dsh-student.git#cbc8409b4d48d210a2df5b4dcfa0b24d58ef3903&path:/packages/winterhuan/student'
```

Replace `market` with the name of your existing DSH profile.

In a new or blank conversation, select **智能学习** (Smart learning) from the native mode menu, then open its workbench in the right sidebar. The workbench and domain Skills/tools are available only in this mode. Existing conversations retain their selected mode; start a new conversation in this mode to continue existing project files. Session state and project files are not migrated. Global settings remain available.

Install the built package into a DSH `0.2.2-rc.1` profile, open a dedicated learning workspace and invoke `/study`.

```sh
dsh plugin --profile student add ./packages/winterhuan/student
```

The profile must already provide Skills, tools, a Session filesystem and sandbox policy. A web profile also supplies chat, image attachments and the Learning desk sidebar. The bundle adds the `student` Host row and the `preset-student` mode row and does not install any creative package. Restart the profile after installing or rebuilding.

### Use the Learning desk

Select 智能学习 in a new conversation in the learning workspace, then choose Learning desk from the right sidebar. The desk has a student page and a parent page. On the student page, choose Chinese, mathematics or English. It shows elapsed learning today, today's stars, the due-review and weak-point counts, and one recommendation (teach a goal that needs teaching, then strengthen a weak point, then a due check-in, then learn a new knowledge point). Due mistakes sit on a side card of one or two items, so a long overdue list does not block that goal. The same card can practise the goal in a favourite scene or ask the tutor to open an interactive lesson. When school progress is confirmed, the page names the current unit and the objective's concrete goal. Today also shows a Today's subject routine card (print a daily mini sheet or start a chat dictation, built from the unit focus and the most frequent error causes), an explain-it-back reminder with a one-click “little teacher” Feynman prompt that is never scored, and the selected subject's check-in card. Once a block starts, the page shows one saved question at a time with its learning goal, optional micro-steps and Simon phase (demo → guide → try → vary): a figure on the question is drawn beside the prompt, and when that goal belongs to the current term's map, three dots show how many days it was answered independently. Choice questions are answered by tapping an option, others by typing. Browsing subjects keeps unfinished work visible; an explicit switch or end request preserves the original answer for any late assessment. Submit an answer or request a hint in the panel; DSH chat supplies teaching and assessment. The action follows the current task: ask for a question, request feedback or a hint again, or move to the next question. These actions reuse the active block. The original answer stays visible with its feedback. Ending the block is one click; an optional reflection may be folded away or collected through the little-teacher chat. The desk reports native message admission separately from independently verified saved responses and assessments. Uncertain admission offers explicit inspection and never resends automatically; model errors remain visible in chat.

The parent page has three destinations. Pending work and practice records contains unfinished work, mistake transcriptions, due reviews, the notebook, exercises and worksheets. Knowledge and progress contains the concept relationships, knowledge map and three-subject check-ins; browsing another book keeps the selected learning scope and active block. Profile and summary starts with conversational profile, course and archive actions, then shows weekly progress, stars and recent evidence. Optional forms save profile, course and school frontier settings through the typed application interface. Saved worksheet records have a separate optional correction form for assessment, error cause, assistance and the parent-confirmed actual answer day. The original response and frozen question basis remain visible. Drafts belong to the native Session, term and edited entity and survive navigation and unrelated refreshes. Saves use current observed file versions; relevant conflicts retain the draft and show current values, with an explicit choice to adopt current values or keep a reviewed draft. Old-term drafts cannot change the current term. Default practice, transcription confirmation and archive actions submit complete intentions to native chat. Paper transcription confidence remains separate from correctness and help; only high-confidence correct drafts with known assistance and no uncertainty offer batch confirmation. Pending, due and recent-answer lists show at most 20 records; request older records in chat.

### Open an interactive lesson

When OpenMAIC is already running on this computer, Today's plan can ask the tutor to generate a lesson for the current goal. The requirement includes the saved interest tags and the confirmed school unit, such as 欢乐购物街. While a lesson is generating, the desk shows that status. When one is ready, Go to class stays at the top of Today. Today also lists recent interactive lessons and can open a classroom link in the browser. Generation, a poll about once a minute, retry and the after-class outline are done by the tutor with curl and one cookie jar, because web_fetch cannot reach localhost. In chat the classroom URL is a bare URL on its own line. After class the tutor saves a short outline and writes 2 to 5 consolidation questions through the existing practice loop. Parent setup can save an OpenMAIC address. A saved address wins; otherwise the desk uses OPENMAIC_BASE, or `http://localhost:3000` when that variable is unset. An access code, when the service requires one, is read from OPENMAIC_ACCESS_CODE and is not stored in the learning profile. The desk does not embed the classroom.

### Choose a learning activity

Smart learning is the conversation mode. Under Another way on the Learning desk, choose a subject and one of four activities; there is no shared daily time budget. Explore can take a typed inquiry question. Sync practice is stored as the school course when that subject has confirmed school progress, and as labelled foundations otherwise. The workbench saves tasks and responses, while the conversation carries explanations, hints and tutor feedback.

| Activity | When to use it | Prerequisite |
|---|---|---|
| Sync | Practise the confirmed school unit, or labelled foundations when that course is not confirmed yet | Parent-confirmed learner profile |
| Due review | Recall a previously confirmed mistake or try a related variation | Confirmed mistakes due for review in the selected subject |
| Check-in | Sample a few short questions from the knowledge map to find what is known and what needs work, at light, standard or deep intensity | Learner profile; suggested every 14 days per subject, repeatable any time |
| Explore | Investigate a child's question through a prediction, observation and explanation | Learner profile; explain the question in chat |

Use Parent setup on the parent page before the first activity. Today shows the selected subject's methods, elapsed learning today, stars and due-review count. A parent can correct and confirm a tutor-proposed concept's definition, example and source; the tutor then creates selectable learning goals and evidenced prerequisite, part, contrast, explanation or causal relations. Sync practice can start with one selected goal. Old mistakes retain their original `topic` until someone checks and links them to a goal. Choose a due review in Mistakes, then explicitly start it in Today; starting a new block auto-closes any open one. Submit an answer and wait for feedback; End this block ends the session.

The mistake book prints a daily mini sheet, practice sheets and review sheets. A daily mini sheet has 4–6 questions from the subject routine (characters or words, a sentence or oral arithmetic, and one variant of a recurring error cause). A practice sheet covers the current school unit, mixes question types, and leaves space to write. For a review sheet the system picks the mistakes: up to 8 due today or tomorrow, lowest review stage first, one variant each, skipping mistakes already printed on a sheet that has not been marked. A sheet renders as a web page: the parent previews the whole sheet in the workbench and prints through the browser print dialog, choosing a printer or "Save as PDF"; Windows prints the same way. The sheet can draw bar models, Chinese money, tens-and-ones dot diagrams and counters, a hundred chart (including a nine-cell window), number lines, clock faces at any five-minute step, counting sticks, column-arithmetic grids, shape comparisons, plane and solid figure rows, overlap circles (sum circles and set diagrams), number splits, pattern strips, number walls, grids, dot arrays, centimetre rulers, direction crosses, balances, tianzige squares and four-line letter bands, plus a sketch fallback for anything else, each with one line, three lines or a box to answer in; the on-screen task figures and the printed figures are the same set. The sheet contains questions, figures and answer space; answers and evidence remain in the learning record.

After the child finishes, the parent expands the sheet in the mistake book, marks each question right, partly right or wrong against the answer key, optionally types what the child wrote and tags the error cause, and saves; a photo of the sheet can also go to the tutor, who saves each question as a transcription draft for the parent to check and confirm in the panel. A wrong or partly right answer on a practice sheet becomes a mistake on that question's goal, and correcting the mark to right removes it. Each review question climbs a numeric, then context, then reasoning ladder and keeps the mistake's error cause. Review questions count by day: an independent correct answer on any day, earlier than the due day included, moves the mistake to the next stage and the next review counts from that day, while a wrong or partly right answer only makes it due again the next day (a repeated wrong waits two days) without lowering the stage. A sheet that will not be used can be discarded so its mistakes can be printed again. Paper results need no active timer and earn no stars.

If DSH's SenseVoice input is enabled, the learner can dictate an answer in chat. The transcript enters the draft for review before sending; the tutor then saves the original text against the current task. A transcript cannot assess reading or English pronunciation. The desk does not add another recorder.

### Confirm the learner and materials

Each workspace holds one learner’s term in format 2 official files. Native chat is the default setup and management entry; a parent confirms nickname, region, grade, term, school year, school system, interests and an optional course note. Unknown years remain unknown until confirmed. Profile edits preserve historical learning context; confirmed courses and school progress share one settings write. Foundation practice can begin after basic setup while school alignment is pending. Archive retains original term identities and sources; a new term uses a new identity. Legacy sources remain readable and require explicit migration before new official-file work.

Confirm each subject's book title, publisher, edition, cover/copyright evidence and current unit separately. After the textbook is confirmed, choose the map unit the class has reached in Parent setup: new goals and check-ins stay in that unit and the units already taught. Keep-up teaches the current unit, catch-up fills earlier gaps first, a review week adds no new goal, and preview covers at most the next unit. The frontier moves only after confirmation. School study requires an identified edition, matching curriculum scope and a recorded parent confirmation. Unconfirmed courses can use clearly labelled foundation practice. Materials retain separate identities when an edition changes; earlier attempts keep their original material reference. Official entry points and source rules live in [materials](knowledge/skills/study/references/materials.md).

<a id="use-default-textbooks"></a>
### Use default textbooks

For grade two, first term, `/study` uses the bundled People's Education Press Chinese or Beijing Normal University Press mathematics textbook when the user supplies no textbook for that subject. User-provided books and pages take priority. You do not need to upload these two books again: complete the learner profile and choose Foundations, or ask in chat to learn multiplication with the default mathematics textbook. Without a selected topic, the tutor offers a short choice from the first unit. Defaults do not establish the school's edition or fill in school progress; English, other grades and other terms have no default textbook.

See [default textbooks](knowledge/skills/study/references/default-textbooks.md) for contents, edition evidence and reading rules. DSH's `read_image` reads selected pages and requires an image-capable model. Extracted text supports lookup only; it cannot directly establish pinyin, diagrams or column calculations for grading. Without image support, use user-provided or previously verified prompts, or clearly labelled generated foundation exercises.

<a id="use-the-knowledge-map"></a>
### Use the knowledge map and weak points

The package ships twelve knowledge maps for Chinese, mathematics and English across both terms of grades one and two, organized from the first-stage requirements of the 2022 curriculum standards. Chinese and English for both terms of grade one and the first term of grade two list the units and lessons from the parent-confirmed textbook contents. Mathematics for those three books follows the 2024 Shanghai five-four textbook contents. Grade two, second term of all three subjects keeps the earlier framework. They are a learning framework, not the school textbook or the teacher's progress. Map learning goals need no parent confirmation for questions, answers, mistake classification or worksheets; the tutor reads each knowledge point's definition, example and checkable facts with `study_status kind=curriculum` before asking, and records the goal on every question. Every knowledge point on the twelve maps has checkable facts, and a question may not go beyond them. Chinese, grade two, first term, is taken from the bundled People's Education Press pages. In Chinese, grade one, both terms, a knowledge point whose 2024 unified textbook page was read clearly now states the lesson lines, characters and stroke names; lessons 1 a o e and 2 i u ü keep their earlier facts. Chinese, grade two, second term, still states what that lesson can be checked against. English, grade two, first term, Units 1 to 4 follow a parent reading sheet. Units 5 to 10 of that book, grade one first term Units 1 to 6 and Units 8 to 10, and grade one second term Units 1 to 10 use sentences read from 2024 Shanghai five-four excerpts. Grade one first term Unit 7 changes only the sentences that match. Starter, both appendices and grade two, second term, still state what the topic words mean. For mathematics, grade one both terms and grade two first term, a knowledge point whose lesson page or plan was read, and whose concept matches, now states the method, rhyme or shape feature on that page. A point without a matching page keeps its earlier facts. Mathematics, grade two, second term, is unchanged in this pass. A later page or paper can replace a fact when it is the same concept. Publisher and volume may differ. Paper questions corroborate the course, and a new question is written again rather than copied.

Mastery is derived from recorded evidence: independent correct answers on three different days with no open mistakes and no recent helped or wrong answer show as mastered, with three dots tracking independent days on the task card, map details and goal rows and one celebration when the third day lands; two or more wrong or helped answers in the last 14 days, or two or more open mistakes, show as needing work; practised but untouched for more than 10 days shows as not practised lately; a due mistake shows as review due. A goal that needs teaching walks the map's prerequisite edges first: strengthen the nearest unmet prerequisite, then return to the original goal. Weak points rank by due mistakes, recent errors and inactivity, and the daily plan is a goal that needs teaching, then a weak point, then a due check-in, then a new knowledge point. At most two due mistakes are listed to clear. A repeated error cause adds a recurring-error reason and lifts its goal; explain-it-back reminders derive from the day's evidence and never count as mastery. These states describe evidence; they are not ability labels and do not replace school assessment. Coverage, queries and the consolidation loop are in [knowledge map](knowledge/skills/study/references/knowledge-map.md).

The check-in is a short, recurring probe: for each subject it samples untouched goals across units, then goals not practised lately and mastered goals older than 35 days, and suggests another round 14 days after the last one; it can be repeated any time. Three intensities are available: light (3 choice questions), standard (6, the default) and deep (up to 12 with one reasoning task per unit and re-checks of goals in progress); the desk recommends one from the number of untouched goals. Built-in diagnose exercises from the exercise bank can seed each sample. The confirmed school frontier is the default sampling range, not a limit: a check-in can also run in another grade and term, in selected units, or against a picked set of goals by passing that scope when the block starts, and answers are only checked against the chosen scope. Each sampled goal gets one short question and every answer must carry the learning goal; a goal never answered independently is marked as needing work after a single wrong answer, and today's plan turns to targeted practice. A check-in has no score or ranking and no time cutoff.

### Learn and review

The tutor starts one learning block, asks a short question, waits for the learner and records the actual response and help received. There is no block, break or daily minute limit; a child may stop when tired without penalty or catch-up. Elapsed time is quiet clock time including waiting, and stop stores the actual elapsed time. Calendar days use Shanghai time. No background alarm or screen lock is installed. Record matching, choice normalisation and diagnose intensity remain in the [soft-time decision](https://github.com/winterhuan/dsh-creative/blob/upstream-conventions/.agents/notes/implemented/bug-fix/2026-10-18-student-soft-time.md); removal of durations is in the [overhaul decision](https://github.com/winterhuan/dsh-creative/blob/upstream-conventions/.agents/notes/implemented/feature/2026-10-30-student-overhaul.md).

Actual recorded work earns at most one participation star per day; a learner's reflection can earn one additional star. Idle time, more questions, longer sessions and consecutive days earn no extra stars. The progress report shows evidence and topics, not rankings or exam scores.

For a photo mistake, the tutor reads the image through DSH, saves the transcription with uncertainties and asks the user to confirm the corrected prompt and answer evidence. Every new mistake remains pending until confirmation. The first review is due on the day after confirmation; an independent correct answer on any day, before the due day included, extends the interval along 1, 7, 16 and 35 days, at most one stage per day. Helped or incorrect answers only make it due again the next day without lowering the stage. Review stages are recomputed from all recorded answers, so a corrected mark updates them. Three different days of independent answers are reported as evidence, not permanent mastery. Parents may also enter, edit or delete confirmed mistakes through chat and save items into the workspace exercise bank for later variants.

Ask `/study` to review progress, continue due mistakes or explore a child's question. Exploration uses a small prediction, observation and explanation cycle around an inquiry the child types. Optional daily reminders use DSH's available reminder tools only after a parent specifies the schedule; this package creates none automatically.

-----

<a id="understand-the-implementation"></a>
## Understand the implementation

Ownership and trust boundaries: [Student subsystem](https://github.com/winterhuan/dsh-creative/blob/upstream-conventions/docs/subsystems/student.md). From the repository root, build with `pnpm --filter @winterhuan/dsh-student build` and test with `pnpm --filter @winterhuan/dsh-student test`.

The Host entry owns workspace routes and configuration. The `./agent` export registers domain Skills and tools inside the `student` preset and inherited native child compositions. The preset supplies a task-specific persona and explicit native tools; it does not change the default mode. Learning uses filesystem, search, web, questions, presentation and platform-specific shell tools without delegation or creative production workflows.

<details>
<summary>Implementation internals — click to expand</summary>

The [profile patch](cordis.patch.yml) loads the [host plugin](src/index.ts). The [knowledge-map loader](src/curriculum.ts) reads and validates the twelve maps in `knowledge/curriculum/` and the exercise bank in `knowledge/curriculum/exercises/`; state files keep goal references only. The [learning reducer](src/learning/update/index.ts) checks curricula, concept links, rewards and review transitions, validates shipped goal references against the map, and derives mastery, weak points and the daily recommendation from answers, paper results and mistake stages; the [state schemas](src/schema.ts) validate model input and durable data and migrate away removed duration fields. New collections default to empty on old profiles without guessing concept links. The sidebar and tools share persisted questions, submitted answers, hint requests, paper results and workspace exercises; live tutoring assessment must match a saved question and learner response. Demonstrations stay in teaching content. Published worksheets retain their resolved goals after source mistakes change or disappear; drafts and results prevent content replacement. Confirmed workbook photos retain their original responses and outcomes, without treating receipt time as an answer date. The packaged CLI and on-demand authoring schemas use those source definitions. DSH's normal tool log records calls and results.

The [official-file API](src/files/index.ts), exported as `./files`, shares strict schemas and business validation between application reads, typed manual saves and read-only Node consumers. Format 2 stores term settings in `.study/settings.json`, one block in `.study/blocks/<blockId>.json`, one worksheet in `.study/worksheets/<worksheetId>.json`, and bounded remaining collections in `.study/collections.json`; OpenMAIC keeps its independently validated `.study/openmaic-lessons.json`. Reads check directory membership and actual file versions with at most three attempts. Validated file, backup and query caches belong to the application Host and clear at its disposal; read-only adapters retain their own caches. Evidence and dashboard caches belong to their projected state. An invalid entity pauses its related saves. Settings and materials return explicit partial reads when unrelated files are invalid; incomplete evidence blocks summary projections. The application retains up to three observed valid versions per entity in `.study/backups/`, within 128 backups and 32 MiB of source bytes. One Host owner serializes complete backup retention operations for the same settings-file target; custom file adapters without that owner guarantee only sequential retention. Backup failures remain separate from business validity. Restore descriptions require an explicit choice and preservation of the invalid original. Manual saves check the term identity, edited-field baseline and current file versions. Profile saves merge selected edited fields with untouched current values; course and school progress share one settings write. Original-byte-verified v1 migration and archive descriptions expose each output and missing source fact without writing or repairing business files. Official files are limited to 8 MiB each and 32 MiB per active term, with at most 5,000 blocks, 500 worksheets and 128 archived term directories. Legacy `.study/state.json` remains readable without changing its bytes; grading times, receipt times and default independence do not become verified learning evidence.

### Validate native file edits

Build this repository, then run the same executable shipped in the package:

```sh
node packages/winterhuan/student/lib/cli.js --help
node packages/winterhuan/student/lib/cli.js schema term-settings
node packages/winterhuan/student/lib/cli.js example figure
node packages/winterhuan/student/lib/cli.js validate --workspace /path/to/workspace
```

For an installed package, use `<study Skill Base directory>/../../../lib/cli.js`; the `./cli` export and `study-validate` bin identify the same executable. DSH Git installation does not promise a global PATH command. Validation reads official files and the full independent lesson log, preserves bytes/revisions, and creates no backups or repairs. Exit 0 identifies observed kinds, identities and versions; nonzero JSON names the path, field, rule and correction. Validation output is at most 32 KiB with explicit omissions. Schema/example commands generate complete resources from source definitions; cross-file and source-fact checks remain the CLI’s responsibility. CLI native dates stay unknown without independent Host receipt matching. See the [authoring reference](knowledge/skills/study/references/files.md) for partial operations and explicit recovery.

The [Student Remote](src/remote-service.ts) provides generated typed queries, explicit manual saves and submission inspection for registered main DSH Sessions. Gateway Session permissions apply before each call; missing, disposed and child Agents are rejected without activation. Inspection reports native admission, saved original answers and valid saved assessments separately and never resends input. Manual saves use observed terms, versions and edited-field baselines; setup identifies `editedProfileFields`. Host configuration defaults to `refreshIntervalMs: 3000` and `maxWireBytes: 1048576`, limiting complete request and response JSON, including watch/manual/inspection envelopes; oversized manual requests fail before saving. The [Client resource provider](src/client/resource.ts) follows `dsh-resource://student/session/<encoded-id>?query=<encoded-JSON>` through native reconnection, reports failures with previous values marked stale, and awaits streams before withdrawing its namespace. The same-authority [HTTP workspace route](src/route.ts) provides only GET compatibility reads for registered main Agents and accepts no mutations.

The [native source reader](src/transport.ts) observes only the calling authorized Session. Earlier Sessions' original answers and stored timestamps remain intact, but their projected dates stay unknown without separately authorized source observations and do not count as independent dated evidence. Complete raw replay is limited to 100,000 events and 16 MiB; the native wire view is limited to 32 KiB, 20 consumed inputs, 20 admissions, 2,000 text characters per input and eight attachment references, with explicit omitted input/admission/attachment counts. Incomplete or unsupported history leaves receipt facts unavailable. Receipt versions match the full consumed source and content, including attachments; later consumption, file writes and grading do not create an answer receipt.

A sheet is rendered by the [client worksheet view](src/client/worksheet-view.tsx), sharing the same SVG figures as on-screen tasks; printing goes through the browser print dialog (printer or save-as-PDF), and the Host generates no PDF and calls no system print queue. The client submits tutoring requests through the native Session queue without replacing the composer draft.

Default textbook resources live in the Skill's `textbooks/` directory and ship with `knowledge`. The [preparation script](scripts/prepare-textbooks.py) generates contents, page images and unverified text from the two checked PDFs, using PyMuPDF 1.28.2 and verifying source hashes before writing. Runtime reads use native file and image tools without Python, a PDF parser or the original download path. Skill instructions select the textbook without automatically changing learning state; default textbook answers retain page references and evidence in `answerEvidence`.

</details>

-----

<a id="further-exploration"></a>
## Further Exploration

- [Study Skill](knowledge/skills/study/SKILL.md) — parent setup and daily tutoring.
- [OpenMAIC lessons](knowledge/skills/study/references/openmaic.md) — generate a local interactive lesson, record it, and review with a few questions.
- [Interactive lesson decision](https://github.com/winterhuan/dsh-creative/blob/upstream-conventions/.agents/notes/implemented/feature/2026-10-28-student-openmaic-lessons.md) — why the tutor shell calls OpenMAIC and the desk only lists and opens.
- [Teaching reference](knowledge/skills/study/references/teaching.md) — subject-specific methods and answer checks.
- [Knowledge map](knowledge/skills/study/references/knowledge-map.md) — shipped knowledge points, mastery states and the consolidation loop.
- [Learning decision](https://github.com/winterhuan/dsh-creative/blob/upstream-conventions/.agents/notes/implemented/feature/2026-10-05-student-learning.md) — evidence, source and reward boundaries.
- [Default textbook decision](https://github.com/winterhuan/dsh-creative/blob/upstream-conventions/.agents/notes/implemented/feature/2026-10-10-student-default-textbooks.md) — packaged materials and school-alignment limits.
- [Knowledge map decision](https://github.com/winterhuan/dsh-creative/blob/upstream-conventions/.agents/notes/implemented/feature/2026-10-12-student-knowledge-map.md) — shipped maps, weak-point rules and the main workbench tab.
- [Overhaul decision](https://github.com/winterhuan/dsh-creative/blob/upstream-conventions/.agents/notes/implemented/feature/2026-10-30-student-overhaul.md) — no time limits, exercise bank, 1 / 7 / 16 / 35 review and simplified parent/student flow.

<a id="model-experience"></a>
## Model Experience

### Study guidance and records

#### What the model sees

The selected mode adds a domain persona and one read-only Student tool schema. The [prompt snapshot](../../../tests/fixtures/student-persona.txt) records the prefix; Standard and sibling modes omit these capabilities. `/study` remains available without Web. `study_status` reads validated files and bounded teaching context: actual versions, current block/question, original response, pending assessment, legal actions, selected scope, target facts/source/method, hint ladder and at most three seeds. File catalogs and versions page or report omissions; oversized records point to native file reads. Agents author every business change with native file tools, run the packaged CLI, and distinguish message admission, saved response and valid saved assessment. Source-derived schemas and examples load on demand, including all 23 figures. The skill covers setup, curricula, teaching, photographs, worksheets, recovery and OpenMAIC. Native shell requests use a separate same-origin cookie jar; credentials stay outside model-visible business files. Native compaction manages cumulative history. Parameter JSON size is a character count; complete request/call traces and separately labelled density estimates do not establish provider tokens, image costs, tutoring quality or billing.

#### Token effect

Skill bodies and references load on demand. One read-only Student tool schema is advertised when enabled; native tools also contribute to each request. Collection queries return 20 records with a next offset. Textbooks are not loaded as a whole. No real-model token or teaching-quality benchmark has been measured.

#### KV Cache effect

The plugin uses ordinary DSH Skill and tool history. It does not rewrite previous messages or create another model session.

## Known Limitations and Deferred Work

<a id="known-limitations-and-deferred-work"></a>

- Mathematics units and knowledge points for both terms of grade one and the first term of grade two follow the 2024 Shanghai five-four textbook contents, but they are not a page-by-page copy. Chinese and English for those three books list the lessons and sections from the parent-confirmed contents, and are not a page-by-page copy either. Grade two, second term of all three subjects keeps the earlier framework and may differ from the school's book. Mastery counts only records that carry a learning goal, so older answers without one stay outside weak-point analysis. A check-in probes at most six goals per round, sampled across units but not a complete assessment; the model writes the probe questions, and where checkable facts exist the answer stays inside them, so parents should still watch their quality.
- The plugin does not authenticate a parent's identity, verify attention, guarantee AI answers or supply a complete Shanghai curriculum. A confirmation records a user statement; source classification alone does not prove correctness. Actual textbooks, school progress and disputed answers still need human checks.
- Image intake depends on a vision-capable DSH model and readable attachments. This package has no OCR service, textbook downloader or automatic reminders. Image paths reference the supplied attachment; the package does not copy image bytes into its state file. Voice input needs the separately enabled DSH bundle, and transcription does not verify pronunciation.
- Printing goes through the browser print dialog with a physical printer or "Save as PDF". The parent checks actual paper output and the browser's print status; this package keeps no print-queue receipt.
- There is no time limit on recorded learning actions; the plugin still cannot lock the operating system or arbitrary chat. Application saves check observed versions; native and shell writes remain outside that check. Observed backups cannot recover overwritten history that was never read, and migration and archive publish each file separately.
- State is local, but excerpts and images used in tutoring reach the configured model provider. The plugin is not an offline or encrypted learning vault. Native tool and filesystem tests do not establish real-model transcription accuracy or educational effectiveness.

- Interactive lessons need an OpenMAIC service this package does not install or start. The Host does not call that service. The lesson log stays in the workspace across a term archive until someone removes the file.
- Transcriptions, review variants and daily mini sheets are model-written. A photographed sheet first becomes transcription drafts; the parent checks them in the panel before results and error causes enter the record, and printed practice remains the main learning surface.

<a id="dev-note"></a>
### Dev Note

None.
