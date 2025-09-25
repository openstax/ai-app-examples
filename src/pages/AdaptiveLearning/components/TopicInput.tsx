import React from 'react';
import { assertString } from '@/utils/assertions';

interface TopicInputProps {
  onSubmit: (topic: string) => void;
  isLoading: boolean;
}

export const TopicInput: React.FC<TopicInputProps> = ({ onSubmit, isLoading }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const topic = assertString(formData.get('topic'), new Error('Got non-string formData for topic'));

    if (topic.trim()) {
      onSubmit(topic.trim());
    }
  };

  return (
    <div className="topic-input">
      <h2>What would you like to learn?</h2>
      <p>Enter any topic you're interested in learning about. I'll create a personalized learning path that builds from foundational knowledge.</p>

      <form onSubmit={handleSubmit}>
        <label>
          <span className="label-text">Learning Topic:</span>
          <input
            type="text"
            name="topic"
            required
            disabled={isLoading}
            placeholder="e.g., machine learning, quantum physics, React hooks..."
            className="topic-input-field"
          />
        </label>

        <div className="form-bottom">
          <button type="submit" disabled={isLoading} className="start-button">
            {isLoading ? 'Creating Learning Path...' : 'Start Learning'}
          </button>
        </div>
      </form>
    </div>
  );
};