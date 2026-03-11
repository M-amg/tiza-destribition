import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule, Save, UserCog } from 'lucide-angular/src/icons';
import { forkJoin, of } from 'rxjs';

import {
  ApiAdminUserRoleUpsert,
  mapApiAdminUserToView,
  toApiUserUpsertRequest
} from '../admin-users-api.models';
import { AdminUsersApiService } from '../admin-users-api.service';

interface RoleOption {
  key: ApiAdminUserRoleUpsert;
  name: string;
  description: string;
}

@Component({
  selector: 'app-user-form-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './user-form-page.component.html',
  styleUrl: './user-form-page.component.scss'
})
export class UserFormPageComponent implements OnInit {
  readonly iconBack = ArrowLeft;
  readonly iconUser = UserCog;
  readonly iconSave = Save;

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly usersApi = inject(AdminUsersApiService);

  private readonly userId = this.route.snapshot.paramMap.get('id');
  readonly isEdit = !!this.userId;

  loadingInitial = true;
  submitting = false;
  userFound = true;
  errorMessage = '';

  readonly roles: RoleOption[] = [];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(190)]],
    role: ['staff' as ApiAdminUserRoleUpsert, Validators.required],
    password: [''],
    statusActive: [true]
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  get selectedRoleDescription(): string {
    const role = this.roles.find((item) => item.key === this.form.controls.role.value);
    return role?.description ?? '';
  }

  toggleStatus(value: boolean): void {
    this.form.controls.statusActive.setValue(value);
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.errorMessage = '';

    if (this.form.invalid || this.loadingInitial || this.submitting) {
      return;
    }

    const password = this.form.controls.password.value.trim();
    if (!this.isEdit && password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }

    if (this.isEdit && password.length > 0 && password.length < 8) {
      this.errorMessage = 'Password must be at least 8 characters.';
      return;
    }

    const payload = toApiUserUpsertRequest({
      name: this.form.controls.name.value,
      email: this.form.controls.email.value,
      role: this.form.controls.role.value,
      statusActive: this.form.controls.statusActive.value,
      password
    });

    this.submitting = true;
    const request$ =
      this.isEdit && this.userId
        ? this.usersApi.updateUser(this.userId, payload)
        : this.usersApi.createUser(payload);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        void this.router.navigateByUrl('/users');
      },
      error: (error: { status?: number; error?: { message?: string } }) => {
        this.errorMessage =
          error.status === 404 ? 'User not found.' : error.error?.message ?? 'Failed to save user.';
        this.submitting = false;
      }
    });
  }

  private loadInitialData(): void {
    this.loadingInitial = true;
    this.errorMessage = '';

    forkJoin({
      roles: this.usersApi.allRoles(),
      user: this.isEdit && this.userId ? this.usersApi.userById(this.userId) : of(null)
    }).subscribe({
      next: ({ roles, user }) => {
        this.roles.splice(
          0,
          this.roles.length,
          ...roles
            .filter((role) => role.key !== 'super_admin')
            .map((role) => ({
              key: role.key as ApiAdminUserRoleUpsert,
              name: role.name,
              description: role.description
            }))
        );

        if (user) {
          const mapped = mapApiAdminUserToView(user);
          this.form.patchValue({
            name: mapped.name,
            email: mapped.email,
            role: mapped.role === 'admin' || mapped.role === 'manager' || mapped.role === 'staff' ? mapped.role : 'admin',
            statusActive: mapped.status === 'active',
            password: ''
          });
        }

        this.loadingInitial = false;
      },
      error: (error: { status?: number; error?: { message?: string } }) => {
        this.userFound = !(this.isEdit && error.status === 404);
        this.errorMessage =
          error.status === 404 ? 'User not found.' : error.error?.message ?? 'Failed to load user form data.';
        this.loadingInitial = false;
      }
    });
  }
}
