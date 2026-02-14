import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { API_BASE_URL, API_DEFAULT_HEADERS } from './api.config';

type ApiHeaders = Record<string, string | string[]>;
type ApiParams =
  | HttpParams
  | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;

interface ApiRequestOptions {
  headers?: HttpHeaders | ApiHeaders;
  params?: ApiParams;
}

export interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export interface ParsedApiError {
  message: string;
  errors: Record<string, string[]>;
}

type ApiFieldMapper = Record<string, string> | ((field: string) => string);

interface ApiFormErrorOptions {
  fieldMapper?: ApiFieldMapper;
  errorKey?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private readonly http: HttpClient) {}

  get<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.get<T>(this.buildUrl(endpoint), this.withDefaultHeaders(options));
  }

  post<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.post<T>(this.buildUrl(endpoint), body, this.withDefaultHeaders(options));
  }

  put<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.put<T>(this.buildUrl(endpoint), body, this.withDefaultHeaders(options));
  }

  patch<T>(endpoint: string, body: unknown, options?: ApiRequestOptions): Observable<T> {
    return this.http.patch<T>(this.buildUrl(endpoint), body, this.withDefaultHeaders(options));
  }

  delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<T> {
    return this.http.delete<T>(this.buildUrl(endpoint), this.withDefaultHeaders(options));
  }

  parseApiError(errorResponse: HttpErrorResponse, fallbackMessage: string): ParsedApiError {
    const apiError = errorResponse.error as ApiErrorResponse | null;

    return {
      message: apiError?.message ?? fallbackMessage,
      errors: apiError?.errors ?? {}
    };
  }

  clearApiErrorsFromForm(form: FormGroup, errorKey = 'api'): void {
    Object.values(form.controls).forEach((control) => {
      if (!control.errors?.[errorKey]) {
        return;
      }

      const { [errorKey]: _, ...remainingErrors } = control.errors;
      control.setErrors(Object.keys(remainingErrors).length ? remainingErrors : null);
    });
  }

  applyApiErrorsToForm(
    form: FormGroup,
    apiErrors: Record<string, string[]>,
    options?: ApiFormErrorOptions
  ): void {
    const errorKey = options?.errorKey ?? 'api';

    Object.entries(apiErrors).forEach(([field, messages]) => {
      const controlName = this.mapApiField(field, options?.fieldMapper);
      const control = form.get(controlName);

      if (!control || messages.length === 0) {
        return;
      }

      control.setErrors({ ...(control.errors ?? {}), [errorKey]: messages[0] });
      control.markAsTouched();
    });
  }

  handleApiFormError(
    errorResponse: HttpErrorResponse,
    form: FormGroup,
    fallbackMessage: string,
    options?: ApiFormErrorOptions
  ): string {
    const parsedError = this.parseApiError(errorResponse, fallbackMessage);
    this.applyApiErrorsToForm(form, parsedError.errors, options);
    return parsedError.message;
  }

  private buildUrl(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${API_BASE_URL}${normalizedEndpoint}`;
  }

  private withDefaultHeaders(options?: ApiRequestOptions): ApiRequestOptions {
    return {
      ...options,
      headers: {
        ...API_DEFAULT_HEADERS,
        ...this.normalizeHeaders(options?.headers)
      }
    };
  }

  private normalizeHeaders(headers?: HttpHeaders | ApiHeaders): ApiHeaders {
    if (!headers) {
      return {};
    }

    if (headers instanceof HttpHeaders) {
      const normalized: ApiHeaders = {};

      headers.keys().forEach((key) => {
        const values = headers.getAll(key);

        if (!values || values.length === 0) {
          return;
        }

        normalized[key] = values.length === 1 ? values[0] : values;
      });

      return normalized;
    }

    return headers;
  }

  private mapApiField(field: string, mapper?: ApiFieldMapper): string {
    if (!mapper) {
      return field;
    }

    if (typeof mapper === 'function') {
      return mapper(field);
    }

    return mapper[field] ?? field;
  }
}
