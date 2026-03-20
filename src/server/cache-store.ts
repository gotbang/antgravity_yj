import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { existsSync, rmSync } from 'node:fs'
import path from 'node:path'

type CacheEnvelope<T> = {
  key: string
  updatedAt: string
  expiresAt: string
  data: T
}

const memoryCache = new Map<string, CacheEnvelope<unknown>>()
const cacheStats = {
  hits: 0,
  misses: 0,
  writes: 0,
  fallbacks: 0,
}

function getCacheRoot() {
  return process.env.MARKET_CACHE_DIR ?? path.join(process.cwd(), 'data', 'cache')
}

function resolveCachePath(relativePath: string) {
  return path.join(getCacheRoot(), relativePath)
}

function isFresh(expiresAt: string) {
  return new Date(expiresAt).getTime() > Date.now()
}

async function readFileCache<T>(relativePath: string) {
  const filePath = resolveCachePath(relativePath)

  try {
    const raw = await readFile(filePath, 'utf8')
    return JSON.parse(raw) as CacheEnvelope<T>
  } catch {
    return null
  }
}

async function writeFileCache<T>(relativePath: string, envelope: CacheEnvelope<T>) {
  const filePath = resolveCachePath(relativePath)
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, JSON.stringify(envelope, null, 2), 'utf8')
}

export async function getCachedResource<T>(options: {
  cacheKey: string
  filePath: string
  ttlMs: number
  loader: () => Promise<T>
  forceRefresh?: boolean
}) {
  const { cacheKey, filePath, ttlMs, loader, forceRefresh = false } = options

  const memoryEntry = memoryCache.get(cacheKey) as CacheEnvelope<T> | undefined

  if (!forceRefresh && memoryEntry && isFresh(memoryEntry.expiresAt)) {
    cacheStats.hits += 1
    return memoryEntry.data
  }

  const fileEntry = !forceRefresh ? await readFileCache<T>(filePath) : null

  if (fileEntry) {
    memoryCache.set(cacheKey, fileEntry)

    if (isFresh(fileEntry.expiresAt)) {
      cacheStats.hits += 1
      return fileEntry.data
    }
  }

  cacheStats.misses += 1

  try {
    const data = await loader()
    const envelope: CacheEnvelope<T> = {
      key: cacheKey,
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + ttlMs).toISOString(),
      data,
    }

    memoryCache.set(cacheKey, envelope)
    await writeFileCache(filePath, envelope)
    cacheStats.writes += 1

    return data
  } catch (error) {
    if (fileEntry) {
      cacheStats.fallbacks += 1
      return fileEntry.data
    }

    if (memoryEntry) {
      cacheStats.fallbacks += 1
      return memoryEntry.data
    }

    throw error
  }
}

export async function writeCachedResource<T>(options: {
  cacheKey: string
  filePath: string
  ttlMs: number
  data: T
}) {
  const envelope: CacheEnvelope<T> = {
    key: options.cacheKey,
    updatedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + options.ttlMs).toISOString(),
    data: options.data,
  }

  memoryCache.set(options.cacheKey, envelope)
  await writeFileCache(options.filePath, envelope)
}

export function clearCacheStore() {
  memoryCache.clear()
  cacheStats.hits = 0
  cacheStats.misses = 0
  cacheStats.writes = 0
  cacheStats.fallbacks = 0
  const cacheRoot = getCacheRoot()

  if (existsSync(cacheRoot)) {
    rmSync(cacheRoot, { recursive: true, force: true })
  }
}

async function collectFiles(dirPath: string, basePath = dirPath) {
  if (!existsSync(dirPath)) {
    return [] as Array<{ key: string; updatedAt: string }>
  }

  const entries = await readdir(dirPath, { withFileTypes: true })
  const files: Array<{ key: string; updatedAt: string }> = []

  for (const entry of entries) {
    const resolved = path.join(dirPath, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectFiles(resolved, basePath)))
      continue
    }

    const info = await stat(resolved)
    files.push({
      key: path.relative(basePath, resolved).replace(/\\/g, '/'),
      updatedAt: info.mtime.toISOString(),
    })
  }

  return files
}

export async function getCacheDiagnostics() {
  const cacheRoot = getCacheRoot()
  const files = await collectFiles(cacheRoot)
  const latestUpdatedAt = files
    .map((file) => file.updatedAt)
    .sort()
    .at(-1) ?? null

  return {
    cacheRoot,
    stats: { ...cacheStats },
    memoryKeys: Array.from(memoryCache.keys()).sort(),
    latestUpdatedAt,
    files,
  }
}
