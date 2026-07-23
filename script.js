// Portfolio JavaScript — "macOS Monterey Desktop" Awwwards Edition
// Modules: ThemeManager, WallpaperManager, ParallaxWallpaperManager, BootScreenManager,
// SystemStatusManager, ClockManager, SkillsAnimationManager, ContactFormManager,
// ToastManager, WindowManager (drag/focus/min/max/snap/resize), DockManager (magnification/bounce/indicators),
// SpotlightManager (Cmd+K search), ControlCenterManager, ProjectFilterManager, FinderManager,
// DesktopIconManager (select/drag/doubleclick), AudioManager (ambient soundscape), GitHubActivityWidget,
// TerminalManager, LockScreen, WelcomeModal, TrashManager, WindowMenuManager, PortfolioApp

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobileLayout = () => window.matchMedia('(max-width: 720px)').matches;

// Theme Management (day / night)
class ThemeManager {
    constructor() {
        this.init();
    }

    init() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            this.setTheme(savedTheme);
        } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            this.setTheme('dark');
        } else {
            this.setTheme('light');
        }

        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        
        const ccVal = document.getElementById('cc-theme-val');
        if (ccVal) ccVal.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(newTheme);
    }
}

// Wallpaper Picker & Parallax Manager
class WallpaperManager {
    constructor() {
        this.options = {
            'nebula': "url('./assets/nebula-bg.jpg')",
            'starry-night': "url('./assets/starry-night.jpg')",
            'black-hole': "url('./assets/black-hole.jpg')",
            'earth': "url('./assets/earth.jpg')"
        };
        this.defaultWallpaper = 'nebula';
        this.picker = document.querySelector('[data-wallpaper-picker]');
        this.init();
    }

    init() {
        const saved = localStorage.getItem('wallpaper');
        this.setWallpaper(saved && this.options[saved] ? saved : this.defaultWallpaper, false);

        if (!this.picker) return;

        this.picker.querySelectorAll('[data-wallpaper]').forEach(swatch => {
            swatch.addEventListener('click', () => {
                this.setWallpaper(swatch.dataset.wallpaper);
            });
        });
    }

    setWallpaper(key, persist = true) {
        const value = this.options[key];
        if (!value) return;

        document.documentElement.style.setProperty('--wallpaper-image', value);
        document.documentElement.setAttribute('data-wallpaper', key);

        const ccVal = document.getElementById('cc-wallpaper-val');
        if (ccVal) ccVal.textContent = key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' ');

        if (persist) {
            localStorage.setItem('wallpaper', key);
        }

        if (this.picker) {
            this.picker.querySelectorAll('[data-wallpaper]').forEach(swatch => {
                swatch.classList.toggle('active', swatch.dataset.wallpaper === key);
            });
        }
    }
}

// Starfield Particle & Earth Canvas Overlay Engine
class ParallaxWallpaperManager {
    constructor() {
        this.canvas = document.getElementById('wallpaper-canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.earthAngle = 0;
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.createParticles();
        if (!prefersReducedMotion) {
            this.animate();
        }

        const desktop = document.getElementById('desktop');
        if (desktop && !prefersReducedMotion) {
            desktop.addEventListener('mousemove', (e) => {
                const cx = window.innerWidth / 2;
                const cy = window.innerHeight / 2;
                const dx = (e.clientX - cx) / cx * 12;
                const dy = (e.clientY - cy) / cy * 12;
                const wp = document.getElementById('wallpaper');
                if (wp) {
                    wp.style.transform = `scale(1.03) translate3d(${dx}px, ${dy}px, 0)`;
                }
            });
        }
    }

    resize() {
        this.width = this.canvas.width = window.innerWidth;
        this.height = this.canvas.height = window.innerHeight;
    }

    createParticles() {
        this.particles = [];
        const count = Math.floor((this.width * this.height) / 16000);
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 1.5 + 0.5,
                alpha: Math.random() * 0.7 + 0.3,
                speed: Math.random() * 0.25 + 0.05
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Render Starfield Particles
        this.particles.forEach(p => {
            p.y -= p.speed;
            if (p.y < 0) p.y = this.height;
            this.ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // If Earth wallpaper is active, render rotating Earth wireframe accent
        const activeWp = document.documentElement.getAttribute('data-wallpaper');
        if (activeWp === 'earth') {
            this.earthAngle += 0.005;
            const cx = this.width - 120;
            const cy = this.height - 140;
            const r = 70;

            this.ctx.strokeStyle = 'rgba(95, 179, 255, 0.25)';
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
            this.ctx.stroke();

            // Latitude lines
            for (let i = -r + 15; i < r; i += 25) {
                const yr = Math.sqrt(r * r - i * i);
                this.ctx.beginPath();
                this.ctx.ellipse(cx, cy + i, yr, yr * 0.35, 0, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }

        requestAnimationFrame(() => this.animate());
    }
}

// Ambient Audio Soundscape Engine
class AudioManager {
    constructor() {
        this.btn = document.getElementById('audio-toggle');
        this.playing = false;
        this.audioCtx = null;
        this.osc1 = null;
        this.osc2 = null;
        this.gainNode = null;
        if (!this.btn) return;
        this.init();
    }

    init() {
        this.btn.addEventListener('click', () => this.toggle());
    }

    toggle() {
        this.playing ? this.stop() : this.start();
    }

    start() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContext();

            this.gainNode = this.audioCtx.createGain();
            this.gainNode.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
            this.gainNode.connect(this.audioCtx.destination);

            this.osc1 = this.audioCtx.createOscillator();
            this.osc1.type = 'sine';
            this.osc1.frequency.setValueAtTime(146.83, this.audioCtx.currentTime); // D3

            this.osc2 = this.audioCtx.createOscillator();
            this.osc2.type = 'sine';
            this.osc2.frequency.setValueAtTime(220.00, this.audioCtx.currentTime); // A3

            this.osc1.connect(this.gainNode);
            this.osc2.connect(this.gainNode);

            this.osc1.start();
            this.osc2.start();

            this.playing = true;
            this.updateBtnUI();
        } catch (e) {
            console.warn('Audio Synthesis not supported:', e);
        }
    }

    stop() {
        if (this.gainNode && this.audioCtx) {
            this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.5);
            setTimeout(() => {
                this.osc1?.stop();
                this.osc2?.stop();
                this.audioCtx?.close();
                this.playing = false;
                this.updateBtnUI();
            }, 500);
        } else {
            this.playing = false;
            this.updateBtnUI();
        }
    }

    updateBtnUI() {
        const iconOn = this.btn.querySelector('.audio-icon-on');
        const iconOff = this.btn.querySelector('.audio-icon-off');
        if (iconOn && iconOff) {
            iconOn.style.display = this.playing ? 'block' : 'none';
            iconOff.style.display = this.playing ? 'none' : 'block';
        }
    }
}

// Finder Application Virtual File System
class FinderManager {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.sidebarItems = document.querySelectorAll('.finder-sidebar li');
        this.fileGrid = document.getElementById('finder-file-grid');
        this.pathEl = document.getElementById('finder-current-path');

        this.files = {
            'desktop': [
                { name: 'About_Me.info', type: 'about', icon: 'icon-person' },
                { name: 'Projects_Directory', type: 'projects', icon: 'icon-folder' },
                { name: 'Skills_Matrix.csv', type: 'skills', icon: 'icon-clock' },
                { name: 'Resume.pdf', type: 'resume', icon: 'icon-doc' },
                { name: 'Terminal.app', type: 'terminal', icon: 'icon-terminal' }
            ],
            'projects': [
                { name: 'Morphix_Studio', type: 'projects', icon: 'icon-folder' },
                { name: 'Cyanotype_App', type: 'projects', icon: 'icon-folder' },
                { name: 'Aerophone_UI', type: 'projects', icon: 'icon-folder' },
                { name: 'Weather_App', type: 'projects', icon: 'icon-folder' },
                { name: 'Instagram_Clone', type: 'projects', icon: 'icon-folder' },
                { name: 'Snake_Game', type: 'projects', icon: 'icon-folder' }
            ],
            'documents': [
                { name: 'Shreya_Halder_Resume.pdf', type: 'resume', icon: 'icon-doc' },
                { name: 'BCA_Degree_Transcript.pdf', type: 'about', icon: 'icon-doc' },
                { name: 'MCA_Coursework.doc', type: 'about', icon: 'icon-doc' }
            ]
        };

        if (!this.fileGrid) return;
        this.init();
    }

    init() {
        this.sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                this.sidebarItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');
                const folder = item.dataset.folder || 'desktop';
                this.renderFolder(folder);
            });
        });

        this.renderFolder('desktop');
    }

    renderFolder(folderKey) {
        if (this.pathEl) {
            this.pathEl.textContent = folderKey.charAt(0).toUpperCase() + folderKey.slice(1);
        }

        const items = this.files[folderKey] || [];
        this.fileGrid.innerHTML = '';

        items.forEach(file => {
            const item = document.createElement('div');
            item.className = 'finder-file-item';
            item.innerHTML = `
                <svg class="icon"><use href="#${file.icon}"/></svg>
                <span class="finder-file-name">${file.name}</span>
            `;
            item.addEventListener('dblclick', () => {
                this.windowManager?.open(file.type);
            });
            item.addEventListener('click', () => {
                document.querySelectorAll('.finder-file-item').forEach(i => i.style.background = 'none');
                item.style.background = 'var(--surface-2)';
            });
            this.fileGrid.appendChild(item);
        });
    }
}

