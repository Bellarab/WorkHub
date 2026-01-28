import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProjectsService } from '../../services/projects/projects.service';
import { TasksService } from '../../services/tasks/tasks.service';
import { Auth } from '../../services/auth/auth.service';
import { Project, Task } from '../../Models/user/user-module';

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  tasks: (Task & { projectId: string; projectTitle: string; projectColor: string })[];
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar.html',
  styleUrls: ['./calendar.scss'],
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  allTasks: (Task & { projectId: string; projectTitle: string; projectColor: string })[] = [];
  isLoading = true;

  constructor(
    private projectsService: ProjectsService,
    private tasksService: TasksService,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUserTasksFromProjects();
  }

  loadUserTasksFromProjects() {
    const userId = this.auth.getCurrentUserId();
    if (!userId) {
      return;
    }

    this.projectsService.getProjectsByUserId(userId).subscribe({
      next: (projects: Project[]) => {
        this.allTasks = [];
        let projectsProcessed = 0;

        if (projects.length === 0) {
          this.generateCalendar();
          this.isLoading = false;
          return;
        }

        projects.forEach((project) => {
          // Load members for each project to get user role
          this.projectsService.listMembers(project.id).subscribe({
            next: (members) => {
              // Determine user's role in this project
              const currentMember = members.find((m: any) => (m.userId || m.user?.id) === userId);
              const userRole = currentMember?.role;

              console.log('Calendar - Processing project:', {
                projectId: project.id,
                projectTitle: project.title,
                userRole: userRole,
                membersCount: members.length,
              });

              this.tasksService.getTasksByProject(Number(project.id)).subscribe({
                next: (tasks) => {
                  console.log(`Calendar - Tasks for project ${project.id}:`, {
                    totalTasks: tasks.length,
                    tasksWithDueDate: tasks.filter((t) => t.dueDate).length,
                  });

                  tasks.forEach((task) => {
                    if (task.dueDate) {
                      // If user is MEMBER, only show tasks assigned to them
                      // If user is OWNER or MANAGER, show all tasks
                      const canViewTask =
                        userRole === 'OWNER' ||
                        userRole === 'MANAGER' ||
                        (userRole === 'MEMBER' &&
                          (task.assignedTo?.user?.id === userId ||
                            task.assignedTo?.id?.userId === userId));

                      console.log('Calendar - Task check:', {
                        taskTitle: task.title,
                        taskId: task.id,
                        userRole: userRole,
                        assignedToUserId: task.assignedTo?.user?.id,
                        assignedToIdUserId: task.assignedTo?.id?.userId,
                        currentUserId: userId,
                        canViewTask: canViewTask,
                      });

                      if (canViewTask) {
                        this.allTasks.push({
                          ...task,
                          projectId: project.id,
                          projectTitle: project.title,
                          projectColor: project.color || '#6366f1',
                        });
                      }
                    }
                  });

                  console.log(
                    `Calendar - Total tasks after project ${project.id}:`,
                    this.allTasks.length
                  );

                  projectsProcessed++;
                  if (projectsProcessed === projects.length) {
                    console.log('Calendar - Final task count:', this.allTasks.length);
                    this.generateCalendar();
                    this.isLoading = false;
                  }
                },
                error: () => {
                  projectsProcessed++;
                  if (projectsProcessed === projects.length) {
                    this.generateCalendar();
                    this.isLoading = false;
                  }
                },
              });
            },
            error: () => {
              // If we can't get members, skip this project
              projectsProcessed++;
              if (projectsProcessed === projects.length) {
                this.generateCalendar();
                this.isLoading = false;
              }
            },
          });
        });
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);

    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();
    const lastDayDate = lastDay.getDate();
    const prevLastDayDate = prevLastDay.getDate();

    const nextDays = 7 - lastDayIndex - 1;

    this.calendarDays = [];

    // Previous month days
    for (let i = firstDayIndex; i > 0; i--) {
      const date = new Date(year, month - 1, prevLastDayDate - i + 1);
      this.calendarDays.push({
        date,
        day: prevLastDayDate - i + 1,
        isCurrentMonth: false,
        isToday: false,
        tasks: this.getTasksForDate(date),
      });
    }

    // Current month days
    for (let i = 1; i <= lastDayDate; i++) {
      const date = new Date(year, month, i);
      const today = new Date();
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      this.calendarDays.push({
        date,
        day: i,
        isCurrentMonth: true,
        isToday,
        tasks: this.getTasksForDate(date),
      });
    }

    // Next month days
    for (let i = 1; i <= nextDays; i++) {
      const date = new Date(year, month + 1, i);
      this.calendarDays.push({
        date,
        day: i,
        isCurrentMonth: false,
        isToday: false,
        tasks: this.getTasksForDate(date),
      });
    }
  }

  getTasksForDate(
    date: Date
  ): (Task & { projectId: string; projectTitle: string; projectColor: string })[] {
    return this.allTasks.filter((task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  }

  previousMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1);
    this.generateCalendar();
  }

  navigateToTask(task: any) {
    this.router.navigate(['/projects', task.projectId]);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'TODO':
        return 'status-todo';
      case 'IN_PROGRESS':
        return 'status-in-progress';
      case 'COMPLETED':
        return 'status-completed';
      default:
        return '';
    }
  }
}
