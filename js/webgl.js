/**
 * Editorial Resort & Intimates - WebGL 3D System (Phase 1: Woven Curtain Reveal)
 * Modular, additive WebGL engine using Three.js GLSL procedural thread shader.
 */

(function () {
  'use me';

  // Perform immediate skip checks before loading any 3D scripts
  const isHomepage = Boolean(document.getElementById('heroSection'));
  const isCurtainDismissed = sessionStorage.getItem('editorial_curtain_shown') === 'true';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isLowEndOrMobile = window.innerWidth < 768 || (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4);

  function dispatchCurtainComplete() {
    window.__curtainComplete = true;
    sessionStorage.setItem('editorial_curtain_shown', 'true');
    window.dispatchEvent(new CustomEvent('curtainComplete'));
  }

  // If not homepage, already shown, low-end, or reduced motion: skip immediately
  if (!isHomepage || isCurtainDismissed || prefersReducedMotion || isLowEndOrMobile) {
    dispatchCurtainComplete();
    return;
  }

  // Lazy-load Three.js CDN only when first visit checks pass
  loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js', () => {
    if (typeof THREE === 'undefined') {
      console.warn('Three.js failed to load. Skipping WebGL curtain.');
      finishCurtainImmediate();
      return;
    }
    initWovenCurtain();
  });

  function loadScript(src, callback) {
    const script = document.createElement('script');
    script.src = src;
    script.onload = callback;
    script.onerror = () => {
      console.warn('WebGL CDN script load error.');
      finishCurtainImmediate();
    };
    document.head.appendChild(script);
  }

  function finishCurtainImmediate() {
    dispatchCurtainComplete();
  }

  /**
   * Phase 1: Woven Thread Procedural GLSL Curtain Reveal
   */
  function initWovenCurtain() {
    const canvas = document.createElement('canvas');
    canvas.id = 'curtainCanvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9998;pointer-events:none;transition:opacity 0.4s ease;';
    document.body.appendChild(canvas);

    let renderer, scene, camera, material, mesh, animationFrameId;
    let progress = 0;
    const duration = 1.25; // 1.25 seconds intro
    const startTime = performance.now();

    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: false });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

      const geometry = new THREE.PlaneGeometry(2, 2);

      const uniforms = {
        uProgress: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uTime: { value: 0.0 }
      };

      const vertexShader = `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `;

      const fragmentShader = `
        uniform float uProgress;
        uniform vec2 uResolution;
        uniform float uTime;
        varying vec2 vUv;

        // Procedural unbleached linen thread weave pattern
        float wovenPattern(vec2 uv) {
          vec2 grid = fract(uv * 45.0);
          float threadX = smoothstep(0.08, 0.42, abs(grid.x - 0.5));
          float threadY = smoothstep(0.08, 0.42, abs(grid.y - 0.5));
          vec2 cell = floor(uv * 45.0);
          float weave = mod(cell.x + cell.y, 2.0);
          return mix(threadX, threadY, weave);
        }

        void main() {
          vec2 uv = vUv;
          vec2 center = vec2(0.5, 0.5);
          
          // Subtle wave distortion along opening edge
          float wave = sin(uv.y * 14.0 + uTime * 4.0) * 0.035;
          float dist = distance(uv, center) + wave;
          
          // Opening curtain threshold radius
          float threshold = uProgress * 1.25;
          
          if (dist < threshold) {
            discard; // Unravels and reveals hero image beneath
          }

          float weave = wovenPattern(uv);
          vec3 linenBase = vec3(0.98, 0.96, 0.94);     // #FAF7F2
          vec3 threadShadow = vec3(0.91, 0.88, 0.84);  // #EAE2D8
          vec3 terracotta = vec3(0.72, 0.32, 0.22);    // #B85338

          vec3 color = mix(threadShadow, linenBase, weave);
          color = mix(color, terracotta, step(0.97, sin(uv.x * 150.0)) * 0.12);

          // Edge fade around opening boundary
          float edgeAlpha = smoothstep(threshold, threshold + 0.08, dist);

          gl_FragColor = vec4(color, edgeAlpha * 0.98);
        }
      `;

      material = new THREE.ShaderMaterial({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms: uniforms,
        transparent: true
      });

      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      function render(now) {
        const elapsed = (now - startTime) / 1000;
        progress = Math.min(elapsed / duration, 1.0);

        uniforms.uProgress.value = progress;
        uniforms.uTime.value = elapsed;

        renderer.render(scene, camera);

        if (progress < 1.0) {
          animationFrameId = requestAnimationFrame(render);
        } else {
          cleanUpWebGL();
        }
      }

      function cleanUpWebGL() {
        cancelAnimationFrame(animationFrameId);
        
        // Fade out canvas and signal GSAP hero entrance
        canvas.style.opacity = '0';

        setTimeout(() => {
          if (renderer) renderer.dispose();
          if (geometry) geometry.dispose();
          if (material) material.dispose();
          if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);

          dispatchCurtainComplete();
        }, 400);
      }

      animationFrameId = requestAnimationFrame(render);

    } catch (err) {
      console.warn('WebGL init error, falling back to CSS entrance:', err);
      if (canvas && canvas.parentNode) canvas.parentNode.removeChild(canvas);
      finishCurtainImmediate();
    }
  }
})();
