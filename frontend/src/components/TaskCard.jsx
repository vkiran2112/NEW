import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useStore } from '../store/useStore';

export default function TaskCard({ task, showDate = false }) {
  const { updateTask, deleteTask, spaces } = useStore();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);

  const space = spaces.find((s) => s.id === task.space_id);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleToggle = () => updateTask(task.id, { completed: !task.completed });

  const handleTitleSave = () => {
    if (title.trim() && title !== task.title) updateTask(task.id, { title });
    setEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group flex items-start gap-2.5 px-3 py-2.5 rounded-lg border transition-all ${
        task.completed
          ? 'border-white/5 bg-white/2 opacity-50'
          : 'border-white/8 bg-white/4 hover:border-white/15'
      }`}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="mt-0.5 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing shrink-0 touch-none"
      >
        ⠿
      </button>

      {/* Checkbox */}
      <button
        onClick={handleToggle}
        className={`mt-0.5 w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
          task.completed ? 'bg-indigo-600 border-indigo-600' : 'border-white/20 hover:border-indigo-500'
        }`}
      >
        {task.completed && <span className="text-white text-[10px]">✓</span>}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            className="input text-sm py-0 bg-transparent border-none focus:border-none px-0"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={(e) => { if (e.key === 'Enter') handleTitleSave(); if (e.key === 'Escape') setEditing(false); }}
            autoFocus
          />
        ) : (
          <p
            className={`text-sm cursor-text ${task.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}
            onDoubleClick={() => setEditing(true)}
          >
            {task.title}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1">
          {space && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: space.color }} />
              {space.name}
            </span>
          )}
          {showDate && task.scheduled_date && (
            <span className="text-xs text-gray-600">{task.scheduled_date}</span>
          )}
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={() => deleteTask(task.id)}
        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-xs mt-0.5 shrink-0"
      >✕</button>
    </div>
  );
}
