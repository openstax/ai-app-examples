import { TopicInput } from './components/TopicInput';
import { LearningQuestion } from './components/LearningQuestion';
import { ProgressIndicator } from './components/ProgressIndicator';
import { NextStepsSelection } from './components/NextStepsSelection';
import { LearningPath } from './components/LearningPath';
import { useLearningSession } from './hooks/useLearningSession';
import './style.css';

export const AdaptiveLearning = () => {
  const {
    phase,
    currentTopic,
    topicHistory,
    foundationalTopics,
    currentFoundationalTopicIndex,
    nextStepTopics,
    foundationalTopicsProgress,
    mainTopicProgress,
    currentQuestion,
    isLoading,
    startLearning,
    answerQuestion,
    selectNextStep,
    resetSession
  } = useLearningSession();

  return (
    <div className="adaptive-learning">
      <h1>Adaptive Learning</h1>
      <p>Master topics through adaptive assessment that builds from foundational knowledge.</p>

      <LearningPath topicHistory={topicHistory} currentTopic={currentTopic} />

      {phase === 'TOPIC_INPUT' && (
        <TopicInput onSubmit={(topic) => { void startLearning(topic); }} isLoading={isLoading} />
      )}

      {(phase === 'GENERATING_FOUNDATIONS' || phase === 'GENERATING_MAIN_TOPIC') && (
        <div className="loading-state">
          <p>Preparing your learning path...</p>
        </div>
      )}

      {phase === 'FOUNDATIONAL_TOPIC_ASSESSMENT' && (
        <div className="assessment-phase">
          <h2>Foundational Knowledge Assessment</h2>
          <p>Topic {currentFoundationalTopicIndex + 1} of {foundationalTopics.length}: <strong>{foundationalTopics[currentFoundationalTopicIndex]}</strong></p>

          <div className="foundational-topics-overview">
            <h3>Progress Overview:</h3>
            <ul className="topic-progress-list">
              {foundationalTopics.map((topic, index) => (
                <li key={index} className={`topic-progress-item ${
                  index < currentFoundationalTopicIndex ? 'completed' :
                  index === currentFoundationalTopicIndex ? 'current' : 'pending'
                }`}>
                  {index < currentFoundationalTopicIndex && '✓ '}
                  {index === currentFoundationalTopicIndex && '→ '}
                  {topic}
                  {index < foundationalTopicsProgress.length && foundationalTopicsProgress[index] && (
                    <span className="topic-score">
                      ({foundationalTopicsProgress[index].totalCorrect}/{foundationalTopicsProgress[index].totalAnswered})
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {foundationalTopicsProgress[currentFoundationalTopicIndex] && (
            <ProgressIndicator progress={foundationalTopicsProgress[currentFoundationalTopicIndex]} />
          )}

          {currentQuestion ? (
            <LearningQuestion
              question={currentQuestion}
              onAnswer={(answerIndex) => { void answerQuestion(answerIndex); }}
              isLoading={isLoading}
            />
          ) : (
            <div className="question-loading">
              <div className="question-loading-content">
                <div className="loading-spinner"></div>
                <p>Generating your first question...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 'MAIN_TOPIC_ASSESSMENT' && (
        <div className="assessment-phase">
          <h2>Main Topic Assessment</h2>
          <p>Great! Now let's assess your understanding of: <strong>{currentTopic}</strong></p>
          <ProgressIndicator progress={mainTopicProgress} />
          {currentQuestion ? (
            <LearningQuestion
              question={currentQuestion}
              onAnswer={(answerIndex) => { void answerQuestion(answerIndex); }}
              isLoading={isLoading}
            />
          ) : (
            <div className="question-loading">
              <div className="question-loading-content">
                <div className="loading-spinner"></div>
                <p>Generating your first question...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === 'GENERATING_NEXT_STEPS' && (
        <div className="loading-state">
          <p>Excellent work! Finding your next learning opportunities...</p>
        </div>
      )}

      {phase === 'NEXT_STEPS_SELECTION' && (
        <NextStepsSelection
          currentTopic={currentTopic}
          nextSteps={nextStepTopics}
          onSelectNext={selectNextStep}
          onRestart={resetSession}
        />
      )}
    </div>
  );
};