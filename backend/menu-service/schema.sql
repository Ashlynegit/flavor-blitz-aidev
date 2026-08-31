-- schema.sql
-- Run this once against your PostgreSQL database to create the menu table.
-- Example: psql -U postgres -d flavorblitz -f schema.sql

CREATE TABLE IF NOT EXISTS menu_items (
    id          VARCHAR(10) PRIMARY KEY,
    category    VARCHAR(20) NOT NULL CHECK (category IN ('burgers', 'chips', 'drinks')),
    name        VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    price       NUMERIC(6, 2) NOT NULL CHECK (price >= 0),
    heat        SMALLINT NOT NULL DEFAULT 0 CHECK (heat BETWEEN 0 AND 3),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
