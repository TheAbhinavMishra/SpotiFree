import React, { useState } from 'react';
import { Heart, Plus, Edit2, Check, Trash2, FolderHeart, Music, ListMusic } from 'lucide-react';
import { useAppStore, useUserStore } from '../store';

export default function SidebarRight() {
  const { activeView, setActiveView } = useAppStore();
  const { playlists, likedSongIds, createPlaylist, renamePlaylist, deletePlaylist } = useUserStore();
  
  // State for playlist name modification
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');

  const handleCreatePlaylist = () => {
    // Generate a default name
    const count = playlists.length + 1;
    const newName = `My Playlist #${count}`;
    const newId = createPlaylist(newName);
    // Switch to editing state right away
    setEditingId(newId);
    setEditName(newName);
    setActiveView(newId); // Focus newly created playlist
  };

  const startEditing = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditName(currentName);
  };

  const saveRename = (id: string) => {
    if (editName.trim() !== '') {
      renamePlaylist(id, editName.trim());
    }
    setEditingId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter') {
      saveRename(id);
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  return (
    <aside
      id="sidebar-right"
      className="hidden md:flex w-64 bg-zinc-950 flex-shrink-0 flex-col p-6 text-neutral-400 font-sans border-l border-neutral-900"
    >
      {/* Liked Songs Tile - Always present */}
      <h2 className="text-white font-bold text-sm tracking-wider uppercase mb-4 text-neutral-500">
        Favorites
      </h2>
      
      <div
        id="tile-liked-songs"
        onClick={() => setActiveView('liked-songs')}
        className={`group p-4 rounded-lg flex items-center gap-3 cursor-pointer transition-all duration-300 mb-6 border ${
          activeView === 'liked-songs'
            ? 'bg-neutral-900 border-zinc-800 text-white'
            : 'bg-zinc-900/50 border-transparent hover:bg-neutral-900/60 text-neutral-300'
        }`}
      >
        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-violet-700 to-emerald-500 flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
          <Heart className={`w-5 h-5 text-white ${activeView === 'liked-songs' ? 'fill-white scale-110' : ''} transition-all duration-300`} />
          <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 animate-pulse m-1"></div>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="font-bold text-sm tracking-tight truncate text-white">Liked Songs</div>
          <div className="text-xs text-neutral-400">{likedSongIds.length} {likedSongIds.length === 1 ? 'song' : 'songs'}</div>
        </div>
      </div>

      {/* Playlists Title & Add button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-sm tracking-wider uppercase text-neutral-500">
          Your Playlists
        </h2>
        <button
          id="btn-create-playlist"
          onClick={handleCreatePlaylist}
          title="Create Playlist"
          className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Playlist items tree */}
      <div id="playlist-list-container" className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
        {playlists.length === 0 ? (
          <div className="text-xs text-neutral-600 italic py-4 text-center border border-dashed border-zinc-800 rounded-lg">
            No playlists yet.<br />Click the plus icon to start.
          </div>
        ) : (
          playlists.map((playlist) => {
            const isEditing = editingId === playlist.id;
            const isActive = activeView === playlist.id;

            return (
              <div
                key={playlist.id}
                id={`playlist-item-${playlist.id}`}
                onClick={() => !isEditing && setActiveView(playlist.id)}
                className={`group flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-neutral-900/90 text-white font-semibold border-l-2 border-emerald-500'
                    : 'hover:bg-neutral-900 text-neutral-300'
                }`}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0 pr-1">
                  <ListMusic className={`w-4 h-4 flex-shrink-0 text-[#1DB954]`} />
                  
                  {isEditing ? (
                    <input
                      id={`edit-input-${playlist.id}`}
                      type="text"
                      className="bg-zinc-800 text-white border-0 py-0.5 px-2 rounded w-full text-sm outline-none ring-1 ring-emerald-500 focus:ring-1"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => saveRename(playlist.id)}
                      onKeyDown={(e) => handleKeyDown(e, playlist.id)}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span
                      id={`playlist-name-${playlist.id}`}
                      onDoubleClick={(e) => startEditing(playlist.id, playlist.name, e)}
                      className="text-sm truncate select-none block w-full"
                      title="Double click to rename"
                    >
                      {playlist.name}
                    </span>
                  )}
                </div>

                {/* Actions (visible on hover) */}
                {!isEditing && (
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      id={`btn-edit-pl-${playlist.id}`}
                      onClick={(e) => startEditing(playlist.id, playlist.name, e)}
                      title="Rename Playlist"
                      className="p-1 text-neutral-400 hover:text-[#1DB954] rounded transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`btn-del-pl-${playlist.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        deletePlaylist(playlist.id);
                        if (activeView === playlist.id) {
                          setActiveView('home');
                        }
                      }}
                      title="Delete Playlist"
                      className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {isEditing && (
                  <button
                    id={`btn-save-pl-${playlist.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      saveRename(playlist.id);
                    }}
                    className="p-1 text-emerald-400 hover:text-emerald-300 rounded"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>


    </aside>
  );
}
