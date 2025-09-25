import React from 'react';

interface LearningPathProps {
  topicHistory: string[];
  currentTopic: string;
}

export const LearningPath: React.FC<LearningPathProps> = ({ topicHistory, currentTopic }) => {
  if (topicHistory.length === 0 && !currentTopic) {
    return null;
  }

  return (
    <div className="learning-path">
      <div className="breadcrumb">
        {topicHistory.map((topic, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="breadcrumb-separator">→</span>}
            <span className="breadcrumb-item">{topic}</span>
          </React.Fragment>
        ))}

        {currentTopic && topicHistory.length > 0 && (
          <>
            <span className="breadcrumb-separator">→</span>
            <span className="current-topic">{currentTopic}</span>
          </>
        )}

        {currentTopic && topicHistory.length === 0 && (
          <span className="current-topic">{currentTopic}</span>
        )}
      </div>
    </div>
  );
};