// Desktop Icon Selection & Dragging Manager
class DesktopIconManager {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.icons = document.querySelectorAll('.desktop-icon');
        this.init();
    }

    init() {
        this.icons.forEach(icon => {
            // Selection highlight
            icon.addEventListener('click', (e) => {
                e.stopPropagation();
                this.icons.forEach(i => i.classList.remove('selected'));
                icon.classList.add('selected');
            });

            // Double click launch
            icon.addEventListener('dblclick', () => {
                const target = icon.dataset.open;
                if (target) {
                    this.windowManager.open(target);
                }
            });

            // Drag positioning
            this.bindDrag(icon);
        });

        document.addEventListener('click', () => {
            this.icons.forEach(i => i.classList.remove('selected'));
        });
    }

    bindDrag(icon) {
        let dragging = false;
        let startX, startY, origLeft, origTop;

        icon.addEventListener('pointerdown', (e) => {
            if (isMobileLayout()) return;
            startX = e.clientX;
            startY = e.clientY;
            const rect = icon.getBoundingClientRect();
            const container = document.getElementById('desktop-icons')?.getBoundingClientRect() || document.getElementById('desktop').getBoundingClientRect();

            origLeft = rect.left - container.left;
            origTop = rect.top - container.top;
            dragging = true;

            const onPointerMove = (moveEv) => {
                if (!dragging) return;
                const dx = moveEv.clientX - startX;
                const dy = moveEv.clientY - startY;
                icon.style.position = 'absolute';
                icon.style.left = `${origLeft + dx}px`;
                icon.style.top = `${origTop + dy}px`;
                icon.classList.add('dragging');
            };

            const onPointerUp = () => {
                dragging = false;
                icon.classList.remove('dragging');
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
            };

            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        });
    }
}

// GitHub Contribution Matrix Widget inside Control Center
class GitHubActivityWidget {
    constructor() {
        this.container = document.getElementById('github-heatmap');
        if (!this.container) return;
        this.init();
    }

    init() {
        this.container.innerHTML = '';
        for (let i = 0; i < 36; i++) {
            const tile = document.createElement('div');
            const level = Math.floor(Math.random() * 5);
            tile.className = `heatmap-tile level-${level}`;
            tile.title = `Contribution level ${level}`;
            this.container.appendChild(tile);
        }
    }
}

// Boot Screen Manager
class BootScreenManager {
    constructor(onComplete) {
        this.el = document.getElementById('bootscreen');
        this.progressFill = document.getElementById('boot-progress-fill');
        this.statusText = document.getElementById('boot-status');
        this.onComplete = onComplete || (() => {});
        this.init();
    }

    init() {
        if (!this.el) {
            document.body.classList.remove('loading');
            this.onComplete();
            return;
        }

        const stages = [
            { progress: '25%', text: 'Initializing environment…' },
            { progress: '55%', text: 'Loading desktop modules…' },
            { progress: '85%', text: 'Preparing portfolio workspace…' },
            { progress: '100%', text: 'Ready' }
        ];

        let current = 0;
        const stepDelay = prefersReducedMotion ? 40 : 180;
        const interval = setInterval(() => {
            if (current < stages.length) {
                const stage = stages[current];
                if (this.progressFill) this.progressFill.style.width = stage.progress;
                if (this.statusText) this.statusText.textContent = stage.text;
                current++;
            } else {
                clearInterval(interval);
                setTimeout(() => this.finish(), prefersReducedMotion ? 40 : 200);
            }
        }, stepDelay);

        this.el.addEventListener('click', () => {
            clearInterval(interval);
            this.finish();
        });
    }

    finish() {
        if (!this.el) return;
        this.el.classList.add('boot-hidden');
        document.body.classList.remove('loading');
        setTimeout(() => {
            this.el.style.display = 'none';
        }, prefersReducedMotion ? 40 : 600);
        this.onComplete();
    }
}

// System Status Manager — monitors Wifi connection and Battery level
class SystemStatusManager {
    constructor() {
        this.wifiIndicator = document.getElementById('wifi-indicator');
        this.batteryIndicator = document.getElementById('battery-indicator');
        this.batteryLabel = document.getElementById('battery-label');
        this.init();
    }

    init() {
        this.updateWifiStatus();
        window.addEventListener('online', () => this.updateWifiStatus());
        window.addEventListener('offline', () => this.updateWifiStatus());
        this.initBatteryStatus();
    }

    updateWifiStatus() {
        if (!this.wifiIndicator) return;
        const isOnline = navigator.onLine;
        this.wifiIndicator.classList.toggle('offline', !isOnline);
        this.wifiIndicator.title = isOnline ? 'Connected to Network' : 'Offline';
    }

