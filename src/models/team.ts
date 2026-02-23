export interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  role: 'rep' | 'manager' | 'admin';
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
