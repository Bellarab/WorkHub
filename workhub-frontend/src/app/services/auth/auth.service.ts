import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfig } from '../../config/api.config';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  message: any;
}

interface RegisterResponse {
  access_token: string;
  refresh_token: string;
  message: any;
}
@Injectable({
  providedIn: 'root',
})
export class Auth {
  private baseUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfig) {
    this.baseUrl = this.apiConfig.baseUrl;
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, { email, password });
  }

  register(
    firstName: string,
    lastName: string,
    email: string,
    password: string
  ): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/register`, {
      firstName,
      lastName,
      email,
      password,
      role: 'USER',
    });
  }

  logout() {
    localStorage.removeItem('token');
    // Optionally, call your API to invalidate the token
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && token !== '';
  }
}
