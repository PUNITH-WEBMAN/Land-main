// components/survey-map.tsx
"use client"

import { useEffect, useRef, useState } from "react"
import JSZip from "jszip"
import { kml } from "@tmcw/togeojson"

interface SurveyMapProps {
  surveyNumber?: string
  height?: string
  onSurveyLocate?: (lat: number, lng: number) => void
}

function norm(s: string) {
  return s.trim().toLowerCase()
}

export function SurveyMap({ surveyNumber, height = "500px", onSurveyLocate }: SurveyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<any>(null)
  const markersGroup = useRef<any[]>([])
  const linesGroup = useRef<any[]>([])
  const addressCache = useRef<Record<string, string>>({})
  const surveysIndex = useRef<Record<string, { lat: number; lng: number }>>({})
  const [surveysReady, setSurveysReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [markersBuilt, setMarkersBuilt] = useState(false)
  const LRef = useRef<any>(null)
  const selectedMarker = useRef<any | null>(null)
  const nameIndex = useRef<Record<string, { marker: any; lat: number; lng: number }>>({})

  // color tokens you can tweak
  const COLORS = {
    deepBg: "rgba(6,10,20,0.88)", // deep dark blue base (glass)
    glassBorder: "rgba(255,255,255,0.06)",
    primary: "#2563eb", // azure-blue accent (keep same as your previous)
    accentPurple: "#7c3aed",
    accentCyan: "#06b6d4",
    textLight: "#e6eef8"
  }

  // Build popup HTML with optional "search this" box if this isn't the currently viewed survey
  const buildPopupHTML = (name: string, address: string, lat: number, lng: number) => {
    const isCurrent = surveyNumber && norm(name) === norm(surveyNumber)
    const searchBox = !isCurrent ? `
      <div style="margin-top:8px;">
        <div style="display:flex; gap:6px;">
          <input type="text" value="${name}" style="flex:1;padding:6px 8px;border:1px solid rgba(255,255,255,0.06);border-radius:6px;font-size:12px;background:rgba(255,255,255,0.04);color:${COLORS.textLight};"/>
          <button style="padding:6px 10px;background:${COLORS.primary};color:white;border:none;border-radius:6px;font-weight:600;cursor:pointer;" onclick="(function(btn){var inp=btn.previousElementSibling;var v=inp&&inp.value?inp.value.trim():''; if(v){window.location.href='/results?survey='+encodeURIComponent(v);}})(this)">Search</button>
        </div>
      </div>
    ` : ''

    return `
      <div style="font-size: 12px; min-width: 240px; color: ${COLORS.textLight}; font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;">
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
          <div>
            <div style="font-weight:700; font-size:13px; color: ${COLORS.textLight};">Survey ${name}</div>
            <div style="margin-top:6px; font-size:12px; color: rgba(230,238,248,0.88);">
              <strong style="color:${COLORS.accentCyan}; font-weight:600;">Address:</strong><br/>
              ${address}
            </div>
          </div>
          <div style="text-align:right; font-size:11px; color:rgba(230,238,248,0.8);">
            <div style="font-weight:600; color:${COLORS.accentPurple};">Coords</div>
            <div>${lat.toFixed(6)}, ${lng.toFixed(6)}</div>
          </div>
        </div>
        ${searchBox}
      </div>
    `
  }

  // Build a Leaflet divIcon for a survey label. When highlighted, use a fixed-size circle that centers the number.
  function makeSurveyIcon(name: string, highlighted: boolean) {
    if (!LRef.current) return null
    const textShadow = '0 1px 0 rgba(0,0,0,0.6)'

    if (highlighted) {
      const html = `
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, rgba(37,99,235,0.20), rgba(124,58,237,0.12));
          border: 2px solid ${COLORS.primary};
          box-shadow: 0 6px 18px rgba(2,6,23,0.6), inset 0 1px 0 rgba(255,255,255,0.02);
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
        ">
          <div style="color: ${COLORS.textLight}; font-weight: 700; font-size: 14px; line-height: 1; text-shadow: ${textShadow};">${name}</div>
        </div>`
      return LRef.current.divIcon({
        html,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
        className: 'no-bg-marker'
      })
    }

    const html = `<div style="display:inline-flex; align-items:center; gap:6px; padding:2px 6px; border-radius:8px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.03); font-weight:700; font-size:13px; color:${COLORS.textLight}; text-shadow: ${textShadow};">${name}</div>`
    return LRef.current.divIcon({
      html,
      iconSize: null,
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
      className: 'no-bg-marker'
    })
  }

  // Preload all addresses from JSON file
  const preloadAddresses = async () => {
    try {
      const response = await fetch('/addresses.json')
      if (response.ok) {
        const addresses = await response.json()
        addressCache.current = addresses
        console.log('Addresses preloaded:', Object.keys(addresses).length)
      }
    } catch (err) {
      console.warn('Could not preload addresses:', err)
    }
  }

  // Preload surveys (name -> coords) for focusing by survey number
  const preloadSurveys = async () => {
    try {
      const res = await fetch('/surveys.json')
      if (res.ok) {
        const arr: Array<{ name: string; lat: number; lon: number }> = await res.json()
        const idx: Record<string, { lat: number; lng: number }> = {}
        arr.forEach((s) => {
          if (!s.name) return
          idx[norm(s.name)] = { lat: Number(s.lat), lng: Number(s.lon) }
        })
        surveysIndex.current = idx
        setSurveysReady(true)
        console.log('Surveys preloaded:', Object.keys(idx).length)
      }
    } catch (err) {
      console.warn('Could not preload surveys:', err)
    }
  }

  // Get address from cache or API
  const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`

    // Check cache first
    if (addressCache.current[key]) {
      return addressCache.current[key]
    }

    // Fallback to API
    try {
      const response = await fetch(
        `/api/geocode?lat=${lat}&lng=${lng}`
      )
      if (response.ok) {
        const data = await response.json()
        if (data.address) {
          addressCache.current[key] = data.address
          return data.address
        }
      }
    } catch (err) {
      console.error("Geocoding error:", err)
    }

    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }

  useEffect(() => {
    // Preload addresses and surveys on mount
    preloadAddresses()
    preloadSurveys()
  }, [])

  useEffect(() => {
    if (!mapContainer.current) return

    // Dynamically import leaflet
    import("leaflet").then((L) => {
      try {
        LRef.current = L
        // Initialize map
        if (!map.current) {
          // Compute initial center/zoom: if we know the survey coords, start there at zoom 19
          let initCenter: [number, number] = [12.867, 77.564]
          let initZoom = 16
          if (surveyNumber) {
            const hit = surveysIndex.current[norm(surveyNumber)]
            if (hit) {
              initCenter = [hit.lat, hit.lng]
              initZoom = 19
            }
          }
          map.current = L.map(mapContainer.current, {
            center: initCenter,
            zoom: initZoom,
            zoomControl: true,
            preferCanvas: true
          })

          // Define base layers (dark-first, but keep the rest)
          const baseLayers: Record<string, any> = {
            // Dark default tileset (Carto dark) - default chosen below
            "Dark (Carto)": L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
              attribution: "© OpenStreetMap, © CARTO",
              maxZoom: 19
            }),
            "Street (OSM)": L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
              attribution: "© OpenStreetMap",
              maxZoom: 19
            }),
            "Satellite (Esri)": L.tileLayer(
              "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
              {
                attribution: "© Esri",
                maxZoom: 19
              }
            ),
            "Topo (OpenTopoMap)": L.tileLayer(
              "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
              {
                attribution: "© OpenTopoMap",
                maxZoom: 19
              }
            ),
            "Humanitarian (OSM HOT)": L.tileLayer(
              "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
              {
                attribution: "© OpenStreetMap HOT",
                maxZoom: 19
              }
            )
          }

          // Add default dark layer
          baseLayers["Dark (Carto)"].addTo(map.current)

          // Add layer control with compact style
          L.control.layers(baseLayers, {}, { position: "topright", collapsed: true }).addTo(map.current)

          // Show the map immediately; keep data loading in the background
          setIsLoading(false)

          // Handle zoom changes to show/hide markers and lines
          map.current.on("zoomend", () => {
            const zoom = map.current.getZoom()
            const showMarkers = zoom >= 15
            const showLines = zoom >= 14

            markersGroup.current.forEach((marker: any) => {
              if (showMarkers) {
                marker.addTo(map.current)
              } else {
                map.current.removeLayer(marker)
              }
            })

            linesGroup.current.forEach((line: any) => {
              if (showLines) {
                line.addTo(map.current)
              } else {
                map.current.removeLayer(line)
              }
            })
          })

          loadAndDisplayKMZ(L)
        }
      } catch (err) {
        console.error("Map init error:", err)
        setError("Failed to initialize map")
      }
    })

    async function loadAndDisplayKMZ(L: any) {
      try {
        setError(null)

        // Fetch KMZ file
        const response = await fetch("/survey.KMZ")
        if (!response.ok) {
          throw new Error("Failed to load KMZ file")
        }

        const arrayBuffer = await response.arrayBuffer()

        // Extract KML from KMZ
        const zip = new JSZip()
        const loadedZip = await zip.loadAsync(arrayBuffer)

        let kmlString = null
        for (const [filename, file] of Object.entries(loadedZip.files)) {
          if (filename.toLowerCase().endsWith(".kml") && !(file as any).dir) {
            kmlString = await (file as any).async("text")
            break
          }
        }

        if (!kmlString) {
          throw new Error("No KML found in KMZ file")
        }

        console.log("KML loaded, parsing...")

        // Parse KML to GeoJSON
        const parser = new DOMParser()
        const kmlDoc = parser.parseFromString(kmlString, "text/xml")
        const geojson = kml(kmlDoc)

        console.log("GeoJSON features:", geojson.features.length)

        if (!geojson.features || geojson.features.length === 0) {
          throw new Error("No features found in KML")
        }

        // Display all points
        const zoom = map.current.getZoom()
        geojson.features.forEach((feature: any, index: number) => {
          if (feature.geometry?.type === "Point") {
            const coords = feature.geometry.coordinates
            const lat = coords[1]
            const lng = coords[0]
            const name =
              feature.properties?.Name ||
              feature.properties?.name ||
              `Point ${index + 1}`

            console.log(`Adding marker: ${name} at ${lat}, ${lng}`)

            const customIcon = L.divIcon({
              html: `<div style="display:inline-flex; align-items:center; gap:6px; padding:4px 8px; border-radius:10px; background:linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01)); border:1px solid rgba(255,255,255,0.03); font-weight:700; font-size:13px; color:${COLORS.textLight};">${name}</div>`,
              iconSize: null,
              iconAnchor: [10, 10],
              popupAnchor: [0, -12],
              className: 'no-bg-marker'
            })

            const marker = L.marker([lat, lng], { icon: customIcon }) as any
            marker.__labelName = name
            // index by name for exact survey-number matching
            nameIndex.current[norm(name)] = { marker, lat, lng }
            if (zoom >= 15) {
              marker.addTo(map.current)
            }

            // Bind popup with initial content and update with address
            marker.bindPopup(buildPopupHTML(name, '<em>Loading...</em>', lat, lng))

            // Get address and update popup
            getAddressFromCoordinates(lat, lng).then((address) => {
              marker.setPopupContent(buildPopupHTML(name, address, lat, lng))
            })

            markersGroup.current.push(marker)
          }
        })

        // Display lines/polygons
        geojson.features.forEach((feature: any) => {
          if (
            feature.geometry?.type === "LineString" ||
            feature.geometry?.type === "Polygon"
          ) {
            const line = L.geoJSON(feature, {
              style: {
                color: COLORS.primary,
                weight: 2,
                opacity: 0.9,
                fill: false
              }
            })
            if (zoom >= 14) {
              line.addTo(map.current)
            }
            linesGroup.current.push(line)
          }
        })

        // Fit bounds
        const allCoords: any[] = []
        geojson.features.forEach((feature: any) => {
          if (feature.geometry?.coordinates) {
            if (feature.geometry.type === "Point") {
              allCoords.push(feature.geometry.coordinates)
            }
          }
        })

        if (!surveyNumber && allCoords.length > 0) {
          const bounds = L.latLngBounds(
            allCoords.map((c: any) => [c[1], c[0]])
          )
          map.current.fitBounds(bounds, { padding: [50, 50] })
        }

        // If this page was opened for a specific survey, highlight its marker now without changing view
        if (surveyNumber) {
          const key = norm(surveyNumber)
          let targetMarker: any | null = null
          if (nameIndex.current[key]) {
            targetMarker = nameIndex.current[key].marker
          } else if (surveysIndex.current[key]) {
            // Fallback: pick nearest by coord
            const t = surveysIndex.current[key]
            const targetLat = Number(t.lat.toFixed(6))
            const targetLng = Number(t.lng.toFixed(6))
            let best: any = null
            let bestDist = Infinity
            markersGroup.current.forEach((m: any) => {
              const ll = m.getLatLng()
              const d = Math.hypot(Number(ll.lat.toFixed(6)) - targetLat, Number(ll.lng.toFixed(6)) - targetLng)
              if (d < bestDist) { best = m; bestDist = d }
            })
            targetMarker = best
          }
          if (targetMarker) {
            // reset previous
            if (selectedMarker.current && selectedMarker.current !== targetMarker) {
              const prevName = (selectedMarker.current as any).__labelName || ''
              const prevIcon = makeSurveyIcon(prevName, false)
              if (prevIcon) selectedMarker.current.setIcon(prevIcon)
            }
            const nm = (targetMarker as any).__labelName || ''
            const hiIcon = makeSurveyIcon(nm, true)
            if (hiIcon) targetMarker.setIcon(hiIcon)
            selectedMarker.current = targetMarker
            // Emit actual KMZ coordinates
            const ll = targetMarker.getLatLng()
            if (onSurveyLocate) {
              onSurveyLocate(ll.lat, ll.lng)
            }
          }
        }

        // mark that markers exist (used by external focus logic)
        setMarkersBuilt(true)
      } catch (err) {
        console.error("KMZ loading error:", err)
        setError("Failed to load KMZ")
      }
    }
  }, [])

  // Try to focus by surveyNumber when data is ready (run on both surveys and markers readiness)
  useEffect(() => {
    if (!surveyNumber) return
    if (!map.current) return
    const key = norm(surveyNumber)

    // 1) If markers are built and we have an exact name match, use that (no extra zoom if already centered)
    if (markersBuilt && nameIndex.current[key]) {
      const { marker } = nameIndex.current[key]
      // reset previous highlight
      if (selectedMarker.current && selectedMarker.current !== marker) {
        const prevName = (selectedMarker.current as any).__labelName || ''
        const prevIcon = makeSurveyIcon(prevName, false)
        if (prevIcon) selectedMarker.current.setIcon(prevIcon)
      }
      const nm = (marker as any).__labelName || ''
      const hiIcon = makeSurveyIcon(nm, true)
      if (hiIcon) marker.setIcon(hiIcon)
      selectedMarker.current = marker
      // Emit actual KMZ coordinates
      const ll = marker.getLatLng()
      if (onSurveyLocate) {
        onSurveyLocate(ll.lat, ll.lng)
      }
      return
    }

    // 2) Otherwise, if we have preloaded coords from surveys.json, just ensure the view is set once (no animation)
    if (surveysReady && surveysIndex.current[key]) {
      const { lat, lng } = surveysIndex.current[key]
      map.current.setView([lat, lng], 19)
      return
    }
  }, [surveyNumber, surveysReady, markersBuilt])

  return (
    <>
      <style>{`
        /* Map container dark backing */
        .leaflet-container {
          background: linear-gradient(180deg, #030617, #071025);
        }

        /* Popups styled as glassmorphism dark cards */
        .no-bg-marker .leaflet-popup-content-wrapper {
          background: linear-gradient(180deg, rgba(10,12,20,0.7), rgba(8,10,16,0.65));
          color: ${COLORS.textLight};
          border-radius: 12px;
          padding: 10px;
          box-shadow: 0 10px 30px rgba(2,6,23,0.7);
          border: 1px solid ${COLORS.glassBorder};
          backdrop-filter: blur(6px) saturate(120%);
        }
        .no-bg-marker .leaflet-popup-content {
          margin: 0;
          line-height: 1.25;
        }
        .no-bg-marker .leaflet-popup-tip {
          background: transparent;
        }
        .leaflet-control-zoom,
        .leaflet-control-layers {
          box-shadow: 0 6px 18px rgba(2,6,23,0.6);
          border-radius: 10px;
          background: linear-gradient(180deg, rgba(10,12,16,0.6), rgba(12,14,20,0.55));
          border: 1px solid rgba(255,255,255,0.03);
        }
        .leaflet-control-layers-toggle {
          background-image: none !important;
        }
        /* Make default attribution small and subtle */
        .leaflet-control-attribution {
          color: rgba(230,238,248,0.6);
          font-size: 11px;
        }

        /* small responsive touch */
        @media (max-width: 640px) {
          .no-bg-marker .leaflet-popup-content-wrapper { min-width: 200px; }
        }
      `}</style>

      {/* Added top margin 20px so navbar doesn't overlap the top of the map */}
      <div className="w-full rounded-lg border border-gray-700 overflow-hidden" style={{ borderColor: "rgba(255,255,255,0.04)", marginTop: 20 }}>
        {error && (
          <div className="bg-red-900/40 border border-red-700 text-red-200 p-4 text-sm">
            ❌ {error}
          </div>
        )}
        <div
          ref={mapContainer}
          style={{
            height,
            width: "100%",
            position: "relative"
          }}
          className="leaflet-container"
        >
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10">
              <p className="text-gray-200 font-medium">Loading survey map...</p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
