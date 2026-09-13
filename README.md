# 🌤️ Aether Weather — Atmospheric Intelligence

A modern, visually stunning, and interactive atmospheric weather web application built with **Vanilla HTML5, CSS3, and ES6+ JavaScript**. Powered by the global, zero-setup **Open-Meteo API** (no API key required).

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Status](https://img.shields.io/badge/Status-Production%20Ready-emerald.svg)
![Zero Config](https://img.shields.io/badge/API-Open--Meteo%20(No%20Key)-cyan.svg)

---

## ✨ Features

- 🌍 **Instant Global Search & Autocomplete**: Real-time geocoding search across any city, region, or country with country flag identification.
- 📍 **GPS Geolocation ("Near Me")**: One-click local coordinate detection with reverse geocoding to display weather for your exact location.
- ⚡ **Zero-Config Live Data**: Real-time meteorological feeds powered by Open-Meteo, requiring no API keys or backend setup.
- 🎨 **Aether Glass Aesthetic**: Premium Nordic bioluminescent glassmorphic design featuring optical blur, smooth gradients, and condition-reactive themes.
- 🌌 **Live Particle Atmosphere Engine**: Fullscreen hardware-accelerated canvas rendering realistic falling rain, drifting snow, floating solar dust motes, twinkling stars, and lightning flashes.
- 🎵 **Generative Web Audio Ambience**: Built-in procedural pink-noise audio synthesizer simulating gentle rainfall and wind gusts without external audio files.
- ⏱️ **24-Hour Timeline Carousel**: Hourly temperature, precipitation probability, and weather icons with smooth horizontal navigation.
- 📅 **7-Day Extended Forecast**: Apple-style daily forecast with dynamic color-gradient temperature range bars.
- 🧭 **Atmospheric Bento Metrics**:
  - **Wind & Live Compass Dial**: Wind speed, gusts, and an animated compass needle dynamically rotated to wind azimuth.
  - **Humidity & Comfort Index**: Relative humidity percentage with comfort range interpretation.
  - **UV Index Meter**: UV index with visual gradient gauge and sun-safety recommendations.
  - **Barometric Pressure**: Surface air pressure in hPa with atmospheric stability indicators.
  - **Solar Arc Daylight Cycle**: Dynamic sunrise and sunset trajectory tracking the sun's position across the horizon.
  - **Precipitation Accumulation**: Expected rainfall accumulation in millimeters or inches.
  - **Atmospheric Visibility**: Distance in kilometers or miles.
- 🔄 **Dynamic Unit Conversion**: Seamless instant toggle between Celsius (°C) and Fahrenheit (°F) with `localStorage` persistence.
- 📱 **100% Mobile Responsive**: Perfectly tuned for mobile phones, tablets, laptops, and ultra-wide displays.

---

## 🚀 Quick Start

No installation or build step is required! You can run Aether Weather instantly in any modern web browser.

### Option 1: Direct File
Simply double-click `index.html` to open it in your browser.

### Option 2: Local HTTP Server (Recommended)

Using **Python**:
```bash
# Python 3
python -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

Using **Node.js**:
```bash
npx serve .
```

---

## 🌐 Deploy to GitHub Pages

1. Push your code to your repository:
   ```bash
   git add .
   git commit -m "Upgrade to modern Aether Weather layout"
   git push origin main
   ```
2. In your GitHub repository:
   - Go to **Settings** > **Pages**.
   - Under **Build and deployment**, select **Deploy from a branch**.
   - Choose `main` branch and `/ (root)` folder, then click **Save**.
3. Your weather app will be live worldwide in seconds!

---

## 🛠️ Technology Stack

- **Semantic HTML5**: Clean, accessible DOM structure with ARIA landmark attributes.
- **Vanilla CSS3**: Custom CSS tokens, backdrop filters, CSS Grid (Bento pattern), Flexbox, and keyframe animations.
- **Vanilla JavaScript (ES6+)**: Modular architecture, Web Audio API, HTML5 Canvas 2D, and Geolocation API.
- **Data Source**: [Open-Meteo](https://open-meteo.com/) — Free Weather Forecast & Geocoding API.

---

## 📄 License

This project is licensed under the MIT License — feel free to modify, extend, and deploy!
