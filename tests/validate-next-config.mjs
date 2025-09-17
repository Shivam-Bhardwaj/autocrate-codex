import { access } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const candidates = ['../next.config.mjs', '../next.config.js']
let loadedConfigPath = null
let lastError = null

for (const relativePath of candidates) {
  const absolutePath = path.resolve(__dirname, relativePath)

  try {
    await access(absolutePath)
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      lastError = new Error(
        `Missing Next.js config candidate: ${path.basename(relativePath)}`
      )
      continue
    }

    lastError = error
    continue
  }

  try {
    const module = await import(pathToFileURL(absolutePath).href)

    if (!module || typeof module.default !== 'object') {
      throw new TypeError(
        `${path.basename(absolutePath)} must export a configuration object as the default export`
      )
    }

    loadedConfigPath = absolutePath
    break
  } catch (error) {
    lastError = error
  }
}

if (!loadedConfigPath) {
  console.error('Next.js config validation failed.')
  if (lastError) {
    console.error(lastError)
  }
  console.error(
    'Ensure next.config.mjs or next.config.js exists at the project root and exports a default configuration object.'
  )
  process.exit(1)
}

console.log(`Validated Next.js config at ${path.relative(process.cwd(), loadedConfigPath)}`)
