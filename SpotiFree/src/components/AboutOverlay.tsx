/**
 * Copyright 2026 [Abhinav Mishra]. This UI component and its attribution credits must remain intact in all derivative forksunder the terms of the project's MIT License:
 */
import { motion } from 'motion/react';
import { X, Mail, Github } from 'lucide-react';
import { useAppStore } from '../store';
import Logo from '@/components/Logo';

export default function AboutOverlay() {
  const { isAboutOpen, setAboutOpen } = useAppStore();

  if (!isAboutOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={() => setAboutOpen(false)}
      />

      {/* Modal Content */}
      <motion.div
        layoutId="about-modal-container"
        className="relative z-10 w-full max-w-4xl bg-zinc-950 border border-neutral-800 rounded-3xl p-8 md:p-16 flex flex-col items-center text-center shadow-[0_0_40px_rgba(29,185,84,0.15)] overflow-y-auto max-h-[90vh]"
      >
        <button
          onClick={() => setAboutOpen(false)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-800 transition-colors text-neutral-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: 'spring', bounce: 0.4 }}
          className="flex flex-col items-center mb-8"
        >
          <Logo className="w-24 h-24 text-[#1DB954] mb-6" />
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter">
            <span className="text-[#1DB954]">Spoti</span>
            <span className="text-white">Free</span>
          </h1>
          <p className="text-neutral-400 mt-2 font-mono text-sm tracking-widest">v 1.0.0</p>
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-white text-lg md:text-xl font-medium leading-relaxed max-w-2xl mx-auto mb-8"
        >
          SpotiFree is an Open-Source project started by its creator,{' '}
          <span className="font-bold text-orange-500 text-xl md:text-2xl drop-shadow-[0_0_12px_rgba(249,115,22,0.8)]">
            Abhinav Mishra
          </span>
          , who wanted to escape from Spotify's paywalls but still get the features it is famous for, like large library of songs, timed lyrics, and much more. Though not direct competitor, this project is undoubtedly bundled with Love ❤️
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col gap-2 text-white text-lg md:text-xl font-bold bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/50 w-full max-w-md mb-8"
        >
          <p>Premium Features 💲💲</p>
          <p>No Paywalls, and of course</p>
          <p>Lovely Songs 🎧</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col gap-4 text-neutral-300 font-medium items-center w-full max-w-md mb-8"
        >
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-neutral-400" />
            <a href="mailto:itsabhinavmishra01@gmail.com" className="hover:text-white transition-colors">itsabhinavmishra01@gmail.com</a>
          </div>
          <div className="flex items-center gap-3">
            <Github className="w-5 h-5 text-neutral-400" />
            <a href="https://github.com/TheAbhinavMishra/SpotiFree" target="_blank" rel="noreferrer" className="hover:text-white transition-colors text-center break-all">https://github.com/TheAbhinavMishra/SpotiFree</a>
          </div>
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-orange-500 font-bold tracking-wide drop-shadow-[0_0_8px_rgba(249,115,22,0.6)] text-center max-w-lg mt-auto"
        >
          This is an OPEN-SOURCE Project. Contributors WELCOMED :-)
        </motion.p>
      </motion.div>
    </div>
  );
}
