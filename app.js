// Global variables
let scene, camera, renderer, controls;
let torusKnot, floatingShapes = [];
let particleSystem, portalMesh;
let mouse = new THREE.Vector2();
let raycaster = new THREE.Raycaster();
let clock = new THREE.Clock();
let isLoaded = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initThreeJS();
    initNavigation();
    initInteractions();
    animate();
    
    // Hide loading screen after scene is ready
    setTimeout(() => {
        document.getElementById('loading-screen').style.opacity = '0';
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            isLoaded = true;
        }, 500);
    }, 2000);
});

// Initialize Three.js scene
function initThreeJS() {
    // Scene setup
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0a, 50, 200);
    
    // Camera setup
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0, 30);
    
    // Renderer setup
    const canvas = document.getElementById('three-canvas');
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Lighting setup
    setupLighting();
    
    // Create 3D objects
    createTorusKnot();
    createFloatingShapes();
    createParticleSystem();
    createPortal();
    
    // Mouse controls
    setupMouseControls();
    
    // Window resize handler
    window.addEventListener('resize', onWindowResize);
}

// Setup lighting
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);
    
    // Point lights with different colors
    const light1 = new THREE.PointLight(0x00ffff, 1, 100);
    light1.position.set(20, 20, 20);
    scene.add(light1);
    
    const light2 = new THREE.PointLight(0x8a2be2, 1, 100);
    light2.position.set(-20, -20, 20);
    scene.add(light2);
    
    const light3 = new THREE.PointLight(0x39ff14, 1, 100);
    light3.position.set(0, 20, -20);
    scene.add(light3);
    
    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(10, 10, 10);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}

// Create main torus knot
function createTorusKnot() {
    const geometry = new THREE.TorusKnotGeometry(5, 1.5, 100, 16);
    const material = new THREE.MeshStandardMaterial({
        color: 0x00ffff,
        metalness: 0.8,
        roughness: 0.2,
        emissive: 0x004444,
        emissiveIntensity: 0.5
    });
    
    torusKnot = new THREE.Mesh(geometry, material);
    torusKnot.position.set(0, 0, 0);
    torusKnot.castShadow = true;
    torusKnot.receiveShadow = true;
    scene.add(torusKnot);
}

// Create floating geometric shapes
function createFloatingShapes() {
    const shapes = [
        { geometry: new THREE.IcosahedronGeometry(2), color: 0x8a2be2 },
        { geometry: new THREE.SphereGeometry(1.5), color: 0x39ff14 },
        { geometry: new THREE.OctahedronGeometry(2), color: 0x0080ff },
        { geometry: new THREE.TetrahedronGeometry(2), color: 0xff1493 }
    ];
    
    for (let i = 0; i < 8; i++) {
        const shapeData = shapes[i % shapes.length];
        const material = new THREE.MeshStandardMaterial({
            color: shapeData.color,
            metalness: 0.6,
            roughness: 0.3,
            emissive: shapeData.color,
            emissiveIntensity: 0.3,
            transparent: true,
            opacity: 0.8
        });
        
        const mesh = new THREE.Mesh(shapeData.geometry, material);
        
        // Random positioning
        const radius = 20 + Math.random() * 15;
        const angle = (i / 8) * Math.PI * 2;
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.y = (Math.random() - 0.5) * 20;
        mesh.position.z = Math.sin(angle) * radius;
        
        // Random rotation
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.rotation.z = Math.random() * Math.PI;
        
        mesh.castShadow = true;
        mesh.userData.originalPosition = mesh.position.clone();
        mesh.userData.originalRotation = mesh.rotation.clone();
        mesh.userData.hovered = false;
        
        floatingShapes.push(mesh);
        scene.add(mesh);
    }
}

// Create particle system
function createParticleSystem() {
    const particleCount = 1000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        
        // Random positions in a sphere
        positions[i3] = (Math.random() - 0.5) * 200;
        positions[i3 + 1] = (Math.random() - 0.5) * 200;
        positions[i3 + 2] = (Math.random() - 0.5) * 200;
        
        // Random colors (cyan, purple, green)
        const colorChoice = Math.random();
        if (colorChoice < 0.33) {
            colors[i3] = 0; colors[i3 + 1] = 1; colors[i3 + 2] = 1; // Cyan
        } else if (colorChoice < 0.66) {
            colors[i3] = 0.54; colors[i3 + 1] = 0.17; colors[i3 + 2] = 0.89; // Purple
        } else {
            colors[i3] = 0.22; colors[i3 + 1] = 1; colors[i3 + 2] = 0.08; // Green
        }
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    const material = new THREE.PointsMaterial({
        size: 0.5,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        blending: THREE.AdditiveBlending
    });
    
    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

// Create portal/wormhole effect
function createPortal() {
    const geometry = new THREE.RingGeometry(8, 12, 32);
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
    });
    
    portalMesh = new THREE.Mesh(geometry, material);
    portalMesh.position.set(0, 0, -20);
    portalMesh.rotation.x = Math.PI / 2;
    scene.add(portalMesh);
}

