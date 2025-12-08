import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { User } from '../../Models/user/user-module';
import { CommonModule } from '@angular/common';
import { Auth } from '../../services/auth/auth.service';

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
export class SidebarComponent {
  constructor(private router: Router, private auth: Auth) {}

  // Static current user data (no longer passed from parent)
  currentUser: User = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    role: 'ADMIN',
    avatar: 'https://i.pravatar.cc/150?img=1',
  };

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
   * Handles role toggle button click
   * Switches user role between 'ADMIN' and 'USER'
   */
  onToggleRole() {
    this.currentUser.role = this.currentUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
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
