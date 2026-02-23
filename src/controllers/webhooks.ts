import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import logger from '../utils/logger';

// Bland.ai webhook handler — receives call status updates
export const handleBlandWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    logger.info('Bland webhook received', { call_id: payload.call_id });

    if (!payload.call_id) {
      res.status(400).json({ error: 'Missing call_id' });
      return;
    }

    // Find the call by bland_call_id
    const { data: call, error: findError } = await supabase
      .from('calls')
      .select('id, prospect_id, team_member_id')
      .eq('bland_call_id', payload.call_id)
      .single();

    if (findError || !call) {
      logger.warn('Call not found for Bland webhook', { bland_call_id: payload.call_id });
      res.status(200).json({ message: 'Call not found, acknowledged' });
      return;
    }

    // Map Bland status to our status
    let status = 'completed';
    if (payload.status === 'failed') status = 'failed';
    if (payload.status === 'no-answer') status = 'no_answer';

    // Update call record
    const updateData: Record<string, any> = {
      status,
      ended_at: payload.end_time || new Date().toISOString(),
    };

    if (payload.transcript) updateData.transcript = payload.transcript;
    if (payload.recording_url) updateData.recording_url = payload.recording_url;
    if (payload.summary) updateData.summary = payload.summary;
    if (payload.call_length) updateData.duration_seconds = Math.round(payload.call_length);

    // Try to determine sentiment and outcome from concatenated transcript
    if (payload.concatenated_transcript) {
      const transcript = payload.concatenated_transcript.toLowerCase();
      if (transcript.includes('interested') || transcript.includes('love to') || transcript.includes('send me')) {
        updateData.sentiment = 'positive';
        updateData.outcome = 'interested';
      } else if (transcript.includes('not interested') || transcript.includes('no thanks') || transcript.includes('don\'t need')) {
        updateData.sentiment = 'negative';
        updateData.outcome = 'not_interested';
      } else if (transcript.includes('call back') || transcript.includes('later') || transcript.includes('busy')) {
        updateData.sentiment = 'neutral';
        updateData.outcome = 'callback';
      } else if (transcript.includes('voicemail') || transcript.includes('leave a message')) {
        updateData.sentiment = 'neutral';
        updateData.outcome = 'voicemail';
      }
    }

    await supabase.from('calls').update(updateData).eq('id', call.id);

    // Log activity with call results
    if (call.prospect_id) {
      await supabase.from('activities').insert({
        prospect_id: call.prospect_id,
        team_member_id: call.team_member_id,
        type: 'call',
        title: `Call ${status}: ${updateData.duration_seconds ? Math.round(updateData.duration_seconds) + 's' : 'unknown duration'}`,
        description: updateData.summary || undefined,
        metadata: {
          call_id: call.id,
          bland_call_id: payload.call_id,
          status,
          outcome: updateData.outcome,
          duration: updateData.duration_seconds,
        },
      });

      // Update prospect last_contacted_at
      await supabase
        .from('prospects')
        .update({ last_contacted_at: new Date().toISOString() })
        .eq('id', call.prospect_id);

      // If outcome is 'interested', auto-advance pipeline stage
      if (updateData.outcome === 'interested') {
        const { data: prospect } = await supabase
          .from('prospects')
          .select('pipeline_stage')
          .eq('id', call.prospect_id)
          .single();

        if (prospect && prospect.pipeline_stage === 'contacted') {
          await supabase
            .from('prospects')
            .update({ pipeline_stage: 'interested' })
            .eq('id', call.prospect_id);

          await supabase.from('activities').insert({
            prospect_id: call.prospect_id,
            type: 'stage_change',
            title: 'Auto-advanced to Interested based on call outcome',
            metadata: { from_stage: 'contacted', to_stage: 'interested', trigger: 'call_outcome' },
          });
        }
      }
    }

    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (err) {
    logger.error('Failed to process Bland webhook', err);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
};
