import * as z from "zod";

const foundationalTopicsSchema = z.object({
  topics: z.array(z.string()).length(3)
    .describe('Three foundational topics that should be mastered before learning the main topic'),
}).describe('Foundational topics needed to understand the main learning topic');

const questionOptionSchema = z.object({
  text: z.string().describe('The option text'),
  isCorrect: z.boolean().describe('Whether this option is the correct answer')
}).describe('A single answer option with correctness flag');

const learningQuestionSchema = z.object({
  questionText: z.string()
    .describe('The question text with clear, concise wording'),
  options: z.array(questionOptionSchema).min(3).max(5)
    .describe('Answer options for the multiple choice question. Exactly one option should have isCorrect: true'),
  explanation: z.string()
    .describe('Brief explanation of why the correct answer is right'),
}).describe('A multiple choice learning question with marked correct answer');

const nextStepsSchema = z.object({
  topics: z.array(z.string()).length(3)
    .describe('Three advanced topics the user should learn next after mastering this topic'),
}).describe('Next step topics for continued learning progression');

export type FoundationalTopics = z.infer<typeof foundationalTopicsSchema>;
export type QuestionOption = z.infer<typeof questionOptionSchema>;
export type LearningQuestion = z.infer<typeof learningQuestionSchema>;
export type NextSteps = z.infer<typeof nextStepsSchema>;

export const foundationalTopicsJsonSchema = z.toJSONSchema(foundationalTopicsSchema);
export const learningQuestionJsonSchema = z.toJSONSchema(learningQuestionSchema);
export const nextStepsJsonSchema = z.toJSONSchema(nextStepsSchema);