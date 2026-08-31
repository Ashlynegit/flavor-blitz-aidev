/* =========================================================================
   Flavor Blitz — frontend logic
   Menu is fetched from the menu-service API (Python/Flask) when available,
   and falls back to this local copy so the UI works standalone during
   frontend-only development. Same shape either way: keeps the frontend
   decoupled from whichever backend is actually running.
   ========================================================================= */

const MENU_API_BASE = window.FLAVOR_BLITZ_MENU_API_BASE || "http://localhost:5000";
const ORDER_API_BASE = window.FLAVOR_BLITZ_ORDER_API_BASE || "http://localhost:4000";

const FALLBACK_MENU = [
  { id: "b1", category: "burgers", name: "Blitz Classic", desc: "Flame-grilled beef patty, cheddar, house sauce, pickles.", price: 6.5, heat: 0 },
  { id: "b2", category: "burgers", name: "Smoke & Char Double", desc: "Two patties, smoked bacon, caramelized onion, BBQ glaze.", price: 8.75, heat: 1 },
  { id: "b3", category: "burgers", name: "Ghost Pepper Burner", desc: "Beef patty, ghost pepper jam, pepper jack, jalapeños.", price: 8.25, heat: 3 },
  { id: "b4", category: "burgers", name: "Garden Blitz", desc: "Grilled plant patty, avocado, roasted pepper, chipotle mayo.", price: 7.25, heat: 1 },
  { id: "c1", category: "chips", name: "Skin-On Fries", desc: "Crisp-cut, sea salt, served hot.", price: 3.0, heat: 0 },
  { id: "c2", category: "chips", name: "Loaded Chili Chips", desc: "Fries, house chili, melted cheese, spring onion.", price: 5.5, heat: 2 },
  { id: "c3", category: "chips", name: "Cajun Spiced Wedges", desc: "Skin-on wedges, cajun rub, garlic aioli.", price: 4.0, heat: 2 },
  { id: "d1", category: "drinks", name: "House Cola", desc: "Classic, ice-cold, 500ml.", price: 2.0, heat: 0 },
  { id: "d2", category: "drinks", name: "Mango Chili Cooler", desc: "Fresh mango, lime, a pinch of chili.", price: 3.25, heat: 1 },
  { id: "d3", category: "drinks", name: "Sparkling Ginger Brew", desc: "House-brewed ginger, sparkling water.", price: 3.0, heat: 0 },
];

const TAX_RATE = 0.08;

let menu = [];
let cart = {}; // { itemId: qty }
let orderNumber = null;

/* ---------- Data ---------- */

