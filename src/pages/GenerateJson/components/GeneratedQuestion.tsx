import React from 'react';
import { generateJson } from '@/utils/ai.ts';
import { AssessmentReview, Question } from "../types";
import { assessmentReviewJsonSchema } from "../schemas";
import { mathWithMarkdown } from '@/utils/snippets.ts';
import { ModelOutput } from "@/components/ModelOutput";
import { assertString } from "@/utils/assertions";

export const GeneratedQuestion = ({question, modelId}: {question: Question, modelId: number}) => {
  const {feedback, onSubmit} = usePromptState(question, modelId);

  return <div className="generated-question">
    <ModelOutput className="question-text" value={question.questionText} />
    <form className="question-form" onSubmit={onSubmit}>
      {question.type === 'multiple-choice' &&
        <fieldset className="radio-group">
          {question.options.map((option, index) => (
            /* eslint-disable-next-line react-x/no-array-index-key */
            <label className="radio-option" key={index}>
              <input type="radio" name="answer" value={option} />
              <ModelOutput className="label-text" value={option} />
            </label>
          ))}
        </fieldset>
      }
      {question.type === 'open-response' &&
        <label>
          <span className="label-text">Your answer:</span>
          <textarea name="answer" rows={3}></textarea>
        </label>
      }
      <div className="form-bottom">
        <ModelOutput className="feedback" value={feedback ?? ''} />
        <button type="submit">Submit</button>
      </div>
    </form>
  </div>;
};

const usePromptState = (question: Question, modelId: number) => {
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const answer = assertString(formData.get('answer'), new Error('Got non-string formData for answer'));

    setFeedback('Please wait, processing...');

    const prompt = `Given the following question definition: ${JSON.stringify(question)}, assess the answer: "${answer}"

${mathWithMarkdown}`;

    generateJson<AssessmentReview>(modelId, {prompt}, assessmentReviewJsonSchema)
      .then(response => {
        console.log('AI Response:', response);
        setFeedback(`Score given: ${(response.score * 100).toFixed(2)}% - ${response.feedback}`);
      })
      .catch((error: unknown) => {
        console.error('Error generating text:', error);
        setFeedback('An error occurred while generating text.');
      })
    ;
  };

  return {feedback, onSubmit};
};
