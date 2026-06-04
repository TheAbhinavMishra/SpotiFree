import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Song, Playlist, ViewType } from './types';

// Store 1: Music Catalog and Active Playback State
interface AppState {
  catalog: Song[];
  searchQuery: string;
  isAboutOpen: boolean;
  setAboutOpen: (isOpen: boolean) => void;
  activeView: ViewType;
  currentSong: Song | null;
  isPlaying: boolean;
  playbackQueue: Song[];
  currentQueueIndex: number;
  isMobileMenuOpen: boolean;
  playbackMode: 'normal' | 'shuffle' | 'repeat';
  audioError: string | null;
  targetPlaylistForAdd: string | null;
  selectedSongIdsForAdd: string[];
  toastMessage: string | null;
  
  // Setters
  setCatalog: (songs: Song[]) => void;
  setSearchQuery: (query: string) => void;
  setActiveView: (view: ViewType) => void;
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setQueue: (queue: Song[], startIndex: number) => void;
  nextSong: () => void;
  prevSong: () => void;
  setIsMobileMenuOpen: (open: boolean) => void;
  reorderCatalog: (startIndex: number, endIndex: number) => void;
  setPlaybackMode: (mode: 'normal' | 'shuffle' | 'repeat') => void;
  setAudioError: (error: string | null) => void;
  setTargetPlaylistForAdd: (playlistId: string | null) => void;
  toggleSongSelectionForAdd: (songId: string) => void;
  clearSongSelectionForAdd: () => void;
  showToast: (message: string) => void;
  clearToast: () => void;
  fetchCatalog: () => Promise<void>;
}

const DEFAULT_CATALOG: Song[] = [
  {
    id: "archive_track_0",
    title: "Can't Hold Us",
    artist: "Macklemore & Ryan Lewis (feat. Ray Dalton)",
    album: "Internet Archive Item",
    url: "https://archive.org/download/spotifree-db/Can%27t%20Hold%20Us%20-%20Macklemore%20%26%20Ryan%20Lewis%20%28feat.%20Ray%20Dalton%29.mp3",
    audioUrl: "https://archive.org/download/spotifree-db/Can%27t%20Hold%20Us%20-%20Macklemore%20%26%20Ryan%20Lewis%20%28feat.%20Ray%20Dalton%29.mp3",
    coverUrl: undefined,
    duration: 257.07,
  },
  {
    id: "archive_track_1",
    title: "Viva La Vida",
    artist: "Colplay",
    album: "Internet Archive Item",
    url: "https://archive.org/download/spotifree-db/Viva%20La%20Vida%20%20-%20Colplay.mp3",
    audioUrl: "https://archive.org/download/spotifree-db/Viva%20La%20Vida%20%20-%20Colplay.mp3",
    coverUrl: undefined,
    duration: 242.13,
  },
  {
    id: "archive_track_2",
    title: "Vivaldi Winter Drill #2",
    artist: "veneris",
    album: "Vivaldi Winter Drill #2",
    url: "https://archive.org/download/spotifree-db/Vivaldi%20Winter%20Drill%20%232%20-%20veneris.mp3",
    audioUrl: "https://archive.org/download/spotifree-db/Vivaldi%20Winter%20Drill%20%232%20-%20veneris.mp3",
    coverUrl: undefined,
    duration: 116.58,
  }
];

