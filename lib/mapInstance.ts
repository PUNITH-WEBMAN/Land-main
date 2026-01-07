// lib/mapInstance.ts

type MapKey = "CDPMap" | "UnifiedPlanner" | string

declare global {
  interface Window {
    __ACTIVE_MAP__?: MapKey | null
  }
}

/**
 * Registers a map instance globally.
 * Returns false if another map is already active.
 */
export function registerMap(key: MapKey): boolean {
  if (typeof window === "undefined") return true

  if (!window.__ACTIVE_MAP__) {
    window.__ACTIVE_MAP__ = key
    return true
  }

  return false
}

/**
 * Unregisters the map instance when unmounted.
 */
export function unregisterMap(key: MapKey) {
  if (typeof window === "undefined") return

  if (window.__ACTIVE_MAP__ === key) {
    window.__ACTIVE_MAP__ = null
  }
}
