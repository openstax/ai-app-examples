import { generateText } from '../utils/ai.js';
import { loadStyle } from '../utils/css.js';
import { renderOutput } from '../utils/output.js';
import { MODELS } from '../config.js';

const assessmentQuestionJsonSchema = {
  type: 'object',
  properties: {
    question: {
      type: 'object',
      description: 'A question to be answered, either open-ended or multiple-choice.',
      anyOf: [
        {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['open-response'],
              description: 'The type of question to generate.',
            },
            questionText: {
              type: 'string',
              description: 'The question to be answered.',
            },
          },
          required: ['questionText'],
          description: 'An open-ended question.',
        },
        {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['multiple-choice'],
              description: 'The type of question to generate.',
            },
            questionText: {
              type: 'string',
              description: 'The question to be answered.',
            },
            options: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'An array of options for the question.',
            },
          },
          required: ['questionText', 'options'],
          description: 'A multiple-choice question with options.',
        }
      ]
    }
  },
  required: ['question'],
};

const assessmentReviewJsonSchema = {
  type: 'object',
  properties: {
    score: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      description: 'A decimal value between 0 and 1 indicating how well the answer matches the expected answer.',
    },
    feedback: {
      type: 'string',
      description: 'Feedback on the provided answer, including what was correct or incorrect.',
    },
  },
  required: ['score', 'feedback'],
  description: 'An assessment of the provided answer.',
};

const html = `
  <h2>Generate Json</h2>
  <p>This example uses structured generation to create and score assessment questions.</p>
  <form id="prompt">
    <label>
      <span class="label-text">Model:</span>
      <select name="modelId"></select>
    </label>
    <label>
      <span class="label-text">Enter your prompt:</span>
      <textarea name="prompt" required rows="6">
Write an assessment question about pizza. The assessment question should contain mathematical formulas.

LaTeX notation should be used for math expressions. LaTeX math delimiters, which are \\(...\\) for in-line math, and \\[...\\] for displayed equations must be used.
      </textarea>
    </label>
    <div class="form-bottom">
      <p id="prompt-feedback"></p>
      <button type="submit">Submit</button>
    </div>
  </form>
  <div class="question multiple-choice template">
    <p class="question-text"></p>
    <form class="question-form">
      <fieldset class="radio-group">
        <legend>Your answer</legend>
        <label class="radio-option">
          <input type="radio" name="answer" value="" />
          <span class="label-text">Your answer:</span>
        </label>
      </fieldset>
      <div class="form-bottom">
        <p class="feedback"></p>
        <button type="submit">Submit</button>
      </div>
    </form>
  </div>
  <div class="question open-response template">
    <p class="question-text"></p>
    <form class="question-form">
      <label>
        <span class="label-text">Your answer:</span>
        <textarea name="answer" rows="3"></textarea>
      </label>
      <div class="form-bottom">
        <p class="feedback"></p>
        <button type="submit">Submit</button>
      </div>
    </form>
  </div>
`;

export function loadGenerateJsonUI(container) {
  container.innerHTML = html;
  return mount();
}

let mounted = false;

function mount() {
  mounted = true;
  const { unload: unloadStyle } = loadStyle('./src/screens/generate-json.css');

  const promptForm = document.getElementById('prompt');
  const feedbackContainer = document.getElementById('prompt-feedback');

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
    console.log('Unmounting Generate JSON UI');
    unloadStyle();
    mounted = false;
  };

  async function handleSubmission(e) {
    e.preventDefault();
    if (isProcessing) return;

    const formData = new FormData(promptForm);
    const prompt = formData.get('prompt');
    const modelId = parseInt(formData.get('modelId'), 10);

    feedbackContainer.textContent = 'Please wait, processing...';
    feedbackContainer.classList.remove('error');

    console.log('Processing prompt:', prompt);

    try {
      const result = await generateText(modelId, {prompt}, assessmentQuestionJsonSchema);
      feedbackContainer.textContent = 'Done!';
      renderQuestion(modelId, result.question);
      console.log('Result:', result);
    } catch (error) {
      console.error('Error processing prompt:', error);
      feedbackContainer.textContent = 'An error occurred while processing your request.';
      feedbackContainer.classList.add('error');
    }
  }
}

function renderQuestion(modelId, question) {
  const isMultipleChoice = 'options' in question;

  const template = document.querySelector(
    isMultipleChoice ? '.question.multiple-choice.template' : '.question.open-response.template'
  );

  const existingQuestions = document.querySelectorAll('.question:not(.template)');
  existingQuestions.forEach(q => q.remove());

  const questionElement = template.cloneNode(true);
  questionElement.classList.remove('template');
  renderOutput(question.questionText, questionElement, '.question-text');

  const choiceAnswers = {};

  if (isMultipleChoice) {
    const form = questionElement.querySelector('.question-form');
    const optionEl = form.querySelector('.radio-option');
    const optionContainer = optionEl.parentNode;
    optionEl.remove();

    question.options.forEach((option, i) => {
      const thisOptionEl = optionEl.cloneNode(true);
      renderOutput(option, thisOptionEl, '.label-text');
      thisOptionEl.querySelector('input').value = `choice-${i}`;
      choiceAnswers[`choice-${i}`] = option;
      optionContainer.appendChild(thisOptionEl);
    });
  }

  template.insertAdjacentElement('afterend', questionElement);

  const questionForm = questionElement.querySelector('.question-form');
  questionForm.addEventListener('submit', handleSubmission);
  const feedbackContainer = questionElement.querySelector('.feedback');

  let isProcessing = false;

  async function handleSubmission(e) {
    e.preventDefault();
    if (isProcessing) return;

    const formData = new FormData(questionForm);
    const chosenAnswer = formData.get('answer');
    const answer = isMultipleChoice ? choiceAnswers[chosenAnswer] : chosenAnswer;

    feedbackContainer.textContent = 'Please wait, processing...';
    feedbackContainer.classList.remove('error');

    const prompt = `Given the following question definition: ${JSON.stringify(question)}, assess the answer: "${answer}"`;

    console.log('Processing prompt:', prompt);

    try {
      const result = await generateText(modelId, {prompt}, assessmentReviewJsonSchema);
      console.log('Result:', result);
      feedbackContainer.textContent = `Score given: ${(result.score * 100).toFixed(2)}% - ${result.feedback}`;
    } catch (error) {
      console.error('Error processing prompt:', error);
      feedbackContainer.textContent = 'An error occurred while processing your request.';
      feedbackContainer.classList.add('error');
    }
  }
}
