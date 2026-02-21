import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { API_ENDPOINTS } from './api.config';
import { LoginService } from '../auth/login.service';

const PUBLIC_ENDPOINTS = [API_ENDPOINTS.login, API_ENDPOINTS.register];

export const authTokenInterceptor: HttpInterceptorFn = (request, next) => {
  const loginService = inject(LoginService);

  if (PUBLIC_ENDPOINTS.some((endpoint) => request.url.endsWith(endpoint))) {
    return next(request);
  }

  const token = loginService.getToken();

  if (!token) {
    return next(request);
  }

  const requestWithToken = request.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });

  return next(requestWithToken);
};
