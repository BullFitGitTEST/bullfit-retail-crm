export interface Call {
  id: string;
  prospect_id?: string;
  team_member_id?: string;
  bland_call_id?: string;
  direction: 'inbound' | 'outbound';
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'no_answer';
  duration_seconds?: number;
  recording_url?: string;
  transcript?: any;
  summary?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
  outcome?: 'interested' | 'not_interested' | 'callback' | 'voicemail' | 'no_answer';
  notes?: string;
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

export interface CallCampaign {
  id: string;
  name: string;
  description?: string;
  pathway_id?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  created_by?: string;
  total_calls: number;
  completed_calls: number;
  successful_calls: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignProspect {
  id: string;
  campaign_id: string;
  prospect_id: string;
  status: 'pending' | 'queued' | 'completed' | 'failed' | 'skipped';
  call_id?: string;
  created_at: string;
}
