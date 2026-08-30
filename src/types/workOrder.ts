export type WorkOrderPriority = 'Rendah' | 'Sedang' | 'Tinggi' | 'Kritis';

export type WorkOrderStatus = 'Baru' | 'Ditugaskan' | 'Sedang Dikerjakan' | 'Ditunda' | 'Selesai' | 'Ditutup';

export type WorkOrderCategory = 'Mekanik' | 'Elektrik' | 'Sipil' | 'Instrumen' | 'Operasional' | 'Lainnya';

export interface WorkOrder {
  id: string; // e.g. WO-2026083001
  title: string;
  category: WorkOrderCategory;
  location: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  picUserId?: string;
  picName?: string;
  dueDate: string; // ISO date string or formatted date
  description?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MaintenanceProject {
  id: string;
  title: string;
  status: 'Direncanakan' | 'Dalam Pengerjaan' | 'Selesai' | 'Ditunda';
  totalTasks: number;
  completedTasks: number;
  targetDate?: string;
  createdAt?: string;
}

export interface DailyReport {
  id: string;
  date: string;
  technicianName: string;
  workSummary: string;
  workOrderId?: string;
  status: 'Draft' | 'Submitted' | 'Approved';
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  entity: string;
  timestamp: string;
  details?: string;
}
