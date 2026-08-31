/**
 * db.js — PostgreSQL connection pool for order-service.
 *
 * Uses a pool (not a single connection) because Express handles many
 * concurrent requests — the pool hands each request a free connection
 * and reuses them, which is the standard pattern for a Node API talking
 * to Postgres.
 */

const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/flavorblitz",
});

module.exports = pool;
