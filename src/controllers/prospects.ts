import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { CreateProspectDto, UpdateProspectDto } from '../models/prospect';
import logger from '../utils/logger';

export const getProspects = async (req: Request, res: Response) => {
  try {
    const { stage, store_type, assigned_to, search, sort_by, sort_order } = req.query;

    let query = supabase.from('prospects').select('*');

    if (stage) query = query.eq('pipeline_stage', stage as string);
    if (store_type) query = query.eq('store_type', store_type as string);
    if (assigned_to) query = query.eq('assigned_to', assigned_to as string);
    if (search) {
      query = query.or(
        `business_name.ilike.%${search}%,contact_first_name.ilike.%${search}%,contact_last_name.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`
      );
    }

    const sortField = (sort_by as string) || 'created_at';
    const ascending = sort_order === 'asc';
    query = query.order(sortField, { ascending });

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch prospects', err);
    res.status(500).json({ error: 'Failed to fetch prospects' });
  }
};

export const getProspectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('prospects').select('*').eq('id', id).single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Prospect not found' });
      return;
    }

    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch prospect', err);
    res.status(500).json({ error: 'Failed to fetch prospect' });
  }
};

export const createProspect = async (req: Request, res: Response) => {
  try {
    const prospectData: CreateProspectDto = req.body;
    const { data, error } = await supabase.from('prospects').insert(prospectData).select().single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    logger.error('Failed to create prospect', err);
    res.status(500).json({ error: 'Failed to create prospect' });
  }
};

export const updateProspect = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates: UpdateProspectDto = req.body;
    const { data, error } = await supabase
      .from('prospects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to update prospect', err);
    res.status(500).json({ error: 'Failed to update prospect' });
  }
};

export const deleteProspect = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('prospects').delete().eq('id', id);

    if (error) throw error;
    res.status(204).send();
  } catch (err) {
    logger.error('Failed to delete prospect', err);
    res.status(500).json({ error: 'Failed to delete prospect' });
  }
};

export const updateProspectStage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { pipeline_stage } = req.body;

    if (!['lead', 'contacted', 'interested', 'partner'].includes(pipeline_stage)) {
      res.status(400).json({ error: 'Invalid pipeline stage' });
      return;
    }

    // Get current prospect to log stage change
    const { data: current } = await supabase.from('prospects').select('pipeline_stage').eq('id', id).single();

    const { data, error } = await supabase
      .from('prospects')
      .update({ pipeline_stage })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log activity for stage change
    if (current && current.pipeline_stage !== pipeline_stage) {
      await supabase.from('activities').insert({
        prospect_id: id,
        type: 'stage_change',
        title: `Stage changed from ${current.pipeline_stage} to ${pipeline_stage}`,
        metadata: { from: current.pipeline_stage, to: pipeline_stage },
      });
    }

    res.json(data);
  } catch (err) {
    logger.error('Failed to update prospect stage', err);
    res.status(500).json({ error: 'Failed to update prospect stage' });
  }
};
