export const orderStatuses = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
} as const;
export type OrderStatus = (typeof orderStatuses)[keyof typeof orderStatuses];
