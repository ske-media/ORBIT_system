export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: TaskStatus;
  projectId: string;
  assignedUserIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type TaskFormData = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;