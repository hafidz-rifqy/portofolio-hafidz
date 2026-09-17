// API wrapper for all fetch calls

const API_BASE = '/api';

async function request(url, options = {}) {
  try {
    const isFormData = options.body instanceof FormData;
    const headers = { ...options.headers };
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || 'Request failed');
    }

    return await response.json();
  } catch (err) {
    console.error(`API Error [${url}]:`, err.message);
    throw err;
  }
}

export const api = {
  // Public
  getProfile: () => request('/profile'),
  getPortfolio: (category) => request(category ? `/portfolio?category=${category}` : '/portfolio'),
  getExperience: () => request('/experience'),
  getSocial: () => request('/social'),
  getComments: () => request('/comments'),
  postComment: (data) => request('/comments', { method: 'POST', body: data instanceof FormData ? data : JSON.stringify(data) }),
  postContact: (data) => request('/contact', { method: 'POST', body: JSON.stringify(data) }),
};