    initBatteryStatus() {
        if (!this.batteryIndicator) return;
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                const update = () => {
                    const level = Math.round(battery.level * 100);
                    if (this.batteryLabel) this.batteryLabel.textContent = `${level}%`;
                    this.batteryIndicator.classList.toggle('charging', battery.charging);
                    this.batteryIndicator.title = `Battery: ${level}% (${battery.charging ? 'Charging' : 'Discharging'})`;
                };
                update();
                battery.addEventListener('levelchange', update);
                battery.addEventListener('chargingchange', update);
            }).catch(() => {
                if (this.batteryLabel) this.batteryLabel.textContent = '100%';
            });
        } else {
            if (this.batteryLabel) this.batteryLabel.textContent = '100%';
        }
    }
}

// Menu bar clock
class ClockManager {
    constructor() {
        this.timeEl = document.getElementById('clock-time');
        this.metaEl = document.getElementById('clock-meta');
        this.update();
        setInterval(() => this.update(), 10000);
    }

    update() {
        const now = new Date();
        if (this.timeEl) {
            this.timeEl.textContent = now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
        }
        if (this.metaEl) {
            this.metaEl.textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        }
    }
}

// Skills Animation Manager — animates bar width and counts percentage
class SkillsAnimationManager {
    constructor() {
        this.animated = false;
    }

    animate() {
        const skillItems = document.querySelectorAll('.skill-item');

        skillItems.forEach(item => {
            const bar = item.querySelector('.skill-progress');
            const label = item.querySelector('.skill-percentage');
            if (!bar) return;

            const target = parseInt(bar.getAttribute('data-progress'), 10) || 0;
            bar.style.width = '0%';

            requestAnimationFrame(() => {
                bar.style.width = target + '%';
            });

            if (label && !prefersReducedMotion) {
                this.countUp(label, target);
            } else if (label) {
                label.textContent = target + '%';
            }
        });
    }

    countUp(el, target) {
        const duration = 1000;
        const start = performance.now();

        const step = (now) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(eased * target);
            el.textContent = value + '%';
            if (progress < 1) {
                requestAnimationFrame(step);
            }
        };

        requestAnimationFrame(step);
    }
}

// macOS Dock Proximity Magnification & App Manager
class DockManager {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.dockInner = document.getElementById('dock-inner');
        this.items = document.querySelectorAll('.dock-item');
        if (!this.dockInner) return;
        this.init();
    }

    init() {
        if (!isMobileLayout() && !prefersReducedMotion) {
            this.dockInner.addEventListener('mousemove', (e) => this.handleMouseMove(e));
            this.dockInner.addEventListener('mouseleave', () => this.handleMouseLeave());
        }

        this.items.forEach(item => {
            item.addEventListener('click', () => {
                item.classList.add('bounce');
                setTimeout(() => item.classList.remove('bounce'), 600);
            });
        });
    }

    handleMouseMove(e) {
        const mouseX = e.clientX;
        this.items.forEach(item => {
            const rect = item.getBoundingClientRect();
            const center = rect.left + rect.width / 2;
            const distance = Math.abs(mouseX - center);
            const maxDistance = 120;

            if (distance < maxDistance) {
                const scale = 1 + 0.35 * Math.cos((distance / maxDistance) * (Math.PI / 2));
                item.style.transform = `scale(${scale}) translateY(-${(scale - 1) * 14}px)`;
            } else {
                item.style.transform = 'none';
            }
        });
    }

    handleMouseLeave() {
        this.items.forEach(item => {
            item.style.transform = 'none';
        });
    }

    updateRunningIndicators(openIds) {
        this.items.forEach(item => {
            const targetWindow = item.dataset.open;
            if (targetWindow) {
                item.classList.toggle('running', openIds.includes(targetWindow));
            }
        });
    }
}

// Spotlight Search Manager (Cmd+K / Ctrl+K)
class SpotlightManager {
    constructor(windowManager, wallpaperManager, themeManager) {
        this.windowManager = windowManager;
        this.wallpaperManager = wallpaperManager;
        this.themeManager = themeManager;

        this.modal = document.getElementById('spotlight-modal');
        this.input = document.getElementById('spotlight-input');
        this.resultsEl = document.getElementById('spotlight-results');
        this.triggerBtn = document.getElementById('spotlight-btn');

        this.selectedIndex = 0;
        this.items = [];

        this.searchIndex = [
            { title: 'Finder File Explorer', type: 'App', action: () => this.windowManager.open('finder') },
            { title: 'About Me', type: 'Window', action: () => this.windowManager.open('about') },
            { title: 'Projects', type: 'Window', action: () => this.windowManager.open('projects') },
            { title: 'Skills', type: 'Window', action: () => this.windowManager.open('skills') },
            { title: 'Resume.pdf', type: 'Window', action: () => this.windowManager.open('resume') },
            { title: 'Contact', type: 'Window', action: () => this.windowManager.open('contact') },
            { title: 'Terminal', type: 'Window', action: () => this.windowManager.open('terminal') },
            { title: 'Morphix — AI Video Studio', type: 'Project', action: () => { this.windowManager.open('projects'); } },
            { title: 'Cyanotype — Photo Sunprint Filter', type: 'Project', action: () => { this.windowManager.open('projects'); } },
            { title: 'Aerophone — Interactive UI', type: 'Project', action: () => { this.windowManager.open('projects'); } },
            { title: 'Weather App', type: 'Project', action: () => { this.windowManager.open('projects'); } },
            { title: 'Instagram Clone UI', type: 'Project', action: () => { this.windowManager.open('projects'); } },
            { title: 'Snake Game', type: 'Project', action: () => { this.windowManager.open('projects'); } },
            { title: 'Toggle Light/Dark Theme', type: 'Setting', action: () => this.themeManager.toggleTheme() },
            { title: 'Wallpaper: Nebula', type: 'Setting', action: () => this.wallpaperManager.setWallpaper('nebula') },
            { title: 'Wallpaper: Starry Night', type: 'Setting', action: () => this.wallpaperManager.setWallpaper('starry-night') },
            { title: 'Wallpaper: Black Hole', type: 'Setting', action: () => this.wallpaperManager.setWallpaper('black-hole') },
            { title: 'Wallpaper: Earth', type: 'Setting', action: () => this.wallpaperManager.setWallpaper('earth') }
        ];

        if (!this.modal) return;
        this.init();
    }

