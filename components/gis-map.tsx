"use client"

import { useEffect, useState, useRef } from "react"
import type { PropertyData } from "@/lib/mock-data"

interface GISMapProps {
  property: PropertyData
}

export function GISMap({ property }: GISMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstance) return

    const initMap = async () => {
      const L = await import("leaflet")

      // Import CSS via style injection
      const link = document.createElement("link")
      link.rel = "stylesheet"
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      document.head.appendChild(link)

      // Wait for CSS to load
      await new Promise((resolve) => setTimeout(resolve, 100))

      const map = L.map(mapRef.current!, {
        center: property.center,
        zoom: 15,
      })

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      // Add polygon for property boundary
      const polygonCoords = property.coordinates.map((coord) => [coord[0], coord[1]] as [number, number])
      const polygon = L.polygon(polygonCoords, {
        color: property.isDisputed ? "#dc2626" : "#138808",
        fillColor: property.isDisputed ? "#dc2626" : "#138808",
        fillOpacity: 0.35,
        weight: 3,
      }).addTo(map)

      // Add custom marker for property center
      const markerIcon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 48px;
            height: 48px;
            border-radius: 50%;
            background: ${property.isDisputed ? "#dc2626" : "#138808"};
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          ">
            ${
              property.isDisputed
                ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v4"/><path d="M12 17h.01"/><path d="m21 15-3.086 3.086a2 2 0 0 1-1.414.586H7.5a2 2 0 0 1-1.414-.586L3 15m0-6 3.086-3.086A2 2 0 0 1 7.5 5.328h9a2 2 0 0 1 1.414.586L21 9"/></svg>'
                : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>'
            }
          </div>
        `,
        iconSize: [48, 48],
        iconAnchor: [24, 24],
      })

      L.marker(property.center, { icon: markerIcon }).addTo(map)

      const landmarkIcons: Record<string, string> = {
        airport: "✈️",
        lake: "🏞️",
        hospital: "🏥",
        railway: "🚂",
        highway: "🛣️",
        school: "🏫",
        temple: "🛕",
        market: "🛒",
      }

      property.nearbyLandmarks.forEach((landmark, idx) => {
        const directions: Record<string, [number, number]> = {
          North: [0.009 * landmark.distance, 0],
          South: [-0.009 * landmark.distance, 0],
          East: [0, 0.011 * landmark.distance],
          West: [0, -0.011 * landmark.distance],
          "North-East": [0.006 * landmark.distance, 0.008 * landmark.distance],
          "North-West": [0.006 * landmark.distance, -0.008 * landmark.distance],
          "South-East": [-0.006 * landmark.distance, 0.008 * landmark.distance],
          "South-West": [-0.006 * landmark.distance, -0.008 * landmark.distance],
        }

        const offset = directions[landmark.direction] || [0.005 * (idx + 1), 0.005 * (idx + 1)]
        const pos: [number, number] = [property.center[0] + offset[0], property.center[1] + offset[1]]

        const landmarkMarker = L.divIcon({
          className: "landmark-marker",
          html: `
            <div style="
              background: white;
              border: 2px solid #1e40af;
              border-radius: 8px;
              padding: 4px 8px;
              font-size: 12px;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.15);
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <span>${landmarkIcons[landmark.type] || "📍"}</span>
              <span style="color: #1e40af; font-weight: 500;">${landmark.distance} km</span>
            </div>
          `,
          iconSize: [100, 30],
          iconAnchor: [50, 15],
        })

        L.marker(pos, { icon: landmarkMarker })
          .addTo(map)
          .bindPopup(`<b>${landmark.name}</b><br/>${landmark.distance} km ${landmark.direction}`)
      })

      L.polyline(
        [
          [property.center[0] - 0.003, property.center[1] - 0.005],
          [property.center[0] + 0.003, property.center[1] + 0.005],
        ],
        {
          color: "#6b7280",
          weight: 6,
          opacity: 0.7,
          dashArray: "10, 10",
        },
      )
        .addTo(map)
        .bindPopup(`Road Access: ${property.roadAccess}`)

      setMapInstance(map)

      setTimeout(() => {
        map.invalidateSize()
      }, 200)
    }

    initMap()

    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, [property])

  return (
    <div className="w-full h-full relative">
      <div ref={mapRef} className="w-full h-full rounded-lg" style={{ minHeight: "400px", height: "100%" }} />
      {!mapInstance && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
          <span className="text-muted-foreground">Loading map...</span>
        </div>
      )}
    </div>
  )
}
