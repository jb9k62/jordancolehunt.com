/* ============================================================================
   GSAP ANIMATIONS - Modern & Minimal Website
   ============================================================================

   Animation philosophy:
   - Subtle and purposeful
   - 0.3s - 0.8s duration (feels responsive)
   - Smooth easing (power2.out, power3.out)
   - Staggered reveals for content

   ============================================================================ */

// Store animation timelines for cleanup
let activeTimelines = [];

// Main animation initialization
function initAnimations() {
  // Check if GSAP is loaded
  if (typeof gsap === 'undefined') {
    console.warn('⚠️ GSAP not loaded - animations disabled');
    return;
  }

  const currentPage = document.body.getAttribute('data-page');
  const pathname = window.location.pathname;

  // Initialize animations based on current page
  if (currentPage === 'home' || pathname === '/') {
    initHomeAnimations();
  }
}

// Cleanup function to kill active animations
function cleanupAnimations() {
  // Kill all active timelines
  activeTimelines.forEach(tl => {
    if (tl && tl.kill) {
      tl.kill();
    }
  });
  activeTimelines = [];

  // Kill all GSAP animations
  if (typeof gsap !== 'undefined') {
    gsap.killTweensOf('*');
  }

  // Remove data-animated attributes
  document.querySelectorAll('[data-animated]').forEach(el => {
    el.removeAttribute('data-animated');
  });
}

// ============================================================================
// HOME PAGE ANIMATIONS
// ============================================================================
function initHomeAnimations() {
  // JCH Logo Staggered Letter Reveal
  const jchLogo = document.querySelector('.logo');
  if (jchLogo && !jchLogo.hasAttribute('data-animated')) {
    // Split text into individual characters
    const text = jchLogo.textContent.trim();
    const chars = text.split('');
    jchLogo.innerHTML = chars.map(char =>
      `<span class="char">${char}</span>`
    ).join('');

    // Delay animation to start AFTER view transition completes (0.3s + buffer)
    // This prevents flicker in Chromium browsers
    const logoTl = gsap.from('.logo .char', {
      duration: 0.8,
      y: 60,
      opacity: 0,
      stagger: 0.20,
      ease: 'power3.out',
      delay: 0.4, // Start after view transition ends
      onComplete: () => {
        jchLogo.setAttribute('data-animated', 'true');
      }
    });
    activeTimelines.push(logoTl);
  }

  // Hero Section Staggered Animations
  const heroElements = [
    '.hero-content .bounce'
  ];

  // Check if elements exist before animating
  const existingElements = heroElements.filter(selector =>
    document.querySelector(selector)
  );

  if (existingElements.length > 0) {
    // Realistic bouncing ball animation - starts high, bounces with decreasing height
    const heroTl = gsap.timeline({
      repeat: -1,
      repeatDelay: 1.5
    });

    // Define bounce parameters: [height, duration]
    const bounces = [
      [30, 0.4],   // First bounce - highest
      [15, 0.3],   // Second bounce - medium
      [5, 0.2],   // Third bounce - small
      [3, 0.15]    // Final bounce - tiny
    ];

    // Generate bounce animations
    bounces.forEach(([height, duration]) => {
      heroTl
        .to(existingElements, { y: -height, duration, ease: 'power2.out' })
        .to(existingElements, { y: 0, duration, ease: 'power2.in' });
    });

    activeTimelines.push(heroTl);
  }
}

// Export functions for global access
window.initAnimations = initAnimations;
window.cleanupAnimations = cleanupAnimations;

// Run on initial page load
document.addEventListener('DOMContentLoaded', initAnimations);

// Log initialization
console.log('✨ GSAP animations initialized');
