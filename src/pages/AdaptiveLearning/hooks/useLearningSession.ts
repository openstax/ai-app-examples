import React, { useState, useCallback, useRef } from 'react';
import { generateJson } from '@/utils/ai';
import { MODELS } from '@/config';
import { mathWithMarkdown } from '@/utils/snippets';
import {
  FoundationalTopics,
  LearningQuestion,
  NextSteps,
  foundationalTopicsJsonSchema,
  learningQuestionJsonSchema,
  nextStepsJsonSchema
} from '../schemas';
import { AssessmentProgress } from '../components/ProgressIndicator';

type LearningPhase =
  | 'TOPIC_INPUT'
  | 'GENERATING_FOUNDATIONS'
  | 'FOUNDATIONAL_TOPIC_ASSESSMENT'
  | 'GENERATING_MAIN_TOPIC'
  | 'MAIN_TOPIC_ASSESSMENT'
  | 'GENERATING_NEXT_STEPS'
  | 'NEXT_STEPS_SELECTION';

interface LearningSession {
  phase: LearningPhase;
  originalTopic: string;
  currentTopic: string;
  foundationalTopics: string[];
  currentFoundationalTopicIndex: number;
  nextStepTopics: string[];
  foundationalTopicsProgress: AssessmentProgress[];
  mainTopicProgress: AssessmentProgress;
  topicHistory: string[];
}

interface QuestionWithMetadata {
  question: LearningQuestion;
  executionId: number;
  isFoundational: boolean;
  foundationalTopicIndex?: number; // Which foundational topic (0, 1, or 2)
}

const defaultProgress = (): AssessmentProgress => ({
  recentAnswers: [],
  totalCorrect: 0,
  totalAnswered: 0,
  isPassed: false
});

