import { mockHttpAdapter } from '../lib/mockApi';

// Replaced Axios with a mock instance that routes to localStorage
const api = {
  get: (url, config) => mockHttpAdapter('get', url, null),
  post: (url, data, config) => mockHttpAdapter('post', url, data),
  put: (url, data, config) => mockHttpAdapter('put', url, data),
  delete: (url, config) => mockHttpAdapter('delete', url, null),
  interceptors: {
    request: { use: () => { } },
    response: { use: () => { } }
  }
};

export default api;