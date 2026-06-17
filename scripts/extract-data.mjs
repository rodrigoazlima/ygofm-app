import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import vm from 'vm'

const root = resolve(process.cwd(), '..')
const dataDir = resolve(root, 'data')
const outDir = resolve(process.cwd(), 'src/data')
mkdirSync(outDir, { recursive: true })

function evalFile(file, context = {}) {
  const src = readFileSync(resolve(dataDir, file), 'utf8')
  vm.runInNewContext(src, context)
  return context
}

// cards.json
const c1 = evalFile('cards.js', { TAFFY: arr => arr })
const cards = c1.card_db
writeFileSync(resolve(outDir, 'cards.json'), JSON.stringify(cards))
console.log(`cards.json: ${cards.length} cards`)

// fusions.json
const c2 = evalFile('fusions.js')
const fusions = c2.fusionsList
writeFileSync(resolve(outDir, 'fusions.json'), JSON.stringify(fusions))
console.log(`fusions.json: ${fusions.length} entries`)

// results.json
const c3 = evalFile('results.js')
const results = c3.resultsList
writeFileSync(resolve(outDir, 'results.json'), JSON.stringify(results))
console.log(`results.json: ${results.length} entries`)

// fandomImages.json
const c4 = evalFile('fandom_images.js')
const fandom = c4.fandomImages
writeFileSync(resolve(outDir, 'fandomImages.json'), JSON.stringify(fandom))
console.log(`fandomImages.json: ${Object.keys(fandom).length} entries`)

// localImages.json — fix paths: "images/..." → "/images/..."
const c5 = evalFile('local_images.js')
const local = c5.localImages
const fixedLocal = {}
for (const [k, v] of Object.entries(local)) {
  fixedLocal[k] = v.startsWith('/') ? v : '/' + v
}
writeFileSync(resolve(outDir, 'localImages.json'), JSON.stringify(fixedLocal))
console.log(`localImages.json: ${Object.keys(fixedLocal).length} entries`)

console.log('Done.')
