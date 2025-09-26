import { z } from 'zod'

// Difficulty levels for adaptive questioning
export const DifficultySchema = z.enum(['easy', 'medium', 'hard'])

// Schema for question definitions
export const QuestionSchema = z.object({
  id: z.string(),
  text: z.string().describe('The question text that students will see'),
  subject: z.string().describe('Subject area (e.g., mathematics, science, history)'),
  difficulty: DifficultySchema.describe('Current difficulty level'),
  expectedAnswer: z.string().describe('Example of a good answer for reference'),
  rubric: z.string().describe('Scoring rubric for the question')
})

// Schema for AI-generated feedback and next question
export const FeedbackSchema = z.object({
  score: z.number().min(0).max(5).describe('Score from 0-5 based on the rubric'),
  feedback: z.string().describe('Detailed feedback about the student response'),
  suggestions: z.string().optional().describe('Constructive suggestions for improvement'),
  followUpQuestion: z.string().describe('Next question text adapted to student performance'),
  adjustedDifficulty: DifficultySchema.describe('Difficulty level for the follow-up question based on score')
})

// JSON Schema exports for API calls
export const feedbackJsonSchema = z.toJSONSchema(FeedbackSchema)

// Derived TypeScript types
export type Question = z.infer<typeof QuestionSchema>
export type Feedback = z.infer<typeof FeedbackSchema>
export type Difficulty = z.infer<typeof DifficultySchema>