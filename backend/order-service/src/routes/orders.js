/**
 * routes/orders.js — POST /api/orders
 *
 * Deliberately does NOT trust the total sent by the frontend. It refetches
 * current prices from menu-service and recalculates subtotal/tax/total
 * itself — otherwise anyone could open dev tools and submit any total they
 * want. This is the same reason real payment backends never trust client
 * math.
 */

const express = require("express");
const pool = require("../db");
const { fetchMenu } = require("../menuClient");
const { charge } = require("../paymentGateway");

const router = express.Router();
const TAX_RATE = 0.08;

router.post("/", async (req, res) => {
  const { items, payment } = req.body;

  if (!items || typeof items !== "object" || Object.keys(items).length === 0) {
    return res.status(400).json({ error: "Order must contain at least one item." });
  }

  let menu;
  try {
    menu = await fetchMenu();
  } catch (err) {
    return res.status(503).json({ error: "menu-service unavailable", detail: err.message });
  }

  const lineItems = [];
  let subtotal = 0;

  for (const [itemId, qty] of Object.entries(items)) {
    const menuItem = menu.find((m) => m.id === itemId);
    if (!menuItem) {
      return res.status(400).json({ error: `Unknown item id: ${itemId}` });
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ error: `Invalid quantity for ${itemId}` });
    }
    subtotal += menuItem.price * qty;
    lineItems.push({ ...menuItem, quantity: qty });
  }

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  try {
    const paymentResult = await charge({
      amount: total,
      card: payment && payment.card,
    });

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const orderRes = await client.query(
        `INSERT INTO orders (subtotal, tax, total, status, payment_mode)
         VALUES ($1, $2, $3, 'confirmed', 'simulated')
         RETURNING order_number`,
        [subtotal.toFixed(2), tax.toFixed(2), total.toFixed(2)]
      );
      const orderNumber = orderRes.rows[0].order_number;

      for (const item of lineItems) {
        await client.query(
          `INSERT INTO order_items (order_number, item_id, item_name, unit_price, quantity)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderNumber, item.id, item.name, item.price.toFixed(2), item.quantity]
        );
      }

      await client.query("COMMIT");

      return res.status(201).json({
        orderNumber,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        total: total.toFixed(2),
        paymentReference: paymentResult.reference,
      });
    } catch (dbErr) {
      await client.query("ROLLBACK");
      throw dbErr;
    } finally {
      client.release();
    }
  } catch (err) {
    return res.status(402).json({ error: "Payment failed", detail: err.message });
  }
});

router.get("/:orderNumber", async (req, res) => {
  const { orderNumber } = req.params;

  const orderRes = await pool.query(
    "SELECT * FROM orders WHERE order_number = $1",
    [orderNumber]
  );
  if (orderRes.rows.length === 0) {
    return res.status(404).json({ error: "Order not found" });
  }

  const itemsRes = await pool.query(
    "SELECT item_id, item_name, unit_price, quantity FROM order_items WHERE order_number = $1",
    [orderNumber]
  );

  return res.json({ ...orderRes.rows[0], items: itemsRes.rows });
});

module.exports = router;
