import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectsService, MemberDto } from '../../services/projects/projects.service';
import { TasksService } from '../../services/tasks/tasks.service';
import { UsersService } from '../../services/users/users.service';
import { Auth } from '../../services/auth/auth.service';
import { Project, Task, User, ProjectMember } from '../../Models/user/user-module';
import { TaskBoard } from './task-board/task-board';
import { MemberList } from './member-list/member-list';
import { ProjectChat } from './project-chat/project-chat';

@Component({
  selector: 'app-project-details',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskBoard, MemberList, ProjectChat],
  templateUrl: './project-details.html',
  styleUrl: './project-details.scss',
})
export class ProjectDetails implements OnInit {
  project: Project | null = null;
  members: ProjectMember[] = [];
  filteredTasks: Task[] = [];
  currentUserId: number | null = null;
  currentUserRole: 'OWNER' | 'MANAGER' | 'MEMBER' | null = null;
  activeTab: 'tasks' | 'members' | 'chat' | 'settings' = 'tasks';
  isLoading: boolean = true;
  errorMessage: string = '';

  // Invite Member Modal
  showInviteModal = false;
  searchQuery = '';
  searchResults: User[] = [];
  selectedUsers: User[] = [];
  isSearching = false;
  searchTimeout: any = null;

  // Delete Project Modal
  showDeleteModal = false;
  deleteConfirmationText = '';
  isDeletingProject = false;

