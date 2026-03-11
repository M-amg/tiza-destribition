import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Edit, LucideAngularModule, Plus, Search, Trash2 } from 'lucide-angular/src/icons';
import { forkJoin } from 'rxjs';

import {
  mapApiAdminUserToView,
  mapApiRoleToView,
  toApiUserStatus
} from '../admin-users-api.models';
import { AdminUsersApiService } from '../admin-users-api.service';
import { AdminUser, RolePermission, UserRole } from '../admin.models';

@Component({
  selector: 'app-users-page',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './users-page.component.html',
  styleUrl: './users-page.component.scss'
})
export class UsersPageComponent implements OnInit {
  readonly iconSearch = Search;
  readonly iconPlus = Plus;
  readonly iconEdit = Edit;
  readonly iconDelete = Trash2;

  searchTerm = '';
  roleFilter: 'all' | UserRole = 'all';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  loading = true;
  errorMessage = '';
  updatingStatusId: string | null = null;

  users: AdminUser[] = [];
  rolePermissions: RolePermission[] = [];

  constructor(private readonly usersApi: AdminUsersApiService) {}

  ngOnInit(): void {
    this.loadUsersAndRoles();
  }

  readonly roleBadgeClass: Record<UserRole, string> = {
    super_admin: 'role-badge role-super-admin',
    admin: 'role-badge role-admin',
    manager: 'role-badge role-manager',
    staff: 'role-badge role-staff'
  };

  readonly statusBadgeClass: Record<'active' | 'inactive', string> = {
    active: 'status-badge status-active',
    inactive: 'status-badge status-inactive'
  };

  get filteredUsers(): AdminUser[] {
    return this.users.filter((user) => {
      const query = this.searchTerm.toLowerCase();
      const matchesSearch =
        !query ||
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query);
      const matchesRole = this.roleFilter === 'all' || user.role === this.roleFilter;
      const matchesStatus = this.statusFilter === 'all' || user.status === this.statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }

  get totalUsers(): number {
    return this.users.length;
  }

  get activeUsers(): number {
    return this.users.filter((user) => user.status === 'active').length;
  }

  get adminUsersCount(): number {
    return this.users.filter((user) => user.role === 'super_admin' || user.role === 'admin').length;
  }

  get staffUsersCount(): number {
    return this.users.filter((user) => user.role === 'staff').length;
  }

  roleCardClass(role: UserRole): string {
    return this.roleBadgeClass[role];
  }

  roleTitle(role: RolePermission): string {
    return role.name;
  }

  roleLabel(role: UserRole): string {
    return this.rolePermissions.find((item) => item.role === role)?.name ?? role;
  }

  rolePermissionsCount(user: AdminUser): number {
    if (user.permissions.length) {
      return user.permissions.length;
    }

    return this.rolePermissions.find((item) => item.role === user.role)?.permissions.length ?? 0;
  }

  formatPermission(permission: string): string {
    return permission === 'all' ? 'All Permissions' : permission.replaceAll('_', ' ');
  }

  isDeleteDisabled(user: AdminUser): boolean {
    return user.role === 'super_admin' || this.updatingStatusId === user.id;
  }

  isEditDisabled(user: AdminUser): boolean {
    return user.role === 'super_admin';
  }

  toggleUserStatus(user: AdminUser): void {
    if (this.isDeleteDisabled(user)) {
      return;
    }

    const nextStatus: 'active' | 'inactive' = user.status === 'active' ? 'inactive' : 'active';
    const actionLabel = nextStatus === 'inactive' ? 'deactivate' : 'activate';

    if (!window.confirm(`${actionLabel} user "${user.name}"?`)) {
      return;
    }

    this.updatingStatusId = user.id;
    this.errorMessage = '';

    this.usersApi.updateStatus(user.id, toApiUserStatus(nextStatus)).subscribe({
      next: (updatedUser) => {
        const mapped = mapApiAdminUserToView(updatedUser);
        this.users = this.users.map((item) => (item.id === mapped.id ? mapped : item));
        this.updatingStatusId = null;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to update user status.';
        this.updatingStatusId = null;
      }
    });
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  trackByRole(_: number, item: RolePermission): string {
    return item.role;
  }

  private loadUsersAndRoles(): void {
    this.loading = true;
    this.errorMessage = '';

    forkJoin({
      users: this.usersApi.allUsers(),
      roles: this.usersApi.allRoles()
    }).subscribe({
      next: ({ users, roles }) => {
        this.users = users.map(mapApiAdminUserToView);
        this.rolePermissions = roles.map(mapApiRoleToView);
        this.loading = false;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to load users and roles.';
        this.loading = false;
      }
    });
  }
}
