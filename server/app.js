import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import path from "path";
import { openDb, initDb, resolvePath, get } from "./db.js";
import { authRoutes } from "./routes/auth.routes.js";
import { listingsRoutes } from "./routes/listings.routes.js";
import { bookingsRoutes } from "./routes/bookings.routes.js";
import jwt from "jsonwebtoken";
import { requireAuth } from "./middleware/auth.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || "./server/tualoja.sqlite";

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// DB init
const db = openDb(resolvePath(DB_FILE));
await initDb(db, resolvePath("./server/schema.sql"));

// API
app.use("/api/auth", authRoutes(db));
app.use("/api/listings", listingsRoutes(db));
app.use("/api/bookings", bookingsRoutes(db));

// "Quién soy" (para el frontend)
app.get("/api/me", requireAuth, async (req, res) => {
  // refresca role por si cambió a host
  const user = await get(db, "SELECT id, email, name, role FROM users WHERE id = ?", [req.user.id]);
  const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "30d" });
  res.json({ user, token });
});

// Servir tu web (root del repo)
app.use(express.static(path.resolve(process.cwd())));

app.listen(PORT, () => {
  console.log(`TuAloja funcionando en http://localhost:${PORT}`);
});
