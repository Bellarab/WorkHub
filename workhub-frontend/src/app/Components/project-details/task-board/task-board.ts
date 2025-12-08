import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Task } from '../../../Models/user/user-module';

@Component({
  selector: 'app-task-board',
  imports: [CommonModule],
  templateUrl: './task-board.html',
  styleUrl: './task-board.scss',
})
export class TaskBoard {
  @Input() tasks: Task[] = [];
  @Output() taskStatusChanged = new EventEmitter<{ task: Task; newStatus: string }>();

  get todoTasks() {
    return this.tasks?.filter((t) => t.status === 'todo') || [];
  }

  get inProgressTasks() {
    return this.tasks?.filter((t) => t.status === 'in-progress') || [];
  }

  get completedTasks() {
    return this.tasks?.filter((t) => t.status === 'completed') || [];
  }

  updateTaskStatus(task: Task, newStatus: string) {
    this.taskStatusChanged.emit({ task, newStatus });
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
}
