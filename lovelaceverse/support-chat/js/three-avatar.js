/**
 * Three.js Avatar Module
 * Creates and manages the 3D avatar representation of Shelly
 */

if (typeof window.ThreeAvatar === 'undefined') {
  class ThreeAvatar {
    constructor() {
      // Main properties
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.clock = new THREE.Clock();
      
      // Avatar elements
      this.avatar = null;
      this.coreGeometry = null;
      this.outlineGeometry = null;
      this.particleSystem = null;
      
      // Canvas elements
      this.bubbleCanvas = null;
      this.avatarCanvas = null;
      
      // Animation properties
      this.state = 'idle'; // idle, talking, thinking
      this.animationMixer = null;
      this.animations = {
        idle: null,
        talking: null,
        thinking: null
      };
      
      // Colors
      this.colors = {
        primary: new THREE.Color(0x00ffff),
        secondary: new THREE.Color(0xff00ff),
        background: new THREE.Color(0x0a0f19)
      };
    }

    /**
     * Initialize the 3D avatar
     * @param {HTMLCanvasElement} bubbleCanvas - Canvas for the chat bubble avatar
     * @param {HTMLCanvasElement} avatarCanvas - Canvas for the full avatar view
     */
    async initialize(bubbleCanvas, avatarCanvas) {
      this.bubbleCanvas = bubbleCanvas;
      this.avatarCanvas = avatarCanvas;
      
      // Initialize both canvases
      await this.initializeScene(this.bubbleCanvas, true);
      if (this.avatarCanvas) {
        await this.initializeScene(this.avatarCanvas, false);
      }
      
      // Start the animation loop
      this.animate();
      
      console.log('Three.js avatar initialized');
      return true;
    }

    /**
     * Initialize a Three.js scene for a canvas
     * @param {HTMLCanvasElement} canvas - Canvas element
     * @param {boolean} isSmall - Whether this is the small bubble version
     */
    async initializeScene(canvas, isSmall) {
      // Create scene
      const scene = new THREE.Scene();
      scene.background = null; // Transparent background
      
      // Create camera with perspective
      const camera = new THREE.PerspectiveCamera(
        50, 
        canvas.width / canvas.height, 
        0.1, 
        1000
      );
      
      // Position camera based on size
      if (isSmall) {
        camera.position.z = 5;
      } else {
        camera.position.z = 7;
      }
      
      // Create renderer
      const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true
      });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(canvas.width, canvas.height);
      renderer.outputEncoding = THREE.sRGBEncoding;
      
      // Add ambient light
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      // Add directional light
      const dirLight = new THREE.DirectionalLight(0xffffff, 1);
      dirLight.position.set(5, 5, 5);
      scene.add(dirLight);
      
      // Add point lights for the neon effect
      const pointLight1 = new THREE.PointLight(this.colors.primary, 2, 10);
      pointLight1.position.set(2, 0, 2);
      scene.add(pointLight1);
      
      const pointLight2 = new THREE.PointLight(this.colors.secondary, 2, 10);
      pointLight2.position.set(-2, 0, 2);
      scene.add(pointLight2);
      
      // Create the avatar
      const avatar = await this.createAvatar(isSmall);
      scene.add(avatar);
      
      // Add to class properties based on which canvas this is
      if (isSmall) {
        this.bubbleScene = scene;
        this.bubbleCamera = camera;
        this.bubbleRenderer = renderer;
        this.bubbleAvatar = avatar;
      } else {
        this.avatarScene = scene;
        this.avatarCamera = camera;
        this.avatarRenderer = renderer;
        this.avatarAvatar = avatar;
      }
      
      // Handle resize events
      window.addEventListener('resize', () => this.onWindowResize(isSmall));
    }

    /**
     * Create the 3D avatar model
     * @param {boolean} isSmall - Whether this is the small bubble version
     * @returns {THREE.Group} - 3D avatar group
     */
    async createAvatar(isSmall) {
      const avatarGroup = new THREE.Group();
      
      // Create core - a glowing sphere
      const coreGeometry = new THREE.IcosahedronGeometry(isSmall ? 0.8 : 1.2, 4);
      const coreMaterial = new THREE.MeshPhongMaterial({
        color: this.colors.primary,
        emissive: this.colors.primary,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.7,
        wireframe: true
      });
      
      const core = new THREE.Mesh(coreGeometry, coreMaterial);
      avatarGroup.add(core);
      
      // Create outer shell - larger transparent wireframe
      const shellGeometry = new THREE.IcosahedronGeometry(isSmall ? 1 : 1.5, 2);
      const shellMaterial = new THREE.MeshPhongMaterial({
        color: this.colors.secondary,
        emissive: this.colors.secondary,
        emissiveIntensity: 0.3,
        wireframe: true,
        transparent: true,
        opacity: 0.4
      });
      
      const shell = new THREE.Mesh(shellGeometry, shellMaterial);
      avatarGroup.add(shell);
      
      // Add particle system for sparkle effect
      const particlesGeometry = new THREE.BufferGeometry();
      const particleCount = isSmall ? 50 : 100;
      
      const posArray = new Float32Array(particleCount * 3);
      const sizeArray = new Float32Array(particleCount);
      
      for (let i = 0; i < particleCount; i++) {
        // Random position in a sphere
        const radius = isSmall ? 1.5 : 2;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        
        posArray[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
        posArray[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        posArray[i * 3 + 2] = radius * Math.cos(phi);
        
        sizeArray[i] = Math.random() * 0.05 + 0.02;
      }
      
      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      particlesGeometry.setAttribute('pointSize', new THREE.BufferAttribute(sizeArray, 1));
      
      const particleTexture = new THREE.TextureLoader().load('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAFFmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDAgNzkuMTYwNDUxLCAyMDE3LzA1LzA2LTAxOjA4OjIxICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOCAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMTktMTItMzBUMDE6Mzc6MjArMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjI4KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDE5LTEyLTMwVDAxOjM4OjI4KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgcGhvdG9zaG9wOklDQ1Byb2ZpbGU9InNSR0IgSUVDNjE5NjYtMi4xIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOmJjYjhmMTA3LWE5ZGEtNDAwMS05MTY0LTBhOTQ3YmUyYzU0MCIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpiY2I4ZjEwNy1hOWRhLTQwMDEtOTE2NC0wYTk0N2JlMmM1NDAiIHhtcE1NOk9yaWdpbmFsRG9jdW1lbnRJRD0ieG1wLmRpZDpiY2I4ZjEwNy1hOWRhLTQwMDEtOTE2NC0wYTk0N2JlMmM1NDAiPiA8eG1wTU06SGlzdG9yeT4gPHJkZjpTZXE+IDxyZGY6bGkgc3RFdnQ6YWN0aW9uPSJjcmVhdGVkIiBzdEV2dDppbnN0YW5jZUlEPSJ4bXAuaWlkOmJjYjhmMTA3LWE5ZGEtNDAwMS05MTY0LTBhOTQ3YmUyYzU0MCIgc3RFdnQ6d2hlbj0iMjAxOS0xMi0zMFQwMTozNzoyMCswMTowMCIgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTggKE1hY2ludG9zaCkiLz4gPC9yZGY6U2VxPiA8L3htcE1NOkhpc3Rvcnk+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+wbKXJgAAAMBJREFUWIXt1rENAjEMBVDfI1MwGmTDETEKo0U0iI5pEKNcZDqKKC5n6J0ogH+REO/ZPykpHBFC+Dp6s34opcigZ4Au+Igo73VbCtYM0AWnYikPdLOGB7rhvdA99A+6h07QQHSKL1GDTuPO0Rfo/hWlNjgM0AWXYP+gbdA9NKAb9GToDjrwFeiCLToDusHu0SnQCdrQ0+g06GToBN1Dx/zt31ETNKCboRM0Xcc29GToZOgndMGaU7y9om3v6Ba9h/4B84sun8S+cFoAAAAASUVORK5CYII=');
      
      const particleMaterial = new THREE.PointsMaterial({
        size: 0.1,
        map: particleTexture,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: false
      });
      
      particleMaterial.onBeforeCompile = (shader) => {
        shader.vertexShader = shader.vertexShader.replace(
          'void main() {',
          `
          attribute float pointSize;
          uniform float time;
          void main() {
            float pulsate = sin(time * 5.0 + position.x * 10.0) * 0.5 + 0.5;
          `
        );
        
        shader.vertexShader = shader.vertexShader.replace(
          'gl_PointSize = size;',
          'gl_PointSize = size * (1.0 + pulsate * 0.5);'
        );
        
        shader.uniforms.time = { value: 0 };
        particleMaterial.userData.shader = shader;
      };
      
      const particles = new THREE.Points(particlesGeometry, particleMaterial);
      avatarGroup.add(particles);
      
      // Add rings
      const ringGeometry = new THREE.RingGeometry(isSmall ? 1.2 : 1.8, isSmall ? 1.3 : 1.9, 32);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: this.colors.primary,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.7
      });
      
      const ring1 = new THREE.Mesh(ringGeometry, ringMaterial);
      ring1.rotation.x = Math.PI / 2;
      ring1.rotation.y = Math.PI / 4;
      avatarGroup.add(ring1);
      
      const ring2 = new THREE.Mesh(ringGeometry, ringMaterial.clone());
      ring2.material.color = this.colors.secondary;
      ring2.rotation.x = Math.PI / 2;
      ring2.rotation.z = Math.PI / 4;
      avatarGroup.add(ring2);
      
      // Store references
      if (isSmall) {
        this.bubbleCore = core;
        this.bubbleShell = shell;
        this.bubbleParticles = particles;
        this.bubbleRing1 = ring1;
        this.bubbleRing2 = ring2;
      } else {
        this.avatarCore = core;
        this.avatarShell = shell;
        this.avatarParticles = particles;
        this.avatarRing1 = ring1;
        this.avatarRing2 = ring2;
      }
      
      return avatarGroup;
    }

    /**
     * Handle window resize events
     * @param {boolean} isSmall - Whether this is the small bubble version
     */
    onWindowResize(isSmall) {
      if (isSmall) {
        if (!this.bubbleCanvas) return;
        const width = this.bubbleCanvas.clientWidth;
        const height = this.bubbleCanvas.clientHeight;
        
        this.bubbleCamera.aspect = width / height;
        this.bubbleCamera.updateProjectionMatrix();
        this.bubbleRenderer.setSize(width, height);
      } else {
        if (!this.avatarCanvas) return;
        const width = this.avatarCanvas.clientWidth;
        const height = this.avatarCanvas.clientHeight;
        
        this.avatarCamera.aspect = width / height;
        this.avatarCamera.updateProjectionMatrix();
        this.avatarRenderer.setSize(width, height);
      }
    }

    /**
     * Animation loop
     */
    animate() {
      requestAnimationFrame(() => this.animate());
      
      const delta = this.clock.getDelta();
      const time = this.clock.getElapsedTime();
      
      // Animate bubble avatar if it exists
      if (this.bubbleAvatar) {
        // Rotate the avatar
        this.bubbleAvatar.rotation.y = time * 0.5;
        
        // Animate core
        if (this.bubbleCore) {
          this.bubbleCore.rotation.x = time * 0.3;
          this.bubbleCore.rotation.z = time * 0.2;
          
          // Pulse based on state
          const pulseFactor = this.state === 'talking' ? 
            Math.sin(time * 10) * 0.1 + 1 : 
            Math.sin(time * 3) * 0.05 + 1;
          
          this.bubbleCore.scale.set(pulseFactor, pulseFactor, pulseFactor);
        }
        
        // Animate shell
        if (this.bubbleShell) {
          this.bubbleShell.rotation.x = -time * 0.2;
          this.bubbleShell.rotation.z = -time * 0.1;
        }
        
        // Animate particles
        if (this.bubbleParticles && this.bubbleParticles.material.userData.shader) {
          this.bubbleParticles.material.userData.shader.uniforms.time.value = time;
        }
        
        // Animate rings
        if (this.bubbleRing1) {
          this.bubbleRing1.rotation.x = Math.PI / 2 + Math.sin(time * 0.5) * 0.2;
          this.bubbleRing1.rotation.z = Math.sin(time * 0.3) * 0.2;
        }
        
        if (this.bubbleRing2) {
          this.bubbleRing2.rotation.y = Math.sin(time * 0.4) * 0.2;
          this.bubbleRing2.rotation.z = Math.PI / 4 + Math.sin(time * 0.6) * 0.2;
        }
        
        // Render
        this.bubbleRenderer.render(this.bubbleScene, this.bubbleCamera);
      }
      
      // Animate avatar if it exists
      if (this.avatarAvatar) {
        // Rotate the avatar
        this.avatarAvatar.rotation.y = time * 0.5;
        
        // Animate based on state
        if (this.state === 'talking') {
          // More active animation for talking
          if (this.avatarCore) {
            const talkPulse = Math.sin(time * 15) * 0.1 + 1;
            this.avatarCore.scale.set(talkPulse, talkPulse, talkPulse);
            
            // Change color slightly based on talk animation
            this.avatarCore.material.emissiveIntensity = 0.5 + Math.sin(time * 10) * 0.2;
          }
        } else if (this.state === 'thinking') {
          // Subtle pulsing for thinking state
          if (this.avatarCore) {
            const thinkPulse = Math.sin(time * 5) * 0.1 + 1;
            this.avatarCore.scale.set(thinkPulse, thinkPulse, thinkPulse);
          }
        } else {
          // Idle state - gentle pulsing
          if (this.avatarCore) {
            const idlePulse = Math.sin(time * 2) * 0.05 + 1;
            this.avatarCore.scale.set(idlePulse, idlePulse, idlePulse);
          }
        }
        
        // Animate core
        if (this.avatarCore) {
          this.avatarCore.rotation.x = time * 0.3;
          this.avatarCore.rotation.z = time * 0.2;
        }
        
        // Animate shell
        if (this.avatarShell) {
          this.avatarShell.rotation.x = -time * 0.2;
          this.avatarShell.rotation.z = -time * 0.1;
        }
        
        // Animate particles
        if (this.avatarParticles && this.avatarParticles.material.userData.shader) {
          this.avatarParticles.material.userData.shader.uniforms.time.value = time;
        }
        
        // Animate rings
        if (this.avatarRing1) {
          this.avatarRing1.rotation.x = Math.PI / 2 + Math.sin(time * 0.5) * 0.2;
          this.avatarRing1.rotation.z = Math.sin(time * 0.3) * 0.2;
        }
        
        if (this.avatarRing2) {
          this.avatarRing2.rotation.y = Math.sin(time * 0.4) * 0.2;
          this.avatarRing2.rotation.z = Math.PI / 4 + Math.sin(time * 0.6) * 0.2;
        }
        
        // Render
        this.avatarRenderer.render(this.avatarScene, this.avatarCamera);
      }
    }

    /**
     * Set the avatar state
     * @param {string} state - The state to set: 'idle', 'talking', or 'thinking'
     */
    setState(state) {
      if (['idle', 'talking', 'thinking'].includes(state)) {
        this.state = state;
      }
    }
  }
  window.ThreeAvatar = ThreeAvatar;
}