// Setup mouse controls
function setupMouseControls() {
    let mouseX = 0, mouseY = 0;
    let targetRotationX = 0, targetRotationY = 0;
    
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        
        mouse.x = mouseX;
        mouse.y = mouseY;
        
        // Smooth camera rotation based on mouse
        targetRotationX = mouseY * 0.1;
        targetRotationY = mouseX * 0.1;
    });
    
    document.addEventListener('click', onMouseClick);
    document.addEventListener('mousemove', onMouseMove);
    
    // Smooth camera movement
    function updateCamera() {
        if (isLoaded) {
            camera.rotation.x += (targetRotationX - camera.rotation.x) * 0.02;
            camera.rotation.y += (targetRotationY - camera.rotation.y) * 0.02;
        }
        requestAnimationFrame(updateCamera);
    }
    updateCamera();
}

// Handle mouse clicks
function onMouseClick(event) {
    if (!isLoaded) return;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(floatingShapes);
    
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        
        // Animate clicked object
        const originalScale = clickedObject.scale.clone();
        const targetScale = originalScale.clone().multiplyScalar(1.5);
        
        // Scale up
        const scaleUp = () => {
            clickedObject.scale.lerp(targetScale, 0.1);
            if (clickedObject.scale.distanceTo(targetScale) > 0.01) {
                requestAnimationFrame(scaleUp);
            } else {
                // Scale back down
                const scaleDown = () => {
                    clickedObject.scale.lerp(originalScale, 0.1);
                    if (clickedObject.scale.distanceTo(originalScale) > 0.01) {
                        requestAnimationFrame(scaleDown);
                    }
                };
                scaleDown();
            }
        };
        scaleUp();
        
        // Color change effect
        const originalColor = clickedObject.material.color.clone();
        clickedObject.material.color.setHex(0xffffff);
        setTimeout(() => {
            clickedObject.material.color.copy(originalColor);
        }, 200);
    }
}

// Handle mouse movement for hover effects
function onMouseMove(event) {
    if (!isLoaded) return;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(floatingShapes);
    
    // Reset all hover states
    floatingShapes.forEach(shape => {
        if (shape.userData.hovered && intersects.length === 0) {
            shape.userData.hovered = false;
            shape.material.emissiveIntensity = 0.3;
        }
    });
    
    if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;
        if (!hoveredObject.userData.hovered) {
            hoveredObject.userData.hovered = true;
            hoveredObject.material.emissiveIntensity = 0.6;
        }
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    if (!isLoaded) return;
    
    const elapsedTime = clock.getElapsedTime();
    
    // Rotate torus knot
    if (torusKnot) {
        torusKnot.rotation.x = elapsedTime * 0.3;
        torusKnot.rotation.y = elapsedTime * 0.2;
        
        // Pulsing effect
        const scale = 1 + Math.sin(elapsedTime * 2) * 0.1;
        torusKnot.scale.setScalar(scale);
    }
    
    // Animate floating shapes
    floatingShapes.forEach((shape, index) => {
        shape.rotation.x += 0.01 * (index % 2 === 0 ? 1 : -1);
        shape.rotation.y += 0.01 * (index % 3 === 0 ? 1 : -1);
        shape.rotation.z += 0.005 * (index % 4 === 0 ? 1 : -1);
        
        // Floating motion
        const originalY = shape.userData.originalPosition.y;
        shape.position.y = originalY + Math.sin(elapsedTime + index) * 2;
        
        // Orbital motion
        const angle = elapsedTime * 0.2 + (index / floatingShapes.length) * Math.PI * 2;
        const radius = 20 + Math.sin(elapsedTime + index) * 3;
        shape.position.x = Math.cos(angle) * radius;
        shape.position.z = Math.sin(angle) * radius;
    });
    
    // Animate particles
    if (particleSystem) {
        particleSystem.rotation.y = elapsedTime * 0.1;
        
        // Pulsing particle effect
        const positions = particleSystem.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(elapsedTime + i) * 0.01;
        }
        particleSystem.geometry.attributes.position.needsUpdate = true;
    }
    
    // Animate portal
    if (portalMesh) {
        portalMesh.rotation.z = elapsedTime * 0.5;
        portalMesh.material.opacity = 0.3 + Math.sin(elapsedTime * 2) * 0.2;
    }
    
    renderer.render(scene, camera);
}

