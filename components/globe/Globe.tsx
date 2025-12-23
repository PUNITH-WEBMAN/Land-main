"use client";
import { useEffect, useRef, useState } from "react";
import { Color, Scene, Fog, PerspectiveCamera, Vector3 } from "three";
import ThreeGlobe from "three-globe";
import { useThree, Object3DNode, Canvas, extend } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import countries from "./globe.json";

declare module "@react-three/fiber" {
  interface ThreeElements {
    threeGlobe: Object3DNode<ThreeGlobe, typeof ThreeGlobe>;
  }
}

extend({ ThreeGlobe });

const RING_PROPAGATION_SPEED = 3;
const aspect = 1.2;
const cameraZ = 300;

type Position = {
  order: number;
  startLat: number | string;
  startLng: number | string;
  endLat: number | string;
  endLng: number | string;
  arcAlt: number | string;
  color: string;
};

export type GlobeConfig = {
  pointSize?: number;
  globeColor?: string;
  showAtmosphere?: boolean;
  atmosphereColor?: string;
  atmosphereAltitude?: number;
  emissive?: string;
  emissiveIntensity?: number;
  shininess?: number;
  polygonColor?: string;
  ambientLight?: string;
  directionalLeftLight?: string;
  directionalTopLight?: string;
  pointLight?: string;
  arcTime?: number;
  arcLength?: number;
  rings?: number;
  maxRings?: number;
  initialPosition?: {
    lat: number;
    lng: number;
  };
  autoRotate?: boolean;
  autoRotateSpeed?: number;
};

interface WorldProps {
  globeConfig: GlobeConfig;
  data: Position[];
}

let numbersOfRings = [0];

