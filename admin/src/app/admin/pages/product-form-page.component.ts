import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule, Upload, X } from 'lucide-angular/src/icons';

import { AdminCatalogApiService } from '../admin-catalog-api.service';
import {
  ApiCategory,
  ApiDiscountAppliesTo,
  ApiDiscountType,
  ApiProductDetail,
  ApiProductUpsertRequest
} from '../admin-catalog-api.models';

type DiscountType = 'none' | 'percentage' | 'fixed';
type DiscountAppliesTo = 'B2C' | 'B2B' | 'both';
type ProductStatus = 'active' | 'disabled';

@Component({
  selector: 'app-product-form-page',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink, LucideAngularModule],
  templateUrl: './product-form-page.component.html',
  styleUrl: './product-form-page.component.scss'
})
export class ProductFormPageComponent implements OnInit {
  readonly iconBack = ArrowLeft;
  readonly iconUpload = Upload;
  readonly iconRemove = X;

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogApi = inject(AdminCatalogApiService);

  private readonly productId = this.route.snapshot.paramMap.get('id');
  readonly isEdit = !!this.productId;

  loadingInitial = true;
  submitting = false;
  errorMessage = '';
  imageUploadError = '';
  productFound = true;
  uploadingImages = false;
  imageUrlInput = '';

  private productSlug = '';

