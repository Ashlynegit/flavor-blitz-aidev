"""
db.py — PostgreSQL connection helper for the menu-service.

Kept deliberately small and dependency-light (psycopg2, no ORM) so it's
easy to read and reason about — appropriate for a service this size.
Connection details come from environment variables (see .env.example),
never hardcoded, so this same code works locally, in Docker, and in CI.
"""

import os
import psycopg2
from psycopg2.extras import RealDictCursor

DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/flavorblitz",
)


def get_connection():
    """Open a new connection to PostgreSQL.

    Each request gets its own short-lived connection — simple and safe
    for a small service. If load ever justified it, this is the spot
    to swap in a connection pool (e.g. psycopg2.pool or SQLAlchemy).
    """
    return psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
