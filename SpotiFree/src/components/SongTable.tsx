import React, { useState } from 'react';
import { Heart, Play, Pause, Plus, ListMusic, Trash2, Check, GripVertical } from 'lucide-react';
import { useAppStore, useUserStore } from '../store';
import { Song } from '../types';
import Artwork from './Artwork';

interface SongTableProps {
  songs: Song[];
  isPlaylistView?: boolean;
  playlistId?: string;
}

export default function SongTable({ songs, isPlaylistView = false, playlistId }: SongTableProps) {
  const { currentSong, isPlaying, setQueue, setIsPlaying, activeView, targetPlaylistForAdd, selectedSongIdsForAdd, toggleSongSelectionForAdd, showToast } = useAppStore();
  const { likedSongIds, toggleLikeSong, playlists, addSongToPlaylist, removeSongFromPlaylist } = useUserStore();
  
  // State to manage active playlist-add dropdown for a specific song
  const [activeDropdownSongId, setActiveDropdownSongId] = useState<string | null>(null);

  // Drag and drop states
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleRowClick = (song: Song, index: number) => {
    if (targetPlaylistForAdd) {
      toggleSongSelectionForAdd(song.id);
      return;
    }
    // Play this song and update queue to point to this active list of songs
    const currentIndex = songs.findIndex((s) => s.id === song.id);
    if (currentIndex !== -1) {
      setQueue(songs, currentIndex);
    }
  };

  const handlePlayPauseToggle = (song: Song, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      handleRowClick(song, index);
    }
  };

  const handleLikeClick = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleLikeSong(songId);
  };

  const toggleDropdown = (songId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeDropdownSongId === songId) {
      setActiveDropdownSongId(null);
    } else {
      setActiveDropdownSongId(songId);
    }
  };

  const handleAddToPlaylist = (e: React.MouseEvent, plId: string, songId: string) => {
    e.stopPropagation();
    addSongToPlaylist(plId, songId);
    setActiveDropdownSongId(null);
    const plName = playlists.find(p => p.id === plId)?.name || 'Playlist';
    showToast(`Added to ${plName}`);
  };

  const handleRemoveFromPlaylist = (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    if (playlistId) {
      removeSongFromPlaylist(playlistId, songId);
    }
  };

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null) return;
    if (draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const { reorderCatalog } = useAppStore.getState();
    const { reorderLikedSongs, reorderPlaylistSongs } = useUserStore.getState();

    if (isPlaylistView && playlistId) {
      reorderPlaylistSongs(playlistId, draggedIndex, targetIndex);
    } else if (activeView === 'liked-songs') {
      reorderLikedSongs(draggedIndex, targetIndex);
    } else {
      reorderCatalog(draggedIndex, targetIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Close dropdown if clicking elsewhere
  React.useEffect(() => {
    const handleOutsideClick = () => {
      setActiveDropdownSongId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  if (songs.length === 0) {
    return (
      <div id="empty-table-state" className="flex flex-col items-center justify-center p-12 text-center text-neutral-500">
        <ListMusic className="w-16 h-16 text-neutral-700 mb-4 animate-bounce-slow" />
        <h3 className="text-lg font-bold text-neutral-300">No songs in this view</h3>
        <p className="text-sm mt-1 max-w-md">
          {isPlaylistView 
            ? 'Go to Home / Search list and add songs to this playlist using the "+" button.'
            : 'Make sure your search filters match available records.'}
        </p>
      </div>
    );
  }

  return (
    <div id="table-wrapper" className="w-full text-neutral-400 font-sans mt-4 relative pb-2 pr-1">
      <div className="w-full flex flex-col text-left text-sm">
        {/* Sticky Headers */}
        <div className="hidden md:flex items-center border-b border-neutral-800 text-xs uppercase tracking-wider font-semibold text-neutral-500 sticky top-[64px] bg-[#121212]/95 backdrop-blur-sm z-10 py-4 px-2">
          <div className="w-8 shrink-0"></div>
          <div className="w-12 text-center hidden md:block shrink-0">#</div>
          <div className="flex-1 min-w-0 px-2 md:px-4">Title</div>
          <div className="w-1/4 hidden md:block shrink-0 px-2 md:px-4">Album</div>
          <div className="w-12 md:w-16 text-center shrink-0">Like</div>
          <div className="w-20 md:w-24 text-center shrink-0">Actions</div>
        </div>
        
        <div className="divide-y divide-zinc-900/10">
          {songs.map((song, index) => {
            const isCurrent = currentSong?.id === song.id;
            const isLiked = likedSongIds.includes(song.id);
            const isThisPlaying = isCurrent && isPlaying;
            const isSelectedForAdd = targetPlaylistForAdd ? selectedSongIdsForAdd.includes(song.id) : false;

            return (
              <div
                key={song.id}
                id={`song-row-${song.id}`}
                onClick={() => handleRowClick(song, index)}
                draggable={!targetPlaylistForAdd}
                onDragStart={(e) => !targetPlaylistForAdd && handleDragStart(e, index)}
                onDragOver={(e) => !targetPlaylistForAdd && handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => !targetPlaylistForAdd && handleDrop(e, index)}
                onDragEnd={handleDragEnd}
                className={`flex items-center justify-between w-full group py-4 hover:bg-white/10 pl-0.5 pr-0.5 md:pl-2 md:pr-2 rounded-md transition-all cursor-pointer select-none ${
                  isCurrent && !targetPlaylistForAdd ? 'bg-white/5 text-white' : ''
                } ${isSelectedForAdd ? 'bg-[#1DB954]/20 border border-[#1DB954]/50' : 'border border-transparent'} ${draggedIndex === index ? 'opacity-40 bg-zinc-850' : ''} ${
                  dragOverIndex === index ? 'border-b-2 border-emerald-500' : ''
                }`}
              >
                {/* Drag Handle Column or Checkbox Placeholder */}
                {targetPlaylistForAdd ? (
                  <div className="w-8 md:w-12 text-center shrink-0 flex items-center justify-center pl-1">
                     <div className={`w-4 h-4 md:w-5 md:h-5 rounded-full border-2 flex items-center justify-center transition-all ${isSelectedForAdd ? 'bg-[#1DB954] border-[#1DB954]' : 'border-neutral-500'}`}>
                       {isSelectedForAdd && <Check className="w-3 h-3 text-black" />}
                     </div>
                  </div>
                ) : (
                  <div
                    id={`song-grip-${song.id}`}
                    className="w-3 md:w-8 text-center cursor-grab active:cursor-grabbing text-neutral-600 hover:text-neutral-300 shrink-0 flex items-center justify-center pl-0.5"
                    title="Drag and drop to reorder"
                    onClick={(e) => e.stopPropagation()} 
                  >
                    {/* Small, elegant, visible drag bullet on mobile, standard drag-grip on desktop */}
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-600 group-hover:bg-[#1DB954] transition-colors md:hidden" />
                    <GripVertical className="w-4 h-4 hidden md:block mx-auto" />
                  </div>
                )}

                {/* Index / Play Button */}
                <div className="w-12 text-center font-medium relative hidden md:flex items-center justify-center shrink-0">
                  <span className="group-hover:hidden text-xs">
                    {isCurrent ? (
                      <div className="flex justify-center items-center gap-1">
                        <span className={`w-1 bg-[#1DB954] rounded-full ${isThisPlaying ? 'animate-bounce h-3' : 'h-3'}`} style={{animationDelay: '0.1s'}}></span>
                        <span className={`w-1 bg-[#1DB954] rounded-full ${isThisPlaying ? 'animate-bounce h-3' : 'h-1.5'}`} style={{animationDelay: '0.3s'}}></span>
                        <span className={`w-1 bg-[#1DB954] rounded-full ${isThisPlaying ? 'animate-bounce h-3' : 'h-2'}`} style={{animationDelay: '0.5s'}}></span>
                      </div>
                    ) : (
                      index + 1
                    )}
                  </span>
                  
                  {/* Play/Pause Hover Trigger */}
                  <button
                    id={`btn-track-play-${song.id}`}
                    onClick={(e) => handlePlayPauseToggle(song, index, e)}
                    className="hidden group-hover:flex absolute inset-0 items-center justify-center text-white bg-transparent hover:scale-110 active:scale-95 transition-all w-full cursor-pointer"
                  >
                    {isThisPlaying ? (
                      <Pause className="w-4 h-4 fill-white" />
                    ) : (
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    )}
                  </button>
                </div>

                {/* Title & Artist Grouped - Expand content allowed to grow */}
                <div className="flex-grow flex-1 min-w-0 flex items-center gap-1.5 md:gap-3 pl-1 md:px-4">
                  <Artwork artist={song.artist} album={song.album} title={song.title} coverUrl={song.coverUrl} sizeClass="w-10 h-10 md:w-11 md:h-11 rounded flex-shrink-0" />
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    <span 
                      id={`song-title-${song.id}`} 
                      className={`font-semibold text-sm md:text-base text-white truncate block ${isCurrent ? 'text-[#1DB954]' : ''}`}
                      style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {song.title}
                    </span>
                    <span 
                      id={`song-artist-${song.id}`} 
                      className="text-xs text-neutral-400 block truncate group-hover:text-neutral-300 mt-0.5"
                      style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    >
                      {song.artist}
                    </span>
                  </div>
                </div>

                {/* Album Column */}
                <div className="w-1/4 hidden md:block px-2 md:px-4 text-neutral-400 group-hover:text-neutral-305 shrink-0 truncate">
                  {song.album}
                </div>

                {/* Actions grouping - Condensed tightly on mobile, matches table columns layout on desktop */}
                <div className="flex items-center gap-1.5 md:gap-4 shrink-0 md:contents pr-0.5 md:pr-0">
                  {/* Like Button Column */}
                  <div className="w-auto md:w-12 md:w-16 flex items-center justify-center shrink-0">
                    <button
                      id={`btn-like-song-${song.id}`}
                      onClick={(e) => handleLikeClick(song.id, e)}
                      className={`p-1.5 md:p-1 hover:scale-115 active:scale-90 transition-transform cursor-pointer flex-shrink-0 ${
                        isLiked ? 'text-[#1DB954]' : 'text-neutral-500 hover:text-neutral-300'
                      }`}
                      title={isLiked ? 'Remove from Liked Songs' : 'Like this song'}
                    >
                      <Heart className="w-3.5 h-3.5 md:w-5 md:h-5" fill={isLiked ? '#1DB954' : 'none'} />
                    </button>
                  </div>

                  {/* Actions Dropdown Button Column */}
                  <div className="w-auto md:w-20 md:w-24 relative flex items-center justify-center gap-1 shrink-0">
                    <button
                      id={`btn-add-menu-${song.id}`}
                      onClick={(e) => toggleDropdown(song.id, e)}
                      className="p-1.5 md:p-1 rounded-full text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer flex-shrink-0"
                      title="Add to custom playlist"
                    >
                      <Plus className="w-3 h-3 md:w-4 md:h-4" />
                    </button>

                    {isPlaylistView && playlistId && (
                      <button
                        id={`btn-remove-pl-song-${song.id}`}
                        onClick={(e) => handleRemoveFromPlaylist(e, song.id)}
                        className="p-1.5 md:p-1 rounded-full text-neutral-500 hover:text-red-500 hover:bg-neutral-800 transition-colors cursor-pointer flex-shrink-0"
                        title="Remove from this playlist"
                      >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                      </button>
                    )}

                    {activeDropdownSongId === song.id && (
                      <div
                        id={`dropdown-playlists-${song.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute right-0 top-full mt-1 w-48 bg-neutral-900 border border-neutral-800 rounded-lg shadow-2xl py-1 z-50 text-left"
                      >
                        <div className="px-3 py-1.5 text-[10px] text-neutral-500 uppercase tracking-widest border-b border-neutral-800 select-none">
                          Add to playlist
                        </div>
                        
                        {playlists.length === 0 ? (
                          <div className="px-3 py-3 text-xs text-neutral-500 italic text-center text-wrap leading-tight">
                            No custom playlists. Create one in the lateral panel!
                          </div>
                        ) : (
                          <div className="max-h-40 overflow-y-auto">
                            {playlists.map((pl) => {
                              const alreadyInPlaylist = pl.songIds.includes(song.id);
                              return (
                                <button
                                  key={pl.id}
                                  id={`dropdown-pl-opt-${pl.id}-${song.id}`}
                                  onClick={(e) => handleAddToPlaylist(e, pl.id, song.id)}
                                  className="w-full px-3 py-2 text-left text-xs hover:bg-neutral-800 hover:text-white flex items-center justify-between transition-colors"
                                >
                                  <span className="truncate">{pl.name}</span>
                                  {alreadyInPlaylist && (
                                    <Check className="w-3.5 h-3.5 text-[#1DB954] flex-shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
