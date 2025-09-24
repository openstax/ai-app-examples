import { API_URL, PROMPT_IDS, API_KEY } from '../config.ts';
import { token } from './auth.ts';

export interface GenerateInput {
  prompt: string;
}

export interface ChatMessage {
  role: string;
  content: {
    text: string;
  };
}

export interface ChatInput {
  system: string;
  messages: ChatMessage[];
}

export type JsonSchema  = Record<string, unknown>;

const promptExecuteUrl = (promptType: string): string =>
  `${API_URL}/prompts/${PROMPT_IDS[promptType].toString()}/execute`;

const authorizedFetch = (url: string, options: RequestInit = {}) => {
  const urlToFetch = new URL(url);
  urlToFetch.searchParams.set('api_key', API_KEY);

  console.log('Fetching URL:', urlToFetch.toString());

  const headers = new Headers(options.headers);
  if (token) headers.set('x-launch-token', token);

  return fetch(urlToFetch.toString(), {
    ...options,
    headers,
  });
};

export const generateText = async (modelId: number, input: GenerateInput) => {
  const payload = { input, modelId };

  const promptUrl = promptExecuteUrl('generate');

  const fetchResponse = await authorizedFetch(promptUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const executionId = fetchResponse.headers.get('X-Execution-ID') as string;
  const response = await fetchResponse.json() as { text: string };

  console.log('Response from AI:', response);

  return {
    text: response.text,
    executionId
  };
};

export const generateJson = async <T>(modelId: number, input: GenerateInput, jsonSchema: JsonSchema) => {
  const payload = { input, modelId, jsonSchema };

  const promptUrl = promptExecuteUrl('json');

  const fetchResponse = await authorizedFetch(promptUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const executionId = fetchResponse.headers.get('X-Execution-ID') as string;
  const response = await fetchResponse.json() as { data: T };

  console.log('Response from AI:', response);

  return {
    data: response.data,
    executionId
  };
};

export const generateChat = async (modelId: number, input: ChatInput) => {
  const payload = { input, modelId };

  const promptUrl = promptExecuteUrl('chat');
  const fetchResponse = await authorizedFetch(promptUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const executionId = fetchResponse.headers.get('X-Execution-ID') as string;
  const response = await fetchResponse.json() as { text: string };

  console.log('Response from AI:', response);

  return {
    text: response.text,
    executionId
  };
};
