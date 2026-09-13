/**
 * AETHER WEATHER ENGINE
 * Modern Atmospheric Weather Experience
 * Powered by Open-Meteo (No API Key Required)
 */

(() => {
  'use strict';

  // State Management
  const state = {
    unit: localStorage.getItem('weather_unit') || 'celsius', // 'celsius' or 'fahrenheit'
    currentCity: null,
    weatherData: null,
    searchDebounceTimer: null,
    clockInterval: null,
    audioCtx: null,
    audioGain: null,
    isPlayingAudio: false,
    particles: [],
    animationFrameId: null,
    currentWeatherType: 'clear-day'
  };

  // Weather Code Interpretation (WMO Standard)
  const WMO_MAP = {
    0: { label: 'Clear Sky', icon: 'sun', type: 'clear' },
    1: { label: 'Mainly Clear', icon: 'sun-cloud', type: 'partly-cloudy' },
    2: { label: 'Partly Cloudy', icon: 'cloud-sun', type: 'partly-cloudy' },
    3: { label: 'Overcast', icon: 'cloud', type: 'cloudy' },
    45: { label: 'Foggy', icon: 'fog', type: 'fog' },
    48: { label: 'Depositing Rime Fog', icon: 'fog', type: 'fog' },
    51: { label: 'Light Drizzle', icon: 'drizzle', type: 'rain' },
    53: { label: 'Moderate Drizzle', icon: 'drizzle', type: 'rain' },
    55: { label: 'Dense Drizzle', icon: 'drizzle', type: 'rain' },
    56: { label: 'Freezing Drizzle', icon: 'snow-rain', type: 'snow' },
    57: { label: 'Heavy Freezing Drizzle', icon: 'snow-rain', type: 'snow' },
    61: { label: 'Slight Rain', icon: 'rain', type: 'rain' },
    63: { label: 'Moderate Rain', icon: 'rain', type: 'rain' },
    65: { label: 'Heavy Rain', icon: 'rain-heavy', type: 'rain' },
    66: { label: 'Freezing Rain', icon: 'snow-rain', type: 'snow' },
    67: { label: 'Heavy Freezing Rain', icon: 'snow-rain', type: 'snow' },
    71: { label: 'Slight Snowfall', icon: 'snow', type: 'snow' },
    73: { label: 'Moderate Snowfall', icon: 'snow', type: 'snow' },
    75: { label: 'Heavy Snowfall', icon: 'snow-heavy', type: 'snow' },
    77: { label: 'Snow Grains', icon: 'snow', type: 'snow' },
    80: { label: 'Light Showers', icon: 'rain', type: 'rain' },
    81: { label: 'Moderate Showers', icon: 'rain', type: 'rain' },
    82: { label: 'Violent Showers', icon: 'rain-heavy', type: 'rain' },
    85: { label: 'Light Snow Showers', icon: 'snow', type: 'snow' },
    86: { label: 'Heavy Snow Showers', icon: 'snow-heavy', type: 'snow' },
    95: { label: 'Thunderstorm', icon: 'thunderstorm', type: 'thunderstorm' },
    96: { label: 'Thunderstorm with Hail', icon: 'thunderstorm-hail', type: 'thunderstorm' },
    99: { label: 'Severe Thunderstorm', icon: 'thunderstorm-hail', type: 'thunderstorm' }
  };

  // SVGs for Weather Icons
  const ICONS = {
    'sun': `
      <svg class="w-icon animated-sun" viewBox="0 0 64 64" fill="none">
        <circle cx="32" cy="32" r="14" fill="url(#sun-grad)" filter="url(#glow)"/>
        <g class="sun-rays" stroke="url(#sun-ray-grad)" stroke-width="3.5" stroke-linecap="round">
          <line x1="32" y1="6" x2="32" y2="12" />
          <line x1="32" y1="52" x2="32" y2="58" />
          <line x1="6" y1="32" x2="12" y2="32" />
          <line x1="52" y1="32" x2="58" y2="32" />
          <line x1="13.6" y1="13.6" x2="17.8" y2="17.8" />
          <line x1="46.2" y1="46.2" x2="50.4" y2="50.4" />
          <line x1="13.6" y1="50.4" x2="17.8" y2="46.2" />
          <line x1="46.2" y1="17.8" x2="50.4" y2="13.6" />
        </g>
        <defs>
          <linearGradient id="sun-grad" x1="18" y1="18" x2="46" y2="46">
            <stop offset="0%" stop-color="#FFD600"/>
            <stop offset="100%" stop-color="#FF8A00"/>
          </linearGradient>
          <linearGradient id="sun-ray-grad" x1="0" y1="0" x2="64" y2="64">
            <stop offset="0%" stop-color="#FFA800"/>
            <stop offset="100%" stop-color="#FF5E00"/>
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
      </svg>`,
    'moon': `
      <svg class="w-icon animated-moon" viewBox="0 0 64 64" fill="none">
        <path d="M42 12C31.5 13.8 24 23 24 34C24 45 31.5 54.2 42 56C28.2 56 17 44.8 17 31C17 17.2 28.2 6 42 12Z" fill="url(#moon-grad)" filter="url(#moon-glow)"/>
        <circle cx="48" cy="18" r="1.5" fill="#E2E8F0" class="twinkle-1"/>
        <circle cx="52" cy="38" r="1" fill="#E2E8F0" class="twinkle-2"/>
        <circle cx="12" cy="22" r="1.5" fill="#E2E8F0" class="twinkle-3"/>
        <defs>
          <linearGradient id="moon-grad" x1="17" y1="6" x2="42" y2="56">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="60%" stop-color="#E0E7FF"/>
            <stop offset="100%" stop-color="#93C5FD"/>
          </linearGradient>
          <filter id="moon-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
      </svg>`,
    'cloud-sun': `
      <svg class="w-icon" viewBox="0 0 64 64" fill="none">
        <g class="animated-sun-mini">
          <circle cx="24" cy="24" r="9" fill="url(#sun-mini)"/>
          <path d="M24 10V13M24 35V38M10 24H13M35 24H38M14 14L16 16M32 32L34 34M14 34L16 32M32 16L34 14" stroke="#FFA726" stroke-width="2.5" stroke-linecap="round"/>
        </g>
        <path class="animated-cloud" d="M46 50H23C16.9 50 12 45.1 12 39C12 33.3 16.3 28.6 21.8 28.1C23.6 21.7 29.5 17 36.5 17C44.8 17 51.7 23.3 52.4 31.6C56.6 32.8 60 36.6 60 41C60 46 56 50 51 50Z" fill="url(#cloud-grad)" filter="url(#cloud-shadow)"/>
        <defs>
          <linearGradient id="sun-mini" x1="15" y1="15" x2="33" y2="33">
            <stop offset="0%" stop-color="#FFD54F"/>
            <stop offset="100%" stop-color="#FF9800"/>
          </linearGradient>
          <linearGradient id="cloud-grad" x1="12" y1="17" x2="60" y2="50">
            <stop offset="0%" stop-color="#FFFFFF"/>
            <stop offset="100%" stop-color="#B0BEC5"/>
          </linearGradient>
          <filter id="cloud-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="4" flood-opacity="0.25"/>
          </filter>
        </defs>
      </svg>`,
    'cloud': `
      <svg class="w-icon animated-cloud-float" viewBox="0 0 64 64" fill="none">
        <path d="M47 48H20C14.5 48 10 43.5 10 38C10 32.8 14 28.5 19 28C20.8 21.8 26.5 17 33.5 17C41.8 17 48.7 23.2 49.8 31.4C54.4 32.4 58 36.5 58 41.5C58 46.8 53.7 51 48.5 51L47 48Z" fill="url(#overcast-grad)" filter="url(#cloud-drop)"/>
        <defs>
          <linearGradient id="overcast-grad" x1="10" y1="17" x2="58" y2="51">
            <stop offset="0%" stop-color="#ECEFF1"/>
            <stop offset="60%" stop-color="#CFD8DC"/>
            <stop offset="100%" stop-color="#90A4AE"/>
          </linearGradient>
          <filter id="cloud-drop" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.3"/>
          </filter>
        </defs>
      </svg>`,
    'rain': `
      <svg class="w-icon" viewBox="0 0 64 64" fill="none">
        <path class="animated-cloud" d="M46 38H21C16.6 38 13 34.4 13 30C13 25.8 16.2 22.4 20.3 22C21.8 16.8 26.6 13 32.2 13C38.8 13 44.3 17.9 45.2 24.5C48.9 25.4 52 28.7 52 32.6C52 36.7 48.6 40 44.5 40L46 38Z" fill="url(#rain-cloud)"/>
        <g class="rain-drops">
          <line class="rain-drop-1" x1="22" y1="44" x2="18" y2="54" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
          <line class="rain-drop-2" x1="32" y1="44" x2="28" y2="56" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
          <line class="rain-drop-3" x1="42" y1="44" x2="38" y2="54" stroke="#38BDF8" stroke-width="2.5" stroke-linecap="round"/>
        </g>
        <defs>
          <linearGradient id="rain-cloud" x1="13" y1="13" x2="52" y2="40">
            <stop offset="0%" stop-color="#CFD8DC"/>
            <stop offset="100%" stop-color="#546E7A"/>
          </linearGradient>
        </defs>
      </svg>`,
    'rain-heavy': `
      <svg class="w-icon" viewBox="0 0 64 64" fill="none">
        <path class="animated-cloud" d="M46 36H21C16.6 36 13 32.4 13 28C13 23.8 16.2 20.4 20.3 20C21.8 14.8 26.6 11 32.2 11C38.8 11 44.3 15.9 45.2 22.5C48.9 23.4 52 26.7 52 30.6C52 34.7 48.6 38 44.5 38L46 36Z" fill="url(#heavy-cloud)"/>
        <g class="rain-drops-heavy">
          <line class="drop-h1" x1="19" y1="42" x2="14" y2="56" stroke="#00D2FF" stroke-width="3" stroke-linecap="round"/>
          <line class="drop-h2" x1="29" y1="42" x2="24" y2="58" stroke="#00D2FF" stroke-width="3" stroke-linecap="round"/>
          <line class="drop-h3" x1="39" y1="42" x2="34" y2="56" stroke="#00D2FF" stroke-width="3" stroke-linecap="round"/>
          <line class="drop-h4" x1="48" y1="42" x2="43" y2="54" stroke="#00D2FF" stroke-width="3" stroke-linecap="round"/>
        </g>
        <defs>
          <linearGradient id="heavy-cloud" x1="13" y1="11" x2="52" y2="38">
            <stop offset="0%" stop-color="#78909C"/>
            <stop offset="100%" stop-color="#37474F"/>
          </linearGradient>
        </defs>
      </svg>`,
    'thunderstorm': `
      <svg class="w-icon" viewBox="0 0 64 64" fill="none">
        <path class="animated-storm-cloud" d="M47 34H22C17.6 34 14 30.4 14 26C14 21.8 17.2 18.4 21.3 18C22.8 12.8 27.6 9 33.2 9C39.8 9 45.3 13.9 46.2 20.5C49.9 21.4 53 24.7 53 28.6C53 32.7 49.6 36 45.5 36L47 34Z" fill="url(#storm-grad)"/>
        <path class="lightning-bolt" d="M33 32L26 43H33L30 56L42 41H34L37 32H33Z" fill="#FACC15" filter="url(#bolt-glow)"/>
        <defs>
          <linearGradient id="storm-grad" x1="14" y1="9" x2="53" y2="36">
            <stop offset="0%" stop-color="#475569"/>
            <stop offset="100%" stop-color="#0F172A"/>
          </linearGradient>
          <filter id="bolt-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="#FACC15" flood-opacity="0.8"/>
          </filter>
        </defs>
      </svg>`,
    'snow': `
      <svg class="w-icon" viewBox="0 0 64 64" fill="none">
        <path class="animated-cloud" d="M46 36H21C16.6 36 13 32.4 13 28C13 23.8 16.2 20.4 20.3 20C21.8 14.8 26.6 11 32.2 11C38.8 11 44.3 15.9 45.2 22.5C48.9 23.4 52 26.7 52 30.6C52 34.7 48.6 38 44.5 38L46 36Z" fill="url(#snow-cloud)"/>
        <g class="snowflakes">
          <circle class="flake-1" cx="22" cy="46" r="3" fill="#E0F2FE"/>
          <circle class="flake-2" cx="33" cy="52" r="3.5" fill="#E0F2FE"/>
          <circle class="flake-3" cx="44" cy="46" r="2.8" fill="#E0F2FE"/>
        </g>
        <defs>
          <linearGradient id="snow-cloud" x1="13" y1="11" x2="52" y2="38">
            <stop offset="0%" stop-color="#E2E8F0"/>
            <stop offset="100%" stop-color="#94A3B8"/>
          </linearGradient>
        </defs>
      </svg>`,
    'fog': `
      <svg class="w-icon" viewBox="0 0 64 64" fill="none">
        <line class="fog-line-1" x1="14" y1="26" x2="50" y2="26" stroke="#CBD5E1" stroke-width="4" stroke-linecap="round"/>
        <line class="fog-line-2" x1="18" y1="34" x2="46" y2="34" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/>
        <line class="fog-line-3" x1="12" y1="42" x2="52" y2="42" stroke="#CBD5E1" stroke-width="4" stroke-linecap="round"/>
        <line class="fog-line-4" x1="20" y1="50" x2="44" y2="50" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/>
      </svg>`
  };

  // DOM Cache
  const dom = {};

  function initDom() {
    dom.body = document.body;
    dom.canvas = document.getElementById('weather-canvas');
    dom.searchInput = document.getElementById('search-input');
    dom.searchSuggestions = document.getElementById('search-suggestions');
    dom.searchForm = document.getElementById('search-form');
    dom.searchClear = document.getElementById('search-clear');
    dom.geoBtn = document.getElementById('geo-btn');
    dom.unitBtn = document.getElementById('unit-toggle-btn');
    dom.unitLabel = document.getElementById('unit-label');
    dom.audioBtn = document.getElementById('audio-toggle-btn');
    dom.cityPills = document.getElementById('city-pills');
    dom.cityName = document.getElementById('city-name');
    dom.cityCountry = document.getElementById('city-country');
    dom.liveClock = document.getElementById('live-clock');
    dom.weatherDesc = document.getElementById('weather-description');
    dom.heroIcon = document.getElementById('hero-weather-icon');
    dom.heroTemp = document.getElementById('hero-temperature');
    dom.tempUnit = document.getElementById('temp-unit-symbol');
    dom.tempHigh = document.getElementById('temp-high');
    dom.tempLow = document.getElementById('temp-low');
    dom.feelsLike = document.getElementById('feels-like-temp');
    dom.feelsLikeText = document.getElementById('feels-like-text');
    dom.windSpeed = document.getElementById('wind-speed');
    dom.windDirection = document.getElementById('wind-direction');
    dom.compassArrow = document.getElementById('compass-arrow');
    dom.humidityVal = document.getElementById('humidity-val');
    dom.humidityProgress = document.getElementById('humidity-progress');
    dom.humidityDesc = document.getElementById('humidity-desc');
    dom.uvVal = document.getElementById('uv-val');
    dom.uvRisk = document.getElementById('uv-risk');
    dom.uvMeter = document.getElementById('uv-meter-bar');
    dom.pressureVal = document.getElementById('pressure-val');
    dom.pressureTendency = document.getElementById('pressure-tendency');
    dom.visibilityVal = document.getElementById('visibility-val');
    dom.sunriseTime = document.getElementById('sunrise-time');
    dom.sunsetTime = document.getElementById('sunset-time');
    dom.sunArcProgress = document.getElementById('sun-arc-progress');
    dom.precipSum = document.getElementById('precip-sum');
    dom.hourlyForecast = document.getElementById('hourly-forecast-track');
    dom.dailyForecast = document.getElementById('daily-forecast-list');
    dom.toast = document.getElementById('toast-notification');
    dom.toastMessage = document.getElementById('toast-message');
    dom.lastUpdated = document.getElementById('last-updated-text');
  }

  // Unit Conversion Utilities
  function formatTemp(celsiusVal) {
    if (celsiusVal === undefined || celsiusVal === null) return '--';
    if (state.unit === 'fahrenheit') {
      const f = (celsiusVal * 9 / 5) + 32;
      return Math.round(f);
    }
    return Math.round(celsiusVal);
  }

  function formatSpeed(kmhVal) {
    if (kmhVal === undefined || kmhVal === null) return '--';
    if (state.unit === 'fahrenheit') {
      const mph = kmhVal * 0.621371;
      return `${Math.round(mph)} mph`;
    }
    return `${Math.round(kmhVal)} km/h`;
  }

  function formatPrecip(mmVal) {
    if (mmVal === undefined || mmVal === null) return '0 mm';
    if (state.unit === 'fahrenheit') {
      const inches = mmVal * 0.0393701;
      return `${inches.toFixed(2)} in`;
    }
    return `${mmVal.toFixed(1)} mm`;
  }

  function formatVisibility(meters) {
    if (!meters && meters !== 0) return '10+ km';
    const km = meters / 1000;
    if (state.unit === 'fahrenheit') {
      const miles = km * 0.621371;
      return `${miles.toFixed(1)} mi`;
    }
    return `${km.toFixed(1)} km`;
  }

  function getWindDirectionCardinal(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round((degrees % 360) / 22.5) % 16;
    return directions[index];
  }

  // Toast Notification
  let toastTimeout = null;
  function showToast(msg, isError = false) {
    if (!dom.toast) return;
    clearTimeout(toastTimeout);
    dom.toastMessage.textContent = msg;
    dom.toast.classList.remove('hidden', 'error', 'success');
    dom.toast.classList.add(isError ? 'error' : 'success');
    toastTimeout = setTimeout(() => {
      dom.toast.classList.add('hidden');
    }, 4000);
  }

  // Particle Canvas Engine
  function initParticleCanvas() {
    if (!dom.canvas) return;
    const ctx = dom.canvas.getContext('2d');
    let width = dom.canvas.width = window.innerWidth;
    let height = dom.canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      if (!dom.canvas) return;
      width = dom.canvas.width = window.innerWidth;
      height = dom.canvas.height = window.innerHeight;
      resetParticles(state.currentWeatherType);
    });

    function resetParticles(type) {
      state.particles = [];
      const count = type === 'rain' ? 120 : (type === 'snow' ? 80 : (type === 'thunderstorm' ? 140 : 35));
      for (let i = 0; i < count; i++) {
        state.particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          length: Math.random() * 20 + 10,
          speed: Math.random() * 8 + 4,
          drift: (Math.random() - 0.5) * 1.5,
          size: Math.random() * 2.5 + 1,
          opacity: Math.random() * 0.6 + 0.2,
          pulse: Math.random() * Math.PI,
          pulseSpeed: Math.random() * 0.04 + 0.01
        });
      }
    }

    let lightningTimer = 0;
    let lightningAlpha = 0;

    function renderParticles() {
      ctx.clearRect(0, 0, width, height);

      const type = state.currentWeatherType;

      if (type === 'thunderstorm') {
        lightningTimer++;
        if (lightningTimer > 180 && Math.random() < 0.03) {
          lightningAlpha = 0.35 + Math.random() * 0.35;
          lightningTimer = 0;
        }
        if (lightningAlpha > 0) {
          ctx.fillStyle = `rgba(220, 200, 255, ${lightningAlpha})`;
          ctx.fillRect(0, 0, width, height);
          lightningAlpha -= 0.05;
        }
      }

      for (let p of state.particles) {
        if (type === 'rain' || type === 'thunderstorm') {
          // Falling raindrops
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.drift * 2, p.y + p.length);
          ctx.strokeStyle = `rgba(180, 220, 255, ${p.opacity * 0.75})`;
          ctx.lineWidth = 1.6;
          ctx.stroke();

          p.y += p.speed * 1.8;
          p.x += p.drift;
          if (p.y > height) {
            p.y = -20;
            p.x = Math.random() * width;
          }
        } else if (type === 'snow') {
          // Drifting soft snowflakes
          p.pulse += p.pulseSpeed;
          p.x += Math.sin(p.pulse) * 1.2;
          p.y += p.speed * 0.3 + 0.5;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(240, 248, 255, ${p.opacity})`;
          ctx.shadowBlur = 4;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
          ctx.fill();
          ctx.shadowBlur = 0;

          if (p.y > height) {
            p.y = -10;
            p.x = Math.random() * width;
          }
        } else if (type === 'clear-night') {
          // Twinkling stars
          p.pulse += p.pulseSpeed;
          const starAlpha = 0.2 + (Math.sin(p.pulse) + 1) * 0.35 * p.opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(224, 231, 255, ${starAlpha})`;
          ctx.shadowBlur = 6;
          ctx.shadowColor = 'rgba(147, 197, 253, 0.7)';
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Gentle solar dust motes / clouds
          p.pulse += p.pulseSpeed;
          p.y -= 0.3;
          p.x += Math.cos(p.pulse) * 0.4;
          const alpha = 0.15 + (Math.sin(p.pulse) + 1) * 0.15;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 220, 150, ${alpha})`;
          ctx.fill();

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
        }
      }

      state.animationFrameId = requestAnimationFrame(renderParticles);
    }

    resetParticles(state.currentWeatherType);
    renderParticles();

    state.updateAtmosphere = (type) => {
      state.currentWeatherType = type;
      resetParticles(type);
    };
  }

  // Web Audio Synthesizer (Generative Rain & Wind Ambience)
  function toggleAmbientSound() {
    if (state.isPlayingAudio) {
      stopAmbientSound();
    } else {
      startAmbientSound();
    }
  }

  function startAmbientSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) {
        showToast('Web Audio is not supported in this browser.', true);
        return;
      }

      if (!state.audioCtx) {
        state.audioCtx = new AudioContext();
      }

      if (state.audioCtx.state === 'suspended') {
        state.audioCtx.resume();
      }

      // Generate Pink Noise buffer (5 seconds seamless loop)
      const bufferSize = state.audioCtx.sampleRate * 5;
      const noiseBuffer = state.audioCtx.createBuffer(1, bufferSize, state.audioCtx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
        b6 = white * 0.115926;
      }

      const whiteNoise = state.audioCtx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to simulate natural wind / rain frequencies
      const filter = state.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, state.audioCtx.currentTime);

      // Low frequency oscillator for gusting modulation
      const lfo = state.audioCtx.createOscillator();
      lfo.frequency.setValueAtTime(0.2, state.audioCtx.currentTime);
      const lfoGain = state.audioCtx.createGain();
      lfoGain.gain.setValueAtTime(300, state.audioCtx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      // Main Gain Node
      state.audioGain = state.audioCtx.createGain();
      state.audioGain.gain.setValueAtTime(0.01, state.audioCtx.currentTime);
      state.audioGain.gain.exponentialRampToValueAtTime(0.3, state.audioCtx.currentTime + 1.5);

      whiteNoise.connect(filter);
      filter.connect(state.audioGain);
      state.audioGain.connect(state.audioCtx.destination);

      whiteNoise.start();
      state.activeAudioSource = whiteNoise;
      state.isPlayingAudio = true;

      if (dom.audioBtn) {
        dom.audioBtn.classList.add('active');
        dom.audioBtn.setAttribute('aria-pressed', 'true');
      }
      showToast('Ambient weather sound activated');
    } catch (err) {
      console.error('Audio start failed', err);
      showToast('Could not start ambient audio', true);
    }
  }

  function stopAmbientSound() {
    if (state.audioGain && state.audioCtx) {
      try {
        state.audioGain.gain.setValueAtTime(state.audioGain.gain.value, state.audioCtx.currentTime);
        state.audioGain.gain.exponentialRampToValueAtTime(0.0001, state.audioCtx.currentTime + 0.5);
        setTimeout(() => {
          if (state.activeAudioSource) {
            state.activeAudioSource.stop();
            state.activeAudioSource.disconnect();
          }
          state.isPlayingAudio = false;
        }, 500);
      } catch (e) {
        state.isPlayingAudio = false;
      }
    } else {
      state.isPlayingAudio = false;
    }
    if (dom.audioBtn) {
      dom.audioBtn.classList.remove('active');
      dom.audioBtn.setAttribute('aria-pressed', 'false');
    }
    showToast('Ambient sound muted');
  }

  // Open-Meteo Geocoding Search
  async function searchLocations(query) {
    if (!query || query.trim().length < 2) {
      hideSuggestions();
      return;
    }

    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=6&language=en&format=json`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Geocoding search failed');
      const data = await res.json();
      renderSuggestions(data.results || []);
    } catch (err) {
      console.error(err);
      hideSuggestions();
    }
  }

  function renderSuggestions(results) {
    if (!dom.searchSuggestions) return;
    if (!results || results.length === 0) {
      dom.searchSuggestions.innerHTML = `<div class="suggestion-item no-results">No cities found</div>`;
      dom.searchSuggestions.classList.remove('hidden');
      return;
    }

    dom.searchSuggestions.innerHTML = results.map(item => {
      const region = [item.admin1, item.country].filter(Boolean).join(', ');
      const countryCode = item.country_code ? item.country_code.toUpperCase() : '';
      return `
        <button type="button" class="suggestion-item" data-lat="${item.latitude}" data-lon="${item.longitude}" data-name="${escapeHtml(item.name)}" data-country="${escapeHtml(region)}" data-timezone="${item.timezone || 'auto'}">
          <span class="sug-flag">${countryCode ? getFlagEmoji(countryCode) : '📍'}</span>
          <span class="sug-details">
            <span class="sug-city">${escapeHtml(item.name)}</span>
            <span class="sug-country">${escapeHtml(region)}</span>
          </span>
          <span class="sug-coords">${item.latitude.toFixed(2)}°, ${item.longitude.toFixed(2)}°</span>
        </button>
      `;
    }).join('');

    dom.searchSuggestions.classList.remove('hidden');

    dom.searchSuggestions.querySelectorAll('.suggestion-item').forEach(btn => {
      btn.addEventListener('click', () => {
        const city = {
          name: btn.dataset.name,
          country: btn.dataset.country,
          lat: parseFloat(btn.dataset.lat),
          lon: parseFloat(btn.dataset.lon),
          timezone: btn.dataset.timezone
        };
        selectCity(city);
      });
    });
  }

  function hideSuggestions() {
    if (dom.searchSuggestions) {
      dom.searchSuggestions.classList.add('hidden');
    }
  }

  function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '📍';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, m => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m]));
  }

  // Fetch Full Weather Forecast Data from Open-Meteo
  async function fetchWeatherData(lat, lon, timezone = 'auto') {
    setLoadingState(true);
    try {
      const params = new URLSearchParams({
        latitude: lat,
        longitude: lon,
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'is_day',
          'precipitation',
          'weather_code',
          'surface_pressure',
          'wind_speed_10m',
          'wind_direction_10m'
        ].join(','),
        hourly: [
          'temperature_2m',
          'weather_code',
          'precipitation_probability',
          'is_day',
          'visibility'
        ].join(','),
        daily: [
          'weather_code',
          'temperature_2m_max',
          'temperature_2m_min',
          'apparent_temperature_max',
          'apparent_temperature_min',
          'sunrise',
          'sunset',
          'uv_index_max',
          'precipitation_sum',
          'precipitation_probability_max'
        ].join(','),
        timezone: timezone === 'auto' ? 'auto' : timezone,
        forecast_days: 8
      });

      const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weather data request failed with status: ${res.status}`);
      const data = await res.json();
      state.weatherData = data;
      renderAllWeatherData();
      setLoadingState(false);
      showToast(`Weather updated for ${state.currentCity.name}`);
    } catch (err) {
      console.error(err);
      setLoadingState(false);
      showToast(`Failed to load weather data. Please try again.`, true);
    }
  }

  function setLoadingState(isLoading) {
    if (isLoading) {
      dom.body.classList.add('loading-weather');
    } else {
      dom.body.classList.remove('loading-weather');
    }
  }

  function selectCity(city) {
    state.currentCity = city;
    localStorage.setItem('weather_last_city', JSON.stringify(city));
    if (dom.searchInput) {
      dom.searchInput.value = '';
    }
    hideSuggestions();
    fetchWeatherData(city.lat, city.lon, city.timezone);
  }

  // Live Local Time Clock
  function startLiveClock(timeZoneString) {
    if (state.clockInterval) clearInterval(state.clockInterval);

    function updateTime() {
      try {
        const now = new Date();
        const options = {
          timeZone: timeZoneString === 'auto' ? undefined : timeZoneString,
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        };
        const formatter = new Intl.DateTimeFormat('en-US', options);
        if (dom.liveClock) {
          dom.liveClock.textContent = formatter.format(now);
        }
      } catch (e) {
        if (dom.liveClock) dom.liveClock.textContent = new Date().toLocaleTimeString();
      }
    }

    updateTime();
    state.clockInterval = setInterval(updateTime, 1000);
  }

  // Render All Weather UI
  function renderAllWeatherData() {
    const d = state.weatherData;
    if (!d || !d.current) return;

    const cur = d.current;
    const daily = d.daily;
    const hourly = d.hourly;

    const wmo = WMO_MAP[cur.weather_code] || { label: 'Clear', icon: 'sun', type: 'clear' };
    const isDay = cur.is_day === 1;

    // Atmospheric theme determination
    let themeType = wmo.type;
    if (themeType === 'clear') {
      themeType = isDay ? 'clear-day' : 'clear-night';
    }
    dom.body.setAttribute('data-weather', themeType);
    dom.body.setAttribute('data-time', isDay ? 'day' : 'night');

    if (state.updateAtmosphere) {
      state.updateAtmosphere(themeType);
    }

    // City & Date Header
    dom.cityName.textContent = state.currentCity.name;
    dom.cityCountry.textContent = state.currentCity.country || '';
    startLiveClock(d.timezone);

    // Hero Weather
    let iconKey = wmo.icon;
    if (wmo.icon === 'sun' && !isDay) iconKey = 'moon';
    if (wmo.icon === 'cloud-sun' && !isDay) iconKey = 'cloud';
    dom.heroIcon.innerHTML = ICONS[iconKey] || ICONS['sun'];

    dom.weatherDesc.textContent = wmo.label;
    dom.heroTemp.textContent = formatTemp(cur.temperature_2m);
    dom.tempUnit.textContent = state.unit === 'fahrenheit' ? '°F' : '°C';

    const todayHigh = daily && daily.temperature_2m_max ? daily.temperature_2m_max[0] : null;
    const todayLow = daily && daily.temperature_2m_min ? daily.temperature_2m_min[0] : null;
    dom.tempHigh.textContent = todayHigh !== null ? `${formatTemp(todayHigh)}°` : '--';
    dom.tempLow.textContent = todayLow !== null ? `${formatTemp(todayLow)}°` : '--';

    const feelsLikeVal = cur.apparent_temperature;
    dom.feelsLike.textContent = `${formatTemp(feelsLikeVal)}°`;
    if (feelsLikeVal < cur.temperature_2m - 1) {
      dom.feelsLikeText.textContent = 'Wind is making it feel cooler';
    } else if (feelsLikeVal > cur.temperature_2m + 1) {
      dom.feelsLikeText.textContent = 'Humidity is making it feel warmer';
    } else {
      dom.feelsLikeText.textContent = 'Similar to actual temperature';
    }

    // Wind & Compass
    dom.windSpeed.textContent = formatSpeed(cur.wind_speed_10m);
    const windDeg = cur.wind_direction_10m || 0;
    dom.windDirection.textContent = `${getWindDirectionCardinal(windDeg)} (${windDeg}°)`;
    if (dom.compassArrow) {
      dom.compassArrow.style.transform = `rotate(${windDeg}deg)`;
    }

    // Humidity
    const hum = cur.relative_humidity_2m;
    dom.humidityVal.textContent = `${hum}%`;
    if (dom.humidityProgress) {
      dom.humidityProgress.style.width = `${hum}%`;
    }
    if (hum < 30) {
      dom.humidityDesc.textContent = 'Dry & Crisp atmosphere';
    } else if (hum <= 60) {
      dom.humidityDesc.textContent = 'Optimal comfort level';
    } else if (hum <= 80) {
      dom.humidityDesc.textContent = 'Noticeably humid';
    } else {
      dom.humidityDesc.textContent = 'Very muggy & saturated';
    }

    // UV Index
    const todayUv = daily && daily.uv_index_max ? daily.uv_index_max[0] : 0;
    dom.uvVal.textContent = todayUv.toFixed(1);
    let uvRiskCategory = 'Low';
    let uvMeterPct = Math.min(100, (todayUv / 11) * 100);
    if (todayUv <= 2) {
      uvRiskCategory = 'Low - Safe';
    } else if (todayUv <= 5) {
      uvRiskCategory = 'Moderate - Protection recommended';
    } else if (todayUv <= 7) {
      uvRiskCategory = 'High - Wear sunscreen';
    } else if (todayUv <= 10) {
      uvRiskCategory = 'Very High - Avoid direct sun';
    } else {
      uvRiskCategory = 'Extreme - Take all precautions';
    }
    dom.uvRisk.textContent = uvRiskCategory;
    if (dom.uvMeter) {
      dom.uvMeter.style.width = `${Math.max(8, uvMeterPct)}%`;
    }

    // Pressure
    const pressure = cur.surface_pressure;
    dom.pressureVal.textContent = pressure ? `${Math.round(pressure)} hPa` : '--';
    if (pressure > 1013) {
      dom.pressureTendency.textContent = 'High pressure: Stable weather';
    } else {
      dom.pressureTendency.textContent = 'Low pressure: Active systems';
    }

    // Visibility
    const currentHourIndex = findCurrentHourIndex(hourly);
    const visMeters = hourly && hourly.visibility ? hourly.visibility[currentHourIndex] : null;
    dom.visibilityVal.textContent = formatVisibility(visMeters);

    // Sunrise & Sunset
    if (daily && daily.sunrise && daily.sunset) {
      const sunriseIso = daily.sunrise[0];
      const sunsetIso = daily.sunset[0];
      dom.sunriseTime.textContent = formatIsoTime(sunriseIso, d.timezone);
      dom.sunsetTime.textContent = formatIsoTime(sunsetIso, d.timezone);
      updateSunArcProgress(sunriseIso, sunsetIso, d.timezone);
    }

    // Precipitation Sum
    const precip = daily && daily.precipitation_sum ? daily.precipitation_sum[0] : 0;
    dom.precipSum.textContent = formatPrecip(precip);

    // Hourly Forecast Carousel
    renderHourlyForecast(hourly, d.timezone);

    // 7-Day Extended Daily Forecast
    renderDailyForecast(daily, d.timezone);

    if (dom.lastUpdated) {
      const now = new Date();
      dom.lastUpdated.textContent = `Updated ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
  }

  function findCurrentHourIndex(hourly) {
    if (!hourly || !hourly.time) return 0;
    const nowIso = new Date().toISOString().slice(0, 13);
    const idx = hourly.time.findIndex(t => t.startsWith(nowIso));
    return idx >= 0 ? idx : 0;
  }

  function formatIsoTime(isoStr, timeZone) {
    if (!isoStr) return '--:--';
    try {
      const date = new Date(isoStr);
      return date.toLocaleTimeString('en-US', {
        timeZone: timeZone === 'auto' ? undefined : timeZone,
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return isoStr.slice(11, 16);
    }
  }

  function updateSunArcProgress(sunriseIso, sunsetIso, timeZone) {
    if (!dom.sunArcProgress) return;
    try {
      const now = new Date().getTime();
      const rise = new Date(sunriseIso).getTime();
      const set = new Date(sunsetIso).getTime();
      if (now < rise) {
        dom.sunArcProgress.style.strokeDashoffset = '100';
      } else if (now > set) {
        dom.sunArcProgress.style.strokeDashoffset = '0';
      } else {
        const total = set - rise;
        const elapsed = now - rise;
        const pct = Math.max(0, Math.min(1, elapsed / total));
        // Stroke dasharray is 100
        dom.sunArcProgress.style.strokeDashoffset = (100 - (pct * 100)).toString();
      }
    } catch (e) {}
  }

  // Hourly Forecast Carousel Render
  function renderHourlyForecast(hourly, timeZone) {
    if (!dom.hourlyForecast || !hourly || !hourly.time) return;

    const startIdx = findCurrentHourIndex(hourly);
    const count = 24;
    const items = [];

    for (let i = startIdx; i < startIdx + count && i < hourly.time.length; i++) {
      const timeStr = hourly.time[i];
      const isNow = i === startIdx;
      const date = new Date(timeStr);
      const hourDisplay = isNow ? 'Now' : date.toLocaleTimeString('en-US', {
        timeZone: timeZone === 'auto' ? undefined : timeZone,
        hour: 'numeric',
        hour12: true
      });

      const code = hourly.weather_code[i];
      const isDay = hourly.is_day ? hourly.is_day[i] === 1 : true;
      const wmo = WMO_MAP[code] || { label: 'Clear', icon: 'sun' };
      let iconKey = wmo.icon;
      if (wmo.icon === 'sun' && !isDay) iconKey = 'moon';
      if (wmo.icon === 'cloud-sun' && !isDay) iconKey = 'cloud';

      const temp = formatTemp(hourly.temperature_2m[i]);
      const pop = hourly.precipitation_probability ? hourly.precipitation_probability[i] : 0;

      items.push(`
        <div class="hourly-pill ${isNow ? 'current-hour' : ''}">
          <span class="hourly-time">${hourDisplay}</span>
          <div class="hourly-icon">${ICONS[iconKey] || ICONS['sun']}</div>
          <span class="hourly-temp">${temp}°</span>
          ${pop >= 15 ? `<span class="hourly-pop">💧 ${pop}%</span>` : `<span class="hourly-pop spacer"></span>`}
        </div>
      `);
    }

    dom.hourlyForecast.innerHTML = items.join('');
  }

  // 7-Day Extended Forecast Render (Apple Style with Gradient Temp Bars)
  function renderDailyForecast(daily, timeZone) {
    if (!dom.dailyForecast || !daily || !daily.time) return;

    // Determine week min and max across all days for proportional range bars
    let weekMin = Infinity;
    let weekMax = -Infinity;
    for (let i = 0; i < daily.time.length; i++) {
      if (daily.temperature_2m_min[i] < weekMin) weekMin = daily.temperature_2m_min[i];
      if (daily.temperature_2m_max[i] > weekMax) weekMax = daily.temperature_2m_max[i];
    }
    const tempSpan = Math.max(1, weekMax - weekMin);

    const items = [];
    for (let i = 0; i < Math.min(7, daily.time.length); i++) {
      const dateStr = daily.time[i];
      const date = new Date(dateStr + 'T12:00:00');
      let dayName = i === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' });

      const code = daily.weather_code[i];
      const wmo = WMO_MAP[code] || { label: 'Clear', icon: 'sun' };
      const dayMin = daily.temperature_2m_min[i];
      const dayMax = daily.temperature_2m_max[i];

      const leftPct = ((dayMin - weekMin) / tempSpan) * 100;
      const widthPct = Math.max(8, ((dayMax - dayMin) / tempSpan) * 100);

      const pop = daily.precipitation_probability_max ? daily.precipitation_probability_max[i] : 0;

      items.push(`
        <div class="daily-row">
          <div class="daily-col-day">
            <span class="daily-day-name">${dayName}</span>
            ${pop >= 20 ? `<span class="daily-pop">💧 ${pop}%</span>` : ''}
          </div>
          <div class="daily-col-icon">
            <div class="daily-icon-wrapper">${ICONS[wmo.icon] || ICONS['sun']}</div>
            <span class="daily-condition-label">${wmo.label}</span>
          </div>
          <div class="daily-col-range">
            <span class="daily-temp-low">${formatTemp(dayMin)}°</span>
            <div class="daily-temp-bar-track">
              <div class="daily-temp-bar-fill" style="left: ${leftPct}%; width: ${widthPct}%;"></div>
            </div>
            <span class="daily-temp-high">${formatTemp(dayMax)}°</span>
          </div>
        </div>
      `);
    }

    dom.dailyForecast.innerHTML = items.join('');
  }

  // Quick City Pills
  const POPULAR_CITIES = [
    { name: 'London', country: 'United Kingdom', lat: 51.5085, lon: -0.1257, timezone: 'Europe/London' },
    { name: 'New York', country: 'United States', lat: 40.7128, lon: -74.0060, timezone: 'America/New_York' },
    { name: 'Tokyo', country: 'Japan', lat: 35.6895, lon: 139.6917, timezone: 'Asia/Tokyo' },
    { name: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris' },
    { name: 'Dubai', country: 'United Arab Emirates', lat: 25.2048, lon: 55.2708, timezone: 'Asia/Dubai' },
    { name: 'Sydney', country: 'Australia', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
    { name: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, timezone: 'Asia/Singapore' },
    { name: 'Cairo', country: 'Egypt', lat: 30.0444, lon: 31.2357, timezone: 'Africa/Cairo' }
  ];

  function renderCityPills() {
    if (!dom.cityPills) return;
    dom.cityPills.innerHTML = POPULAR_CITIES.map(city => `
      <button type="button" class="city-pill-btn" data-city='${JSON.stringify(city)}'>
        ${escapeHtml(city.name)}
      </button>
    `).join('');

    dom.cityPills.querySelectorAll('.city-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const city = JSON.parse(btn.dataset.city);
        selectCity(city);
      });
    });
  }

  // Geolocation Support
  function getUserLocation() {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', true);
      return;
    }

    dom.geoBtn.classList.add('spinning');
    showToast('Locating your coordinates...');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        dom.geoBtn.classList.remove('spinning');
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const revRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          let cityName = 'My Location';
          let country = '';
          if (revRes.ok) {
            const revData = await revRes.json();
            cityName = revData.city || revData.locality || revData.principalSubdivision || 'My Location';
            country = revData.countryName || '';
          }

          const localCity = {
            name: cityName,
            country: country,
            lat: lat,
            lon: lon,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto'
          };
          selectCity(localCity);
        } catch (e) {
          const localCity = {
            name: 'Local Coordinates',
            country: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
            lat: lat,
            lon: lon,
            timezone: 'auto'
          };
          selectCity(localCity);
        }
      },
      (error) => {
        dom.geoBtn.classList.remove('spinning');
        let msg = 'Could not retrieve your location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied.';
        }
        showToast(msg, true);
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  }

  // Unit Toggle
  function toggleUnit() {
    state.unit = state.unit === 'celsius' ? 'fahrenheit' : 'celsius';
    localStorage.setItem('weather_unit', state.unit);
    updateUnitUi();
    if (state.weatherData) {
      renderAllWeatherData();
    }
  }

  function updateUnitUi() {
    if (dom.unitLabel) {
      dom.unitLabel.textContent = state.unit === 'celsius' ? '°C' : '°F';
    }
    if (dom.unitBtn) {
      dom.unitBtn.setAttribute('data-unit', state.unit);
      dom.unitBtn.setAttribute('title', `Switch to ${state.unit === 'celsius' ? 'Fahrenheit' : 'Celsius'}`);
    }
  }

  // Event Listeners
  function bindEvents() {
    // Search input debounce
    if (dom.searchInput) {
      dom.searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        if (dom.searchClear) {
          dom.searchClear.style.display = query.length > 0 ? 'flex' : 'none';
        }
        clearTimeout(state.searchDebounceTimer);
        state.searchDebounceTimer = setTimeout(() => {
          searchLocations(query);
        }, 320);
      });

      dom.searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          hideSuggestions();
        }
      });
    }

    if (dom.searchClear) {
      dom.searchClear.addEventListener('click', () => {
        if (dom.searchInput) {
          dom.searchInput.value = '';
          dom.searchInput.focus();
        }
        dom.searchClear.style.display = 'none';
        hideSuggestions();
      });
    }

    if (dom.searchForm) {
      dom.searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = dom.searchInput ? dom.searchInput.value.trim() : '';
        if (query) {
          searchLocations(query);
        }
      });
    }

    // Hide suggestions on outside click
    document.addEventListener('click', (e) => {
      if (dom.searchForm && !dom.searchForm.contains(e.target)) {
        hideSuggestions();
      }
    });

    // Keyboard shortcut '/' to focus search
    document.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== dom.searchInput) {
        e.preventDefault();
        if (dom.searchInput) {
          dom.searchInput.focus();
          dom.searchInput.select();
        }
      }
    });

    if (dom.geoBtn) {
      dom.geoBtn.addEventListener('click', getUserLocation);
    }

    if (dom.unitBtn) {
      dom.unitBtn.addEventListener('click', toggleUnit);
    }

    if (dom.audioBtn) {
      dom.audioBtn.addEventListener('click', toggleAmbientSound);
    }
  }

  // Initialization
  function init() {
    initDom();
    bindEvents();
    renderCityPills();
    updateUnitUi();
    initParticleCanvas();

    // Check localStorage for previous city
    let initialCity = POPULAR_CITIES[0]; // London default
    try {
      const saved = localStorage.getItem('weather_last_city');
      if (saved) {
        initialCity = JSON.parse(saved);
      }
    } catch (e) {}

    selectCity(initialCity);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
