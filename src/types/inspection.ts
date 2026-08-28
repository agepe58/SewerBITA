import { AssetCondition } from './asset';

export type IssueCategory =
  | 'Blockage'
  | 'Sedimentation'
  | 'Structural Damage'
  | 'Cover Damage'
  | 'Leakage'
  | 'Overflow'
  | 'Odour'
  | 'Normal / Routine';

export interface InspectionRecord {
  id: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  inspectionDate: string;
  inspectorName: string;
  inspectorRole: string;
  condition: AssetCondition;
  issueCategory: IssueCategory;
  notes: string;
  photos: string[];
  actionTaken?: string;
  requiresFollowUp: boolean;
}
