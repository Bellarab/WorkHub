import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectsService } from '../../services/projects/projects.service';
import { Project, Task, User } from '../../Models/user/user-module';
import { TaskBoard } from './task-board/task-board';
import { MemberList } from './member-list/member-list';
import { ProjectChat } from './project-chat/project-chat';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, TaskBoard, MemberList, ProjectChat],
  templateUrl: './project-details.html',
  styleUrl: './project-details.scss',
})
export class ProjectDetails implements OnInit {
  project: Project | null = null;
  activeTab: 'tasks' | 'members' | 'chat' = 'tasks';
  isLoading: boolean = true;
  errorMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService
  ) {}

  ngOnInit() {
    const projectId = this.route.snapshot.paramMap.get('id');
    if (projectId) {
      this.loadProject(projectId);
    }
  }

  loadProject(id: string) {
    this.isLoading = true;
    this.projectsService.getProjectById(id).subscribe({
      next: (project) => {
        this.project = project;
        // Add dummy tasks for testing if no tasks exist
        if (!this.project.tasks || this.project.tasks.length === 0) {
          this.project.tasks = this.getDummyTasks();
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading project:', err);
        this.errorMessage = 'Failed to load project details';
        this.isLoading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/projects']);
  }

  setActiveTab(tab: 'tasks' | 'members' | 'chat') {
    this.activeTab = tab;
  }

  onTaskStatusChanged(event: { task: Task; newStatus: string }) {
    const { task, newStatus } = event;

    // Show confirmation dialog
    const confirmMessage = `Are you sure you want to move "${task.title}" to ${this.getStatusLabel(
      newStatus
    )}?`;

    if (confirm(confirmMessage)) {
      task.status = newStatus;

      // Show success notification
      this.showNotification(`Task moved to ${this.getStatusLabel(newStatus)} successfully!`);

      // TODO: Update task on backend
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  }

  showNotification(message: string) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Show notification with animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    // Hide and remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  getDummyTasks(): Task[] {
    return [
      {
        id: '1',
        title: 'Design homepage mockup',
        assignedTo: 1,
        status: 'completed',
        dueDate: '2024-02-20',
        priority: 'high',
      },
      {
        id: '2',
        title: 'Implement responsive navigation',
        assignedTo: 2,
        status: 'in-progress',
        dueDate: '2024-02-25',
        priority: 'high',
      },
      {
        id: '3',
        title: 'Content migration',
        assignedTo: 3,
        status: 'todo',
        dueDate: '2024-03-01',
        priority: 'medium',
      },
      {
        id: '4',
        title: 'SEO optimization',
        assignedTo: 1,
        status: 'todo',
        dueDate: '2024-03-05',
        priority: 'medium',
      },
      {
        id: '5',
        title: 'Create product page components',
        assignedTo: 2,
        status: 'in-progress',
        dueDate: '2024-02-28',
        priority: 'high',
      },
      {
        id: '6',
        title: 'Set up analytics tracking',
        assignedTo: 3,
        status: 'todo',
        dueDate: '2024-03-10',
        priority: 'low',
      },
      {
        id: '7',
        title: 'Performance optimization',
        assignedTo: 1,
        status: 'completed',
        dueDate: '2024-02-15',
        priority: 'medium',
      },
      {
        id: '8',
        title: 'Accessibility improvements',
        assignedTo: 2,
        status: 'in-progress',
        dueDate: '2024-03-03',
        priority: 'high',
      },
    ];
  }
}
