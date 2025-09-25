import React from 'react';

export interface AssessmentProgress {
  recentAnswers: boolean[]; // last 5 answers (true = correct)
  totalCorrect: number;
  totalAnswered: number;
  isPassed: boolean;
}

interface ProgressIndicatorProps {
  progress: AssessmentProgress;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ progress }) => {
  const { recentAnswers, totalCorrect, totalAnswered, isPassed } = progress;

  const recentCorrect = recentAnswers.filter(Boolean).length;

  const progressClass = isPassed ? 'progress-passed' :
    recentCorrect >= 3 ? 'progress-close' : 'progress-normal';

  return (
    <div className={`progress-indicator ${progressClass}`}>
      <div className="progress-header">
        <h3>Assessment Progress</h3>
        {isPassed && <span className="passed-badge">✓ Passed</span>}
      </div>

      <div className="progress-stats">
        <div className="stat-item">
          <span className="stat-label">Recent Progress:</span>
          <span className="stat-value">{recentCorrect}/5 correct</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Total Progress:</span>
          <span className="stat-value">{totalCorrect}/{totalAnswered} correct</span>
        </div>
      </div>

      <div className="progress-visual">
        <div className="progress-label">Last 5 answers (need 3 correct to advance):</div>
        <div className="answer-indicators">
          {Array.from({ length: 5 }, (_, index) => {
            const hasAnswer = index < recentAnswers.length;
            const isCorrect = hasAnswer && recentAnswers[index];

            return (
              <div
                key={index}
                className={`answer-indicator ${
                  !hasAnswer ? 'pending' : isCorrect ? 'correct' : 'incorrect'
                }`}
                title={
                  !hasAnswer ? 'Not answered yet' :
                  isCorrect ? 'Correct' : 'Incorrect'
                }
              >
                {!hasAnswer ? '?' : isCorrect ? '✓' : '✗'}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};