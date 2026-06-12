/**
 * Placeholder provider for development.
 * "card" simulates an instant successful charge; "cod" defers payment to delivery.
 */
export default {
  name: "placeholder",
  async charge({ amount, currency = "GBP", method, meta = {} }) {
    if (method === "cod") {
      return { success: true, transactionId: null, status: "pending-on-delivery" };
    }
    return {
      success: true,
      transactionId: `DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      status: "paid",
      raw: { amount, currency, method, meta, simulated: true },
    };
  },
};
