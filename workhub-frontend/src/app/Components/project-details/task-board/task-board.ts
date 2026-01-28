import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Task } from '../../../Models/user/user-module';

@Component({
  selector: 'app-task-board',
  imports: [CommonModule, FormsModule],
  templateUrl: './task-board.html',
  styleUrl: './task-board.scss',
})
export class TaskBoard {
  @Input() tasks: Task[] = [];
  @Input() members: any[] = [];
  @Input() projectId: string = '';
  @Input() canCreateTasks: boolean = true;
  @Input() canAssignToOthers: boolean = true;
  @Input() currentUserId: number | null = null;
  @Output() taskStatusChanged = new EventEmitter<{ task: Task; newStatus: string }>();
  @Output() taskCreated = new EventEmitter<any>();
  @Output() taskUpdated = new EventEmitter<{ taskId: number; updates: any }>();
  @Output() taskDeleted = new EventEmitter<number>();

  showCreateModal = false;
  newTaskTitle = '';
  newTaskDescription = '';
  newTaskAssigneeId: number | null = null;
  newTaskDueDate = '';
  newTaskPriority = 'medium';
  newTaskStatus = 'TODO';

  // Edit Task Modal
  showEditModal = false;
  selectedTask: Task | null = null;
  editTaskTitle = '';
  editTaskDescription = '';
  editTaskAssigneeId: number | null = null;
  editTaskDueDate = '';
  editTaskPriority = 'medium';
  editTaskStatus = 'TODO';

  get todoTasks() {
    return this.tasks?.filter((t) => t.status === 'TODO') || [];
  }

  get inProgressTasks() {
    return this.tasks?.filter((t) => t.status === 'IN_PROGRESS') || [];
  }

  get completedTasks() {
    return this.tasks?.filter((t) => t.status === 'COMPLETED') || [];
  }

  updateTaskStatus(task: Task, newStatus: string) {
    this.taskStatusChanged.emit({ task, newStatus });
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

  getAssignedToName(task: Task): string {
    if (task.assignedTo?.user) {
      return `${task.assignedTo.user.firstName} ${task.assignedTo.user.lastName}`;
    }
    return 'Unassigned';
  }

  canChangeTaskStatus(task: Task): boolean {
    // Users can only change status of tasks assigned to them
    return (
      task.assignedTo?.user?.id === this.currentUserId ||
      task.assignedTo?.id?.userId === this.currentUserId
    );
  }

  openCreateModal() {
    // If user cannot assign to others, auto-assign to self
    if (!this.canAssignToOthers && this.currentUserId) {
      this.newTaskAssigneeId = this.currentUserId;
    }
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
    this.resetForm();
  }

  resetForm() {
    this.newTaskTitle = '';
    this.newTaskDescription = '';
    this.newTaskAssigneeId = null;
    this.newTaskDueDate = '';
    this.newTaskPriority = 'medium';
    this.newTaskStatus = 'TODO';
  }

  createTask() {
    if (!this.newTaskTitle.trim()) return;

    const taskData = {
      title: this.newTaskTitle,
      description: this.newTaskDescription || undefined,
      assigneeUserId: this.newTaskAssigneeId || undefined,
      dueDate: this.newTaskDueDate || undefined,
      priority: this.newTaskPriority,
      status: this.newTaskStatus,
    };

    this.taskCreated.emit(taskData);
    this.closeCreateModal();
  }

  getFullName(member: any): string {
    if (!member) return 'Unknown';
    const firstName = member.user?.firstName || member.firstName;
    const lastName = member.user?.lastName || member.lastName;
    return `${firstName} ${lastName}`;
  }

  openEditModal(task: Task, event?: Event) {
    if (event) {
      event.stopPropagation();
    }
    this.selectedTask = task;
    this.editTaskTitle = task.title;
    this.editTaskDescription = task.description || '';
    this.editTaskAssigneeId = task.assignedTo?.user?.id || task.assignedTo?.id?.userId || null;
    this.editTaskDueDate = task.dueDate || '';
    this.editTaskPriority = task.priority || 'medium';
    this.editTaskStatus = task.status;
    this.showEditModal = true;
  }

  closeEditModal() {
    this.showEditModal = false;
    this.selectedTask = null;
    this.resetEditForm();
  }

  resetEditForm() {
    this.editTaskTitle = '';
    this.editTaskDescription = '';
    this.editTaskAssigneeId = null;
    this.editTaskDueDate = '';
    this.editTaskPriority = 'medium';
    this.editTaskStatus = 'TODO';
  }

  saveTaskChanges() {
    if (!this.selectedTask || !this.editTaskTitle.trim()) return;

    const updates = {
      title: this.editTaskTitle,
      description: this.editTaskDescription || undefined,
      assigneeUserId: this.editTaskAssigneeId || undefined,
      dueDate: this.editTaskDueDate || undefined,
      priority: this.editTaskPriority,
      status: this.editTaskStatus,
    };

    this.taskUpdated.emit({ taskId: this.selectedTask.id, updates });
    this.closeEditModal();
  }

  deleteTask() {
    if (!this.selectedTask) return;

    if (confirm(`Are you sure you want to delete "${this.selectedTask.title}"?`)) {
      this.taskDeleted.emit(this.selectedTask.id);
      this.closeEditModal();
    }
  }
}
