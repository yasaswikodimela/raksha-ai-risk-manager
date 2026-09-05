const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function fetchWithTimeout(url, options = {}, timeout = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

async function request(endpoint, options = {}) {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new ApiError(`API Error: ${response.statusText}`, response.status);
    }

    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    throw error;
  }
}

export const api = {
  checkHealth: () => request('/health'),
  getMetrics: () => request('/api/metrics'),
  getTransactions: () => request('/api/transactions'),
  getTransactionDetails: (id) => request(`/api/transactions/${id}`),
  investigateTransaction: (id) => request(`/api/transactions/${id}/investigate`, { method: 'POST' }),
  getTransactionAudit: (id) => request(`/api/transactions/${id}/audit`),
};

