import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { expect, it } from 'vitest'
import { createStudySkillProvider } from '../src/skill-provider.ts'

it('discovers the teaching inventory without loading 24 method bodies into the study skill', async () => {
  const provider = createStudySkillProvider()
  const candidates = await provider.list()
  expect(candidates.map(item => item.name)).toEqual(['study'])
  const study = await provider.get(candidates[0]!)
  expect(study?.content).toContain('openmaic/README.md')
  expect(study?.content).not.toContain('K-12 core-literacy classroom design')
  const root = new URL('../knowledge/skills/study/openmaic/', import.meta.url)
  const manifest = JSON.parse(await readFile(new URL('manifest.json', root), 'utf8'))
  expect(manifest.entries).toHaveLength(24)
  expect(manifest.officialPlugin.skills).toEqual(['openmaic-teach', 'openmaic-slide', 'openmaic-widget', 'openmaic-render'])
  expect(manifest.entries.find((entry: { name: string }) => entry.name === 'pptx-import')).toMatchObject({ status: 'workflow-source-only', constraintsExecutedInDSH: false })
  for (const source of manifest.sourceFiles) {
    const bytes = await readFile(new URL(source.path, root))
    const blob = createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex')
    expect(blob, source.path).toBe(source.gitBlob)
  }
})
