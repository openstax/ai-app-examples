import { API_URL, PROMPT_IDS, API_KEY, MODELS } from './config.js';
import { token } from './auth.js';

const promptExecuteUrl = (promptType) => `${API_URL}/prompts/${PROMPT_IDS[promptType]}/execute`;

const authorizedFetch = (url, options = {}) => {
  const urlToFetch = new URL(url);
  urlToFetch.searchParams.set('api_key', API_KEY);

  console.log('Fetching URL:', urlToFetch.toString());

  return fetch(urlToFetch.toString(), {
    ...options,
    headers: {
      ...options.headers,
      'x-launch-token': token,
    },
  });
}


/*
 * @typedef {Object} GenerateInput
 * @property {string} prompt - The text prompt to generate content from.
 *
 * @param {number} modelId - The ID of the model to use for text generation.
 * @param {GenerateInput} input - The input object containing the prompt.
 * @param {Object} [jsonSchema] - Optional JSON schema for structured output.
 */
export const generateText = async (modelId, input, jsonSchema) => {
  const payload = { input, modelId, jsonSchema };

  const promptUrl = jsonSchema 
    ? promptExecuteUrl('json') 
    : promptExecuteUrl('generate');

  const response = await authorizedFetch(promptUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
  ;

  console.log('Response from AI:', response);

  return jsonSchema ? response.data : response.text;
};

/*
 * @typedef {Object} ChatInput
 * @property {string} system - The system message to set context for the chat.
 * @property {Array<{role: string, content: {text: string}}>} messages - The chat messages to process.
 *
 * @param {number} modelId - The ID of the model to use for chat generation.
 * @param {ChatInput} input - The input object containing system message and chat messages.
 **/
export const generateChat = async (modelId, input) => {
  const payload = { input, modelId };

  const promptUrl = promptExecuteUrl('chat');
  const response = await authorizedFetch(promptUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  })
    .then(response => response.json())
  ;

  console.log('Response from AI:', response);

  return response.text;
};
