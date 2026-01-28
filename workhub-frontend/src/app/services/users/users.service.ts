import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../../Models/user/user-module';
import { ApiConfig } from '../../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private baseUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfig) {
    this.baseUrl = `${this.apiConfig.baseUrl}/api/users`;
  }

  // Search users by name or email
  searchUsers(query: string): Observable<User[]> {
    const params = new HttpParams().set('query', query);
    const url = `${this.baseUrl}/search`;
    console.log('UsersService - Searching users:', { query, url, params: params.toString() });
    return this.http.get<User[]>(url, { params });
  }

  // Get all users
  getAllUsers(): Observable<User[]> {
    console.log('UsersService - Getting all users from:', this.baseUrl);
    return this.http.get<User[]>(this.baseUrl);
  }
}
