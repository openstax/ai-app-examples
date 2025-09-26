import { useState } from 'react'
import { Button, TextField } from 'react-aria-components'
import { ModelOutput } from '@/components/ModelOutput'
import { ExecutionFeedback } from '@/components/ExecutionFeedback'
import { type Question, type Feedback, feedbackJsonSchema } from './schemas'
import { MODELS } from '@/config'
import { API_URL } from "../../config";
import { authorizedFetch } from "../../utils/ai";
import { coerceNumber } from "../../utils/assertions";
import './style.css'

type QuestionState = 'answering' | 'reviewing' | 'loading'

interface QuestionSession {
  question: Question
  studentAnswer: string
  feedback?: Feedback
  executionId?: number
}

export default function AdaptiveQuestions() {
  const [currentSession, setCurrentSession] = useState<QuestionSession | null>(null)
  const [state, setState] = useState<QuestionState>('loading')
  const [studentAnswer, setStudentAnswer] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const startNewSession = async () => {
    setState('loading')
    try {
      const initialQuestion: Question = {
        id: '1',
        text: 'What is the slope of the line that passes through the points (2, 3) and (6, 11)?',
        subject: 'mathematics',
        difficulty: 'medium',
        expectedAnswer: 'The slope is 2. Using the slope formula: m = (y2 - y1) / (x2 - x1) = (11 - 3) / (6 - 2) = 8 / 4 = 2',
        rubric: 'Full credit (5): Correct slope calculation with formula shown. Partial credit (3-4): Correct answer with minor work shown. Minimal credit (1-2): Shows understanding but incorrect calculation. No credit (0): Incorrect or no response.'
      }

      setCurrentSession({ question: initialQuestion, studentAnswer: '' })
      setStudentAnswer('')
      setState('answering')
    } catch (error) {
      console.error('Error starting session:', error)
    }
  }

  const submitAnswer = async () => {
    if (!currentSession || !studentAnswer.trim()) return

    setIsSubmitting(true)
    try {
      const result = await submitAnswerTheGoodOne(MODELS['claude-3-7-sonnet'], currentSession, studentAnswer);

      setCurrentSession(prev => prev ? {
        ...prev,
        studentAnswer,
        feedback: result.data,
        executionId: result.executionId
      } : null)

      setState('reviewing')
    } catch (error) {
      console.error('Error submitting answer:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const moveToNextQuestion = () => {
    if (!currentSession?.feedback) return

    const nextQuestion: Question = {
      id: String(Date.now()),
      text: currentSession.feedback.followUpQuestion,
      subject: currentSession.question.subject,
      difficulty: currentSession.feedback.adjustedDifficulty,
      expectedAnswer: '', // This would typically come from a question bank
      rubric: currentSession.question.rubric // Reuse or adjust as needed
    }

    setCurrentSession({ question: nextQuestion, studentAnswer: '' })
    setStudentAnswer('')
    setState('answering')
  }

  return (
    <div className="adaptive-questions">
      <h1>Adaptive Questions</h1>
      <p className="description">
        Answer open-response questions and receive AI-powered feedback and follow-up questions
        that adapt to your performance level.
      </p>

      {!currentSession && (
        <div className="start-section">
          <Button onPress={startNewSession} className="primary-button">
            Start Practice Session
          </Button>
        </div>
      )}

      {currentSession && state === 'loading' && (
        <div className="loading">Loading next question...</div>
      )}

      {currentSession && state === 'answering' && (
        <div className="question-section">
          <div className="question-card">
            <div className="question-meta">
              <span className="subject">{currentSession.question.subject}</span>
              <span className="difficulty">{currentSession.question.difficulty}</span>
            </div>
            <div className="question-text">
              <ModelOutput value={currentSession.question.text} />
            </div>
          </div>

          <div className="answer-section">
            <TextField className="answer-field">
              <label>Your Answer:</label>
              <textarea
                value={studentAnswer}
                onChange={(e) => setStudentAnswer(e.target.value)}
                placeholder="Type your answer here..."
                rows={6}
              />
            </TextField>

            <Button
              onPress={submitAnswer}
              isDisabled={!studentAnswer.trim() || isSubmitting}
              className="primary-button"
            >
              {isSubmitting ? 'Analyzing...' : 'Submit Answer'}
            </Button>
          </div>
        </div>
      )}

      {currentSession && state === 'reviewing' && currentSession.feedback && (
        <div className="review-section">
          <div className="feedback-card">
            <div className="score-section">
              <h3>Score: {currentSession.feedback.score}/5</h3>
            </div>

            <div className="feedback-content">
              <h4>Feedback:</h4>
              <ModelOutput value={currentSession.feedback.feedback} />
            </div>

            {currentSession.feedback.suggestions && (
              <div className="suggestions">
                <h4>Suggestions for Improvement:</h4>
                <ModelOutput value={currentSession.feedback.suggestions} />
              </div>
            )}
          </div>

          {currentSession.executionId && (
            <ExecutionFeedback executionId={currentSession.executionId} />
          )}

          <div className="next-question-preview">
            <h4>Next Question Preview:</h4>
            <div className="next-question-meta">
              <span className="difficulty">Difficulty: {currentSession.feedback.adjustedDifficulty}</span>
            </div>
            <ModelOutput value={currentSession.feedback.followUpQuestion} />
          </div>

          <div className="action-buttons">
            <Button onPress={moveToNextQuestion} className="primary-button">
              Continue to Next Question
            </Button>
            <Button onPress={startNewSession} className="secondary-button">
              Start New Session
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export const submitAnswerTheGoodOne = async(modelId: number, currentSession: any, studentAnswer: any ) => {

  const promptUrl = `${API_URL}/prompts/26/execute?alias=live`;

  const fetchResponse = await authorizedFetch(promptUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      modelId,
      jsonSchema: feedbackJsonSchema, 
      input: {
        questionText: currentSession.question.text,
        subject: currentSession.question.subject,
        difficulty: currentSession.question.difficulty,
        expectedAnswer: currentSession.question.expectedAnswer,
        rubric: currentSession.question.rubric,
        studentAnswer
      }
    })
  });

  const executionId = coerceNumber(fetchResponse.headers.get('X-Execution-ID'),
    new Error('Missing or invalid X-Execution-ID header')
  );
  const response = await fetchResponse.json();

  console.log('Response from AI:', response);

  return {
    data: response.data as Feedback,
    executionId
  };
};