    init() {
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });

        this.triggerBtn?.addEventListener('click', () => this.open());

        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) this.close();
        });

        this.input?.addEventListener('input', () => this.renderResults());
        this.input?.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    isOpen() {
        return this.modal.classList.contains('visible');
    }

    toggle() {
        this.isOpen() ? this.close() : this.open();
    }

    open() {
        this.modal.classList.add('visible');
        this.modal.setAttribute('aria-hidden', 'false');
        if (this.input) {
            this.input.value = '';
            this.input.focus();
        }
        this.renderResults();
    }

    close() {
        this.modal.classList.remove('visible');
        this.modal.setAttribute('aria-hidden', 'true');
    }

    renderResults() {
        const query = this.input ? this.input.value.trim().toLowerCase() : '';
        this.items = query
            ? this.searchIndex.filter(item => item.title.toLowerCase().includes(query) || item.type.toLowerCase().includes(query))
            : this.searchIndex.slice(0, 7);

        this.selectedIndex = 0;
        this.resultsEl.innerHTML = '';

        if (this.items.length === 0) {
            this.resultsEl.innerHTML = '<div style="padding: 1rem; color: var(--text-light); text-align: center; font-size: 0.88rem;">No matching results found</div>';
            return;
        }

        this.items.forEach((item, index) => {
            const div = document.createElement('div');
            div.className = `spotlight-item ${index === 0 ? 'active' : ''}`;
            div.innerHTML = `
                <span class="spotlight-item-title">${item.title}</span>
                <span class="spotlight-item-type">${item.type}</span>
            `;
            div.addEventListener('click', () => {
                item.action();
                this.close();
            });
            this.resultsEl.appendChild(div);
        });
    }

    handleKeydown(e) {
        if (!this.items.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex + 1) % this.items.length;
            this.updateActiveItem();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.selectedIndex = (this.selectedIndex - 1 + this.items.length) % this.items.length;
            this.updateActiveItem();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.items[this.selectedIndex]) {
                this.items[this.selectedIndex].action();
                this.close();
            }
        }
    }

    updateActiveItem() {
        const elements = this.resultsEl.querySelectorAll('.spotlight-item');
        elements.forEach((el, index) => {
            el.classList.toggle('active', index === this.selectedIndex);
        });
    }
}

// macOS Control Center Panel Manager
class ControlCenterManager {
    constructor(themeManager, wallpaperManager) {
        this.panel = document.getElementById('notification-center');
        this.triggerBtn = document.getElementById('control-center-btn');
        this.closeBtn = document.getElementById('close-control-center');

        this.themeToggleTile = document.getElementById('cc-theme-toggle');
        this.wallpaperToggleTile = document.getElementById('cc-wallpaper-toggle');

        this.themeManager = themeManager;
        this.wallpaperManager = wallpaperManager;

        if (!this.panel) return;
        this.init();
    }

    init() {
        this.triggerBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        this.closeBtn?.addEventListener('click', () => this.close());

        this.themeToggleTile?.addEventListener('click', () => this.themeManager.toggleTheme());
        this.wallpaperToggleTile?.addEventListener('click', () => {
            const wallpapers = ['nebula', 'starry-night', 'black-hole', 'earth'];
            const current = localStorage.getItem('wallpaper') || 'nebula';
            const nextIndex = (wallpapers.indexOf(current) + 1) % wallpapers.length;
            this.wallpaperManager.setWallpaper(wallpapers[nextIndex]);
        });

        document.addEventListener('click', (e) => {
            if (this.isOpen() && !this.panel.contains(e.target) && !this.triggerBtn.contains(e.target)) {
                this.close();
            }
        });
    }

    isOpen() {
        return this.panel.classList.contains('visible');
    }

    toggle() {
        this.isOpen() ? this.close() : this.open();
    }

    open() {
        this.panel.classList.add('visible');
        this.panel.setAttribute('aria-hidden', 'false');
    }

    close() {
        this.panel.classList.remove('visible');
        this.panel.setAttribute('aria-hidden', 'true');
    }
}

// Projects Toolbar Search & Category Tag Filter
class ProjectFilterManager {
    constructor() {
        this.searchInput = document.getElementById('project-search-input');
        this.filterTags = document.querySelectorAll('.filter-tag');
        this.cards = document.querySelectorAll('.project-card');
        if (!this.cards.length) return;
        this.init();
    }

    init() {
        this.searchInput?.addEventListener('input', () => this.filterProjects());

        this.filterTags.forEach(tag => {
            tag.addEventListener('click', () => {
                this.filterTags.forEach(t => t.classList.remove('active'));
                tag.classList.add('active');
                this.filterProjects();
            });
        });
    }

    filterProjects() {
        const query = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';
        const activeTag = document.querySelector('.filter-tag.active');
        const category = activeTag ? activeTag.dataset.filter : 'all';

        this.cards.forEach(card => {
            const cardCat = card.dataset.category || '';
            const cardTech = card.dataset.tech || '';
            const cardText = card.textContent.toLowerCase();

            const matchesCategory = category === 'all' || cardCat.includes(category);
            const matchesQuery = !query || cardText.includes(query) || cardTech.includes(query);

            if (matchesCategory && matchesQuery) {
                card.style.display = 'flex';
                requestAnimationFrame(() => card.style.opacity = '1');
            } else {
                card.style.opacity = '0';
                card.style.display = 'none';
            }
        });
    }
}

// Contact Form Manager
class ContactFormManager {
    constructor() {
        this.form = document.getElementById('contactForm');
        this.status = document.getElementById('form-status');
        this.copyBtn = document.getElementById('copy-email-btn');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleFormSubmit(e));
            this.form.querySelectorAll('input, textarea').forEach(input => {
                input.addEventListener('input', () => {
                    input.closest('.form-group')?.classList.remove('has-error');
                });
            });
        }

        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', () => {
                navigator.clipboard.writeText('shreyahalder013@gmail.com').then(() => {
                    this.copyBtn.textContent = 'Copied!';
                    setTimeout(() => this.copyBtn.textContent = 'Copy', 2000);
                });
            });
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            subject: formData.get('subject'),
            message: formData.get('message')
        };

        this.clearFieldErrors();

        if (this.validateForm(data)) {
            this.submitForm(data);
        }
    }

    validateForm(data) {
        const errors = [];

        if (!data.name || !data.name.trim()) {
            errors.push({ field: 'name', message: 'Name is required' });
        }

        if (!data.email || !data.email.trim()) {
            errors.push({ field: 'email', message: 'Email is required' });
        } else if (!this.isValidEmail(data.email)) {
            errors.push({ field: 'email', message: 'Enter a valid email address' });
        }

        if (!data.subject || !data.subject.trim()) {
            errors.push({ field: 'subject', message: 'Subject is required' });
        }

        if (!data.message || !data.message.trim()) {
            errors.push({ field: 'message', message: 'Message is required' });
        }

        if (errors.length > 0) {
            this.showErrors(errors);
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    clearFieldErrors() {
        document.querySelectorAll('.form-group.has-error').forEach(group => {
            group.classList.remove('has-error');
        });
    }

    showErrors(errors) {
        errors.forEach(err => {
            const input = document.getElementById(err.field);
            if (input) {
                input.closest('.form-group').classList.add('has-error');
            }
        });

        this.setStatus(errors.map(e => e.message).join(' · '), 'error');
    }

    submitForm(data) {
        const submitButton = this.form.querySelector('button[type="submit"]');
        const originalText = submitButton ? submitButton.textContent : 'Send Message';

        if (submitButton) {
            submitButton.textContent = 'Opening mail app…';
            submitButton.disabled = true;
        }

        const recipient = 'shreyahalder013@gmail.com';
        const subject = `Portfolio Contact: ${data.subject}`;
        const body = `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`;
        const mailtoLink = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        const mailClient = window.open(mailtoLink, '_blank');
        if (!mailClient) {
            window.location.href = mailtoLink;
        }

        this.setStatus('Your email app should open with your message ready to send. If it does not, email me directly at shreyahalder013@gmail.com.', 'success');

        if (submitButton) {
            submitButton.textContent = originalText;
            submitButton.disabled = false;
        }

        this.form.reset();
    }

    setStatus(message, type) {
        if (!this.status) return;
        this.status.textContent = message;
        this.status.className = `form-status visible ${type}`;

        if (type === 'success') {
            setTimeout(() => {
                this.status.classList.remove('visible');
            }, 6000);
        }
    }
}

// Toast Manager
class ToastManager {
    constructor() {
        this.el = document.getElementById('toast');
        this.timeout = null;
    }

    show(message, duration = 2400) {
        if (!this.el) return;
        this.el.textContent = message;
        this.el.classList.add('visible');
        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            this.el.classList.remove('visible');
        }, duration);
    }
}

