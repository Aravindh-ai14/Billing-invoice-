const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: +(process.env.PGPORT || 5434),
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "",
  database: process.env.PGDATABASE || "postersdb",
});

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Simple key/value store: keys "invDraft" and "invPresets"
app.get("/api/kv/:key", async (req, res) => {
  try {
    const r = await pool.query("SELECT value FROM invoice_kv WHERE key=$1", [req.params.key]);
    if (!r.rows.length) return res.status(404).json({ error: "not found" });
    res.json(r.rows[0].value);
  } catch (e) { res.status(500).json({ error: e.message }); }
});
app.put("/api/kv/:key", async (req, res) => {
  try {
    await pool.query(
      `INSERT INTO invoice_kv(key,value,updated_at) VALUES($1,$2,now())
       ON CONFLICT (key) DO UPDATE SET value=$2, updated_at=now()`,
      [req.params.key, JSON.stringify(req.body)]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

(async () => {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS invoice_kv(
      key text PRIMARY KEY, value jsonb NOT NULL, updated_at timestamptz DEFAULT now())`);
    console.log("PostgreSQL connected");
  } catch (e) {
    console.warn("PostgreSQL not available, app still works with browser storage:", e.message);
  }
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log("Open http://localhost:" + port));
})();
