// Pre-build: strip all em-dashes (U+2014) and en-dashes (U+2013) from src/
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcDir = path.resolve(__dirname, '..', 'src')

function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const fp = path.join(dir, e.name)
    if (e.isDirectory()) { walk(fp); continue }
    if (!e.name.endsWith('.ts') && !e.name.endsWith('.tsx')) continue
    let c = fs.readFileSync(fp, 'utf-8')
    const before = c
    // Replace " — " (space-emdash-space) with ". " in fact strings
    // and with ": " or ", " in comments/other contexts
    c = c.replace(/ \u2014 /g, '. ')
    // Remaining standalone em-dashes (no spaces)
    c = c.replace(/\u2014/g, ' - ')
    // En-dashes
    c = c.replace(/\u2013/g, '-')
    if (c !== before) {
      fs.writeFileSync(fp, c, 'utf-8')
      const n = (before.match(/[\u2014\u2013]/g) || []).length
      console.log(`  Fixed ${n} dashes in ${path.relative(path.resolve(__dirname, '..'), fp)}`)
    }
  }
}

console.log('Stripping em-dashes...')
walk(srcDir)
console.log('Done.')