// Window Manager — open/close/minimize/maximize/drag/snap/resize
class WindowManager {
    constructor({ onOpen, onChange } = {}) {
        this.windows = new Map();
        this.zIndex = 50;
        this.topId = null;
        this.onOpen = onOpen || (() => {});
        this.onChange = onChange || (() => {});
        this.iconOpenAudio = null;
        this.snapPreview = document.getElementById('snap-preview');

        document.querySelectorAll('.window').forEach(el => {
            const id = el.dataset.window;
            this.windows.set(id, el);
            this.bindWindow(el, id);
        });

        document.querySelectorAll('[data-open]').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const isIconTrigger = trigger.classList.contains('desktop-icon') || trigger.classList.contains('dock-item');
                if (isIconTrigger) {
                    this.playIconOpenSound();
                }
                this.open(trigger.dataset.open);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.topId) {
                this.close(this.topId);
            }
        });
    }

    bindWindow(el, id) {
        el.addEventListener('pointerdown', () => this.focus(id));

        const closeBtn = el.querySelector('[data-close]');
        if (closeBtn) {
            closeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.close(id);
            });
        }

        const minBtn = el.querySelector('[data-minimize]');
        if (minBtn) {
            minBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.minimize(id);
            });
        }

        const maxBtn = el.querySelector('[data-maximize]');
        if (maxBtn) {
            maxBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleMaximize(id);
            });
        }

        const handle = el.querySelector('[data-drag-handle]');
        if (handle) {
            this.bindDrag(el, handle);
        }

        this.bindResizeHandles(el);
    }

    bindResizeHandles(el) {
        const handles = el.querySelectorAll('.resize-handle');
        handles.forEach(handle => {
            let startX, startY, startWidth, startHeight, startLeft, startTop;

            const onPointerDown = (e) => {
                if (el.classList.contains('maximized')) return;
                e.stopPropagation();
                e.preventDefault();

                startX = e.clientX;
                startY = e.clientY;
                const rect = el.getBoundingClientRect();
                const desktop = document.getElementById('desktop').getBoundingClientRect();

                startWidth = rect.width;
                startHeight = rect.height;
                startLeft = rect.left - desktop.left;
                startTop = rect.top - desktop.top;

                handle.setPointerCapture(e.pointerId);

                const onPointerMove = (moveEv) => {
                    const dx = moveEv.clientX - startX;
                    const dy = moveEv.clientY - startY;

                    if (handle.classList.contains('resize-handle-e') || handle.classList.contains('resize-handle-ne') || handle.classList.contains('resize-handle-se')) {
                        el.style.width = `${Math.max(340, startWidth + dx)}px`;
                    }
                    if (handle.classList.contains('resize-handle-s') || handle.classList.contains('resize-handle-se') || handle.classList.contains('resize-handle-sw')) {
                        el.style.height = `${Math.max(260, startHeight + dy)}px`;
                    }
                    if (handle.classList.contains('resize-handle-w') || handle.classList.contains('resize-handle-nw') || handle.classList.contains('resize-handle-sw')) {
                        const newWidth = Math.max(340, startWidth - dx);
                        if (newWidth > 340) {
                            el.style.width = `${newWidth}px`;
                            el.style.left = `${startLeft + dx}px`;
                        }
                    }
                    if (handle.classList.contains('resize-handle-n') || handle.classList.contains('resize-handle-nw') || handle.classList.contains('resize-handle-ne')) {
                        const newHeight = Math.max(260, startHeight - dy);
                        if (newHeight > 260) {
                            el.style.height = `${newHeight}px`;
                            el.style.top = `${startTop + dy}px`;
                        }
                    }
                };

                const onPointerUp = (upEv) => {
                    try { handle.releasePointerCapture(upEv.pointerId); } catch (err) {}
                    handle.removeEventListener('pointermove', onPointerMove);
                    handle.removeEventListener('pointerup', onPointerUp);
                };

                handle.addEventListener('pointermove', onPointerMove);
                handle.addEventListener('pointerup', onPointerUp);
            };

            handle.addEventListener('pointerdown', onPointerDown);
        });
    }

    bindDrag(el, handle) {
        let dragging = false;
        let startX = 0;
        let startY = 0;
        let origLeft = 0;
        let origTop = 0;
        let snapType = null;

        const onPointerDown = (e) => {
            if (isMobileLayout() || el.classList.contains('maximized')) return;
            if (e.target.closest('.tl')) return;

            const desktop = document.getElementById('desktop');
            const desktopRect = desktop.getBoundingClientRect();
            const rect = el.getBoundingClientRect();

            el.style.left = `${rect.left - desktopRect.left}px`;
            el.style.top = `${rect.top - desktopRect.top}px`;
            el.style.transform = 'none';

            origLeft = rect.left - desktopRect.left;
            origTop = rect.top - desktopRect.top;
            startX = e.clientX;
            startY = e.clientY;
            dragging = true;

            el.classList.add('dragging');
            handle.setPointerCapture(e.pointerId);
        };

        const onPointerMove = (e) => {
            if (!dragging) return;
            const desktop = document.getElementById('desktop');
            const desktopRect = desktop.getBoundingClientRect();

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            let newLeft = origLeft + dx;
            let newTop = origTop + dy;

            snapType = null;
            if (this.snapPreview) {
                if (e.clientX <= 15) {
                    snapType = 'left';
                    this.snapPreview.className = 'snap-preview snap-left';
                } else if (e.clientX >= window.innerWidth - 15) {
                    snapType = 'right';
                    this.snapPreview.className = 'snap-preview snap-right';
                } else if (e.clientY <= 45) {
                    snapType = 'max';
                    this.snapPreview.className = 'snap-preview snap-max';
                } else {
                    this.snapPreview.className = 'snap-preview';
                }
            }

            newLeft = Math.min(Math.max(newLeft, -el.offsetWidth + 140), desktopRect.width - 140);
            newTop = Math.min(Math.max(newTop, 0), desktopRect.height - 44);

            el.style.left = `${newLeft}px`;
            el.style.top = `${newTop}px`;
        };

        const onPointerUp = (e) => {
            if (!dragging) return;
            dragging = false;
            el.classList.remove('dragging');
            try { handle.releasePointerCapture(e.pointerId); } catch (err) {}

            if (this.snapPreview) {
                this.snapPreview.className = 'snap-preview';
            }

            if (snapType === 'left') {
                el.style.left = '8px';
                el.style.top = '44px';
                el.style.width = 'calc(50vw - 16px)';
                el.style.height = 'calc(100vh - 120px)';
            } else if (snapType === 'right') {
                el.style.left = 'calc(50vw + 8px)';
                el.style.top = '44px';
                el.style.width = 'calc(50vw - 16px)';
                el.style.height = 'calc(100vh - 120px)';
            } else if (snapType === 'max') {
                this.toggleMaximize(el.dataset.window);
            }
        };

        handle.addEventListener('pointerdown', onPointerDown);
        handle.addEventListener('pointermove', onPointerMove);
        handle.addEventListener('pointerup', onPointerUp);
        handle.addEventListener('pointercancel', onPointerUp);
    }

    playIconOpenSound() {
        if (prefersReducedMotion) return;
        try {
            if (!this.iconOpenAudio) {
                this.iconOpenAudio = new Audio('./assets/iconopen.mp3');
                this.iconOpenAudio.volume = 0.5;
            }
            this.iconOpenAudio.currentTime = 0;
            const playPromise = this.iconOpenAudio.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {});
            }
        } catch (err) {}
    }

    open(id) {
        const el = this.windows.get(id);
        if (!el) return;

        el.classList.remove('minimized');
        el.classList.add('open');
        el.setAttribute('aria-hidden', 'false');

        requestAnimationFrame(() => {
            el.classList.add('visible');
        });

        this.focus(id);
        this.onOpen(id);
        this.onChange();
    }

    close(id) {
        const el = this.windows.get(id);
        if (!el) return;

        el.classList.remove('visible');
        el.setAttribute('aria-hidden', 'true');

        const finish = () => {
            el.classList.remove('open');
            el.classList.remove('maximized');
        };

        if (prefersReducedMotion) {
            finish();
        } else {
            setTimeout(finish, 220);
        }

        if (this.topId === id) {
            this.topId = null;
        }
        this.updateActiveNav();
        this.onChange();
    }

    minimize(id) {
        const el = this.windows.get(id);
        if (!el) return;

        el.classList.remove('visible');
        el.classList.add('minimized');
        el.setAttribute('aria-hidden', 'true');

        if (this.topId === id) {
            this.topId = null;
        }
        this.updateActiveNav();
        this.onChange();
    }

    toggleMaximize(id) {
        const el = this.windows.get(id);
        if (!el) return;
        el.classList.toggle('maximized');
        this.focus(id);
    }

    focus(id) {
        const el = this.windows.get(id);
        if (!el || !el.classList.contains('open')) return;

        this.zIndex += 1;
        el.style.zIndex = this.zIndex;
        this.topId = id;
        this.updateActiveNav();
    }

    updateActiveNav() {
        document.querySelectorAll('.menubar-link').forEach(link => {
            link.classList.toggle('active', link.dataset.open === this.topId);
        });
    }

    getOpenIds() {
        return Array.from(this.windows.entries())
            .filter(([, el]) => el.classList.contains('open') && !el.classList.contains('minimized'))
            .map(([id]) => id);
    }

    closeAllWindows() {
        this.getOpenIds().forEach(id => this.close(id));
    }

    minimizeAll() {
        this.getOpenIds().forEach(id => this.minimize(id));
    }

    bringAllToFront() {
        const openIds = Array.from(this.windows.keys());
        openIds.forEach(id => {
            const el = this.windows.get(id);
            if (!el) return;
            el.classList.remove('minimized');
            el.classList.add('visible');
            this.zIndex += 1;
            el.style.zIndex = this.zIndex;
        });
        if (openIds.length) {
            this.topId = openIds[openIds.length - 1];
        }
        this.updateActiveNav();
        this.onChange();
    }
}

