import { generateText } from '../ai.js';

const html = `
  <h2>Not Found :(</h2>

  <a href="#/">Go Home</a>
`;

export function load404UI(container) {
  container.innerHTML = html;
}
