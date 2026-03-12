import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import spacesRouter from './routes/spaces.js';
import tasksRouter from './routes/tasks.js';
import notesRouter from './routes/notes.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PATCH', 'DELETE'] },
});

app.use(cors());
app.use(express.json());

// Attach io to every request so routes can emit events
app.use((req, _res, next) => {
  req.io = io;
  next();
});

app.use('/api/spaces', spacesRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/notes', notesRouter);

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => console.log(`Paso backend running on http://localhost:${PORT}`));