// Terminal CLI Manager
class TerminalManager {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.outputEl = document.getElementById('terminal-output');
        this.inputEl = document.getElementById('terminal-input');
        this.history = [];
        this.historyIndex = -1;

        if (!this.outputEl || !this.inputEl) return;
        this.init();
    }

    init() {
        this.printWelcome();

        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const command = this.inputEl.value.trim();
                if (command) {
                    this.history.push(command);
                    this.historyIndex = this.history.length;
                    this.execCommand(command);
                } else {
                    this.printLine('shreya@portfolio:~$', 'term-prompt-line');
                }
                this.inputEl.value = '';
                this.scrollToBottom();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.history.length && this.historyIndex > 0) {
                    this.historyIndex--;
                    this.inputEl.value = this.history[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.inputEl.value = this.history[this.historyIndex];
                } else {
                    this.historyIndex = this.history.length;
                    this.inputEl.value = '';
                }
            }
        });

        const terminalWin = document.querySelector('[data-window="terminal"]');
        if (terminalWin) {
            terminalWin.addEventListener('click', () => {
                this.focusInput();
            });
        }
    }

    focusInput() {
        setTimeout(() => this.inputEl?.focus(), 50);
    }

    printWelcome() {
        this.printLine("Welcome to Shreya's Interactive Terminal v1.0.0 (zsh)", 'term-info');
        this.printLine('Type "help" to see available commands or "projects" to view work.', 'term-muted');
        this.printLine('');
    }

    printLine(text, className = '') {
        const div = document.createElement('div');
        div.className = `term-line ${className}`;
        div.textContent = text;
        this.outputEl.appendChild(div);
    }

    printHTML(html, className = '') {
        const div = document.createElement('div');
        div.className = `term-line ${className}`;
        div.innerHTML = html;
        this.outputEl.appendChild(div);
    }

    scrollToBottom() {
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    execCommand(cmdLine) {
        const parts = cmdLine.split(' ').filter(Boolean);
        const cmd = parts[0]?.toLowerCase();
        const args = parts.slice(1);

        this.printLine(`shreya@portfolio:~$ ${cmdLine}`, 'term-prompt-line');

        switch (cmd) {
            case 'help':
                this.printLine('Available commands:', 'term-info');
                this.printLine('  help             Show this help menu');
                this.printLine('  finder           Launch Finder file explorer');
                this.printLine('  about            Display developer background');
                this.printLine('  projects         List portfolio projects');
                this.printLine('  skills           List technical & soft skills');
                this.printLine('  contact          Display contact information');
                this.printLine('  resume           Open or download resume');
                this.printLine('  github           Open GitHub profile');
                this.printLine('  linkedin         Open LinkedIn profile');
                this.printLine('  open [window]    Open window (finder, about, projects, skills, resume, contact)');
                this.printLine('  theme [dark|light] Set or toggle color theme');
                this.printLine('  wallpaper [name] Set wallpaper (nebula, starry-night, black-hole, earth)');
                this.printLine('  whoami           Display active user session');
                this.printLine('  date / time      Display current date & time');
                this.printLine('  clear / cls      Clear terminal screen');
                this.printLine('  echo [text]      Print text');
                this.printLine('  matrix           Enter the matrix');
                this.printLine('  sudo             Request root privileges');
                break;

            case 'finder':
                this.printLine('Opening Finder file explorer…', 'term-success');
                this.windowManager?.open('finder');
                break;

            case 'github':
                this.printLine('Opening GitHub profile…', 'term-success');
                window.open('https://github.com/shreyahalder01', '_blank');
                break;

            case 'linkedin':
                this.printLine('Opening LinkedIn profile…', 'term-success');
                window.open('https://www.linkedin.com/in/shreya-halder', '_blank');
                break;

            case 'about':
                this.printLine('Shreya Halder — Web Developer & MCA Student', 'term-info');
                this.printLine('BCA graduate (9.01 CGPA), currently pursuing MCA. Passionate about AI evaluation, prompt engineering, and full-stack web applications.');
                break;

            case 'projects':
                this.printLine('Selected Projects:', 'term-info');
                this.printHTML('1. <strong style="color:#a78bfa;">Morphix</strong> — Next.js Mixed-Media AI Video Studio (<a href="https://github.com/shreyahalder01/Morphix" target="_blank" rel="noopener" class="term-link">GitHub</a>)');
                this.printHTML('2. <strong style="color:#a78bfa;">Cyanotype</strong> — Browser Photo-to-Sunprint Filter (<a href="https://shreyahalder01.github.io/cyanotype/" target="_blank" rel="noopener" class="term-link">Live Demo</a>)');
                this.printHTML('3. <strong style="color:#a78bfa;">Aerophone</strong> — Creative Interactive UI Web Experience (<a href="https://shreyahalder01.github.io/Aerophone/" target="_blank" rel="noopener" class="term-link">Live Demo</a>)');
                this.printHTML('4. <strong style="color:#a78bfa;">Weather App</strong> — Real-time Weather App (<a href="https://shreyahalder01.github.io/Weather-App/" target="_blank" rel="noopener" class="term-link">Live Demo</a>)');
                this.printHTML('5. <strong style="color:#a78bfa;">Instagram Clone</strong> — UI Clone (<a href="https://shreyahalder01.github.io/Instagram-clone-using-HTML-and-CSS/" target="_blank" rel="noopener" class="term-link">Live Demo</a>)');
                this.printHTML('6. <strong style="color:#a78bfa;">Snake Game</strong> — Classic JS Game (<a href="https://shreyahalder01.github.io/snake-game/" target="_blank" rel="noopener" class="term-link">Live Demo</a>)');
                break;

            case 'skills':
                this.printLine('Technical Skills:', 'term-info');
                this.printLine('  • Python, HTML5, CSS3, JavaScript, Java, C');
                this.printLine('Soft Skills:', 'term-info');
                this.printLine('  • Communication, Creative Writing, Problem Solving, Team Collaboration');
                break;

            case 'contact':
                this.printLine('Get in touch:', 'term-info');
                this.printLine('  Email: shreyahalder013@gmail.com');
                this.printLine('  LinkedIn: https://www.linkedin.com/in/shreya-halder');
                this.printLine('  GitHub: https://github.com/shreyahalder01');
                break;

            case 'resume':
                this.printLine('Opening Resume preview window…', 'term-success');
                this.windowManager?.open('resume');
                break;

            case 'open':
                const winTarget = args[0]?.toLowerCase();
                if (['finder', 'about', 'projects', 'skills', 'resume', 'contact', 'terminal'].includes(winTarget)) {
                    this.printLine(`Opening ${winTarget} window…`, 'term-success');
                    this.windowManager?.open(winTarget);
                } else {
                    this.printLine(`Unknown window: ${winTarget || ''}. Valid: finder, about, projects, skills, resume, contact`, 'term-warn');
                }
                break;

            case 'theme':
                const targetTheme = args[0]?.toLowerCase();
                if (targetTheme === 'dark' || targetTheme === 'light') {
                    document.documentElement.setAttribute('data-theme', targetTheme);
                    localStorage.setItem('theme', targetTheme);
                    this.printLine(`Theme set to ${targetTheme}.`, 'term-success');
                } else {
                    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
                    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                    document.documentElement.setAttribute('data-theme', newTheme);
                    localStorage.setItem('theme', newTheme);
                    this.printLine(`Theme toggled to ${newTheme}.`, 'term-success');
                }
                break;

            case 'wallpaper':
                const wp = args[0]?.toLowerCase();
                const validWp = ['nebula', 'starry-night', 'black-hole', 'earth'];
                if (validWp.includes(wp)) {
                    const options = {
                        'nebula': "url('./assets/nebula-bg.jpg')",
                        'starry-night': "url('./assets/starry-night.jpg')",
                        'black-hole': "url('./assets/black-hole.jpg')",
                        'earth': "url('./assets/earth.jpg')"
                    };
                    document.documentElement.style.setProperty('--wallpaper-image', options[wp]);
                    document.documentElement.setAttribute('data-wallpaper', wp);
                    localStorage.setItem('wallpaper', wp);
                    this.printLine(`Wallpaper changed to ${wp}.`, 'term-success');
                } else {
                    this.printLine(`Invalid wallpaper. Available: nebula, starry-night, black-hole, earth`, 'term-warn');
                }
                break;

            case 'whoami':
                this.printLine('visitor@shreya-portfolio ~ (guest privileges)', 'term-muted');
                break;

            case 'date':
            case 'time':
                this.printLine(new Date().toString(), 'term-info');
                break;

            case 'clear':
            case 'cls':
                this.outputEl.innerHTML = '';
                break;

            case 'echo':
                this.printLine(args.join(' '));
                break;

            case 'sudo':
                this.printLine('Permission denied: User visitor is not in the sudoers file. This incident will be reported to Shreya. 🔒', 'term-error');
                break;

            case 'matrix':
                this.printLine('Wake up, Neo... The Matrix has you. 🟢', 'term-success');
                break;

            default:
                this.printLine(`Command not found: ${cmd}. Type "help" for a list of commands.`, 'term-error');
                break;
        }
    }
}