// Initialize navigation
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.getAttribute('data-section');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Update active section
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');
        });
    });
}

// Initialize interactions
function initInteractions() {
    // Enhanced Enter the Dimension button
    const enterDimensionBtn = document.querySelector('.dimension-enter-btn');
    if (enterDimensionBtn) {
        enterDimensionBtn.addEventListener('click', (e) => {
            e.preventDefault();
            enterDimensionSequence();
        });
    }
    
    // Glow button effects
    const glowButtons = document.querySelectorAll('.glow-button');
    glowButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Add ripple effect (only for non-dimension buttons)
            if (!button.classList.contains('dimension-enter-btn')) {
                const ripple = document.createElement('span');
                ripple.classList.add('ripple');
                button.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            }
        });
    });
    
    // Form submission with better feedback
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('button[type="submit"], .btn--primary');
            const originalText = submitButton.textContent;
            
            // Show loading state
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            submitButton.style.opacity = '0.6';
            
            // Simulate form submission
            setTimeout(() => {
                // Show success feedback
                submitButton.textContent = 'Message Sent!';
                submitButton.style.background = 'linear-gradient(45deg, #39ff14, #00ff00)';
                
                // Create success notification
                showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
                
                // Reset form
                contactForm.reset();
                
                // Reset button after delay
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    submitButton.style.opacity = '1';
                    submitButton.style.background = 'linear-gradient(45deg, var(--color-neon-cyan), var(--color-neon-blue))';
                }, 2000);
            }, 1500);
        });
    }
    
    // Project card interactions
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            // Add particle burst effect
            createParticleBurst(card);
        });
    });
}

// Enhanced Enter the Dimension sequence
function enterDimensionSequence() {
    const homeSection = document.getElementById('home');
    const enterBtn = document.querySelector('.dimension-enter-btn');
    const contentPanel = homeSection.querySelector('.content-panel');
    
    // Show dramatic button feedback
    enterBtn.textContent = 'ACTIVATING...';
    enterBtn.style.transform = 'scale(1.1)';
    enterBtn.style.boxShadow = '0 0 30px #00ffff, 0 0 60px #00ffff, 0 0 90px #00ffff';
    
    // Create dramatic screen flash effect
    createDimensionFlash();
    
    // Trigger special 3D effects
    triggerDimensionEffects();
    
    // Create expanding energy rings
    createEnergyRings();
    
    // After effects, close the home dialog and show interaction hints
    setTimeout(() => {
        // Fade out the home section content
        contentPanel.style.transition = 'all 1s ease-out';
        contentPanel.style.opacity = '0';
        contentPanel.style.transform = 'scale(0.8) translateY(-50px)';
        
        setTimeout(() => {
            // Hide home section
            homeSection.classList.remove('active');
            
            // Show interaction hints with dramatic entrance
            showInteractionHints();
            
            // Show success notification
            showNotification('Dimension portal activated! Explore the interactive space.', 'success');
            
            // Reset button for future use
            enterBtn.textContent = 'Enter the Dimension';
            enterBtn.style.transform = 'scale(1)';
            enterBtn.style.boxShadow = '';
            contentPanel.style.opacity = '1';
            contentPanel.style.transform = 'scale(1) translateY(0)';
        }, 1000);
    }, 2000);
}

