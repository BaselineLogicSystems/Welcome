// src/assets/js/clientConfig.js

/**
 * Utility: perform a fetch for a JSON file, fallback to empty object.
 */
export async function fetchJSON(url) {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
    return await res.json();
  } catch (e) {
    console.warn(`⚠WARNING  ${e.message}`);
    return {};          // fall back to empty object so merge doesn’t fail
  }
}
