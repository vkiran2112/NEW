import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const spaces = db.prepare('SELECT * FROM spaces ORDER BY created_at ASC').all();
  res.json(spaces);
});

router.post('/', (req, res) => {
  const { name, color = '#6366f1' } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Name required' });
  const id = uuid();
  db.prepare('INSERT INTO spaces (id, name, color) VALUES (?, ?, ?)').run(id, name.trim(), color);
  const space = db.prepare('SELECT * FROM spaces WHERE id = ?').get(id);
  req.io.emit('space:created', space);
  res.status(201).json(space);
});

router.patch('/:id', (req, res) => {
  const { name, color } = req.body;
  const space = db.prepare('SELECT * FROM spaces WHERE id = ?').get(req.params.id);
  if (!space) return res.status(404).json({ error: 'Not found' });
  db.prepare('UPDATE spaces SET name = ?, color = ? WHERE id = ?').run(
    name ?? space.name,
    color ?? space.color,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM spaces WHERE id = ?').get(req.params.id);
  req.io.emit('space:updated', updated);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM spaces WHERE id = ?').run(req.params.id);
  req.io.emit('space:deleted', { id: req.params.id });
  res.status(204).end();
});

export default router;
