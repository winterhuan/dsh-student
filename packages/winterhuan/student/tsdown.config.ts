import { clientBundle } from '../../../scripts/tsdown.client.ts'

export default clientBundle(import.meta.dirname, [], {
  hostPhase: true,
  lib: { entry: { agent: 'lib/types/agent.js', index: 'lib/types/index.js', files: 'lib/types/files/index.js' } },
})
