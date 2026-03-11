import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { Invoice } from '../../../core/models/invoice.model';
import { InvoiceService } from '../../../core/services/invoice.service';

@Component({
  selector: 'app-dashboard-invoices-page',
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './dashboard-invoices-page.component.html',
  styleUrl: './dashboard-invoices-page.component.css'
})
export class DashboardInvoicesPageComponent {
  private readonly invoiceService = inject(InvoiceService);

  loading = true;
  invoices: Invoice[] = [];
  searchTerm = '';

  constructor() {
    this.invoiceService.listMyInvoices().subscribe({
      next: (invoices) => {
        this.invoices = invoices;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  get filteredInvoices(): Invoice[] {
    const search = this.searchTerm.toLowerCase();
    return this.invoices
      .filter((invoice) => {
        return (
          search.length === 0 ||
          invoice.invoiceNumber.toLowerCase().includes(search) ||
          invoice.orderNumber.toLowerCase().includes(search)
        );
      })
      .sort((a, b) => new Date(b.issuedAt).getTime() - new Date(a.issuedAt).getTime());
  }

  get totalAmount(): number {
    return this.invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  }

  get paidAmount(): number {
    return this.invoices
      .filter((invoice) => invoice.status.toUpperCase() === 'PAID')
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  }

  get pendingAmount(): number {
    return this.invoices
      .filter((invoice) => invoice.status.toUpperCase() === 'PENDING')
      .reduce((sum, invoice) => sum + invoice.totalAmount, 0);
  }

  statusClass(status: string): string {
    switch (status.toUpperCase()) {
      case 'PAID':
        return 'bg-green-500';
      case 'PENDING':
        return 'bg-yellow-500';
      case 'OVERDUE':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  }

  openInvoice(invoice: Invoice): void {
    if (invoice.pdfUrl) {
      window.open(invoice.pdfUrl, '_blank', 'noopener');
    }
  }
}
