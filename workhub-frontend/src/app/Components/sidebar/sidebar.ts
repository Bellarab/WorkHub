import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { User, Project } from '../../Models/user/user-module';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth/auth.service';
import { ProjectsService } from '../../services/projects/projects.service';

/**
 * SidebarComponent
 *
 * Navigation sidebar for the WorkHub application.
 * Displays menu items, user information, and handles navigation between different views.
 *
 * Features:
 * - Static menu items and user data
 * - User profile display with avatar, name, and email
 * - Role switching capability for testing different permission levels
 * - Active state highlighting for current view
 */
@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent implements OnInit {
  currentUser: User | null = null;
  userProjects: Project[] = [];
  isCollaborationExpanded = false;
  isSettingsExpanded = false;

  constructor(
    private router: Router,
    private auth: Auth,
    private projectsService: ProjectsService
  ) {
    // Load current user from localStorage
    this.currentUser = this.auth.getUser();
    console.log('Sidebar - Current user from localStorage:', this.currentUser);

    // If no user data, set a default (shouldn't happen if authenticated)
    if (!this.currentUser) {
      console.log('Sidebar - No user data found, using default');
      this.currentUser = {
        id: 0,
        firstName: 'Guest',
        lastName: 'User',
        email: 'guest@example.com',
        role: 'USER',
      };
    }
  }

  ngOnInit() {
    // Load user projects
    if (this.currentUser?.id) {
      this.projectsService.getProjectsByUserId(this.currentUser.id).subscribe({
        next: (projects) => {
          this.userProjects = projects;
          console.log('Sidebar - User projects loaded:', this.userProjects);
        },
        error: (err) => {
          console.error('Sidebar - Error loading projects:', err);
        },
      });
    }
  }

  /**
   * Menu items displayed in the sidebar navigation
   * Each item contains:
   * - id: Unique identifier
   * - label: Display text
   * - icon: Icon name (currently not used in template)
   * - view: The view name to navigate to
   */
  menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', view: 'dashboard' },
    { id: 'projects', label: 'Projects', icon: 'folder', view: 'projects' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar', view: 'calendar' },
    { id: 'collaboration', label: 'Collaboration', icon: 'message', view: 'collaboration' },
  ];

  /**
   * Handles navigation when a menu item is clicked
   * Uses Angular Router to navigate to the specified route
   * @param view - The view to navigate to
   */
  onNavigate(view: string) {
    this.router.navigate([`/${view}`]);
  }

  /**
   * Toggles the collaboration dropdown to show/hide projects
   */
  toggleCollaboration() {
    this.isCollaborationExpanded = !this.isCollaborationExpanded;
    if (this.isCollaborationExpanded) {
      this.isSettingsExpanded = false; // Close settings when opening collaboration
    }
  }

  /**
   * Toggles the settings dropdown
   */
  toggleSettings() {
    this.isSettingsExpanded = !this.isSettingsExpanded;
    if (this.isSettingsExpanded) {
      this.isCollaborationExpanded = false; // Close collaboration when opening settings
    }
  }

  /**
   * Navigates to a specific setting page or opens modal
   * @param setting - The setting to navigate to
   */
  navigateToSetting(setting: string, event: Event) {
    event.stopPropagation();
    this.isSettingsExpanded = false;

    // For now, just log - you can implement actual navigation/modals later
    console.log('Navigate to setting:', setting);

    // Example: this.router.navigate(['/settings', setting]);
    // Or open a modal based on the setting
  }

  /**
   * Navigates to a specific project
   * @param projectId - The ID of the project to navigate to
   */
  navigateToProject(projectId: string, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/projects', projectId], { queryParams: { tab: 'chat' } });
  }

  /**
   * Handles role toggle button click
   * Switches user role between 'ADMIN' and 'USER'
   */
  onToggleRole() {
    if (this.currentUser) {
      this.currentUser.role = this.currentUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
    }
  }

  /**
   * Handles user logout
   * Clears authentication token and redirects to login page
   */
  onLogout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
