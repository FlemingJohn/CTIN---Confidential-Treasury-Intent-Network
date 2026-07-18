export type ToastVariant = 'pending' | 'success' | 'error' | 'info';

export interface ToastInput {
  variant: ToastVariant;
  message: string;
  href?: string;
}

export interface ToastMessage extends ToastInput {
  id: number;
}
