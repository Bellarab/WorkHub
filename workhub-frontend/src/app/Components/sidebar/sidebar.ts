import { Component } from '@angular/core';
import { User } from '../../Models/user/user-module';
import { CommonModule } from '@angular/common';

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
  imports: [CommonModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class SidebarComponent {
  // Static current user data (no longer passed from parent)
  currentUser: User = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=1',
  };

  // Static current view to highlight the corresponding menu item
  currentView: 'dashboard' | 'projects' | 'project' | 'calendar' | 'collaboration' | 'admin' =
    'dashboard';

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
   * Updates the current view directly in the component
   * @param view - The view to navigate to
   */
  onNavigate(view: string) {
    this.currentView = view as any;
  }

  /**
   * Handles role toggle button click
   * Switches user role between 'admin' and 'user'
   */
  onToggleRole() {
    this.currentUser.role = this.currentUser.role === 'admin' ? 'user' : 'admin';
  }
}
