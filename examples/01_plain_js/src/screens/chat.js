import { generateChat } from '../ai.js';
import { loadStyle } from '../css.js';
import { MODELS } from '../config.js';

const html = `
  <h2>Chat</h2>
  <ol id="messages">
    <li class="message template">
      <div class="message-content">
        <span class="message-role"></span>
        <span class="message-text"></span>
      </div>
    </li>
  </ol>
  <form id="prompt">
    <label>
      <span class="label-text">Model:</span>
      <select name="modelId"></select>
    </label>
    <label>
      <span class="label-text">System Prompt:</span>
      <textarea name="system" required>You are a friendly AI chat bot.</textarea>
    </label>
    <label>
      <span class="label-text">Message:</span>
      <textarea name="prompt" required>Whats good today with my best AI friend?</textarea>
    </label>
    <div class="form-bottom">
      <p id="feedback"></p>
      <button type="submit">Submit</button>
    </div>
  </form>
`;

export function loadChatUI(container) {
  container.innerHTML = html;
  return mount();
}

let mounted = false;

function mount() {
  mounted = true;
  const { unload: unloadStyle } = loadStyle('./src/screens/chat.css');

  const promptForm = document.getElementById('prompt');
  const messagesContainer = document.getElementById('messages');
  const feedbackContainer = document.getElementById('feedback');

  const modelSelect = promptForm.modelId;
  Object.entries(MODELS).forEach(([key, modelId]) => {
    const option = document.createElement('option');
    option.value = modelId;
    option.textContent = key;
    modelSelect.appendChild(option);
  });

  const messages = [];
  let isProcessing = false;
  promptForm.addEventListener('submit', handleSubmission);

  return () => {
    console.log('Unmounting Chat UI');
    unloadStyle();
    mounted = false;
  };

  async function handleSubmission(e) {
    e.preventDefault();
    if (isProcessing) return;

    const formData = new FormData(promptForm);
    const modelId = parseInt(formData.get('modelId'), 10);
    const prompt = formData.get('prompt');
    const system = formData.get('system');

    feedbackContainer.textContent = 'Please wait, processing...';
    feedbackContainer.classList.remove('error');

    console.log('Processing message:', prompt);
    const thisMessage = { role: 'user', content: {text: prompt} }
    renderMessage(messagesContainer, thisMessage);
    messages.push(thisMessage);
    promptForm.prompt.value = '';


    try {
      const result = await generateChat(modelId, {system, messages});
      const responseMessage = { role: 'assistant', content: {text: result} };
      renderMessage(messagesContainer, responseMessage);
      messages.push(responseMessage);

      feedbackContainer.textContent = 'Done!';
      console.log('Result:', result);
    } catch (error) {
      console.error('Error processing prompt:', error);
      feedbackContainer.textContent = 'An error occurred while processing your request.';
      feedbackContainer.classList.add('error');
    }
  }
}

function renderMessage(container, message) {
  const role = message.role;
  const text = message.content.text;

  const template = document.querySelector('#messages > .message.template');
  if (!template) return null;

  const messageEl = template.cloneNode(true);
  messageEl.classList.remove('template');
  messageEl.classList.add(`role-${role}`);
  const roleEl = messageEl.querySelector('.message-role');
  const textEl = messageEl.querySelector('.message-text');
  roleEl.textContent = role === 'user' ? 'Your message' : 'Bot message';
  textEl.textContent = text;

  container.appendChild(messageEl);
}
