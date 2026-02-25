import sqlite3 from "sqlite3";
import fs from "fs";
import path from "path";

export function openDb(dbFile) {
  const sqlite = sqlite3.verbose();
  return new sqlite.Database(dbFile);
}

export function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

export function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

export function initDb(db, schemaPath) {
  const schema = fs.readFileSync(schemaPath, "utf-8");
  return run(db, schema);
}

export function resolvePath(p) {
  return path.resolve(process.cwd(), p);
}
