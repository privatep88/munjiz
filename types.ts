
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type Status = 'pending' | 'in-progress' | 'completed';

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  tags?: string[];
  attachments?: Attachment[];
  emailReminderFrequency?: 'none' | '2-days' | '5-days' | '10-days';
  customReminderDate?: string; // New field for custom reminder datetime
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert';
  read: boolean;
  timestamp: Date;
  taskId?: string; // Added to link notification to a task
  taskTitle?: string; // Explicitly store the task name for display
}

export type View = 'dashboard' | 'tasks' | 'completed_log' | 'calendar' | 'notifications' | 'settings';

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'منخفضة',
  medium: 'متوسطة',
  high: 'عالية',
  urgent: 'عاجلة',
};

export const STATUS_LABELS: Record<Status, string> = {
  pending: 'قيد الانتظار',
  'in-progress': 'جاري العمل',
  completed: 'مكتملة',
};