/**
 * Stripe provider — stub, ready for integration.
 *
 * To integrate:
 *   npm i stripe
 *   import Stripe from "stripe";
 *   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
 *   ...create a PaymentIntent with `amount` (in pence) and return its id/status.
 */
export default {
  name: "stripe",
  async charge() {
    throw new Error("Stripe is not configured yet. Set STRIPE_SECRET_KEY and implement payments/providers/stripe.js");
  },
};
