/** Package the fixed official implementation at build time; downstream installations need no Git dependency or build. */
import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire, isBuiltin } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'tsdown'

const packageRoot = fileURLToPath(new URL('../packages/winterhuan/student/', import.meta.url))
const manifest = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'))
const require = createRequire(join(packageRoot, 'package.json'))
const originalRoot = dirname(require.resolve('@openmaic/dsh-openmaic/package.json'))
const original = JSON.parse(await readFile(join(originalRoot, 'package.json'), 'utf8'))
const output = join(packageRoot, 'lib/openmaic')
await rm(output, { recursive: true, force: true })
await mkdir(output, { recursive: true })
const bundles = await build({
  config: false,
  entry: { 'lib/index': join(originalRoot, 'lib/index.js'), 'client-entry': join(packageRoot, 'src/openmaic/client-entry.ts') },
  outDir: output,
  format: 'esm',
  fixedExtension: false,
  platform: 'node',
  target: 'es2024',
  dts: false,
  clean: false,
  deps: {
    neverBundle: /^@deepseek-ai\//,
    alwaysBundle: id => !isBuiltin(id) && !id.startsWith('@deepseek-ai/'),
  },
})
await cp(join(originalRoot, 'lib/client.js'), join(output, 'lib/client.js'))
await cp(join(originalRoot, 'LICENSE'), join(output, 'LICENSE'))
await cp(join(originalRoot, 'assets'), join(output, 'assets'), { recursive: true })
await writeFile(join(output, 'cordis.yml'), '- id: official-openmaic-client\n  name: ./client-entry.js\n')
await writeFile(join(output, 'package.json'), JSON.stringify({
  name: original.name,
  version: original.version,
  type: 'module',
  license: original.license,
  main: './client-entry.js',
  exports: { '.': './client-entry.js', './client': './lib/client.js', './package.json': './package.json' },
  dsh: { client: original.dsh.client },
}, null, 2) + '\n')
const hash = async path => createHash('sha256').update(await readFile(path)).digest('hex')
await writeFile(join(output, 'source.json'), JSON.stringify({
  source: manifest.devDependencies[original.name],
  version: original.version,
  bundledDependencies: [...new Set(bundles.flatMap(bundle => [...bundle.inlinedDeps.keys()]))].sort(),
  lockfileSha256: await hash(fileURLToPath(new URL('../pnpm-lock.yaml', import.meta.url))),
  originalHostSha256: await hash(join(originalRoot, 'lib/index.js')),
  originalClientSha256: await hash(join(originalRoot, 'lib/client.js')),
  host: 'The official Host and its npm dependency closure are bundled; DSH services remain external.',
  client: 'The original browser bundle and skill assets are packaged unchanged. The client-only Loader entry registers no Host tools.',
}, null, 2) + '\n')
