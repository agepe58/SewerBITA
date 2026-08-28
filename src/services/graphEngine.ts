import { SewerAsset, ManholeAsset, PumpStationAsset, PipeAsset } from '../types/asset';
import { NetworkTraceResult, TopologyValidationSummary, TopologyValidationError } from '../types/topology';

export class NetworkGraphEngine {
  private assetsMap: Map<string, SewerAsset> = new Map();
  private manholesMap: Map<string, ManholeAsset> = new Map();
  private pumpStationsMap: Map<string, PumpStationAsset> = new Map();
  private pipes: PipeAsset[] = [];

  // Adjacency lists
  private outgoingEdges: Map<string, PipeAsset[]> = new Map(); // assetId -> Array of pipes starting from here
  private incomingEdges: Map<string, PipeAsset[]> = new Map(); // assetId -> Array of pipes ending here

  constructor(manholes: ManholeAsset[], pumpStations: PumpStationAsset[], pipes: PipeAsset[]) {
    this.rebuildGraph(manholes, pumpStations, pipes);
  }

  public rebuildGraph(manholes: ManholeAsset[], pumpStations: PumpStationAsset[], pipes: PipeAsset[]) {
    this.assetsMap.clear();
    this.manholesMap.clear();
    this.pumpStationsMap.clear();
    this.pipes = pipes;
    this.outgoingEdges.clear();
    this.incomingEdges.clear();

    manholes.forEach(mh => {
      this.assetsMap.set(mh.id, mh);
      this.manholesMap.set(mh.id, mh);
    });

    pumpStations.forEach(ps => {
      this.assetsMap.set(ps.id, ps);
      this.pumpStationsMap.set(ps.id, ps);
    });

    pipes.forEach(pipe => {
      this.assetsMap.set(pipe.id, pipe);

      if (!this.outgoingEdges.has(pipe.fromAssetId)) {
        this.outgoingEdges.set(pipe.fromAssetId, []);
      }
      this.outgoingEdges.get(pipe.fromAssetId)!.push(pipe);

      if (!this.incomingEdges.has(pipe.toAssetId)) {
        this.incomingEdges.set(pipe.toAssetId, []);
      }
      this.incomingEdges.get(pipe.toAssetId)!.push(pipe);
    });
  }

  /**
   * Trace downstream flow from starting asset to pump station / terminal
   */
  public traceDownstream(startAssetId: string): NetworkTraceResult {
    const visitedNodes = new Set<string>();
    const visitedPipes = new Set<string>();
    const pathAssetIds: string[] = [];
    const criticalNodes: string[] = [];
    let totalDistanceMeters = 0;
    let destinationPumpStationId: string | undefined = undefined;

    const queue: string[] = [startAssetId];
    pathAssetIds.push(startAssetId);

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      visitedNodes.add(currentNodeId);

      const currentAsset = this.assetsMap.get(currentNodeId);
      if (currentAsset && currentAsset.condition === 'Critical') {
        criticalNodes.push(currentAsset.id);
      }

      if (currentAsset && currentAsset.type === 'pump_station') {
        destinationPumpStationId = currentAsset.id;
        break; // Reached terminal pump station
      }

      const outPipes = this.outgoingEdges.get(currentNodeId) || [];
      for (const pipe of outPipes) {
        if (!visitedPipes.has(pipe.id)) {
          visitedPipes.add(pipe.id);
          pathAssetIds.push(pipe.id);
          totalDistanceMeters += pipe.lengthMeters;

          if (pipe.condition === 'Critical') {
            criticalNodes.push(pipe.id);
          }

          const nextNodeId = pipe.toAssetId;
          if (!visitedNodes.has(nextNodeId)) {
            pathAssetIds.push(nextNodeId);
            queue.push(nextNodeId);
          }
        }
      }
    }

