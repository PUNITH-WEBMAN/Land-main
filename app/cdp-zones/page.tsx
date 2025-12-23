// components/cdp-map.tsx
"use client"

import React, { useEffect, useRef, useState } from "react"
import type { FeatureCollection } from "geojson"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"

interface CDPMapProps {
  onPlotDataChange?: (geojson: FeatureCollection | null) => void
  initialLat?: number
  initialLng?: number
  initialZoom?: number
}

export function CDPMap({
  onPlotDataChange,
  initialLat,
  initialLng,
  initialZoom,
}: CDPMapProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const drawnRef = useRef<any>(null)
  const LRef = useRef<any>(null)
  const [searchValue, setSearchValue] = useState("")

  useEffect(() => {
    // run only on client
    if (!mapContainer.current) return

    let mounted = true
    Promise.all([
      import("leaflet"),
      import("leaflet-draw")
    ]).then(([LModule]) => {
      if (!mounted) return
      const L = LModule ? (LModule as any) : null
      LRef.current = L

      // fix default icon paths if needed (often needed in Next builds)
      try {
        const iconUrl = (L as any).Icon?.Default?.prototype?.options || null
        if (iconUrl) {
          // no-op: keep default - we don't change marker icon here
        }
      } catch (err) {
        // ignore
      }

      // create map
      if (!mapRef.current) {
        const center = [
          initialLat ?? 12.867,
          initialLng ?? 77.564,
        ]
        const zoom = initialZoom ?? 15

        mapRef.current = L.map(mapContainer.current, {
          center,
          zoom,
          preferCanvas: true,
        })

        // base layers: dark-first
        const dark = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap, © CARTO",
          maxZoom: 19,
        })
        const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        })
        const satellite = L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          { maxZoom: 19 }
        )
        const topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
          maxZoom: 17,
        })

        dark.addTo(mapRef.current)

        const baseLayers: Record<string, any> = {
          "Dark (Carto)": dark,
          "Street (OSM)": osm,
          Satellite: satellite,
          Topo: topo,
        }

        L.control.layers(baseLayers, {}, { position: "topright", collapsed: true }).addTo(mapRef.current)

        // drawn items group
        drawnRef.current = new L.FeatureGroup()
        mapRef.current.addLayer(drawnRef.current)

        // draw control
        const drawControl = new (L as any).Control.Draw({
          position: "topright",
          draw: {
            polygon: {
              allowIntersection: false,
              showArea: true,
              shapeOptions: {
                color: "#6366F1",
                weight: 2,
                opacity: 0.9,
                dashArray: null,
                fillOpacity: 0.12,
              },
            },
            polyline: false,
            rectangle: false,
            circle: false,
            marker: {
              icon: new (L as any).DivIcon({
                className: "cdp-marker",
                html: `<div style="width:18px;height:18px;border-radius:6px;background:#FF9933;box-shadow:0 4px 12px rgba(255,153,51,0.28)"></div>`,
              }),
            },
          },
          edit: {
            featureGroup: drawnRef.current,
            remove: true,
          },
        })
        mapRef.current.addControl(drawControl)

        // handle draw created
        mapRef.current.on((L as any).Draw.Event.CREATED, function (e: any) {
          const layer = e.layer
          drawnRef.current.addLayer(layer)
          emitGeoJSON()
        })

        mapRef.current.on((L as any).Draw.Event.EDITED, function (e: any) {
          emitGeoJSON()
        })
        mapRef.current.on((L as any).Draw.Event.DELETED, function (e: any) {
          emitGeoJSON()
        })

        // small helper for emitting geojson
        function emitGeoJSON() {
          try {
            const fc = drawnRef.current.toGeoJSON() as FeatureCollection
            if (onPlotDataChange) onPlotDataChange(fc)
          } catch (err) {
            if (onPlotDataChange) onPlotDataChange(null)
          }
        }

        // when user clicks feature -> open popup with basic info
        mapRef.current.on("click", (ev: any) => {
          // noop - reserved for future
        })

        // make popups & controls dark/glass
        const style = document.createElement("style")
        style.innerHTML = `
          .leaflet-container { background: linear-gradient(180deg,#030617,#071025); }
          .leaflet-popup-content-wrapper {
            background: linear-gradient(180deg, rgba(10,12,20,0.88), rgba(8,10,16,0.8));
            color: #e6eef8;
            border-radius: 10px;
            border: 1px solid rgba(255,255,255,0.04);
            box-shadow: 0 10px 30px rgba(2,6,23,0.7);
            backdrop-filter: blur(6px) saturate(120%);
          }
          .leaflet-control, .leaflet-bar {
            background: rgba(6,10,20,0.72) !important;
            border: 1px solid rgba(255,255,255,0.04) !important;
            backdrop-filter: blur(6px) !important;
          }
          .leaflet-draw-toolbar a, .leaflet-draw-toolbar a span {
            color: white !important;
          }
          .cdp-marker { pointer-events:none; }
        `
        document.head.appendChild(style)
      }
    }).catch((err) => {
      console.error("Failed to load leaflet or leaflet-draw:", err)
    })

    return () => {
      mounted = false
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [])

  // small Nominatim geocode (search) - returns first match
  async function doGeocode(q: string) {
    if (!q || !LRef.current || !mapRef.current) return
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}`
      const r = await fetch(url, { headers: { "Accept-Language": "en" } })
      const data = await r.json()
      if (Array.isArray(data) && data.length > 0) {
        const first = data[0]
        const lat = parseFloat(first.lat)
        const lon = parseFloat(first.lon)
        mapRef.current.setView([lat, lon], 18)
        // add temporary marker
        const L = LRef.current
        const t = L.marker([lat, lon], {
          opacity: 0.0 // invisible marker just to center; don't persist
        }).addTo(mapRef.current)
        setTimeout(() => {
          mapRef.current.removeLayer(t)
        }, 2000)
      }
    } catch (err) {
      console.warn("Geocode fail", err)
    }
  }

  // small toolbar for search and export
  return (
    <>
      <style>{`
        .cdp-map-shell { width:100%; height:100%; min-height:420px; border-radius:12px; overflow:hidden; }
        .cdp-search {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 650;
          display:flex;
          gap:8px;
          align-items:center;
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          border: 1px solid rgba(255,255,255,0.04);
          padding: 6px;
          border-radius: 10px;
          backdrop-filter: blur(6px);
        }
        .cdp-search input {
          background: transparent;
          border: none;
          outline: none;
          color: #e6eef8;
          width: 220px;
        }
        .cdp-controls {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 650;
        }
        .cdp-export-btn {
          background: linear-gradient(90deg,#2563eb,#7c3aed);
          color: white;
          padding: 8px 10px;
          border-radius: 10px;
          border: none;
          font-weight:600;
          cursor:pointer;
          box-shadow: 0 8px 24px rgba(37,99,235,0.12);
        }
      `}</style>

      <div className="relative cdp-map-shell">
        <div className="cdp-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{opacity:0.9}}>
            <path d="M21 21l-4.35-4.35" stroke="#e6eef8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="11" cy="11" r="6" stroke="#e6eef8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <input
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Search address or place"
            onKeyDown={(e) => {
              if (e.key === "Enter") doGeocode(searchValue)
            }}
          />
          <button
            onClick={() => doGeocode(searchValue)}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.04)",
              padding: "6px 8px",
              borderRadius: 8,
              color: "#e6eef8",
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>

        <div className="cdp-controls">
          <button
            className="cdp-export-btn"
            onClick={() => {
              if (!drawnRef.current) return
              try {
                const fc = drawnRef.current.toGeoJSON()
                const s = JSON.stringify(fc)
                const blob = new Blob([s], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url
                a.download = "plot.geojson"
                document.body.appendChild(a)
                a.click()
                a.remove()
                URL.revokeObjectURL(url)
              } catch (err) {
                console.warn("Export fail", err)
              }
            }}
          >
            Export Plot
          </button>
        </div>

        <div ref={mapContainer} style={{ width: "100%", height: "520px" }} />
      </div>
    </>
  )
}

export default CDPMap
