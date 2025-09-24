import React from 'react';
import { ChatMessage } from "@/utils/ai";
import { MODELS } from "@/config";
import { mathWithMarkdown } from "@/utils/snippets";
import { ModelOutput } from "@/components/ModelOutput";
import { generateChat } from "@/utils/ai";
import { assertString, coerceNumber } from "@/utils/assertions";
import './style.css';

const defaultSystemPrompt = `You are a friendly AI chat bot.

${mathWithMarkdown}`;

export const Chat = () => {
  const { feedback, messages, onSubmit } = usePromptState();

  return <>
    <h2>Chat</h2>
    <ol className="chat-messages">
      {messages.map((messageItem, index) => (
        /* eslint-disable-next-line react-x/no-array-index-key */
        <li className={`message role-${messageItem.message.role}`} key={index}>
          <div className="message-content">
            <span className="message-role">{messageItem.message.role}</span>
            {messageItem.message.role === 'assistant'
              ? <ModelOutput className="message-text" value={messageItem.message.content.text} />
              : <span className="message-text">{messageItem.message.content.text}</span>}
          </div>
        </li>
      ))}
    </ol>
    <form onSubmit={onSubmit}>
      <label>
        <span className="label-text">Model:</span>
        <select name="modelId">
          {Object.entries(MODELS).map(([label, value]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="label-text">System Prompt:</span>
        <textarea name="system" required rows={6} defaultValue={defaultSystemPrompt} />
      </label>
      <label>
        <span className="label-text">Message:</span>
        <textarea name="prompt" required rows={6} defaultValue="Whats good today with my best AI friend?" />
      </label>
      <div className="form-bottom">
        <div className="feedback">{feedback}</div>
        <button type="submit">Submit</button>
      </div>
    </form>
  </>
};

const usePromptState = () => {
  const [feedback, setFeedback] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<{message: ChatMessage, executionId: string | null}[]>([]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const modelId = coerceNumber(formData.get('modelId'), new Error('Got non-number formData for modelId'));
    const system = assertString(formData.get('system'), new Error('Got non-string formData for system'));
    const prompt = assertString(formData.get('prompt'), new Error('Got non-string formData for prompt'));

    const promptTextarea = form.elements.namedItem('prompt') as HTMLTextAreaElement;
    promptTextarea.value = '';

    setFeedback('Please wait, processing...');
    const newMessages = [...messages, { message: { role: 'user', content: {text: prompt} }, executionId: null }];
    setMessages(newMessages);

    generateChat(modelId, { messages: newMessages.map(m => m.message), system })
      .then(response => {
        console.log('AI Response:', response);
        setMessages(previous => [...previous, { message: { role: 'assistant', content: {text: response.text} }, executionId: response.executionId }]);
        setFeedback('Done!');
      })
      .catch((error: unknown) => {
        console.error('Error generating text:', error);
        setFeedback('An error occurred while generating text.');
      });
  };

  return { feedback, messages, onSubmit };
};
