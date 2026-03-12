import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';

function NoteEditor({ note, onClose }) {
  const { updateNote } = useStore();
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const saveTimer = useStore(() => null);

  const save = () => updateNote(note.id, { title, content });

  return (
    <div className="flex-1 flex flex-col h-full p-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => { save(); onClose(); }} className="text-gray-500 hover:text-gray-300 transition-colors">
          ← Back
        </button>
      </div>
      <input
        className="text-2xl font-semibold bg-transparent border-none outline-none text-gray-100 placeholder-gray-600 mb-4"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={save}
        placeholder="Note title..."
      />
      <textarea
        className="flex-1 bg-transparent border-none outline-none text-sm text-gray-300 placeholder-gray-600 resize-none leading-relaxed"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onBlur={save}
        placeholder="Start writing..."
      />
    </div>
  );
}

export default function Notes() {
  const { notes, spaces, activeSpaceId, createNote, deleteNote } = useStore();
  const [selectedNote, setSelectedNote] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const space = spaces.find((s) => s.id === activeSpaceId);
  const spaceNotes = notes.filter((n) => n.space_id === activeSpaceId);

  // Refresh selected note when updated
  const currentNote = notes.find((n) => n.id === selectedNote?.id);

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const note = await createNote({ title: newTitle, space_id: activeSpaceId });
    setSelectedNote(note);
    setNewTitle('');
  };

  if (currentNote && selectedNote) {
    return (
      <NoteEditor note={currentNote} onClose={() => setSelectedNote(null)} />
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-8">
        {space && (
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: space.color }} />
        )}
        <h2 className="text-xl font-semibold">{space?.name ?? 'Notes'}</h2>
      </div>

      {/* Add note */}
      <form onSubmit={handleAddNote} className="mb-6 flex gap-2">
        <input
          className="input flex-1"
          placeholder="New note title..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button type="submit" className="btn-primary">+ Note</button>
      </form>

      {spaceNotes.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <p className="text-4xl mb-3">📝</p>
          <p>No notes yet. Create one above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {spaceNotes.map((note) => (
            <div
              key={note.id}
              className="card cursor-pointer group relative"
              onClick={() => setSelectedNote(note)}
            >
              <h3 className="font-medium text-sm mb-2 truncate">{note.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                {note.content || <span className="italic">Empty note</span>}
              </p>
              <p className="text-xs text-gray-600 mt-3">
                {format(new Date(note.updated_at * 1000), 'MMM d, yyyy')}
              </p>
              <button
                onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-xs"
              >✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
