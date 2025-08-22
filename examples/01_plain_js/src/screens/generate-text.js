import { generateText } from '../ai.js';
import { loadStyle } from '../css.js';
import { MODELS } from '../config.js';

const html = `
  <h2>Generate Text</h2>
  <form id="prompt">
    <label>
      <span class="label-text">Model:</span>
      <select name="modelId"></select>
    </label>
    <label>
      <span class="label-text">Enter your prompt:</span>
      <textarea name="prompt" required>write a haiku</textarea>
    </label>
    <div class="form-bottom">
      <p id="feedback"></p>
      <button type="submit">Submit</button>
    </div>
  </form>
  <div id="output">
    <h2>Output:</h2>
    <pre id="result"></pre>
  </div>
`;

export function loadGenerateTextUI(container) {
  container.innerHTML = html;
  return mount();
}

let mounted = false;

function mount() {
  mounted = true;
  const { unload: unloadStyle } = loadStyle('./src/screens/generate-text.css');

  const promptForm = document.getElementById('prompt');
  const resultContainer = document.getElementById('result');
  const feedbackContainer = document.getElementById('feedback');

  const modelSelect = promptForm.modelId;
  Object.entries(MODELS).forEach(([key, modelId]) => {
    const option = document.createElement('option');
    option.value = modelId;
    option.textContent = key;
    modelSelect.appendChild(option);
  });

  let isProcessing = false;
  promptForm.addEventListener('submit', handleSubmission);

  return () => {
    console.log('Unmounting Generate Text UI');
    unloadStyle();
    mounted = false;
  };

  async function handleSubmission(e) {
    e.preventDefault();
    if (isProcessing) return;

    const formData = new FormData(promptForm);
    const prompt = formData.get('prompt');
    const modelId = parseInt(formData.get('modelId'), 10);

    resultContainer.textContent = '';
    feedbackContainer.textContent = 'Please wait, processing...';
    feedbackContainer.classList.remove('error');

    console.log('Processing prompt:', prompt);

    try {
      const result = await generateText(modelId, {prompt});
      resultContainer.textContent = result;
      feedbackContainer.textContent = 'Done!';
      console.log('Result:', result);
    } catch (error) {
      console.error('Error processing prompt:', error);
      feedbackContainer.textContent = 'An error occurred while processing your request.';
      feedbackContainer.classList.add('error');
    }
  }
}
