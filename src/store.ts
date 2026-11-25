import { catalog } from './catalog-data.ts';

export const categories = ['mice', 'keyboards', 'headphones', 'microphones', 'mousePads'] as const;
export type Category = typeof categories[number];
export type Language = 'ru' | 'kk' | 'en';
export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
export type Payment = 'unpaid' | 'paid' | 'refunded';
export type Product = {
  id: number;
  category: Category;
  name: string;
  description: string;
  descriptionKk: string;
  descriptionEn: string;
  price: number;
  stock: number;
  discount: number;
  image: number | null;
  active: boolean;
};
export type OrderLine = { productId: number; name: string; quantity: number; unitPrice: number };
export type Order = {
  id: number;
  createdAt: string;
  buyer: string;
  status: OrderStatus;
  payment: Payment;
  total: number;
  lines: OrderLine[];
};
export type Review = {
  id: number; productId: number; author: string; rating: number; comment: string; createdAt: string;
};
export type Store = {
  products: Product[];
  cart: Record<number, number>;
  orders: Order[];
  reviews: Review[];
  buyer: string;
  language: Language;
};
type ProductDraft = Pick<Product, 'category' | 'name' | 'description' | 'price' | 'stock' | 'discount'>;
export type Action =
  | { kind: 'quantity'; id: number; quantity: number }
  | { kind: 'checkout'; now: string }
  | { kind: 'pay' | 'cancel' | 'advance'; id: number }
  | { kind: 'review'; id: number; rating: number; comment: string; now: string }
  | { kind: 'profile'; buyer: string }
  | { kind: 'language'; language: Language }
  | { kind: 'saveProduct'; id?: number; product: ProductDraft }
  | { kind: 'visibility'; id: number };
export type ErrorCode = 'unavailable' | 'stock' | 'emptyCart' | 'orderMissing' | 'orderClosed' | 'paymentRequired' | 'invalidReview' | 'invalidProduct' | 'productExists' | 'invalidName';
type Result = { ok: true; state: Store } | { ok: false; error: ErrorCode };

export function initialStore(): Store {
  return { products: catalog, cart: {}, orders: [], reviews: [], buyer: '', language: 'ru' };
}

export function salePrice(product: Product): number {
  return Math.round(product.price * (100 - product.discount) / 100);
}

export function basketLines(state: Store): OrderLine[] {
  return state.products.flatMap(product => state.cart[product.id] ? [{
    productId: product.id,
    name: product.name,
    quantity: state.cart[product.id],
    unitPrice: salePrice(product),
  }] : []);
}

export function basketTotal(lines: OrderLine[]): number {
  return lines.reduce((total, line) => total + line.unitPrice * line.quantity, 0);
}

export function canChangeOrder(order: Order): boolean {
  return order.status === 'new' || order.status === 'confirmed';
}

export const nextOrderStatus: Partial<Record<OrderStatus, OrderStatus>> = {
  new: 'confirmed',
  confirmed: 'shipped',
  shipped: 'completed',
};

