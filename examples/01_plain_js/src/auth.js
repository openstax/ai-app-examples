import { TOKEN_URL } from './config.js';

const search = location.search;
const params = new URLSearchParams(search);
const searchToken = params.get('token');

// If the token is present in the URL, store it in localStorage
if (searchToken) {
  localStorage.setItem('launch_token', searchToken);
  localStorage.removeItem('explicit_logout');

  // Immediately redirect to remove the token from the url
  params.delete('token');
  const redirectUrl = new URL(location.href);
  redirectUrl.search = params.toString();
  window.location.replace(redirectUrl.toString());
}

const explicitLogout = localStorage.getItem('explicit_logout') === 'true';
export const token = localStorage.getItem('launch_token') || null;

export const redirectToAuth = (forceRelogin = explicitLogout) => {
  const redirectUrl = new URL(TOKEN_URL);
  redirectUrl.searchParams.set('r', location.href);

  if (forceRelogin) {
    redirectUrl.searchParams.set('force_relogin', 'true');
  }

  window.location = redirectUrl.toString();
  document.body.style.display = 'none';
};

export const logout = () => {
  localStorage.removeItem('launch_token');
  localStorage.setItem('explicit_logout', 'true');
  redirectToAuth(true);
};
