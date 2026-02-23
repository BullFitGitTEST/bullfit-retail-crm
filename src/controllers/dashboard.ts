import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import logger from '../utils/logger';

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    // Prospect counts by stage
    const { data: prospects } = await supabase.from('prospects').select('pipeline_stage');

    const stageCounts: Record<string, number> = { lead: 0, contacted: 0, interested: 0, partner: 0 };
    (prospects || []).forEach((p) => {
      stageCounts[p.pipeline_stage] = (stageCounts[p.pipeline_stage] || 0) + 1;
    });

    // Total prospects
    const totalProspects = (prospects || []).length;

    // Tasks due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const { count: tasksDueToday } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .gte('due_date', today.toISOString())
      .lt('due_date', tomorrow.toISOString());

    // Overdue tasks
    const { count: overdueTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')
      .lt('due_date', today.toISOString());

    // Total pending tasks
    const { count: pendingTasks } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // Calls this week
    const startOfWeek = new Date(today);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const { count: callsThisWeek } = await supabase
      .from('calls')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfWeek.toISOString());

    // Recent activities
    const { data: recentActivities } = await supabase
      .from('activities')
      .select('*, prospects(business_name)')
      .order('created_at', { ascending: false })
      .limit(10);

    res.json({
      pipeline: stageCounts,
      total_prospects: totalProspects,
      tasks_due_today: tasksDueToday || 0,
      overdue_tasks: overdueTasks || 0,
      pending_tasks: pendingTasks || 0,
      calls_this_week: callsThisWeek || 0,
      recent_activities: recentActivities || [],
    });
  } catch (err) {
    logger.error('Failed to fetch dashboard stats', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
