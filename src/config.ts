export const API_KEY = import.meta.env.VITE_API_KEY;
export const API_HOST = 'promptly.openstax.org';

export const API_URL = `https://${API_HOST}/api/v0`;
export const TOKEN_URL = `${API_URL}/user/token`;

export const PROMPT_IDS: Record<string, number> = {
  generate:21,
  chat:23,
  json:22
};
export const MODELS: Record<string, number> = {
  'claude-sonnet-4':5,
  'claude-3-7-sonnet':1,
  'gpt-4o':2,
  'gpt-4o-mini':3,
  'llama3-1-70b':4,
  'titan-text-premier':6
};
