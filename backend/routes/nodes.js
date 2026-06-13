const express = require('express');
const { pool } = require('../db');
const router = express.Router();

// GET /api/nodes?parent_id=x  — list children of a node (or root if omitted)
router.get('/', async (req, res) => {
  const { parent_id } = req.query;
  const { rows } = parent_id
    ? await pool.query(
        'SELECT * FROM nodes WHERE parent_id = $1 ORDER BY position, id',
        [parent_id]
      )
    : await pool.query(
        'SELECT * FROM nodes WHERE parent_id IS NULL ORDER BY position, id'
      );
  res.json(rows);
});

// GET /api/nodes/:id  — single node
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM nodes WHERE id = $1', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

// GET /api/nodes/:id/breadcrumb  — ancestor chain for navigation
router.get('/:id/breadcrumb', async (req, res) => {
  const { rows } = await pool.query(`
    WITH RECURSIVE ancestors AS (
      SELECT id, parent_id, title, type
        FROM nodes WHERE id = $1
      UNION ALL
      SELECT n.id, n.parent_id, n.title, n.type
        FROM nodes n JOIN ancestors a ON n.id = a.parent_id
    )
    SELECT * FROM ancestors ORDER BY id
  `, [req.params.id]);
  res.json(rows.reverse());
});

// POST /api/nodes  — create
router.post('/', async (req, res) => {
  const { parent_id = null, type, title = '', content = null, color = '#4f46e5', position = 0 } = req.body;
  if (!type) return res.status(400).json({ error: 'type is required' });

  const { rows } = await pool.query(
    `INSERT INTO nodes (parent_id, type, title, content, color, position)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [parent_id, type, title, content, color, position]
  );
  res.status(201).json(rows[0]);
});

// PATCH /api/nodes/:id  — update
router.patch('/:id', async (req, res) => {
  const allowed = ['title', 'content', 'color', 'position'];
  const updates = Object.entries(req.body).filter(([k]) => allowed.includes(k));
  if (!updates.length) return res.status(400).json({ error: 'Nothing to update' });

  const setClauses = updates.map(([k], i) => `${k} = $${i + 2}`).join(', ');
  const values = [req.params.id, ...updates.map(([, v]) => v)];
  const { rows } = await pool.query(
    `UPDATE nodes SET ${setClauses} WHERE id = $1 RETURNING *`,
    values
  );
  if (!rows.length) return res.status(404).json({ error: 'Not found' });
  res.json(rows[0]);
});

// PATCH /api/nodes/reorder  — update positions in bulk
router.patch('/bulk/reorder', async (req, res) => {
  const { items } = req.body; // [{ id, position }]
  if (!Array.isArray(items)) return res.status(400).json({ error: 'items array required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const { id, position } of items) {
      await client.query('UPDATE nodes SET position = $1 WHERE id = $2', [position, id]);
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: e.message });
  } finally {
    client.release();
  }
});

// DELETE /api/nodes/:id  — deletes node + all descendants (CASCADE)
router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM nodes WHERE id = $1', [req.params.id]);
  res.json({ ok: true });
});

module.exports = router;
