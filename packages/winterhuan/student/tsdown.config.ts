import { clientBundle } from '../../../scripts/tsdown.client.ts'

export default clientBundle(import.meta.dirname, [], {
  hostPhase: true,
  lib: { entry: { agent: 'lib/types/agent.js', openmaic: 'lib/types/openmaic/index.js', index: 'lib/types/index.js', files: 'lib/types/files/index.js', cli: 'lib/types/cli.js' } },
})
