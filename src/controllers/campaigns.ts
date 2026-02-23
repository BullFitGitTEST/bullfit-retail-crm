import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import * as bland from '../services/bland';
import logger from '../utils/logger';

export const getCampaigns = async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('call_campaigns')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch campaigns', err);
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
};

export const getCampaignById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: campaign, error } = await supabase
      .from('call_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Get campaign prospects with their details
    const { data: campaignProspects } = await supabase
      .from('campaign_prospects')
      .select('*, prospects(business_name, phone, pipeline_stage), calls(status, outcome, duration_seconds)')
      .eq('campaign_id', id);

    res.json({ ...campaign, prospects: campaignProspects || [] });
  } catch (err) {
    logger.error('Failed to fetch campaign', err);
    res.status(500).json({ error: 'Failed to fetch campaign' });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  try {
    const { name, description, pathway_id, created_by, prospect_ids } = req.body;

    const { data: campaign, error } = await supabase
      .from('call_campaigns')
      .insert({
        name,
        description,
        pathway_id,
        created_by,
        total_calls: prospect_ids?.length || 0,
      })
      .select()
      .single();

    if (error) throw error;

    // Add prospects to campaign
    if (prospect_ids && prospect_ids.length > 0) {
      const campaignProspects = prospect_ids.map((pid: string) => ({
        campaign_id: campaign.id,
        prospect_id: pid,
      }));

      await supabase.from('campaign_prospects').insert(campaignProspects);
    }

    res.status(201).json(campaign);
  } catch (err) {
    logger.error('Failed to create campaign', err);
    res.status(500).json({ error: 'Failed to create campaign' });
  }
};

export const launchCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get campaign and its pending prospects
    const { data: campaign } = await supabase
      .from('call_campaigns')
      .select('*')
      .eq('id', id)
      .single();

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    const { data: pendingProspects } = await supabase
      .from('campaign_prospects')
      .select('*, prospects(phone, business_name)')
      .eq('campaign_id', id)
      .eq('status', 'pending');

    if (!pendingProspects || pendingProspects.length === 0) {
      res.status(400).json({ error: 'No pending prospects in campaign' });
      return;
    }

    // Filter prospects with phone numbers
    const callableProspects = pendingProspects.filter(
      (cp: any) => cp.prospects?.phone
    );

    if (callableProspects.length === 0) {
      res.status(400).json({ error: 'No prospects with phone numbers' });
      return;
    }

    // Make batch calls via Bland
    const phoneEntries = callableProspects.map((cp: any) => ({
      phone: cp.prospects.phone,
      metadata: {
        prospect_id: cp.prospect_id,
        campaign_id: id,
        business_name: cp.prospects.business_name,
      },
    }));

    const blandResponse = await bland.batchCall(phoneEntries, campaign.pathway_id);

    // Update campaign status
    await supabase
      .from('call_campaigns')
      .update({ status: 'active' })
      .eq('id', id);

    // Mark campaign prospects as queued
    const cpIds = callableProspects.map((cp: any) => cp.id);
    await supabase
      .from('campaign_prospects')
      .update({ status: 'queued' })
      .in('id', cpIds);

    res.json({ message: 'Campaign launched', calls_initiated: callableProspects.length, bland_response: blandResponse });
  } catch (err) {
    logger.error('Failed to launch campaign', err);
    res.status(500).json({ error: 'Failed to launch campaign' });
  }
};

export const pauseCampaign = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('call_campaigns')
      .update({ status: 'paused' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to pause campaign', err);
    res.status(500).json({ error: 'Failed to pause campaign' });
  }
};
