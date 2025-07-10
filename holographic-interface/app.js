// Holographic Interface JavaScript
class HolographicInterface {
    constructor() {
        this.particles = [];
        this.mouseX = 0;
        this.mouseY = 0;
        this.currentPanel = 'status';
        this.isLoaded = false;
        this.panelTitles = {
            'status': 'SYSTEM STATUS',
            'analysis': 'DATA ANALYSIS',
            'controls': 'CONTROLS',
            'settings': 'SETTINGS'
        };
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.startLoadingSequence();
        this.createParticles();
        this.updateTimestamp();
        this.initializeProgressBars();
    }

    bindEvents() {
        // Mouse movement tracking
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            this.updateParticles();
        });

        // Navigation events
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchPanel(item.dataset.panel);
            });
        });

        // Button hover effects
        document.querySelectorAll('.holo-button').forEach(button => {
            button.addEventListener('mouseenter', () => {
                this.createButtonParticles(button);
            });
            
            button.addEventListener('click', (e) => {
                this.addGlitchEffect(button);
            });
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    startLoadingSequence() {
        const loadingScreen = document.getElementById('loadingScreen');
        const hologramContainer = document.getElementById('hologramContainer');
        
        // Extend loading time to make it more visible
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            hologramContainer.classList.add('active');
            this.isLoaded = true;
            this.startSystemAnimations();
        }, 4000); // Increased from 3000 to 4000ms
    }

    createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 50;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // Random initial position
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            
            // Random animation delay
            particle.style.animationDelay = Math.random() * 6 + 's';
            particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
            
            particlesContainer.appendChild(particle);
            this.particles.push(particle);
        }
    }

    updateParticles() {
        if (!this.isLoaded) return;

        this.particles.forEach((particle, index) => {
            const rect = particle.getBoundingClientRect();
            const particleX = rect.left + rect.width / 2;
            const particleY = rect.top + rect.height / 2;
            
            const distance = Math.sqrt(
                Math.pow(this.mouseX - particleX, 2) + 
                Math.pow(this.mouseY - particleY, 2)
            );

            if (distance < 100) {
                const intensity = (100 - distance) / 100;
                particle.style.opacity = intensity;
                particle.style.transform = `scale(${1 + intensity * 0.5})`;
                particle.style.boxShadow = `0 0 ${intensity * 20}px rgba(0, 255, 255, ${intensity})`;
            } else {
                particle.style.opacity = 0.6;
                particle.style.transform = 'scale(1)';
                particle.style.boxShadow = '0 0 4px rgba(0, 255, 255, 0.8)';
            }
        });
    }

    createButtonParticles(button) {
        const rect = button.getBoundingClientRect();
        const particleCount = 10;

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.style.position = 'absolute';
            particle.style.left = rect.left + Math.random() * rect.width + 'px';
            particle.style.top = rect.top + Math.random() * rect.height + 'px';
            particle.style.width = '2px';
            particle.style.height = '2px';
            particle.style.background = '#00ffff';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';
            particle.style.boxShadow = '0 0 6px rgba(0, 255, 255, 0.8)';
            
            document.body.appendChild(particle);

            // Animate particle
            particle.animate([
                { 
                    transform: 'translate(0, 0) scale(1)',
                    opacity: 1
                },
                { 
                    transform: `translate(${(Math.random() - 0.5) * 100}px, ${(Math.random() - 0.5) * 100}px) scale(0)`,
                    opacity: 0
                }
            ], {
                duration: 800,
                easing: 'ease-out'
            }).onfinish = () => {
                particle.remove();
            };
        }
    }

    switchPanel(panelId) {
        if (this.currentPanel === panelId) return;

        // Remove active class from all panels and nav items
        document.querySelectorAll('.center-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });

        // Add active class to selected panel and nav item
        const targetPanel = document.getElementById(panelId + 'Panel');
        const targetNavItem = document.querySelector(`[data-panel="${panelId}"]`);
        
        if (targetPanel && targetNavItem) {
            targetPanel.classList.add('active');
            targetNavItem.classList.add('active');
            
            // Update panel title
            const panelTitle = targetPanel.querySelector('.panel-title');
            if (panelTitle) {
                panelTitle.textContent = this.panelTitles[panelId];
            }
        }

        this.currentPanel = panelId;

        // Trigger panel-specific animations
        this.animatePanel(panelId);
    }

    animatePanel(panelId) {
        const panel = document.getElementById(panelId + 'Panel');
        if (!panel) return;
        
        // Add entrance animation
        panel.style.transform = 'translateX(100%)';
        panel.style.opacity = '0';
        
        requestAnimationFrame(() => {
            panel.style.transition = 'all 0.5s ease';
            panel.style.transform = 'translateX(0)';
            panel.style.opacity = '1';
        });

        // Panel-specific animations
        switch(panelId) {
            case 'status':
                this.animateStatusBars();
                break;
            case 'analysis':
                this.animateCircularProgress();
                break;
            case 'controls':
                this.animateControlButtons();
                break;
            case 'settings':
                this.animateSettingsValues();
                break;
        }
    }

    animateStatusBars() {
        setTimeout(() => {
            const statusBars = document.querySelectorAll('#statusPanel .status-fill');
            statusBars.forEach((bar, index) => {
                const targetWidth = bar.style.width;
                bar.style.width = '0%';
                setTimeout(() => {
                    bar.style.transition = 'width 1s ease-out';
                    bar.style.width = targetWidth;
                }, index * 200);
            });
        }, 100);
    }

    animateCircularProgress() {
        setTimeout(() => {
            const progressElements = document.querySelectorAll('#analysisPanel .circular-progress');
            progressElements.forEach((element, index) => {
                const value = element.dataset.value;
                const fill = element.querySelector('.progress-fill');
                const angle = (value / 100) * 360;
                
                fill.style.setProperty('--progress-angle', '0deg');
                fill.style.animation = 'none';
                
                setTimeout(() => {
                    fill.style.setProperty('--progress-angle', angle + 'deg');
                    fill.style.animation = 'progressFill 2s ease-out forwards';
                }, index * 300);
            });
        }, 100);
    }

    animateControlButtons() {
        setTimeout(() => {
            const buttons = document.querySelectorAll('#controlsPanel .holo-button');
            buttons.forEach((button, index) => {
                button.style.transform = 'translateY(20px)';
                button.style.opacity = '0';
                
                setTimeout(() => {
                    button.style.transition = 'all 0.5s ease';
                    button.style.transform = 'translateY(0)';
                    button.style.opacity = '1';
                }, index * 150);
            });
        }, 100);
    }

    animateSettingsValues() {
        setTimeout(() => {
            const values = document.querySelectorAll('#settingsPanel .setting-value');
            values.forEach((value, index) => {
                const originalText = value.textContent;
                value.textContent = '---';
                
                setTimeout(() => {
                    value.style.transition = 'all 0.3s ease';
                    value.textContent = originalText;
                    value.style.textShadow = '0 0 20px currentColor';
                }, index * 200);
            });
        }, 100);
    }

    initializeProgressBars() {
        // Set up circular progress bars
        const progressBars = document.querySelectorAll('.circular-progress');
        progressBars.forEach(bar => {
            const value = bar.dataset.value;
            const fill = bar.querySelector('.progress-fill');
            if (fill) {
                const angle = (value / 100) * 360;
                fill.style.setProperty('--progress-angle', angle + 'deg');
            }
        });
    }

    startSystemAnimations() {
        // Start continuous animations
        this.animateSystemMetrics();
        this.animateHolographicEffects();
        
        // Animate initial panel
        this.animatePanel('status');
        
        // Update metrics periodically
        setInterval(() => {
            this.updateSystemMetrics();
        }, 5000);
    }

    animateSystemMetrics() {
        const metrics = document.querySelectorAll('.metric-value');
        metrics.forEach((metric, index) => {
            setTimeout(() => {
                metric.style.animation = 'pulse 2s ease-in-out infinite';
            }, index * 500);
        });
    }

    animateHolographicEffects() {
        // Add floating animation to various elements
        const floatingElements = document.querySelectorAll('.status-card, .data-viz, .holo-button');
        floatingElements.forEach((element, index) => {
            element.style.animation = `float ${6 + Math.random() * 4}s ease-in-out infinite`;
            element.style.animationDelay = Math.random() * 2 + 's';
        });
    }

    updateSystemMetrics() {
        const metrics = [
            { selector: '.metric-value', values: ['67%', '43%', '88%', '72%'] },
            { selector: '.status-value', values: ['89%', '76%', '94%', '83%'] },
            { selector: '.indicator-value', values: ['89%', '94%', '83%'] }
        ];

        metrics.forEach(metric => {
            const elements = document.querySelectorAll(metric.selector);
            elements.forEach((element, index) => {
                if (Math.random() < 0.3) { // 30% chance to update
                    const currentValue = parseInt(element.textContent);
                    const variation = Math.floor(Math.random() * 6) - 3; // -3 to +3
                    const newValue = Math.max(0, Math.min(100, currentValue + variation));
                    
                    element.style.transition = 'all 0.5s ease';
                    element.textContent = newValue + '%';
                    element.style.textShadow = '0 0 20px currentColor';
                    
                    setTimeout(() => {
                        element.style.textShadow = '0 0 10px currentColor';
                    }, 500);
                }
            });
        });
    }

    updateTimestamp() {
        const timestampElement = document.getElementById('timestamp');
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleTimeString('en-US', { 
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            timestampElement.textContent = `${timeString} UTC`;
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    handleResize() {
        // Recreate particles for new screen size
        const particlesContainer = document.getElementById('particles');
        particlesContainer.innerHTML = '';
        this.particles = [];
        this.createParticles();
    }

    // Add glitch effect
    addGlitchEffect(element) {
        element.style.animation = 'glitch 0.3s ease-in-out';
        setTimeout(() => {
            element.style.animation = '';
        }, 300);
    }

    // Add scan line effect
    addScanLineEffect(element) {
        const scanLine = document.createElement('div');
        scanLine.className = 'scan-line-effect';
        scanLine.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, #00ffff, transparent);
            animation: scanLine 2s linear infinite;
            z-index: 10;
        `;
        element.appendChild(scanLine);
        
        setTimeout(() => {
            scanLine.remove();
        }, 2000);
    }
}

// Additional CSS animations via JavaScript
const additionalStyles = `
    @keyframes glitch {
        0% { transform: translate(0); }
        20% { transform: translate(-2px, 2px); }
        40% { transform: translate(-2px, -2px); }
        60% { transform: translate(2px, 2px); }
        80% { transform: translate(2px, -2px); }
        100% { transform: translate(0); }
    }

    @keyframes dataFlow {
        0% { transform: translateX(-100%); opacity: 0; }
        50% { opacity: 1; }
        100% { transform: translateX(100%); opacity: 0; }
    }

    @keyframes hologramFlicker {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.8; }
    }

    .holo-button:active {
        transform: scale(0.95);
        box-shadow: 0 0 40px rgba(0, 255, 255, 0.8);
    }

    .status-card:hover .status-fill {
        animation: statusPulse 1s ease-in-out infinite;
    }

    @keyframes statusPulse {
        0%, 100% { box-shadow: 0 0 10px rgba(0, 255, 255, 0.8); }
        50% { box-shadow: 0 0 20px rgba(0, 255, 255, 1); }
    }

    .nav-button:active {
        transform: scale(0.98);
    }

    .circular-progress:hover {
        transform: scale(1.05);
        transition: transform 0.3s ease;
    }

    .metric-item:hover .metric-value {
        animation: valueGlow 0.5s ease-in-out;
    }

    @keyframes valueGlow {
        0% { text-shadow: 0 0 8px currentColor; }
        50% { text-shadow: 0 0 20px currentColor; }
        100% { text-shadow: 0 0 8px currentColor; }
    }

    /* Improve panel transitions */
    .center-panel {
        transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    }

    .center-panel:not(.active) {
        transform: translateX(100%);
        opacity: 0;
    }

    .center-panel.active {
        transform: translateX(0);
        opacity: 1;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize the holographic interface
document.addEventListener('DOMContentLoaded', () => {
    new HolographicInterface();
});

// Add performance monitoring
const performanceMonitor = {
    fps: 0,
    lastTime: performance.now(),
    
    update() {
        const now = performance.now();
        const delta = now - this.lastTime;
        this.fps = Math.round(1000 / delta);
        this.lastTime = now;
        
        // Optimize if FPS drops below 30
        if (this.fps < 30) {
            document.body.classList.add('low-performance');
        } else {
            document.body.classList.remove('low-performance');
        }
        
        requestAnimationFrame(() => this.update());
    }
};

// Add low performance optimizations
const lowPerformanceStyles = `
    .low-performance .particle {
        animation: none !important;
        opacity: 0.3 !important;
    }
    
    .low-performance .scan-line,
    .low-performance .panel-scan,
    .low-performance .footer-scan {
        animation: none !important;
    }
    
    .low-performance .title-glow {
        animation: none !important;
    }
`;

const perfStyleSheet = document.createElement('style');
perfStyleSheet.textContent = lowPerformanceStyles;
document.head.appendChild(perfStyleSheet);

// Start performance monitoring
performanceMonitor.update();

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '4') {
        const panels = ['status', 'analysis', 'controls', 'settings'];
        const panelIndex = parseInt(e.key) - 1;
        if (panels[panelIndex]) {
            document.querySelector(`[data-panel="${panels[panelIndex]}"]`).click();
        }
    }
});

// Add touch support for mobile
document.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    document.dispatchEvent(mouseEvent);
});

// Preload and cache resources
const preloadResources = () => {
    const resources = [
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJMMTMuMDkgOC4yNkwyMCA5TDEzLjA5IDE1Ljc0TDEyIDIyTDEwLjkxIDE1Ljc0TDQgOUwxMC45MSA4LjI2TDEyIDJaIiBmaWxsPSJjdXJyZW50Q29sb3IiLz4KPC9zdmc+'
    ];
    
    resources.forEach(src => {
        const img = new Image();
        img.src = src;
    });
};

preloadResources();