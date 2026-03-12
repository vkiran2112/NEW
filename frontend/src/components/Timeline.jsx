import { useState, useRef } from 'react';
import { format, addDays, startOfDay, parseISO, isToday, isPast, isFuture } from 'date-fns';
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, useDroppable, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useStore } from '../store/useStore';
import TaskCard from './TaskCard';

const DAYS_RANGE = 30;

function DateColumn({ date, tasks, onAddTask }) {
  const dateStr = format(date, 'yyyy-MM-dd');
  const { setNodeRef, isOver } = useDroppable({ id: dateStr });
  const [newTitle, setNewTitle] = useState('');
  const [adding, setAdding] = useState(false);
  const { spaces } = useStore();
  const [newSpaceId, setNewSpaceId] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await onAddTask({ title: newTitle, scheduled_date: dateStr, space_id: newSpaceId || null });
    setNewTitle('');
    setAdding(false);
  };

  const dayLabel = isToday(date) ? 'Today' : format(date, 'EEE');
  const isOverdue = isPast(date) && !isToday(date);

  return (
    <div className="shrink-0 w-72">
      {/* Date header */}
      <div className={`sticky top-0 z-10 bg-[#0f0f0f] pb-3 mb-3 border-b ${isToday(date) ? 'border-indigo-500/50' : 'border-white/5'}`}>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-light ${isToday(date) ? 'text-indigo-400' : isOverdue ? 'text-gray-600' : 'text-gray-200'}`}>
            {format(date, 'd')}
          </span>
          <span className={`text-sm ${isToday(date) ? 'text-indigo-400 font-medium' : 'text-gray-500'}`}>
            {dayLabel}
          </span>
          <span className="text-xs text-gray-600 ml-auto">{format(date, 'MMM')}</span>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`min-h-32 space-y-2 rounded-xl p-2 transition-colors ${isOver ? 'bg-indigo-500/10 border border-indigo-500/30' : ''}`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>

        {/* Add button */}
        {adding ? (
          <form onSubmit={handleAdd} className="space-y-2 pt-1">
            <input
              className="input text-xs py-1.5"
              placeholder="Task title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Escape') setAdding(false); }}
            />
            <select className="input text-xs py-1" value={newSpaceId} onChange={(e) => setNewSpaceId(e.target.value)}>
              <option value="">No space</option>
              {spaces.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="flex gap-1">
              <button type="submit" className="btn-primary text-xs py-1 flex-1">Add</button>
              <button type="button" onClick={() => setAdding(false)} className="btn-ghost text-xs py-1">✕</button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="w-full text-left text-xs text-gray-600 hover:text-gray-400 py-1.5 px-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            + Add task
          </button>
        )}
      </div>
    </div>
  );
}

export default function Timeline() {
  const { tasks, createTask, updateTask, rollTasks } = useStore();
  const [activeId, setActiveId] = useState(null);
  const scrollRef = useRef(null);

  const today = startOfDay(new Date());
  const days = Array.from({ length: DAYS_RANGE }, (_, i) => addDays(today, i - 2));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const getTasksForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return tasks.filter((t) => t.scheduled_date === dateStr);
  };

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over) return;
    const overId = over.id;
    // If dropped on a date column
    if (/^\d{4}-\d{2}-\d{2}$/.test(overId)) {
      updateTask(active.id, { scheduled_date: overId });
    }
  };

  const activeTask = tasks.find((t) => t.id === activeId);

  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <div className="px-8 pt-8 pb-4 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl font-semibold">Timeline</h2>
          <p className="text-sm text-gray-500 mt-1">Drag ideas from inbox or add tasks to any day.</p>
        </div>
        <button onClick={rollTasks} className="btn-ghost text-xs" title="Roll past unfinished tasks to today">
          ↻ Roll tasks
        </button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div ref={scrollRef} className="flex-1 overflow-x-auto px-8 pb-8">
          <div className="flex gap-6 h-full" style={{ minWidth: `${DAYS_RANGE * 300}px` }}>
            {days.map((day) => (
              <DateColumn
                key={format(day, 'yyyy-MM-dd')}
                date={day}
                tasks={getTasksForDate(day)}
                onAddTask={createTask}
              />
            ))}
          </div>
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="rotate-2 shadow-2xl">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
