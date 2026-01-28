import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProjectMember } from '../../../Models/user/user-module';

@Component({
  selector: 'app-member-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './member-list.html',
  styleUrl: './member-list.scss',
})
export class MemberList implements OnInit {
  @Input() members: ProjectMember[] = [];
  @Input() isOwner: boolean = false;
  @Input() currentUserId: number | null = null;
  @Output() roleChanged = new EventEmitter<{ member: ProjectMember; newRole: string }>();
  @Output() memberRemoved = new EventEmitter<ProjectMember>();

  ngOnInit() {
    console.log('Members received:', this.members);
  }

  getFullName(member: any): string {
    if (!member) return 'Unknown';
    // Handle both nested user object and flat structure
    const firstName = member.user?.firstName || member.firstName;
    const lastName = member.user?.lastName || member.lastName;
    return `${firstName} ${lastName}`;
  }

  getInitials(member: any): string {
    if (!member) return '??';
    // Handle both nested user object and flat structure
    const firstName = member.user?.firstName || member.firstName;
    const lastName = member.user?.lastName || member.lastName;
    if (!firstName || !lastName) return '??';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  getAvatarColor(member: any): string {
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#f59e0b', // orange
      '#8b5cf6', // purple
      '#ef4444', // red
      '#06b6d4', // cyan
      '#ec4899', // pink
    ];
    if (!member) return colors[0];
    // Handle both nested user object and flat structure
    const firstName = member.user?.firstName || member.firstName;
    if (!firstName) return colors[0];
    const index = firstName.charCodeAt(0) % colors.length;
    return colors[index];
  }

  getAvatar(member: any): string | undefined {
    return member.user?.avatar || member.avatar;
  }

  getEmail(member: any): string {
    return member.user?.email || member.email || '';
  }

  getMemberId(member: any): number {
    return member.user?.id || member.userId || member.id?.userId;
  }

  canManageMember(member: any): boolean {
    // Owner can manage everyone except themselves
    const memberId = this.getMemberId(member);
    return this.isOwner && memberId !== this.currentUserId;
  }

  onRoleChange(member: ProjectMember, newRole: string) {
    if (this.canManageMember(member)) {
      this.roleChanged.emit({ member, newRole });
    }
  }

  onRemoveMember(member: ProjectMember) {
    if (
      this.canManageMember(member) &&
      confirm(`Are you sure you want to remove ${this.getFullName(member)} from this project?`)
    ) {
      this.memberRemoved.emit(member);
    }
  }
}
