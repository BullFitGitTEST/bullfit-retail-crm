import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { CreateActivityDto } from '../models/activity';
import logger from '../utils/logger';

export const getActivitiesByProspect = async (req: Request, res: Response) => {
  try {
    const { prospectId } = req.params;
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('prospect_id', prospectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch activities', err);
    res.status(500).json({ error: 'Failed to fetch activities' });
  }
};

export const getRecentActivities = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const { data, error } = await supabase
      .from('activities')
      .select('*, prospects(business_name)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch recent activities', err);
    res.status(500).json({ error: 'Failed to fetch recent activities' });
  }
};

export const createActivity = async (req: Request, res: Response) => {
  try {
    const activityData: CreateActivityDto = req.body;
    const { data, error } = await supabase.from('activities').insert(activityData).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    logger.error('Failed to create activity', err);
    res.status(500).json({ error: 'Failed to create activity' });
  }
};
