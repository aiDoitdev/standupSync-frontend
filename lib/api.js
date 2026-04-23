const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function apiCall(endpoint, method = 'GET', body = null, { retries = 2, retryDelay = 800 } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelay * attempt));
    }
    try {
      const res = await fetch(`${API_URL}${endpoint}`, config);

      // Only retry on 5xx server errors and network failures, not on 4xx client errors
      if (res.status >= 500 && attempt < retries) {
        lastError = new Error(`Server error (${res.status})`);
        continue;
      }

      const data = await res.json();

      if (!res.ok) {
        const detail = data.detail;
        const msg =
          typeof detail === 'string'
            ? detail
            : detail?.message || JSON.stringify(detail) || 'Something went wrong';
        throw new Error(msg);
      }
      return data;
    } catch (err) {
      // Retry on network-level failures (TypeError: Failed to fetch / NetworkError)
      if (err instanceof TypeError && attempt < retries) {
        lastError = err;
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

export function saveAuth(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUser() {
  if (typeof window === 'undefined') return null;
  const u = localStorage.getItem('user');
  return u ? JSON.parse(u) : null;
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
}
