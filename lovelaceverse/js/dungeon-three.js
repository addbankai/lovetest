/**
 * Cyberpunk-themed 3D Dungeon Selection Environment using Three.js
 * Provides immersive visualization for dungeon selection with floating portals
 */

const DungeonThreeEnvironment = {
    // Three.js components
    scene: null,
    camera: null,
    renderer: null,
    container: null,
    clock: null,
    controls: null,
    raycaster: null,
    mouse: null,
    
    // Environment elements
    mixers: [],
    particles: [],
    lights: [],
    dungeonModels: {},
    portalEffects: {},
    hologramMaterials: [],
    
    // Animation properties
    animationFrameId: null,
    isAnimating: false,
    
    // Color schemes for cyberpunk theme
    colors: {
        neon: {
            cyan: 0x00f7ff,
            magenta: 0xff00ff,
            blue: 0x0066ff,
            purple: 0x9900ff,
            green: 0x00ff66
        },
        dark: {
            base: 0x000d1f,
            accent: 0x0a1a2f
        }
    },
    
    /**
     * Initialize the Three.js environment
     * @param {string} containerId - ID of the container element
     * @returns {boolean} - Success status
     */
    init: function(containerId = 'dungeon-three-container') {
        try {
            console.log('Initializing Three.js dungeon environment...');
            
            // Check for THREE global
            if (typeof THREE === 'undefined') {
                console.warn('THREE.js not loaded, using window.THREE');
                if (typeof window.THREE !== 'undefined') {
                    THREE = window.THREE;
                } else {
                    console.error('THREE.js not available');
                    // Try to manually inject Three.js if not loaded yet
                    const script = document.createElement('script');
                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
                    script.onload = () => {
                        console.log('THREE.js manually loaded');
                        this.init(containerId); // Try initialization again
                    };
                    document.head.appendChild(script);
                    return false;
                }
            }
            
            // Get or create container
            this.container = document.getElementById(containerId);
            
            if (!this.container) {
                console.error(`Three.js container '${containerId}' not found`);
                // Create the container if it doesn't exist
                this.container = document.createElement('div');
                this.container.id = containerId;
                this.container.className = 'dungeon-three-container';
                
                // Find the modal body to append to
                const modalBody = document.querySelector('#dungeon-selection-modal .modal-body');
                if (modalBody) {
                    // Insert at the top
                    if (modalBody.firstChild) {
                        modalBody.insertBefore(this.container, modalBody.firstChild);
                    } else {
                        modalBody.appendChild(this.container);
                    }
                    console.log('Created missing Three.js container');
                } else {
                    console.error('Could not find modal body to append Three.js container');
                    return false;
                }
            }
            
            // Set up scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(this.colors.dark.base);
            this.scene.fog = new THREE.FogExp2(this.colors.dark.base, 0.025);
            
            // Set up camera
            const aspectRatio = this.container.clientWidth / this.container.clientHeight;
            this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
            this.camera.position.set(0, 1.5, 5);
            
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
            
            // Set up raycaster for interaction
            this.raycaster = new THREE.Raycaster();
            this.mouse = new THREE.Vector2();
            
            // Add event listeners - Use bound function to maintain correct 'this' context
            window.addEventListener('resize', this.onWindowResize.bind(this));
            this.renderer.domElement.addEventListener('mousemove', (event) => this.onMouseMove(event));
            this.renderer.domElement.addEventListener('click', (event) => this.onClick(event));
            
            // Set up basic scene elements
            this.setupLights();
            this.setupGrid();
            this.setupEnvironment();
            
            // Start animation loop
            this.animate();
            
            console.log('Three.js dungeon environment initialized');
            return true;
        } catch (error) {
            console.error('Error initializing Three.js dungeon environment:', error);
            return false;
        }
    },
    
    /**
     * Set up cyberpunk-themed lighting for the scene
     */
    setupLights: function() {
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0x111122, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(this.colors.neon.cyan, 0.7);
        directionalLight.position.set(1, 2, 2);
        directionalLight.castShadow = true;
        
        // Improve shadow quality
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 15;
        directionalLight.shadow.bias = -0.001;
        
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        
        // Additional colored point lights for cyberpunk feel
        const pointLight1 = new THREE.PointLight(this.colors.neon.magenta, 1.2, 10);
        pointLight1.position.set(-3, 2, 2);
        pointLight1.castShadow = true;
        this.scene.add(pointLight1);
        this.lights.push(pointLight1);
        
        const pointLight2 = new THREE.PointLight(this.colors.neon.blue, 1, 8);
        pointLight2.position.set(3, 1, 3);
        pointLight2.castShadow = true;
        this.scene.add(pointLight2);
        this.lights.push(pointLight2);
        
        const pointLight3 = new THREE.PointLight(this.colors.neon.purple, 0.8, 12);
        pointLight3.position.set(0, 3, -3);
        this.scene.add(pointLight3);
        this.lights.push(pointLight3);
        
        // Add volumetric light beams
        this.createVolumetricLightBeam(-2, 0, -3, this.colors.neon.cyan);
        this.createVolumetricLightBeam(2, 0, -4, this.colors.neon.magenta);
    },
    
    /**
     * Create a volumetric light beam
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @param {number} color - Light color
     */
    createVolumetricLightBeam: function(x, y, z, color) {
        const beamGeometry = new THREE.CylinderGeometry(0.05, 0.2, 6, 16, 1, true);
        const beamMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.15,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });
        
        const beam = new THREE.Mesh(beamGeometry, beamMaterial);
        beam.position.set(x, y + 3, z);
        beam.rotation.x = Math.PI / 2;
        this.scene.add(beam);
        
        // Add animation to the beam
        const animateBeam = () => {
            const time = Date.now() * 0.001;
            beam.material.opacity = 0.15 + Math.sin(time * 2) * 0.05;
            requestAnimationFrame(animateBeam);
        };
        
        animateBeam();
    },
    
    /**
     * Create a cyberpunk-style grid for the floor
     */
    setupGrid: function() {
        // Create a grid material that looks like a glowing grid
        const gridSize = 20;
        const gridDivisions = 20;
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, this.colors.neon.magenta, this.colors.neon.cyan);
        gridHelper.position.y = -0.5;
        this.scene.add(gridHelper);
        
        // Add a reflective floor plane
        const planeGeometry = new THREE.PlaneGeometry(gridSize, gridSize);
        const planeMaterial = new THREE.MeshStandardMaterial({ 
            color: this.colors.dark.base,
            transparent: true,
            opacity: 0.8,
            roughness: 0.2,
            metalness: 0.8,
            side: THREE.DoubleSide
        });
        
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -0.5;
        plane.receiveShadow = true;
        this.scene.add(plane);
        
        // Add glowing grid lines in the floor
        const lineGeometry = new THREE.BufferGeometry();
        const lineVertices = [];
        const lineSize = gridSize / 2;
        const lineSpacing = 1;
        
        // Create a grid of lines
        for (let i = -lineSize; i <= lineSize; i += lineSpacing) {
            // X lines
            lineVertices.push(-lineSize, -0.49, i);
            lineVertices.push(lineSize, -0.49, i);
            
            // Z lines
            lineVertices.push(i, -0.49, -lineSize);
            lineVertices.push(i, -0.49, lineSize);
        }
        
        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lineVertices, 3));
        
        const lineMaterial = new THREE.LineBasicMaterial({
            color: this.colors.neon.cyan,
            transparent: true,
            opacity: 0.3
        });
        
        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        this.scene.add(lines);
        
        // Animate the grid lines for a pulsing effect
        const animateGrid = () => {
            const time = Date.now() * 0.001;
            lineMaterial.opacity = 0.2 + Math.sin(time) * 0.1;
            requestAnimationFrame(animateGrid);
        };
        
        animateGrid();
    },
    
    /**
     * Set up additional environment elements
     */
    setupEnvironment: function() {
        // Add cyber-themed skybox
        this.createCyberSkybox();
        
        // Create floating digital particles
        this.createDigitalParticles(150); // Reduced particle count
        
        // Add data streams
        this.createDataStreams();
        
        // Add floating portal displays for dungeons
        this.createDungeonPortals();
    },
    
    /**
     * Create a cyberpunk-themed skybox
     */
    createCyberSkybox: function() {
        const skyboxGeometry = new THREE.BoxGeometry(100, 100, 100);
        
        // Create a shader material for an animated cyberpunk sky
        const skyboxMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                varying vec3 vPosition;
                varying vec2 vUv;
                
                void main() {
                    vPosition = position;
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                varying vec3 vPosition;
                varying vec2 vUv;
                
                float random(vec2 st) {
                    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
                }
                
                vec3 gridEffect(vec2 uv, float scale, float intensity) {
                    vec2 grid = fract(uv * scale);
                    float gridLine = step(0.95, max(grid.x, grid.y));
                    
                    // Add some variation to the grid
                    float r = random(floor(uv * scale));
                    float brightness = smoothstep(0.8, 1.0, r) * intensity;
                    
                    // Dark blue/purple cyberpunk color scheme
                    vec3 color = mix(
                        vec3(0.0, 0.02, 0.05), // Dark base
                        vec3(0.0, 0.5, 1.0),   // Highlight color (cyan)
                        brightness
                    );
                    
                    return mix(color, vec3(0.0, 0.7, 1.0), gridLine);
                }
                
                void main() {
                    // Determine which face of the skybox we're rendering
                    vec3 absPos = abs(vPosition);
                    float maxCoord = max(max(absPos.x, absPos.y), absPos.z);
                    vec2 uv;
                    
                    // Map position to UV based on the face
                    if (maxCoord == absPos.x) {
                        uv = vec2(vPosition.z / absPos.x, vPosition.y / absPos.x);
                    } else if (maxCoord == absPos.y) {
                        uv = vec2(vPosition.x / absPos.y, vPosition.z / absPos.y);
                    } else {
                        uv = vec2(vPosition.x / absPos.z, vPosition.y / absPos.z);
                    }
                    
                    // Apply animation
                    uv += time * 0.05 * vec2(0.5, 0.3);
                    
                    // Generate multiple layers of grids at different scales
                    vec3 color = vec3(0.0, 0.0, 0.05); // Base color
                    color += gridEffect(uv, 2.0, 0.1);
                    color += gridEffect(uv + vec2(time * 0.01), 10.0, 0.05);
                    color += gridEffect(uv * 0.5 - vec2(time * 0.02), 20.0, 0.02);
                    
                    // Add vignette effect
                    float vignette = 1.0 - smoothstep(0.4, 1.4, length(vUv - 0.5) * 2.0);
                    color *= vignette;
                    
                    gl_FragColor = vec4(color, 1.0);
                }
            `,
            side: THREE.BackSide
        });
        
        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        this.scene.add(skybox);
        
        // Animate the skybox
        const animateSkybox = () => {
            skyboxMaterial.uniforms.time.value = Date.now() * 0.001;
            requestAnimationFrame(animateSkybox);
        };
        
        animateSkybox();
    },
    
    /**
     * Create floating digital particles
     * @param {number} count - Number of particles to create
     */
    createDigitalParticles: function(count) {
        const particleGeometry = new THREE.BufferGeometry();
        const particlesMaterial = new THREE.PointsMaterial({
            color: this.colors.neon.cyan,
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        const particlesPositions = [];
        const particlesSizes = [];
        const particlesColors = [];
        
        const colorOptions = [
            new THREE.Color(this.colors.neon.cyan),
            new THREE.Color(this.colors.neon.magenta),
            new THREE.Color(this.colors.neon.blue),
            new THREE.Color(this.colors.neon.green)
        ];
        
        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 20;
            const y = Math.random() * 10;
            const z = (Math.random() - 0.5) * 20;
            
            particlesPositions.push(x, y, z);
            
            // Random sizes for particles
            particlesSizes.push(Math.random() * 0.1 + 0.02);
            
            // Random colors from the neon palette
            const color = colorOptions[Math.floor(Math.random() * colorOptions.length)];
            particlesColors.push(color.r, color.g, color.b);
        }
        
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlesPositions, 3));
        particleGeometry.setAttribute('size', new THREE.Float32BufferAttribute(particlesSizes, 1));
        particleGeometry.setAttribute('color', new THREE.Float32BufferAttribute(particlesColors, 3));
        
        const particleSystem = new THREE.Points(particleGeometry, particlesMaterial);
        this.scene.add(particleSystem);
        this.particles.push(particleSystem);
        
        // Animate particles
        const animateParticles = () => {
            const time = Date.now() * 0.001;
            const positions = particleSystem.geometry.attributes.position.array;
            
            for (let i = 0; i < positions.length; i += 3) {
                // Add subtle floating motion to particles
                positions[i] += Math.sin(time + i * 0.1) * 0.003;
                positions[i+1] += Math.cos(time + i * 0.1) * 0.002;
                positions[i+2] += Math.sin(time + i * 0.1) * 0.002;
                
                // Reset particles that drift too far
                if (Math.abs(positions[i]) > 10) positions[i] *= 0.95;
                if (positions[i+1] > 10) positions[i+1] = 0;
                if (Math.abs(positions[i+2]) > 10) positions[i+2] *= 0.95;
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
            requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
    },
    
    /**
     * Create a portal particle effect
     * @param {THREE.Vector3} position - Position for the portal
     * @param {THREE.Color} color - Color of the portal particles
     * @returns {THREE.Points} - Portal particle system
     */
    createPortalEffect: function(position, color) {
        const particleCount = 100;
        const particleGeometry = new THREE.BufferGeometry();
        const particlesMaterial = new THREE.PointsMaterial({
            color: color,
            size: 0.08,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });
        
        // Create initial particle positions (in a circle)
        const particlesPositions = [];
        const particlesVelocities = [];
        const radius = 0.8; // Portal radius
        
        for (let i = 0; i < particleCount; i++) {
            // Random angle and radius for circular distribution
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * radius;
            
            // Convert polar to cartesian coordinates
            const x = Math.cos(angle) * r;
            const y = (Math.random() - 0.5) * 0.1; // Small vertical variation
            const z = Math.sin(angle) * r;
            
            // Position relative to portal center
            particlesPositions.push(x, y, z);
            
            // Store velocity for animation
            // Particles move toward center with a spiral motion
            particlesVelocities.push(
                -x * 0.02, 
                (Math.random() - 0.5) * 0.01,
                -z * 0.02
            );
        }
        
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlesPositions, 3));
        particleGeometry.userData = { velocities: particlesVelocities };
        
        const particleSystem = new THREE.Points(particleGeometry, particlesMaterial);
        particleSystem.position.copy(position);
        particleSystem.visible = false; // Start invisible
        
        this.scene.add(particleSystem);
        
        return particleSystem;
    },
    
    /**
     * Activate the portal effect for the selected dungeon
     * @param {string} dungeonId - ID of the dungeon
     */
    activatePortalEffect: function(dungeonId) {
        if (!this.portalEffects[dungeonId]) return;
        
        const portalEffect = this.portalEffects[dungeonId];
        portalEffect.visible = true;
        
        // Start animation for particles
        const animate = () => {
            if (!portalEffect.visible) return;
            
            const positions = portalEffect.geometry.attributes.position.array;
            const velocities = portalEffect.geometry.userData.velocities;
            
            for (let i = 0, j = 0; i < positions.length; i += 3, j += 3) {
                // Update positions based on velocities
                positions[i] += velocities[j];
                positions[i+1] += velocities[j+1];
                positions[i+2] += velocities[j+2];
                
                // If particle reaches center, reset to edge
                const distance = Math.sqrt(
                    positions[i] * positions[i] + 
                    positions[i+2] * positions[i+2]
                );
                
                if (distance < 0.1) {
                    // Reset particle to edge
                    const angle = Math.random() * Math.PI * 2;
                    const radius = 0.8;
                    
                    positions[i] = Math.cos(angle) * radius;
                    positions[i+1] = (Math.random() - 0.5) * 0.1;
                    positions[i+2] = Math.sin(angle) * radius;
                    
                    // Update velocity towards center
                    velocities[j] = -positions[i] * 0.02;
                    velocities[j+1] = (Math.random() - 0.5) * 0.01;
                    velocities[j+2] = -positions[i+2] * 0.02;
                }
            }
            
            portalEffect.geometry.attributes.position.needsUpdate = true;
            requestAnimationFrame(animate);
        };
        
        animate();
    },
    
    /**
     * Deactivate all portal effects
     */
    deactivateAllPortalEffects: function() {
        Object.values(this.portalEffects).forEach(effect => {
            effect.visible = false;
        });
    },
    
    /**
     * Create animated data streams for cyberpunk aesthetics
     */
    createDataStreams: function() {
        for (let i = 0; i < 3; i++) { // Reduced number of data streams
            const streamPoints = [];
            const segmentCount = 20;
            const radius = 3 + Math.random() * 5;
            const height = 10;
            const angleOffset = Math.random() * Math.PI * 2;
            
            // Create a spiral path for the data stream
            for (let j = 0; j <= segmentCount; j++) {
                const t = j / segmentCount;
                const angle = angleOffset + t * Math.PI * 4;
                const x = Math.cos(angle) * radius;
                const y = t * height;
                const z = Math.sin(angle) * radius;
                
                streamPoints.push(new THREE.Vector3(x, y, z));
            }
            
            const streamCurve = new THREE.CatmullRomCurve3(streamPoints);
            const streamGeometry = new THREE.TubeGeometry(streamCurve, 50, 0.05, 8, false);
            
            // Choose a random color from the neon palette
            const colorKeys = Object.keys(this.colors.neon);
            const colorKey = colorKeys[Math.floor(Math.random() * colorKeys.length)];
            const streamColor = this.colors.neon[colorKey];
            
            const streamMaterial = new THREE.MeshBasicMaterial({
                color: streamColor,
                transparent: true,
                opacity: 0.6,
                blending: THREE.AdditiveBlending
            });
            
            const stream = new THREE.Mesh(streamGeometry, streamMaterial);
            this.scene.add(stream);
            
            // Add animated data packets moving along the stream
            this.createDataPackets(streamCurve, streamColor);
        }
    },
    
    /**
     * Create data packets moving along a stream
     * @param {THREE.Curve} curve - The curve for the packets to follow
     * @param {number} color - The color of the packets
     */
    createDataPackets: function(curve, color) {
        const packetCount = 5 + Math.floor(Math.random() * 5);
        const packets = [];
        
        for (let i = 0; i < packetCount; i++) {
            const packetGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.15);
            const packetMaterial = new THREE.MeshBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });
            
            const packet = new THREE.Mesh(packetGeometry, packetMaterial);
            packet.progress = Math.random(); // Initial position along the curve
            packet.speed = 0.001 + Math.random() * 0.002; // Speed along the curve
            
            this.scene.add(packet);
            packets.push(packet);
        }
        
        // Animate the packets
        const animatePackets = () => {
            packets.forEach(packet => {
                // Update progress along the curve
                packet.progress += packet.speed;
                if (packet.progress > 1) {
                    packet.progress = 0;
                }
                
                // Get point along the curve
                const point = curve.getPointAt(packet.progress);
                packet.position.copy(point);
                
                // Get tangent for orientation
                const tangent = curve.getTangentAt(packet.progress);
                packet.lookAt(point.clone().add(tangent));
                
                // Pulsing effect
                const time = Date.now() * 0.001;
                packet.scale.setScalar(0.8 + Math.sin(time * 5 + packet.progress * 10) * 0.2);
            });
            
            requestAnimationFrame(animatePackets);
        };
        
        animatePackets();
    },
    
    /**
     * Create floating portal displays for each dungeon
     */
    createDungeonPortals: function() {
        // Position portals in a semicircle
        const radius = 4;
        const dungeons = DungeonSystem.dungeons;
        const portalCount = dungeons.length;
        const angleStep = Math.PI / (portalCount - 1);
        
        dungeons.forEach((dungeon, index) => {
            // Calculate position in a semicircle
            const angle = -Math.PI / 2 + angleStep * index;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            this.createDungeonPortal(dungeon, x, 1, z, index);
        });
    },
    
    /**
     * Create an individual dungeon portal display
     * @param {Object} dungeon - Dungeon data object
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @param {number} index - Index for animation offset
     */
    createDungeonPortal: function(dungeon, x, y, z, index) {
        // Create circular base platform
        const platformGeometry = new THREE.CylinderGeometry(1.2, 1.5, 0.2, 32);
        const platformMaterial = new THREE.MeshStandardMaterial({
            color: this.colors.dark.accent,
            metalness: 0.8,
            roughness: 0.2,
            emissive: this.colors.neon.blue,
            emissiveIntensity: 0.2
        });
        
        const platform = new THREE.Mesh(platformGeometry, platformMaterial);
        platform.position.set(x, y - 0.5, z);
        platform.castShadow = true;
        platform.receiveShadow = true;
        this.scene.add(platform);
        
        // Create a glowing ring around the platform
        const glowRingGeometry = new THREE.TorusGeometry(1.3, 0.07, 16, 64);
        const glowColor = this.getDifficultyColor(dungeon.difficulty);
        const glowRingMaterial = new THREE.MeshBasicMaterial({
            color: glowColor,
            transparent: true,
            opacity: 0.7,
            blending: THREE.AdditiveBlending
        });
        
        const glowRing = new THREE.Mesh(glowRingGeometry, glowRingMaterial);
        glowRing.position.set(x, y - 0.4, z);
        glowRing.rotation.x = Math.PI / 2;
        this.scene.add(glowRing);
        
        // Create a circular portal with the dungeon image
        const textureLoader = new THREE.TextureLoader();
        
        // Debug the image paths to verify they are correct
        console.log(`Loading dungeon image for ${dungeon.name}: ${dungeon.backgroundImage}`);
        
        // Fix image path if it doesn't exist (backup images)
        const fixedImagePath = this.validateImagePath(dungeon.backgroundImage, dungeon.id);
        
        // Add error handling for texture loading
        textureLoader.load(
            fixedImagePath,
            (texture) => {
                // Success: Create a circular portal with the loaded texture
                texture.minFilter = THREE.LinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
                
                const portalGeometry = new THREE.CircleGeometry(0.9, 32);
                const portalMaterial = new THREE.MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    opacity: 0.9, // Increased opacity for clearer image
                    side: THREE.DoubleSide
                });
                
                const portal = new THREE.Mesh(portalGeometry, portalMaterial);
                portal.position.set(x, y, z);
                portal.rotation.y = Math.PI / 2; // Face the camera
                portal.userData = { dungeonId: dungeon.id };
                this.scene.add(portal);
                
                this.setupPortalElements(dungeon, portal, platform, glowRing, x, y, z, glowColor);
            },
            undefined,
            (error) => {
                // Error: Use a colored portal instead with a unique pattern
                console.error(`Failed to load texture for dungeon ${dungeon.id}:`, error);
                
                // Create a fallback textured portal (with a procedural texture instead of just a color)
                const portalGeometry = new THREE.CircleGeometry(0.9, 32);
                const portalMaterial = new THREE.MeshBasicMaterial({
                    color: this.getDifficultyColor(dungeon.difficulty),
                    transparent: true,
                    opacity: 0.8,
                    side: THREE.DoubleSide
                });
                
                const portal = new THREE.Mesh(portalGeometry, portalMaterial);
                portal.position.set(x, y, z);
                portal.rotation.y = Math.PI / 2; // Face the camera
                portal.userData = { dungeonId: dungeon.id };
                this.scene.add(portal);
                
                this.setupPortalElements(dungeon, portal, platform, glowRing, x, y, z, glowColor);
            }
        );
    },
    
    /**
     * Set up common portal elements (extracted to avoid code duplication)
     * @param {Object} dungeon - Dungeon data
     * @param {THREE.Mesh} portal - Portal mesh
     * @param {THREE.Mesh} platform - Platform mesh
     * @param {THREE.Mesh} glowRing - Glow ring mesh
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} z - Z position
     * @param {number} glowColor - Color for glow effects
     */
    setupPortalElements: function(dungeon, portal, platform, glowRing, x, y, z, glowColor) {
        // Store the model reference
        this.dungeonModels[dungeon.id] = {
            platform: platform,
            portal: portal,
            glowRing: glowRing,
            isSelected: (DungeonSystem.getCurrentDungeon().id === dungeon.id)
        };
        
        // Create orbiting particles around the portal
        this.createOrbitingParticles(new THREE.Vector3(x, y, z), glowColor);
        
        // Create portal effect for selection
        const portalEffectPosition = new THREE.Vector3(x, y, z);
        this.portalEffects[dungeon.id] = this.createPortalEffect(portalEffectPosition, glowColor);
        
        // If this is the currently selected dungeon, activate its portal effect
        if (this.dungeonModels[dungeon.id].isSelected) {
            this.activatePortalEffect(dungeon.id);
        }
    },
    
    /**
     * Validate image path and provide a fallback if needed
     * @param {string} imagePath - Path to the image
     * @param {string} dungeonId - Dungeon ID for fallback logic
     * @returns {string} - Valid image path
     */
    validateImagePath: function(imagePath, dungeonId) {
        // Backup image paths if the original doesn't exist
        const backupImages = {
            'cyber_slums': 'img/cyber_slums.png',
            'neon_district': 'img/neon_district.png',
            'corporate_plaza': 'img/corporate_plaza.png',
            'data_nexus': 'img/data_nexus.png',
            'quantum_void': 'img/quantum_void.png'
        };
        
        // Check if we have a backup for this dungeon
        if (backupImages[dungeonId]) {
            return backupImages[dungeonId];
        }
        
        return imagePath;
    },
    
    /**
     * Create particles orbiting a portal
     * @param {THREE.Vector3} center - Center position
     * @param {number} color - Particle color
     */
    createOrbitingParticles: function(center, color) {
        const particleCount = 20;
        const particleGeometry = new THREE.BufferGeometry();
        const particlesMaterial = new THREE.PointsMaterial({
            color: color,
            size: 0.05,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        
        // Create particles in a circle
        const particlesPositions = [];
        const particlesAngles = [];
        const particlesRadii = [];
        const particlesSpeeds = [];
        
        for (let i = 0; i < particleCount; i++) {
            // Random angle and fixed radius for circular orbit
            const angle = Math.random() * Math.PI * 2;
            const radius = 1 + Math.random() * 0.2;
            
            // Convert polar to cartesian coordinates
            const x = Math.cos(angle) * radius;
            const y = Math.random() * 0.5 - 0.25;
            const z = Math.sin(angle) * radius;
            
            // Position relative to portal center
            particlesPositions.push(x + center.x, y + center.y, z + center.z);
            
            // Store angle, radius and speed for animation
            particlesAngles.push(angle);
            particlesRadii.push(radius);
            particlesSpeeds.push(0.005 + Math.random() * 0.005);
        }
        
        particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlesPositions, 3));
        particleGeometry.userData = {
            angles: particlesAngles,
            radii: particlesRadii,
            speeds: particlesSpeeds,
            center: center
        };
        
        const particleSystem = new THREE.Points(particleGeometry, particlesMaterial);
        this.scene.add(particleSystem);
        this.particles.push(particleSystem);
        
        // Animate the orbiting particles
        const animateOrbitingParticles = () => {
            const positions = particleSystem.geometry.attributes.position.array;
            const angles = particleSystem.geometry.userData.angles;
            const radii = particleSystem.geometry.userData.radii;
            const speeds = particleSystem.geometry.userData.speeds;
            const center = particleSystem.geometry.userData.center;
            
            for (let i = 0, j = 0; i < positions.length; i += 3, j++) {
                // Update angle based on speed
                angles[j] += speeds[j];
                
                // Calculate new position
                positions[i] = Math.cos(angles[j]) * radii[j] + center.x;
                positions[i+2] = Math.sin(angles[j]) * radii[j] + center.z;
                
                // Add subtle up/down motion
                const time = Date.now() * 0.001;
                positions[i+1] = center.y + Math.sin(time + angles[j] * 2) * 0.1;
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
            requestAnimationFrame(animateOrbitingParticles);
        };
        
        animateOrbitingParticles();
    },
    
    /**
     * Get color based on dungeon difficulty
     * @param {number} difficulty - Dungeon difficulty (1-5)
     * @returns {number} - Color value
     */
    getDifficultyColor: function(difficulty) {
        switch(difficulty) {
            case 1:
                return this.colors.neon.green;
            case 2:
                return this.colors.neon.cyan;
            case 3:
                return this.colors.neon.blue;
            case 4:
                return this.colors.neon.purple;
            case 5:
                return this.colors.neon.magenta;
            default:
                return this.colors.neon.cyan;
        }
    },
    
    /**
     * Handle window resize events
     */
    onWindowResize: function() {
        // First check if all required objects exist
        if (!this.container || !this.camera || !this.renderer) {
            console.warn('Required objects not initialized for resize');
            return;
        }
        
        try {
            // Update camera aspect ratio
            const aspectRatio = this.container.clientWidth / this.container.clientHeight;
            this.camera.aspect = aspectRatio;
            this.camera.updateProjectionMatrix();
            
            // Update renderer size
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        } catch (error) {
            console.error('Error during window resize:', error);
        }
    },
    
    /**
     * Handle mouse move events for hover effects
     * @param {Event} event - Mouse event
     */
    onMouseMove: function(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update the ray caster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check for intersections with dungeon portals
        const intersects = this.raycaster.intersectObjects(
            Object.values(this.dungeonModels).map(model => model.portal)
        );
        
        // Handle hover effects
        Object.values(this.dungeonModels).forEach(model => {
            const isHovered = intersects.length > 0 && intersects[0].object === model.portal;
            
            // Apply hover effect
            if (isHovered && !model.isHovered) {
                // Start hover effect
                model.isHovered = true;
                model.portal.scale.set(1.1, 1.1, 1.1);
                model.glowRing.material.opacity = 1.0;
                
                // Show dungeon name tooltip
                // this.showTooltip(model.portal.userData.dungeonId, model.portal.position);
            } else if (!isHovered && model.isHovered) {
                // End hover effect
                model.isHovered = false;
                model.portal.scale.set(1.0, 1.0, 1.0);
                model.glowRing.material.opacity = 0.7;
                
                // Hide tooltip
                // this.hideTooltip();
            }
        });
    },
    
    /**
     * Handle click events for dungeon selection
     * @param {Event} event - Mouse event
     */
    onClick: function(event) {
        // Calculate mouse position in normalized device coordinates
        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        
        // Update the ray caster
        this.raycaster.setFromCamera(this.mouse, this.camera);
        
        // Check for intersections with dungeon portals
        const intersects = this.raycaster.intersectObjects(
            Object.values(this.dungeonModels).map(model => model.portal)
        );
        
        // Handle click on portal
        if (intersects.length > 0) {
            const portalObject = intersects[0].object;
            const dungeonId = portalObject.userData.dungeonId;
            
            // Select this dungeon
            this.selectDungeon(dungeonId);
        }
    },
    
    /**
     * Select a dungeon
     * @param {string} dungeonId - ID of the dungeon to select
     */
    selectDungeon: function(dungeonId) {
        console.log('Selecting dungeon:', dungeonId);
        
        // Use DungeonSystem to actually select the dungeon
        if (DungeonSystem.selectDungeon(dungeonId)) {
            // Verify audio is playing
            if (typeof AudioSystem !== 'undefined' && !AudioSystem.bgmElement?.paused) {
                console.log('Dungeon music playing successfully');
            } else {
                console.warn('Dungeon music not playing - attempting to restart');
                AudioSystem.playDungeonMusic(dungeonId);
            }
        }
        
        // Update the information panel
        DungeonSystem.updateSelectedDungeonInfo();
    },
    
    /**
     * Main animation loop
     */
    animate: function() {
        if (!this.renderer) return;
        
        this.animationFrameId = requestAnimationFrame(() => this.animate());
        
        // Get delta time for animations
        const delta = this.clock.getDelta();
        
        // Update any mixers
        this.mixers.forEach(mixer => mixer.update(delta));
        
        // Add camera rotation for dynamic view - slower rotation speed
        // const time = Date.now() * 0.0002; // Reduced from 0.0005 to create slower rotation
        // this.camera.position.x = Math.cos(time) * 5;
        // this.camera.position.z = Math.sin(time) * 5;
        // this.camera.lookAt(0, 1, 0); // Look at the center of the scene
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    },
    
    /**
     * Clean up resources
     */
    dispose: function() {
        // Remove event listeners first
        window.removeEventListener('resize', this.onWindowResize.bind(this));
        
        if (this.renderer && this.renderer.domElement) {
            this.renderer.domElement.removeEventListener('mousemove', this.onMouseMove);
            this.renderer.domElement.removeEventListener('click', this.onClick);
        }
        
        // Cancel animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        
        // Dispose of Three.js resources
        this.scene.traverse(object => {
            if (object.geometry) object.geometry.dispose();
            
            if (object.material) {
                // Handle materials that might be arrays
                if (Array.isArray(object.material)) {
                    object.material.forEach(material => this.disposeMaterial(material));
                } else {
                    this.disposeMaterial(object.material);
                }
            }
        });
        
        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        // Clear references
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.mixers = [];
        this.particles = [];
        this.lights = [];
        this.dungeonModels = {};
        this.portalEffects = {};
        this.hologramMaterials = [];
    },
    
    /**
     * Helper to dispose material resources
     * @param {THREE.Material} material - Material to dispose
     */
    disposeMaterial: function(material) {
        if (material.map) material.map.dispose();
        if (material.lightMap) material.lightMap.dispose();
        if (material.bumpMap) material.bumpMap.dispose();
        if (material.normalMap) material.normalMap.dispose();
        if (material.specularMap) material.specularMap.dispose();
        if (material.envMap) material.envMap.dispose();
        if (material.alphaMap) material.alphaMap.dispose();
        if (material.aoMap) material.aoMap.dispose();
        if (material.displacementMap) material.displacementMap.dispose();
        if (material.emissiveMap) material.emissiveMap.dispose();
        if (material.gradientMap) material.gradientMap.dispose();
        if (material.metalnessMap) material.metalnessMap.dispose();
        if (material.roughnessMap) material.roughnessMap.dispose();
        
        material.dispose();
    }
};
