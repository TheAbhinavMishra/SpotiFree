import Logo from '@/components/Logo';
import { Home, Search, Music, Info } from 'lucide-react';
import { useAppStore } from '../store';
import { motion } from 'motion/react';

export default function SidebarLeft() {
  const { activeView, setActiveView, setAboutOpen } = useAppStore();

  const handleSearchClick = () => {
    // Navigate home if in list view, and focus the search input
    if (activeView !== 'home') {
      setActiveView('home');
    }
    // Focus search input on next tick
    setTimeout(() => {
      const searchInput = document.getElementById('topbar-search-input');
      if (searchInput) {
        searchInput.focus();
      }
    }, 50);
  };

  return (
    <aside
      id="sidebar-left"
      className="hidden md:flex w-60 bg-black flex-shrink-0 flex-col p-6 text-neutral-400 font-sans border-r border-neutral-900"
    >
      {/* Brand logo */}
      <div 
        id="side-brand"
        className="flex items-center gap-2.5 mb-8 cursor-pointer group"
        onClick={() => setActiveView('home')}
      >
        <Logo className="w-8 h-8 text-[#1DB954] transition-transform duration-300 group-hover:scale-105" />
        <span className="font-extrabold text-white text-xl tracking-tight">
          SpotiFree<span className="text-[#1DB954]">.</span>
        </span>
      </div>

      {/* Main navigation */}
      <div className="flex flex-col gap-4">
        <motion.button
          layoutId="about-modal-container"
          id="nav-about"
          onClick={() => setAboutOpen(true)}
          className="flex items-center gap-4 font-bold text-sm transition-colors py-1 text-emerald-400 hover:text-emerald-300 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)]"
        >
          <Info className="w-5 h-5" />
          About SpotiFree
        </motion.button>

        <button
          id="nav-home"
          onClick={() => setActiveView('home')}
          className={`flex items-center gap-4 font-bold text-sm transition-colors py-1 ${
            activeView === 'home' ? 'text-white' : 'hover:text-white'
          }`}
        >
          <Home className="w-5 h-5" />
          Home
        </button>

        <button
          id="nav-search"
          onClick={handleSearchClick}
          className="flex items-center gap-4 font-bold text-sm transition-colors py-1 hover:text-white"
        >
          <Search className="w-5 h-5" />
          Search
        </button>
      </div>

      {/* Extra decor list to look like a full premium client without being cluttered or breaking instructions */}
      <div className="mt-8 pt-6 border-t border-neutral-900 flex flex-col gap-4 text-xs tracking-wider uppercase font-semibold text-neutral-500">
        <span>Library</span>
        <div className="flex flex-col gap-3 normal-case text-sm text-neutral-400 font-medium">
          <div className="flex items-center gap-3 hover:text-white cursor-pointer" onClick={() => setActiveView('home')}>
            <Music className="w-4 h-4 text-neutral-500" />
            Soundtracks
          </div>
        </div>
      </div>
    </aside>
  );
}
