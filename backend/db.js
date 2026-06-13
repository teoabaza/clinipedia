const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS nodes (
        id          SERIAL PRIMARY KEY,
        parent_id   INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
        type        TEXT NOT NULL CHECK (type IN ('category', 'subcategory', 'fragment')),
        title       TEXT NOT NULL DEFAULT '',
        content     TEXT,
        color       TEXT DEFAULT '#4f46e5',
        position    INTEGER NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ DEFAULT NOW(),
        updated_at  TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS nodes_parent_idx ON nodes(parent_id);

      CREATE OR REPLACE FUNCTION update_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
      $$ LANGUAGE plpgsql;

      DROP TRIGGER IF EXISTS set_updated_at ON nodes;
      CREATE TRIGGER set_updated_at
        BEFORE UPDATE ON nodes
        FOR EACH ROW EXECUTE FUNCTION update_updated_at();
    `);
    console.log('Database initialised');
  } finally {
    client.release();
  }
}

module.exports = { pool, initDb };