// Lock screen
class LockScreen {
    constructor(onUnlock) {
        this.el = document.getElementById('lockscreen');
        this.dateEl = document.getElementById('lock-date');
        this.clockEl = document.getElementById('lock-clock');
        this.tzEl = document.getElementById('lock-timezone');
        this.unlockBtn = document.getElementById('lock-unlock-btn');
        this.onUnlock = onUnlock || (() => {});
        this.unlocked = false;

        if (!this.el) {
            this.onUnlock();
            return;
        }

        this.init();
    }

    init() {
        this.updateTime();
        this.timer = setInterval(() => this.updateTime(), 1000);

        if (this.tzEl) {
            try {
                const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                this.tzEl.textContent = tz || 'LOCAL TIME';
            } catch (e) {
                this.tzEl.textContent = 'LOCAL TIME';
            }
        }

        this.el.addEventListener('click', () => this.unlock());
        this.unlockBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.unlock();
        });
        document.addEventListener('keydown', (e) => {
            if (!this.unlocked && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                this.unlock();
            }
        });
    }

    updateTime() {
        const now = new Date();
        if (this.clockEl) {
            this.clockEl.textContent = now.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            });
        }
        if (this.dateEl) {
            this.dateEl.textContent = now.toLocaleDateString([], {
                weekday: 'short',
                month: 'short',
                day: 'numeric'
            });
        }
    }

    playUnlockSound() {
        try {
            if (!this.unlockAudio) {
                this.unlockAudio = new Audio('./assets/unlock.mp3');
                this.unlockAudio.volume = 0.6;
            }
            this.unlockAudio.currentTime = 0;
            const playPromise = this.unlockAudio.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(() => {});
            }
        } catch (err) {}
    }

    unlock() {
        if (this.unlocked) return;
        this.unlocked = true;
        clearInterval(this.timer);

        if (!prefersReducedMotion) {
            this.playUnlockSound();
        }

        this.el.classList.add('unlocking');
        this.el.setAttribute('aria-hidden', 'true');

        const finish = () => { this.el.style.display = 'none'; };
        if (prefersReducedMotion) {
            finish();
        } else {
            setTimeout(finish, 600);
        }

        this.onUnlock();
    }
}