export const useAppStore = create<AppState>((set, get) => ({
  catalog: DEFAULT_CATALOG,
  searchQuery: '',
  isAboutOpen: false,
  setAboutOpen: (val) => set({ isAboutOpen: val }),
  activeView: 'home',
  currentSong: null,
  isPlaying: false,
  playbackQueue: [],
  currentQueueIndex: -1,
  isMobileMenuOpen: false,
  playbackMode: 'normal',
  audioError: null,
  targetPlaylistForAdd: null,
  selectedSongIdsForAdd: [],
  toastMessage: null,

  setCatalog: (songs) => set({ catalog: songs }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveView: (view) => set({ activeView: view }),
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setIsMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  setPlaybackMode: (mode) => set({ playbackMode: mode }),
  setAudioError: (error) => set({ audioError: error }),
  setTargetPlaylistForAdd: (playlistId) => set({ targetPlaylistForAdd: playlistId, selectedSongIdsForAdd: [] }),
  toggleSongSelectionForAdd: (songId) => set((state) => {
    const isSelected = state.selectedSongIdsForAdd.includes(songId);
    return {
      selectedSongIdsForAdd: isSelected 
        ? state.selectedSongIdsForAdd.filter(id => id !== songId)
        : [...state.selectedSongIdsForAdd, songId]
    };
  }),
  clearSongSelectionForAdd: () => set({ selectedSongIdsForAdd: [], targetPlaylistForAdd: null }),
  showToast: (message) => {
    set({ toastMessage: message });
    setTimeout(() => {
      set({ toastMessage: null });
    }, 3000);
  },
  clearToast: () => set({ toastMessage: null }),

  
  setQueue: (queue, startIndex) => set({
    playbackQueue: queue,
    currentQueueIndex: startIndex,
    currentSong: queue[startIndex] || null,
    isPlaying: queue[startIndex] ? true : false
  }),

  fetchCatalog: async () => {
    // Rely exclusively on Vite's replacement
    const metaEnv = (import.meta as any).env || {};
    const envId = metaEnv.VITE_ARCHIVE_IDENTIFIER || metaEnv.NEXT_PUBLIC_ARCHIVE_IDENTIFIER;
    console.log("DEBUG: raw VITE_ARCHIVE_IDENTIFIER resolved to:", envId);
    const identifierToUse = "spotifree-db";
    
    console.log("DEBUG: identifierToUse resolved to:", identifierToUse);

    let data: any = null;
    try {
      const url = `https://archive.org/metadata/${identifierToUse}`;
      console.log("SpotiFree loading file list from Internet Archive metadata URL in Zustand:", url);
      const res = await fetch(url);
      if (res.ok) {
        data = await res.json();
      } else {
        throw new Error(`Internet Archive returned status ${res.status}`);
      }
    } catch (fetchErr) {
      console.warn("Failed to fetch dynamically from Internet Archive in Zustand, using fallback:", fetchErr);
    }

    // Default tracklist if metadata fetch is offline or empty
    if (!data || !data.files || data.files.length === 0) {
      console.warn("Store: No valid files returned from Internet Archive. Using fallback mock catalog.");
      data = { files: [
        { name: "Can't Hold Us - Macklemore & Ryan Lewis (feat. Ray Dalton).mp3", length: "257" },
        { name: "Viva La Vida  - Colplay.mp3", length: "242" },
        { name: "Vivaldi Winter Drill #2 - veneris.mp3", length: "116" }
      ] };
    }

    try {
      if (data && Array.isArray(data.files)) {
        // Filter the returned 'files' array to isolate only objects where 'name' property ends with '.mp3'
        const mp3Files = data.files.filter((file: any) => {
          const fileName = file.name || '';
          return fileName.toLowerCase().endsWith('.mp3');
        });

       // Map over these MP3s and dynamically build the track objects
        const parsedSongs: Song[] = mp3Files.map((file: any, index: number) => {
          const rawFilename = file.name;
          const nameWithoutExt = rawFilename.replace(/\.mp3$/i, '');
          const lengthSecs = file.length ? parseFloat(file.length) : 0;

          let title = nameWithoutExt;
          let artist = 'Unknown Artist';

          if (nameWithoutExt.includes(' - ')) {
            const parts = nameWithoutExt.split(' - ');
            title = parts[0].trim();
            artist = parts.slice(1).join(' - ').trim();
          } else if (nameWithoutExt.includes('-')) {
            const parts = nameWithoutExt.split('-');
            title = parts[0].trim();
            artist = parts.slice(1).join('-').trim();
          }

          const finalAudioUrl = "https://archive.org/download/" + identifierToUse + "/" + encodeURIComponent(rawFilename);

          // AUTOMATED GITHUB LRC CONFIGURATION
          const yourGithubUser = "TheAbhinavMishra";
          const yourRepo = "SpotiFree";

          // Clean up encoding so GitHub raw server doesn't throw a 404
          const encodedName = encodeURIComponent(nameWithoutExt)
            .replaceAll('%2C', ',')
            .replaceAll('%20', ' ');

          const finalLrcUrl = "https://raw.githubusercontent.com/" + yourGithubUser + "/" + yourRepo + "/refs/heads/main/SpotiFree/" + encodedName + ".lrc";
          return {
            id: "archive_track_" + index,
            title: title,
            artist: artist,
            Singer: artist, 
            Title: title,   
            album: 'Internet Archive Item',
            url: finalAudioUrl,
            audioUrl: finalAudioUrl,
            lrcUrl: finalLrcUrl, 
            coverUrl: undefined,
            duration: lengthSecs,
          } as any;
        });

        if (parsedSongs.length > 0) {
          set({ catalog: parsedSongs });
        }
      }
    } catch (err) {
      console.error("Failed to parse Internet Archive metadata tracks in Zustand store:", err);
    }
  },

  nextSong: () => {
    const { playbackQueue, currentQueueIndex, playbackMode } = get();
    if (playbackQueue.length === 0) return;
    
    let nextIndex = currentQueueIndex;
    if (playbackMode === 'repeat') {
      // Repeat current song
      nextIndex = currentQueueIndex;
    } else if (playbackMode === 'shuffle') {
      if (playbackQueue.length > 1) {
        // randomly pick a song from the next 5 songs in the table/queue
        const maxOffset = Math.min(5, playbackQueue.length - 1);
        const offset = Math.floor(Math.random() * maxOffset) + 1;
        nextIndex = (currentQueueIndex + offset) % playbackQueue.length;
      } else {
        nextIndex = 0;
      }
    } else {
      nextIndex = (currentQueueIndex + 1) % playbackQueue.length;
    }

    set({
      currentQueueIndex: nextIndex,
      currentSong: playbackQueue[nextIndex],
      isPlaying: true
    });
  },

  prevSong: () => {
    const { playbackQueue, currentQueueIndex } = get();
    if (playbackQueue.length === 0) return;
    const prevIndex = (currentQueueIndex - 1 + playbackQueue.length) % playbackQueue.length;
    set({
      currentQueueIndex: prevIndex,
      currentSong: playbackQueue[prevIndex],
      isPlaying: true
    });
  },

  reorderCatalog: (startIndex, endIndex) => {
    const { catalog } = get();
    const nextCatalog = [...catalog];
    const [removed] = nextCatalog.splice(startIndex, 1);
    nextCatalog.splice(endIndex, 0, removed);
    set({ catalog: nextCatalog });
  }
}));


// Store 2: Persistent User Data (Playlists, Liked Songs)
interface UserState {
  playlists: Playlist[];
  likedSongIds: string[];
  
  // Actions
  toggleLikeSong: (songId: string) => void;
  createPlaylist: (name: string) => string; // Returns the generated playlist ID
  renamePlaylist: (id: string, name: string) => void;
  deletePlaylist: (id: string) => void;
  addSongToPlaylist: (playlistId: string, songId: string) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  reorderLikedSongs: (startIndex: number, endIndex: number) => void;
  reorderPlaylistSongs: (playlistId: string, startIndex: number, endIndex: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      playlists: [],
      likedSongIds: [],

      toggleLikeSong: (songId) => set((state) => {
        const isLiked = state.likedSongIds.includes(songId);
        const nextLiked = isLiked
          ? state.likedSongIds.filter((id) => id !== songId)
          : [...state.likedSongIds, songId];
        return { likedSongIds: nextLiked };
      }),

      createPlaylist: (name) => {
        const id = 'playlist_' + Math.random().toString(36).substr(2, 9);
        set((state) => ({
          playlists: [
            ...state.playlists,
            { id, name, songIds: [] }
          ]
        }));
        return id;
      },

      renamePlaylist: (id, name) => set((state) => ({
        playlists: state.playlists.map((pl) =>
          pl.id === id ? { ...pl, name } : pl
        )
      })),

      deletePlaylist: (id) => set((state) => ({
        playlists: state.playlists.filter((pl) => pl.id !== id)
      })),

      addSongToPlaylist: (playlistId, songId) => set((state) => ({
        playlists: state.playlists.map((pl) => {
          if (pl.id === playlistId) {
            // Uniquely add
            if (!pl.songIds.includes(songId)) {
              return { ...pl, songIds: [...pl.songIds, songId] };
            }
          }
          return pl;
        })
      })),

      removeSongFromPlaylist: (playlistId, songId) => set((state) => ({
        playlists: state.playlists.map((pl) => {
          if (pl.id === playlistId) {
            return { ...pl, songIds: pl.songIds.filter((id) => id !== songId) };
          }
          return pl;
        })
      })),

      reorderLikedSongs: (startIndex, endIndex) => set((state) => {
        const nextLiked = [...state.likedSongIds];
        const [removed] = nextLiked.splice(startIndex, 1);
        nextLiked.splice(endIndex, 0, removed);
        return { likedSongIds: nextLiked };
      }),

      reorderPlaylistSongs: (playlistId, startIndex, endIndex) => set((state) => ({
        playlists: state.playlists.map((pl) => {
          if (pl.id === playlistId) {
            const nextSongs = [...pl.songIds];
            const [removed] = nextSongs.splice(startIndex, 1);
            nextSongs.splice(endIndex, 0, removed);
            return { ...pl, songIds: nextSongs };
          }
          return pl;
        })
      }))
    }),
    {
      name: 'spotify-user-storage', // key in LocalStorage
    }
  )
);

// Automatic store initialization trigger for Internet Archive metadata tracks
if (typeof window !== 'undefined') {
  useAppStore.getState().fetchCatalog().catch((err) => {
    console.error("Zustand store auto-fetch failed:", err);
  });
}