    return {
      startAssetId,
      traceType: 'downstream',
      pathAssetIds,
      traversedManholeIds: Array.from(visitedNodes).filter(id => this.manholesMap.has(id)),
      traversedPipeIds: Array.from(visitedPipes),
      destinationPumpStationId,
      totalDistanceMeters,
      criticalNodesEncountered: criticalNodes
    };
  }

  /**
   * Trace upstream feeder network that flows INTO the given asset
   */
  public traceUpstream(startAssetId: string): NetworkTraceResult {
    const visitedNodes = new Set<string>();
    const visitedPipes = new Set<string>();
    const pathAssetIds: string[] = [];
    const criticalNodes: string[] = [];
    let totalDistanceMeters = 0;

    const queue: string[] = [startAssetId];
    pathAssetIds.push(startAssetId);

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      visitedNodes.add(currentNodeId);

      const currentAsset = this.assetsMap.get(currentNodeId);
      if (currentAsset && currentAsset.condition === 'Critical') {
        criticalNodes.push(currentAsset.id);
      }

      const inPipes = this.incomingEdges.get(currentNodeId) || [];
      for (const pipe of inPipes) {
        if (!visitedPipes.has(pipe.id)) {
          visitedPipes.add(pipe.id);
          pathAssetIds.push(pipe.id);
          totalDistanceMeters += pipe.lengthMeters;

          if (pipe.condition === 'Critical') {
            criticalNodes.push(pipe.id);
          }

          const feederNodeId = pipe.fromAssetId;
          if (!visitedNodes.has(feederNodeId)) {
            pathAssetIds.push(feederNodeId);
            queue.push(feederNodeId);
          }
        }
      }
    }

    return {
      startAssetId,
      traceType: 'upstream',
      pathAssetIds,
      traversedManholeIds: Array.from(visitedNodes).filter(id => this.manholesMap.has(id)),
      traversedPipeIds: Array.from(visitedPipes),
      totalDistanceMeters,
      criticalNodesEncountered: criticalNodes
    };
  }

  /**
   * Validate network topology connections and data integrity
   */
  public validateTopology(): TopologyValidationSummary {
    const issues: TopologyValidationError[] = [];

    // Check Pipes
    this.pipes.forEach(pipe => {
      const fromNodeExists = this.assetsMap.has(pipe.fromAssetId);
      const toNodeExists = this.assetsMap.has(pipe.toAssetId);

      if (!fromNodeExists || !toNodeExists) {
        issues.push({
          id: `val-orphan-${pipe.id}`,
          assetId: pipe.id,
          severity: 'error',
          issueType: 'orphan_pipe',
          message: `Pipa ${pipe.assetCode} terhubung ke node yang tidak terdaftar di sistem (${!fromNodeExists ? 'From: ' + pipe.fromAssetId : ''} ${!toNodeExists ? 'To: ' + pipe.toAssetId : ''}).`,
          suggestedFix: 'Perbarui node asal atau node tujuan pipa ini.'
        });
      }

      if (!pipe.flowDirection) {
        issues.push({
          id: `val-direction-${pipe.id}`,
          assetId: pipe.id,
          severity: 'warning',
          issueType: 'missing_direction',
          message: `Pipa ${pipe.assetCode} belum memiliki arah aliran yang ditentukan.`,
          suggestedFix: 'Atur flowDirection ke downstream.'
        });
      }
    });

    // Check Manholes for Disconnections
    this.manholesMap.forEach(mh => {
      const hasOut = (this.outgoingEdges.get(mh.id) || []).length > 0;
      const hasIn = (this.incomingEdges.get(mh.id) || []).length > 0;

      if (!hasOut && !hasIn) {
        issues.push({
          id: `val-disc-${mh.id}`,
          assetId: mh.id,
          severity: 'warning',
          issueType: 'disconnected_manhole',
          message: `Manhole ${mh.assetCode} tidak memiliki sambungan pipa masuk maupun pipa keluar (Terisolasi).`,
          suggestedFix: 'Hubungkan pipa ke manhole ini atau periksa data GIS.'
        });
      }

      if (!mh.coordinates || mh.coordinates.lat === 0 || mh.coordinates.lng === 0) {
        issues.push({
          id: `val-coord-${mh.id}`,
          assetId: mh.id,
          severity: 'error',
          issueType: 'invalid_coordinates',
          message: `Koordinat Manhole ${mh.assetCode} tidak valid.`,
          suggestedFix: 'Perbarui latitude dan longitude pada peta.'
        });
      }
    });

    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;

    return {
      totalAssetsChecked: this.assetsMap.size,
      totalPipesChecked: this.pipes.length,
      isValid: errorCount === 0,
      errorsCount: errorCount,
      warningsCount: warningCount,
      issues
    };
  }

  /**
   * Dynamically calculate sequential topological order numbers for all manholes in network lines
   */
  public computeDynamicSequences(manholes: ManholeAsset[]): ManholeAsset[] {
    const inDegreeMap = new Map<string, number>();
    manholes.forEach(mh => inDegreeMap.set(mh.id, 0));

    this.pipes.forEach(pipe => {
      if (inDegreeMap.has(pipe.toAssetId)) {
        inDegreeMap.set(pipe.toAssetId, (inDegreeMap.get(pipe.toAssetId) || 0) + 1);
      }
    });

    const headNodeIds = manholes.filter(mh => (inDegreeMap.get(mh.id) || 0) === 0).map(mh => mh.id);
    const sequences = new Map<string, number>();
    const visited = new Set<string>();

    headNodeIds.forEach(headId => {
      let currentSeq = 1;
      let currId: string | undefined = headId;

      while (currId && !visited.has(currId)) {
        visited.add(currId);
        if (this.manholesMap.has(currId)) {
          sequences.set(currId, currentSeq++);
        }
        const outPipes: PipeAsset[] = this.outgoingEdges.get(currId) || [];
        if (outPipes.length > 0) {
          currId = outPipes[0].toAssetId;
        } else {
          currId = undefined;
        }
      }
    });

    let fallbackSeq = 1;
    return manholes.map(mh => {
      const seq = sequences.get(mh.id) || (headNodeIds.length > 0 ? 1 : fallbackSeq++);
      return {
        ...mh,
        sequenceNumber: seq
      };
    });
  }
}
