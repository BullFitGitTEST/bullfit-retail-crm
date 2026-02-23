import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import logger from '../utils/logger';

export const getTeamMembers = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('is_active', true)
      .order('full_name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch team members', err);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
};

export const getTeamMemberById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('team_members').select('*').eq('id', id).single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Team member not found' });
      return;
    }

    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch team member', err);
    res.status(500).json({ error: 'Failed to fetch team member' });
  }
};

export const getTeamMemberStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get prospect counts by stage for this team member
    const { data: prospects } = await supabase
      .from('prospects')
      .select('pipeline_stage')
      .eq('assigned_to', id);

    // Get pending tasks count
    const { count: pendingTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', id)
      .eq('status', 'pending');

    // Get completed tasks this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: completedTasksThisMonth } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_to', id)
      .eq('status', 'completed')
      .gte('completed_at', startOfMonth.toISOString());

    // Get calls this month
    const { count: callsThisMonth } = await supabase
      .from('calls')
      .select('*', { count: 'exact', head: true })
      .eq('team_member_id', id)
      .gte('created_at', startOfMonth.toISOString());

    const stageCounts: Record<string, number> = {};
    (prospects || []).forEach((p) => {
      stageCounts[p.pipeline_stage] = (stageCounts[p.pipeline_stage] || 0) + 1;
    });

    res.json({
      prospects_by_stage: stageCounts,
      total_prospects: (prospects || []).length,
      pending_tasks: pendingTasks || 0,
      completed_tasks_this_month: completedTasksThisMonth || 0,
      calls_this_month: callsThisMonth || 0,
    });
  } catch (err) {
    logger.error('Failed to fetch team member stats', err);
    res.status(500).json({ error: 'Failed to fetch team member stats' });
  }
};
