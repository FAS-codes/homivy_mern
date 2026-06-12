/**
 * Modular payment gateway.
 *
 * Every provider implements:
 *   charge({ amount, currency, method, meta }) -> { success, transactionId, status, raw? }
 *
 * To integrate a real gateway later:
 *   1. Fill in payments/providers/stripe.js or paypal.js (SDK calls go there).
 *   2. Set PAYMENT_PROVIDER=stripe (or paypal) in .env.
 *   Nothing in the order flow needs to change.
 */
import placeholder from "./providers/placeholder.js";
import stripe from "./providers/stripe.js";
import paypal from "./providers/paypal.js";

const providers = { placeholder, stripe, paypal };

export function getPaymentProvider(name = process.env.PAYMENT_PROVIDER || "placeholder") {
  const provider = providers[name];
  if (!provider) throw new Error(`Unknown payment provider: ${name}`);
  return provider;
}

/** Payment methods exposed to the checkout page. */
export const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", description: "Pay when your order arrives", enabled: true },
  { id: "card", label: "Credit / Debit Card", description: "Demo mode — no real charge", enabled: true },
  { id: "stripe", label: "Stripe", description: "Coming soon", enabled: false },
  { id: "paypal", label: "PayPal", description: "Coming soon", enabled: false },
];
