import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task } from '../../Models/user/user-module';
import { ApiConfig } from '../../config/api.config';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private baseUrl: string;

  constructor(private http: HttpClient, private apiConfig: ApiConfig) {
    this.baseUrl = `${this.apiConfig.baseUrl}/api/task`;
  }

  /**
   * Create a new task
   * POST /api/task/create
   */
  createTask(
    projectId: number,
    title: string,
    assigneeUserId?: number,
    dueDate?: string,
    description?: string
  ): Observable<Task> {
    let params = new HttpParams().set('projectId', projectId.toString()).set('title', title);

    if (assigneeUserId !== undefined) {
      params = params.set('assigneeUserId', assigneeUserId.toString());
    }

    if (dueDate !== undefined && dueDate !== '') {
      params = params.set('dueDate', dueDate);
    }

    if (description !== undefined && description !== '') {
      params = params.set('description', description);
    }

    return this.http.post<Task>(`${this.baseUrl}/create`, null, { params });
  }

  /**
   * Get all tasks for a project
   * GET /api/task/project/{projectId}
   */
  getTasksByProject(projectId: number): Observable<Task[]> {
    return this.http.get<Task[]>(`${this.baseUrl}/project/${projectId}`);
  }

  /**
   * Get tasks assigned to a specific member
   * GET /api/task/assigned
   */
  getTasksAssignedToMember(projectId: number, userId: number): Observable<Task[]> {
    const params = new HttpParams()
      .set('projectId', projectId.toString())
      .set('userId', userId.toString());

    return this.http.get<Task[]>(`${this.baseUrl}/assigned`, { params });
  }

  /**
   * Update a task
   * PUT /api/task/{taskId}
   */
  updateTask(
    taskId: number,
    updates: {
      title?: string;
      description?: string;
      status?: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
      assigneeUserId?: number;
      dueDate?: string;
    }
  ): Observable<Task> {
    let params = new HttpParams();

    if (updates.title !== undefined) {
      params = params.set('title', updates.title);
    }
    if (updates.description !== undefined) {
      params = params.set('description', updates.description);
    }
    if (updates.status !== undefined) {
      params = params.set('status', updates.status);
    }
    if (updates.assigneeUserId !== undefined) {
      params = params.set('assigneeUserId', updates.assigneeUserId.toString());
    }
    if (updates.dueDate !== undefined && updates.dueDate !== '') {
      params = params.set('dueDate', updates.dueDate);
    }

    return this.http.put<Task>(`${this.baseUrl}/${taskId}`, null, { params });
  }

  /**
   * Delete a task
   * DELETE /api/task/{taskId}
   */
  deleteTask(taskId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/${taskId}`, {
      responseType: 'text',
    });
  }
}
