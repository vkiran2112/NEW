import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useStore } from './store/useStore';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import Inbox from './components/Inbox';
import Notes from './components/Notes';

const socket = io({ transports: ['websocket'] });

const SOCKET_EVENTS = [
  'task:created', 'task:updated', 'task:deleted', 'tasks:rolled',
  'note:created', 'note:updated', 'note:deleted',
  'space:created', 'space:updated', 'space:deleted',
];

export default function App() {
  const { fetchSpaces, fetchTasks, fetchNotes, handleSocketEvent, activeView } = useStore();

  useEffect(() => {
    fetchSpaces();
    fetchTasks();
    fetchNotes();
  }, []);

  useEffect(() => {
    SOCKET_EVENTS.forEach((event) => {
      socket.on(event, (data) => handleSocketEvent(event, data));
    });
    return () => SOCKET_EVENTS.forEach((event) => socket.off(event));
  }, [handleSocketEvent]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden flex flex-col">
        {activeView === 'timeline' && <Timeline />}
        {activeView === 'inbox' && <Inbox />}
        {activeView === 'notes' && <Notes />}
      </main>
    </div>
  );
}
