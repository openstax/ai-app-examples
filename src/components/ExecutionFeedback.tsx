import React from "react";
import { setFeedback } from "../utils/ai";
import { Feedback } from "./FeedbackComponent";

export const ExecutionFeedback = ({executionId}: {executionId: number | null | undefined}) => {

  if (!executionId) return null;

  const setRating = React.useCallback((rating: number) => {
    setFeedback(executionId, { rating, feedback: '' })
      .catch((err: unknown) => {
        console.error('Error setting feedback:', err);
      })
    ;
  }, [executionId]);

  const onClear = React.useCallback(() => {
    setFeedback(executionId, { rating: 0, feedback: '' })
      .catch((err: unknown) => {
        console.error('Error setting feedback:', err);
      })
    ;
  }, [executionId]);

  const setExecutionFeedback = React.useCallback((input: {feedback: string; rating: number}) => {
    setFeedback(executionId, input)
      .catch((err: unknown) => {
        console.error('Error setting feedback:', err);
      })
    ;
  }, [executionId]);

  return <Feedback
    setFeedback={setExecutionFeedback}
    setRating={setRating}
    onClear={onClear}
  />
};
