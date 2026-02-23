export interface Task {
  id: string;
  prospect_id?: string;
  assigned_to?: string;
  title: string;
  description?: string;
  due_date?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'completed' | 'cancelled';
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDto {
  prospect_id?: string;
  assigned_to?: string;
  title: string;
  description?: string;
  due_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface UpdateTaskDto extends Partial<CreateTaskDto> {
  status?: 'pending' | 'completed' | 'cancelled';
}
