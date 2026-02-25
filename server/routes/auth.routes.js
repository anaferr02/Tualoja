import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { get, run } from "../db.js";

export function authRoutes(db) {
  const router = express.Router();

  router.post("/register", async (req, res) => {
    const { email, name, password } = req.body || {};
    if (!email || !name || !password) return res.status(400).json({ error: "Faltan datos" });

    const existing = await get(db, "SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);
    if (existing) return res.status(409).json({ error: "El email ya está registrado" });

    const hash = await bcrypt.hash(password, 10);
    const result = await run(
      db,
      "INSERT INTO users (email, name, password_hash, role) VALUES (?, ?, ?, 'guest')",
      [email.toLowerCase(), name, hash]
    );

    const user = await get(db, "SELECT id, email, name, role FROM users WHERE id = ?", [result.lastID]);
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({ token, user });
  });

  router.post("/login", async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "Faltan datos" });

    const user = await get(db, "SELECT * FROM users WHERE email = ?", [email.toLowerCase()]);
    if (!user) return res.status(401).json({ error: "Credenciales incorrectas" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales incorrectas" });

    const safeUser = { id: user.id, email: user.email, name: user.name, role: user.role };
    const token = jwt.sign(safeUser, process.env.JWT_SECRET, { expiresIn: "30d" });

    res.json({ token, user: safeUser });
  });

  return router;
}
