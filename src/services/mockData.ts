import { ManholeAsset, PumpStationAsset, PipeAsset } from '../types/asset';
import { InspectionRecord } from '../types/inspection';
import { UserProfile } from '../types/rbac';

export const INITIAL_MANHOLES: ManholeAsset[] = [];

export const INITIAL_PUMP_STATIONS: PumpStationAsset[] = [];

export const INITIAL_PIPES: PipeAsset[] = [];

export const INITIAL_INSPECTIONS: InspectionRecord[] = [];

export const INITIAL_USERS: UserProfile[] = [
  {
    id: 'usr-admin-01',
    name: 'Angga Purbaya',
    email: 'angga.purbaya@gmail.com',
    role: 'Admin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    department: 'Direksi / System Administrator',
    phone: '+62 812-0000-0000',
    status: 'Active'
  }
];
