export interface Invoice {
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
  pdfUrl: string | null;
}
