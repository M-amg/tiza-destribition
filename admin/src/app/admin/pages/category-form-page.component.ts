import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule, Upload, X } from 'lucide-angular/src/icons';

import { AdminCatalogApiService } from '../admin-catalog-api.service';
import { ApiCategory, ApiCategoryUpsertRequest } from '../admin-catalog-api.models';

@Component({
  selector: 'app-category-form-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './category-form-page.component.html',
  styleUrl: './category-form-page.component.scss'
})
export class CategoryFormPageComponent implements OnInit {
  readonly iconBack = ArrowLeft;
  readonly iconUpload = Upload;
  readonly iconRemove = X;

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogApi = inject(AdminCatalogApiService);

  private readonly categoryId = this.route.snapshot.paramMap.get('id');
  readonly isEdit = !!this.categoryId;
  private categorySlug = '';

  loadingInitial = true;
  submitting = false;
  uploadingImage = false;
  categoryFound = true;
  errorMessage = '';
  imageUploadError = '';

  categories: ApiCategory[] = [];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: [''],
    sortOrder: [0],
    parentCategory: ['none'],
    status: ['active' as 'active' | 'inactive'],
    image: ['']
  });

  ngOnInit(): void {
    this.loadInitialData();
  }

  get categoryOptions() {
    return this.categories.filter((item) => item.id !== this.categoryId);
  }

  get imagePreview(): string {
    return this.form.controls.image.value;
  }

  get hasPreview(): boolean {
    return !!(this.form.controls.name.value || this.form.controls.description.value || this.imagePreview);
  }

  get selectedParentCategoryName(): string {
    const selectedId = this.form.controls.parentCategory.value;
    if (!selectedId || selectedId === 'none') {
      return '';
    }

    return this.categories.find((item) => item.id === selectedId)?.name ?? '';
  }

  onImageUpload(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (!file) {
      return;
    }

    this.imageUploadError = '';
    this.uploadingImage = true;

    this.catalogApi.uploadCategoryImage(file).subscribe({
      next: (uploadedImage) => {
        this.form.controls.image.setValue(uploadedImage.url);
      },
      error: (error: { error?: { message?: string } }) => {
        this.imageUploadError = error.error?.message ?? 'Failed to upload category image.';
        this.uploadingImage = false;
        target.value = '';
      },
      complete: () => {
        this.uploadingImage = false;
        target.value = '';
      }
    });
  }

  removeImage(): void {
    this.form.controls.image.setValue('');
  }

  toggleStatus(checked: boolean): void {
    this.form.controls.status.setValue(checked ? 'active' : 'inactive');
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.errorMessage = '';
    if (this.form.invalid || this.submitting || this.loadingInitial || this.uploadingImage) {
      return;
    }

    this.submitting = true;

    const payload = this.toUpsertPayload();
    const request$ =
      this.isEdit && this.categoryId
        ? this.catalogApi.updateCategory(this.categoryId, payload)
        : this.catalogApi.createCategory(payload);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        void this.router.navigateByUrl('/categories');
      },
      error: (error: { error?: { message?: string } }) => {
        this.submitting = false;
        this.errorMessage = error.error?.message ?? 'Failed to save category.';
      }
    });
  }

  private loadInitialData(): void {
    this.loadingInitial = true;
    this.catalogApi.allCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        if (this.isEdit && this.categoryId) {
          this.loadCategory(this.categoryId);
        } else {
          this.form.controls.sortOrder.setValue(this.nextSortOrder());
          this.loadingInitial = false;
        }
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to load categories.';
        this.loadingInitial = false;
      }
    });
  }

  private loadCategory(id: string): void {
    this.catalogApi.categoryById(id).subscribe({
      next: (category) => {
        this.categoryFound = true;
        this.patchFromApi(category);
        this.loadingInitial = false;
      },
      error: (error: { status?: number; error?: { message?: string } }) => {
        this.categoryFound = false;
        this.errorMessage =
          error.status === 404 ? 'Category not found.' : error.error?.message ?? 'Failed to load category.';
        this.loadingInitial = false;
      }
    });
  }

  private patchFromApi(category: ApiCategory): void {
    this.categorySlug = category.slug;
    this.form.patchValue({
      name: category.name,
      description: category.description ?? '',
      sortOrder: category.sortOrder ?? 0,
      parentCategory: category.parentId ?? 'none',
      status: category.status === 'ACTIVE' ? 'active' : 'inactive',
      image: category.imageUrl ?? ''
    });
  }

  private toUpsertPayload(): ApiCategoryUpsertRequest {
    const value = this.form.getRawValue();

    return {
      name: value.name.trim(),
      slug: this.categorySlug || this.slugify(value.name),
      description: value.description.trim() || null,
      imageUrl: value.image || null,
      sortOrder: Math.max(0, Number(value.sortOrder ?? 0)),
      status: value.status === 'active' ? 'ACTIVE' : 'INACTIVE',
      parentId: value.parentCategory === 'none' ? null : value.parentCategory
    };
  }

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 160);
  }

  private nextSortOrder(): number {
    return this.categories.reduce((max, category) => Math.max(max, Number(category.sortOrder ?? 0)), -1) + 1;
  }
}
