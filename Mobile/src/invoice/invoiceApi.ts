import { authenticatedRequest } from '../api/http';

export type CustomerInvoice = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  status: string;
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
  totalAmount: number;
  currency: string;
  pdfUrl: string;
};

type InvoiceResponse = {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  status: string;
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
  totalAmount: number;
  currency: string | null;
  pdfUrl: string | null;
};

function mapInvoice(invoice: InvoiceResponse): CustomerInvoice {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    orderId: invoice.orderId,
    orderNumber: invoice.orderNumber,
    status: invoice.status.toLowerCase(),
    issuedAt: invoice.issuedAt,
    dueAt: invoice.dueAt,
    paidAt: invoice.paidAt,
    totalAmount: Number(invoice.totalAmount ?? 0),
    currency: invoice.currency ?? 'USD',
    pdfUrl: invoice.pdfUrl ?? '',
  };
}

export async function fetchInvoices(accessToken: string) {
  const payload = await authenticatedRequest<InvoiceResponse[]>(accessToken, '/api/v1/invoices', {
    method: 'GET',
  });

  return payload.map(mapInvoice);
}
