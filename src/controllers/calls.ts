import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import * as bland from '../services/bland';
import logger from '../utils/logger';

export const initiateCall = async (req: Request, res: Response) => {
  try {
    const { prospect_id, team_member_id, pathway_id } = req.body;

    // Get prospect phone number
    const { data: prospect, error: prospectError } = await supabase
      .from('prospects')
      .select('phone, business_name')
      .eq('id', prospect_id)
      .single();

    if (prospectError || !prospect) {
      res.status(404).json({ error: 'Prospect not found' });
      return;
    }

    if (!prospect.phone) {
      res.status(400).json({ error: 'Prospect has no phone number' });
      return;
    }

    // Make the call via Bland
    const blandResponse = await bland.makeCall({
      phone_number: prospect.phone,
      pathway_id,
      metadata: { prospect_id, team_member_id, business_name: prospect.business_name },
    });

    // Save call record to database
    const { data: call, error: callError } = await supabase
      .from('calls')
      .insert({
        prospect_id,
        team_member_id,
        bland_call_id: blandResponse.call_id,
        direction: 'outbound',
        status: 'queued',
        started_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (callError) throw callError;

    // Update prospect last_contacted_at
    await supabase
      .from('prospects')
      .update({ last_contacted_at: new Date().toISOString() })
      .eq('id', prospect_id);

    // Log activity
    await supabase.from('activities').insert({
      prospect_id,
      team_member_id,
      type: 'call',
      title: `Outbound call to ${prospect.business_name}`,
      metadata: { call_id: call.id, bland_call_id: blandResponse.call_id },
    });

    res.status(201).json(call);
  } catch (err) {
    logger.error('Failed to initiate call', err);
    res.status(500).json({ error: 'Failed to initiate call' });
  }
};

export const getCalls = async (req: Request, res: Response) => {
  try {
    const { prospect_id, status, team_member_id } = req.query;

    let query = supabase
      .from('calls')
      .select('*, prospects(business_name, phone)');

    if (prospect_id) query = query.eq('prospect_id', prospect_id as string);
    if (status) query = query.eq('status', status as string);
    if (team_member_id) query = query.eq('team_member_id', team_member_id as string);

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch calls', err);
    res.status(500).json({ error: 'Failed to fetch calls' });
  }
};

export const getCallById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('calls')
      .select('*, prospects(business_name, phone, email)')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: 'Call not found' });
      return;
    }

    // If we have a bland_call_id, try to get latest details
    if (data.bland_call_id && data.status !== 'completed') {
      try {
        const details = await bland.getCallDetails(data.bland_call_id);
        // Update local record with latest info
        if (details.transcript || details.recording_url) {
          await supabase
            .from('calls')
            .update({
              transcript: details.transcript || data.transcript,
              recording_url: details.recording_url || data.recording_url,
              summary: details.summary || data.summary,
              duration_seconds: details.call_length || data.duration_seconds,
              status: details.completed ? 'completed' : data.status,
              ended_at: details.completed ? details.end_time : data.ended_at,
            })
            .eq('id', id);
        }
      } catch {
        // Bland API might not be configured, continue with local data
      }
    }

    res.json(data);
  } catch (err) {
    logger.error('Failed to fetch call', err);
    res.status(500).json({ error: 'Failed to fetch call' });
  }
};

export const endActiveCall = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: call } = await supabase
      .from('calls')
      .select('bland_call_id')
      .eq('id', id)
      .single();

    if (!call?.bland_call_id) {
      res.status(404).json({ error: 'Call not found or no Bland call ID' });
      return;
    }

    await bland.endCall(call.bland_call_id);

    const { data, error } = await supabase
      .from('calls')
      .update({ status: 'completed', ended_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    logger.error('Failed to end call', err);
    res.status(500).json({ error: 'Failed to end call' });
  }
};
