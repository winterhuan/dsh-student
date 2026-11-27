#!/usr/bin/env node
/** Explicit offline migration is separate from the read-only authoring CLI. */
import { parseArgs } from 'node:util'
import { cleanupEmptyActivities } from './files/cleanup-node.ts'
try {
  const { values, positionals } = parseArgs({ allowPositionals: true, options: { workspace: { type: 'string' }, offline: { type: 'boolean' } } })
  if (!values.offline || !values.workspace || !positionals.length) throw new Error('Stop the owning service, then use cleanup.js --offline --workspace <root> <confirmed-empty-block-id>...')
  console.log(JSON.stringify(await cleanupEmptyActivities(values.workspace, positionals)))
} catch (error) { console.error(error instanceof Error ? error.message : 'Cleanup failed. Original evidence is retained.'); process.exitCode = 1 }
