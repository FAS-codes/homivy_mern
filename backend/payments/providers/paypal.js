/**
 * PayPal provider — stub, ready for integration.
 *
 * To integrate:
 *   npm i @paypal/checkout-server-sdk
 *   Use PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET from .env to create and capture an order,
 *   then return { success, transactionId, status }.
 */
export default {
  name: "paypal",
  async charge() {
    throw new Error("PayPal is not configured yet. Set PAYPAL_CLIENT_ID/SECRET and implement payments/providers/paypal.js");
  },
};
