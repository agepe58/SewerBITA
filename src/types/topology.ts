export interface NetworkTraceResult {
  startAssetId: string;
  traceType: 'downstream' | 'upstream';
  pathAssetIds: string[]; // List of node and pipe asset IDs in order
  traversedManholeIds: string[];
  traversedPipeIds: string[];
  destinationPumpStationId?: string;
  totalDistanceMeters: number;
  criticalNodesEncountered: string[];
}

export interface TopologyValidationError {
  id: string;
  assetId?: string;
  severity: 'error' | 'warning';
  issueType: 'orphan_pipe' | 'disconnected_manhole' | 'invalid_coordinates' | 'missing_direction' | 'loop_detected';
  message: string;
  suggestedFix?: string;
}

export interface TopologyValidationSummary {
  totalAssetsChecked: number;
  totalPipesChecked: number;
  isValid: boolean;
  errorsCount: number;
  warningsCount: number;
  issues: TopologyValidationError[];
}
