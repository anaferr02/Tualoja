import express from "express";
import { all, get, run } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

function nightsBetween(dateFrom, dateTo) {
  const a = new Date(dateFrom + "T00:00:00");
  const b = new Date(dateTo + "T00:00:00");
  const diff = (b - a) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.floor(diff));
}

export function listingsRoutes(db) {
  const router = express.Router();

  // Buscar/listar (público)
  router.get("/", async (req, res) => {
    const { city, province, guests, date_from, date_to, q } = req.query;

    const where = ["status = 'active'"];
    const params = [];

    if (city) {
      where.push("LOWER(city) LIKE ?");
      params.push(`%${String(city).toLowerCase()}%`);
    }
    if (province) {
      where.push("LOWER(province) LIKE ?");
      params.push(`%${String(province).toLowerCase()}%`);
    }
    if (guests) {
      where.push("capacity >= ?");
      params.push(Number(guests));
    }
    if (q) {
      where.push("(LOWER(title) LIKE ? OR LOWER(description) LIKE ?)");
      params.push(`%${String(q).toLowerCase()}%`, `%${String(q).toLowerCase()}%`);
    }

    // Filtro por disponibilidad (evitar solapamientos)
    // Un booking solapa si: date_from < date_to AND date_to > date_from
    // Queremos listar SOLO los que NO tengan solapamientos.
    let availabilityJoin = "";
    if (date_from && date_to) {
      availabilityJoin = `
        AND id NOT IN (
          SELECT listing_id FROM bookings
          WHERE status='confirmed'
          AND date_from < ?
          AND date_to > ?
        )
      `;
      params.push(String(date_to), String(date_from));
    }

    const sql = `
      SELECT id, title, type, city, province, capacity, price_per_night, cover_image_url
      FROM listings
      WHERE ${where.join(" AND ")} ${availabilityJoin}
      ORDER BY id DESC
      LIMIT 200
    `;

    const rows = await all(db, sql, params);

    // Si pasan fechas, devolvemos total estimado
    let nights = 0;
    if (date_from && date_to) nights = nightsBetween(String(date_from), String(date_to));

    const out = rows.map(r => ({
      ...r,
      nights,
      estimated_total: nights ? nights * r.price_per_night : null
    }));

    res.json(out);
  });

  // Detalle (público)
  router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const row = await get(db, `
      SELECT l.*, u.name as host_name
      FROM listings l
      JOIN users u ON u.id = l.host_id
      WHERE l.id = ?
    `, [id]);

    if (!row) return res.status(404).json({ error: "No encontrado" });
    res.json(row);
  });

  // Crear alojamiento (requiere login; el usuario pasa a host automáticamente)
  router.post("/", requireAuth, async (req, res) => {
    const {
      title,
      type,
      description,
      province,
      city,
      address_approx,
      capacity,
      price_per_night,
      cover_image_url
    } = req.body || {};

    if (!title || !description || !province || !city) {
      return res.status(400).json({ error: "Faltan datos obligatorios" });
    }

    // Si es guest, lo convertimos a host (MVP simple)
    await run(db, "UPDATE users SET role='host' WHERE id = ? AND role='guest'", [req.user.id]);

    const result = await run(db, `
      INSERT INTO listings (host_id, title, type, description, province, city, address_approx, capacity, price_per_night, cover_image_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      req.user.id,
      title,
      type || "Alojamiento",
      description,
      province,
      city,
      address_approx || "",
      Number(capacity || 1),
      Number(price_per_night || 0),
      cover_image_url || ""
    ]);

    const created = await get(db, "SELECT * FROM listings WHERE id = ?", [result.lastID]);
    res.json(created);
  });

  // Mis alojamientos (host)
  router.get("/me/host", requireAuth, async (req, res) => {
    const rows = await all(db, `
      SELECT id, title, city, province, price_per_night, status, cover_image_url
      FROM listings
      WHERE host_id = ?
      ORDER BY id DESC
    `, [req.user.id]);
    res.json(rows);
  });

  return router;
}
