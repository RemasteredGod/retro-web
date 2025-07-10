// Quantum Portal Application
class QuantumPortal {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.portal = null;
        this.particleSystems = [];
        this.controls = {
            mouseX: 0,
            mouseY: 0,
            isMouseDown: false,
            autoRotate: true,
            mouseSensitivity: 0.005
        };
        this.portalState = 'initializing';
        this.animationId = null;
        this.isLoaded = false;
        
        this.init();
    }

    init() {
        // Start loading sequence immediately
        this.startLoadingSequence();
        
        // Initialize 3D components after a brief delay
        setTimeout(() => {
            this.setupScene();
            this.createPortal();
            this.createParticles();
            this.setupControls();
            this.setupUI();
        }, 100);
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.fog = new THREE.Fog(0x0a0a23, 1, 100);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.set(0, 0, 30);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('quantum-canvas'),
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0x00ffff, 0.6);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        const pointLight = new THREE.PointLight(0xff00ff, 0.8, 100);
        pointLight.position.set(0, 0, 10);
        this.scene.add(pointLight);
    }

    createPortal() {
        // Main portal group
        this.portal = new THREE.Group();

        // Main torus (portal ring)
        const torusGeometry = new THREE.TorusGeometry(10, 3, 16, 100);
        const torusMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ffff,
            emissive: 0x5500ff,
            emissiveIntensity: 0.3,
            metalness: 0.8,
            roughness: 0.2,
            transparent: true,
            opacity: 0.9
        });
        const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
        this.portal.add(torusMesh);

        // Inner energy field
        const innerGeometry = new THREE.RingGeometry(5, 9, 32);
        const innerMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ffff,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        const innerRing = new THREE.Mesh(innerGeometry, innerMaterial);
        this.portal.add(innerRing);

        // Outer glow ring
        const outerGeometry = new THREE.RingGeometry(12, 15, 32);
        const outerMaterial = new THREE.MeshBasicMaterial({
            color: 0x5500ff,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        const outerRing = new THREE.Mesh(outerGeometry, outerMaterial);
        this.portal.add(outerRing);

        // Floating geometric objects
        this.createFloatingObjects();

        this.scene.add(this.portal);
    }

    createFloatingObjects() {
        // Icosahedron
        const icosahedronGeometry = new THREE.IcosahedronGeometry(2, 0);
        const icosahedronMaterial = new THREE.MeshPhongMaterial({
            color: 0xff00ff,
            emissive: 0x330033,
            transparent: true,
            opacity: 0.7
        });
        const icosahedron = new THREE.Mesh(icosahedronGeometry, icosahedronMaterial);
        icosahedron.position.set(15, 5, 0);
        this.portal.add(icosahedron);

        // Sphere
        const sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32);
        const sphereMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            emissive: 0x003300,
            transparent: true,
            opacity: 0.6
        });
        const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
        sphere.position.set(-12, -8, 3);
        this.portal.add(sphere);

        // Octahedron
        const octahedronGeometry = new THREE.OctahedronGeometry(1.8, 0);
        const octahedronMaterial = new THREE.MeshPhongMaterial({
            color: 0xffff00,
            emissive: 0x333300,
            transparent: true,
            opacity: 0.8
        });
        const octahedron = new THREE.Mesh(octahedronGeometry, octahedronMaterial);
        octahedron.position.set(8, -12, -5);
        this.portal.add(octahedron);

        // Store references for animation
        this.floatingObjects = {
            icosahedron,
            sphere,
            octahedron
        };
    }

    createParticles() {
        // Starfield
        this.createStarfield();
        
        // Quantum particles
        this.createQuantumParticles();
    }

    createStarfield() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 500;
        const positions = new Float32Array(starCount * 3);
        const colors = new Float32Array(starCount * 3);

        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 200;
            positions[i3 + 1] = (Math.random() - 0.5) * 200;
            positions[i3 + 2] = (Math.random() - 0.5) * 200;

            const color = new THREE.Color();
            color.setHSL(0.6 + Math.random() * 0.4, 0.8, 0.8);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;
        }

        starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const starMaterial = new THREE.PointsMaterial({
            size: 0.3,
            vertexColors: true,
            transparent: true,
            opacity: 0.8
        });

        this.starfield = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(this.starfield);
    }

    createQuantumParticles() {
        const particleGeometry = new THREE.BufferGeometry();
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const velocities = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const radius = 15 + Math.random() * 10;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI * 2;

            positions[i3] = radius * Math.cos(theta) * Math.sin(phi);
            positions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
            positions[i3 + 2] = radius * Math.cos(phi);

            velocities[i3] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
            velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
        }

        particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particleGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

        const particleMaterial = new THREE.PointsMaterial({
            color: 0x00ffff,
            size: 0.5,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });

        this.quantumParticles = new THREE.Points(particleGeometry, particleMaterial);
        this.scene.add(this.quantumParticles);
    }

    setupControls() {
        const canvas = document.getElementById('quantum-canvas');
        
        // Mouse movement
        canvas.addEventListener('mousemove', (event) => {
            this.controls.mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            this.controls.mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        });

        // Mouse drag
        canvas.addEventListener('mousedown', (event) => {
            this.controls.isMouseDown = true;
            this.controls.autoRotate = false;
            event.preventDefault();
        });

        canvas.addEventListener('mouseup', () => {
            this.controls.isMouseDown = false;
            setTimeout(() => {
                this.controls.autoRotate = true;
            }, 2000);
        });

        // Portal click interaction
        canvas.addEventListener('click', (event) => {
            if (this.isLoaded) {
                this.handlePortalClick(event);
            }
        });

        // Touch events for mobile
        canvas.addEventListener('touchstart', (event) => {
            event.preventDefault();
            this.controls.isMouseDown = true;
            this.controls.autoRotate = false;
        });

        canvas.addEventListener('touchend', () => {
            this.controls.isMouseDown = false;
            setTimeout(() => {
                this.controls.autoRotate = true;
            }, 2000);
        });

        canvas.addEventListener('touchmove', (event) => {
            event.preventDefault();
            if (event.touches.length > 0) {
                this.controls.mouseX = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
                this.controls.mouseY = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
            }
        });

        // Resize handling
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    handlePortalClick(event) {
        // Create a quick camera zoom effect
        const originalZ = this.camera.position.z;
        this.camera.position.z = originalZ - 5;
        
        setTimeout(() => {
            this.camera.position.z = originalZ;
        }, 200);
        
        // Add a brief flash effect
        this.flashPortal();
    }

    flashPortal() {
        if (this.portal) {
            this.portal.children.forEach(child => {
                if (child.material) {
                    const originalIntensity = child.material.emissiveIntensity || 0.3;
                    child.material.emissiveIntensity = 1.0;
                    
                    setTimeout(() => {
                        child.material.emissiveIntensity = originalIntensity;
                    }, 150);
                }
            });
        }
    }

    setupUI() {
        // Portal activation
        document.getElementById('activate-btn').addEventListener('click', () => {
            this.togglePortalState();
        });

        // Reset
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetPortal();
        });

        // Particles toggle
        document.getElementById('particles-btn').addEventListener('click', () => {
            this.toggleParticles();
        });

        // Info panel
        document.getElementById('info-btn').addEventListener('click', () => {
            this.toggleInfoPanel();
        });
    }

    togglePortalState() {
        if (this.portalState === 'stable') {
            this.portalState = 'active';
            this.updateStatus('success', 'Active');
            this.activatePortalEffects();
            document.getElementById('activate-btn').querySelector('.btn-text').textContent = 'Deactivate Portal';
        } else if (this.portalState === 'active') {
            this.portalState = 'stable';
            this.updateStatus('info', 'Stable');
            this.deactivatePortalEffects();
            document.getElementById('activate-btn').querySelector('.btn-text').textContent = 'Activate Portal';
        }
    }

    activatePortalEffects() {
        // Increase emissive intensity
        this.portal.children.forEach(child => {
            if (child.material && child.material.emissive) {
                child.material.emissiveIntensity = 0.8;
            }
        });

        // Speed up rotations
        this.portalRotationSpeed = 0.02;
    }

    deactivatePortalEffects() {
        // Reset emissive intensity
        this.portal.children.forEach(child => {
            if (child.material && child.material.emissive) {
                child.material.emissiveIntensity = 0.3;
            }
        });

        // Normal rotation speed
        this.portalRotationSpeed = 0.01;
    }

    resetPortal() {
        this.portalState = 'stable';
        this.updateStatus('info', 'Stable');
        this.deactivatePortalEffects();
        
        // Reset camera position
        this.camera.position.set(0, 0, 30);
        this.controls.autoRotate = true;
        
        // Reset button text
        document.getElementById('activate-btn').querySelector('.btn-text').textContent = 'Activate Portal';
    }

    toggleParticles() {
        this.starfield.visible = !this.starfield.visible;
        this.quantumParticles.visible = !this.quantumParticles.visible;
    }

    toggleInfoPanel() {
        const infoPanel = document.getElementById('info-panel');
        infoPanel.classList.toggle('hidden');
    }

    updateStatus(statusClass, statusText) {
        const statusElement = document.getElementById('portal-status');
        statusElement.className = `status-value status--${statusClass}`;
        statusElement.textContent = statusText;
    }

    startLoadingSequence() {
        // Ensure loading screen is visible
        const loadingScreen = document.getElementById('loading-screen');
        const app = document.getElementById('app');
        
        loadingScreen.style.display = 'flex';
        app.classList.add('hidden');
        
        // Update loading text sequence
        const loadingTexts = [
            'Initializing quantum field...',
            'Stabilizing dimensional gateway...',
            'Calibrating particle systems...',
            'Activating portal matrix...',
            'System ready.'
        ];
        
        let textIndex = 0;
        const loadingTextElement = document.querySelector('.loading-text');
        
        const textInterval = setInterval(() => {
            if (textIndex < loadingTexts.length) {
                loadingTextElement.textContent = loadingTexts[textIndex];
                textIndex++;
            }
        }, 600);

        let progress = 0;
        const loadingInterval = setInterval(() => {
            progress += Math.random() * 12 + 8;
            
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadingInterval);
                clearInterval(textInterval);
                
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    app.classList.remove('hidden');
                    this.portalState = 'stable';
                    this.updateStatus('info', 'Stable');
                    this.isLoaded = true;
                    this.startAnimation();
                }, 800);
            }
            
            document.querySelector('.progress-fill').style.width = `${progress}%`;
        }, 180);
    }

    startAnimation() {
        this.portalRotationSpeed = 0.01;
        this.animate();
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // Portal rotation
        if (this.portal) {
            this.portal.rotation.x += this.portalRotationSpeed * 0.5;
            this.portal.rotation.y += this.portalRotationSpeed;
            this.portal.rotation.z += this.portalRotationSpeed * 0.3;
        }

        // Floating objects animation
        if (this.floatingObjects) {
            this.floatingObjects.icosahedron.rotation.x += 0.02;
            this.floatingObjects.icosahedron.rotation.y += 0.015;
            
            this.floatingObjects.sphere.rotation.x += 0.01;
            this.floatingObjects.sphere.rotation.z += 0.02;
            
            this.floatingObjects.octahedron.rotation.y += 0.025;
            this.floatingObjects.octahedron.rotation.z += 0.01;
        }

        // Quantum particles animation
        if (this.quantumParticles) {
            const positions = this.quantumParticles.geometry.attributes.position.array;
            const velocities = this.quantumParticles.geometry.attributes.velocity.array;

            for (let i = 0; i < positions.length; i += 3) {
                positions[i] += velocities[i];
                positions[i + 1] += velocities[i + 1];
                positions[i + 2] += velocities[i + 2];

                // Keep particles within bounds
                const distance = Math.sqrt(
                    positions[i] * positions[i] +
                    positions[i + 1] * positions[i + 1] +
                    positions[i + 2] * positions[i + 2]
                );

                if (distance > 30) {
                    velocities[i] *= -0.5;
                    velocities[i + 1] *= -0.5;
                    velocities[i + 2] *= -0.5;
                }
            }

            this.quantumParticles.geometry.attributes.position.needsUpdate = true;
        }

        // Starfield slow rotation
        if (this.starfield) {
            this.starfield.rotation.x += 0.0001;
            this.starfield.rotation.y += 0.0002;
        }

        // Camera controls
        if (this.controls.autoRotate) {
            this.camera.position.x = Math.cos(time * 0.1) * 30;
            this.camera.position.z = Math.sin(time * 0.1) * 30;
            this.camera.lookAt(0, 0, 0);
        } else {
            // Manual camera control
            const targetX = this.controls.mouseX * 20;
            const targetY = this.controls.mouseY * 20;
            
            this.camera.position.x += (targetX - this.camera.position.x) * 0.05;
            this.camera.position.y += (targetY - this.camera.position.y) * 0.05;
            this.camera.lookAt(0, 0, 0);
        }

        // Update energy and stability displays
        this.updateEnergyDisplay(time);

        this.renderer.render(this.scene, this.camera);
    }

    updateEnergyDisplay(time) {
        const energyVariation = 90 + Math.sin(time * 2) * 5;
        document.getElementById('energy-level').textContent = `${energyVariation.toFixed(1)}%`;
        
        const stabilityStates = ['Optimal', 'Good', 'Stable', 'Fluctuating'];
        const stabilityIndex = Math.floor(Math.abs(Math.sin(time * 0.5)) * stabilityStates.length);
        document.getElementById('stability-level').textContent = stabilityStates[stabilityIndex];
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const app = new QuantumPortal();
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (app.animationId) {
                cancelAnimationFrame(app.animationId);
            }
        } else {
            app.animate();
        }
    });
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        app.destroy();
    });
});