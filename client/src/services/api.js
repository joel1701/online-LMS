// Every request to the Express API goes through this file.
const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const TOKEN_KEY = 'campuscore.token';

export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields || null;
  }
}

let onUnauthorized = null;

export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage can be unavailable (private mode); the session then lasts until reload.
  }
}

function toQuery(params) {
  if (!params) return '';
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return entries.length ? `?${new URLSearchParams(entries).toString()}` : '';
}

async function request(method, path, { body, params } = {}) {
  const headers = { Accept: 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}${toQuery(params)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'Could not reach the CampusCore server. Check that the API is running and try again.');
  }

  if (res.status === 204) return null;

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    if (res.status === 401 && path !== '/auth/login' && onUnauthorized) onUnauthorized();
    throw new ApiError(res.status, (data && data.message) || `Request failed (${res.status}).`, data && data.fields);
  }
  return data;
}

const get = (path, params) => request('GET', path, { params });
const post = (path, body) => request('POST', path, { body });
const put = (path, body) => request('PUT', path, { body });
const del = (path) => request('DELETE', path);

export const authApi = {
  login: (identifier, password) => post('/auth/login', { identifier, password }),
  me: () => get('/auth/me'),
};

export const dashboardApi = {
  get: () => get('/dashboard'),
  notifications: () => get('/notifications'),
  activity: (params) => get('/activity', params),
  departments: () => get('/departments'),
};

export const courseApi = {
  list: (params) => get('/courses', params),
  get: (id) => get(`/courses/${id}`),
  create: (data) => post('/courses', data),
  update: (id, data) => put(`/courses/${id}`, data),
  remove: (id) => del(`/courses/${id}`),
};

export const materialApi = {
  list: (params) => get('/materials', params),
  create: (data) => post('/materials', data),
  update: (id, data) => put(`/materials/${id}`, data),
  remove: (id) => del(`/materials/${id}`),
};

export const assignmentApi = {
  list: (params) => get('/assignments', params),
  get: (id) => get(`/assignments/${id}`),
  create: (data) => post('/assignments', data),
  update: (id, data) => put(`/assignments/${id}`, data),
  remove: (id) => del(`/assignments/${id}`),
};

export const submissionApi = {
  forAssignment: (assignmentId) => get('/submissions', { assignmentId }),
  submit: (data) => post('/submissions', data),
  grade: (id, data) => put(`/submissions/${id}/grade`, data),
};

export const testApi = {
  list: (params) => get('/tests', params),
  get: (id) => get(`/tests/${id}`),
  create: (data) => post('/tests', data),
  update: (id, data) => put(`/tests/${id}`, data),
  remove: (id) => del(`/tests/${id}`),
  start: (id) => post(`/tests/${id}/start`),
  saveProgress: (id, answers) => put(`/tests/${id}/progress`, { answers }),
  submit: (id, answers) => post(`/tests/${id}/submit`, { answers }),
  result: (id) => get(`/tests/${id}/result`),
  results: (id) => get(`/tests/${id}/results`),
};

export const gradeApi = {
  mine: (params) => get('/grades', params),
  course: (courseId) => get(`/grades/courses/${courseId}`),
};

export const userApi = {
  list: (params) => get('/users', params),
  create: (data) => post('/users', data),
  update: (id, data) => put(`/users/${id}`, data),
  remove: (id) => del(`/users/${id}`),
  updateProfile: (data) => put('/users/me', data),
};

export const announcementApi = {
  list: (params) => get('/announcements', params),
  create: (data) => post('/announcements', data),
  remove: (id) => del(`/announcements/${id}`),
};
