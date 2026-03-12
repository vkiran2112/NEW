import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const { space_id } = req.query;
  let query = 'SELECT * FROM notes WHERE 1=1';
  const params = [];
  if (space_id) {
    query += ' AND space_id = ?';
    params.push(space_id);
  }
  query += ' ORDER BY updated_at DESC';
  res.json(db.prepare(query).all(...params));
});

router.post('/', (req, res) => {
  const { title, content = '', space_id = null } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });
  const id = uuid();
  db.prepare('INSERT INTO notes (id, title, content, space_id) VALUES (?, ?, ?, ?)').run(id, title.trim(), content, space_id);
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(id);
  req.io.emit('note:created', note);
  res.status(201).json(note);
});

router.patch('/:id', (req, res) => {
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  if (!note) return res.status(404).json({ error: 'Not found' });
  const { title, content, space_id } = req.body;
  const now = Math.floor(Date.now() / 1000);
  db.prepare('UPDATE notes SET title = ?, content = ?, space_id = ?, updated_at = ? WHERE id = ?').run(
    title ?? note.title,
    content !== undefined ? content : note.content,
    space_id !== undefined ? space_id : note.space_id,
    now,
    req.params.id
  );
  const updated = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  req.io.emit('note:updated', updated);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM notes WHERE id = ?').run(req.params.id);
  req.io.emit('note:deleted', { id: req.params.id });
  res.status(204).end();
});

export default router;
