export type ProjectStatus = 'not_started' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: ProjectStatus;
  contactId: string;
  contact?: Contact;
  createdAt: string;
  updatedAt: string;
}

export type ProjectFormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt'>;

// Update ProjectFormData to remove progress since it's calculated automatically
export type ProjectFormData = Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'progress'>;