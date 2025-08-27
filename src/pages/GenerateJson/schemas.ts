

export const assessmentQuestionJsonSchema = {
  type: 'object',
  properties: {
    question: {
      type: 'object',
      description: 'A question to be answered, either open-ended or multiple-choice.',
      anyOf: [
        {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['open-response'],
              description: 'The type of question to generate.',
            },
            questionText: {
              type: 'string',
              description: 'The question to be answered.',
            },
          },
          required: ['questionText'],
          description: 'An open-ended question.',
        },
        {
          type: 'object',
          properties: {
            type: {
              type: 'string',
              enum: ['multiple-choice'],
              description: 'The type of question to generate.',
            },
            questionText: {
              type: 'string',
              description: 'The question to be answered.',
            },
            options: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: 'An array of options for the question.',
            },
          },
          required: ['questionText', 'options'],
          description: 'A multiple-choice question with options.',
        }
      ]
    }
  },
  required: ['question'],
};

export const assessmentReviewJsonSchema = {
  type: 'object',
  properties: {
    score: {
      type: 'number',
      minimum: 0,
      maximum: 1,
      description: 'A decimal value between 0 and 1 indicating how well the answer matches the expected answer.',
    },
    feedback: {
      type: 'string',
      description: 'Feedback on the provided answer, including what was correct or incorrect.',
    },
  },
  required: ['score', 'feedback'],
  description: 'An assessment of the provided answer.',
};