// Welcome modal
class WelcomeModal {
    constructor() {
        this.overlay = document.getElementById('welcome-overlay');
        this.closeBtn = document.getElementById('welcome-close');
        if (!this.overlay) return;

        this.init();
    }

    init() {
        this.closeBtn?.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.overlay.classList.contains('visible')) {
                this.close();
            }
        });
    }

    maybeOpen() {
        const alreadySeen = sessionStorage.getItem('welcomeSeen');
        if (!alreadySeen) {
            this.open();
        }
    }

    open() {
        this.overlay.setAttribute('aria-hidden', 'false');
        requestAnimationFrame(() => this.overlay.classList.add('visible'));
        this.closeBtn?.focus();
        sessionStorage.setItem('welcomeSeen', '1');
    }

    close() {
        this.overlay.classList.remove('visible');
        this.overlay.setAttribute('aria-hidden', 'true');
    }
}

// Trash Manager
class TrashManager {
    constructor(toast) {
        this.toast = toast;
        this.emptyBtn = document.getElementById('empty-trash-btn');
        this.fileGrid = document.getElementById('trash-file-grid');
        this.emptyState = document.getElementById('trash-empty-state');
        this.titleEl = document.getElementById('trash-window-title');
        this.countLabel = document.getElementById('trash-count-label');
        this.init();
    }

    init() {
        this.emptyBtn?.addEventListener('click', () => this.empty());

        document.querySelectorAll('.trash-item-card').forEach(card => {
            card.addEventListener('click', () => {
                const easterEgg = card.dataset.easteregg;
                if (easterEgg && this.toast) {
                    this.toast.show(easterEgg, 3200);
                }
            });
        });
    }

    empty() {
        if (this.fileGrid) {
            this.fileGrid.style.opacity = '0';
            setTimeout(() => {
                this.fileGrid.style.display = 'none';
                if (this.emptyState) this.emptyState.style.display = 'flex';
                if (this.titleEl) this.titleEl.textContent = 'Trash — Empty';
                if (this.countLabel) this.countLabel.textContent = 'Trash is empty';
            }, 250);
        }
        if (this.toast) {
            this.toast.show('Trash emptied cleanly! 🌿 All easter eggs recycled.');
        }
    }
}

// Window Menu Manager
class WindowMenuManager {
    constructor(windowManager) {
        this.windowManager = windowManager;
        this.menu = document.querySelector('[data-menu]');
        if (!this.menu) return;

        this.trigger = this.menu.querySelector('[data-menu-trigger]');
        this.dropdown = this.menu.querySelector('.menubar-menu-dropdown');
        this.open = false;

        this.init();
    }

    init() {
        this.trigger?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        this.dropdown?.querySelectorAll('[data-window-action]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                this.runAction(item.dataset.windowAction);
                this.close();
            });
        });

        document.addEventListener('click', (e) => {
            if (this.open && !this.menu.contains(e.target)) {
                this.close();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.open) {
                this.close();
            }
        });
    }

    runAction(action) {
        if (!this.windowManager) return;
        if (action === 'open-finder') {
            this.windowManager.open('finder');
        } else if (action === 'close-all') {
            this.windowManager.closeAllWindows();
        } else if (action === 'minimize-all') {
            this.windowManager.minimizeAll();
        } else if (action === 'front-all') {
            this.windowManager.bringAllToFront();
        }
    }

    toggle() {
        this.open ? this.close() : this.openMenu();
    }

    openMenu() {
        this.open = true;
        this.dropdown?.classList.add('visible');
        this.dropdown?.setAttribute('aria-hidden', 'false');
        this.trigger?.setAttribute('aria-expanded', 'true');
    }

    close() {
        this.open = false;
        this.dropdown?.classList.remove('visible');
        this.dropdown?.setAttribute('aria-hidden', 'true');
        this.trigger?.setAttribute('aria-expanded', 'false');
    }
}

// Main Application Coordinator
class PortfolioApp {
    constructor() {
        this.init();
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeApp());
        } else {
            this.initializeApp();
        }
    }

    initializeApp() {
        this.themeManager = new ThemeManager();
        this.wallpaperManager = new WallpaperManager();
        this.parallaxWallpaperManager = new ParallaxWallpaperManager();
        this.audioManager = new AudioManager();
        this.systemStatusManager = new SystemStatusManager();
        this.clockManager = new ClockManager();
        this.skillsAnimationManager = new SkillsAnimationManager();
        this.contactFormManager = new ContactFormManager();
        this.projectFilterManager = new ProjectFilterManager();
        this.githubWidget = new GitHubActivityWidget();
        this.toastManager = new ToastManager();
        this.trashManager = new TrashManager(this.toastManager);

        this.windowManager = new WindowManager({
            onOpen: (id) => {
                if (id === 'skills') {
                    this.skillsAnimationManager.animate();
                } else if (id === 'terminal') {
                    this.terminalManager?.focusInput();
                }
            },
            onChange: () => {
                this.dockManager?.updateRunningIndicators(this.windowManager.getOpenIds());
            }
        });

        this.finderManager = new FinderManager(this.windowManager);
        this.desktopIconManager = new DesktopIconManager(this.windowManager);
        this.dockManager = new DockManager(this.windowManager);
        this.spotlightManager = new SpotlightManager(this.windowManager, this.wallpaperManager, this.themeManager);
        this.controlCenterManager = new ControlCenterManager(this.themeManager, this.wallpaperManager);
        this.terminalManager = new TerminalManager(this.windowManager);
        this.windowMenuManager = new WindowMenuManager(this.windowManager);

        this.bootScreen = new BootScreenManager(() => {
            this.lockScreen = new LockScreen(() => {
                setTimeout(() => this.welcomeModal?.maybeOpen(), prefersReducedMotion ? 150 : 500);
            });
            this.welcomeModal = new WelcomeModal();
        });
    }
}

// Initialize the application
const app = new PortfolioApp();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ThemeManager,
        WallpaperManager,
        ParallaxWallpaperManager,
        AudioManager,
        BootScreenManager,
        SystemStatusManager,
        ClockManager,
        SkillsAnimationManager,
        ContactFormManager,
        ToastManager,
        WindowManager,
        DockManager,
        SpotlightManager,
        ControlCenterManager,
        ProjectFilterManager,
        FinderManager,
        DesktopIconManager,
        GitHubActivityWidget,
        TerminalManager,
        WindowMenuManager,
        TrashManager,
        PortfolioApp
    };
}

// Keyboard navigation affordance
document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
    }
});

document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-navigation');
});