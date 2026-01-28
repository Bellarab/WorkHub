import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  username?: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  name?: string;
}

export interface ProjectMember {
  id: {
    projectId: number;
    userId: number;
  };
  user: User;
  role: 'OWNER' | 'MEMBER' | 'MANAGER';
}

export interface Task {
  id: number;
  title: string;
  assignedTo: ProjectMember;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  dueDate?: string;
  priority?: string;
  description?: string;
}

export interface Project {
  id: string;
  title: string;
  name?: string;
  description: string;
  color?: string;
  status?: 'PLANNED' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED';
  members?: ProjectMember[];
  tasks?: Task[];
  createdBy?: number;
  createdAt: string;
  startDate?: string;
  endDate?: string;
}
@NgModule({
  declarations: [],
  imports: [CommonModule],
})
export class UserModule {}