export const useLearningSession = () => {
  const [session, setSession] = useState<LearningSession>({
    phase: 'TOPIC_INPUT',
    originalTopic: '',
    currentTopic: '',
    foundationalTopics: [],
    currentFoundationalTopicIndex: 0,
    nextStepTopics: [],
    foundationalTopicsProgress: [],
    mainTopicProgress: defaultProgress(),
    topicHistory: []
  });

  const [currentQuestion, setCurrentQuestion] = useState<LearningQuestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [questionQueue, setQuestionQueue] = useState<QuestionWithMetadata[]>([]);
  const [isGeneratingNext, setIsGeneratingNext] = useState(false);

  // Refs to manage cancellation and background tasks
  const abortControllerRef = useRef<AbortController | null>(null);
  const nextQuestionAbortRef = useRef<AbortController | null>(null);

  const cancelPendingRequests = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (nextQuestionAbortRef.current) {
      nextQuestionAbortRef.current.abort();
    }
  }, []);

  const updateProgress = useCallback((progress: AssessmentProgress, isCorrect: boolean): AssessmentProgress => {
    const newRecentAnswers = [...progress.recentAnswers, isCorrect].slice(-5);
    const newTotalCorrect = progress.totalCorrect + (isCorrect ? 1 : 0);
    const newTotalAnswered = progress.totalAnswered + 1;
    const recentCorrect = newRecentAnswers.filter(Boolean).length;
    const isPassed = recentCorrect >= 3 && newRecentAnswers.length >= 5;

    return {
      recentAnswers: newRecentAnswers,
      totalCorrect: newTotalCorrect,
      totalAnswered: newTotalAnswered,
      isPassed
    };
  }, []);

  const generateQuestionInBackground = useCallback(async (
    isFoundational: boolean,
    topicsOverride?: string[],
    foundationalTopicIndex?: number
  ) => {
    if (isGeneratingNext) return;

    try {
      setIsGeneratingNext(true);
      nextQuestionAbortRef.current = new AbortController();

      const modelId = Object.values(MODELS)[0];

      let topicsForContext: string[];
      let topicType: string;

      if (isFoundational) {
        if (topicsOverride) {
          topicsForContext = topicsOverride;
          topicType = 'foundational topics';
        } else {
          const currentIndex = foundationalTopicIndex ?? session.currentFoundationalTopicIndex;
          const currentFoundationalTopic = session.foundationalTopics[currentIndex];
          topicsForContext = currentFoundationalTopic ? [currentFoundationalTopic] : [];
          topicType = 'foundational topic';
        }
      } else {
        topicsForContext = topicsOverride ?? [session.currentTopic];
        topicType = 'main topic';
      }

      const prompt = `Generate a multiple choice question about one of these ${topicType}: ${topicsForContext.join(', ')}.

The question should:
- Test understanding of key concepts
- Have 3-5 clear answer options
- Include one definitively correct answer
- Provide a brief explanation

${mathWithMarkdown}`;

      const response = await generateJson<LearningQuestion>(
        modelId,
        { prompt },
        learningQuestionJsonSchema
      );

      const questionWithMetadata: QuestionWithMetadata = {
        question: response.data,
        executionId: response.executionId,
        isFoundational,
        foundationalTopicIndex: isFoundational ? (foundationalTopicIndex ?? session.currentFoundationalTopicIndex) : undefined
      };

      setQuestionQueue(prev => [...prev, questionWithMetadata]);
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error generating background question:', error);
      }
    } finally {
      setIsGeneratingNext(false);
      nextQuestionAbortRef.current = null;
    }
  }, [isGeneratingNext, session.foundationalTopics, session.currentFoundationalTopicIndex, session.currentTopic]);

  const getNextQuestion = useCallback((isFoundational: boolean, foundationalTopicIndex?: number): LearningQuestion | null => {
    let matchingQuestion;
    if (isFoundational) {
      const targetIndex = foundationalTopicIndex ?? session.currentFoundationalTopicIndex;
      matchingQuestion = questionQueue.find(q =>
        q.isFoundational === isFoundational &&
        q.foundationalTopicIndex === targetIndex
      );
    } else {
      matchingQuestion = questionQueue.find(q => q.isFoundational === isFoundational);
    }

    if (matchingQuestion) {
      setQuestionQueue(prev => prev.filter(q => q !== matchingQuestion));
      return matchingQuestion.question;
    }
    return null;
  }, [questionQueue, session.currentFoundationalTopicIndex]);

  const startLearning = useCallback(async (topic: string) => {
    cancelPendingRequests();
    setIsLoading(true);
    setSession(prev => ({
      ...prev,
      phase: 'GENERATING_FOUNDATIONS',
      originalTopic: topic,
      currentTopic: topic,
      foundationalTopics: [],
      currentFoundationalTopicIndex: 0,
      nextStepTopics: [],
      foundationalTopicsProgress: [],
      mainTopicProgress: defaultProgress()
    }));

    try {
      abortControllerRef.current = new AbortController();
      const modelId = Object.values(MODELS)[0];

      const prompt = `For the topic "${topic}", identify 3 foundational topics that a learner should understand before mastering "${topic}".

These should be prerequisite concepts that build toward understanding ${topic}.`;

      const response = await generateJson<FoundationalTopics>(
        modelId,
        { prompt },
        foundationalTopicsJsonSchema
      );

      setSession(prev => ({
        ...prev,
        phase: 'FOUNDATIONAL_TOPIC_ASSESSMENT',
        foundationalTopics: response.data.topics,
        currentFoundationalTopicIndex: 0,
        foundationalTopicsProgress: [defaultProgress(), defaultProgress(), defaultProgress()]
      }));

      // Generate first question for the first foundational topic
      void generateQuestionInBackground(true, [response.data.topics[0]], 0);
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error generating foundational topics:', error);
        // Reset to input phase on error
        setSession(prev => ({ ...prev, phase: 'TOPIC_INPUT' }));
      }
    } finally {
      setIsLoading(false);
    }
  }, [cancelPendingRequests, generateQuestionInBackground]);

  const answerQuestion = useCallback(async (answerIndex: number) => {
    if (!currentQuestion) return;

    const isFoundational = session.phase === 'FOUNDATIONAL_TOPIC_ASSESSMENT';
    const correctAnswerIndex = currentQuestion.options.findIndex(option => option.isCorrect);
    const isCorrect = answerIndex === correctAnswerIndex;

    // Update progress
    let newProgress: AssessmentProgress;
    if (isFoundational) {
      const currentProgress = session.foundationalTopicsProgress[session.currentFoundationalTopicIndex];
      newProgress = updateProgress(currentProgress, isCorrect);

      setSession(prev => ({
        ...prev,
        foundationalTopicsProgress: prev.foundationalTopicsProgress.map((progress, index) =>
          index === prev.currentFoundationalTopicIndex ? newProgress : progress
        )
      }));
    } else {
      const currentProgress = session.mainTopicProgress;
      newProgress = updateProgress(currentProgress, isCorrect);

      setSession(prev => ({
        ...prev,
        mainTopicProgress: newProgress
      }));
    }

    // Check if passed and should advance to next phase
    if (newProgress.isPassed) {
      if (isFoundational) {
        const nextFoundationalIndex = session.currentFoundationalTopicIndex + 1;

        if (nextFoundationalIndex < session.foundationalTopics.length) {
          // Move to next foundational topic
          setSession(prev => ({
            ...prev,
            currentFoundationalTopicIndex: nextFoundationalIndex
          }));
          setCurrentQuestion(null);

          // Clear stale questions from previous topic
          setQuestionQueue(prev => prev.filter(q =>
            !q.isFoundational || q.foundationalTopicIndex === nextFoundationalIndex
          ));

          // Generate questions for next foundational topic
          void generateQuestionInBackground(
            true,
            [session.foundationalTopics[nextFoundationalIndex]],
            nextFoundationalIndex
          );
        } else {
          // All foundational topics completed, move to main topic
          setIsLoading(true);
          setSession(prev => ({ ...prev, phase: 'GENERATING_MAIN_TOPIC' }));
          setCurrentQuestion(null);

          // Generate main topic questions with explicit topic
          void generateQuestionInBackground(false, [session.currentTopic]);

          setTimeout(() => {
            setSession(prev => ({ ...prev, phase: 'MAIN_TOPIC_ASSESSMENT' }));
            setIsLoading(false);
          }, 1000);
        }
      } else {
        // Generate next steps
        setIsLoading(true);
        setSession(prev => ({ ...prev, phase: 'GENERATING_NEXT_STEPS' }));
        setCurrentQuestion(null);

        try {
          const modelId = Object.values(MODELS)[0];
          const prompt = `The learner has mastered "${session.currentTopic}". Suggest 3 logical next topics they should learn to advance their knowledge further.

These should be more advanced topics that build upon their mastery of "${session.currentTopic}".`;

          const response = await generateJson<NextSteps>(
            modelId,
            { prompt },
            nextStepsJsonSchema
          );

          setSession(prev => ({
            ...prev,
            phase: 'NEXT_STEPS_SELECTION',
            nextStepTopics: response.data.topics
          }));
        } catch (error: unknown) {
          console.error('Error generating next steps:', error);
        } finally {
          setIsLoading(false);
        }
      }
    } else {
      // Continue with current assessment - get next question
      const nextQuestion = getNextQuestion(isFoundational, isFoundational ? session.currentFoundationalTopicIndex : undefined);
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
      } else {
        // Generate new question if queue is empty
        if (isFoundational) {
          void generateQuestionInBackground(true, undefined, session.currentFoundationalTopicIndex);
        } else {
          void generateQuestionInBackground(false);
        }
        setCurrentQuestion(null);
      }
    }
  }, [currentQuestion, session, updateProgress, generateQuestionInBackground, getNextQuestion]);

  const selectNextStep = useCallback((topic: string) => {
    setSession(prev => ({
      ...prev,
      phase: 'GENERATING_FOUNDATIONS',
      originalTopic: topic,
      currentTopic: topic,
      foundationalTopics: [],
      currentFoundationalTopicIndex: 0,
      nextStepTopics: [],
      foundationalTopicsProgress: [],
      mainTopicProgress: defaultProgress(),
      topicHistory: [...prev.topicHistory, prev.currentTopic].filter(Boolean)
    }));

    void startLearning(topic);
  }, [startLearning]);

  const resetSession = useCallback(() => {
    cancelPendingRequests();
    setSession({
      phase: 'TOPIC_INPUT',
      originalTopic: '',
      currentTopic: '',
      foundationalTopics: [],
      currentFoundationalTopicIndex: 0,
      nextStepTopics: [],
      foundationalTopicsProgress: [],
      mainTopicProgress: defaultProgress(),
      topicHistory: []
    });
    setCurrentQuestion(null);
    setQuestionQueue([]);
    setIsLoading(false);
  }, [cancelPendingRequests]);

  // Auto-load next question when phase changes and queue has questions
  React.useEffect(() => {
    if ((session.phase === 'FOUNDATIONAL_TOPIC_ASSESSMENT' || session.phase === 'MAIN_TOPIC_ASSESSMENT') &&
        !currentQuestion && questionQueue.length > 0) {
      const isFoundational = session.phase === 'FOUNDATIONAL_TOPIC_ASSESSMENT';
      const nextQuestion = getNextQuestion(isFoundational, isFoundational ? session.currentFoundationalTopicIndex : undefined);
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion);
      }
    }
  }, [session.phase, session.currentFoundationalTopicIndex, currentQuestion, questionQueue, getNextQuestion]);

  // Generate questions proactively
  React.useEffect(() => {
    if ((session.phase === 'FOUNDATIONAL_TOPIC_ASSESSMENT' || session.phase === 'MAIN_TOPIC_ASSESSMENT') &&
        !isGeneratingNext) {
      const isFoundational = session.phase === 'FOUNDATIONAL_TOPIC_ASSESSMENT';

      // Count relevant questions for current context
      let relevantQuestionsCount;
      if (isFoundational) {
        relevantQuestionsCount = questionQueue.filter(q =>
          q.isFoundational && q.foundationalTopicIndex === session.currentFoundationalTopicIndex
        ).length;
      } else {
        relevantQuestionsCount = questionQueue.filter(q => !q.isFoundational).length;
      }

      if (relevantQuestionsCount < 2) {
        if (isFoundational) {
          void generateQuestionInBackground(true, undefined, session.currentFoundationalTopicIndex);
        } else {
          void generateQuestionInBackground(false);
        }
      }
    }
  }, [session.phase, session.currentFoundationalTopicIndex, questionQueue, isGeneratingNext, generateQuestionInBackground]);

  return {
    phase: session.phase,
    currentTopic: session.currentTopic,
    topicHistory: session.topicHistory,
    foundationalTopics: session.foundationalTopics,
    currentFoundationalTopicIndex: session.currentFoundationalTopicIndex,
    nextStepTopics: session.nextStepTopics,
    foundationalTopicsProgress: session.foundationalTopicsProgress,
    mainTopicProgress: session.mainTopicProgress,
    currentQuestion,
    isLoading,
    startLearning,
    answerQuestion,
    selectNextStep,
    resetSession
  };
};