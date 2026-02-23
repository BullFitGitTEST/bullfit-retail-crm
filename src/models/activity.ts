export interface Activity {
  id: string;
  prospect_id: string;
  team_member_id?: string;
  type: 'call' | 'email' | 'note' | 'stage_change' | 'task_completed';
  title: string;
  description?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface CreateActivityDto {
  prospect_id: string;
  team_member_id?: string;
  type: 'call' | 'email' | 'note' | 'stage_change' | 'task_completed';
  title: string;
  description?: string;
  metadata?: Record<string, any>;
}
