// Pure TypeScript zoning & setback engine — exact logic ported from your HTML/JS

export type ZoneKey =
  | 'residential_main'
  | 'residential_mixed'
  | 'commercial_central'
  | 'commercial_business'
  | 'mutation_corridor'
  | 'commercial_axes'
  | 'industrial_general'
  | 'industrial_hitech'
  | 'ps_p'
  | 'traffic_transport'
  | 'public_utilities'
  | 'park_open'
  | 'agricultural'
  | 'unclassified'
  | '';

export interface ZonalInput {
  zone: string;         // eg 'residential_main' or 'commercial'
  areaSqm: number;      // site / plot area in sq.m
  frontageM: number;    // plot frontage (m)
  roadWidthM: number;   // selected road width (m)
  buildingHeightM?: number; // proposed building height (m)
}

export interface ZonalOutput {
  baseFAR: number;
  coveragePercent: number;
  premiumFAR: number;
  totalFAR: number;
  restrictionNote: string | null;
  setbacks: {
    front: string;
    rear: string;
    side: string;
    ruleUsed: string;
  };
}

const RMP_ZONES: Record<string, string> = {
  residential_main: 'res_main',
  residential_mixed: 'res_mixed',
  commercial_central: 'comm_central',
  commercial_business: 'comm_business',
  mutation_corridor: 'mutation',
  commercial_axes: 'comm_axes',
  industrial_general: 'ind_gen',
  industrial_hitech: 'ind_hitech',
  ps_p: 'psp',
  traffic_transport: 'tt',
  public_utilities: 'pu',
  park_open: 'park',
  agricultural: 'ag',
  unclassified: 'uc',
  commercial: 'comm_business', // convenience mapping
};

