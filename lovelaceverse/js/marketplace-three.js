/**
 * Cyberpunk-themed Marketplace Environment using Three.js
 */

const MarketplaceThreeEnvironment = {
    // Three.js components
    scene: null,
    camera: null,
    renderer: null,
    container: null,
    clock: null,
    particles: [],
    lights: [],
    
    // Animation properties
    animationFrameId: null,
    isAnimating: false,
    
    /**
     * Initialize the Three.js environment for marketplace
     */
    init: function(containerId = 'marketplace-three-container') {
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
            
            // Create container if it doesn't exist
            this.container = document.getElementById(containerId);
            
            if (!this.container) {
                console.error('Three.js container not found: ' + containerId);
                return false;
            }
            
            // Set up scene
            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x050a15);
            this.scene.fog = new THREE.FogExp2(0x050a15, 0.02);
            
            // Set up camera
            const aspectRatio = this.container.clientWidth / this.container.clientHeight;
            this.camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
            this.camera.position.set(0, 0, 5);
            
            // Set up renderer
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            
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
            
            console.log('Marketplace Three.js environment initialized');
            return true;
        } catch (error) {
            console.error('Error initializing Marketplace Three.js:', error);
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
        const directionalLight = new THREE.DirectionalLight(0xff00cc, 0.7);
        directionalLight.position.set(1, 1, 2);
        this.scene.add(directionalLight);
        this.lights.push(directionalLight);
        
        // Additional point lights for cyberpunk feel
        const pointLight1 = new THREE.PointLight(0xff00cc, 1, 10);
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
        const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0xff00cc, 0x00f0ff);
        gridHelper.position.y = -2;
        this.scene.add(gridHelper);
        
        // Add a plane to catch shadows
        const planeGeometry = new THREE.PlaneGeometry(gridSize, gridSize);
        const planeMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x050a15,
            transparent: true,
            opacity: 0.5,
            roughness: 0.8,
            metalness: 0.2
        });
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.rotation.x = -Math.PI / 2;
        plane.position.y = -2;
        this.scene.add(plane);
    },
    
    /**
     * Set up additional environment elements
     */
    setupEnvironment: function() {
        // Create floating digital particles
        this.createDigitalParticles(150);
        
        // Add holographic elements
        this.createHolographicElements();
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
            opacity: 0.6,
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
        
        // Create another set with different color
        const particlesMaterial2 = new THREE.PointsMaterial({
            color: 0xff00cc,
            size: 0.05,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });
        
        const particleSystem2 = new THREE.Points(particleGeometry.clone(), particlesMaterial2);
        this.scene.add(particleSystem2);
        this.particles.push(particleSystem2);
    },
    
    /**
     * Create holographic elements for the marketplace
     */
    createHolographicElements: function() {
        // Create floating shopping cart icon
        this.createShoppingCartIcon();
        
        // Create floating currency symbols
        this.createCurrencySymbols();
        
        // Create data stream effects
        this.createDataStreams();
    },
    
    /**
     * Create a holographic shopping cart icon
     */
    createShoppingCartIcon: function() {
        // Create a simple shopping cart icon using cubes and cylinders
        const cartGroup = new THREE.Group();
        
        // Cart base
        const baseGeometry = new THREE.BoxGeometry(0.6, 0.3, 0.4);
        const baseMaterial = new THREE.MeshPhongMaterial({
            color: 0xff00cc,
            transparent: true,
            opacity: 0.5,
            wireframe: true
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        cartGroup.add(base);
        
        // Cart handle
        const handleGeometry = new THREE.TorusGeometry(0.15, 0.02, 8, 12, Math.PI);
        const handleMaterial = new THREE.MeshPhongMaterial({
            color: 0x00f0ff,
            transparent: true,
            opacity: 0.5,
            wireframe: true
        });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.rotation.x = Math.PI / 2;
        handle.position.set(0, 0.15, -0.2);
        cartGroup.add(handle);
        
        // Cart wheels (small spheres)
        const wheelGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const wheelMaterial = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.5,
            wireframe: true
        });
        
        // Add four wheels
        const wheelPositions = [
            [-0.2, -0.2, 0.15], // Front left
            [0.2, -0.2, 0.15],  // Front right
            [-0.2, -0.2, -0.15], // Back left
            [0.2, -0.2, -0.15]   // Back right
        ];
        
        wheelPositions.forEach(pos => {
            const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
            wheel.position.set(...pos);
            cartGroup.add(wheel);
        });
        
        // Position the cart and add it to the scene
        cartGroup.position.set(-2, 0, 0);
        this.scene.add(cartGroup);
        
        // Animate the cart
        this.animateObject(cartGroup, { 
            rotate: true, 
            float: true,
            floatSpeed: 0.5,
            floatHeight: 0.2
        });
    },
    
    /**
     * Create floating currency symbols
     */
    createCurrencySymbols: function() {
        const fontLoader = new THREE.FontLoader();
        
        // Since FontLoader is asynchronous and we may not have access to actual font loading,
        // we'll create simplified currency symbols using basic geometry
        
        // Create copper symbol (C in a circle)
        const copperGroup = new THREE.Group();
        
        // Circle
        const circleGeometry = new THREE.TorusGeometry(0.2, 0.02, 16, 32);
        const copperMaterial = new THREE.MeshPhongMaterial({
            color: 0xcc7722,
            transparent: true,
            opacity: 0.7,
            wireframe: true
        });
        const copperCircle = new THREE.Mesh(circleGeometry, copperMaterial);
        copperGroup.add(copperCircle);
        
        // C shape (partial torus)
        const cGeometry = new THREE.TorusGeometry(0.1, 0.02, 8, 16, Math.PI);
        const c = new THREE.Mesh(cGeometry, copperMaterial);
        c.rotation.y = Math.PI / 2;
        copperGroup.add(c);
        
        copperGroup.position.set(2, 1, 1);
        this.scene.add(copperGroup);
        
        // Create silver symbol (S in a circle)
        const silverGroup = new THREE.Group();
        
        // Circle
        const silverMaterial = new THREE.MeshPhongMaterial({
            color: 0xcccccc,
            transparent: true,
            opacity: 0.7,
            wireframe: true
        });
        const silverCircle = new THREE.Mesh(circleGeometry.clone(), silverMaterial);
        silverGroup.add(silverCircle);
        
        // S shape (two partial tori)
        const s1Geometry = new THREE.TorusGeometry(0.1, 0.02, 8, 16, Math.PI);
        const s1 = new THREE.Mesh(s1Geometry, silverMaterial);
        s1.rotation.y = Math.PI / 2;
        s1.position.y = 0.05;
        silverGroup.add(s1);
        
        const s2Geometry = new THREE.TorusGeometry(0.1, 0.02, 8, 16, Math.PI);
        const s2 = new THREE.Mesh(s2Geometry, silverMaterial);
        s2.rotation.y = -Math.PI / 2;
        s2.position.y = -0.05;
        silverGroup.add(s2);
        
        silverGroup.position.set(2, 0, 1);
        this.scene.add(silverGroup);
        
        // Create gold symbol (G in a circle)
        const goldGroup = new THREE.Group();
        
        // Circle
        const goldMaterial = new THREE.MeshPhongMaterial({
            color: 0xffcc00,
            transparent: true,
            opacity: 0.7,
            wireframe: true
        });
        const goldCircle = new THREE.Mesh(circleGeometry.clone(), goldMaterial);
        goldGroup.add(goldCircle);
        
        // G shape (partial torus with line)
        const gGeometry = new THREE.TorusGeometry(0.1, 0.02, 8, 16, Math.PI * 1.5);
        const g = new THREE.Mesh(gGeometry, goldMaterial);
        g.rotation.y = Math.PI / 2;
        goldGroup.add(g);
        
        // Add the line part of the G
        const lineGeometry = new THREE.BoxGeometry(0.12, 0.02, 0.02);
        const line = new THREE.Mesh(lineGeometry, goldMaterial);
        line.position.set(0, 0, 0.08);
        goldGroup.add(line);
        
        goldGroup.position.set(2, -1, 1);
        this.scene.add(goldGroup);
        
        // Animate the symbols
        this.animateObject(copperGroup, { rotate: true, float: true });
        this.animateObject(silverGroup, { rotate: true, float: true, floatPhase: Math.PI / 3 });
        this.animateObject(goldGroup, { rotate: true, float: true, floatPhase: Math.PI * 2 / 3 });
    },
    
    /**
     * Create data stream effects
     */
    createDataStreams: function() {
        // Create multiple data streams using lines
        const streamCount = 6;
        const streamPointsCount = 15;
        
        for (let i = 0; i < streamCount; i++) {
            // Create a curved path for each stream
            const curve = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-5 + Math.random() * 10, 3 + Math.random() * 2, -5 + Math.random() * 10),
                new THREE.Vector3(-3 + Math.random() * 6, 1 + Math.random() * 2, -3 + Math.random() * 6),
                new THREE.Vector3(-1 + Math.random() * 2, -1 + Math.random() * 2, -1 + Math.random() * 2),
                new THREE.Vector3(-3 + Math.random() * 6, -3 + Math.random() * 2, -3 + Math.random() * 6)
            ]);
            
            const points = curve.getPoints(streamPointsCount);
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            
            // Alternate colors between cyan and magenta
            const color = i % 2 === 0 ? 0x00f0ff : 0xff00cc;
            
            const material = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.6
            });
            
            const line = new THREE.Line(geometry, material);
            this.scene.add(line);
            
            // Create animated data packets (small spheres) moving along the line
            this.createDataPackets(curve, color, 2 + Math.floor(Math.random() * 3));
        }
    },
    
    /**
     * Create animated data packets that move along a curve
     * @param {THREE.CatmullRomCurve3} curve - The curve to follow
     * @param {number} color - Packet color
     * @param {number} count - Number of packets
     */
    createDataPackets: function(curve, color, count) {
        const packetGeometry = new THREE.SphereGeometry(0.04, 8, 8);
        const packetMaterial = new THREE.MeshPhongMaterial({
            color: color,
            transparent: true,
            opacity: 0.8,
            emissive: color,
            emissiveIntensity: 0.5
        });
        
        for (let i = 0; i < count; i++) {
            const packet = new THREE.Mesh(packetGeometry, packetMaterial);
            this.scene.add(packet);
            
            // Store the packet data for animation
            const speed = 0.2 + Math.random() * 0.3; // Random speed
            const initialOffset = Math.random(); // Random starting position on curve
            
            // Add packet to animation loop
            this.animateAlongCurve(packet, curve, speed, initialOffset);
        }
    },
    
    /**
     * Animate an object along a curve
     * @param {THREE.Object3D} object - Object to animate
     * @param {THREE.CatmullRomCurve3} curve - Curve to follow
     * @param {number} speed - Movement speed
     * @param {number} initialOffset - Starting position (0-1)
     */
    animateAlongCurve: function(object, curve, speed, initialOffset = 0) {
        let progress = initialOffset;
        
        const animate = () => {
            progress = (progress + speed * 0.001) % 1;
            const position = curve.getPointAt(progress);
            object.position.copy(position);
            
            requestAnimationFrame(animate);
        };
        
        animate();
    },
    
    /**
     * Animate an object with various effects
     * @param {THREE.Object3D} object - Object to animate
     * @param {Object} options - Animation options
     */
    animateObject: function(object, options = {}) {
        const defaults = {
            rotate: false,
            rotateSpeed: 0.3,
            rotateAxis: 'y',
            float: false,
            floatSpeed: 0.7,
            floatHeight: 0.1,
            floatPhase: 0
        };
        
        const config = { ...defaults, ...options };
        let time = config.floatPhase;
        
        const animate = () => {
            time += 0.01;
            
            // Rotation
            if (config.rotate) {
                object.rotation[config.rotateAxis] += 0.01 * config.rotateSpeed;
            }
            
            // Floating
            if (config.float) {
                object.position.y = object.position.y - config.floatHeight / 2 + 
                                   Math.sin(time * config.floatSpeed) * config.floatHeight / 2;
            }
            
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
        
        // Animate particles
        this.particles.forEach((particles, index) => {
            particles.rotation.y += 0.0007 * (index % 2 === 0 ? 1 : -1);
            particles.rotation.x += 0.0004 * (index % 2 === 0 ? 1 : -1);
        });
        
        // Animate lights
        this.animateLights();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    },
    
    /**
     * Animate lights for cyberpunk effect
     */
    animateLights: function() {
        const time = Date.now() * 0.001;
        
        this.lights.forEach((light, index) => {
            if (index > 0) { // Skip the first directional light
                light.position.x = Math.sin(time * 0.5 + index) * 3;
                light.position.z = Math.cos(time * 0.3 + index) * 3;
                light.position.y = Math.sin(time * 0.2 + index) * 2;
                
                // Change intensity slightly for pulsing effect
                light.intensity = 1 + Math.sin(time * 1.5 + index) * 0.3;
            }
        });
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
        this.particles = [];
        this.lights = [];
    }
};
