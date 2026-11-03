-- Ongeslagen leaderboard. Eenmalig uitvoeren in de D1-console van Cloudflare.
CREATE TABLE IF NOT EXISTS scores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  speler_id TEXT NOT NULL,
  account_id TEXT,              -- voor later inloggen
  naam TEXT NOT NULL,
  modus TEXT NOT NULL CHECK (modus IN ('normaal', 'hardcore')),
  pts INTEGER NOT NULL,
  w INTEGER NOT NULL,
  l INTEGER NOT NULL,
  d INTEGER NOT NULL,
  titels INTEGER NOT NULL,
  week TEXT NOT NULL,           -- maandag van die week (UTC), bijvoorbeeld 2026-11-02
  gemaakt INTEGER NOT NULL      -- tijdstip in milliseconden
);
CREATE INDEX IF NOT EXISTS idx_alltime ON scores (modus, pts DESC);
CREATE INDEX IF NOT EXISTS idx_week ON scores (modus, week, pts DESC);
CREATE INDEX IF NOT EXISTS idx_speler ON scores (speler_id, gemaakt);
