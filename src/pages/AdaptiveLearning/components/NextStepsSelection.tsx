import React from 'react';

interface NextStepsSelectionProps {
  currentTopic: string;
  nextSteps: string[];
  onSelectNext: (topic: string) => void;
  onRestart: () => void;
}

export const NextStepsSelection: React.FC<NextStepsSelectionProps> = ({
  currentTopic,
  nextSteps,
  onSelectNext,
  onRestart
}) => {
  return (
    <div className="next-steps-selection">
      <div className="completion-message">
        <h2>🎉 Excellent Work!</h2>
        <p>You've successfully mastered <strong>{currentTopic}</strong>!</p>
      </div>

      <div className="next-steps-content">
        <h3>Continue Your Learning Journey</h3>
        <p>Choose your next learning topic to build upon what you've learned:</p>

        <div className="next-steps-options">
          {nextSteps.map((topic, index) => (
            <button
              key={index}
              type="button"
              className="next-step-button"
              onClick={() => { onSelectNext(topic); }}
            >
              <div className="next-step-content">
                <span className="step-number">{index + 1}</span>
                <span className="step-topic">{topic}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="restart-option">
          <p>Or start fresh with a completely different topic:</p>
          <button type="button" className="restart-button" onClick={onRestart}>
            Start New Learning Path
          </button>
        </div>
      </div>
    </div>
  );
};