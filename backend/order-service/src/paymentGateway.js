/**
 * paymentGateway.js — simulated payment processor.
 *
 * This is the ONLY file that needs to change to plug in a real processor
 * (e.g. Stripe PaymentIntents). Everything else in order-service calls
 * `charge()` and only cares about the { success, reference } shape it
 * returns, or the error it throws — so swapping the implementation here
 * doesn't ripple anywhere else in the codebase.
 */

function luhnCheck(numStr) {
  const digits = numStr.replace(/\s+/g, "");
  if (!/^\d{13,19}$/.test(digits)) return false;
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

/**
 * charge({ amount, card }) -> { success: true, reference: string }
 * Throws an Error with a user-facing message on failure.
 */
async function charge({ amount, card }) {
  await new Promise((r) => setTimeout(r, 400)); // simulate gateway latency

  if (!card || !card.number || !luhnCheck(card.number)) {
    throw new Error("Card failed validation.");
  }
  if (amount <= 0) {
    throw new Error("Charge amount must be positive.");
  }

  const reference = `SIM-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return { success: true, reference };
}

module.exports = { charge, luhnCheck };
