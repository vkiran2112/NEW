import { useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useStore } from '../store/useStore';
import TaskCard from './TaskCard';

export default function Inbox() {
  const { tasks, spaces, createTask, rollTasks } = useStore();
  const [newTitle, setNewTitle] = useState('');
  const [newSpaceId, setNewSpaceId] = useState('');

  const inboxTasks = tasks.filter((t) => !t.scheduled_date && !t.completed);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await createTask({ title: newTitle, space_id: newSpaceId || null });
    setNewTitle('');
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-2xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Inbox</h2>
          <p className="text-sm text-gray-500 mt-1">Capture everything. No pressure, no schedule.</p>
        </div>
        <button onClick={rollTasks} className="btn-ghost text-xs" title="Roll unfinished tasks to today">
          ↻ Roll tasks
        </button>
      </div>

      {/* Quick add */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Add to inbox..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <select
            className="input w-36"
            value={newSpaceId}
            onChange={(e) => setNewSpaceId(e.target.value)}
          >
            <option value="">No space</option>
            {spaces.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <button type="submit" className="btn-primary">Add</button>
        </div>
      </form>

      {inboxTasks.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-3">📥</p>
          <p>Inbox is empty. Capture your ideas here.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter}>
          <SortableContext items={inboxTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {inboxTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}
