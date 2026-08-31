-- schema.sql
-- Run against the same PostgreSQL instance as menu-service, but the
-- order-service only ever touches these two tables — it never reads or
-- writes menu_items directly. If it needs menu data it calls menu-service's
-- API, same as the frontend does. That boundary is what keeps these
-- "microservices" rather than one app split across two folders.

CREATE TABLE IF NOT EXISTS orders (
    order_number  SERIAL PRIMARY KEY,
    subtotal      NUMERIC(8, 2) NOT NULL,
    tax           NUMERIC(8, 2) NOT NULL,
    total         NUMERIC(8, 2) NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    payment_mode  VARCHAR(20) NOT NULL DEFAULT 'simulated',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS order_items (
    id            SERIAL PRIMARY KEY,
    order_number  INTEGER NOT NULL REFERENCES orders(order_number) ON DELETE CASCADE,
    item_id       VARCHAR(10) NOT NULL,
    item_name     VARCHAR(100) NOT NULL,
    unit_price    NUMERIC(6, 2) NOT NULL,
    quantity      INTEGER NOT NULL CHECK (quantity > 0)
);