async function loadMenu() {
  try {
    const res = await fetch(`${MENU_API_BASE}/api/menu`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error("bad response");
    const data = await res.json();
    menu = Array.isArray(data) && data.length ? data : FALLBACK_MENU;
  } catch (err) {
    menu = FALLBACK_MENU;
  }
  renderMenu();
}

function renderMenu() {
  const grids = {
    burgers: document.getElementById("grid-burgers"),
    chips: document.getElementById("grid-chips"),
    drinks: document.getElementById("grid-drinks"),
  };
  Object.values(grids).forEach((g) => (g.innerHTML = ""));

  menu.forEach((item) => {
    const grid = grids[item.category];
    if (!grid) return;

    const card = document.createElement("div");
    card.className = "menu-item";
    card.innerHTML = `
      <div class="item-top">
        <p class="item-name">${escapeHtml(item.name)}</p>
        <span class="item-heat" aria-label="${item.heat} out of 3 heat">${"🌶".repeat(item.heat)}</span>
      </div>
      <p class="item-desc">${escapeHtml(item.desc)}</p>
      <div class="item-bottom">
        <span class="item-price">$${item.price.toFixed(2)}</span>
        <button class="item-add" data-id="${item.id}">Add</button>
      </div>
    `;
    grid.appendChild(card);
  });

  document.querySelectorAll(".item-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.id);
      btn.classList.add("just-added");
      btn.textContent = "Added ✓";
      setTimeout(() => {
        btn.classList.remove("just-added");
        btn.textContent = "Add";
      }, 700);
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- Cart / ticket ---------- */

function addToCart(itemId) {
  cart[itemId] = (cart[itemId] || 0) + 1;
  renderTicket();
  openTicket();
}

function changeQty(itemId, delta) {
  if (!cart[itemId]) return;
  cart[itemId] += delta;
  if (cart[itemId] <= 0) delete cart[itemId];
  renderTicket();
}

function cartItemCount() {
  return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
}

function cartTotals() {
  let subtotal = 0;
  for (const [id, qty] of Object.entries(cart)) {
    const item = menu.find((m) => m.id === id);
    if (item) subtotal += item.price * qty;
  }
  const tax = subtotal * TAX_RATE;
  return { subtotal, tax, total: subtotal + tax };
}

function renderTicket() {
  const linesEl = document.getElementById("ticketLines");
  const count = cartItemCount();

  document.getElementById("cartCount").textContent = count;
  document.getElementById("ticketToggleCount").textContent = count;

  if (count === 0) {
    linesEl.innerHTML = `<p class="ticket-empty">No items yet. Tap the menu to start your order.</p>`;
  } else {
    linesEl.innerHTML = "";
    for (const [id, qty] of Object.entries(cart)) {
      const item = menu.find((m) => m.id === id);
      if (!item) continue;
      const row = document.createElement("div");
      row.className = "ticket-line";
      row.innerHTML = `
        <span class="ticket-line-name">${qty}x ${escapeHtml(item.name)}</span>
        <span class="ticket-line-qty-controls">
          <button class="qty-btn" data-id="${id}" data-delta="-1" aria-label="Remove one ${escapeHtml(item.name)}">−</button>
          <button class="qty-btn" data-id="${id}" data-delta="1" aria-label="Add one ${escapeHtml(item.name)}">+</button>
        </span>
        <span>$${(item.price * qty).toFixed(2)}</span>
      `;
      linesEl.appendChild(row);
    }
    linesEl.querySelectorAll(".qty-btn").forEach((btn) => {
      btn.addEventListener("click", () => changeQty(btn.dataset.id, Number(btn.dataset.delta)));
    });
  }

  const { subtotal, tax, total } = cartTotals();
  document.getElementById("ticketSubtotal").textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("ticketTax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("ticketTotal").textContent = `$${total.toFixed(2)}`;
  document.getElementById("checkoutBtn").disabled = count === 0;

  document.getElementById("ticketTime").textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function openTicket() {
  document.getElementById("ticketPanel").classList.add("open");
}
function closeTicket() {
  document.getElementById("ticketPanel").classList.remove("open");
}

/* ---------- Checkout / simulated payment ---------- */

function openModal() {
  const { total } = cartTotals();
  document.getElementById("modalTotalLine").textContent = `Total due: $${total.toFixed(2)}`;
  document.getElementById("checkoutForm").hidden = false;
  document.getElementById("modalSuccess").hidden = true;
  document.getElementById("formError").textContent = "";
  document.getElementById("modalBackdrop").classList.add("open");
}
function closeModal() {
  document.getElementById("modalBackdrop").classList.remove("open");
}

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
 * Simulated payment processor.
 * Swap this function's body for a real gateway call (e.g. Stripe
 * PaymentIntents via the order-service) — the caller only cares that
 * it resolves { success, orderNumber } or throws.
 */
async function processPayment({ name, number, expiry, cvv, total }) {
  await new Promise((r) => setTimeout(r, 900)); // simulate network latency

  if (!name.trim()) throw new Error("Enter the name on the card.");
  if (!luhnCheck(number)) throw new Error("That card number doesn't look valid.");
  if (!/^\d{2}\/\d{2}$/.test(expiry)) throw new Error("Expiry should be in MM/YY format.");
  if (!/^\d{3,4}$/.test(cvv)) throw new Error("CVV should be 3 or 4 digits.");

  // Try the real order-service if it's running; fall back to a local
  // simulated confirmation so the UI keeps working standalone.
  try {
    const res = await fetch(`${ORDER_API_BASE}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(2500),
      body: JSON.stringify({
        items: cart,
        payment: {
          simulated: true,
          card: { number, expiry, cvv, name },
        },
      }),
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, orderNumber: data.orderNumber };
    }
  } catch (err) {
    /* backend not available — fall through to local simulation */
  }

  const simulatedOrderNumber = String(Math.floor(1000 + Math.random() * 9000));
  return { success: true, orderNumber: simulatedOrderNumber };
}

function formatCardNumberInput(el) {
  el.addEventListener("input", () => {
    const digits = el.value.replace(/\D/g, "").slice(0, 16);
    el.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });
}

function formatExpiryInput(el) {
  el.addEventListener("input", () => {
    let digits = el.value.replace(/\D/g, "").slice(0, 4);
    if (digits.length > 2) digits = digits.slice(0, 2) + "/" + digits.slice(2);
    el.value = digits;
  });
}

/* ---------- Wire up ---------- */

document.addEventListener("DOMContentLoaded", () => {
  loadMenu();

  document.getElementById("cartPill").addEventListener("click", (e) => {
    e.preventDefault();
    openTicket();
  });
  document.getElementById("ticketToggleMobile").addEventListener("click", openTicket);
  document.getElementById("ticketClose").addEventListener("click", closeTicket);

  document.getElementById("checkoutBtn").addEventListener("click", openModal);
  document.getElementById("modalClose").addEventListener("click", closeModal);
  document.getElementById("modalBackdrop").addEventListener("click", (e) => {
    if (e.target.id === "modalBackdrop") closeModal();
  });

  formatCardNumberInput(document.getElementById("ccNumber"));
  formatExpiryInput(document.getElementById("ccExpiry"));

  document.getElementById("checkoutForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const payBtn = document.getElementById("payBtn");
    const errorEl = document.getElementById("formError");
    errorEl.textContent = "";
    payBtn.disabled = true;
    payBtn.textContent = "Processing...";

    const { total } = cartTotals();

    try {
      const result = await processPayment({
        name: document.getElementById("ccName").value,
        number: document.getElementById("ccNumber").value,
        expiry: document.getElementById("ccExpiry").value,
        cvv: document.getElementById("ccCvv").value,
        total,
      });

      orderNumber = result.orderNumber;
      document.getElementById("orderNo").textContent = orderNumber;
      document.getElementById("successOrderNo").textContent = `Order #${orderNumber} is fired up and on its way.`;
      document.getElementById("checkoutForm").hidden = true;
      document.getElementById("modalSuccess").hidden = false;

      cart = {};
      renderTicket();
    } catch (err) {
      errorEl.textContent = err.message || "Something went wrong. Try again.";
    } finally {
      payBtn.disabled = false;
      payBtn.textContent = "Pay now";
    }
  });

  document.getElementById("successCloseBtn").addEventListener("click", () => {
    closeModal();
    closeTicket();
  });
});