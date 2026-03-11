import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Eye, LucideAngularModule, Mail, Search } from 'lucide-angular/src/icons';

import { AdminCustomersApiService } from '../admin-customers-api.service';
import { AdminCustomerView, mapApiCustomerToView } from '../admin-customers-api.models';

@Component({
  selector: 'app-customers-page',
  imports: [CommonModule, FormsModule, RouterLink, LucideAngularModule],
  templateUrl: './customers-page.component.html',
  styleUrl: './customers-page.component.scss'
})
export class CustomersPageComponent implements OnInit {
  readonly iconSearch = Search;
  readonly iconEye = Eye;
  readonly iconMail = Mail;

  private readonly customersApi = inject(AdminCustomersApiService);

  loading = true;
  errorMessage = '';
  customers: AdminCustomerView[] = [];

  searchTerm = '';
  typeFilter: 'all' | 'B2B' | 'B2C' = 'all';
  statusFilter: 'all' | 'active' | 'inactive' | 'blocked' = 'all';

  ngOnInit(): void {
    this.loadCustomers();
  }

  get filteredCustomers() {
    return this.customers.filter((customer) => {
      const query = this.searchTerm.toLowerCase();
      const matchesSearch =
        !query ||
        customer.name.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        (customer.company?.toLowerCase().includes(query) ?? false);

      const matchesType = this.typeFilter === 'all' || customer.customerType === this.typeFilter;
      const matchesStatus = this.statusFilter === 'all' || customer.status === this.statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }

  get totalCustomers(): number {
    return this.customers.length;
  }

  get b2bCount(): number {
    return this.customers.filter((customer) => customer.customerType === 'B2B').length;
  }

  get b2cCount(): number {
    return this.customers.filter((customer) => customer.customerType === 'B2C').length;
  }

  get b2bPercentage(): number {
    return this.totalCustomers ? (this.b2bCount / this.totalCustomers) * 100 : 0;
  }

  get b2cPercentage(): number {
    return this.totalCustomers ? (this.b2cCount / this.totalCustomers) * 100 : 0;
  }

  get totalCustomerValue(): number {
    return this.customers.reduce((sum, customer) => sum + customer.totalSpent, 0);
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  private loadCustomers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.customersApi.allCustomers().subscribe({
      next: (customers) => {
        this.customers = customers.map(mapApiCustomerToView);
        this.loading = false;
      },
      error: (error: { error?: { message?: string } }) => {
        this.errorMessage = error.error?.message ?? 'Failed to load customers.';
        this.loading = false;
      }
    });
  }
}
