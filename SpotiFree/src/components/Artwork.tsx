import { useEffect, useState } from 'react';
import { useAppStore } from '../store';

interface ArtworkProps {
  artist: string;
  album: string;
  sizeClass?: string;
  textClass?: string;
  coverUrl?: string;
  title?: string;
}

export default function Artwork({
  artist,
  album,
  sizeClass = 'w-10 h-10',
  textClass = 'text-[10px]',
  coverUrl,
  title
}: ArtworkProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(coverUrl || null);
  const [loading, setLoading] = useState<boolean>(!coverUrl);
  const { setAudioError } = useAppStore();

  useEffect(() => {
    if (coverUrl) {
      setImageUrl(coverUrl);
      setLoading(false);
      return;
    }

    // Skip empty values or standard placeholders
    if (!artist || artist === 'Unknown Artist' || artist.toLowerCase() === 'unknown') {
      setImageUrl(null);
      setLoading(false);
      return;
    }

    let active = true;
    const fetchArtwork = async () => {
      setLoading(true);
      try {
        const track = {
          title: title || '',
          artist: artist || ''
        };
        const query = `${track.title} ${track.artist}`.trim() || album;
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&country=in&limit=1`;

        const res = await fetch(url);
        if (!res.ok) throw new Error('iTunes Search API request failed');
        const data = await res.json();
        
        if (active) {
          if (data && Array.isArray(data.results) && data.results.length > 0) {
            const trackInfo = data.results[0];
            const artUrl = trackInfo.artworkUrl100 ? trackInfo.artworkUrl100.replace('100x100bb', '1000x1000bb') : trackInfo.artworkUrl600;
            if (artUrl) {
              setImageUrl(artUrl);
            } else {
              throw new Error('No artwork URL found in iTunes response');
            }
          } else {
            throw new Error('No results returned from iTunes Search API');
          }
        }
      } catch (err) {
        if (active) {
          setImageUrl(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchArtwork();
    return () => {
      active = false;
    };
  }, [artist, album, coverUrl, title, setAudioError]);

  // Compute backup gradient
  const getGradientForArtist = (artistName: string) => {
    let hash = 0;
    for (let i = 0; i < artistName.length; i++) {
       hash = artistName.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h1 = Math.abs(hash) % 360;
    const h2 = (h1 + 60) % 360;
    return `linear-gradient(135deg, hsl(${h1}, 70%, 50%), hsl(${h2}, 80%, 25%))`;
  };

  const gradientStyle = {
    background: getGradientForArtist(artist),
  };

  if (loading) {
    return (
      <div 
        id="artwork-loading"
        className={`${sizeClass} rounded-sm flex items-center justify-center animate-pulse bg-neutral-800 text-neutral-500`}
      >
        <div className="w-4 h-4 border-2 border-neutral-600 border-t-emerald-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (imageUrl) {
    return (
      <img
        id="artwork-image"
        src={imageUrl}
        alt={`${album} cover`}
        referrerPolicy="no-referrer"
        className={`${sizeClass} rounded-sm object-cover shadow-md`}
        onError={() => setImageUrl(null)} // fallback on image load error
      />
    );
  }

  return (
    <div
      id="artwork-fallback"
      style={gradientStyle}
      className={`${sizeClass} rounded-sm flex flex-col items-center justify-center shadow-lg text-white select-none relative overflow-hidden`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-1/2 h-1/2 text-white/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
        <path d="M9 18V5l12-2v13" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
      <div className="absolute inset-0 bg-black/15 hover:bg-transparent transition-colors duration-200"></div>
    </div>
  );
}
