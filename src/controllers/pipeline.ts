import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import logger from '../utils/logger';

export const getPipelineView = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Group by pipeline stage
    const pipeline = {
      lead: (data || []).filter((p) => p.pipeline_stage === 'lead'),
      contacted: (data || []).filter((p) => p.pipeline_stage === 'contacted'),
      interested: (data || []).filter((p) => p.pipeline_stage === 'interested'),
      partner: (data || []).filter((p) => p.pipeline_stage === 'partner'),
    };

    res.json(pipeline);
  } catch (err) {
    logger.error('Failed to fetch pipeline view', err);
    res.status(500).json({ error: 'Failed to fetch pipeline view' });
  }
};

export const moveProspect = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { pipeline_stage } = req.body;

    const validStages = ['lead', 'contacted', 'interested', 'partner'];
    if (!validStages.includes(pipeline_stage)) {
      res.status(400).json({ error: 'Invalid pipeline stage' });
      return;
    }

    // Get current stage for activity log
    const { data: current } = await supabase
      .from('prospects')
      .select('pipeline_stage, business_name')
      .eq('id', id)
      .single();

    const { data, error } = await supabase
      .from('prospects')
      .update({ pipeline_stage })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log the stage change as an activity
    if (current && current.pipeline_stage !== pipeline_stage) {
      await supabase.from('activities').insert({
        prospect_id: id,
        type: 'stage_change',
        title: `Moved ${current.business_name} from ${current.pipeline_stage} to ${pipeline_stage}`,
        metadata: {
          from_stage: current.pipeline_stage,
          to_stage: pipeline_stage,
        },
      });
    }

    res.json(data);
  } catch (err) {
    logger.error('Failed to move prospect', err);
    res.status(500).json({ error: 'Failed to move prospect in pipeline' });
  }
};
