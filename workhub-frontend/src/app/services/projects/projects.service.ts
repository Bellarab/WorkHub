import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Project, ProjectMember } from '../../Models/user/user-module';
import { ApiConfig } from '../../config/api.config';

export interface ProjectRequest {
  title: string;
  description: string;
  startDate?: string;
  endDate?: string;
  color?: string;
  status?: 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
}

export interface AssignMemberRequest {
  userId: number;
  role?: 'OWNER' | 'MEMBER' | 'MANAGER';
}

export interface ChangeMemberRoleRequest {
  userId: number;
  role: 'OWNER' | 'MEMBER' | 'MANAGER';
}

export interface MemberDto {
  id: {
    projectId: number;
    userId: number;
  };
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: 'USER' | 'ADMIN';
    avatar?: string;
  };
  role: 'OWNER' | 'MEMBER' | 'MANAGER';
}

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private baseUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfig) {
    this.baseUrl = `${this.apiConfig.baseUrl}/api/projects`;
  }

  // GET /api/projects - Get all projects (admin only)
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.baseUrl);
  }

  // GET /api/projects/user/{userId} - Get projects for a specific user
  getProjectsByUserId(userId: number): Observable<Project[]> {
    console.log('Fetching projects for userId:', userId);
    console.log('API URL:', `${this.baseUrl}/user/${userId}`);
    return this.http.get<Project[]>(`${this.baseUrl}/user/${userId}`);
  }

  // GET /api/projects/dashboard/user/{userId} - Get dashboard data for a user
  getDashboardData(userId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/dashboard/user/${userId}`);
  }

  // GET /api/projects/{id} - Get project by ID
  getProjectById(id: string): Observable<Project> {
    return this.http.get<Project>(`${this.baseUrl}/${id}`);
  }

  // POST /api/projects - Create new project
  createProject(req: ProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.baseUrl, req);
  }

  // PUT /api/projects/{id} - Update project
  updateProject(id: string, req: ProjectRequest): Observable<Project> {
    return this.http.put<Project>(`${this.baseUrl}/${id}`, req);
  }

  // PUT /api/projects/{id}/status - Change project status
  changeStatus(
    id: string,
    status: 'PLANNING' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
  ): Observable<Project> {
    const params = new HttpParams().set('status', status);
    return this.http.put<Project>(`${this.baseUrl}/${id}/status`, null, { params });
  }

  // DELETE /api/projects/{id} - Delete project
  deleteProject(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`, { responseType: 'text' as 'json' });
  }

  // POST /api/projects/{projectId}/members - Assign member to project
  assignMember(projectId: string, req: AssignMemberRequest): Observable<{ message: string }> {
    const url = `${this.baseUrl}/${projectId}/members`;
    console.log('ProjectsService - Assigning member:', { url, projectId, request: req });
    return this.http.post<{ message: string }>(url, req);
  }

  // PUT /api/projects/{projectId}/members/role - Change member role
  changeMemberRole(
    projectId: string,
    req: ChangeMemberRoleRequest
  ): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.baseUrl}/${projectId}/members/role`, req);
  }

  // DELETE /api/projects/{projectId}/members/{userId} - Remove member from project
  removeMember(projectId: string, userId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${projectId}/members/${userId}`);
  }

  // GET /api/projects/{projectId}/members - List all members of a project
  listMembers(projectId: string): Observable<MemberDto[]> {
    return this.http.get<MemberDto[]>(`${this.baseUrl}/${projectId}/members`);
  }

  // Get projects for the current user (default method)
  getProjects(): Observable<Project[]> {
    return this.getAllProjects();
  }
}
