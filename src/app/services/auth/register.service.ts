import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../api/api.service';
import { API_ENDPOINTS } from '../api/api.config';

export interface RegisterBody {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  clinicName: string;
  phone: string;
  clinicType: string;
}

@Injectable({ providedIn: 'root' })
export class RegisterService {
  constructor(private readonly apiService: ApiService) {}

  register(body: RegisterBody): Observable<unknown> {
    return this.apiService.post(API_ENDPOINTS.register, body);
  }
}
