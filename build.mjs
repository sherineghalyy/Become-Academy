// Builds the site with esbuild: bundles src/main.jsx, inlines nothing external, writes dist/.
//   npm run build   -> dist/ (upload this folder to your host)
//   npm run dev     -> local preview at http://localhost:8000
import { build, context } from 'esbuild'
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises'

const SERVE = process.argv.includes('--serve')
const SINGLE = process.argv.includes('--single') // one self-contained index.html (for previews)

const opts = {
  entryPoints: { app: 'src/main.jsx' },
  bundle: true,
  minify: !SERVE,
  sourcemap: false,
  format: 'esm',
  target: 'es2020',
  jsx: 'automatic',
  loader: { '.jpg': SINGLE ? 'dataurl' : 'file', '.png': SINGLE ? 'dataurl' : 'file' },
  assetNames: 'assets/[name]-[hash]',
  define: { 'process.env.NODE_ENV': SERVE ? '"development"' : '"production"' },
  legalComments: 'none',
  outdir: 'dist',
  logLevel: 'info',
}

async function html() {
  let h = await readFile('index.html', 'utf8')
  h = h.replace('<script type="module" src="/src/main.jsx"></script>', '<link rel="stylesheet" href="/app.css" />\n    <script type="module" src="/app.js"></script>')
  await writeFile('dist/index.html', h)
}

if (SERVE) {
  await rm('dist', { recursive: true, force: true })
  await mkdir('dist', { recursive: true })
  const ctx = await context(opts)
  await ctx.watch()
  await html()
  await cp('public', 'dist', { recursive: true })
  const { port } = await ctx.serve({ servedir: 'dist', port: 8000 })
  console.log(`Preview: http://localhost:${port}`)
} else {
  await rm('dist', { recursive: true, force: true })
  await mkdir('dist', { recursive: true })
  await build(opts)
  await html()
  await cp('public', 'dist', { recursive: true })
}
