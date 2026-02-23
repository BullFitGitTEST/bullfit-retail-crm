import logger from '../utils/logger';

const BLAND_API_URL = 'https://api.bland.ai/v1';

function getApiKey(): string {
  const key = process.env.BLAND_API_KEY;
  if (!key) {
    throw new Error('BLAND_API_KEY environment variable is not set');
  }
  return key;
}

export interface BlandCallOptions {
  phone_number: string;
  pathway_id?: string;
  task?: string;
  voice?: string;
  first_sentence?: string;
  wait_for_greeting?: boolean;
  record?: boolean;
  metadata?: Record<string, any>;
  webhook?: string;
}

export interface BlandCallResponse {
  call_id: string;
  status: string;
  message?: string;
}

export const makeCall = async (options: BlandCallOptions): Promise<BlandCallResponse> => {
  const apiKey = getApiKey();
  const webhookUrl = process.env.BLAND_WEBHOOK_URL;

  const body = {
    phone_number: options.phone_number,
    pathway_id: options.pathway_id,
    task: options.task || 'You are a sales representative from BullFit, a pharmacist-formulated supplement brand. You are calling to introduce our wholesale program to retail store owners.',
    voice: options.voice || 'mason',
    first_sentence: options.first_sentence || 'Hi, this is a representative from BullFit supplements. Do you have a moment to chat about our wholesale program?',
    wait_for_greeting: options.wait_for_greeting ?? true,
    record: options.record ?? true,
    metadata: options.metadata || {},
    webhook: options.webhook || webhookUrl,
  };

  try {
    const response = await fetch(`${BLAND_API_URL}/calls`, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data: any = await response.json();

    if (!response.ok) {
      logger.error('Bland API error', data);
      throw new Error(data.message || 'Failed to initiate call');
    }

    return {
      call_id: data.call_id,
      status: data.status || 'queued',
      message: data.message,
    };
  } catch (err) {
    logger.error('Failed to make Bland call', err);
    throw err;
  }
};

export const getCallDetails = async (callId: string): Promise<any> => {
  const apiKey = getApiKey();

  try {
    const response = await fetch(`${BLAND_API_URL}/calls/${callId}`, {
      headers: {
        'Authorization': apiKey,
      },
    });

    const data: any = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to get call details');

    return data;
  } catch (err) {
    logger.error('Failed to get Bland call details', err);
    throw err;
  }
};

export const endCall = async (callId: string): Promise<void> => {
  const apiKey = getApiKey();

  try {
    const response = await fetch(`${BLAND_API_URL}/calls/${callId}/stop`, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
      },
    });

    if (!response.ok) {
      const data: any = await response.json();
      throw new Error(data.message || 'Failed to end call');
    }
  } catch (err) {
    logger.error('Failed to end Bland call', err);
    throw err;
  }
};

export const batchCall = async (
  phoneNumbers: { phone: string; metadata: Record<string, any> }[],
  pathwayId?: string,
  task?: string
): Promise<any> => {
  const apiKey = getApiKey();
  const webhookUrl = process.env.BLAND_WEBHOOK_URL;

  const calls = phoneNumbers.map((entry) => ({
    phone_number: entry.phone,
    pathway_id: pathwayId,
    task: task || 'You are a sales representative from BullFit supplements calling about our wholesale program.',
    voice: 'mason',
    record: true,
    metadata: entry.metadata,
    webhook: webhookUrl,
  }));

  try {
    const response = await fetch(`${BLAND_API_URL}/calls/batch`, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ calls }),
    });

    const data: any = await response.json();
    if (!response.ok) throw new Error(data.message || 'Failed to initiate batch calls');

    return data;
  } catch (err) {
    logger.error('Failed to make batch Bland calls', err);
    throw err;
  }
};