export function Globe({ globeConfig = {}, data }: WorldProps) {
  const [globeData, setGlobeData] = useState<any[] | null>(null);
  const globeRef = useRef<any>(null);

  const defaultProps = {
    pointSize: 1,
    atmosphereColor: "#ffffff",
    showAtmosphere: true,
    atmosphereAltitude: 0.1,
    polygonColor: "rgba(255,255,255,0.7)",
    globeColor: "#1d072e",
    emissive: "#000000",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    arcTime: 2000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    ...globeConfig,
  } as Required<GlobeConfig & { pointSize: number; arcTime: number; arcLength: number; rings: number; maxRings: number }>;

  const _buildMaterial = () => {
    if (!globeRef.current) return;
    try {
      const globeMaterial = globeRef.current.globeMaterial() as any;
      globeMaterial.color = new Color(defaultProps.globeColor);
      globeMaterial.emissive = new Color(defaultProps.emissive);
      globeMaterial.emissiveIntensity = defaultProps.emissiveIntensity;
      globeMaterial.shininess = defaultProps.shininess;
    } catch (e) {}
  };

  const _buildData = () => {
    const arcs = data || [];
    const points: any[] = [];

    for (let i = 0; i < arcs.length; i++) {
      const arc = arcs[i];
      const startLat = Number(arc.startLat);
      const startLng = Number(arc.startLng);
      const endLat = Number(arc.endLat);
      const endLng = Number(arc.endLng);
      if (!isFinite(startLat) || !isFinite(startLng) || !isFinite(endLat) || !isFinite(endLng)) continue;
      const rgb = hexToRgb(arc.color) || { r: 255, g: 255, b: 255 };
      points.push({ size: defaultProps.pointSize, order: Number(arc.order) || 0, color: (t: number) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${1 - t})`, lat: startLat, lng: startLng });
      points.push({ size: defaultProps.pointSize, order: Number(arc.order) || 0, color: (t: number) => `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${1 - t})`, lat: endLat, lng: endLng });
    }

    const filteredPoints = points.filter((v, i, a) => a.findIndex(v2 => v2.lat === v.lat && v2.lng === v.lng) === i);
    setGlobeData(filteredPoints);
  };

  const sanitizeArcs = (arcs: Position[]) => (arcs || []).map(d => ({ ...d, startLat: Number(d.startLat), startLng: Number(d.startLng), endLat: Number(d.endLat), endLng: Number(d.endLng), arcAlt: Number(d.arcAlt) || 0, order: Number(d.order) || 0 })).filter(d => isFinite(d.startLat) && isFinite(d.startLng) && isFinite(d.endLat) && isFinite(d.endLng));

  useEffect(() => { _buildData(); _buildMaterial(); }, [data, JSON.stringify(globeConfig)]);

  useEffect(() => {
    if (globeRef.current && globeData) {
      globeRef.current.hexPolygonsData(countries.features || [])
        .hexPolygonResolution(3)
        .hexPolygonMargin(0.7)
        .showAtmosphere(defaultProps.showAtmosphere)
        .atmosphereColor(defaultProps.atmosphereColor)
        .atmosphereAltitude(defaultProps.atmosphereAltitude)
        .hexPolygonColor(() => defaultProps.polygonColor);
      startAnimation();
    }
  }, [globeData]);

  const startAnimation = () => {
    if (!globeRef.current || !globeData) return;
    const sanitized = sanitizeArcs(data);

    globeRef.current.arcsData(sanitized)
      .arcStartLat((d: any) => d.startLat)
      .arcStartLng((d: any) => d.startLng)
      .arcEndLat((d: any) => d.endLat)
      .arcEndLng((d: any) => d.endLng)
      .arcColor((d: any) => d.color || "#ffffff")
      .arcAltitude((d: any) => d.arcAlt || 0)
      .arcStroke(() => [0.32, 0.28, 0.3][Math.round(Math.random() * 2)])
      .arcDashLength(defaultProps.arcLength)
      .arcDashInitialGap((d: any) => Number(d.order) * 1)
      .arcDashGap(15)
      .arcDashAnimateTime(() => defaultProps.arcTime);

    // Remove dark blue point circles; keep only light blue shockwave (rings)
    globeRef.current.pointsData([]);

    globeRef.current.ringsData([])
      .ringColor(() => (t: number) => `rgba(0,180,255,${1 - t})`)
      .ringMaxRadius(defaultProps.maxRings)
      .ringPropagationSpeed(RING_PROPAGATION_SPEED)
      .ringRepeatPeriod((defaultProps.arcTime * defaultProps.arcLength) / defaultProps.rings);
  };

  useEffect(() => {
    if (!globeRef.current || !globeData) return;
    const interval = setInterval(() => {
      if (!globeRef.current || !globeData) return;
      numbersOfRings = genRandomNumbers(0, globeData.length, Math.floor((globeData.length * 4) / 5));
      globeRef.current.ringsData(globeData.filter((d: any, i: number) => numbersOfRings.includes(i)));
    }, 2000);
    return () => clearInterval(interval);
  }, [globeRef.current, globeData]);

  return <threeGlobe ref={globeRef} />;
}

export function WebGLRendererConfig() {
  const { gl, size } = useThree();
  useEffect(() => { gl.setPixelRatio(window.devicePixelRatio); gl.setSize(size.width, size.height); gl.setClearColor(0xffaaff, 0); }, [gl, size]);
  return null;
}

export function World(props: WorldProps) {
  const { globeConfig } = props;
  const scene = new Scene();
  scene.fog = new Fog(0xffffff, 400, 2000);
  return (
    <Canvas scene={scene} camera={new PerspectiveCamera(50, aspect, 180, 1800)}>
      <WebGLRendererConfig />
      <ambientLight color={globeConfig.ambientLight} intensity={0.6} />
      <directionalLight color={globeConfig.directionalLeftLight} position={new Vector3(-400, 100, 400)} />
      <directionalLight color={globeConfig.directionalTopLight} position={new Vector3(-200, 500, 200)} />
      <pointLight color={globeConfig.pointLight} position={new Vector3(-200, 500, 200)} intensity={0.8} />
      <Globe {...props} />
      <OrbitControls enablePan={false} enableZoom={false} minDistance={cameraZ} maxDistance={cameraZ} autoRotateSpeed={1} autoRotate={true} minPolarAngle={Math.PI / 3.5} maxPolarAngle={Math.PI - Math.PI / 3} />
    </Canvas>
  );
}

export function hexToRgb(hex: string) {
  if (!hex) return null;
  var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : null;
}

export function genRandomNumbers(min: number, max: number, count: number) {
  const arr: number[] = [];
  while (arr.length < count && max > min) { const r = Math.floor(Math.random() * (max - min)) + min; if (!arr.includes(r)) arr.push(r); }
  return arr;
}
