import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';
import Logo from './Logo';

interface TypedTextProps {
  phrases: string[];
}

export function TypedText({ phrases }: TypedTextProps) {
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    const activePhrase = phrases[phraseIdx];

    if (isDeleting) {
      // Deleting state
      timer = setTimeout(() => {
        setCurrentText((prev) => prev.slice(0, -1));
      }, 50); // fast backward deletion
    } else {
      // Typing state
      timer = setTimeout(() => {
        setCurrentText((prev) => activePhrase.slice(0, prev.length + 1));
      }, 100); // clear typewriter speed
    }

    // Handles pauses and logic transitions
    if (!isDeleting && currentText === activePhrase) {
      // Wait before beginning deletion
      timer = setTimeout(() => {
        setIsDeleting(true);
      }, 1500);
    } else if (isDeleting && currentText === '') {
      setIsDeleting(false);
      setPhraseIdx((prev) => (prev + 1) % phrases.length);
    }

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, phraseIdx, phrases]);

  return (
    <span className="inline-flex items-center justify-start bg-[#1DB954] text-white px-2.5 py-0.5 rounded font-mono font-bold select-none shadow-[2px_2px_4px_rgba(0,0,0,0.4)] tracking-wide shrink-0 transition-all duration-75">
      <span className="inline-block text-left truncate whitespace-nowrap">
        {currentText || "\u00A0"}
      </span>
      <span className="inline-block w-1.5 h-4 ml-1 bg-white animate-pulse shrink-0" />
    </span>
  );
}

interface HomeHeaderProps {
  onPlayAll?: () => void;
  showPlayButton?: boolean;
}

export default function HomeHeader({ onPlayAll, showPlayButton = false }: HomeHeaderProps) {
  const line1Phrases = ['no ads', 'no skip limits', 'no paywall', 'no malware'];
  const line2Phrases = ['familiar layout', 'timed lyrics', 'much more ;-)'];

  return (
    <div 
      id="header-home"
      className="p-8 md:p-12 rounded-2xl bg-gradient-to-r from-zinc-800/80 via-[#1DB954]/10 to-zinc-900/60 border border-zinc-800/60 shadow-xl flex flex-col items-center justify-center text-center gap-6"
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <Logo className="w-16 h-16 text-[#1DB954] cursor-pointer hover:scale-105 transition-all duration-300" />
        {/* Title Heading with Spoti in Spotify Green and Free in white */}
        <h1 id="home-greeting-heading" className="text-5xl md:text-6xl font-black tracking-tight text-white transition-all scale-100 hover:scale-[1.01] duration-300">
          <span className="text-[#1DB954]">Spoti</span>Free
        </h1>
        
        {/* Dynamic Typing & Deleting subheadings block */}
        <div className="flex flex-col items-start gap-4 py-3 w-full max-w-[310px] sm:max-w-[390px] md:max-w-[500px] lg:max-w-[580px] mx-auto select-none">
          {/* Line 1: alternative options with animated quotes */}
          <div className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-200 font-semibold flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1.5 leading-relaxed w-full">
            <span className="text-center sm:text-left text-white/90">A Spotify alternative with</span>
            <TypedText phrases={line1Phrases} />
          </div>

          {/* Line 2: but with interactive feature layouts */}
          <div className="text-sm sm:text-base md:text-lg lg:text-xl text-neutral-200 font-semibold flex flex-wrap items-center justify-center sm:justify-start gap-x-2 gap-y-1.5 leading-relaxed w-full">
            <span className="text-center sm:text-left text-white/90">but with</span>
            <TypedText phrases={line2Phrases} />
          </div>
        </div>
      </div>

      {showPlayButton && onPlayAll && (
        <button
          id="hero-play-all"
          onClick={onPlayAll}
          className="bg-[#1DB954] text-black font-extrabold px-8 py-3.5 rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center gap-2 cursor-pointer mt-2 text-sm tracking-wide uppercase hover:bg-[#1ed760]"
        >
          <Play className="w-4 h-4 fill-black" />
          Start Vibin'
        </button>
      )}
    </div>
  );
}
