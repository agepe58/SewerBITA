export type AssetType = 'manhole' | 'pipe' | 'pump_station' | 'valve';

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
  status: AssetStatus;
  condition: AssetCondition;
  installationYear: number;
  lastInspectedAt: string;
  nextInspectionDue: string;
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
}

export interface PipeAsset extends BaseAsset {
  type: 'pipe';
  fromAssetId: string;
  toAssetId: string;
  diameterMm: number;
  material: string; // e.g. PVC, HDPE, Ductile Iron
  lengthMeters: number;
  flowDirection: 'downstream' | 'upstream' | 'bi-directional';
  slopePercent?: number;
  depthStartMeters?: number;
  depthEndMeters?: number;
}

export type SewerAsset = ManholeAsset | PumpStationAsset | PipeAsset;

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
