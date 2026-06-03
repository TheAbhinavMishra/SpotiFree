import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Home, Search, Music, Disc, Heart, Plus, Edit2, Check, Trash2, ListMusic, X, Info 
} from 'lucide-react';
import Logo from './Logo';
import { useAppStore, useUserStore } from '../store';

export default function MobileDrawer() {
  const { isMobileMenuOpen, setIsMobileMenuOpen, activeView, setActiveView, setAboutOpen } = useAppStore();
  const { playlists, likedSongIds, createPlaylist, renamePlaylist, deletePlaylist } = useUserStore();

  // State for playlist name modification on mobile
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');

  if (!isMobileMenuOpen) return null;

  const closeMenu = () => setIsMobileMenuOpen(false);

  const handleHomeClick = () => {
    setActiveView('home');
    closeMenu();
  };

  const handleSearchClick = () => {
    setActiveView('home');
    closeMenu();
    // Focus search input
    setTimeout(() => {
      const searchInput = document.getElementById('topbar-search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  };

  const handleLikedSongsClick = () => {
    setActiveView('liked-songs');
    closeMenu();
  };

  const handleCreatePlaylist = (e: React.MouseEvent) => {
    e.stopPropagation();
    const count = playlists.length + 1;
    const newName = `My Playlist #${count}`;
    const newId = createPlaylist(newName);
    // Focus & edit
    setEditingId(newId);
    setEditName(newName);
    setActiveView(newId);
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

  const selectPlaylist = (id: string) => {
    setActiveView(id);
    closeMenu();
  };

  return (
    <div 
      id="mobile-drawer-overlay"
      className="fixed inset-0 z-50 flex md:hidden"
    >
      {/* Background scrim overlay */}
      <motion.div
        id="drawer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeMenu}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
      />

      {/* Slide-out Panel container */}
      <motion.div
        id="drawer-surface"
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="relative w-4/5 max-w-xs h-full bg-zinc-950 flex flex-col p-6 shadow-2xl overflow-y-auto text-neutral-400 font-sans z-10"
      >
        {/* Head Bar: Logo and Close trigger */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8 text-[#1DB954]" />
            <span className="font-extrabold text-white text-lg tracking-tight">
              SpotiFree<span className="text-[#1DB954]">.</span>
            </span>
          </div>
          <button
            id="drawer-close-btn"
            onClick={closeMenu}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
            title="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Core section */}
        <div className="flex flex-col gap-4 mb-8">
          <motion.button
            layoutId="about-modal-container-mobile"
            id="mobile-nav-about"
            onClick={() => {
              setAboutOpen(true);
              closeMenu();
            }}
            className="flex items-center gap-4 font-bold text-sm transition-colors py-1 text-emerald-400 hover:text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]"
          >
            <Info className="w-5 h-5" />
            About SpotiFree
          </motion.button>

          <button
            id="mobile-nav-home"
            onClick={handleHomeClick}
            className={`flex items-center gap-4 font-bold text-sm transition-colors py-1 ${
              activeView === 'home' ? 'text-white' : 'hover:text-white'
            }`}
          >
            <Home className="w-5 h-5" />
            Home
          </button>

          <button
            id="mobile-nav-search"
            onClick={handleSearchClick}
            className="flex items-center gap-4 font-bold text-sm transition-colors py-1 hover:text-white"
          >
            <Search className="w-5 h-5" />
            Search
          </button>

          <button
            id="mobile-nav-liked"
            onClick={handleLikedSongsClick}
            className={`flex items-center gap-4 font-bold text-sm transition-colors py-1 ${
              activeView === 'liked-songs' ? 'text-white' : 'hover:text-white'
            }`}
          >
            <Heart className={`w-5 h-5 ${activeView === 'liked-songs' ? 'fill-emerald-500 text-emerald-500' : ''}`} />
            Liked Songs ({likedSongIds.length})
          </button>
        </div>

        {/* Division border line */}
        <div className="border-t border-neutral-900 my-4" />

        {/* Custom Playlists segment header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold text-xs tracking-wider uppercase text-neutral-500">
            Your Playlists
          </h3>
          <button
            id="mobile-btn-create-playlist"
            onClick={handleCreatePlaylist}
            title="Create Playlist"
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Playlists lists item container */}
        <div id="mobile-playlists-scroll-area" className="flex-1 space-y-1 overflow-y-auto">
          {playlists.length === 0 ? (
            <div className="text-xs text-neutral-600 italic py-4 text-center border border-dashed border-zinc-800 rounded-lg">
              No playlists found.
            </div>
          ) : (
            playlists.map((playlist) => {
              const isEditing = editingId === playlist.id;
              const isActive = activeView === playlist.id;

              return (
                <div
                  key={playlist.id}
                  id={`mobile-ply-item-${playlist.id}`}
                  onClick={() => !isEditing && selectPlaylist(playlist.id)}
                  className={`flex items-center justify-between p-2.5 rounded-md cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-neutral-900 text-white font-semibold border-l-2 border-emerald-500'
                      : 'hover:bg-neutral-900/60 text-neutral-300'
                  }`}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0 pr-1">
                    <ListMusic className="w-4 h-4 flex-shrink-0 text-[#1DB954]" />

                    {isEditing ? (
                      <input
                        id={`mobile-edit-input-${playlist.id}`}
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
                        id={`mobile-pl-name-${playlist.id}`}
                        onDoubleClick={(e) => startEditing(playlist.id, playlist.name, e)}
                        className="text-sm truncate select-none block w-full"
                      >
                        {playlist.name}
                      </span>
                    )}
                  </div>

                  {/* Actions controls */}
                  {!isEditing && (
                    <div className="flex items-center gap-1">
                      <button
                        id={`mobile-btn-edit-pl-${playlist.id}`}
                        onClick={(e) => startEditing(playlist.id, playlist.name, e)}
                        className="p-1 text-neutral-400 hover:text-[#1DB954] rounded transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        id={`mobile-btn-del-pl-${playlist.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlaylist(playlist.id);
                          if (activeView === playlist.id) {
                            setActiveView('home');
                          }
                        }}
                        className="p-1 text-neutral-400 hover:text-red-500 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {isEditing && (
                    <button
                      id={`mobile-btn-save-pl-${playlist.id}`}
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
      </motion.div>
    </div>
  );
}
