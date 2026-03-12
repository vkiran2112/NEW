import { create } from 'zustand';

const API = '/api';

export const useStore = create((set, get) => ({
  // State
  spaces: [],
  tasks: [],
  notes: [],
  activeSpaceId: null,
  activeView: 'timeline', // 'timeline' | 'inbox' | 'notes'
  loading: false,

  // Spaces
  fetchSpaces: async () => {
    const res = await fetch(`${API}/spaces`);
    const spaces = await res.json();
    set({ spaces });
    if (!get().activeSpaceId && spaces.length > 0) {
      set({ activeSpaceId: spaces[0].id });
    }
  },

  createSpace: async (name, color) => {
    const res = await fetch(`${API}/spaces`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, color }),
    });
    const space = await res.json();
    set((s) => ({ spaces: [...s.spaces, space] }));
    return space;
  },

  deleteSpace: async (id) => {
    await fetch(`${API}/spaces/${id}`, { method: 'DELETE' });
    set((s) => ({
      spaces: s.spaces.filter((sp) => sp.id !== id),
      activeSpaceId: s.activeSpaceId === id ? (s.spaces[0]?.id ?? null) : s.activeSpaceId,
    }));
  },

  // Tasks
  fetchTasks: async () => {
    const res = await fetch(`${API}/tasks`);
    const tasks = await res.json();
    set({ tasks });
  },

  createTask: async (data) => {
    const res = await fetch(`${API}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const task = await res.json();
    set((s) => ({ tasks: [...s.tasks, task] }));
    return task;
  },

  updateTask: async (id, data) => {
    const res = await fetch(`${API}/tasks/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const task = await res.json();
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? task : t)) }));
    return task;
  },

  deleteTask: async (id) => {
    await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  rollTasks: async () => {
    await fetch(`${API}/tasks/roll`, { method: 'POST' });
    await get().fetchTasks();
  },

  // Notes
  fetchNotes: async () => {
    const res = await fetch(`${API}/notes`);
    const notes = await res.json();
    set({ notes });
  },

  createNote: async (data) => {
    const res = await fetch(`${API}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const note = await res.json();
    set((s) => ({ notes: [note, ...s.notes] }));
    return note;
  },

  updateNote: async (id, data) => {
    const res = await fetch(`${API}/notes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const note = await res.json();
    set((s) => ({ notes: s.notes.map((n) => (n.id === id ? note : n)) }));
    return note;
  },

  deleteNote: async (id) => {
    await fetch(`${API}/notes/${id}`, { method: 'DELETE' });
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) }));
  },

  // Socket handlers (called from App.jsx)
  handleSocketEvent: (event, data) => {
    const { tasks, notes, spaces } = get();
    switch (event) {
      case 'task:created':
        if (!tasks.find((t) => t.id === data.id)) set({ tasks: [...tasks, data] });
        break;
      case 'task:updated':
        set({ tasks: tasks.map((t) => (t.id === data.id ? data : t)) });
        break;
      case 'task:deleted':
        set({ tasks: tasks.filter((t) => t.id !== data.id) });
        break;
      case 'tasks:rolled':
        get().fetchTasks();
        break;
      case 'note:created':
        if (!notes.find((n) => n.id === data.id)) set({ notes: [data, ...notes] });
        break;
      case 'note:updated':
        set({ notes: notes.map((n) => (n.id === data.id ? data : n)) });
        break;
      case 'note:deleted':
        set({ notes: notes.filter((n) => n.id !== data.id) });
        break;
      case 'space:created':
        if (!spaces.find((s) => s.id === data.id)) set({ spaces: [...spaces, data] });
        break;
      case 'space:updated':
        set({ spaces: spaces.map((s) => (s.id === data.id ? data : s)) });
        break;
      case 'space:deleted':
        set({ spaces: spaces.filter((s) => s.id !== data.id) });
        break;
    }
  },

  setActiveSpace: (id) => set({ activeSpaceId: id }),
  setActiveView: (view) => set({ activeView: view }),
}));
