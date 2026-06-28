const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export function isGoogleAuthEnabled() {
  return Boolean(GOOGLE_CLIENT_ID);
}

function loadGoogleScript() {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existing = document.querySelector('script[data-traviona-google-auth]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Sign-In')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.travionaGoogleAuth = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Sign-In'));
    document.head.appendChild(script);
  });
}

export function requestGoogleAccessToken() {
  if (!GOOGLE_CLIENT_ID) {
    return Promise.reject(new Error('Google Sign-In is not configured'));
  }

  return loadGoogleScript().then(
    () =>
      new Promise((resolve, reject) => {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'openid email profile',
          callback: (response) => {
            if (response.error) {
              reject(new Error(response.error_description || response.error));
              return;
            }
            if (!response.access_token) {
              reject(new Error('Google did not return an access token'));
              return;
            }
            resolve(response.access_token);
          },
        });

        client.requestAccessToken({ prompt: 'select_account' });
      }),
  );
}
