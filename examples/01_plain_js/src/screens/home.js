import { loadStyle } from '../css.js';

const html = `
  <nav class="home-nav">
    <ul>
      <li><a href="#/generate-text">Generate Text</a></li>
      <li><a href="#/generate-json">Generate Structured Data</a></li>
      <li><a href="#/chat">Chat</a></li>
    </ul>
  <nav>
`;

export function loadHomeUI(container) {
  container.innerHTML = html;

  const { unload: unloadStyle } = loadStyle('./src/screens/home.css');

  return () => {
    console.log('Unmounting Home UI');
    unloadStyle();
  };
}
