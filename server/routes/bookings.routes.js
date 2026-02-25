import express from "express";
import { all, get, run } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

function nightsBetween(dateFrom, dateTo) {
  const a = new Date(dateFrom + "T00:00:00");
  const b = new Date(dateTo + "T00:00:00");
  const diff = (b - a) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.floor(diff));
}

export function bookingsRoutes(db) {
  const router = express.Router();

  // Crear reserva (guest)
  router.post("/", requireAuth, async (req, res) => {
    const { listing_id, date_from, date_to, guests } = req.body || {};
    if (!listing_id || !date_from || !date_to) return res.status(400).json({ error: "Faltan datos" });

    const listing = await get(db, "SELECT * FROM listings WHERE id = ? AND status='active'", [Number(listing_id)]);
    if (!listing) return res.status(404).json({ error: "Alojamiento no encontrado" });

    const nights = nightsBetween(String(date_from), String(date_to));
    if (nights <= 0) return res.status(400).json({ error: "Fechas inválidas" });

    const g = Number(guests || 1);
    if (g < 1 || g > listing.capacity) return res.status(400).json({ error: "Cantidad de huéspedes inválida" });

    // Validar solapamiento
    const clash = await get(db, `
      SELECT id FROM bookings
      WHERE listing_id = ?
      AND status='confirmed'
      AND date_from < ?
      AND date_to > ?
      LIMIT 1
    `, [listing.id, String(date_to), String(date_from)]);

    if (clash) return res.status(409).json({ error: "Ese alojamiento ya está reservado en esas fechas" });

    const total = nights * listing.price_per_night;

    const result = await run(db, `
      INSERT INTO bookings (listing_id, guest_id, date_from, date_to, guests, total, status)
      VALUES (?, ?, ?, ?, ?, ?, 'confirmed')
    `, [listing.id, req.user.id, String(date_from), String(date_to), g, total]);

    const created = await get(db, "SELECT * FROM bookings WHERE id = ?", [result.lastID]);
    res.json(created);
  });

  // Mis reservas (guest)
  router.get("/my", requireAuth, async (req, res) => {
    const rows = await all(db, `
      SELECT b.*, l.title, l.city, l.province, l.cover_image_url
      FROM bookings b
      JOIN listings l ON l.id = b.listing_id
      WHERE b.guest_id = ?
      ORDER BY b.id DESC
    `, [req.user.id]);
    res.json(rows);
  });

  // Reservas para mis alojamientos (host)
  router.get("/host", requireAuth, async (req, res) => {
    const rows = await all(db, `
      SELECT b.*, l.title, l.city, l.province, u.name as guest_name, u.email as guest_email
      FROM bookings b
      JOIN listings l ON l.id = b.listing_id
      JOIN users u ON u.id = b.guest_id
      WHERE l.host_id = ?
      ORDER BY b.id DESC
    `, [req.user.id]);
    res.json(rows);
  });

  // Cancelar reserva (guest)
  router.post("/:id/cancel", requireAuth, async (req, res) => {
    const id = Number(req.params.id);
    const booking = await get(db, "SELECT * FROM bookings WHERE id = ? AND guest_id = ?", [id, req.user.id]);
    if (!booking) return res.status(404).json({ error: "Reserva no encontrada" });

    await run(db, "UPDATE bookings SET status='cancelled' WHERE id = ?", [id]);
    const updated = await get(db, "SELECT * FROM bookings WHERE id = ?", [id]);
    res.json(updated);
  });

  return router;
}
