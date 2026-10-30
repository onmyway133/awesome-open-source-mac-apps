import { readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

export const root = resolve(import.meta.dirname, '..')

export const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))

export const loadCategories = () => readJson(join(root, 'categories.json'))

/** Every apps/<slug>.json as { slug, file, app }. */
export const loadApps = () =>
  readdirSync(join(root, 'apps'))
    .filter((name) => name.endsWith('.json'))
    .sort()
    .map((name) => ({ slug: name.slice(0, -5), file: `apps/${name}`, app: readJson(join(root, 'apps', name)) }))

export const writeJson = (value) => JSON.stringify(value, null, 2) + '\n'
