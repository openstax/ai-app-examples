import { loadGenerateTextUI } from './screens/generate-text.js';
import { loadGenerateJsonUI } from './screens/generate-json.js';
import { loadChatUI } from './screens/chat.js';
import { loadHomeUI } from './screens/home.js';
import { load404UI } from './screens/notFound.js';
import { loadStyle } from './css.js';
import { token, logout, redirectToAuth } from './auth.js';
import { createHashHistory } from '../node_modules/history/history.production.min.js';

const router = (appContainer) => {
  let unmount = null;
  return (newLocation) => {
    if (typeof unmount === 'function') {
      unmount();
    }

    switch (newLocation.pathname) {
      case '/':
        unmount = loadHomeUI(appContainer);
        break;
      case '/generate-text':
        unmount = loadGenerateTextUI(appContainer);
        break;
      case '/generate-json':
        unmount = loadGenerateJsonUI(appContainer);
        break;
      case '/chat':
        unmount = loadChatUI(appContainer);
        break;
      default:
        unmount = load404UI(appContainer);
        break;
    }
  };
};

function appLoaded() {
  const appContainer = document.getElementById('app');
  const routeLocation = router(appContainer);

  if (!token) {
    redirectToAuth();
  }

  let history = createHashHistory();

  history.listen(({ location }) => routeLocation(location) );
  routeLocation(history.location);

  initLayout();

  console.log('App has loaded successfully');
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM fully loaded and parsed');
  appLoaded();
});

async function initLayout() {
  await loadStyle('./src/nav.css').loaded;
  const nav = document.getElementById('main-nav');
  nav.innerHTML = `
    <ul>
      <li><a href="#/">Home</a></li>
      <li><button id="logout-link">Logout</button></li>
    </ul>
  `;

  const logoutLink = document.getElementById('logout-link');
  logoutLink.addEventListener('click', e => {
    e.preventDefault();
    logout()
  });
}
console.log('hello from index.js');
