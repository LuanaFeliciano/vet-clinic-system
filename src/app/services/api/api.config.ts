export const API_BASE_URL = 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  login: '/login',
  register: '/register',
  logout: '/logout',
  me: '/user',
  resendVerificationEmail: '/email/verification-notification'
} as const;

export const API_DEFAULT_HEADERS = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
} as const;
