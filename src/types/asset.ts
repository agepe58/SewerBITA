export type AssetType = 'manhole' | 'pipe' | 'pump_station' | 'valve' | 'wtp' | 'water_accessory';

export type SystemCategory = 'sewerage' | 'clean_water';

export type WaterAccessoryType = 'gate_valve' | 'air_valve' | 'dresser_joint' | 'check_valve' | 'tee_fitting' | 'reducer_joint';

export type AssetCondition = 'Good' | 'Fair' | 'Warning' | 'Critical';

export type AssetStatus = 'Active' | 'Under Maintenance' | 'Inactive' | 'Pending Inspection';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  elevation?: number;
}

export interface BaseAsset {
  id: string;
  assetCode: string;
  name: string;
  type: AssetType;
  area: string;
  systemCategory?: SystemCategory; // 'sewerage' (Air Limbah) vs 'clean_water' (Air Bersih PAM)
  status: AssetStatus;
  condition: AssetCondition;
  installationYear: number;
  lastInspectedAt: string;
  nextInspectionDue: string;
  latitude?: number;
  longitude?: number;
  qrCodeUrl?: string;
  photos: string[];
}

export interface ManholeAsset extends BaseAsset {
  type: 'manhole';
  coordinates: LocationCoordinates;
  depthMeters: number;
  diameterMm: number;
  material: string; // e.g. Precast Concrete, HDPE, Brick
  coverCondition: string;
  sequenceNumber?: number; // Dynamic topological flow sequence (#1, #2, #3...)
  parentLineCode?: string; // e.g. "Line Sudirman-A"
}

export interface PumpStationAsset extends BaseAsset {
  type: 'pump_station';
  coordinates: LocationCoordinates;
  capacityLps: number; // Liters per second
  pumpCount: number;
  activePumps: number;
  powerSource: string;
  systemCategory?: SystemCategory;
}

export interface PipeAsset extends BaseAsset {
  type: 'pipe';
  fromAssetId: string;
  toAssetId: string;
  diameterMm: number;
  material: string; // e.g. PVC, HDPE, Ductile Iron, Steel
  lengthMeters: number;
  flowDirection: 'downstream' | 'upstream' | 'bi-directional';
  slopePercent?: number;
  depthStartMeters?: number;
  depthEndMeters?: number;
  // Transmission & Clean Water Pipe specific fields
  pipeCategory?: 'gravity' | 'transmission' | 'clean_water_distribution';
  waypoints?: LocationCoordinates[]; // Array of intermediate curve coordinates (lat/lng)
  pressureBar?: number; // Working pressure rating in bar (e.g. 6.0 bar, 10.0 bar)
  destinationWwtpName?: string; // Target WWTP / IPAL or WTP plant name
}

export interface WtpAsset extends BaseAsset {
  type: 'wtp';
  coordinates: LocationCoordinates;
  productionCapacityLps: number; // e.g. 500 L/s
  rawWaterSource: string; // e.g. Sungai Citarum / Waduk Jatiluhur
  waterQualityStatus: string; // e.g. Safe - Permenkes 2023
  reservoirCapacityM3?: number; // m3 storage
}

export interface WaterAccessoryAsset extends BaseAsset {
  type: 'water_accessory';
  coordinates: LocationCoordinates;
  accessoryType: WaterAccessoryType;
  systemCategory?: SystemCategory; // 'sewerage' (Air Limbah) vs 'clean_water' (Air Bersih)
  pipeId?: string;
  diameterMm: number;
  pressureBar?: number;
  elevationMeters?: number;
  operatingStatus: 'Normal Open' | 'Normal Closed' | 'Active' | 'Under Maintenance';
}

export type SewerAsset = ManholeAsset | PumpStationAsset | PipeAsset | WtpAsset | WaterAccessoryAsset;

export interface AssetSummaryStats {
  totalManholes: number;
  totalPipes: number;
  totalPumpStations: number;
  totalActive: number;
  needingInspection: number;
  criticalIssues: number;
  overdueInspection: number;
  totalLengthKm: number;
}
