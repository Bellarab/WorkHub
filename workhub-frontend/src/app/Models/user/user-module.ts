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
  role: 'OWNER' | 'MEMBER' | 'ADMIN';
}

export interface Task {
  id: string;
  title: string;
  assignedTo: number;
  status: string;
  dueDate: string;
  priority: string;
}

export interface Project {
  id: string;
  title: string;
  name?: string;
  description: string;
  color?: string;
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
