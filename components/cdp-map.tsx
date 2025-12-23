"use client";

import { Card } from "@/components/ui/card";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pentagon, Eraser, Pencil, Search, MapPin } from "lucide-react";
import JSZip from "jszip";
import { kml } from "@tmcw/togeojson";
import MagicButton from "./ui/MagicButton"
import { Spotlight } from "./ui/Spotlight";



interface CDPMapProps {
  onPlotDataChange: (data: any) => void;
  initialLat?: number;
  initialLng?: number;
  initialZoom?: number;
}

export function CDPMap({
  onPlotDataChange,
  initialLat,
  initialLng,
  initialZoom,
}: CDPMapProps) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [drawingMode, setDrawingMode] = useState<"freehand" | "polygon" | null>(
    null
  );
  const [drawnLayer, setDrawnLayer] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showKMZ, setShowKMZ] = useState(true);
  const kmlLayersRef = useRef<any[]>([]);

  const [selectedZone, setSelectedZone] = useState("commercial");
  const [roadWidth, setRoadWidth] = useState("30");
  const [siteArea, setSiteArea] = useState("");
  const [plotWidth, setPlotWidth] = useState("");
  const [plotDepth, setPlotDepth] = useState("");
  const [floorHeights, setFloorHeights] = useState({
    h1: "3.0",
    h2: "3.3",
    h3: "3.5",
    h4: "3.75",
    h5: "3.8",
  });

  const haversineDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const calculateGeodesicArea = (latlngs: any[]) => {
    if (latlngs.length < 3) return 0;

    let area = 0;
    const numPoints = latlngs.length;

    for (let i = 0; i < numPoints; i++) {
      const j = (i + 1) % numPoints;
      const xi = latlngs[i].lng;
      const yi = latlngs[i].lat;
      const xj = latlngs[j].lng;
      const yj = latlngs[j].lat;

      area += xi * yj - xj * yi;
    }

    area = Math.abs(area / 2);

    // Convert from degrees² to square meters using approximate conversion at this latitude
    // At Bangalore latitude (~13°), 1 degree ≈ 111 km
    const metersPerDegree = 111000;
    return area * metersPerDegree * metersPerDegree;
  };

  useEffect(() => {
    if (typeof window === "undefined" || isMapReady) return;

    const initMap = async () => {
      const loadLeaflet = () => {
        return new Promise<void>((resolve) => {
          if ((window as any).L) {
            resolve();
            return;
          }

          // Load CSS
          const cssLink = document.createElement("link");
          cssLink.rel = "stylesheet";
          cssLink.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(cssLink);

          // Load JS
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          document.head.appendChild(script);
        });
      };

      await loadLeaflet();
      const L = (window as any).L;

      // Fix default marker icon
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!mapContainerRef.current) return;

      const centerLat = initialLat !== undefined ? initialLat : 12.9716;
      const centerLng = initialLng !== undefined ? initialLng : 77.5946;
      const zoomLevel = initialZoom !== undefined ? initialZoom : 13;

      console.log(
        "Initializing map at:",
        centerLat,
        centerLng,
        "zoom:",
        zoomLevel
      );
      const map = L.map(mapContainerRef.current).setView(
        [centerLat, centerLng],
        zoomLevel
      );

      // Define base layers
      const baseLayers: Record<string, any> = {
        "Street (OSM)": L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
          }
        ),
        "Satellite (Esri)": L.tileLayer(
          "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          {
            attribution: "© Esri",
            maxZoom: 19,
          }
        ),
        "Topo (OpenTopoMap)": L.tileLayer(
          "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
          {
            attribution: "© OpenTopoMap",
            maxZoom: 19,
          }
        ),
        "Humanitarian (OSM HOT)": L.tileLayer(
          "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
          {
            attribution: "© OpenStreetMap HOT",
            maxZoom: 19,
          }
        ),
      };

      baseLayers["Street (OSM)"].addTo(map);
      L.control.layers(baseLayers, {}, { position: "topright" }).addTo(map);

      mapRef.current = map;

      // Force re-center after a brief delay to ensure map is fully rendered
      setTimeout(() => {
        map.setView([centerLat, centerLng], zoomLevel);
        console.log("Re-centered map after load");
        setIsMapReady(true);
      }, 500);

      // KMZ overlay is managed by the showKMZ effect below
    };

    initMap();
  }, []);

  // Load KMZ when map first becomes ready
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;
    const L = (window as any).L;
    if (L && kmlLayersRef.current.length === 0) {
      loadKMZOverlay(map, L);
    }
  }, [isMapReady]);

  // Toggle KMZ overlay when checkbox changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isMapReady) return;
    if (showKMZ) {
      kmlLayersRef.current.forEach((layer: any) => {
        try {
          layer.addTo(map);
        } catch {}
      });
    } else {
      kmlLayersRef.current.forEach((layer: any) => {
        try {
          map.removeLayer(layer);
        } catch {}
      });
    }
  }, [showKMZ, isMapReady]);

  // Load KMZ overlay on map
  const loadKMZOverlay = async (map: any, L: any) => {
    try {
      const response = await fetch("/18623.KMZ");
      if (!response.ok) {
        console.warn("Failed to fetch KMZ");
        return;
      }

      const arrayBuffer = await response.arrayBuffer();

      // Extract KML from KMZ
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(arrayBuffer);

      let kmlString = null;
      for (const [filename, file] of Object.entries(loadedZip.files)) {
        if (filename.toLowerCase().endsWith(".kml") && !(file as any).dir) {
          kmlString = await (file as any).async("text");
          break;
        }
      }

      if (!kmlString) {
        console.warn("No KML found in KMZ");
        return;
      }

      // Parse KML to GeoJSON
      const parser = new DOMParser();
      const kmlDoc = parser.parseFromString(kmlString, "text/xml");
      const geojson = kml(kmlDoc);

      console.log("KMZ loaded with", geojson.features.length, "features");

      // Clear any existing KMZ layers before adding new ones
      kmlLayersRef.current.forEach((layer: any) => {
        try {
          map.removeLayer(layer);
        } catch {}
      });
      kmlLayersRef.current = [];

      // Display survey number points
      geojson.features.forEach((feature: any, index: number) => {
        if (feature.geometry?.type === "Point") {
          const coords = feature.geometry.coordinates;
          const lat = coords[1];
          const lng = coords[0];
          const name =
            feature.properties?.Name ||
            feature.properties?.name ||
            `Point ${index + 1}`;

          const customIcon = L.divIcon({
            html: `<div style="color: black; font-weight: bold; font-size: 14px; cursor: pointer; text-shadow: -1px -1px 0 white, 1px -1px 0 white, -1px 1px 0 white, 1px 1px 0 white, -2px 0 0 white, 2px 0 0 white, 0 -2px 0 white, 0 2px 0 white;">${name}</div>`,
            iconSize: null,
            iconAnchor: [10, 10],
            popupAnchor: [0, -10],
            className: "no-bg-marker",
          });

          const marker = L.marker([lat, lng], { icon: customIcon });
          marker.bindPopup(
            `<strong>Survey ${name}</strong><br/>Lat: ${lat.toFixed(
              6
            )}<br/>Lng: ${lng.toFixed(6)}`
          );
          marker.addTo(map);
          kmlLayersRef.current.push(marker);
        }
      });

      // Display lines/polygons with color support
      geojson.features.forEach((feature: any) => {
        if (
          feature.geometry?.type === "LineString" ||
          feature.geometry?.type === "Polygon"
        ) {
          // Check if feature has color properties from KML
          const strokeColor =
            feature.properties?.stroke ||
            feature.properties?.color ||
            "#dc2626";
          const fillColor = feature.properties?.fill || strokeColor;
          const fillOpacity =
            feature.properties?.["fill-opacity"] !== undefined
              ? feature.properties?.["fill-opacity"]
              : 0.3;
          const strokeOpacity =
            feature.properties?.["stroke-opacity"] !== undefined
              ? feature.properties?.["stroke-opacity"]
              : 1;
          const strokeWidth =
            feature.properties?.["stroke-width"] ||
            feature.properties?.weight ||
            3;

          // For LineStrings, use dashed red lines; for Polygons, use colors from KML
          const isLineString = feature.geometry?.type === "LineString";
          const style = isLineString
            ? {
                color: "#dc2626",
                weight: 3,
                opacity: 1,
                fill: false,
                dashArray: "5, 5",
              }
            : {
                color: strokeColor,
                weight: strokeWidth,
                opacity: strokeOpacity,
                fill: true,
                fillColor: fillColor,
                fillOpacity: fillOpacity,
              };

          const layer = L.geoJSON(feature, { style });
          layer.addTo(map);
          // Bring to front
          if (layer.bringToFront) layer.bringToFront();
          kmlLayersRef.current.push(layer);
        }
      });

      console.log("KMZ overlay loaded successfully");
    } catch (err) {
      console.warn("Could not load KMZ overlay", err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery || !mapRef.current) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        mapRef.current.setView(
          [Number.parseFloat(lat), Number.parseFloat(lon)],
          16
        );
      } else {
        alert("Location not found");
      }
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  const startDrawing = async (mode: "freehand" | "polygon") => {
    if (!mapRef.current) return;

    const L = (window as any).L;

    mapRef.current.dragging.disable();
    mapRef.current.doubleClickZoom.disable();
    mapRef.current.scrollWheelZoom.disable();

    setDrawingMode(mode);

    if (drawnLayer) {
      mapRef.current.removeLayer(drawnLayer);
    }

    if (mode === "freehand") {
      const freehandPolygon: any[] = [];
      let isDrawing = false;
      let previewLine: any = null;

      const onMouseDown = () => {
        isDrawing = true;
        freehandPolygon.length = 0;
        // Create preview polyline
        previewLine = L.polyline([], {
          color: "#2563eb",
          weight: 2,
          opacity: 0.7,
        });
        previewLine.addTo(mapRef.current);
      };

      const onMouseMove = (e: any) => {
        if (isDrawing) {
          freehandPolygon.push([e.latlng.lat, e.latlng.lng]);
          // Update preview line in real-time
          if (previewLine) {
            previewLine.setLatLngs(freehandPolygon);
          }
        }
      };

      const onMouseUp = () => {
        if (isDrawing && freehandPolygon.length > 2) {
          isDrawing = false;
          // Remove preview line
          if (previewLine) {
            mapRef.current.removeLayer(previewLine);
            previewLine = null;
          }
          const polygon = L.polygon(freehandPolygon, {
            color: "#2563eb",
            fillOpacity: 0.2,
          });
          polygon.addTo(mapRef.current);
          setDrawnLayer(polygon);
          calculateArea(polygon);
          mapRef.current.dragging.enable();
          mapRef.current.doubleClickZoom.enable();
          mapRef.current.scrollWheelZoom.enable();
          setDrawingMode(null);
          mapRef.current.off("mousedown", onMouseDown);
          mapRef.current.off("mousemove", onMouseMove);
          mapRef.current.off("mouseup", onMouseUp);
        }
      };

      mapRef.current.on("mousedown", onMouseDown);
      mapRef.current.on("mousemove", onMouseMove);
      mapRef.current.on("mouseup", onMouseUp);
    } else if (mode === "polygon") {
      const polygonPoints: any[] = [];
      let previewLine: any = null;
      let previewMarkers: any[] = [];

      const onClick = (e: any) => {
        polygonPoints.push([e.latlng.lat, e.latlng.lng]);
        // Add preview marker
        const marker = L.circleMarker([e.latlng.lat, e.latlng.lng], {
          radius: 4,
          color: "#2563eb",
          fillOpacity: 0.8,
        });
        marker.addTo(mapRef.current);
        previewMarkers.push(marker);
        // Update preview line
        if (previewLine) {
          mapRef.current.removeLayer(previewLine);
        }
        previewLine = L.polyline(polygonPoints, {
          color: "#2563eb",
          weight: 2,
          opacity: 0.7,
        });
        previewLine.addTo(mapRef.current);
      };

      const onDblClick = (e: any) => {
        e.originalEvent.preventDefault();
        if (polygonPoints.length > 2) {
          // Remove preview line and markers
          if (previewLine) {
            mapRef.current.removeLayer(previewLine);
          }
          previewMarkers.forEach((m) => mapRef.current.removeLayer(m));
          const polygon = L.polygon(polygonPoints, {
            color: "#2563eb",
            fillOpacity: 0.2,
          });
          polygon.addTo(mapRef.current);
          setDrawnLayer(polygon);
          calculateArea(polygon);
          mapRef.current.dragging.enable();
          mapRef.current.doubleClickZoom.enable();
          mapRef.current.scrollWheelZoom.enable();
          setDrawingMode(null);
          mapRef.current.off("click", onClick);
          mapRef.current.off("dblclick", onDblClick);
        }
      };

      mapRef.current.on("click", onClick);
      mapRef.current.on("dblclick", onDblClick);
    }
  };

  const calculateArea = (layer: any) => {
    if (!layer) return;

    const latlngs = layer.getLatLngs()[0];
    const area = calculateGeodesicArea(latlngs);
    setSiteArea(area.toFixed(2));
  };

  const clearDrawing = () => {
    const map = mapRef.current;
    if (!map) return;

    // Remove the drawn polygon
    if (drawnLayer) {
      try {
        map.removeLayer(drawnLayer);
      } catch {}
      setDrawnLayer(null);
    }

    // Remove any preview lines/markers that might be lingering
    // This is a workaround for preview elements not being tracked
    map.eachLayer((layer: any) => {
      // Remove polylines and circle markers that are blue (preview elements)
      if (layer instanceof (window as any).L.Polyline && !layer._popup) {
        if (
          layer.options.color === "#2563eb" &&
          !drawnLayer?.contains?.(layer)
        ) {
          try {
            map.removeLayer(layer);
          } catch {}
        }
      }
      if (layer instanceof (window as any).L.CircleMarker) {
        if (layer.options.color === "#2563eb") {
          try {
            map.removeLayer(layer);
          } catch {}
        }
      }
    });

    // Re-enable map interactions
    map.dragging.enable();
    map.doubleClickZoom.enable();
    map.scrollWheelZoom.enable();

    setDrawingMode(null);
    setSiteArea("");
    onPlotDataChange(null);
  };

  const handleCalculate = () => {
    if (!siteArea || !plotWidth || !plotDepth) {
      alert("Please draw a plot and enter plot dimensions");
      return;
    }

    const data = {
      zoneType: selectedZone,
      roadWidth: Number.parseInt(roadWidth),
      siteArea: Number.parseFloat(siteArea),
      plotWidth: Number.parseFloat(plotWidth),
      plotDepth: Number.parseFloat(plotDepth),
      floorHeights: [
        Number.parseFloat(floorHeights.h1),
        Number.parseFloat(floorHeights.h2),
        Number.parseFloat(floorHeights.h3),
        Number.parseFloat(floorHeights.h4),
        Number.parseFloat(floorHeights.h5),
      ].filter((h) => h > 0),
    };

    onPlotDataChange(data);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search for address, area, or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="pl-10"
          />
        </div>

        {/* Magic Search Button */}
        <MagicButton
          title="Search"
          icon={<Search className="w-4 h-4" />}
          onClick={handleSearch}
          position="left" // or "right" depending on icon placement
          className="px-4 py-2 rounded-full"
        />
      </div>

      {/* Drawing Tools */}
      <div className="flex flex-wrap gap-2 mt-2">
        <MagicButton
          title="Freehand Draw"
          icon={<Pencil className="w-4 h-4" />}
          onClick={() => startDrawing("freehand")}
          className={`px-4 py-2 rounded-full ${
            drawingMode === "freehand"
              ? "bg-blue-600 text-white"
              : "bg-white/5 text-blue-600"
          } `}
        />

        <MagicButton
          title="Polygon (Click)"
          icon={<Pentagon className="w-4 h-4" />}
          onClick={() => startDrawing("polygon")}
          className={`px-4 py-2 rounded-full ${
            drawingMode === "polygon"
              ? "bg-blue-600 text-white"
              : "bg-white/5 text-blue-600"
          } `}
        />

        <MagicButton
          title="Clear"
          icon={<Eraser className="w-4 h-4" />}
          onClick={clearDrawing}
          className="px-4 py-2 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20"
        />
      </div>

      {/* Generate Button */}
      <MagicButton
        title="Generate All Feasible Options"
        onClick={handleCalculate}
        className="w-full mt-4 px-6 py-3 rounded-full bg-blue-600 text-white hover:bg-blue-700"
        icon={null} // optional if you want icon
      />

      {/* Drawing Tools */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={drawingMode === "freehand" ? "default" : "outline"}
          className={`gap-2 ${
            drawingMode === "freehand"
              ? "bg-blue-600"
              : "border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white"
          } btn-outline-animate`}
          onClick={() => startDrawing("freehand")}
          disabled={drawingMode !== null && drawingMode !== "freehand"}
        >
          <Pencil className="w-4 h-4" />
          Freehand Draw
        </Button>
        <Button
          size="sm"
          variant={drawingMode === "polygon" ? "default" : "outline"}
          className={`gap-2 ${
            drawingMode === "polygon"
              ? "bg-blue-600"
              : "border-blue-500 text-blue-600 hover:bg-blue-600 hover:text-white"
          } btn-outline-animate`}
          onClick={() => startDrawing("polygon")}
          disabled={drawingMode !== null && drawingMode !== "polygon"}
        >
          <Pentagon className="w-4 h-4" />
          Polygon (Click)
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 border-red-500 text-red-600 hover:bg-red-600 hover:text-white btn-outline-animate bg-transparent"
          onClick={clearDrawing}
        >
          <Eraser className="w-4 h-4" />
          Clear
        </Button>
      </div>

      {/* Drawing Instruction */}
      {drawingMode && (
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          {drawingMode === "freehand" &&
            "🖱️ Click and drag to draw freehand (map is locked while drawing)"}
          {drawingMode === "polygon" &&
            "🖱️ Click to add points, double-click to finish (map is locked while drawing)"}
        </div>
      )}

      {/* Map Container */}
      <div className="flex items-center gap-3 mb-2">
        <label className="text-sm">
          <input
            type="checkbox"
            checked={showKMZ}
            onChange={() => setShowKMZ((v) => !v)}
            className="mr-2"
          />
          Show KMZ overlay (legends)
        </label>
      </div>
      <div
        ref={mapContainerRef}
        className="w-full h-[500px] rounded-lg border-2 border-blue-200 shadow-lg"
      />

      {/* Input Fields */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-3">
          Site Details & Parameters
        </h3>

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <Label className="text-sm font-semibold text-blue-900">
              Zone Type
            </Label>
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="commercial">Commercial Business</SelectItem>
                <SelectItem value="residential_main">
                  Residential Main
                </SelectItem>
                <SelectItem value="residential_mixed">
                  Residential Mixed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold text-blue-900">
              Road Width (m)
            </Label>
            <Select value={roadWidth} onValueChange={setRoadWidth}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">Up to 12 m</SelectItem>
                <SelectItem value="18">Above 12 m - 18 m</SelectItem>
                <SelectItem value="24">Above 18 m - 24 m</SelectItem>
                <SelectItem value="30">Above 24 m - 30 m</SelectItem>
                <SelectItem value="40">Above 30 m</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-semibold text-blue-900">
              Site Area (sq m)
            </Label>
            <Input
              type="number"
              value={siteArea}
              onChange={(e) => setSiteArea(e.target.value)}
              placeholder="Draw or enter manually"
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <Label className="text-sm font-semibold text-blue-900">
              Plot Width (m)
            </Label>
            <Input
              type="number"
              value={plotWidth}
              onChange={(e) => setPlotWidth(e.target.value)}
              placeholder="e.g., 50"
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm font-semibold text-blue-900">
              Plot Depth (m)
            </Label>
            <Input
              type="number"
              value={plotDepth}
              onChange={(e) => setPlotDepth(e.target.value)}
              placeholder="e.g., 100"
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label className="text-sm font-semibold text-blue-900 mb-2 block">
            Floor Height Options (m) - up to 5 options
          </Label>
          <div className="grid grid-cols-5 gap-2">
            {Object.keys(floorHeights).map((key, idx) => (
              <Input
                key={key}
                type="number"
                step="0.01"
                value={floorHeights[key as keyof typeof floorHeights]}
                onChange={(e) =>
                  setFloorHeights({ ...floorHeights, [key]: e.target.value })
                }
                placeholder={`H${idx + 1}`}
                className="text-center"
              />
            ))}
          </div>
        </div>

        <Button
          onClick={handleCalculate}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700 btn-animate"
        >
          Generate All Feasible Options
        </Button>
      </Card>
    </div>
  );
}
