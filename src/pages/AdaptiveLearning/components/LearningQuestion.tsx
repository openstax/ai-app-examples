import React, { useState } from 'react';
import { ModelOutput } from '@/components/ModelOutput';
import { LearningQuestion as Question } from '../schemas';
import { coerceNumber } from '@/utils/assertions';

interface LearningQuestionProps {
  question: Question;
  onAnswer: (answerIndex: number) => void;
  isLoading: boolean;
}

export const LearningQuestion: React.FC<LearningQuestionProps> = ({
  question,
  onAnswer,
  isLoading
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [showNext, setShowNext] = useState(false);

  const correctAnswerIndex = question.options.findIndex(option => option.isCorrect);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (hasSubmitted || selectedAnswer === null) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const answerValue = formData.get('answer');
    const answerIndex = coerceNumber(answerValue, new Error('Got non-number formData for answer'));

    setHasSubmitted(true);
    setFeedback('Checking your answer...');

    // Show immediate feedback based on correctness
    const isCorrect = answerIndex === correctAnswerIndex;
    setTimeout(() => {
      if (isCorrect) {
        setFeedback(`✓ Correct! ${question.explanation}`);
      } else {
        const correctAnswer = question.options[correctAnswerIndex];
        setFeedback(`✗ Incorrect. The correct answer was: "${correctAnswer.text}". ${question.explanation}`);
      }
      setShowNext(true);
    }, 500);
  };

  const handleNext = () => {
    if (selectedAnswer === null) return;
    onAnswer(selectedAnswer);
    // Reset state for next question
    setFeedback(null);
    setSelectedAnswer(null);
    setHasSubmitted(false);
    setShowNext(false);
  };

  const handleOptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasSubmitted) {
      setSelectedAnswer(Number(e.target.value));
    }
  };

  return (
    <div className="learning-question">
      <ModelOutput className="question-text" value={question.questionText} />

      <form className="question-form" onSubmit={handleSubmit}>
        <fieldset className="radio-group" disabled={hasSubmitted}>
          <legend>Choose your answer:</legend>
          {question.options.map((option, index) => (
            <label
              className={`radio-option ${
                hasSubmitted && option.isCorrect ? 'correct-answer' :
                hasSubmitted && index === selectedAnswer && !option.isCorrect ? 'incorrect-answer' :
                ''
              }`}
              key={index}
            >
              <input
                type="radio"
                name="answer"
                value={index}
                onChange={handleOptionChange}
                disabled={hasSubmitted}
                checked={selectedAnswer === index}
              />
              <ModelOutput className="label-text" value={option.text} />
            </label>
          ))}
        </fieldset>

        <div className="form-bottom">
          {feedback && (
            <div className="question-feedback">
              <ModelOutput value={feedback} className="feedback-text" />
            </div>
          )}
          {!hasSubmitted && (
            <button
              type="submit"
              disabled={selectedAnswer === null || isLoading}
              className="submit-answer-button"
            >
              Submit Answer
            </button>
          )}
          {showNext && (
            <button
              type="button"
              onClick={handleNext}
              className="next-question-button"
            >
              Next Question
            </button>
          )}
        </div>
      </form>
    </div>
  );
};