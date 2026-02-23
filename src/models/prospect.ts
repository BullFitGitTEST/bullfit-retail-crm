export interface Prospect {
  id: string;
  business_name: string;
  contact_first_name?: string;
  contact_last_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  store_type: 'pharmacy' | 'health_food' | 'gym' | 'supplement' | 'grocery' | 'other';
  pipeline_stage: 'lead' | 'contacted' | 'interested' | 'partner';
  assigned_to?: string;
  source: 'manual' | 'import' | 'ai_found' | 'referral';
  estimated_monthly_volume?: number;
  notes?: string;
  last_contacted_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProspectDto {
  business_name: string;
  contact_first_name?: string;
  contact_last_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  store_type?: 'pharmacy' | 'health_food' | 'gym' | 'supplement' | 'grocery' | 'other';
  pipeline_stage?: 'lead' | 'contacted' | 'interested' | 'partner';
  assigned_to?: string;
  source?: 'manual' | 'import' | 'ai_found' | 'referral';
  estimated_monthly_volume?: number;
  notes?: string;
}

export interface UpdateProspectDto extends Partial<CreateProspectDto> {}
