-- Baseline migration (WP0.2): turn on the trigram extension used for fuzzy text search later.
CREATE EXTENSION IF NOT EXISTS pg_trgm;
