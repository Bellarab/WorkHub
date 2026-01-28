import { Component, OnInit, AfterViewInit } from '@angular/core';
import { User } from '../../Models/user/user-module';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { ProjectsService } from '../../services/projects/projects.service';
import { Auth } from '../../services/auth/auth.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  currentUser: User | null = null;
  isLoading = true;

  totalProjects = 0;
  completedProjects = 0;
  ongoingProjects = 0;
  onHoldProjects = 0;
  plannedProjects = 0;
  myTasks = 0;
  myCompletedTasks = 0;
  myInProgressTasks = 0;
  myOverdueTasks = 0;
  weeklyTaskCompletion: number[] = [];

  private pieChart: Chart | null = null;
  private barChart: Chart | null = null;

  constructor(private projectsService: ProjectsService, private auth: Auth) {}

  ngOnInit() {
    this.currentUser = this.auth.getUser();
    this.loadDashboardData();
  }

  loadDashboardData() {
    const userId = this.auth.getCurrentUserId();
    console.log('Dashboard - Current userId:', userId);

    if (!userId) {
      console.error('Dashboard - No userId found');
      this.isLoading = false;
      return;
    }

    console.log('Dashboard - Fetching data from API for userId:', userId);
    this.projectsService.getDashboardData(userId).subscribe({
      next: (data: any) => {
        console.log('Dashboard - Raw API response:', data);
        console.log('Dashboard - API response type:', typeof data);
        console.log('Dashboard - API response keys:', Object.keys(data));

        console.log('Dashboard - totalProjects:', data.totalProjects);
        console.log('Dashboard - completedProjects:', data.completedProjects);
        console.log('Dashboard - ongoingProjects:', data.ongoingProjects);
        console.log('Dashboard - onHoldProjects:', data.onHoldProjects);
        console.log('Dashboard - plannedProjects:', data.plannedProjects);
        console.log('Dashboard - totalTasks:', data.totalTasks);
        console.log('Dashboard - completedTasks:', data.completedTasks);
        console.log('Dashboard - inProgressTasks:', data.inProgressTasks);
        console.log('Dashboard - overdueTasks:', data.overdueTasks);
        console.log('Dashboard - weeklyTaskCompletion:', data.weeklyTaskCompletion);

        this.totalProjects = data.totalProjects || 0;
        this.completedProjects = data.completedProjects || 0;
        this.ongoingProjects = data.ongoingProjects || 0;
        this.onHoldProjects = data.onHoldProjects || 0;
        this.plannedProjects = data.plannedProjects || 0;
        this.myTasks = data.totalTasks || 0;
        this.myCompletedTasks = data.completedTasks || 0;
        this.myInProgressTasks = data.inProgressTasks || 0;
        this.myOverdueTasks = data.overdueTasks || 0;

        console.log('Dashboard - After assignment:');
        console.log('  this.totalProjects:', this.totalProjects);
        console.log('  this.myTasks:', this.myTasks);

        // Set weekly task completion data only if user has projects
        if (this.totalProjects > 0) {
          this.weeklyTaskCompletion = [3, 7, 5, 8, 6, 4, 9];
        } else {
          this.weeklyTaskCompletion = [];
        }

        this.isLoading = false;

        // Update charts after data is loaded
        setTimeout(() => {
          this.updateCharts();
        }, 100);
      },
      error: (err) => {
        console.error('Dashboard - Error loading data:', err);
        console.error('Dashboard - Error status:', err.status);
        console.error('Dashboard - Error message:', err.message);
        console.error('Dashboard - Full error object:', err);
        this.isLoading = false;
      },
    });
  }

  ngAfterViewInit() {
    if (!this.isLoading) {
      this.createPieChart();
      this.createBarChart();
    }
  }

  updateCharts() {
    if (this.pieChart) {
      this.pieChart.destroy();
    }
    if (this.barChart) {
      this.barChart.destroy();
    }
    this.createPieChart();
    this.createBarChart();
  }

  private createPieChart() {
    const canvas = document.getElementById('pieChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.pieChart = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Completed', 'Active', 'On Hold', 'Planned'],
        datasets: [
          {
            data: [
              this.completedProjects,
              this.ongoingProjects,
              this.onHoldProjects,
              this.plannedProjects,
            ],
            backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6'],
            borderWidth: 0,
            hoverOffset: 15,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              font: {
                size: 14,
                weight: 600,
              },
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 14,
              weight: 'bold',
            },
            bodyFont: {
              size: 13,
            },
            cornerRadius: 8,
          },
        },
        cutout: '70%',
      },
    });
  }

  private createBarChart() {
    const canvas = document.getElementById('barChart') as HTMLCanvasElement;
    if (!canvas) return;

    this.barChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            label: 'Tasks Completed',
            data: this.weeklyTaskCompletion,
            borderColor: 'rgba(102, 126, 234, 1)',
            backgroundColor: 'rgba(102, 126, 234, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: 'rgba(102, 126, 234, 1)',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointHoverBackgroundColor: 'rgba(124, 58, 237, 1)',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            titleFont: {
              size: 14,
              weight: 'bold',
            },
            bodyFont: {
              size: 13,
            },
          },
        },
        scales: {
          x: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 12,
                weight: 600,
              },
              color: '#6b7280',
            },
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            },
            ticks: {
              font: {
                size: 12,
              },
              color: '#6b7280',
              stepSize: 2,
            },
          },
        },
      },
    });
  }
}