export function updateStore(state: Store, action: Action): Result {
  const success = (changes: Partial<Store>): Result => ({ ok: true, state: { ...state, ...changes } });
  const error = (code: ErrorCode): Result => ({ ok: false, error: code });
  const product = 'id' in action ? state.products.find(item => item.id === action.id) : undefined;
  const order = 'id' in action ? state.orders.find(item => item.id === action.id) : undefined;
  const changeOrder = (changes: Partial<Order>, products = state.products): Result =>
    success({ products, orders: state.orders.map(item => item === order ? { ...item, ...changes } : item) });

  switch (action.kind) {
    case 'quantity': {
      if (!product?.active) return error('unavailable');
      const current = state.cart[product.id] ?? 0;
      if (!Number.isInteger(action.quantity) || action.quantity < 0
        || (action.quantity > current && action.quantity > product.stock)) {
        return error('stock');
      }
      const cart = { ...state.cart };
      if (action.quantity > 0) cart[product.id] = action.quantity;
      else delete cart[product.id];
      return success({ cart });
    }
    case 'checkout': {
      const lines = basketLines(state);
      if (!lines.length) return error('emptyCart');
      const invalidLine = lines.some(line => {
        const item = state.products.find(candidate => candidate.id === line.productId);
        return !item?.active || item.stock < line.quantity;
      });
      if (invalidLine) return error('stock');
      const newOrder: Order = {
        id: (state.orders[0]?.id ?? 0) + 1,
        createdAt: action.now,
        buyer: state.buyer,
        status: 'new',
        payment: 'unpaid',
        total: basketTotal(lines),
        lines,
      };
      const products = state.products.map(item => {
        const quantity = state.cart[item.id];
        return quantity ? { ...item, stock: item.stock - quantity } : item;
      });
      return success({ products, cart: {}, orders: [newOrder, ...state.orders] });
    }
    case 'pay':
      if (!order) return error('orderMissing');
      if (!canChangeOrder(order)) return error('orderClosed');
      return changeOrder({ payment: 'paid' });
    case 'cancel': {
      if (!order) return error('orderMissing');
      if (order.status === 'cancelled') return success({});
      if (!canChangeOrder(order)) return error('orderClosed');
      const products = state.products.map(item => {
        const line = order.lines.find(entry => entry.productId === item.id);
        return line ? { ...item, stock: item.stock + line.quantity } : item;
      });
      return changeOrder({ status: 'cancelled', payment: order.payment === 'paid' ? 'refunded' : order.payment }, products);
    }
    case 'advance': {
      if (!order) return error('orderMissing');
      const next = nextOrderStatus[order.status];
      if (!next) return error('orderClosed');
      if (next === 'shipped' && order.payment !== 'paid') return error('paymentRequired');
      return changeOrder({ status: next });
    }
    case 'review': {
      if (!product?.active) return error('unavailable');
      const comment = action.comment.trim();
      if (!Number.isInteger(action.rating) || action.rating < 1 || action.rating > 5 || !comment || comment.length > 2000) {
        return error('invalidReview');
      }
      const review = {
        id: (state.reviews[0]?.id ?? 0) + 1,
        productId: product.id,
        author: state.buyer,
        rating: action.rating,
        comment,
        createdAt: action.now,
      };
      return success({ reviews: [review, ...state.reviews] });
    }
    case 'profile': {
      const buyer = action.buyer.trim();
      if (!buyer || buyer.length > 60) return error('invalidName');
      return success({ buyer });
    }
    case 'language':
      return success({ language: action.language });
    case 'saveProduct': {
      const draft = { ...action.product, name: action.product.name.trim(), description: action.product.description.trim() };
      const valid = draft.name && draft.name.length <= 120 && draft.description.length <= 2000
        && categories.includes(draft.category)
        && Number.isSafeInteger(draft.price) && draft.price > 0 && draft.price <= 100_000_000
        && Number.isInteger(draft.stock) && draft.stock >= 0 && draft.stock <= 99_999
        && Number.isInteger(draft.discount) && draft.discount >= 0 && draft.discount <= 100;
      if (!valid) return error('invalidProduct');
      if (action.id != null && !product) return error('unavailable');
      if (state.products.some(item => item.id !== action.id && item.name.toLowerCase() === draft.name.toLowerCase())) {
        return error('productExists');
      }
      const keepTranslations = product?.description === draft.description;
      const item: Product = {
        ...draft,
        id: product?.id ?? Math.max(0, ...state.products.map(item => item.id)) + 1,
        image: product?.image ?? null,
        active: product?.active ?? true,
        descriptionKk: keepTranslations ? product.descriptionKk : '',
        descriptionEn: keepTranslations ? product.descriptionEn : '',
      };
      return success({ products: product ? state.products.map(existing => existing === product ? item : existing) : [...state.products, item] });
    }
    case 'visibility': {
      if (!product) return error('unavailable');
      const cart = { ...state.cart };
      if (product.active) delete cart[product.id];
      const products = state.products.map(item => item === product ? { ...item, active: !item.active } : item);
      return success({ cart, products });
    }
  }
}
