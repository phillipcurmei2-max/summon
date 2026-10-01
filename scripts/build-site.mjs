// Bundles the website's live demo (which reuses the app's own search code) into site/demo.js.
import { build } from 'esbuild'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
await build({
  entryPoints: [join(root, 'site/src/demo.ts')],
  outfile: join(root, 'site/demo.js'),
  bundle: true,
  minify: true,
  format: 'iife',
  target: 'es2020',
  legalComments: 'none'
})
console.log('built site/demo.js')
