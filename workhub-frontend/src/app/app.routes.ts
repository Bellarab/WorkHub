import { Routes } from '@angular/router';
import { Login } from './Authentication/login/login';
import { Register } from './Authentication/register/register';
import { DashboardComponent } from './Components/dashboard/dashboard';
import { ProjectsComponent } from './Components/projects/projects';
import { ProjectDetails } from './Components/project-details/project-details';
import { CalendarComponent } from './Components/calendar/calendar';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'projects', component: ProjectsComponent, canActivate: [authGuard] },
  { path: 'projects/:id', component: ProjectDetails, canActivate: [authGuard] },
  { path: 'calendar', component: CalendarComponent, canActivate: [authGuard] },
];
