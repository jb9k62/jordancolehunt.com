/* ============================================================================
   IMAGE LIGHTBOX - click a [data-modal-image] thumbnail, view it full-size
   ============================================================================ */

(function () {
  const modal = document.getElementById('image-modal');
  if (!modal) return;

  const modalImg = document.getElementById('image-modal-img');
  const modalCaption = document.getElementById('image-modal-caption');
  const closeBtn = modal.querySelector('.image-modal-close');
  let lastFocused = null;

  function openModal(src, alt, caption) {
    lastFocused = document.activeElement;
    modalImg.src = src;
    modalImg.alt = alt || '';
    modalCaption.textContent = caption || '';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    modalImg.src = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-modal-image]').forEach((trigger) => {
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('aria-label', 'View full-size image');

    const activate = () => {
      const img = trigger.querySelector('img');
      openModal(
        trigger.dataset.src || (img && img.src),
        (img && img.alt) || '',
        trigger.dataset.caption || ''
      );
    };

    trigger.addEventListener('click', activate);
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  closeBtn.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
})();