  categoryOptions: ApiCategory[] = [];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    shortDescription: [''],
    description: ['', Validators.required],
    sku: ['', Validators.required],
    barcode: [''],
    categoryId: ['', Validators.required],
    brand: ['', Validators.required],
    costPrice: [0, [Validators.required, Validators.min(0)]],
    b2cPrice: [0, [Validators.required, Validators.min(0)]],
    b2bPrice: [0, [Validators.required, Validators.min(0)]],
    discountType: ['none' as DiscountType],
    discountValue: [0, Validators.min(0)],
    discountAppliesTo: ['both' as DiscountAppliesTo],
    stockQuantity: [0, [Validators.required, Validators.min(0)]],
    minimumStockLevel: [0, [Validators.required, Validators.min(0)]],
    featured: [false],
    isNew: [false],
    status: ['active' as ProductStatus]
  });

  images: string[] = [];
  mainImageIndex = 0;

  ngOnInit(): void {
    this.loadInitialData();
  }

  get discountEnabled(): boolean {
    return this.form.controls.discountType.value !== 'none';
  }

  get costPrice(): number {
    return Number(this.form.controls.costPrice.value) || 0;
  }

  get b2cPrice(): number {
    return Number(this.form.controls.b2cPrice.value) || 0;
  }

  get b2bPrice(): number {
    return Number(this.form.controls.b2bPrice.value) || 0;
  }

  get discountValue(): number {
    return Number(this.form.controls.discountValue.value) || 0;
  }

  get finalB2CPrice(): number {
    return this.calculateFinalPrice(this.b2cPrice, 'B2C');
  }

  get finalB2BPrice(): number {
    return this.calculateFinalPrice(this.b2bPrice, 'B2B');
  }

  get b2cSavings(): number {
    return Math.max(this.b2cPrice - this.finalB2CPrice, 0);
  }

  get b2bSavings(): number {
    return Math.max(this.b2bPrice - this.finalB2BPrice, 0);
  }

  get b2cMarginPercent(): number {
    return this.costPrice > 0 ? ((this.finalB2CPrice - this.costPrice) / this.costPrice) * 100 : 0;
  }

  get b2bMarginPercent(): number {
    return this.costPrice > 0 ? ((this.finalB2BPrice - this.costPrice) / this.costPrice) * 100 : 0;
  }

  get b2cMarginValue(): number {
    return this.finalB2CPrice - this.costPrice;
  }

  get b2bMarginValue(): number {
    return this.finalB2BPrice;
  }

  calculateFinalPrice(price: number, priceType: 'B2C' | 'B2B'): number {
    const discountType = this.form.controls.discountType.value;
    const appliesTo = this.form.controls.discountAppliesTo.value;

    if (discountType === 'none') {
      return price;
    }

    if (appliesTo !== 'both' && appliesTo !== priceType) {
      return price;
    }

    if (discountType === 'percentage') {
      return Math.max(price - (price * this.discountValue) / 100, 0);
    }

    return Math.max(price - this.discountValue, 0);
  }

  onImageUpload(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (!files || files.length === 0) {
      return;
    }

    this.imageUploadError = '';
    this.uploadingImages = true;

    this.catalogApi.uploadProductImages(Array.from(files)).subscribe({
      next: (uploadedImages) => {
        const uploadedUrls = uploadedImages.map((item) => item.url).filter(Boolean);
        const uniqueNewUrls = uploadedUrls.filter((url) => !this.images.includes(url));

        this.images = [...this.images, ...uniqueNewUrls];
        if (this.images.length > 0 && this.mainImageIndex >= this.images.length) {
          this.mainImageIndex = 0;
        }
      },
      error: (error: { error?: { message?: string } }) => {
        this.imageUploadError = error.error?.message ?? 'Failed to upload image files.';
        this.uploadingImages = false;
        target.value = '';
      },
      complete: () => {
        this.uploadingImages = false;
        target.value = '';
      }
    });
  }

  addImageUrl(): void {
    const url = this.imageUrlInput.trim();
    if (!url || this.images.includes(url)) {
      return;
    }

    this.images = [...this.images, url];
    if (this.images.length === 1) {
      this.mainImageIndex = 0;
    }

    this.imageUrlInput = '';
  }

  setMainImage(index: number): void {
    this.mainImageIndex = index;
  }

  removeImage(index: number): void {
    this.images = this.images.filter((_, itemIndex) => itemIndex !== index);

    if (this.images.length === 0) {
      this.mainImageIndex = 0;
      return;
    }

    if (this.mainImageIndex >= this.images.length) {
      this.mainImageIndex = this.images.length - 1;
    }
  }

  toggleStatus(checked: boolean): void {
    this.form.controls.status.setValue(checked ? 'active' : 'disabled');
  }

  toggleFeatured(checked: boolean): void {
    this.form.controls.featured.setValue(checked);
  }

  toggleIsNew(checked: boolean): void {
    this.form.controls.isNew.setValue(checked);
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.errorMessage = '';
    if (this.form.invalid || this.submitting || this.loadingInitial || this.uploadingImages) {
      return;
    }

    const payload = this.toUpsertPayload();
    this.submitting = true;

    const request$ =
      this.isEdit && this.productId
        ? this.catalogApi.updateProduct(this.productId, payload)
        : this.catalogApi.createProduct(payload);

    request$.subscribe({
      next: () => {
        this.submitting = false;
        void this.router.navigateByUrl('/products');
      },
      error: (error: { error?: { message?: string } }) => {
        this.submitting = false;
        this.errorMessage = error.error?.message ?? 'Failed to save product.';
      }
    });
  }

  private loadInitialData(): void {
    this.loadingInitial = true;
    this.catalogApi.allCategories().subscribe({
      next: (categories) => {
        this.categoryOptions = categories;
        if (this.isEdit && this.productId) {
          this.loadProduct(this.productId);
        } else {
          this.loadingInitial = false;
        }
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to load categories.';
        this.loadingInitial = false;
      }
    });
  }

  private loadProduct(id: string): void {
    this.catalogApi.productById(id).subscribe({
      next: (product) => {
        this.productFound = true;
        this.patchFromApi(product);
        this.loadingInitial = false;
      },
      error: (error: { status?: number; error?: { message?: string } }) => {
        this.productFound = false;
        this.errorMessage =
          error.status === 404 ? 'Product not found.' : error.error?.message ?? 'Failed to load product.';
        this.loadingInitial = false;
      }
    });
  }

  private patchFromApi(product: ApiProductDetail): void {
    this.productSlug = product.slug;
    this.form.patchValue({
      name: product.name,
      shortDescription: product.shortDescription ?? '',
      description: product.description,
      sku: product.sku,
      barcode: product.barcode ?? '',
      categoryId: product.category.id,
      brand: product.brand,
      costPrice: Number(product.costPrice ?? 0),
      b2cPrice: Number(product.b2cPrice ?? 0),
      b2bPrice: Number(product.b2bPrice ?? 0),
      discountType: this.mapApiDiscountType(product.discountType),
      discountValue: Number(product.discountValue ?? 0),
      discountAppliesTo: this.mapApiDiscountAppliesTo(product.discountAppliesTo),
      stockQuantity: Number(product.stockQuantity ?? 0),
      minimumStockLevel: Number(product.minimumStockLevel ?? 0),
      featured: product.featured,
      isNew: product.isNew,
      status: product.status === 'ACTIVE' ? 'active' : 'disabled'
    });

    this.images = [...(product.images ?? [])];
    this.mainImageIndex = 0;
  }

  private toUpsertPayload(): ApiProductUpsertRequest {
    const value = this.form.getRawValue();
    const mainImage = this.images[this.mainImageIndex];
    const orderedImages = [
      ...(mainImage ? [mainImage] : []),
      ...this.images.filter((image, index) => index !== this.mainImageIndex)
    ];
    const persistedImages = orderedImages.filter((image) => !!image);

    return {
      categoryId: value.categoryId,
      name: value.name.trim(),
      slug: this.productSlug || this.slugify(value.name),
      description: value.description.trim(),
      shortDescription: value.shortDescription.trim() || null,
      brand: value.brand.trim(),
      sku: value.sku.trim(),
      barcode: value.barcode.trim() || null,
      costPrice: Number(value.costPrice),
      b2cPrice: Number(value.b2cPrice),
      b2bPrice: Number(value.b2bPrice),
      originalPrice: null,
      discountType: this.mapDiscountType(value.discountType),
      discountValue: this.discountEnabled && Number(value.discountValue) > 0 ? Number(value.discountValue) : null,
      discountAppliesTo: this.mapDiscountAppliesTo(value.discountAppliesTo),
      minB2BQuantity: 1,
      stockQuantity: Number(value.stockQuantity),
      minimumStockLevel: Number(value.minimumStockLevel),
      featured: value.featured,
      isNew: value.isNew,
      status: value.status === 'active' ? 'ACTIVE' : 'DISABLED',
      images: persistedImages
    };
  }

  private mapDiscountType(type: DiscountType): ApiDiscountType {
    if (type === 'percentage') {
      return 'PERCENTAGE';
    }
    if (type === 'fixed') {
      return 'FIXED';
    }
    return 'NONE';
  }

  private mapDiscountAppliesTo(value: DiscountAppliesTo): ApiDiscountAppliesTo {
    if (value === 'B2C') {
      return 'B2C';
    }
    if (value === 'B2B') {
      return 'B2B';
    }
    return 'BOTH';
  }

  private mapApiDiscountType(type: ApiDiscountType): DiscountType {
    if (type === 'PERCENTAGE') {
      return 'percentage';
    }
    if (type === 'FIXED') {
      return 'fixed';
    }
    return 'none';
  }

  private mapApiDiscountAppliesTo(value: ApiDiscountAppliesTo): DiscountAppliesTo {
    if (value === 'B2C') {
      return 'B2C';
    }
    if (value === 'B2B') {
      return 'B2B';
    }
    return 'both';
  }

  private slugify(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 200);
  }
}
