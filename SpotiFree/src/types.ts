export interface Song {
  id: string;
  title: string;
  artist: string;
  album: string;
  url: string;
  audioUrl?: string;
  coverUrl?: string;
  duration: string | number; // Support string (MM:SS) or number (seconds)
}

export interface Playlist {
  id: string;
  name: string;
  songIds: string[];
}

export type ViewType = 'home' | 'liked-songs' | string; // string represents playlistId
