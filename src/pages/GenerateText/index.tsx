import React from 'react';
import { generateText } from '@/utils/ai.ts';
import { mathWithMarkdown } from '@/utils/snippets.ts';
import { ModelOutput } from '@/components/ModelOutput.tsx';
import { MODELS } from '@/config.ts';
import { coerceNumber, assertString } from "@/utils/assertions";
import { ExecutionFeedback } from "@/components/ExecutionFeedback";
import './style.css';

const defaultValue = `write a haiku

${mathWithMarkdown}`;

export const GenerateText = () => {
  const { feedback, result, onSubmit } = usePromptState();

  return <>
    <h1>Generate Text</h1>
    <form onSubmit={onSubmit}>
      <label>
        <span className="label-text">Model:</span>
        <select name="modelId">
          {Object.entries(MODELS).map(([label, value]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="label-text">Enter your prompt:</span>
        <textarea name="prompt" required rows={6} defaultValue={defaultValue} />
      </label>
      <div className="form-bottom">
        <div className="prompt-feedback">{feedback}</div>
        <button type="submit">Submit</button>
      </div>
    </form>
    <div className="generate-text-output">
      <h2>Output:</h2>
      <ModelOutput className="result" value={result?.text ?? ''} />
      <ExecutionFeedback executionId={result?.executionId} />
    </div>
  </>;
}

const usePromptState = () => {
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{text: string, executionId: number} | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const modelId = coerceNumber(formData.get('modelId'), new Error('Got non-number formData for modelId'));
    const prompt = assertString(formData.get('prompt'), new Error('Got non-string formData for prompt'));

    setFeedback('Please wait, processing...');

    generateText(modelId, { prompt }).then(response => {
      console.log('AI Response:', response);
      setFeedback('Done!');
      setResult(response);
    }).catch((error: unknown) => {
      console.error('Error generating text:', error);
      setFeedback('An error occurred while generating text.');
    });
  }

  return { feedback, result, onSubmit };
};
