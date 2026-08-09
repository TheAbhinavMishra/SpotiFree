# SpotiFree Web Player
<p align="center">
  <img src="SpotiFree/SpotiFree/public/logo.svg" alt="SpotiFree Logo" width="120">
</p>


A lightweight, high-performance music streaming player designed to run completely at the edge. By separating heavy audio file delivery from lyric data, SpotiFree achieves smooth, fast playback and completely bypasses common cloud storage or hosting limits (such as body size restrictions) without costing a dime in operational overhead.

<p align="center">
  <img src="https://img.shields.io/github/license/TheAbhinavMishra/SpotiFree?style=flat-square&color=535bf2" alt="License">
  <img src="https://img.shields.io/github/stars/TheAbhinavMishra/SpotiFree?style=flat-square&color=535bf2" alt="Stars">
  <img src="https://img.shields.io/github/forks/TheAbhinavMishra/SpotiFree?style=flat-square&color=535bf2" alt="Forks">
  <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel" alt="Vercel Deployment">
</p>

---

## ✨ Features You'll Love

### 🎵 Completely Free & No Paywalls
Enjoy your entire music collection without premium subscriptions, forced ads, or hidden tiers. SpotiFree is an open-source, community-first project dedicated to keeping your music experience clean and accessible.

### ⏳ Perfectly Timed Lyrics
Watch your favorite songs come alive with real-time, synchronized lyrics. As the music plays, the lyrics automatically scroll and highlight exactly to the beat, keeping you in perfect sync with the track.

### 🔋 Smooth Background Playback
Keep the music going while you get things done. Whether you switch tabs, minimize the browser, or work on another project, the player continues to stream your audio seamlessly in the background.

### ⚡ Blistering Fast & Lightweight
Say goodbye to heavy, bloated desktop apps. SpotiFree loads instantly and uses minimal system resources, delivering fluid transitions, snappy searches, and crisp playback that stays locked at a smooth 60FPS with zero layout shifts.

### 📱 Fully Responsive Design
Take your music with you on any screen. The interface adapts perfectly to desktops, tablets, and smartphones, providing a gorgeous, native-app feel no matter what device you are using.

---

## 🛠️ How It Works (The Split-Content Pipeline)

Traditional setups often struggle with hosting heavy audio files alongside web code, running into bandwidth ceilings, strict upload size limits, and frustrating CORS (Cross-Origin Resource Sharing) errors. SpotiFree solves this entirely with a clean, dual-channel architecture:

* **Audio Streaming:** High-capacity `.mp3` payloads are offloaded onto public distributed storage via the Internet Archive (`archive.org`), providing reliable, unthrottled media streaming.
* **Lyrics Delivery Engine:** Synchronized `.lrc` assets are pulled instantly from a dedicated folder right in your GitHub repository using a direct CDN raw-head route (`raw.githubusercontent.com`). This ensures lightning-fast delivery and completely eliminates CORS configuration headaches.

---

## 🧠 Automated Routing Mechanism

The internal state engine (`src/store.ts`) handles incoming tracks using an automated three-step parsing loop, making the player completely zero-maintenance:

1. **Extraction:** The app reads the raw file name from the storage bucket and strips out the `.mp3` extension using a simple regex pattern.
2. **Metadata Parsing:** The code scans for structural splitters (like the standard ` - ` hyphen) to cleanly break the file name into `Title` and `Artist` values for the player UI.
3. **URL Compilation:** The engine automatically builds a web-sanitized, fully encoded link pointing straight to your repository asset folder:  
   `https://raw.githubusercontent.com/TheAbhinavMishra/SpotiFree/refs/heads/main/SpotiFree/[Encoded_Filename].lrc`

You never have to waste time maintaining bulky databases, track indices, or manual mapping files. Audio and lyrics are fetched independently and paired up right inside your browser for instant loading times.

---

## ⚡ Tech Stack & Core Dependencies

* **Frontend Framework:** React 18+ paired with Vite for blistering fast local development and clean production compilation bundles.
* **Deployment & Hosting:** Vercel Global Edge Network for optimized, serverless application delivery.
* **State Management:** Zustand (A clean, non-reactive global store with asynchronous hydration).
* **Audio Layer:** Native HTML5 Audio API integrated into a custom, reactive `PlayerBar` UI engine with built-in runtime URL interceptors.
