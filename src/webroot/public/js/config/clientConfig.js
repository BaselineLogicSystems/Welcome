// src/assets/js/clientConfig.js


// Deprecated???
// TODO: Merge or add cache lookup for config


/**
 * Loads config.json and merges it with an environment‑specific file.
 * Caches the merged result so only one HTTP round‑trip happens per page load.
 */
let _cachedConfig = null;   // the merged JSON (once loaded)
let _configPromise = null;  // the promise that is currently resolving

let _seoPromise = null;  // the promise that is currently resolving

let _contentPromise = null;  // the promise that is currently resolving

/**
 * Utility: perform a fetch for a JSON file, fallback to empty object.
 */
async function fetchJSON(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
    return await res.json();
  } catch (e) {
    console.warn(`⚠WARNING  ${e.message}`);
    return {};          // fall back to empty object so merge doesn’t fail
  }
}

export async function loadConfig() {
  if (_cachedConfig) return _cachedConfig;
  if (_configPromise) return _configPromise;

  const baseURL = '/Welcome/config/';

  _configPromise = (async () => {
    // Load base config.json
    return await fetchJSON(`${baseURL}config.json`);
  })();

  return _configPromise;
}

export async function loadSiteData() {
  if (_seoPromise) return _seoPromise;

  const baseURL = '/Welcome/config/';

  _seoPromise = (async () => {
    // Load base config.json
    return await fetchJSON(`${baseURL}siteseo.json`);
  })();

  return _seoPromise;
}

export async function loadContent (fileName) {

  // TODO: improve performance significantly by loading the content for each page only once!
  //  (manage with no-cache during dev?)
  //  (at cost of memory vs speed, low priority)
  // if (_cachedConfig) return _cachedConfig;
  // TODO: prevent DOS at startup / minor performance hit for semaphores failure.
  // if (_configPromise) return _configPromise;

  const baseURL = 'content/';

  _contentPromise = (async () => {
    // Load base config.json
    return await fetchJSON(`${baseURL}${fileName}.json`);
  })();

  return _contentPromise;
}
