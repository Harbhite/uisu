/**
 * Offline cache for AI-generated outputs.
 * Stores recent results in localStorage so students can access them without internet.
 */

const CACHE_KEY = 'ai_tools_cache';
const MAX_ENTRIES = 20;

export interface CachedOutput {
  tool: 'quiz' | 'flashcards' | 'study-aide' | 'study-buddy';
  topic: string;
  result: any; // questions array, flashcards array, or text
  timestamp: number;
  mode?: string;
  depth?: string;
}

function getCache(): CachedOutput[] {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
  } catch {
    return [];
  }
}

function setCache(entries: CachedOutput[]) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
}

export function cacheOutput(entry: Omit<CachedOutput, 'timestamp'>) {
  const cache = getCache();
  cache.unshift({ ...entry, timestamp: Date.now() });
  setCache(cache);
}

export function getCachedOutputs(tool?: CachedOutput['tool']): CachedOutput[] {
  const cache = getCache();
  return tool ? cache.filter(e => e.tool === tool) : cache;
}

export function clearCache(tool?: CachedOutput['tool']) {
  if (!tool) {
    localStorage.removeItem(CACHE_KEY);
  } else {
    setCache(getCache().filter(e => e.tool !== tool));
  }
}
