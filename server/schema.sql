PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'guest', -- 'guest' | 'host'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  host_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Alojamiento',
  description TEXT NOT NULL,
  province TEXT NOT NULL,
  city TEXT NOT NULL,
  address_approx TEXT DEFAULT '',
  capacity INTEGER NOT NULL DEFAULT 1,
  price_per_night INTEGER NOT NULL DEFAULT 0,
  cover_image_url TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active', -- active | paused
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (host_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS bookings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER NOT NULL,
  guest_id INTEGER NOT NULL,
  date_from TEXT NOT NULL, -- YYYY-MM-DD
  date_to TEXT NOT NULL,   -- YYYY-MM-DD (checkout)
  guests INTEGER NOT NULL DEFAULT 1,
  total INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'confirmed', -- confirmed | cancelled
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
  FOREIGN KEY (guest_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_listings_city ON listings(city);
CREATE INDEX IF NOT EXISTS idx_bookings_listing ON bookings(listing_id);
