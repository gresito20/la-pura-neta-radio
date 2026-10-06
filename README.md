# 📻 La Pura Neta Radio — Mobile & Web Streaming App

[![Capacitor](https://img.shields.io/badge/Capacitor-6.2.0-blue.svg?logo=capacitor)](https://capacitorjs.com/)
[![iOS](https://img.shields.io/badge/Platform-iOS%2013%2B-lightgrey.svg?logo=apple)](https://developer.apple.com/)
[![Android](https://img.shields.io/badge/Platform-Android%208.0%2B-green.svg?logo=android)](https://developer.android.com/)
[![Audio](https://img.shields.io/badge/Audio-HD%20320kbps%20Shoutcast-red.svg)](https://radios.mipanel.stream:6952/)
[![License](https://img.shields.io/badge/License-Proprietary-black.svg)]()

Official native cross-platform mobile application and web streaming player for **La Pura Neta Radio** (New York), broadcasting live Regional Mexican music in HD quality (320 kbps).

---

## 🏗️ Architecture & Core Features

```
┌────────────────────────────────────────────────────────┐
│               La Pura Neta UI / UX                     │
│    (Glassmorphism Radial Dial • Inter UI • Tailwind)   │
└──────────────────────────┬─────────────────────────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│     HTML5 Audio Core    │ │   Remote Config Engine  │
│  • Shoutcast Stream     │ │   • station-config.json │
│  • JSONP Metadata Fall  │ │   • LocalStorage Cache  │
│  • MediaSession API     │ │   • Zero-rebuild text   │
└────────────┬────────────┘ └────────────┬────────────┘
             │                           │
             └─────────────┬─────────────┘
                           │ Capacitor 6 Bridge
             ┌─────────────┴─────────────┐
             ▼                           ▼
┌─────────────────────────┐ ┌─────────────────────────┐
│       iOS Native        │ │      Android Native     │
│  • UIBackgroundModes    │ │  • FOREGROUND_SERVICE   │
│  • LockScreen / Island  │ │  • MediaSessionService  │
│  • ATS Exceptions       │ │  • Cleartext Traffic    │
└─────────────────────────┘ └─────────────────────────┘
```

### ✨ Key Features:
* **Background Audio Mode:** Uninterrupted playback when the app is minimized or screen locked on both iOS and Android.
* **Lock Screen & Media Controls:** Native lock screen player showing live track title, artist name, and iTunes cover art.
* **Glassmorphism Radial Action Hub:** Expanding 5-satellite arc dial with concentric geometry and smooth micro-interactions.
* **Remote Configuration (`Remote Config`):** Program schedules, host names, contacts, and Top 10 songs update remotely via JSON with zero-latency caching.
* **Cinematic Entrance Screen:** Smooth splash reveal with 3D logo pop and animated sonic equalizer.
* **Zero Hardcoded Secrets:** Clean, secure repository adhering to OWASP Mobile standards.

---

## 📁 Repository Structure

```
.
├── android/               # Native Android Studio Project (Gradle 8.12, AGP 8.7)
├── ios/                   # Native Xcode Workspace (Swift, CocoaPods)
│   └── App/
│       ├── App.xcworkspace# Main Xcode Workspace
│       └── App/Info.plist # iOS Permissions & Background Modes
├── www/                   # Compiled & optimized web distribution bundle
├── data/
│   └── station-config.json# Remote configuration schema for live shows & contacts
├── css/                   # Custom Glassmorphism styles & animations
├── js/
│   ├── app.js             # UI controls, Radial dial, Sheets & Remote Config
│   └── player.js          # Audio engine, Shoutcast stream & Metadata poller
├── assets/                # Hi-res artwork, vector icons & brand media
├── capacitor.config.json  # Capacitor native bridge configuration
└── package.json           # NPM scripts and native dependency specifications
```

---

## 🚀 Getting Started

### Prerequisites
* **Node.js:** `v18.x` or higher
* **npm:** `v9.x` or higher
* **Xcode (for iOS):** `v15.x` or higher (macOS required)
* **Android Studio (for Android):** Hedgehog / Iguana / Jellyfish

### Installation & Sync

```bash
# 1. Clone repository
git clone https://github.com/gresito20/la-pura-neta-radio.git
cd la-pura-neta-radio

# 2. Install dependencies
npm install

# 3. Build web bundle and sync native platforms
npm run cap:sync
```

---

## 🛠️ Build & Deployment Guides

### 🍎 iOS (App Store Connect / TestFlight)
1. Open the native workspace in Xcode:
   ```bash
   npx cap open ios
   ```
2. In Xcode, navigate to **Signing & Capabilities** and select your **Developer Team**.
3. Set the build target to **Any iOS Device (arm64)**.
4. Go to **Product ➔ Archive**.
5. Once the archive completes, click **Distribute App ➔ App Store Connect ➔ Upload**.

### 🤖 Android (Google Play Console / Internal Testing)
1. Generate an Android App Bundle (`.aab`) or test APK:
   ```bash
   # Open Android Studio
   npx cap open android
   ```
2. In Android Studio, go to **Build ➔ Generate Signed Bundle / APK**.
3. Select **Android App Bundle** and sign with your release keystore.

---

## 🔒 Security & Privacy Specifications

* **ATS / Cleartext:** Scoped exclusively to the dedicated audio streaming endpoint (`radios.mipanel.stream:6952`).
* **Permissions:** Strictly limited to media playback (`WAKE_LOCK`, `FOREGROUND_SERVICE_MEDIA_PLAYBACK`, `UIBackgroundModes`). No unnecessary camera, microphone, or location permissions requested.
* **Data Storage:** Uses client-side `localStorage` exclusively for UI theme preference and cached public station schedules. Zero sensitive PII stored.

---

## 📄 License

Proprietary © 2026 **La Pura Neta Radio**. All rights reserved.
