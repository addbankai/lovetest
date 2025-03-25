/**
 * Cyberpunk-themed 3D Gacha Environment using Three.js
 */

const GachaThreeEnvironment = {
    // Three.js components
    scene: null,
    camera: null,
    renderer: null,
    container: null,
    clock: null,
    mixers: [],
    particles: [],
    lights: [],
    
    // Animation properties
    animationFrameId: null,
    isAnimating: false,
    currentRarity: null,
    
    // Rarity color mapping
    rarityColors: {
        common: 0xffffff,       // White
        uncommon: 0x00ff66,     // Green
        rare: 0x00f3ff,         // Cyan
        epic: 0xff00ff,         // Magenta
        legendary: 0xf7ff00      // Yellow
    },
    
    /**
     * Create the animation container if it doesn't exist
     */
    createAnimationContainer: function() {
        // Check if container already exists
        if (document.getElementById('pull-animation-scene')) {
            return document.getElementById('pull-animation-scene');
        }
        
        console.log('Creating animation container');
        
        // Check if the parent container exists
        let pullAnimationContainer = document.getElementById('pull-animation-container');
        if (!pullAnimationContainer) {
            // Create the main container
            pullAnimationContainer = document.createElement('div');
            pullAnimationContainer.id = 'pull-animation-container';
            pullAnimationContainer.className = 'pull-animation-container';
            document.body.appendChild(pullAnimationContainer);
        }

        // Create the scene container
        const sceneContainer = document.createElement('div');
        sceneContainer.id = 'pull-animation-scene';
        sceneContainer.className = 'pull-animation-scene';
        pullAnimationContainer.appendChild(sceneContainer);

        return sceneContainer;
    },
    
    /**
     * Initialize the Three.js environment
     */
    init: function() {
        try {
            // Check for THREE global
            if (typeof THREE === 'undefined') {
                console.warn('THREE.js not loaded, using window.THREE');
                if (typeof window.THREE !== 'undefined') {
                    window.THREE = window.THREE;
                } else {
                    console.error('THREE.js not available');
                    return false;
                }
            }
            
            // Create container first
            this.container = this.createAnimationContainer();
            
            if (!this.container) {
                console.error('Failed to create animation container');
                return false;
            }
            
            // Set up scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x000d1f);
            this.scene.fog = new THREE.FogExp2(0x000d1f, 0.03);
            
            // Set up camera
            const aspectRatio = this.container.clientWidth / this.container.clientHeight;
            this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
            this.camera.position.set(0, 0, 5);
            
            // Set up renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.shadowMap.enabled = true;
            
            // Clear container and add renderer
            this.container.innerHTML = '';
            this.container.appendChild(this.renderer.domElement);
            
            // Initialize clock for animations
            this.clock = new THREE.Clock();
            
            // Add event listeners
            window.addEventListener('resize', () => this.onWindowResize());
            
            // Set up basic scene elements
            this.setupLights();
            this.setupGrid();
            this.setupEnvironment();
            
            // Start animation loop
            this.animate();
            
            console.log('Three.js gacha environment initialized');
            return true;
        } catch (error) {
            console.error('Error initializing Three.js:', error);
            return false;
        }
    },
    
    /**
     * Set up basic lighting for the scene
     */
    setupLights: function() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0x111122, 0.5);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0x00f0ff, 0.8);
        directionalLight.position.set(1, 1, 2);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        
        // Additional point lights for cyberpunk feel
        const pointLight1 = new THREE.PointLight(0xff00ff, 1, 10);
        pointLight1.position.set(-2, 1, 2);
        this.scene.add(pointLight1);
        this.lights.push(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x00f0ff, 1, 10);
        pointLight2.position.set(2, -1, 2);
        this.scene.add(pointLight2);
        this.lights.push(pointLight2);
    },
    
    /**
     * Create a cyberpunk-style grid for the floor
     */
    setupGrid: function() {
        // Grid helper with cyberpunk colors
        const gridSize = 20;
        const gridDivisions = 20;
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xff00ff, 0x00f0ff);
        gridHelper.position.y = -2;
        this.scene.add(gridHelper);
        
        // Add a plane to catch shadows
        const planeGeometry = new THREE.PlaneGeometry(gridSize, gridSize);
        const planeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x000d1f,
            transparent: true,
            opacity: 0.5,
            roughness: 0.8,
            metalness: 0.2
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -2;
        plane.receiveShadow = true;
        this.scene.add(plane);
    },
    
    /**
     * Set up additional environment elements
     */
    setupEnvironment: function() {
        // Create floating digital particles
        this.createDigitalParticles(100);
        
        // Add a holographic cylinder in the center
        this.createHolographicCylinder();
    },
    
    /**
     * Create floating digital particles
     * @param {number} count - Number of particles to create
     */
    createDigitalParticles: function(count) {
        const particleGeometry = new THREE.BufferGeometry();
        const particlesMaterial = new THREE.PointsMaterial({
            color: 0x00f0ff,
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particlesPositions = [];
        
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 10;
            const y = (Math.random() - 0.5) * 10;
            const z = (Math.random() - 0.5) * 10;
            
            particlesPositions.push(x, y, z);
        }
        
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlesPositions, 3));
        
        const particleSystem = new THREE.Points(particleGeometry, particlesMaterial);
        this.scene.add(particleSystem);
        this.particles.push(particleSystem);
    },
    
    /**
     * Create a holographic cylinder for the center display
     */
    createHolographicCylinder: function() {
        const geometry = new THREE.CylinderGeometry(1, 1, 3, 32, 1, true);
        const material = new THREE.MeshPhongMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide,
            wireframe: true
        });
        
        const cylinder = new THREE.Mesh(geometry, material);
        cylinder.position.set(0, 0, 0);
        this.scene.add(cylinder);
        
        // Add inner cylinder with different color
        const innerGeometry = new THREE.CylinderGeometry(0.8, 0.8, 2.8, 32, 1, true);
        const innerMaterial = new THREE.MeshPhongMaterial({
            color: 0xff00ff,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide,
            wireframe: true
        });
        
        const innerCylinder = new THREE.Mesh(innerGeometry, innerMaterial);
        innerCylinder.position.set(0, 0, 0);
        this.scene.add(innerCylinder);
        
        // Animate cylinders
        this.animateCylinder(cylinder, 1);
        this.animateCylinder(innerCylinder, -1);
    },
    
    /**
     * Animate a cylinder with rotation
     * @param {THREE.Mesh} cylinder - The cylinder to animate
     * @param {number} direction - Direction of rotation (1 or -1)
     */
    animateCylinder: function(cylinder, direction) {
        const animate = () => {
            cylinder.rotation.y += 0.01 * direction;
            requestAnimationFrame(animate);
        };
        
        animate();
    },
    
    /**
     * Handle window resize
     */
    onWindowResize: function() {
        if (!this.container || !this.camera || !this.renderer) return;
        
        const aspectRatio = this.container.clientWidth / this.container.clientHeight;
        this.camera.aspect = aspectRatio;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    },
    
    /**
     * Animation loop
     */
    animate: function() {
        this.animationFrameId = requestAnimationFrame(() => this.animate());
        
        // Update mixers
        const delta = this.clock.getDelta();
        this.mixers.forEach(mixer => mixer.update(delta));
        
        // Animate particles
        this.particles.forEach(particles => {
            particles.rotation.y += 0.001;
            particles.rotation.x += 0.0005;
        });
        
        // Rotate lights
        this.animateLights(delta);
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    },
    
    /**
     * Animate lights for cyberpunk effect
     * @param {number} delta - Time delta
     */
    animateLights: function(delta) {
        const time = Date.now() * 0.001;
        
        this.lights.forEach((light, index) => {
            if (index > 0) { // Skip the first directional light
                light.position.x = Math.sin(time * 0.7 + index) * 3;
                light.position.z = Math.cos(time * 0.5 + index) * 3;
                light.position.y = Math.sin(time * 0.3 + index) * 2;
                
                // Change intensity slightly for pulsing effect
                light.intensity = 1 + Math.sin(time * 2 + index) * 0.3;
            }
        });
    },
    
    /**
     * Show the container with animation
     */
    showContainer: function() {
        const pullAnimationContainer = document.getElementById('pull-animation-container');
        if (this.container && pullAnimationContainer) {
            // Show main container
            pullAnimationContainer.style.display = 'flex';
            this.container.style.display = 'block';
            
            // Only add active class when container is fully initialized
            setTimeout(() => {
                if (this.renderer && this.scene) {
                    pullAnimationContainer.classList.add('active');
                    this.container.classList.add('active');
                    
                    // Resize renderer to match new container size
                    if (this.renderer) {
                        this.onWindowResize();
                    }
                }
            }, 100);
        }
    },
    
    /**
     * Hide the container with animation
     */
    hideContainer: function() {
        const pullAnimationContainer = document.getElementById('pull-animation-container');
        if (this.container) {
            this.container.classList.remove('active');
            if (pullAnimationContainer) {
                pullAnimationContainer.classList.remove('active');
            }
            
            setTimeout(() => {
                this.container.style.display = 'none';
                if (pullAnimationContainer) {
                    pullAnimationContainer.style.display = 'none';
                }
            }, 300);
        }
    },
    
    /**
     * Play the gacha pull animation
     * @param {string} gachaType - Type of gacha ('mortal', 'synthetic', 'divine')
     * @param {string} rarity - Character rarity ('common', 'uncommon', 'rare', 'epic', 'legendary')
     * @param {Object} characterTemplate - The character template for the reveal
     * @param {Function} onComplete - Callback function when animation completes
     * @param {Object} options - Optional configuration options
     * @param {boolean} options.showCharacter - Whether to show the rotating human character (default: true)
     */
    playPullAnimation: function(gachaType, rarity, characterTemplate, onComplete, options = {}) {
        // Store current rarity for color effects
        this.currentRarity = rarity;
        
        // Get options with defaults
        const showCharacter = options.showCharacter !== false; // Default to true if not specified
        
        // Show the container
        this.showContainer();
        
        // Extract character ID from template for reveal
        const characterId = characterTemplate ? characterTemplate.id : null;
        
        // Create and animate the human silhouette only if showCharacter is true
        if (showCharacter) {
            this.createHumanSilhouette(gachaType, rarity, characterId);
        }
        
        // Create special effects based on rarity
        this.createRarityEffects(rarity);
        
        // Set timeout to hide the container and call the callback
        // Use shorter duration if we're not showing the character
        const animationDuration = showCharacter ? 3500 : 2000;
        setTimeout(() => {
            this.hideContainer();
            if (onComplete && typeof onComplete === 'function') {
                onComplete();
            }
        }, animationDuration);
    },
    
    /**
     * Create a human silhouette for animation
     * @param {string} gachaType - Type of gacha
     * @param {string} rarity - Character rarity
     * @param {string} characterId - ID of the character for reveal
     */
    createHumanSilhouette: function(gachaType, rarity, characterId = null) {
        // Remove any existing silhouette
        const existingSilhouette = this.scene.getObjectByName('characterSilhouette');
        if (existingSilhouette) {
            this.scene.remove(existingSilhouette);
        }
        
        // Create humanoid geometry - a more detailed human silhouette
        const geometry = new THREE.Group();
        
        // Body (more detailed shape)
        // Torso upper part
        const torsoUpperGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.6, 16);
        const silhouetteMaterial = new THREE.MeshPhongMaterial({
            color: 0x000000,
            transparent: true,
            opacity: 0.9,
            emissive: 0x000000,
            emissiveIntensity: 0.5,
            wireframe: true
        });
        
        const torsoUpper = new THREE.Mesh(torsoUpperGeometry, silhouetteMaterial);
        torsoUpper.position.y = 0.3;
        geometry.add(torsoUpper);
        
        // Torso lower part
        const torsoLowerGeometry = new THREE.CylinderGeometry(0.3, 0.25, 0.6, 16);
        const torsoLower = new THREE.Mesh(torsoLowerGeometry, silhouetteMaterial);
        torsoLower.position.y = -0.3;
        geometry.add(torsoLower);
        
        // Head (sphere)
        const headGeometry = new THREE.SphereGeometry(0.25, 16, 16);
        const head = new THREE.Mesh(headGeometry, silhouetteMaterial);
        head.position.y = 0.85;
        geometry.add(head);
        
        // Neck (small cylinder)
        const neckGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.15, 8);
        const neck = new THREE.Mesh(neckGeometry, silhouetteMaterial);
        neck.position.y = 0.65;
        geometry.add(neck);
        
        // Shoulders (sphere joints)
        const shoulderGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        
        const leftShoulder = new THREE.Mesh(shoulderGeometry, silhouetteMaterial);
        leftShoulder.position.set(-0.35, 0.5, 0);
        geometry.add(leftShoulder);
        
        const rightShoulder = new THREE.Mesh(shoulderGeometry, silhouetteMaterial);
        rightShoulder.position.set(0.35, 0.5, 0);
        geometry.add(rightShoulder);
        
        // Arms (cylinders)
        const upperArmGeometry = new THREE.CylinderGeometry(0.08, 0.07, 0.4, 8);
        
        const leftUpperArm = new THREE.Mesh(upperArmGeometry, silhouetteMaterial);
        leftUpperArm.position.set(-0.45, 0.25, 0);
        leftUpperArm.rotation.z = Math.PI / 8;
        geometry.add(leftUpperArm);
        
        const rightUpperArm = new THREE.Mesh(upperArmGeometry, silhouetteMaterial);
        rightUpperArm.position.set(0.45, 0.25, 0);
        rightUpperArm.rotation.z = -Math.PI / 8;
        geometry.add(rightUpperArm);
        
        // Elbows (sphere joints)
        const elbowGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        
        const leftElbow = new THREE.Mesh(elbowGeometry, silhouetteMaterial);
        leftElbow.position.set(-0.5, 0, 0);
        geometry.add(leftElbow);
        
        const rightElbow = new THREE.Mesh(elbowGeometry, silhouetteMaterial);
        rightElbow.position.set(0.5, 0, 0);
        geometry.add(rightElbow);
        
        // Forearms (cylinders)
        const forearmGeometry = new THREE.CylinderGeometry(0.07, 0.06, 0.4, 8);
        
        const leftForearm = new THREE.Mesh(forearmGeometry, silhouetteMaterial);
        leftForearm.position.set(-0.55, -0.25, 0);
        leftForearm.rotation.z = Math.PI / 6;
        geometry.add(leftForearm);
        
        const rightForearm = new THREE.Mesh(forearmGeometry, silhouetteMaterial);
        rightForearm.position.set(0.55, -0.25, 0);
        rightForearm.rotation.z = -Math.PI / 6;
        geometry.add(rightForearm);
        
        // Hands (small spheres)
        const handGeometry = new THREE.SphereGeometry(0.07, 8, 8);
        
        const leftHand = new THREE.Mesh(handGeometry, silhouetteMaterial);
        leftHand.position.set(-0.65, -0.5, 0);
        geometry.add(leftHand);
        
        const rightHand = new THREE.Mesh(handGeometry, silhouetteMaterial);
        rightHand.position.set(0.65, -0.5, 0);
        geometry.add(rightHand);
        
        // Hips (sphere joints)
        const hipGeometry = new THREE.SphereGeometry(0.12, 8, 8);
        
        const leftHip = new THREE.Mesh(hipGeometry, silhouetteMaterial);
        leftHip.position.set(-0.2, -0.65, 0);
        geometry.add(leftHip);
        
        const rightHip = new THREE.Mesh(hipGeometry, silhouetteMaterial);
        rightHip.position.set(0.2, -0.65, 0);
        geometry.add(rightHip);
        
        // Legs (cylinders)
        const upperLegGeometry = new THREE.CylinderGeometry(0.12, 0.1, 0.5, 8);
        
        const leftUpperLeg = new THREE.Mesh(upperLegGeometry, silhouetteMaterial);
        leftUpperLeg.position.set(-0.2, -0.95, 0);
        geometry.add(leftUpperLeg);
        
        const rightUpperLeg = new THREE.Mesh(upperLegGeometry, silhouetteMaterial);
        rightUpperLeg.position.set(0.2, -0.95, 0);
        geometry.add(rightUpperLeg);
        
        // Knees (sphere joints)
        const kneeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        
        const leftKnee = new THREE.Mesh(kneeGeometry, silhouetteMaterial);
        leftKnee.position.set(-0.2, -1.25, 0);
        geometry.add(leftKnee);
        
        const rightKnee = new THREE.Mesh(kneeGeometry, silhouetteMaterial);
        rightKnee.position.set(0.2, -1.25, 0);
        geometry.add(rightKnee);
        
        // Lower legs (cylinders)
        const lowerLegGeometry = new THREE.CylinderGeometry(0.09, 0.08, 0.5, 8);
        
        const leftLowerLeg = new THREE.Mesh(lowerLegGeometry, silhouetteMaterial);
        leftLowerLeg.position.set(-0.2, -1.55, 0);
        geometry.add(leftLowerLeg);
        
        const rightLowerLeg = new THREE.Mesh(lowerLegGeometry, silhouetteMaterial);
        rightLowerLeg.position.set(0.2, -1.55, 0);
        geometry.add(rightLowerLeg);
        
        // Feet (small boxes)
        const footGeometry = new THREE.BoxGeometry(0.15, 0.08, 0.25);
        
        const leftFoot = new THREE.Mesh(footGeometry, silhouetteMaterial);
        leftFoot.position.set(-0.2, -1.84, 0.05);
        geometry.add(leftFoot);
        
        const rightFoot = new THREE.Mesh(footGeometry, silhouetteMaterial);
        rightFoot.position.set(0.2, -1.84, 0.05);
        geometry.add(rightFoot);
        
        // Add glow outline based on rarity
        const rarityColor = this.rarityColors[rarity] || 0xffffff;
        
        // Create outline for the whole figure
        const outlineMaterial = new THREE.MeshBasicMaterial({
            color: rarityColor,
            transparent: true,
            opacity: 0.6,
            wireframe: true
        });
        
        // Clone the geometry for the outline
        const outlineGroup = new THREE.Group();
        
        // Clone and scale each part for the outline
        geometry.children.forEach(child => {
            const outlineMesh = child.clone();
            outlineMesh.material = outlineMaterial;
            outlineMesh.scale.multiplyScalar(1.05); // Slightly larger for outline effect
            outlineGroup.add(outlineMesh);
        });
        
        // Combine silhouette and outline
        const silhouette = new THREE.Group();
        silhouette.add(geometry);
        silhouette.add(outlineGroup);
        silhouette.name = 'characterSilhouette';
        silhouette.scale.set(0.1, 0.1, 0.1); // Start small, will scale up in animation
        silhouette.position.set(0, 0, 0);
        silhouette.rotation.y = Math.PI; // Face forward initially
        
        this.scene.add(silhouette);
        
        // If we have a character ID, add an invisible plane that will later show the character image
        if (characterId) {
            const planeGeometry = new THREE.PlaneGeometry(2, 3);
            const textureLoader = new THREE.TextureLoader();
            
            // Load character texture (will remain invisible initially)
            const texturePath = `img/thumbnail/${characterId}.png`;
            textureLoader.load(texturePath, (texture) => {
                const planeMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0 // Start invisible
                });
                
                const plane = new THREE.Mesh(planeGeometry, planeMaterial);
                plane.name = 'characterReveal';
                plane.position.set(0, 0, -0.1); // Slightly behind silhouette
                plane.scale.set(0, 0, 0); // Start with 0 scale
                silhouette.add(plane);
                
            }, undefined, (error) => {
                console.error('Error loading texture:', error);
            });
        }
        
        // Animate the silhouette
        this.animateSilhouette(silhouette, rarity, characterId);
    },
    
    /**
     * Animate the character silhouette
     * @param {THREE.Group} silhouette - The silhouette group
     * @param {string} rarity - Character rarity
     * @param {string} characterId - ID of the character for reveal
     */
    animateSilhouette: function(silhouette, rarity, characterId) {
        let scale = 0.1;
        let rotationSpeed = 0.05;
        let revealStarted = false;
        let bodyParts = [];
        let animationPhase = 0; // 0: scaling up, 1: rotating, 2: reveal
        
        // Store all the body parts for animation
        silhouette.children.forEach(group => {
            group.children.forEach(part => {
                bodyParts.push(part);
            });
        });
        
        // Higher rarity = faster rotation and more dramatic effects
        switch (rarity) {
            case 'legendary':
                rotationSpeed = 0.08;
                break;
            case 'epic':
                rotationSpeed = 0.07;
                break;
            case 'rare':
                rotationSpeed = 0.06;
                break;
            default:
                rotationSpeed = 0.05;
        }
        
        // Add rarity-colored glow to the silhouette
        const rarityColor = this.rarityColors[rarity];
        const glowLight = new THREE.PointLight(rarityColor, 1.5, 5);
        glowLight.position.set(0, 0, 2);
        silhouette.add(glowLight);
        
        const animate = () => {
            const currentTime = Date.now() * 0.001;
            
            // Phase 0: Scale up to full size
            if (animationPhase === 0) {
                if (scale < 1) {
                    scale += 0.02; // Faster scale up
                    silhouette.scale.set(scale, scale, scale);
                } else {
                    animationPhase = 1;
                }
                
                // Add pulsing effect during scale-up
                const pulse = Math.sin(currentTime * 5) * 0.05 + 1;
                silhouette.scale.set(scale * pulse, scale * pulse, scale * pulse);
            }
            
            // Phase 1: Continuous rotation with dramatic effects
            if (animationPhase === 1) {
                // Rotate continuously
                silhouette.rotation.y += rotationSpeed;
                
                // Create subtle floating effect
                silhouette.position.y = Math.sin(currentTime) * 0.15;
                
                // Dynamic rotation speed based on time
                rotationSpeed = 0.05 + Math.sin(currentTime * 2) * 0.02;
                
                // Animate limbs slightly for a more dynamic pose
                bodyParts.forEach((part, index) => {
                    if (part.name && part.name.includes('Arm')) {
                        part.rotation.x = Math.sin(currentTime * 1.5 + index * 0.5) * 0.1;
                    }
                    if (part.name && part.name.includes('Leg')) {
                        part.rotation.x = Math.sin(currentTime * 1.2 + index * 0.3) * 0.05;
                    }
                });
                
                // Add cyberpunk glitch effect
                if (Math.random() < 0.08) {
                    silhouette.position.x += (Math.random() - 0.5) * 0.08;
                    silhouette.position.z += (Math.random() - 0.5) * 0.08;
                    
                    // Randomly offset some body parts for glitch effect
                    const randomPart = bodyParts[Math.floor(Math.random() * bodyParts.length)];
                    if (randomPart) {
                        const originalPosition = randomPart.position.clone();
                        randomPart.position.x += (Math.random() - 0.5) * 0.1;
                        
                        setTimeout(() => {
                            if (randomPart && randomPart.position) {
                                randomPart.position.copy(originalPosition);
                            }
                        }, 100);
                    }
                    
                    setTimeout(() => {
                        silhouette.position.x = 0;
                        silhouette.position.z = 0;
                    }, 100);
                }
                
                // Pulsing glow effect
                if (glowLight) {
                    glowLight.intensity = 1.5 + Math.sin(currentTime * 4) * 0.5;
                }
                
                // Start reveal after certain time of rotation (3 seconds)
                if (!revealStarted && currentTime - startTime > 3 && characterId) {
                    revealStarted = true;
                    animationPhase = 2;
                    
                    // Find the character plane
                    const characterPlane = silhouette.getObjectByName('characterReveal');
                    if (characterPlane) {
                        // Create cool reveal effect
                        this.revealCharacter(silhouette, characterPlane, rarity);
                    } else {
                        // If no character plane, just create explosion effect
                        setTimeout(() => {
                            this.createExplosionEffect(silhouette.position, this.rarityColors[rarity]);
                            this.scene.remove(silhouette);
                        }, 1000);
                    }
                }
            }
            
            // Continue animation until removed from scene
            if (silhouette.parent) {
                requestAnimationFrame(animate);
            }
        };
        
        // Start time reference
        const startTime = Date.now() * 0.001;
        animate();
    },
    
    /**
     * Reveal the character from the silhouette
     * @param {THREE.Group} silhouette - The silhouette group
     * @param {THREE.Mesh} characterPlane - The plane with character texture
     * @param {string} rarity - Character rarity
     */
    revealCharacter: function(silhouette, characterPlane, rarity) {
        const rarityColor = this.rarityColors[rarity];
        
        // Create energy particles converging on the silhouette
        for (let i = 0; i < 100; i++) {
            setTimeout(() => {
                if (silhouette.parent) { // Check if still in scene
                    this.createEnergyParticle(silhouette.position, rarityColor);
                }
            }, i * 20);
        }
        
        // After particles start, begin fading in the character
        setTimeout(() => {
            if (!characterPlane || !silhouette.parent) return;
            
            let opacity = 0;
            let silhouetteOpacity = 1;
            
            const revealInterval = setInterval(() => {
                if (!characterPlane.material || !silhouette.parent) {
                    clearInterval(revealInterval);
                    return;
                }
                
                // Fade in character
                opacity += 0.05;
                characterPlane.material.opacity = opacity;
                
                // Scale up the character plane
                const scale = Math.min(1, characterPlane.scale.x + 0.05);
                characterPlane.scale.set(scale, scale, scale);
                
                // Fade out silhouette parts (except the character plane)
                silhouetteOpacity -= 0.05;
                silhouette.children.forEach(child => {
                    if (child !== characterPlane && child.type === 'Group') {
                        child.children.forEach(mesh => {
                            if (mesh.material) {
                                mesh.material.opacity = silhouetteOpacity;
                            }
                        });
                    }
                });
                
                // When fully revealed
                if (opacity >= 1) {
                    clearInterval(revealInterval);
                    
                    // Final effect and cleanup
                    setTimeout(() => {
                        this.createExplosionEffect(silhouette.position, rarityColor);
                        this.scene.remove(silhouette);
                    }, 500);
                }
            }, 50);
        }, 1000);
    },
    
    /**
     * Create energy particle for reveal effect
     * @param {THREE.Vector3} targetPos - Target position
     * @param {number} color - Particle color
     */
    createEnergyParticle: function(targetPos, color) {
        // Random position on a sphere around the target
        const radius = 4 + Math.random() * 2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        const x = targetPos.x + radius * Math.sin(phi) * Math.cos(theta);
        const y = targetPos.y + radius * Math.sin(phi) * Math.sin(theta);
        const z = targetPos.z + radius * Math.cos(phi);
        
        // Create particle
        const particleGeometry = new THREE.SphereGeometry(0.03 + Math.random() * 0.02, 8, 8);
        const particleMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            emissive: color,
            emissiveIntensity: 0.5
        });
        
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        particle.position.set(x, y, z);
        this.scene.add(particle);
        
        // Animate particle moving toward target
        const speed = 0.05 + Math.random() * 0.05;
        const animateParticle = () => {
            // Vector toward target
            const direction = new THREE.Vector3();
            direction.subVectors(targetPos, particle.position).normalize();
            
            // Move toward target
            particle.position.x += direction.x * speed;
            particle.position.y += direction.y * speed;
            particle.position.z += direction.z * speed;
            
            // Distance to target
            const distance = particle.position.distanceTo(targetPos);
            
            // When close to target, remove
            if (distance < 0.2) {
                this.scene.remove(particle);
                return;
            }
            
            // Continue animation
            if (particle.parent) {
                requestAnimationFrame(animateParticle);
            }
        };
        
        animateParticle();
    },
    
    /**
     * Create special visual effects based on rarity
     * @param {string} rarity - Character rarity
     */
    createRarityEffects: function(rarity) {
        const rarityColor = this.rarityColors[rarity] || 0xffffff;
        
        // Change scene background color slightly based on rarity
        this.scene.background = new THREE.Color(0x000d1f).lerp(
            new THREE.Color(rarityColor),
            0.1
        );
        
        // Add more particles for higher rarities
        let particleCount = 50;
        
        switch (rarity) {
            case 'legendary':
                particleCount = 300;
                break;
            case 'epic':
                particleCount = 200;
                break;
            case 'rare':
                particleCount = 150;
                break;
            case 'uncommon':
                particleCount = 100;
                break;
            default:
                particleCount = 50;
        }
        
        // Create rarity-colored particles
        this.createColoredParticles(particleCount, rarityColor);
    },
    
    /**
     * Create colored particles
     * @param {number} count - Number of particles
     * @param {number} color - Particle color (hex)
     */
    createColoredParticles: function(count, color) {
        const particleGeometry = new THREE.BufferGeometry();
        const particlesMaterial = new THREE.PointsMaterial({
            color: color,
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particlesPositions = [];
        
        for (let i = 0; i < count; i++) {
            // Create particles in a spherical distribution
            const radius = 3;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            const x = radius * Math.sin(phi) * Math.cos(theta);
            const y = radius * Math.sin(phi) * Math.sin(theta);
            const z = radius * Math.cos(phi);
            
            particlesPositions.push(x, y, z);
        }
        
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlesPositions, 3));
        
        const particleSystem = new THREE.Points(particleGeometry, particlesMaterial);
        particleSystem.name = 'rarityParticles';
        this.scene.add(particleSystem);
        
        // Animate the particles
        const animateParticles = () => {
            if (!particleSystem) return;
            
            particleSystem.rotation.y += 0.003;
            
            // Move particles inward
            const positions = particleSystem.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i] *= 0.99;   // x
                positions[i+1] *= 0.99; // y
                positions[i+2] *= 0.99; // z
            }
            particleSystem.geometry.attributes.position.needsUpdate = true;
            
            // Remove when particles get too close to center
            if (positions[0] < 0.1 && positions[1] < 0.1 && positions[2] < 0.1) {
                this.scene.remove(particleSystem);
            } else {
                requestAnimationFrame(animateParticles);
            }
        };
        
        animateParticles();
    },
    
    /**
     * Create explosion effect
     * @param {THREE.Vector3} position - Position of explosion
     * @param {number} color - Explosion color (hex)
     */
    createExplosionEffect: function(position, color) {
        const particleCount = 300;
        const particleGeometry = new THREE.BufferGeometry();
        const particlesMaterial = new THREE.PointsMaterial({
            color: color,
            size: 0.08,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particlesPositions = [];
        const particlesVelocities = [];
        
        for (let i = 0; i < particleCount; i++) {
            // Start all particles at the center
            particlesPositions.push(position.x, position.y, position.z);
            
            // Random velocities in all directions
            const speed = 0.1 + Math.random() * 0.2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
            const vx = speed * Math.sin(phi) * Math.cos(theta);
            const vy = speed * Math.sin(phi) * Math.sin(theta);
            const vz = speed * Math.cos(phi);
            
            particlesVelocities.push(vx, vy, vz);
        }
        
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlesPositions, 3));
        
        const explosionSystem = new THREE.Points(particleGeometry, particlesMaterial);
        explosionSystem.name = 'explosionParticles';
        this.scene.add(explosionSystem);
        
        // Create a point light for the explosion flash
        const explosionLight = new THREE.PointLight(color, 2, 10);
        explosionLight.position.copy(position);
        this.scene.add(explosionLight);
        
        // Animate the explosion
        let frame = 0;
        const maxFrames = 60; // 1 second at 60fps
        
        const animateExplosion = () => {
            frame++;
            
            // Update particle positions based on velocities
            const positions = explosionSystem.geometry.attributes.position.array;
            
            for (let i = 0, j = 0; i < positions.length; i += 3, j += 3) {
                positions[i] += particlesVelocities[j];     // x
                positions[i+1] += particlesVelocities[j+1]; // y
                positions[i+2] += particlesVelocities[j+2]; // z
                
                // Slow down particles over time (fake gravity/resistance)
                particlesVelocities[j] *= 0.96;
                particlesVelocities[j+1] *= 0.96;
                particlesVelocities[j+2] *= 0.96;
            }
            
            explosionSystem.geometry.attributes.position.needsUpdate = true;
            
            // Fade out light
            explosionLight.intensity = 2 * (1 - frame / maxFrames);
            
            // Fade out particles
            explosionSystem.material.opacity = 0.8 * (1 - frame / maxFrames);
            
            if (frame < maxFrames) {
                requestAnimationFrame(animateExplosion);
            } else {
                // Remove explosion elements
                this.scene.remove(explosionSystem);
                this.scene.remove(explosionLight);
            }
        };
        
        animateExplosion();
    },
    
    /**
     * Clean up and dispose resources
     */
    dispose: function() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Clean up Three.js scenes and objects
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = null;
        this.mixers = [];
        this.particles = [];
        this.lights = [];
    }
};
