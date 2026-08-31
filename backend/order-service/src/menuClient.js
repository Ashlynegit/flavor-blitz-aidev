/**
 * menuClient.js — order-service's client for talking to menu-service.
 *
 * order-service never reads menu_items from the database directly, even
 * though both services share a Postgres instance. It goes through
 * menu-service's HTTP API instead — that's what keeps the two genuinely
 * independent: menu-service could change its schema or even switch
 * databases entirely, and order-service wouldn't need to know.
 */

const MENU_SERVICE_URL =
  process.env.MENU_SERVICE_URL || "http://localhost:5000";

async function fetchMenu() {
  const res = await fetch(`${MENU_SERVICE_URL}/api/menu`, {
    signal: AbortSignal.timeout(3000),
  });
  if (!res.ok) {
    throw new Error(`menu-service responded with ${res.status}`);
  }
  return res.json();
}

module.exports = { fetchMenu };