  // Project Settings
  editedProject: any = {};
  isUpdatingProject = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectsService: ProjectsService,
    private tasksService: TasksService,
    private usersService: UsersService,
    private auth: Auth
  ) {}

  ngOnInit() {
    this.currentUserId = this.auth.getCurrentUserId();
    console.log('Current user ID:', this.currentUserId);

    // Subscribe to route parameter changes to handle navigation between projects
    this.route.paramMap.subscribe((params) => {
      const projectId = params.get('id');
      if (projectId) {
        // Check for tab query parameter
        const tab = this.route.snapshot.queryParamMap.get('tab');
        if (tab === 'chat' || tab === 'members' || tab === 'tasks' || tab === 'settings') {
          this.activeTab = tab as 'tasks' | 'members' | 'chat' | 'settings';
        } else {
          this.activeTab = 'tasks'; // Default to tasks when switching projects
        }

        this.loadProject(projectId);
      }
    });
  }

  loadProject(id: string) {
    this.isLoading = true;
    this.projectsService.getProjectById(id).subscribe({
      next: (project) => {
        console.log('Project loaded:', project);
        console.log('Tasks:', project.tasks);
        this.project = project;

        // Initialize edit form
        this.editedProject = {
          title: project.title,
          description: project.description,
          startDate: project.startDate || '',
          endDate: project.endDate || '',
          color: project.color || '#4A90E2',
          status: project.status || 'ACTIVE',
        };

        // Load members separately
        this.loadMembers(id);
      },
      error: (err) => {
        console.error('Error loading project:', err);
        this.errorMessage = 'Failed to load project details';
        this.isLoading = false;
      },
    });
  }

  loadMembers(projectId: string) {
    this.projectsService.listMembers(projectId).subscribe({
      next: (members) => {
        console.log('Members loaded:', members);
        console.log('Members length:', members?.length);
        this.members = members as ProjectMember[];

        // Find current user's role in this project
        const currentMember = this.members.find(
          (m: any) => (m.userId || m.user?.id) === this.currentUserId
        );

        if (currentMember) {
          this.currentUserRole = currentMember.role;
          console.log('Current user role in project:', this.currentUserRole);
        }

        // Filter tasks based on role
        this.filterTasksByRole();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading members:', err);
        this.isLoading = false;
      },
    });
  }

  filterTasksByRole() {
    if (!this.project?.tasks) {
      this.filteredTasks = [];
      return;
    }

    // OWNER and MANAGER can see all tasks
    if (this.currentUserRole === 'OWNER' || this.currentUserRole === 'MANAGER') {
      this.filteredTasks = this.project.tasks;
      console.log('User is OWNER/MANAGER - showing all tasks:', this.filteredTasks.length);
    } else {
      // MEMBER can only see tasks assigned to them
      this.filteredTasks = this.project.tasks.filter(
        (task) =>
          task.assignedTo?.user?.id === this.currentUserId ||
          task.assignedTo?.id?.userId === this.currentUserId
      );
      console.log('User is MEMBER - showing only assigned tasks:', this.filteredTasks.length);
    }
  }

  canCreateTasks(): boolean {
    // Only OWNER and MANAGER can create tasks
    return this.currentUserRole === 'OWNER' || this.currentUserRole === 'MANAGER';
  }

  canAssignToOthers(): boolean {
    // Only OWNER and MANAGER can assign tasks to others
    return this.currentUserRole === 'OWNER' || this.currentUserRole === 'MANAGER';
  }

  goBack() {
    this.router.navigate(['/projects']);
  }

  setActiveTab(tab: 'tasks' | 'members' | 'chat' | 'settings') {
    this.activeTab = tab;
  }

  onTaskStatusChanged(event: { task: Task; newStatus: string }) {
    const { task, newStatus } = event;

    // Show confirmation dialog
    const confirmMessage = `Are you sure you want to move "${task.title}" to ${this.getStatusLabel(
      newStatus
    )}?`;

    if (confirm(confirmMessage)) {
      const oldStatus = task.status;
      const newStatusTyped = newStatus as 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

      // Optimistically update UI
      task.status = newStatusTyped;

      // Update task on backend
      this.tasksService.updateTask(task.id, { status: newStatusTyped }).subscribe({
        next: (updatedTask) => {
          console.log('Task updated on backend:', updatedTask);
          // Show success notification
          this.showNotification(`Task moved to ${this.getStatusLabel(newStatus)} successfully!`);
        },
        error: (err) => {
          console.error('Error updating task:', err);
          // Revert the status change on error
          task.status = oldStatus;
          this.showNotification('Failed to update task. Please try again.');
        },
      });
    }
  }

  onTaskCreated(taskData: any) {
    if (!this.project) return;

    this.tasksService
      .createTask(
        Number(this.project.id),
        taskData.title,
        taskData.assigneeUserId,
        taskData.dueDate,
        taskData.description
      )
      .subscribe({
        next: (newTask) => {
          console.log('Task created:', newTask);
          // Add the new task to the project's tasks array
          if (this.project) {
            this.project.tasks = [...(this.project.tasks || []), newTask];
            this.filterTasksByRole();
          }
          this.showNotification('Task created successfully!');
        },
        error: (err) => {
          console.error('Error creating task:', err);
          this.showNotification('Failed to create task. Please try again.');
        },
      });
  }

  onTaskUpdated(event: { taskId: number; updates: any }) {
    const { taskId, updates } = event;

    this.tasksService.updateTask(taskId, updates).subscribe({
      next: (updatedTask) => {
        console.log('Task updated:', updatedTask);
        // Update the task in the project's tasks array
        if (this.project?.tasks) {
          const index = this.project.tasks.findIndex((t) => t.id === taskId);
          if (index !== -1) {
            this.project.tasks[index] = updatedTask;
            this.filterTasksByRole();
          }
        }
        this.showNotification('Task updated successfully!');
      },
      error: (err) => {
        console.error('Error updating task:', err);
        this.showNotification('Failed to update task. Please try again.');
      },
    });
  }

  onTaskDeleted(taskId: number) {
    this.tasksService.deleteTask(taskId).subscribe({
      next: () => {
        console.log('Task deleted:', taskId);
        // Remove the task from the project's tasks array
        if (this.project?.tasks) {
          this.project.tasks = this.project.tasks.filter((t) => t.id !== taskId);
          this.filterTasksByRole();
        }
        this.showNotification('Task deleted successfully!');
      },
      error: (err) => {
        console.error('Error deleting task:', err);
        this.showNotification('Failed to delete task. Please try again.');
      },
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'TODO':
        return 'To Do';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  }

  updateProject() {
    if (!this.project || !this.editedProject.title?.trim()) return;

    this.isUpdatingProject = true;

    const updates = {
      title: this.editedProject.title,
      description: this.editedProject.description,
      startDate: this.editedProject.startDate || undefined,
      endDate: this.editedProject.endDate || undefined,
      color: this.editedProject.color,
      status: this.editedProject.status,
    };

    this.projectsService.updateProject(this.project.id, updates).subscribe({
      next: (updatedProject) => {
        console.log('Project updated:', updatedProject);
        this.project = updatedProject;
        // Update the editedProject to reflect the new values
        this.editedProject = {
          title: updatedProject.title,
          description: updatedProject.description,
          startDate: updatedProject.startDate || '',
          endDate: updatedProject.endDate || '',
          color: updatedProject.color || '#4A90E2',
          status: updatedProject.status || 'ACTIVE',
        };
        this.isUpdatingProject = false;
        this.showNotification('Project updated successfully!');
      },
      error: (err) => {
        console.error('Error updating project:', err);
        this.isUpdatingProject = false;
        this.showNotification('Failed to update project. Please try again.');
      },
    });
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

  // Invite Member Modal Methods
  openInviteModal() {
    this.showInviteModal = true;
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedUsers = [];
  }

  closeInviteModal() {
    this.showInviteModal = false;
    this.searchQuery = '';
    this.searchResults = [];
    this.selectedUsers = [];
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }
  }

  onSearchInput() {
    // Clear previous timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // If search query is empty, clear results
    if (!this.searchQuery.trim()) {
      this.searchResults = [];
      return;
    }

    // Set a new timeout for search
    this.searchTimeout = setTimeout(() => {
      this.searchUsers();
    }, 300);
  }

  searchUsers() {
    if (!this.searchQuery.trim()) {
      // If no query, fetch all users
      this.isSearching = true;
      this.usersService.getAllUsers().subscribe({
        next: (users) => {
          console.log('All users from API:', users);
          this.filterUsers(users);
          this.isSearching = false;
        },
        error: (err) => {
          console.error('Error fetching users:', err);
          this.isSearching = false;
        },
      });
      return;
    }

    console.log('Fetching all users and filtering by query:', this.searchQuery);
    this.isSearching = true;
    this.usersService.getAllUsers().subscribe({
      next: (users) => {
        console.log('All users from API:', users);
        this.filterUsers(users);
        this.isSearching = false;
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        this.isSearching = false;
      },
    });
  }

  filterUsers(users: User[]) {
    const query = this.searchQuery.toLowerCase().trim();

    // Filter by search query
    let filteredUsers = users;
    if (query) {
      filteredUsers = users.filter((u) => {
        const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
        const email = u.email.toLowerCase();
        return fullName.includes(query) || email.includes(query);
      });
    }

    console.log('After search filter:', filteredUsers);

    // Filter out users who are already members or already selected
    const memberIds = this.members.map((m: any) => m.userId || m.user?.id);
    const selectedIds = this.selectedUsers.map((u) => u.id);
    console.log('Current member IDs:', memberIds);
    console.log('Selected user IDs:', selectedIds);

    this.searchResults = filteredUsers.filter(
      (u) => !memberIds.includes(u.id) && !selectedIds.includes(u.id)
    );

    console.log('Final filtered results:', this.searchResults);
  }

  selectUser(user: User) {
    if (!this.selectedUsers.find((u) => u.id === user.id)) {
      this.selectedUsers = [...this.selectedUsers, user];
      // Remove from search results
      this.searchResults = this.searchResults.filter((u) => u.id !== user.id);
    }
  }

  removeSelectedUser(user: User) {
    this.selectedUsers = this.selectedUsers.filter((u) => u.id !== user.id);
  }

  inviteMembers() {
    if (!this.project || this.selectedUsers.length === 0) {
      console.log('Cannot invite: project or selectedUsers missing', {
        project: this.project,
        selectedUsersLength: this.selectedUsers.length,
      });
      return;
    }

    console.log('Inviting members:', this.selectedUsers);
    console.log('Project ID:', this.project.id);

    let invitedCount = 0;
    let errorCount = 0;

    this.selectedUsers.forEach((user, index) => {
      console.log(`Inviting user ${index + 1}/${this.selectedUsers.length}:`, user);
      this.projectsService
        .assignMember(this.project!.id, { userId: user.id, role: 'MEMBER' })
        .subscribe({
          next: (response) => {
            console.log('Successfully invited user:', user.email, response);
            invitedCount++;
            // If this is the last user, reload members and show notification
            if (index === this.selectedUsers.length - 1) {
              this.loadMembers(this.project!.id);
              if (invitedCount > 0) {
                this.showNotification(
                  `Successfully invited ${invitedCount} member${invitedCount > 1 ? 's' : ''}!`
                );
              }
              if (errorCount > 0) {
                this.showNotification(
                  `Failed to invite ${errorCount} member${errorCount > 1 ? 's' : ''}.`
                );
              }
              this.closeInviteModal();
            }
          },
          error: (err) => {
            console.error('Error inviting user:', user.email, err);
            console.error('Error details:', {
              status: err.status,
              message: err.message,
              error: err.error,
            });
            errorCount++;
            // If this is the last user, show notification
            if (index === this.selectedUsers.length - 1) {
              if (invitedCount > 0) {
                this.showNotification(
                  `Successfully invited ${invitedCount} member${invitedCount > 1 ? 's' : ''}!`
                );
              }
              if (errorCount > 0) {
                this.showNotification(
                  `Failed to invite ${errorCount} member${errorCount > 1 ? 's' : ''}.`
                );
              }
              this.closeInviteModal();
            }
          },
        });
    });
  }

  getUserFullName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  getUserInitials(user: User): string {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }

  // Member Management Methods
  onMemberRoleChanged(event: { member: ProjectMember; newRole: string }) {
    if (!this.project) return;

    const memberId =
      event.member.user?.id || (event.member as any).userId || event.member.id?.userId;
    const memberName = `${event.member.user?.firstName || (event.member as any).firstName} ${
      event.member.user?.lastName || (event.member as any).lastName
    }`;

    console.log('Changing role for member:', { memberId, newRole: event.newRole });

    this.projectsService
      .changeMemberRole(String(this.project.id), {
        userId: memberId,
        role: event.newRole as 'OWNER' | 'MEMBER' | 'MANAGER',
      })
      .subscribe({
        next: () => {
          console.log('Role changed successfully');
          // Update local member role
          event.member.role = event.newRole as 'OWNER' | 'MEMBER' | 'MANAGER';
          this.showNotification(`${memberName}'s role changed to ${event.newRole} successfully!`);
        },
        error: (err) => {
          console.error('Error changing member role:', err);
          this.showNotification('Failed to change member role. Please try again.');
        },
      });
  }

  onMemberRemoved(member: ProjectMember) {
    if (!this.project) return;

    const memberId = member.user?.id || (member as any).userId || member.id?.userId;
    const memberName = `${member.user?.firstName || (member as any).firstName} ${
      member.user?.lastName || (member as any).lastName
    }`;

    console.log('Removing member:', memberId);

    this.projectsService.removeMember(String(this.project.id), memberId).subscribe({
      next: () => {
        console.log('Member removed successfully');
        // Remove from local members array
        this.members = this.members.filter((m) => {
          const mId = m.user?.id || (m as any).userId || m.id?.userId;
          return mId !== memberId;
        });
        this.showNotification(`${memberName} removed from project successfully!`);
      },
      error: (err) => {
        console.error('Error removing member:', err);
        this.showNotification('Failed to remove member. Please try again.');
      },
    });
  }

  // Delete Project Methods
  openDeleteModal() {
    this.showDeleteModal = true;
    this.deleteConfirmationText = '';
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.deleteConfirmationText = '';
  }

  canConfirmDelete(): boolean {
    return this.deleteConfirmationText === this.project?.title;
  }

  deleteProject() {
    if (!this.project || !this.canConfirmDelete()) return;

    this.isDeletingProject = true;

    this.projectsService.deleteProject(String(this.project.id)).subscribe({
      next: () => {
        console.log('Project deleted successfully');
        // Close modal first
        this.showDeleteModal = false;
        this.deleteConfirmationText = '';
        this.isDeletingProject = false;

        // Show notification and navigate
        this.showNotification('Project deleted successfully!');

        // Force navigation to projects page
        this.router.navigate(['/projects']).then(() => {
          console.log('Navigation to projects completed');
        });
      },
      error: (err) => {
        console.error('Error deleting project:', err);
        this.isDeletingProject = false;
        this.showNotification('Failed to delete project. Please try again.');
      },
    });
  }
}
