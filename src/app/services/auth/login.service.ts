import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { API_ENDPOINTS } from '../api/api.config';

export interface LoginBody {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  constructor(private readonly apiService: ApiService) {}

  login(body: LoginBody): Observable<unknown> {
    return this.apiService.post(API_ENDPOINTS.login, body);
  }
}
