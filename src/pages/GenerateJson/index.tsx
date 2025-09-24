import React from 'react';
import { generateJson } from '@/utils/ai.ts';
import { mathWithMarkdown } from '@/utils/snippets.ts';
import { MODELS } from '@/config.ts';
import { assertString, coerceNumber } from "@/utils/assertions";
import { Question, AssessmentQuestionPayload } from "./types";
import { assessmentQuestionJsonSchema } from "./schemas";
import { GeneratedQuestion } from "./components/GeneratedQuestion";
import './style.css';

const defaultValue = `Write an assessment question about pizza. The assessment question should contain mathematical formulas.

${mathWithMarkdown}`;

export const GenerateJson = () => {
  const {feedback, result, onSubmit} = usePromptState();

  return <>
    <h1>Generate Json</h1>
    <p>This example uses structured generation to create and score assessment questions.</p>
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
    {result && <GeneratedQuestion {...result} />}
  </>;
};

const usePromptState = () => {
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<{question: Question; modelId: number; executionId: number} | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const modelId = coerceNumber(formData.get('modelId'), new Error('Got non-number formData for modelId'));
    const prompt = assertString(formData.get('prompt'), new Error('Got non-string formData for prompt'));

    setFeedback('Please wait, processing...');

    generateJson<AssessmentQuestionPayload>(modelId, {prompt}, assessmentQuestionJsonSchema)
      .then(response => {
        console.log('AI Response:', response);
        setResult({question: response.data.question, modelId, executionId: response.executionId});
        setFeedback('Done!');
      })
      .catch((error: unknown) => {
        console.error('Error generating text:', error);
        setFeedback('An error occurred while generating text.');
      });
    ;
  }

  return {feedback, result, onSubmit};
};
