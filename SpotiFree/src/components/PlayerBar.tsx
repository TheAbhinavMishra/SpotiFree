import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, 
  Repeat, Shuffle, Maximize2, Headphones, ChevronDown, AlertCircle, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAppStore } from '../store';
import Artwork from './Artwork';

export default function PlayerBar() {
  const { 
    currentSong, isPlaying, setIsPlaying, nextSong, prevSong, playbackQueue,
    playbackMode, setPlaybackMode, audioError, setAudioError
  } = useAppStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedSongIdRef = useRef<string | null>(null);
  
  // Local state for tracking audio progress
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.7);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Expanded high-fidelity states
  const [isFullScreenOpen, setIsFullScreenOpen] = useState<boolean>(false);
  const [isLyricsFullScreen, setIsLyricsFullScreen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Lyrics state
  const [lyricsLines, setLyricsLines] = useState<{ time: number; text: string }[]>([]);
  const [plainLyrics, setPlainLyrics] = useState<string | null>(null);
  const [isLyricsLoading, setIsLyricsLoading] = useState<boolean>(false);
  const [lyricsError, setLyricsError] = useState<string | null>(null);

  const activeLyricLineRef = useRef<HTMLButtonElement | null>(null);

  // LRC format parser helper
  const parseLRC = (lrcText: string) => {
    const lines = lrcText.split('\n');
    const result: { time: number; text: string }[] = [];
    const timeRegex = /\[(\d+):(\d+)(?:[.:](\d+))?\]/g;

    for (const line of lines) {
      timeRegex.lastIndex = 0;
      const match = timeRegex.exec(line);
      if (match) {
        const minutes = parseInt(match[1], 10);
        const seconds = parseInt(match[2], 10);
        const centiseconds = match[3] ? parseInt(match[3], 10) : 0;
        
        const msFactor = match[3] && match[3].length === 3 ? 1000 : 100;
        const fraction = centiseconds / msFactor;
        const totalTime = minutes * 60 + seconds + fraction;
        
        const text = line.replace(/\[\d+:\d+(?:[.:]\d+)?\]/g, '').trim();
        result.push({ time: totalTime, text });
      }
    }
    return result.sort((a, b) => a.time - b.time);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch lyrics from Internet Archive OR LRCLIB
  useEffect(() => {
    if (!currentSong) {
      setLyricsLines([]);
      setPlainLyrics(null);
      setLyricsError(null);
      return;
    }

    let active = true;
    const fetchLyrics = async () => {
      setIsLyricsLoading(true);
      setLyricsError(null);
      setLyricsLines([]);
      setPlainLyrics(null);

      try {
        // --- NEW LOGIC: 1. PRIMARY INTERNET ARCHIVE FETCH ---
        const audioUrl = currentSong.url || currentSong.audioUrl || '';
        if (audioUrl && typeof audioUrl === 'string') {
          // Swap the exact extension (e.g., .mp3) for .lrc
          const lastDotIndex = audioUrl.lastIndexOf('.');
          if (lastDotIndex !== -1) {
            const lrcUrl = audioUrl.substring(0, lastDotIndex) + '.lrc';
            try {
              const iaRes = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(lrcUrl)}`);
              if (iaRes.ok) {
                const iaText = await iaRes.text();
                // Validate that the file contains actual LRC timestamps
                if (active && iaText && iaText.includes('[00:')) {
                  setLyricsLines(parseLRC(iaText));
                  setIsLyricsLoading(false);
                  return; // 🚀 Success! Exit early, bypass LRCLIB entirely.
                }
              }
            } catch (iaErr) {
              // Silently ignore IA fetch failure and allow fallback
              console.log('Custom .lrc not found, falling back to LRCLIB...');
            }
          }
        }
        // --- END NEW LOGIC ---

        // --- 2. FALLBACK LOGIC: LRCLIB API ---
        const slicedTitle = (currentSong as any).Title || currentSong.title;
        const slicedSinger = (currentSong as any).Singer || currentSong.artist;

        const trackName = encodeURIComponent(slicedTitle);
        const artistName = encodeURIComponent(slicedSinger);
        let url = `https://lrclib.net/api/get?track_name=${trackName}&artist_name=${artistName}`;
        
        if (currentSong.album && currentSong.album !== "Internet Archive Item") {
          url += `&album_name=${encodeURIComponent(currentSong.album)}`;
        }
        
        let durationSecs = 0;
        if (currentSong.duration) {
          if (typeof currentSong.duration === 'number') {
            durationSecs = currentSong.duration;
          } else {
            durationSecs = currentSong.duration.split(':').reduce((acc, time) => (60 * acc) + parseInt(time, 10), 0);
          }
        }
        if (durationSecs > 0) {
          url += `&duration=${durationSecs}`;
        }

        const res = await fetch(url);
        if (!active) return;

        if (res.status === 404) {
          const searchQueryString = encodeURIComponent(`${slicedTitle} ${slicedSinger}`);
          const searchRes = await fetch(`https://lrclib.net/api/search?q=${searchQueryString}`);
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            if (active && Array.isArray(searchData) && searchData.length > 0) {
              const bestMatch = searchData[0];
              if (bestMatch.syncedLyrics) {
                setLyricsLines(parseLRC(bestMatch.syncedLyrics));
              } else if (bestMatch.plainLyrics) {
                setPlainLyrics(bestMatch.plainLyrics);
              } else {
                setLyricsError('Lyrics matching search record are empty');
              }
              setIsLyricsLoading(false);
              return;
            }
          }
          throw new Error('No lyrics available on LRCLIB');
        }

        if (!res.ok) {
          throw new Error(`API error: status code ${res.status}`);
        }

        const data = await res.json();
        if (!active) return;

        if (data.syncedLyrics) {
          setLyricsLines(parseLRC(data.syncedLyrics));
        } else if (data.plainLyrics) {
          setPlainLyrics(data.plainLyrics);
        } else {
          setLyricsError('Song lyrics record is empty');
        }
      } catch (err: any) {
        if (active) {
          setLyricsError(err.message || 'Error occurred querying LRCLIB');
          if (err.message !== 'No lyrics available on LRCLIB' && err.message !== 'Lyrics matching search record are empty' && err.message !== 'Song lyrics record is empty') {
            setAudioError('Error 404: The beat dropped TOO HARD and we Lost It. Try again later');
          }
        }
      } finally {
        if (active) {
          setIsLyricsLoading(false);
        }
      }
    };

    fetchLyrics();
    return () => {
      active = false;
    };
  }, [currentSong, setAudioError]);

  // Calculate active lyric sentence index
  let activeLyricIndex = -1;
  for (let i = 0; i < lyricsLines.length; i++) {
    if (currentTime >= lyricsLines[i].time) {
      activeLyricIndex = i;
    } else {
      break;
    }
  }

  // Auto-scrolling centering
  useEffect(() => {
    if (activeLyricLineRef.current && isLyricsFullScreen) {
      activeLyricLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeLyricIndex, isLyricsFullScreen]);

  const handleLineClick = (lineTime: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = lineTime;
    setCurrentTime(lineTime);
  };

  const handleAudioError = (e: any) => {
    if (!currentSong || !audioRef.current?.src) return;
    const errorObj = audioRef.current?.error;
    
    if (errorObj && errorObj.code === 1) return;

    console.error('Audio load error occurred:', errorObj);
    
    setAudioError('Error 404: The beat dropped TOO HARD and we Lost It. Try again later');
    setIsPlaying(false);
  };

  useEffect(() => {
    if (!audioRef.current) return;

    if (!currentSong) {
      audioRef.current.pause();
      audioRef.current.src = '';
      loadedSongIdRef.current = null;
      setAudioError(null);
      return;
    }

    const songUrl = currentSong.url || currentSong.audioUrl || '';
    const isNewSong = loadedSongIdRef.current !== currentSong.id;

    if (isNewSong) {
      audioRef.current.pause();
      audioRef.current.src = songUrl;
      audioRef.current.load();
      loadedSongIdRef.current = currentSong.id;
      setAudioError(null);
    }

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        if (err.name === 'AbortError') {
          console.log('Play request was aborted/interrupted by a new load request (expected behavior during track shifting).');
          return;
        }
        console.warn('Playback interrupted or blocked by autoplay browser guidelines:', err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [currentSong, isPlaying, setIsPlaying]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs)) return '0:00';
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    setDuration(audioRef.current.duration);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const clickTime = parseFloat(e.target.value);
    audioRef.current.currentTime = clickTime;
    setCurrentTime(clickTime);
  };

  const handleAudioEnded = () => {
    if (playbackMode === 'repeat' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => console.warn(err));
    } else {
      nextSong();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (vol > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <>
      <AnimatePresence>
        {audioError && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed bottom-[140px] left-4 right-4 md:left-8 md:right-8 lg:left-16 lg:right-16 z-50 flex justify-center pointer-events-none"
          >
            <div className="bg-neutral-900 border border-red-500/30 text-red-200 pointer-events-auto flex items-center justify-between gap-4 py-3.5 px-6 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-md max-w-2xl w-full border-l-4 border-l-red-500">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase tracking-wider text-red-400">Audio Playback Deficit</span>
                  <span className="text-sm font-semibold text-neutral-100 mt-0.5 leading-snug">{audioError}</span>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setAudioError(null);
                }}
                className="text-neutral-400 hover:text-white hover:bg-white/5 p-1.5 rounded-lg transition-colors cursor-pointer"
                title="Dismiss Error"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <footer
        id="bottom-player-bar"
        onClick={() => currentSong && setIsFullScreenOpen(true)}
        className="h-32 bg-[#121212]/95 backdrop-blur-md border-t border-neutral-800/80 flex flex-col justify-between py-3.5 px-6 md:px-16 lg:px-20 select-none fixed bottom-0 left-0 right-0 z-40 text-white font-sans shadow-2xl cursor-pointer hover:bg-white/5 transition-colors"
      >
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={handleAudioEnded}
          onError={handleAudioError}
        />

        <div id="player-top-line" className="flex items-center justify-between w-full min-w-0 border-b border-neutral-800/20 pb-1">
          <div className="flex items-center gap-2.5 truncate min-w-0 flex-1">
            {currentSong ? (
              <div className="flex items-center gap-2 md:gap-3 truncate text-sm md:text-base w-full min-w-0 pr-2">
                <Artwork artist={currentSong.artist} album={currentSong.album} title={currentSong.title} coverUrl={currentSong.coverUrl} sizeClass="w-8 h-8 md:w-10 md:h-10 rounded flex-shrink-0" />
                <div className="flex flex-col sm:flex-row sm:items-baseline gap-0 sm:gap-2 min-w-0 flex-1 justify-center overflow-hidden">
                  <div className="overflow-hidden mask-image-fade group/marquee">
                    <span 
                      className={`font-bold text-white tracking-tight inline-block whitespace-nowrap text-sm md:text-base md:truncate lg:animate-none group-hover/marquee:animate-none ${currentSong.title.length > 20 ? 'max-md:animate-marquee' : 'truncate'}`}
                    >
                      {currentSong.title}
                    </span>
                  </div>
                  <span className="text-neutral-400 font-medium text-[10px] md:text-xs truncate shrink-0">
                    <span className="hidden sm:inline">&bull; by </span>{currentSong.artist}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-neutral-500 text-xs md:text-sm">
                <Headphones className="w-4 h-4 text-neutral-600 flex-shrink-0" />
                <span className="font-bold text-neutral-400 uppercase tracking-wider block">No track loaded</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 md:gap-4 flex-shrink-0">
            <button
              id="player-shuffle"
              onClick={(e) => {
                e.stopPropagation();
                setPlaybackMode(playbackMode === 'shuffle' ? 'normal' : 'shuffle');
              }}
              className={`transition-colors cursor-pointer p-1 rounded hover:bg-neutral-800/40 ${
                playbackMode === 'shuffle' ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'
              }`}
              title="Shuffle (Pick randomly from next 5 songs)"
            >
              <Shuffle className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
            
            <button
              id="player-repeat"
              onClick={(e) => {
                e.stopPropagation();
                setPlaybackMode(playbackMode === 'repeat' ? 'normal' : 'repeat');
              }}
              className={`transition-colors cursor-pointer p-1 rounded hover:bg-neutral-800/40 ${
                playbackMode === 'repeat' ? 'text-[#1DB954]' : 'text-neutral-400 hover:text-white'
              }`}
              title="Loop Track (Repeat)"
            >
              <Repeat className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          </div>
        </div>

        <div id="player-middle-line" className="flex items-center justify-center gap-6 my-0.5">
          <button
            id="player-prev"
            onClick={(e) => {
              e.stopPropagation();
              prevSong();
            }}
            className="text-neutral-400 hover:text-white active:scale-90 transition-transform cursor-pointer p-1"
            title="Previous Track"
            disabled={playbackQueue.length === 0}
          >
            <SkipBack className="w-4 h-4 md:w-5 md:h-5 fill-neutral-400 hover:fill-white" />
          </button>

          <button
            id="player-play-pause"
            onClick={(e) => {
              e.stopPropagation();
              if (currentSong) setIsPlaying(!isPlaying);
            }}
            disabled={!currentSong}
            className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer ${
              currentSong ? 'bg-white text-black hover:bg-neutral-200' : 'bg-neutral-700 text-neutral-500 cursor-not-allowed'
            }`}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 md:w-4 md:h-4 fill-black text-black" />
            ) : (
              <Play className="w-3.5 h-3.5 md:w-4 md:h-4 fill-black text-black ml-0.5" />
            )}
          </button>

          <button
            id="player-next"
            onClick={(e) => {
              e.stopPropagation();
              nextSong();
            }}
            className="text-neutral-400 hover:text-white active:scale-90 transition-transform cursor-pointer p-1"
            title="Next Track"
            disabled={playbackQueue.length === 0}
          >
            <SkipForward className="w-4 h-4 md:w-5 md:h-5 fill-neutral-400 hover:fill-white" />
          </button>
        </div>

        <div id="player-bottom-line" className="flex items-center justify-between gap-4 md:gap-10 w-full mb-0.5">
          <div id="player-progress-bar-wrapper" className="flex-1 flex items-center gap-2 md:gap-3 text-neutral-400 min-w-0">
            <span className="w-6 md:w-8 text-right font-mono text-[9px] md:text-[11px] select-none text-neutral-500">
              {formatTime(currentTime)}
            </span>
            
            <input
              id="player-progressbar"
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                handleSeekChange(e);
              }}
              disabled={!currentSong}
              className="accent-[#1DB954] flex-1 h-1 bg-neutral-700 hover:bg-neutral-600 rounded-lg appearance-none cursor-pointer focus:outline-none transition-colors"
            />

            <span className="w-6 md:w-8 text-left font-mono text-[9px] md:text-[11px] select-none text-neutral-500">
              {currentSong ? formatTime(duration) : '0:00'}
            </span>
          </div>

          <div id="player-accessories-volume" className="flex items-center gap-2 md:gap-3 flex-shrink-0 w-24 md:w-36">
            <button
              id="player-volume-mute"
              onClick={(e) => {
                e.stopPropagation();
                toggleMute();
              }}
              className="text-neutral-400 hover:text-white cursor-pointer p-1"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-3.5 h-3.5 md:w-4 md:h-4 text-red-500" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 md:w-4 md:h-4 text-neutral-400" />
              )}
            </button>

            <input
              id="player-volume-slider"
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                e.stopPropagation();
                handleVolumeChange(e);
              }}
              className="accent-[#1DB954] w-12 md:w-20 lg:w-24 h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer focus:outline-none hover:bg-neutral-600"
            />

            <Maximize2 
              className="w-3.5 h-3.5 text-neutral-500 hover:text-neutral-300 cursor-pointer hidden md:block flex-shrink-0" 
              title="Fullscreen Visuals"
              onClick={(e) => {
                e.stopPropagation();
                if (currentSong) setIsFullScreenOpen(true);
              }}
            />
          </div>
        </div>
      </footer>

      {isMounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isFullScreenOpen && currentSong && (
            <motion.div
              initial={{ y: '100%', opacity: 0.8 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0.8 }}
              transition={{ type: 'spring', damping: 26, stiffness: 210 }}
              className="fixed inset-0 z-50 bg-[#070707]/95 backdrop-blur-2xl flex flex-col font-sans text-white select-none overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-[#1DB954]/15 to-transparent pointer-events-none" />

              <div className="max-w-2xl mx-auto w-full h-full flex flex-col py-6 px-6 md:px-10 justify-between relative overflow-y-auto">
                
                <div className="flex items-center justify-between w-full pb-4">
                  <button 
                    onClick={() => setIsFullScreenOpen(false)}
                    className="p-2 -ml-2 rounded-full hover:bg-white/5 active:scale-95 transition-all text-neutral-400 hover:text-white"
                    title="Minimize"
                  >
                    <ChevronDown className="w-6 h-6" />
                  </button>
                  <span className="text-xs uppercase font-extrabold tracking-widest text-[#1DB954]">
                    Now Playing Overlay
                  </span>
                  <div className="w-10 h-10" />
                </div>

                <div className="flex-1 flex flex-col justify-center items-center py-4">
                  <div className="relative group shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] rounded-2xl overflow-hidden aspect-square h-[190px] w-[190px] sm:h-[260px] sm:w-[260px] md:h-[300px] md:w-[300px] max-h-[35vh]">
                    <Artwork 
                      artist={currentSong.artist} 
                      album={currentSong.album} 
                      title={currentSong.title}
                      coverUrl={currentSong.coverUrl}
                      sizeClass="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-6 w-full mt-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight truncate leading-tight">
                      {currentSong.title}
                    </h2>
                    <p className="text-sm md:text-base text-neutral-400 font-medium mt-1 truncate">
                      {currentSong.artist}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 bg-neutral-900/80 px-3 py-2 rounded-full border border-neutral-800">
                    <button
                      onClick={toggleMute}
                      className="text-neutral-400 hover:text-white transition-colors"
                    >
                      {isMuted || volume === 0 ? <VolumeX className="w-4 h-4 text-red-500" /> : <VolumeX className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min={0}
                      max={1}
                      step={0.01}
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="accent-[#1DB954] w-20 sm:w-28 md:w-36 h-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg appearance-none cursor-pointer focus:outline-none transition-colors"
                    />
                    <button
                      onClick={() => {
                        setIsMuted(false);
                        setVolume(Math.min(1, volume + 0.1));
                      }}
                      className="text-neutral-400 hover:text-white transition-colors"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="w-full mt-5">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeekChange}
                    className="accent-[#1DB954] w-full h-1 bg-neutral-800 hover:bg-neutral-700 rounded-lg appearance-none cursor-pointer focus:outline-none transition-colors"
                  />
                  <div className="flex justify-between items-center text-xs text-neutral-400 font-mono mt-1.5 px-0.5">
                    <span>{formatTime(currentTime)}</span>
                    <span>{currentSong ? formatTime(duration) : '0:00'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-8 my-5">
                  <button
                    onClick={prevSong}
                    className="text-neutral-400 hover:text-white active:scale-90 transition-all p-2 rounded-full hover:bg-white/5"
                    disabled={playbackQueue.length === 0}
                    title="Previous Track"
                  >
                    <SkipBack className="w-6 h-6 fill-neutral-400 hover:fill-white" />
                  </button>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all text-black hover:bg-neutral-200 shadow-lg"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-6 h-6 fill-black text-black" />
                    ) : (
                      <Play className="w-6 h-6 fill-black text-black ml-1" />
                    )}
                  </button>

                  <button
                    onClick={nextSong}
                    className="text-neutral-400 hover:text-white active:scale-90 transition-all p-2 rounded-full hover:bg-white/5"
                    disabled={playbackQueue.length === 0}
                    title="Next Track"
                  >
                    <SkipForward className="w-6 h-6 fill-neutral-400 hover:fill-white" />
                  </button>
                </div>

                <div className="w-full mt-2">
                  <h3 className="text-xs font-bold tracking-widest text-neutral-400 uppercase mb-2">
                    Lyrics
                  </h3>
                  <div 
                    onClick={() => setIsLyricsFullScreen(true)}
                    className="bg-gradient-to-br from-[#1DB954]/10 to-neutral-800/10 hover:from-[#1DB954]/15 hover:to-neutral-800/15 border border-white/5 rounded-xl p-4 h-32 md:h-36 flex items-center justify-center cursor-pointer relative transition-all group active:scale-[0.99] select-none text-center"
                  >
                    <div className="absolute right-3 top-3 bg-white/5 p-1 rounded backdrop-blur text-[10px] md:text-xs text-neutral-400 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Tap to expand
                    </div>

                    <p className="text-sm md:text-base font-semibold text-neutral-300 px-4 leading-relaxed line-clamp-2">
                      {isLyricsLoading ? (
                        <span className="text-neutral-500 animate-pulse">Fetching real synchronized lyrics...</span>
                      ) : lyricsError ? (
                        <span className="text-neutral-400 italic">Synced lyrics not available. Tap to search</span>
                      ) : lyricsLines.length > 0 ? (
                        lyricsLines[activeLyricIndex !== -1 ? activeLyricIndex : 0]?.text
                      ) : plainLyrics ? (
                        <span className="line-clamp-2">{plainLyrics.split('\n').slice(0, 2).join(' / ')}</span>
                      ) : (
                        "Tap to search or view lyrics on LRCLIB"
                      )}
                    </p>
                  </div>
                </div>

              </div>

              <AnimatePresence>
                {isLyricsFullScreen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setIsLyricsFullScreen(false)}
                    className="absolute inset-0 z-50 bg-[#090909]/95 backdrop-blur-2xl flex flex-col py-10 px-8 cursor-pointer select-none text-white overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#1DB954]/15 via-transparent to-black/80 pointer-events-none" />

                    <div className="max-w-2xl mx-auto w-full h-full flex flex-col justify-between relative" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between pb-6 border-b border-white/5">
                        <div>
                          <h4 className="text-xs uppercase font-extrabold tracking-widest text-[#1DB954]">Lyrics Overlay</h4>
                          <p className="text-sm font-bold text-neutral-400 mt-0.5 truncate max-w-xs">{currentSong.title}</p>
                        </div>
                        <button 
                          onClick={() => setIsLyricsFullScreen(false)}
                          className="text-[10px] sm:text-xs uppercase font-bold text-neutral-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
                        >
                          Tap to close
                        </button>
                      </div>

                      <div 
                        className="flex-1 overflow-y-auto my-6 px-4 custom-scrollbar text-center flex flex-col gap-4 py-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {isLyricsLoading ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-neutral-400 gap-3">
                            <div className="w-8 h-8 border-4 border-neutral-850 border-t-[#1DB954] rounded-full animate-spin"></div>
                            <span className="text-sm font-semibold tracking-wide">Retrieving synchronized lyrics from LRCLIB...</span>
                          </div>
                        ) : lyricsError ? (
                          <div className="flex-1 flex flex-col items-center justify-center text-neutral-500 max-w-md mx-auto gap-2">
                            <span className="text-lg font-bold text-neutral-300">Synchronized Lyrics Unavailable</span>
                            <p className="text-xs leading-relaxed text-neutral-400">Could not locate synchronized lyrics on LRCLIB. You can still stream directly and control playback.</p>
                            <span className="text-[10px] bg-white/5 border border-white/5 rounded px-2 py-0.5 mt-2 font-mono text-neutral-505">
                              Error: {lyricsError}
                            </span>
                          </div>
                        ) : lyricsLines.length > 0 ? (
                          lyricsLines.map((line, idx) => {
                            const isActive = idx === activeLyricIndex;
                            return (
                              <button
                                key={idx}
                                ref={isActive ? activeLyricLineRef : null}
                                onClick={() => handleLineClick(line.time)}
                                className={`py-2 text-left sm:text-center w-full transition-all duration-300 text-base sm:text-xl md:text-2xl font-extrabold focus:outline-none cursor-pointer leading-relaxed ${
                                  isActive 
                                    ? 'text-[#1DB954] scale-105 drop-shadow-[0_0_12px_rgba(29,185,84,0.4)] opacity-100 font-black' 
                                    : 'text-neutral-400 opacity-60 hover:opacity-100 hover:text-white hover:scale-[1.01]'
                                }`}
                              >
                                {line.text || "•••"}
                              </button>
                            );
                          })
                        ) : plainLyrics ? (
                          <div className="text-center text-neutral-300 text-base sm:text-lg leading-loose max-w-lg mx-auto whitespace-pre-wrap select-text py-4">
                            {plainLyrics}
                          </div>
                        ) : (
                          <div className="flex-1 flex items-center justify-center text-neutral-500 italic">
                            No lyrics content available
                          </div>
                        )}
                      </div>

                      <div className="text-center text-xs text-neutral-500 font-medium">
                        Listening to {currentSong.title} &bull; {currentSong.artist}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
