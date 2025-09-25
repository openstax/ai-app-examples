import * as z from "zod";

const openResponseQuestionSchema = z.object({
  type: z.literal('open-response')
    .describe('The type of question to generate.'),
  questionText: z.string()
    .describe('The question to be answered.'),
}).describe('An open-ended question.');

const multipleChoiceQuestionSchema = z.object({
  type: z.literal('multiple-choice').describe('The type of question to generate.'),
  questionText: z.string().describe('The question to be answered.'),
  options: z.array(z.string()).describe('An array of options for the question.'),
}).describe('A multiple-choice question with options.');

const assessmentQuestionSchema = z.object({
  question: z.union([
    openResponseQuestionSchema,
    multipleChoiceQuestionSchema
  ]).describe('A question to be answered, either open-ended or multiple-choice.'),
});

export type OpenResponseQuestion = z.infer<typeof openResponseQuestionSchema>;
export type MultipleChoiceQuestion = z.infer<typeof multipleChoiceQuestionSchema>;
export type AssessmentQuestionPayload = z.infer<typeof assessmentQuestionSchema>;
export type Question = OpenResponseQuestion | MultipleChoiceQuestion;

export const assessmentQuestionJsonSchema = z.toJSONSchema(assessmentQuestionSchema);

const assessmentReviewSchema = z.object({
  score: z.number().min(0).max(1)
    .describe('A decimal value between 0 and 1 indicating how well the answer matches the expected answer.'),
  feedback: z.string()
    .describe('Feedback on the provided answer, including what was correct or incorrect.'),
}).describe('An assessment of the provided answer.');

export type AssessmentReview = z.infer<typeof assessmentReviewSchema>;
export const assessmentReviewJsonSchema = z.toJSONSchema(assessmentReviewSchema);
