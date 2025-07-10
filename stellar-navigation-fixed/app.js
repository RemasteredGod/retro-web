import * as THREE from 'three';
import { FlyControls } from 'three/addons/controls/FlyControls.js';

class StellarNavigationApp {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.canvas = null;
        this.clock = new THREE.Clock();
        
        // Navigation state
        this.stars = [];
        this.waypoints = [];
        this.currentWaypoint = null;
        this.autopilotActive = false;
        this.autopilotTarget = null;
        this.lastPosition = new THREE.Vector3();
        this.speed = 0;
        
        // UI elements
        this.hud = null;
        this.minimap = null;
        this.minimapCanvas = null;
        this.minimapRenderer = null;
        this.minimapCamera = null;
        this.minimapVisible = false;
        
        // Error handling
        this.initialized = false;
        this.contextLost = false;
        
        // Raycasting for waypoint placement
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        
        this.init();
    }

    async init() {
        try {
            console.log('Initializing Stellar Navigation System...');
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            this.setupCanvas();
            this.setupScene();
            this.setupCamera();
            this.setupRenderer();
            this.setupControls();
            this.setupLights();
            this.createStarField();
            this.setupEventListeners();
            this.setupHUD();
            this.setupMinimap();
            
            this.hideLoadingScreen();
            this.showHUD();
            this.startRenderLoop();
            
            this.initialized = true;
            console.log('Stellar Navigation System initialized successfully!');
            
        } catch (error) {
            console.error('Initialization failed:', error);
            this.showError('Failed to initialize 3D environment: ' + error.message);
        }
    }

    setupCanvas() {
        this.canvas = document.getElementById('canvas');
        if (!this.canvas) {
            throw new Error('Canvas element not found');
        }
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000011);
        this.scene.fog = new THREE.Fog(0x000011, 1000, 50000);
    }

    setupCamera() {
        const aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 100000);
        this.camera.position.set(0, 0, 1000);
        this.lastPosition.copy(this.camera.position);
    }

    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas,
            antialias: true,
            alpha: false
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Handle WebGL context loss
        this.canvas.addEventListener('webglcontextlost', (e) => {
            e.preventDefault();
            this.contextLost = true;
            console.warn('WebGL context lost');
            this.showError('Graphics context lost. Please refresh the page.');
        });
        
        this.canvas.addEventListener('webglcontextrestored', () => {
            this.contextLost = false;
            console.log('WebGL context restored');
            this.init();
        });
    }

    setupControls() {
        // Initialize FlyControls AFTER DOM is loaded
        this.controls = new FlyControls(this.camera, this.renderer.domElement);
        this.controls.movementSpeed = 1000;
        this.controls.rollSpeed = Math.PI / 12;
        this.controls.autoForward = false;
        this.controls.dragToLook = true;
        
        // Ensure proper focus handling
        this.renderer.domElement.tabIndex = 0;
        this.renderer.domElement.focus();
    }

    setupLights() {
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
    }

    createStarField() {
        console.log('Generating star field...');
        
        // Create star field with 20,000 stars
        const starCount = 20000;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);
        const sizes = new Float32Array(starCount);
        
        const starColor = new THREE.Color();
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Random position in spherical distribution
            const radius = Math.random() * 40000 + 5000;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            
            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);
            
            // Vary star colors slightly
            const hue = 0.6 + Math.random() * 0.1; // Blue-white stars
            const saturation = Math.random() * 0.3;
            const lightness = 0.8 + Math.random() * 0.2;
            
            starColor.setHSL(hue, saturation, lightness);
            colors[i3] = starColor.r;
            colors[i3 + 1] = starColor.g;
            colors[i3 + 2] = starColor.b;
            
            sizes[i] = Math.random() * 3 + 1;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
        
        const material = new THREE.PointsMaterial({
            size: 2,
            sizeAttenuation: true,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });
        
        const stars = new THREE.Points(geometry, material);
        this.scene.add(stars);
        this.stars.push(stars);
        
        console.log(`Created ${starCount} stars`);
    }

    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => this.onWindowResize());
        
        // Mouse click for waypoint placement
        this.renderer.domElement.addEventListener('click', (e) => this.onMouseClick(e));
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.onKeyDown(e));
        
        // Retry button
        const retryBtn = document.getElementById('retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.hideError();
                this.init();
            });
        }
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        if (this.minimapRenderer) {
            this.minimapRenderer.setSize(200, 200);
        }
    }

    onMouseClick(event) {
        if (this.autopilotActive) return;
        
        // Calculate mouse position in normalized device coordinates
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        // Create waypoint in 3D space
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const distance = 5000; // Fixed distance for waypoint placement
        const direction = this.raycaster.ray.direction.clone();
        const waypointPosition = this.camera.position.clone().add(direction.multiplyScalar(distance));
        
        this.createWaypoint(waypointPosition);
    }

    onKeyDown(event) {
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.toggleAutopilot();
                break;
            case 'Escape':
                this.clearWaypoints();
                break;
            case 'KeyM':
                this.toggleMinimap();
                break;
        }
    }

    createWaypoint(position) {
        // Clear existing waypoints
        this.clearWaypoints();
        
        // Create waypoint marker
        const geometry = new THREE.SphereGeometry(50, 16, 16);
        const material = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.8
        });
        
        const waypoint = new THREE.Mesh(geometry, material);
        waypoint.position.copy(position);
        
        // Add glow effect
        const glowGeometry = new THREE.SphereGeometry(100, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.3
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.copy(position);
        
        this.scene.add(waypoint);
        this.scene.add(glow);
        
        this.waypoints.push(waypoint, glow);
        this.currentWaypoint = position.clone();
        
        this.updateWaypointInfo();
        console.log('Waypoint created at:', position);
    }

    clearWaypoints() {
        this.waypoints.forEach(waypoint => {
            this.scene.remove(waypoint);
        });
        this.waypoints = [];
        this.currentWaypoint = null;
        this.autopilotActive = false;
        this.autopilotTarget = null;
        this.updateWaypointInfo();
        this.updateModeDisplay();
    }

    toggleAutopilot() {
        if (!this.currentWaypoint) {
            console.log('No waypoint set for autopilot');
            return;
        }
        
        this.autopilotActive = !this.autopilotActive;
        if (this.autopilotActive) {
            this.autopilotTarget = this.currentWaypoint.clone();
            console.log('Autopilot engaged');
        } else {
            this.autopilotTarget = null;
            console.log('Autopilot disengaged');
        }
        
        this.updateModeDisplay();
    }

    updateAutopilot(delta) {
        if (!this.autopilotActive || !this.autopilotTarget) return;
        
        const targetDistance = this.camera.position.distanceTo(this.autopilotTarget);
        
        // Disengage autopilot when close to target
        if (targetDistance < 200) {
            this.autopilotActive = false;
            this.autopilotTarget = null;
            this.updateModeDisplay();
            console.log('Autopilot disengaged - target reached');
            return;
        }
        
        // Smooth interpolation towards target
        const lerpFactor = Math.min(delta * 0.5, 1);
        this.camera.position.lerp(this.autopilotTarget, lerpFactor);
        
        // Look at target
        this.camera.lookAt(this.autopilotTarget);
    }

    toggleMinimap() {
        this.minimapVisible = !this.minimapVisible;
        const minimap = document.getElementById('minimap');
        if (minimap) {
            minimap.classList.toggle('hidden', !this.minimapVisible);
        }
    }

    setupHUD() {
        this.hud = document.getElementById('hud');
    }

    setupMinimap() {
        this.minimapCanvas = document.getElementById('minimap-canvas');
        if (!this.minimapCanvas) return;
        
        this.minimapRenderer = new THREE.WebGLRenderer({
            canvas: this.minimapCanvas,
            alpha: true
        });
        this.minimapRenderer.setSize(200, 200);
        
        this.minimapCamera = new THREE.OrthographicCamera(-5000, 5000, 5000, -5000, 1, 50000);
        this.minimapCamera.position.set(0, 10000, 0);
        this.minimapCamera.lookAt(0, 0, 0);
    }

    updateHUD() {
        if (!this.camera) return;
        
        const pos = this.camera.position;
        const speed = this.speed;
        
        // Update position display
        const posX = document.getElementById('pos-x');
        const posY = document.getElementById('pos-y');
        const posZ = document.getElementById('pos-z');
        const speedEl = document.getElementById('speed');
        
        if (posX) posX.textContent = (pos.x / 1000).toFixed(1) + ' AU';
        if (posY) posY.textContent = (pos.y / 1000).toFixed(1) + ' AU';
        if (posZ) posZ.textContent = (pos.z / 1000).toFixed(1) + ' AU';
        if (speedEl) speedEl.textContent = speed.toFixed(1) + ' AU/s';
    }

    updateModeDisplay() {
        const modeEl = document.getElementById('mode');
        if (modeEl) {
            modeEl.textContent = this.autopilotActive ? 'AUTOPILOT' : 'MANUAL';
            modeEl.style.color = this.autopilotActive ? '#ffff00' : '#00ffff';
        }
    }

    updateWaypointInfo() {
        const waypointInfo = document.getElementById('waypoint-info');
        if (!waypointInfo) return;
        
        if (this.currentWaypoint) {
            const distance = this.camera.position.distanceTo(this.currentWaypoint);
            waypointInfo.innerHTML = `
                <p>WAYPOINT ACTIVE</p>
                <p>Distance: ${(distance / 1000).toFixed(1)} AU</p>
                <p>Press SPACEBAR for autopilot</p>
            `;
        } else {
            waypointInfo.innerHTML = `
                <p>Click to place waypoint</p>
                <p>Press SPACEBAR for autopilot</p>
                <p>Press ESC to clear waypoints</p>
            `;
        }
    }

    calculateSpeed() {
        const currentPos = this.camera.position.clone();
        const deltaPos = currentPos.distanceTo(this.lastPosition);
        const deltaTime = this.clock.getDelta();
        
        this.speed = deltaTime > 0 ? (deltaPos / deltaTime) / 1000 : 0; // Convert to AU/s
        this.lastPosition.copy(currentPos);
    }

    renderMinimap() {
        if (!this.minimapVisible || !this.minimapRenderer || !this.minimapCamera) return;
        
        // Update minimap camera to follow main camera
        this.minimapCamera.position.x = this.camera.position.x;
        this.minimapCamera.position.z = this.camera.position.z;
        
        this.minimapRenderer.render(this.scene, this.minimapCamera);
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 500);
        }
    }

    showHUD() {
        if (this.hud) {
            this.hud.classList.remove('hidden');
        }
    }

    showError(message) {
        const errorMessage = document.getElementById('error-message');
        const errorText = document.getElementById('error-text');
        
        if (errorMessage && errorText) {
            errorText.textContent = message;
            errorMessage.classList.remove('hidden');
        }
        
        console.error('Application Error:', message);
    }

    hideError() {
        const errorMessage = document.getElementById('error-message');
        if (errorMessage) {
            errorMessage.classList.add('hidden');
        }
    }

    startRenderLoop() {
        const animate = () => {
            if (this.contextLost) return;
            
            requestAnimationFrame(animate);
            
            try {
                const delta = this.clock.getDelta();
                
                // Update controls with delta time
                if (this.controls) {
                    this.controls.update(delta);
                }
                
                // Update autopilot
                this.updateAutopilot(delta);
                
                // Calculate speed
                this.calculateSpeed();
                
                // Update HUD
                this.updateHUD();
                this.updateWaypointInfo();
                
                // Render main scene
                if (this.renderer && this.scene && this.camera) {
                    this.renderer.render(this.scene, this.camera);
                }
                
                // Render minimap
                this.renderMinimap();
                
            } catch (error) {
                console.error('Render loop error:', error);
                this.showError('Rendering error: ' + error.message);
            }
        };
        
        animate();
    }
}

// Initialize the application
console.log('Starting Stellar Navigation System...');
const app = new StellarNavigationApp();

// Global error handling
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});

// Export for debugging
window.stellarNav = app;