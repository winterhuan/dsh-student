# Student capability-goal reconstruction

English | [中文](README.zh.md)

## Summary

This draft converts the three subjects' grade-one and grade-two course indexes into assessable capabilities while retaining destinations for old goals and questions. Each capability has scope, criteria, prerequisites, and question-family links. It supports review before implementation; the running curriculum and daily learner records retain their existing format.

The reconstruction starts from the Ministry of Education's three original standards and then checks each shipped course and question entry. The resulting draft contains 32 Chinese, 42 math, and 17 English capabilities and 123 question families. These are observed decomposition counts, including curriculum extensions enabled only after confirmation, rather than a timetable requiring each child to complete 91 sequential tasks.

## Table of Contents

- [How goals are defined](#goal-definition)
- [The child's learning path](#learning-path)
- [Capability-goal tree](#goal-tree)
- [Question families and legacy mappings](#legacy-mapping)
- [Sources and coverage gaps](#source-coverage)
- [Phased changes and validation](#phased-validation)
- [Dev Note](#dev-note)

<a id="goal-definition"></a>

## How goals are defined

Capability identity describes what the learner can demonstrate. Textbook, grade, term, unit, vocabulary set, number range, and difficulty define its scope; learning, remediation, and review define its use. A capability continues across terms without being copied for each text, numeric exercise, or classroom. Expanded scope inherits only verified compatible evidence.

[Capability and question-family data](catalog.json) owns this draft's content. Each record contains `scope`, `criterion`, `sourceLocators`, `prerequisites`, `familyIds`, `curriculumAssociationIds`, and evidence requirements. Prerequisites refer to the relevant scope required by the chosen family; they do not require global mastery of every upstream capability. Existing suitable evidence is used directly.

Chinese recognition and writing, math addition and subtraction/checking, and English listening and speaking/reading and writing are checked separately. Vocabulary, number ranges, and methods within a goal also retain separate coverage; one correct answer cannot establish mastery of a whole word list, number range, or every method. Answer-assessed capabilities retain the three distinct actual dates of independent correctness and the error/help/mistake conditions. Reading habits, participation, and cumulative reading volume retain observation and activity records rather than being inferred from one score.

<a id="learning-path"></a>

## The child's learning path

The starting point is a current capability gap within the parent's confirmed scope. Student selects one goal and applicable question family, then asks OpenMAIC to generate a classroom; the source exercise supplies the method and structure for teaching and checking. The child sees today's task and one next action without first browsing the goal tree or bank.

For example, after confirming addition across ten within twenty, the current task can be making ten first in 8+7. Actual classroom answers and method evidence determine the next action: adequate evidence leads to later practice; help dependence leads to teaching the same family and then a fresh numeric variant. 8+7, 9+6, and 8+6 do not add bank entries. Current work and prerequisite gaps come first, followed by due review of at most two families and then a new school-aligned goal.

<a id="goal-tree"></a>

## Capability-goal tree

The tables group goals and criteria by subject and capability domain for parent or maintainer review. Full scope, evidence conditions, prerequisites, and families remain in the data records. The validator generates these tables from those records; regenerate the preview after changing the data.

<!-- capability-goals:start -->
### Chinese · Literacy and pinyin

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `c.pinyin-symbol` | Recognize pinyin symbols | Distinguish confusable symbols in the confirmed set; actual pronunciation requires audio. |
| `c.pinyin-tone` | Identify and mark tones | Mark the given syllable correctly and explain the vowel choice; auditory discrimination requires sound evidence. |
| `c.pinyin-blend` | Blend pinyin syllables | Demonstrate correct blending in audio; text can establish spelling rules but cannot establish oral blending mastery. |
| `c.character` | Recognize and read characters | Identify meanings in new words or sentences; pronunciation requires actual speech rather than visual selection. |
| `c.radical` | Recognize strokes and components | Identify components and names correctly; a radical meaning does not universally determine a character meaning. |
| `c.write-character` | Write characters in correct stroke order | Keep actual work showing correct shape and structure; stroke order needs a process or observation, while rule descriptions show only rule knowledge. |
| `c.distinguish` | Distinguish and use confusable characters | Choose or use a character in context and explain using meaning, components, or pronunciation. |
| `c.dictionary` | Look up characters in a dictionary | Choose a method from the known information and actually find the pronunciation or meaning; naming a method is insufficient. |
| `c.word-meaning` | Understand words in context | Explain or select meanings in context and verify substitutions; synonym and antonym coverage remains separate. |
| `c.write-pinyin` | Write pinyin correctly | Keep actual correctly shaped and positioned writing; typed input establishes only character sequence. |
| `c.alphabet` | Recognize the pinyin alphabet | Identify case and order in the pinyin alphabet; memorization requires actual independent spoken or written production. |

### Chinese · Sentences and writing

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `c.sentence` | Organize complete sentences | Make the subject and action or property relationship clear; punctuation is assessed separately by c.punctuation. |
| `c.write-message` | Write connected sentences | Keep actual writing with a focus, basic sequence, understandable wording, and punctuation; do not score length alone. |
| `c.punctuation` | Understand and use common punctuation | Choose punctuation from meaning and use it in actual writing; expressive reading needs audio separately. |

### Chinese · Reading

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `c.read-aloud` | Read aloud accurately and fluently | Keep actual reading or verified observation and assess sounds, pauses, and omissions; text answers are insufficient. |
| `c.silent-read` | Read silently with understanding | Keep evidence of the reading process and correct content answers; a claim or a memorized reading rule is insufficient. |
| `c.retrieve` | Find explicit information in text | Answer accurately and locate the supporting text; recalled textbook answers cannot substitute for locating information. |
| `c.sequence` | Understand event order | Order events from the text and identify clues; both order and facts must be correct. |
| `c.cause` | Explain causes using evidence | Explain behavior or change using relevant events rather than unsupported guesses. |
| `c.main` | Summarize main content | Use the learner's own words to include the main people, event, and outcome; answering details is insufficient. |
| `c.evaluate` | Relate a viewpoint to story evidence | State a viewpoint with relevant events; do not require one textbook formulation. |
| `c.genre` | Recognize and use common text types | Recognize the basic form and use time, place, and event details in a notice to act. |

### Chinese · Language and cultural accumulation

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `c.recall` | Recall previously learned material | Recall the relevant wording or facts; multiple choice supports recognition rather than recitation. |
| `c.recite` | Recite confirmed poems or passages | Keep actual unaided recitation audio or observation with correct wording and order; filling a written line does not prove full recitation. |
| `c.culture` | Understand familiar cultural content | Connect festivals and customs accurately and identify sources; accept reasonable regional differences. |

### Chinese · Listening and communication

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `c.listen` | Listen for main information | Answer from key information in actual speech; reading or memory does not establish listening comprehension. |
| `c.retell` | Retell in sequence | Actually tell the cause, events, and outcome in order; written scripts are recorded as written expression. |
| `c.describe` | Describe orally in an organized way | Keep actual coherent speech about the subject, features, or event; text does not establish oral performance. |
| `c.interact` | Listen and communicate appropriately | State a request and reason and understand a reply; selecting a polite sentence establishes only judgment. |

### Chinese · Practice and participation

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `c.read-habit` | Use and share reading resources | Choose a suitable book, use contents or pictures, and share; cumulative reading volume needs separate records. |

### Chinese · Organization and inquiry

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `c.organize` | Organize learned language materials | Explain a classification, keep correct groups, and give an example of use; record interest and habits through observation. |
| `c.inquiry` | Ask questions and organize observations | Keep observation or activity evidence, ask relevant questions, and distinguish facts from viewpoints in speech or pictures and text. |

### Math · Numbers

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `m.count` | Count objects and select quantities | Count without omissions or repeats and report the total; select the requested number of objects. |
| `m.zero` | Understand zero | Use 0 for an empty set and distinguish zero from an unanswered question. |
| `m.compose` | Compose and decompose numbers | Find the missing part and recombine both parts to recover the whole. |
| `m.place` | Understand decimal place value | Match bundles or an abacus to place values; explain the zero tens digit in 305. |
| `m.read-number` | Read numbers | Read the numeric value correctly; a written response establishes only the written number name. |
| `m.write-number` | Write numbers | Write correct digits and placeholder zeros; dictation also requires an actual audio source. |
| `m.compare` | Compare numbers | Identify the relation and use its symbol; explain multi-digit comparisons using the highest differing place. |
| `m.ordinal` | Distinguish quantity from order | Give the total and the ordinal position; explain how a different starting end changes the position. |
| `m.neighbor` | Find neighboring numbers | Identify preceding and following integers; separately identify the bounding multiples of ten. |

### Math · Operations and quantity relationships

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `m.add-meaning` | Model addition relationships | Identify the two parts and total, write an equation, and explain why addition applies. |
| `m.sub-meaning` | Model subtraction relationships | Identify known and unknown quantities, write an equation, and explain why subtraction applies. |
| `m.add` | Calculate sums | Produce the correct sum and a checkable process for the requested method; choosing a result alone is insufficient. |
| `m.sub` | Calculate differences | Keep the correct result and process; the demonstrated method and number range must match the credited scope. |
| `m.chain` | Follow operation order | Explain or write the first operation and obtain the correct final result. |
| `m.check` | Check a calculation | Use a valid checking relationship, detect disagreement, and locate an error. |
| `m.estimate` | Estimate and judge reasonableness | Save an estimate and its rationale before calculating, then explain the difference; do not backfill an estimate. |
| `m.mul-meaning` | Understand equal-group multiplication | Identify the number and size of groups, write the product, and explain the factors and product. |
| `m.mul` | Use multiplication facts | Find products correctly and record the sampled facts; explain reconstruction from a neighboring fact when needed. |
| `m.div-meaning` | Understand sharing and grouping | Distinguish number of groups from amount per group and explain the quantities in the division equation. |
| `m.div` | Use facts to divide | Find the quotient and check it using multiplication. |
| `m.remainder` | Understand division with a remainder | Record leftover objects after equal grouping; the remainder is smaller than the divisor and units agree. |
| `m.problem` | Solve simple quantity problems | Identify conditions and the question, choose operations, include units, and explain whether the result makes sense. |
| `m.pattern` | Express simple patterns | Identify the repeated unit or increment, express the relationship, and verify it on a new item. |

### Math · Shapes and position

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `m.solid` | Recognize common solids | Recognize shapes and state features; rolling performance requires the relevant observed object test. |
| `m.plane` | Recognize and describe plane shapes | Recognize shapes after rotation or resizing and describe visible features; detailed side and angle requirements need curriculum confirmation. |
| `m.segment` | Recognize and draw segments | Identify endpoints and straight segments; an actual drawing must be checkable, since a description does not prove drawing skill. |
| `m.position` | Describe relative position | Locate objects using the same reference; changing the reference requires reconsidering the answer. |
| `m.direction` | Identify directions and simple routes | Derive other directions from a given reference and describe a route from its starting point. |
| `m.compose-shape` | Compose shapes and identify their parts | Keep an actual or saved composition, identify its component shapes, and identify the plane shape of a solid's face. |

### Math · Measurement and everyday use

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `m.length-compare` | Compare lengths | Use a common starting point or unit; explain why different step lengths give different counts. |
| `m.length` | Measure and express length | Use the tool origin correctly and include units; subtract endpoint readings when the object does not start at zero. |
| `m.money` | Recognize currency and convert units | Recognize values and convert correctly using 10 jiao per yuan and 10 fen per jiao. |
| `m.shopping` | Calculate payment and change | Compute the total price, then subtract it from payment; use consistent units and nonnegative change. |
| `m.clock` | Read clock times | Identify the hour and minute hands; place the hour hand correctly for half hours. |
| `m.elapsed` | Calculate elapsed time | Find the interval between start and end, handling only the unit transitions covered by the evidence. |
| `m.mass` | Choose and convert mass units | Choose a reasonable unit for the object, explain why, and convert using 1000 grams per kilogram. |
| `m.time-unit` | Understand hours, minutes, seconds, and duration | Convert using 60 minutes per hour and 60 seconds per minute; distinguish clock time from duration and explain elapsed events. |

### Math · Classification and records

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `m.classify` | Classify by a stated rule | State the rule and classify without omissions or duplicates; explain the rule at each level. |
| `m.record-data` | Record and explain classifications | Keep records consistent with the objects, identify classes and quantities, and answer comparisons from the record. |

### Math · Practice and participation

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `m.measure-practice` | Perform and explain measurement | Keep tool use or verified parent observation and recorded measurements; explain units and differences. |
| `m.math-share` | Describe life and activities mathematically | Keep work or explanations of quantities or game rules; explain choices and currency use in shopping activities. |

### Math · Confirmed curriculum extensions

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `m.puzzle` | Solve confirmed mathematical extensions | State given constraints, solve, and check each; accept multiple valid solutions when they exist. |

### English · Listening and audiovisual understanding

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `e.listen-word` | Identify meaning from spoken words | Match a real spoken word to an object, picture, or position; record playback and help rather than substitute text matching. |
| `e.listen-message` | Understand spoken messages and instructions | Select or act on main information; pictures must not reveal the answer without listening. |
| `e.listen-story` | Understand short spoken stories | Identify characters and key events or outcomes without substituting a complete written transcript. |
| `e.view-listen` | Understand suitable audiovisual content | Respond to a real video's main events and imitate simple speech; viewing volume is only an activity record. |

### English · Speech sounds

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `e.sound` | Perceive and imitate speech sounds | Compare actual learner audio with target sounds; written phonetic symbols or letter selection cannot prove pronunciation. |

### English · Reading

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `e.word-form` | Recognize written words and meanings | Match printed words to meaning without audio; credit only the words actually tested. |
| `e.read-message` | Understand written messages | Extract information or choose an appropriate reply from text; memorized translations cover only the tested material. |
| `e.read-story` | Read short illustrated stories | Identify events and characters from actual visible text and pictures and provide evidence; no text means no reading mastery. |

### English · Writing

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `e.letter` | Recognize letters and case | Identify letters and match uppercase with lowercase, recording the specific letters covered. |
| `e.write-word` | Write confirmed words | Keep correct letter sequences matched to meaning; copying does not establish independent spelling. |
| `e.write-message` | Express simple meanings in writing | Write meaningful words or sentences independently; accept equivalent wording and do not award speaking credit. |
| `e.write-letter` | Write confirmed letters | Keep actual work showing correct shape and placement; typed input establishes only character sequence. |

### English · Speaking

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `e.speak-name` | Name and briefly describe things aloud | Keep intelligible actual speech matching the object; do not demand a native accent or count typing as speech. |
| `e.speak-social` | Exchange short social messages | Keep at least two actual spoken turns with suitable questions and replies; a memorized single sentence covers only that utterance. |
| `e.speak-self` | Speak about personal information | Actually state personal information and answer a simple follow-up; a written script is insufficient. |
| `e.speak-story` | Tell a short story with prompts | Actually describe characters, key events, and outcomes; record pictures and help used. |

### English · Practice and participation

| Stable ID | Capability | Assessment criterion |
| --- | --- | --- |
| `e.perform` | Participate in songs, games, or projects | Keep actual participation or verified observation; project completion does not establish all embedded listening and speaking abilities. |
<!-- capability-goals:end -->

<a id="legacy-mapping"></a>

## Question families and legacy mappings

[Legacy goal and question mappings](legacy-map.json) cover the 117 goals and 122 questions currently shipped, retaining each original identity. The 123 families cover new capabilities and distinct methods, including capabilities with no old question. Each family has one `representative`; variants remain concrete learning instances. The validator detects duplicate explicit signatures, while semantic equivalence still requires content review rather than text similarity alone.

| Old content | Reconstructed destination | Inheritance condition |
| --- | --- | --- |
| Whole units, appendices, and combined revision | Retain course/resource links rather than independent capability mastery. | Route original questions and separable subparts; a unit score cannot grant every candidate capability. |
| Bundled capabilities | Link the capabilities actually tested separately. | Score column subtraction and addition checking separately rather than infer both from one total. |
| Old goals describing the same capability | Consolidate across terms under a stable capability identity. | Inherit valid evidence only for the same or narrower scope without copying responses. |
| Equivalent numeric, character, or story variants | Link one family and retain original prompts as historical instances. | Preserve input, source and effective grading, date, help, and provenance. |
| Rule descriptions, choices, or incomplete sources | Retain diagnostic, partial, or pending evidence. | Do not grant unobserved operations, listening/speaking, or reading; check the missing evidence with a fresh task. |

For example, `ex-m2a-sub-1`, subtracting 52−28 and checking it, links subtraction and checking separately. A request to use breaking ten or inverse addition links only the demonstrated method. English how-to-say prompts route by actual response modality: text supports only confirmed written scope, while speech requires audio or verified observation. One response is not copied into two learning events.

Four old questions remain diagnostic only: three appendix-use rule questions and a color-recall question lacking English reading material. The other 118 have candidate routes with evidence conditions, which does not mean their historical answers already qualify. Missing original text, actual sound, performed work, separable grading, date, or help leaves the corresponding conditions unknown.

<a id="source-coverage"></a>

## Sources and coverage gaps

[Sources and the coverage matrix](sources.json) record the three ministry originals' URLs, hashes, PDF pages, and 24 requirement groups with linked capabilities. The criteria are this proposal's assessment decomposition rather than literal ministry prescriptions. Standards describe stage requirements; textbooks and school progress determine the actual teaching order.

| Finding from the originals | Catalog treatment |
| --- | --- |
| First-stage math requires recognizing, reading, writing, and comparing numbers within ten thousand; the old bank reaches one thousand. | Extend number coverage to ten thousand without treating evidence within one thousand as proof of the larger range. |
| First-stage math includes division, shape composition and solids' faces, hours/minutes/seconds, classification records, and practical communication. | Add capabilities rather than omit them because old goals or questions are absent. |
| Grams and kilograms belong to second-stage practice in the national standard but appear in the old second-year second-term framework. | Retain them as confirmed curriculum extensions rather than universal requirements for grades one and two. |
| Number walls and magic squares are old curriculum extensions; separate segment recognition also needs textbook checking. | Distinguish them from general patterns/measurement and enable them with curriculum confirmation. |
| Chinese requires pinyin writing, the alphabet, punctuation, material organization, and questioning. | Add goals; track character recognition/writing, poems, and reading volume separately rather than create thousands of goals. |
| English preparatory learning emphasizes audiovisual, listening, speaking, games, and role play. | Check spoken words, instructions, stories, sound imitation, speech, and audiovisual understanding separately; reading/writing and spoken-story extensions require textbook confirmation. |

Thirteen capabilities have no course association in the old goal index, including division, shape composition, time units, data recording, mathematical activity expression, the pinyin alphabet, punctuation, inquiry, English listening to stories/audiovisual content, and independent word writing. They have candidate definitions and assessment designs, while specific textbook units and requirements still need alignment. Other associations also identify old course locations rather than imply a full recheck of every textbook page. The three second-year second-term textbooks particularly need further checking.

<a id="phased-validation"></a>

## Phased changes and validation

The first step delivers the reviewable catalog, criteria, prerequisites, source exercises, and built-in legacy mappings. Further work follows the dependencies below; the [learning-loop proposal](../../../../.agents/notes/proposed/feature/2026-11-22-student-openmaic-learning-loop.md) owns the complete integration design.

1. Align textbooks and school scope, resolve the course-association gaps above, and enumerate custom goals, banks, and actual historical responses in an isolated copy.
2. Rehearse evidence-level migration, checking old ID aliases, cross-term references, family consolidation, unknown facts, repeatability, and preservation of original history.
3. Connect official classroom task identity, automatic login renewal, and actual response reads; make import consume the catalog's instances, families, and grading criteria.
4. Simplify navigation to Learning/Parent, join classrooms, checked persistence, necessary evidence checks, dated reviews, and the next goal, then verify in real DSH.

Run the following command from the Student submodule to check structure, reciprocal links, prerequisite cycles, old-goal/question coverage, source pages, original prompts, and source hashes. Its self-check also rejects cycles, duplicate mothers, missing old goals, unconditional mastery credit, and invalid references. It does not read or write daily learning records.

```sh
python3 docs/capability-rebuild/verify.py --self-test
```

After changing capability data, run the following command to update both language tables, then re-record the documentation pair. The validator replaces only the generated region.

```sh
python3 docs/capability-rebuild/verify.py --write-preview
```

## Dev Note

This is reviewable design data without runtime integration or daily migration. New question media still need generation and validation from the mother blueprints; blueprint text cannot replace actual audiovisual or performed evidence. Formal checks cannot prove that the educational decomposition is complete or that all historical responses can be inherited.
