import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import db from '../database.js';

const router = Router();

router.get('/', (req, res) => {
  const { space_id, scheduled_date, inbox } = req.query;
  let query = 'SELECT * FROM tasks WHERE 1=1';
  const params = [];

  if (inbox === 'true') {
    query += ' AND scheduled_date IS NULL AND completed = 0';
  }
  if (scheduled_date) {
    query += ' AND scheduled_date = ?';
    params.push(scheduled_date);
  }
  if (space_id) {
    query += ' AND space_id = ?';
    params.push(space_id);
  }

  query += ' ORDER BY position ASC, created_at ASC';
  const tasks = db.prepare(query).all(...params);
  res.json(tasks);
});

router.post('/', (req, res) => {
  const { title, notes = '', space_id = null, scheduled_date = null } = req.body;
  if (!title?.trim()) return res.status(400).json({ error: 'Title required' });

  const id = uuid();
  const maxPos = db.prepare('SELECT MAX(position) as m FROM tasks').get();
  const position = (maxPos.m ?? -1) + 1;

  db.prepare(
    'INSERT INTO tasks (id, title, notes, space_id, scheduled_date, position) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, title.trim(), notes, space_id, scheduled_date, position);

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
  req.io.emit('task:created', task);
  res.status(201).json(task);
});

router.patch('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) return res.status(404).json({ error: 'Not found' });

  const { title, notes, space_id, scheduled_date, completed, position } = req.body;

  const completedAt = completed === true && !task.completed ? Math.floor(Date.now() / 1000) : (completed === false ? null : task.completed_at);

  db.prepare(`
    UPDATE tasks SET
      title = ?,
      notes = ?,
      space_id = ?,
      scheduled_date = ?,
      completed = ?,
      completed_at = ?,
      position = ?
    WHERE id = ?
  `).run(
    title ?? task.title,
    notes ?? task.notes,
    space_id !== undefined ? space_id : task.space_id,
    scheduled_date !== undefined ? scheduled_date : task.scheduled_date,
    completed !== undefined ? (completed ? 1 : 0) : task.completed,
    completedAt,
    position !== undefined ? position : task.position,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  req.io.emit('task:updated', updated);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  req.io.emit('task:deleted', { id: req.params.id });
  res.status(204).end();
});

// Auto-roll: move all uncompleted past tasks to today
router.post('/roll', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const result = db.prepare(`
    UPDATE tasks SET scheduled_date = ? WHERE completed = 0 AND scheduled_date IS NOT NULL AND scheduled_date < ?
  `).run(today, today);
  req.io.emit('tasks:rolled', { today, count: result.changes });
  res.json({ rolled: result.changes, to: today });
});

export default router;
