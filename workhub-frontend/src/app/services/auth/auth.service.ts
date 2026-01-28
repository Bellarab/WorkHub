import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfig } from '../../config/api.config';
import { User } from '../../Models/user/user-module';

interface LoginResponse {
  access_token: string;
  refresh_token: string;
  message: any;
  user: User;
}

interface RegisterResponse {
  access_token: string;
  refresh_token: string;
  message: any;
  user: User;
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
    localStorage.removeItem('user');
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  setUser(user: User) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return token !== null && token !== '';
  }

  getCurrentUserId(): number | null {
    // First try to get from stored user data
    const user = this.getUser();
    if (user?.id) {
      return user.id;
    }

    // Fallback to JWT token
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      console.log('Decoded JWT payload:', decodedPayload);

      const userId =
        decodedPayload.userId ||
        decodedPayload.id ||
        decodedPayload.sub ||
        decodedPayload.user_id ||
        null;

      console.log('Extracted userId:', userId);
      return userId ? Number(userId) : null;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }
}
