import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { User, Project } from '../../Models/user/user-module';
import { ProjectsService } from '../../services/projects/projects.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class ProjectsComponent implements OnInit {
  currentUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'ADMIN',
    avatar: 'https://i.pravatar.cc/150?img=1',
  };

  projects: Project[] = [];
  searchQuery: string = '';
  showCreateModal: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedColor: string = 'blue';

  constructor(private projectsService: ProjectsService, private router: Router) {}

  ngOnInit() {
    this.loadProjects();
  }

  loadProjects() {
    this.isLoading = true;
    this.errorMessage = '';
    this.projectsService.getProjects().subscribe({
      next: (projects) => {
        this.projects = projects;
        console.log('Projects loaded:', projects);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading projects:', err);
        if (err.status === 401) {
          this.errorMessage = 'You are not authenticated. Please login first.';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if backend is running.';
        } else {
          this.errorMessage = 'Failed to load projects. Please try again.';
        }
        this.isLoading = false;
      },
    });
  }

  get filteredProjects() {
    return this.projects.filter(
      (p) =>
        p.title?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.name?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  createProject(
    title: string,
    description: string,
    startDate: string,
    endDate: string,
    color: string
  ) {
    const newProject: Partial<Project> = {
      title,
      description,
      startDate,
      endDate: endDate || undefined,
      color,
    };

    this.isLoading = true;
    this.errorMessage = '';
    this.projectsService.createProject(newProject).subscribe({
      next: (project) => {
        this.projects = [project, ...this.projects];
        this.closeCreateModal();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error creating project:', err);
        this.errorMessage = 'Failed to create project. Please try again.';
        this.isLoading = false;
      },
    });
  }

  get activeProjects() {
    return this.filteredProjects.filter(
      (p) => !p.tasks || p.tasks.length === 0 || p.tasks.some((t) => t.status !== 'completed')
    );
  }

  get completedProjects() {
    return this.filteredProjects.filter(
      (p) => p.tasks && p.tasks.length > 0 && p.tasks.every((t) => t.status === 'completed')
    );
  }

  getTaskProgress(project: Project): number {
    if (!project.tasks || project.tasks.length === 0) return 0;
    const completed = project.tasks.filter((t) => t.status === 'completed').length;
    return Math.round((completed / project.tasks.length) * 100);
  }

  getStatusClass(project: Project): string {
    const progress = this.getTaskProgress(project);
    if (progress === 100) return 'completed';
    if (progress > 0) return 'active';
    return 'not-started';
  }

  getCompletedTasks(project: Project): number {
    if (!project.tasks) return 0;
    return project.tasks.filter((t) => t.status === 'completed').length;
  }

  getTotalTasks(project: Project): number {
    return project.tasks?.length || 0;
  }

  navigateToProject(projectId: string): void {
    this.router.navigate(['/projects', projectId]);
  }
}
