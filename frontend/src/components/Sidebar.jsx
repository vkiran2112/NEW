import { useState } from 'react';
import { useStore } from '../store/useStore';

const COLORS = ['#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function Sidebar() {
  const { spaces, activeSpaceId, activeView, setActiveSpace, setActiveView, createSpace, deleteSpace } = useStore();
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newSpaceColor, setNewSpaceColor] = useState(COLORS[0]);
  const [showAdd, setShowAdd] = useState(false);

  const handleAddSpace = async (e) => {
    e.preventDefault();
    if (!newSpaceName.trim()) return;
    await createSpace(newSpaceName, newSpaceColor);
    setNewSpaceName('');
    setShowAdd(false);
  };

  return (
    <aside className="w-60 bg-[#141414] border-r border-white/5 flex flex-col py-6 px-3 shrink-0">
      {/* Logo */}
      <div className="px-3 mb-8">
        <h1 className="text-lg font-semibold tracking-tight">paso</h1>
        <p className="text-xs text-gray-500 mt-0.5">timeline planner</p>
      </div>

      {/* Main nav */}
      <nav className="space-y-1 mb-6">
        <NavItem icon="📥" label="Inbox" active={activeView === 'inbox'} onClick={() => setActiveView('inbox')} />
        <NavItem icon="📅" label="Timeline" active={activeView === 'timeline'} onClick={() => setActiveView('timeline')} />
      </nav>

      {/* Spaces */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-3 mb-2">
          <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">Spaces</span>
          <button onClick={() => setShowAdd(!showAdd)} className="text-gray-500 hover:text-gray-300 transition-colors text-sm leading-none">+</button>
        </div>

        {showAdd && (
          <form onSubmit={handleAddSpace} className="px-2 mb-3 space-y-2">
            <input
              className="input text-xs py-1.5"
              placeholder="Space name"
              value={newSpaceName}
              onChange={(e) => setNewSpaceName(e.target.value)}
              autoFocus
            />
            <div className="flex gap-1 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewSpaceColor(c)}
                  className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    outline: newSpaceColor === c ? `2px solid ${c}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn-primary text-xs py-1 flex-1">Add</button>
              <button type="button" onClick={() => setShowAdd(false)} className="btn-ghost text-xs py-1">Cancel</button>
            </div>
          </form>
        )}

        <div className="space-y-0.5">
          {spaces.map((space) => (
            <div
              key={space.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors ${
                activeSpaceId === space.id && activeView === 'notes'
                  ? 'bg-white/10'
                  : 'hover:bg-white/5'
              }`}
              onClick={() => { setActiveSpace(space.id); setActiveView('notes'); }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: space.color }} />
              <span className="text-sm text-gray-300 truncate flex-1">{space.name}</span>
              {space.id !== 'default' && (
                <button
                  onClick={(e) => { e.stopPropagation(); deleteSpace(space.id); }}
                  className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-all text-xs"
                >✕</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-white/5 px-3">
        <p className="text-xs text-gray-600">Real-time sync enabled</p>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
        active ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
      }`}
    >
      <span className="text-base">{icon}</span>
      {label}
    </button>
  );
}
