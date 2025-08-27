
export interface OpenResponseQuestion {
  type: 'open-response';
  questionText: string;
}

export interface MultipleChoiceQuestion {
  type: 'multiple-choice';
  questionText: string;
  options: string[];
}

export type Question = OpenResponseQuestion | MultipleChoiceQuestion;

export interface AssessmentQuestionPayload {
  question: Question;
}

export interface AssessmentReview {
  score: number;
  feedback: string;
}
