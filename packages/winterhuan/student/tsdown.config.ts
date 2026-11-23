import { clientBundle } from '../../../scripts/tsdown.client.ts'

export default clientBundle(import.meta.dirname, [], {
  hostPhase: true,
  lib: { plugins: [{ name: 'student-official-openmaic', resolveId(id) {
    if (id === '@openmaic/dsh-openmaic') return { id: './openmaic/lib/index.js', external: true }
    return null
  } }], entry: { agent: 'lib/types/agent.js', openmaic: 'lib/types/openmaic/index.js', index: 'lib/types/index.js', files: 'lib/types/files/index.js', cli: 'lib/types/cli.js' } },
})
