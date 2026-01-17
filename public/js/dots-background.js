/**
 * Animated Dot Wave Background
 * Creates a subtle wave-like effect using light-coloured dots with varying opacity
 */

(function() {
  'use strict';

  const canvas = document.createElement('canvas');
  canvas.id = 'dots-background';
  canvas.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: -1;
    pointer-events: none;
  `;
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');

  // Configuration
  const config = {
    dotSpacing: 40,      // Distance between dots
    dotRadius: 1.5,      // Base radius of dots
    baseOpacity: 0.08,   // Minimum opacity
    maxOpacity: 0.25,    // Maximum opacity
    waveSpeed: 0.0008,   // Speed of wave animation
    waveAmplitude: 0.15, // How much opacity varies
    waves: [
      { frequency: 0.02, phase: 0, speed: 1 },
      { frequency: 0.015, phase: 2, speed: 0.7 },
      { frequency: 0.025, phase: 4, speed: 1.3 }
    ]
  };

  let animationId;
  let time = 0;
  let dots = [];

  // Resize canvas to match window
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    ctx.scale(dpr, dpr);

    // Regenerate dot grid
    generateDots();
  }

  // Generate grid of dots
  function generateDots() {
    dots = [];
    const cols = Math.ceil(window.innerWidth / config.dotSpacing) + 1;
    const rows = Math.ceil(window.innerHeight / config.dotSpacing) + 1;

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        dots.push({
          x: i * config.dotSpacing,
          y: j * config.dotSpacing,
          baseX: i * config.dotSpacing,
          baseY: j * config.dotSpacing
        });
      }
    }
  }

  // Calculate wave value at a point
  function getWaveValue(x, y, t) {
    let value = 0;

    config.waves.forEach(wave => {
      const distance = Math.sqrt(x * x + y * y);
      value += Math.sin(distance * wave.frequency + t * wave.speed + wave.phase);
    });

    // Normalise to 0-1 range
    return (value / config.waves.length + 1) / 2;
  }

  // Animation loop
  function animate() {
    time += config.waveSpeed * 16; // Approximate frame time

    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    // Use cream/sand colour from the palette
    const dotColor = '245, 235, 224'; // RGB of --cream

    dots.forEach(dot => {
      const waveValue = getWaveValue(dot.baseX, dot.baseY, time);
      const opacity = config.baseOpacity + (waveValue * config.waveAmplitude);

      ctx.beginPath();
      ctx.arc(dot.x, dot.y, config.dotRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${dotColor}, ${opacity})`;
      ctx.fill();
    });

    animationId = requestAnimationFrame(animate);
  }

  // Handle visibility change to pause animation when tab is hidden
  function handleVisibilityChange() {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  }

  // Initialise
  function init() {
    resize();
    animate();

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', handleVisibilityChange);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