// Create dramatic screen flash effect
function createDimensionFlash() {
    const flash = document.createElement('div');
    flash.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: radial-gradient(circle, rgba(0,255,255,0.8) 0%, rgba(138,43,226,0.6) 50%, rgba(0,0,0,0.9) 100%);
        z-index: 9998;
        pointer-events: none;
        opacity: 0;
        animation: dimensionFlash 2s ease-in-out;
    `;
    
    document.body.appendChild(flash);
    
    setTimeout(() => {
        flash.remove();
    }, 2000);
}

// Trigger special 3D scene effects
function triggerDimensionEffects() {
    // Accelerate torus knot rotation
    if (torusKnot) {
        let accelerationTime = 0;
        const originalRotationSpeed = 0.01;
        
        const accelerateRotation = () => {
            accelerationTime += 0.1;
            if (accelerationTime < 3) {
                torusKnot.rotation.x += originalRotationSpeed * (1 + accelerationTime * 2);
                torusKnot.rotation.y += originalRotationSpeed * (1 + accelerationTime * 2);
                requestAnimationFrame(accelerateRotation);
            }
        };
        accelerateRotation();
    }
    
    // Make floating shapes more active
    floatingShapes.forEach((shape, index) => {
        setTimeout(() => {
            // Pulse effect
            const originalScale = shape.scale.clone();
            shape.scale.multiplyScalar(1.5);
            
            // Color shift
            shape.material.emissiveIntensity = 1;
            
            setTimeout(() => {
                shape.scale.copy(originalScale);
                shape.material.emissiveIntensity = 0.3;
            }, 500);
        }, index * 100);
    });
    
    // Intensify particles
    if (particleSystem) {
        particleSystem.material.size *= 2;
        setTimeout(() => {
            particleSystem.material.size /= 2;
        }, 3000);
    }
}

// Create expanding energy rings
function createEnergyRings() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => {
            const ring = document.createElement('div');
            ring.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                width: 20px;
                height: 20px;
                border: 2px solid #00ffff;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                z-index: 9997;
                pointer-events: none;
                opacity: 0.8;
                animation: expandRing 2s ease-out forwards;
            `;
            
            document.body.appendChild(ring);
            
            setTimeout(() => {
                ring.remove();
            }, 2000);
        }, i * 300);
    }
}

// Show interaction hints with dramatic entrance
function showInteractionHints() {
    const hintsContainer = document.querySelector('.interaction-hints');
    if (hintsContainer) {
        hintsContainer.style.display = 'block';
        hintsContainer.style.animation = 'fadeInUp 1s ease-out';
        
        // Make hints more prominent temporarily
        hintsContainer.style.transform = 'scale(1.2)';
        hintsContainer.style.background = 'rgba(0, 255, 255, 0.1)';
        hintsContainer.style.borderRadius = '10px';
        hintsContainer.style.padding = '1rem';
        
        setTimeout(() => {
            hintsContainer.style.transform = 'scale(1)';
            hintsContainer.style.background = 'transparent';
            hintsContainer.style.padding = '0';
        }, 3000);
    }
}

// Show notification function
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: ${type === 'success' ? '#39ff14' : '#00ffff'};
        padding: 1rem 2rem;
        border-radius: 8px;
        border: 1px solid ${type === 'success' ? '#39ff14' : '#00ffff'};
        backdrop-filter: blur(10px);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        box-shadow: 0 0 20px rgba(${type === 'success' ? '57, 255, 20' : '0, 255, 255'}, 0.3);
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Create particle burst effect
function createParticleBurst(element) {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    for (let i = 0; i < 10; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = centerX + 'px';
        particle.style.top = centerY + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.backgroundColor = '#00ffff';
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '9999';
        
        document.body.appendChild(particle);
        
        const angle = (i / 10) * Math.PI * 2;
        const distance = 50 + Math.random() * 50;
        const targetX = centerX + Math.cos(angle) * distance;
        const targetY = centerY + Math.sin(angle) * distance;
        
        particle.animate([
            { transform: `translate(0, 0) scale(1)`, opacity: 1 },
            { transform: `translate(${targetX - centerX}px, ${targetY - centerY}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => {
            particle.remove();
        };
    }
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Performance optimization
function optimizePerformance() {
    // Reduce particle count on mobile
    if (window.innerWidth < 768) {
        if (particleSystem) {
            particleSystem.material.size = 0.3;
        }
        
        // Reduce floating shapes
        floatingShapes = floatingShapes.slice(0, 4);
    }
    
    // Adjust quality based on device performance
    if (window.devicePixelRatio > 1) {
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    }
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', optimizePerformance);

// Add CSS for ripple effect and animations
const style = document.createElement('style');
style.textContent = `
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(0, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes dimensionFlash {
        0% {
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        50% {
            opacity: 0.8;
        }
        100% {
            opacity: 0;
        }
    }
    
    @keyframes expandRing {
        0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 0.8;
        }
        50% {
            opacity: 0.4;
        }
        100% {
            transform: translate(-50%, -50%) scale(20);
            opacity: 0;
        }
    }
    
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .dimension-enter-btn {
        position: relative;
        overflow: hidden;
        transition: all 0.3s ease;
    }
    
    .dimension-enter-btn:hover {
        transform: scale(1.05);
        box-shadow: 0 0 20px rgba(0, 255, 255, 0.5);
    }
    
    .interaction-hints {
        opacity: 0.7;
        transition: all 0.3s ease;
    }
    
    .interaction-hints.enhanced {
        opacity: 1;
        transform: scale(1.1);
    }
`;
document.head.appendChild(style);