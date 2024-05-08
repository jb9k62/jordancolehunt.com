/* ============================================================================
   VIEW TRANSITIONS - Debug & Support Detection
   ============================================================================ */

// Check browser support
const supportsViewTransitions = 'startViewTransition' in document;
const supportsAtRule = typeof CSS !== 'undefined' && CSS.supports ?
  CSS.supports('selector(::view-transition)') : false;

// Log support status
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 VIEW TRANSITIONS DEBUG');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(`API Support: ${supportsViewTransitions ? '✅' : '❌'}`);
console.log(`Cross-document Support: ${supportsAtRule ? '✅' : '❌'}`);
console.log(`Browser: ${navigator.userAgent.match(/Chrome\/(\d+)|Safari\/(\d+)|Firefox\/(\d+)/)?.[0] || 'Unknown'}`);

if (!supportsAtRule) {
  console.log('\n⚠️  Cross-document view transitions NOT supported');
  console.log('📋 Requirements:');
  console.log('   • Chrome 126+');
  console.log('   • Safari 18.2+');
  console.log('   • Firefox 144+ (Oct 2025)');
  console.log('\n💡 Update your browser to see transitions');
} else {
  console.log('\n✅ View transitions are enabled!');
  console.log('🎨 Click any navigation link to see the effect');
}
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

/* ============================================================================
   ANIMATION LIFECYCLE MANAGEMENT
   ============================================================================ */

// Re-initialize GSAP animations after navigation from cache
window.addEventListener('pageshow', (event) => {
  if (event.persisted && window.initAnimations) {
    window.cleanupAnimations?.();
    setTimeout(window.initAnimations, 50);
  }
});

// Cleanup before navigation
window.addEventListener('beforeunload', () => {
  window.cleanupAnimations?.();
});
