
import { PaymentInterval } from "@/context/auth/auth-types";

/**
 * Format price to display with decimal only for monthly plans
 */
export const formatPrice = (price: number, interval: PaymentInterval | null = null): string => {
  if (interval === 'monthly') {
    return price.toFixed(2);
  }
  return Math.floor(price).toString();
};

/**
 * Get billing label based on payment interval
 */
export const getBillingLabel = (interval: PaymentInterval): string => {
  switch (interval) {
    case 'monthly':
      return 'Paid Monthly';
    case 'annual':
      return 'Paid Annually';
    case 'one_time':
      return 'Lifetime';
    default:
      return 'Paid Annually';
  }
};

/**
 * Pricing data
 */
export const pricingData = {
  individual: {
    monthly: 2.50,
    annual: 10.00,
    one_time: 18.00,
    maxUsers: 1
  },
  family: {
    monthly: 3.50,
    annual: 15.00,
    one_time: 25.00,
    maxUsers: 5
  },
  teacher: {
    price: 60.00,
    billing: 'Paid Annually',
    maxUsers: 40
  },
  school: {
    price: 600.00,
    billing: 'Paid Annually',
    maxUsers: 500
  }
};
