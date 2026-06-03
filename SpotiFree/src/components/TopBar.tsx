import { Search, X, Menu } from 'lucide-react';
import { useAppStore } from '../store';

export default function TopBar() {
  const { searchQuery, setSearchQuery, isMobileMenuOpen, setIsMobileMenuOpen } = useAppStore();

  return (
    <header
      id="top-bar"
      className="h-16 bg-[#121212]/90 backdrop-blur-md flex items-center px-4 md:px-8 gap-4 border-b border-neutral-900 sticky top-4 z-30"
    >
      {/* Mobile Hamburger menu Button */}
      <button
        id="btn-mobile-menu-toggle"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors cursor-pointer"
        title="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      <div id="search-input-wrapper" className="relative w-full max-w-xl group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-[#1DB954] transition-colors" />
        <input
          id="topbar-search-input"
          type="text"
          placeholder="What do you want to play?"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-neutral-800 text-white pl-12 pr-12 py-3 rounded-full text-sm font-medium outline-none border border-neutral-700/80 focus:border-[#1DB954] focus:bg-[#1f1f1f] focus:ring-1 focus:ring-[#1DB954] transition-all placeholder-neutral-500 shadow-inner"
        />
        {searchQuery && (
          <button
            id="clear-search-btn"
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white cursor-pointer"
            title="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </header>
  );
}
