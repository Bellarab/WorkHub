import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectMember } from '../../../Models/user/user-module';

@Component({
  selector: 'app-member-list',
  imports: [CommonModule],
  templateUrl: './member-list.html',
  styleUrl: './member-list.scss',
})
export class MemberList implements OnInit {
  @Input() members: ProjectMember[] = [];

  ngOnInit() {
    console.log('Members received:', this.members);
  }

  getFullName(member: ProjectMember): string {
    return `${member.user.firstName} ${member.user.lastName}`;
  }

  getInitials(member: ProjectMember): string {
    return `${member.user.firstName.charAt(0)}${member.user.lastName.charAt(0)}`.toUpperCase();
  }

  getAvatarColor(member: ProjectMember): string {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // orange
      '#8b5cf6', // purple
      '#ef4444', // red
      '#06b6d4', // cyan
      '#ec4899', // pink
    ];
    const index = member.user.firstName.charCodeAt(0) % colors.length;
    return colors[index];
  }
}
