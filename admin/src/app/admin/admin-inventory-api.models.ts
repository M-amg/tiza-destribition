import { ApiProductSummary } from './admin-catalog-api.models';

export type ApiStockChangeType = 'RESTOCK' | 'SALE' | 'ADJUSTMENT' | 'RETURN';
export type InventoryStatusView = 'in_stock' | 'low_stock' | 'out_of_stock';
export type StockHistoryChangeType = 'restock' | 'sale' | 'adjustment' | 'return';

export interface ApiStockMovement {
  id: string;
  productId: string;
  productName: string;
  changeType: ApiStockChangeType;
  quantityChange: number;
  previousQuantity: number;
  newQuantity: number;
  changedBy?: string | null;
  note: string | null;
  createdAt: string;
}

export interface ApiStockAdjustmentRequest {
  productId: string;
  quantityChange: number;
  note: string | null;
}

export interface InventoryViewItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  image: string;
  category: string;
  stockQuantity: number;
  minimumLevel: number;
  status: InventoryStatusView;
  lastRestocked: string;
}

export interface StockHistoryView {
  id: string;
  productId: string;
  productName: string;
  changeType: StockHistoryChangeType;
  quantity: number;
  previousStock: number;
  newStock: number;
  date: string;
  createdAt: string;
  adminUser: string;
  notes?: string;
}

export function mapProductsToInventory(
  products: ApiProductSummary[],
  movements: ApiStockMovement[]
): InventoryViewItem[] {
  const latestRestockByProduct = new Map<string, string>();

  for (const movement of movements) {
    if (Number(movement.quantityChange) <= 0) {
      continue;
    }

    const productId = movement.productId;
    if (!latestRestockByProduct.has(productId)) {
      latestRestockByProduct.set(productId, movement.createdAt);
    }
  }

  return products.map((product) => {
    const stockQuantity = Number(product.stockQuantity ?? 0);
    const minimumLevel = Number(product.minimumStockLevel ?? 0);
    const lastRestockedAt = latestRestockByProduct.get(product.id) ?? '';

    return {
      id: product.id,
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      image:
        product.imageUrl ??
        'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=120&h=120&fit=crop',
      category: product.categoryName,
      stockQuantity,
      minimumLevel,
      status: toInventoryStatus(stockQuantity, minimumLevel),
      lastRestocked: lastRestockedAt ? formatDateShort(lastRestockedAt) : ''
    };
  });
}

export function mapMovementToHistory(movement: ApiStockMovement): StockHistoryView {
  return {
    id: movement.id,
    productId: movement.productId,
    productName: movement.productName,
    changeType: toHistoryType(movement.changeType),
    quantity: Number(movement.quantityChange ?? 0),
    previousStock: Number(movement.previousQuantity ?? 0),
    newStock: Number(movement.newQuantity ?? 0),
    date: formatDateShort(movement.createdAt),
    createdAt: movement.createdAt,
    adminUser: movement.changedBy?.trim() || 'System',
    notes: movement.note ?? undefined
  };
}

function toInventoryStatus(stockQuantity: number, minimumLevel: number): InventoryStatusView {
  if (stockQuantity <= 0) {
    return 'out_of_stock';
  }

  if (stockQuantity <= minimumLevel) {
    return 'low_stock';
  }

  return 'in_stock';
}

function toHistoryType(changeType: ApiStockChangeType): StockHistoryChangeType {
  switch (changeType) {
    case 'RESTOCK':
      return 'restock';
    case 'SALE':
      return 'sale';
    case 'RETURN':
      return 'return';
    case 'ADJUSTMENT':
      return 'adjustment';
  }
}

function formatDateShort(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
