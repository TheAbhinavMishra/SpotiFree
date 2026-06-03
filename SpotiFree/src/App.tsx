import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, Sparkles, FolderPlus, ListMusic, Music, Edit3, 
  Trash2, Headphones, Play, ShieldAlert, Check, Edit2, Plus
} from 'lucide-react';

import { useAppStore, useUserStore } from './store';
import { Song } from './types';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
import TopBar from './components/TopBar';
import SongTable from './components/SongTable';
import PlayerBar from './components/PlayerBar';
import MobileDrawer from './components/MobileDrawer';
import HomeHeader from './components/HomeHeader';
import AboutOverlay from './components/AboutOverlay';

export default function App() {
  const { catalog, searchQuery, activeView, setActiveView, currentSong, isPlaying, setQueue, fetchCatalog, targetPlaylistForAdd, selectedSongIdsForAdd, clearSongSelectionForAdd, toastMessage, showToast } = useAppStore();
  const { playlists, likedSongIds, renamePlaylist, deletePlaylist, addSongToPlaylist } = useUserStore();

  const [isEditingPlaylist, setIsEditingPlaylist] = useState(false);
  const [editingPlaylistName, setEditingPlaylistName] = useState('');

  const handleSavePlaylistName = () => {
    if (activePlaylist && editingPlaylistName.trim()) {
      renamePlaylist(activePlaylist.id, editingPlaylistName.trim());
    }
    setIsEditingPlaylist(false);
  };

  const handleApplyAddSongs = () => {
    if (targetPlaylistForAdd && selectedSongIdsForAdd.length > 0) {
      selectedSongIdsForAdd.forEach(songId => {
        addSongToPlaylist(targetPlaylistForAdd, songId);
      });
      showToast(`Added ${selectedSongIdsForAdd.length} ${selectedSongIdsForAdd.length === 1 ? 'song' : 'songs'} to playlist!`);
      const plIdTemp = targetPlaylistForAdd;
      clearSongSelectionForAdd();
      setActiveView(plIdTemp); // Send them back to the playlist
    } else {
      clearSongSelectionForAdd(); // Canceling
    }
  };


  // Helper to retrieve currently selected view metadata
  const activePlaylist = playlists.find((pl) => pl.id === activeView);

  // 1. Fetch live list of files from Internet Archive public metadata endpoint upon loading
  useEffect(() => {
    fetchCatalog().catch((err) => {
      console.error("Failed to fetch dynamically from Internet Archive via Zustand action:", err);
    });
  }, [fetchCatalog]);

  // If activeView is a playlist that got deleted, reset to home
  useEffect(() => {
    if (activeView !== 'home' && activeView !== 'liked-songs') {
      const exists = playlists.some((pl) => pl.id === activeView);
      if (!exists) {
        setActiveView('home');
      }
    }
  }, [playlists, activeView, setActiveView]);

  // Resolve the raw array of songs appropriate for the active view context
  const getRawSongsForActiveView = () => {
    if (activeView === 'home') {
      return catalog;
    } else if (activeView === 'liked-songs') {
      return likedSongIds
        .map((id) => catalog.find((song) => song.id === id))
        .filter((song): song is Song => !!song);
    } else if (activePlaylist) {
      // Find songs in catalog that belong to this playlist in custom order
      return activePlaylist.songIds
        .map((id) => catalog.find((song) => song.id === id))
        .filter((song): song is Song => !!song);
    }
    return [];
  };

  const rawSongs = getRawSongsForActiveView();

  // Filter songs based on search keywords (supports real-time Title or Singer matching)
  const filteredSongs = rawSongs.filter((song) => {
    const query = searchQuery.toLowerCase().trim();
    if (query === '') return true;

    const titleVal = (song.title || (song as any).Title || '').toLowerCase();
    const singerVal = (song.artist || (song as any).Singer || '').toLowerCase();
    const albumVal = (song.album || '').toLowerCase();

    return (
      titleVal.includes(query) ||
      singerVal.includes(query) ||
      albumVal.includes(query)
    );
  });

  // Start playing all songs in current view as a custom queue context
  const playAllFromView = () => {
    if (filteredSongs.length > 0) {
      setQueue(filteredSongs, 0);
    }
  };

  return (
    <div
      id="app-root-container"
      className="flex flex-col h-screen overflow-hidden bg-[#121212] text-white font-sans"
    >
      {/* Upper Layout: Sidebars and Main View */}
      <div id="main-content-layout" className="flex flex-1 overflow-hidden pb-32">
        {/* Left Navigation Rails */}
        <SidebarLeft />

        {/* Center Main Viewport */}
        <main
          id="main-viewport-scroller"
          className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden min-w-0 bg-gradient-to-b from-neutral-900 to-zinc-950 custom-scrollbar"
        >
          {/* Sits at the top of the scroller context */}
          <TopBar />

          {/* Core scrollable panel content */}
          <div id="main-lyrics-grid" className="p-2 md:p-8 pb-12 flex-1">
            {/* Elegant View Header Banner */}
            <motion.div
              id="view-hero-banner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-8"
            >
              {activeView === 'home' && (
                <HomeHeader
                  onPlayAll={playAllFromView}
                  showPlayButton={filteredSongs.length > 0}
                />
              )}

              {activeView === 'liked-songs' && (
                <div 
                  id="header-liked-songs"
                  className="flex flex-col md:flex-row items-end gap-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-950 via-teal-900/30 to-zinc-900/40 border border-emerald-800/30"
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gradient-to-br from-indigo-600 via-[#1DB954] to-teal-400 flex items-center justify-center shadow-2xl flex-shrink-0">
                    <Heart className="w-12 h-12 md:w-16 md:h-16 text-white fill-white animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Playlist</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-1 mb-2 tracking-tight">
                      Liked Songs
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                      <span className="font-bold text-white">Your Collection</span>
                      <span>•</span>
                      <span>{likedSongIds.length} {likedSongIds.length === 1 ? 'song' : 'songs'} available</span>
                    </div>
                  </div>

                  {filteredSongs.length > 0 && (
                    <button
                      id="liked-play-all"
                      onClick={playAllFromView}
                      className="bg-[#1DB954] text-black font-bold px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2 self-start md:self-end cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-black" />
                      Play Liked
                    </button>
                  )}
                </div>
              )}

              {activeView !== 'home' && activeView !== 'liked-songs' && activePlaylist && (
                <div 
                  id={`header-playlist-${activePlaylist.id}`}
                  className="flex flex-col md:flex-row items-end gap-6 p-6 rounded-2xl bg-gradient-to-r from-neutral-800 via-neutral-900/50 to-zinc-900/40 border border-neutral-700/30"
                >
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-xl bg-gradient-to-tr from-[#1DB954]/20 to-neutral-800 flex items-center justify-center shadow-2xl border border-neutral-700/40 flex-shrink-0">
                    <Music className="w-12 h-12 md:w-16 md:h-16 text-[#1DB954]" />
                  </div>
                  <div className="flex-1">
                    <span className="text-xs uppercase font-bold tracking-widest text-[#1DB954]">Custom Playlist</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mt-1 mb-2 tracking-tight truncate flex items-center gap-3">
                      {activePlaylist.name}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                      <span className="font-bold text-white">Playlist Owner</span>
                      <span>•</span>
                      <span>{activePlaylist.songIds.length} {activePlaylist.songIds.length === 1 ? 'song' : 'songs'} configured</span>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row items-center gap-3 self-start md:self-end">
                    <button
                      onClick={() => {
                        useAppStore.getState().setTargetPlaylistForAdd(activePlaylist.id);
                        useAppStore.getState().setActiveView('home');
                      }}
                      className="bg-transparent border border-neutral-500 text-white font-bold px-4 py-3 rounded-full hover:border-white transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Songs
                    </button>
                    {filteredSongs.length > 0 && (
                      <button
                        id="playlist-play-all"
                        onClick={playAllFromView}
                        className="bg-[#1DB954] text-black font-bold px-6 py-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-black" />
                        Play Playlist
                      </button>
                    )}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Song Table Section */}
            <motion.div
              id="main-song-table-container"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-1 py-4 md:p-6 shadow-2xl backdrop-blur-sm"
            >
              {/* Table search indicator */}
              {searchQuery && (
                <div id="search-feedback-bar" className="mb-4 text-xs text-neutral-500">
                  Showing matches for "<span className="text-white font-medium">{searchQuery}</span>" ({filteredSongs.length} found)
                </div>
              )}

              <SongTable
                songs={filteredSongs}
                isPlaylistView={activeView !== 'home' && activeView !== 'liked-songs'}
                playlistId={activeView !== 'home' && activeView !== 'liked-songs' ? activeView : undefined}
              />
            </motion.div>
          </div>
        </main>

        {/* Right Library / Playlists Configuration Panel */}
        <SidebarRight />
      </div>

      {/* Mobile Drawer Slide-out overlay */}
      <MobileDrawer />

      {/* Persistent Audio Controller Bar */}
      <PlayerBar />

      {/* Full Screen Modals */}
      <AnimatePresence>
        <AboutOverlay />
      </AnimatePresence>

      {/* Floating Add to Playlist Confirmer */}
      <AnimatePresence>
        {targetPlaylistForAdd && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-0 right-0 md:left-64 md:right-72 z-50 flex justify-center pointer-events-none"
          >
            <div className="bg-neutral-800 border border-neutral-700 shadow-2xl rounded-full px-6 py-3 flex items-center gap-4 pointer-events-auto">
              {selectedSongIdsForAdd.length > 0 ? (
                 <span className="text-white font-medium">{selectedSongIdsForAdd.length} selected</span>
              ) : (
                 <span className="text-neutral-400 font-medium">Select songs...</span>
              )}
              <div className="flex items-center gap-2 border-l border-neutral-700 pl-4 ml-2">
                <button
                  onClick={handleApplyAddSongs}
                  disabled={selectedSongIdsForAdd.length === 0}
                  className={`px-4 py-2 rounded-full font-bold text-sm transition-colors ${
                    selectedSongIdsForAdd.length > 0
                      ? 'bg-[#1DB954] text-black hover:scale-105 active:scale-95'
                      : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
                  }`}
                >
                  Add to Playlist
                </button>
                <button
                  onClick={() => {
                    useAppStore.getState().setActiveView(targetPlaylistForAdd);
                    clearSongSelectionForAdd();
                  }}
                  className="px-4 py-2 rounded-full font-bold text-sm text-white hover:bg-neutral-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cute Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
          >
            <div className="bg-emerald-500 text-black px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2">
              <Check className="w-5 h-5" />
              {toastMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
