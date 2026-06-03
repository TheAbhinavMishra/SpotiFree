# 🎵 SpotiFree

<p align="center">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite Badge"/>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Badge"/>
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript Badge"/>
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel Badge"/>
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License"/>
</p>

---

### 🚀 Live Deployment
Experience the fully responsive layout live on production:  
🔗 **[https://your-url.vercel.app](https://your-url.vercel.app)**

---

## 📖 Overview

**SpotiFree** is a lightweight, high-performance Progressive Web App (PWA) music player built using **Vite, React, and TypeScript**. It completely eliminates bulky client architectures by interfacing directly with cloud archives to stream your favorite music libraries fluidly. 

The application is completely dynamic; adding or updating files requires zero code changes or GitHub re-deployments, allowing for seamless real-time music database management.

### ✨ Key Features
* 📱 **Mobile-Optimized Interface:** Implements fully custom mobile drawers and sleek scrolling marquee titles for long song names.
* ☁️ **Serverless Metadata Sync:** Leverages cloud metadata scanning engines to fetch and compile full audio tables on execution.
* 🎨 **Dynamic Album Art:** Integrates specialized network modules to fetch high-resolution imagery from the official iTunes Store API automatically.
* 🚀 **Vite-Powered Efficiency:** Incredibly fast hot module reloading (HMR) and lightweight asset packaging for lower resource overhead on low-RAM devices.

---

## 🛠️ Tech Stack & Ecosystem

* **Frontend Framework:** React 18 (TypeScript)
* **Build System & Tooling:** Vite
* **Hosting & CI/CD Pipeline:** Vercel Cloud Architecture
* **Data Core Engine:** Internet Archive Rest API

---

## 📂 Project Architecture

```text
spotifree/
├── public/                 # Static global configurations
│   ├── index.html          # App entry portal
│   ├── robots.txt          # SEO crawler management
│   └── sitemap.xml         # Search indexing registry
├── src/                    # Main application codebase
│   ├── AboutOverlay.tsx    # App information model
│   ├── App.tsx             # Master rendering node
│   ├── Artwork.tsx         # Cover-art image loading context
│   ├── HomeHeader.tsx      # Dashboard greeting matrix
│   ├── Logo.tsx            # Custom graphical assets
│   ├── MobileDrawer.tsx    # Mobile media container
│   ├── PlayerBar.tsx       # Bottom track control suite
│   ├── SidebarLeft.tsx     # Navigation & source links
│   ├── SidebarRight.tsx    # Track detail inspector
│   ├── SongTable.tsx       # Music list & queue rendering grid
│   ├── TopBar.tsx          # Dynamic search & filter header
│   └── index.css           # Global core styles
├── package.json            # Module dependencies
└── tsconfig.json           # Explicit TypeScript declarations