export function calculateZonalRegulations(input: ZonalInput): ZonalOutput {
  const area = Number(input.areaSqm) || 0;
  const frontage = Number(input.frontageM) || 0;
  const road = Number(input.roadWidthM) || 0;
  const height = Number(input.buildingHeightM) || 0;
  const logicType = input.zone ? (RMP_ZONES[input.zone] || input.zone) : '';
  const depth = frontage > 0 ? area / frontage : 0;

  let far = 0;
  let cov = 0;
  let premium = 0;
  let noteRestriction: string | null = null;

  if (area > 0 && logicType) {
    // --- 4.1 RESIDENTIAL (MAIN) ---
    if (logicType === 'res_main') {
      let roadFAR = 0;
      if (road <= 12.0) roadFAR = 1.75;
      else if (road <= 18.0) roadFAR = 2.25;
      else if (road <= 24.0) roadFAR = 2.50;
      else if (road <= 30.0) roadFAR = 3.00;
      else roadFAR = 3.25;

      let plotFAR = 0;
      if (area <= 360) { plotFAR = 1.75; cov = 75; }
      else if (area <= 1000) { plotFAR = 2.25; cov = 65; }
      else if (area <= 2000) { plotFAR = 2.50; cov = 60; }
      else if (area <= 4000) { plotFAR = 3.00; cov = 55; }
      else { plotFAR = 3.25; cov = 50; }

      far = Math.min(roadFAR, plotFAR);

      if (road < 9.0) noteRestriction = 'Road < 9m: Max Height 11.5m. No Apartments.';
    }

    // --- 4.2 RESIDENTIAL MIXED ---
    else if (logicType === 'res_mixed') {
      if (road <= 12) { far = 1.75; cov = 70; }
      else if (road <= 18) { far = 2.25; cov = 65; }
      else if (road <= 24) { far = 2.50; cov = 60; }
      else if (road <= 30) { far = 3.00; cov = 55; }
      else { far = 3.25; cov = 50; }
    }

    // --- 4.3 COMMERCIAL CENTRAL ---
    else if (logicType === 'comm_central') {
      far = 2.50; cov = 75;
      if (road > 18) far = 3.00;
    }

    // --- 4.4 COMMERCIAL BUSINESS ---
    else if (logicType === 'comm_business') {
      if (road <= 12) { far = 1.75; cov = 50; }
      else if (road <= 18) { far = 2.25; cov = 50; }
      else if (road <= 24) { far = 2.50; cov = 45; }
      else if (road <= 30) { far = 3.00; cov = 40; }
      else { far = 3.25; cov = 40; }
    }

    // --- 4.5 MUTATION CORRIDOR ---
    else if (logicType === 'mutation') {
      if (area < 10000) { far = 2.75; cov = 55; }
      else { far = 3.25; cov = 50; }
    }

    // --- 4.7 INDUSTRIAL GENERAL ---
    else if (logicType === 'ind_gen') {
      if (area <= 500) { far = 1.5; cov = 75; }
      else if (area <= 1000) { far = 1.25; cov = 60; }
      else if (area <= 3000) { far = 1.00; cov = 50; }
      else { far = 1.00; cov = 45; }
    }

    // --- 4.8 INDUSTRIAL HI-TECH ---
    else if (logicType === 'ind_hitech') {
      if (area <= 1000) { far = 2.0; cov = 55; }
      else if (area <= 2000) { far = 2.25; cov = 50; }
      else if (area <= 4000) { far = 2.50; cov = 50; }
      else if (area <= 6000) { far = 3.00; cov = 45; }
      else { far = 3.25; cov = 45; }
    }

    // --- 4.9 PUBLIC & SEMI-PUBLIC ---
    else if (logicType === 'psp') {
      if (area <= 500) { far = 1.5; cov = 60; }
      else if (area <= 1000) { far = 1.75; cov = 55; }
      else if (area <= 2000) { far = 2.00; cov = 50; }
      else { far = 2.25; cov = 45; }
    }

    // --- 4.10 TRAFFIC & TRANSPORT ---
    else if (logicType === 'tt') {
      if (area <= 500) { far = 1.00; cov = 60; }
      else if (area <= 1000) { far = 1.25; cov = 55; }
      else { far = 1.50; cov = 50; }
    }

    // --- PARK / AG ---
    else if (logicType === 'park' || logicType === 'ag') {
      far = 0.5; cov = 5;
    }
  }

  // Premium FAR (Standard Table B)
  if (road > 9.0 && far > 0 && logicType !== 'ag' && logicType !== 'park') {
    if (road <= 12.0) premium = 0.20;
    else if (road <= 18.0) premium = 0.40;
    else premium = 0.60;
  }

  const totalFAR = Number((far + premium).toFixed(3));

  // ----- Setback Logic (2025 Draft) -----
  let sFront = 0;
  let sRear = 0;
  let sSideStr = '-';
  let rule = '-';

  if (area > 0 && depth > 0 && height > 0) {
    let useTable8 = false;
    if (area <= 150) {
      if (height <= 15.0) useTable8 = true;
    } else {
      if (height <= 12.0) useTable8 = true;
    }

    if (useTable8) {
      rule = 'Table 8 (2025 Draft): Area-based';
      if (area <= 60) {
        sFront = 0.75; sRear = 0; sSideStr = '0.60 m (one side)';
      } else if (area <= 150) {
        sFront = 0.90; sRear = 0.70; sSideStr = '0.70 m (one side)';
      } else if (area <= 4000) {
        sFront = (12 / 100) * depth; // 12% of depth
        sRear = (8 / 100) * depth;   // 8% of depth
        const sideVal = (8 / 100) * frontage;
        sSideStr = `${sideVal.toFixed(2)} m`;
      } else {
        sFront = 5.0; sRear = 5.0; sSideStr = '5.00 m (All sides)';
      }
    } else {
      rule = 'Table 9 (High Rise)';
      if (height <= 15) { sFront = 5.0; sRear = 5.0; sSideStr = '5.00 m'; }
      else if (height <= 18) { sFront = 6.0; sRear = 6.0; sSideStr = '6.00 m'; }
      else if (height <= 21) { sFront = 7.0; sRear = 7.0; sSideStr = '7.00 m'; }
      else if (height <= 24) { sFront = 8.0; sRear = 8.0; sSideStr = '8.00 m'; }
      else if (height <= 27) { sFront = 9.0; sRear = 9.0; sSideStr = '9.00 m'; }
      else if (height <= 30) { sFront = 10.0; sRear = 10.0; sSideStr = '10.00 m'; }
      else { sFront = 11.0; sRear = 11.0; sSideStr = '11.00 m'; }
    }
  }

  const setbacks = {
    front: sFront === 0 ? '-' : `${sFront.toFixed(2)} m`,
    rear: sRear === 0 ? '-' : `${sRear.toFixed(2)} m`,
    side: sSideStr,
    ruleUsed: rule,
  };

  return {
    baseFAR: Number(far.toFixed(3)),
    coveragePercent: cov,
    premiumFAR: Number(premium.toFixed(3)),
    totalFAR,
    restrictionNote: noteRestriction,
    setbacks,
  };
}
