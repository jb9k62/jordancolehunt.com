/* ============================================================================
   IMAGE LIGHTBOX - click a [data-modal-image] thumbnail, view it full-size.
   Thumbnails sharing a data-gallery id become a navigable gallery (prev/next,
   arrow keys, counter); a thumbnail without one is just a single image.
   ============================================================================ */

(function () {
  const modal = document.getElementById('image-modal');
  if (!modal) return;

  const modalImg = document.getElementById('image-modal-img');
  const modalCaption = document.getElementById('image-modal-caption');
  const modalCounter = document.getElementById('image-modal-counter');
  const closeBtn = modal.querySelector('.image-modal-close');
  const prevBtn = modal.querySelector('.image-modal-prev');
  const nextBtn = modal.querySelector('.image-modal-next');
  let lastFocused = null;
  let currentGallery = [];
  let currentIndex = 0;

  function render() {
    const item = currentGallery[currentIndex];
    if (!item) return;
    modalImg.src = item.src;
    modalImg.alt = item.alt;
    modalCaption.textContent = item.caption;

    const multi = currentGallery.length > 1;
    prevBtn.hidden = !multi;
    nextBtn.hidden = !multi;
    modalCounter.textContent = multi
      ? (currentIndex + 1) + ' / ' + currentGallery.length
      : '';
  }

  function openModal(gallery, index) {
    lastFocused = document.activeElement;
    currentGallery = gallery;
    currentIndex = index;
    render();
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

  function showPrev() {
    if (currentGallery.length < 2) return;
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    render();
  }

  function showNext() {
    if (currentGallery.length < 2) return;
    currentIndex = (currentIndex + 1) % currentGallery.length;
    render();
  }

  // Group triggers by data-gallery; ungrouped triggers each form a
  // single-item gallery of their own.
  const galleries = new Map();
  let soloCount = 0;

  document.querySelectorAll('[data-modal-image]').forEach((trigger) => {
    trigger.setAttribute('tabindex', '0');
    trigger.setAttribute('role', 'button');
    trigger.setAttribute('aria-label', 'View full-size image');

    const img = trigger.querySelector('img');
    const item = {
      src: trigger.dataset.src || (img && img.src) || '',
      alt: (img && img.alt) || '',
      caption: trigger.dataset.caption || '',
    };

    const groupId = trigger.dataset.gallery || '__solo-' + soloCount++;
    if (!galleries.has(groupId)) galleries.set(groupId, []);
    const gallery = galleries.get(groupId);
    const indexInGallery = gallery.length;
    gallery.push(item);

    const activate = () => openModal(gallery, indexInGallery);

    trigger.addEventListener('click', activate);
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  closeBtn.addEventListener('click', closeModal);
  prevBtn.addEventListener('click', showPrev);
  nextBtn.addEventListener('click', showNext);

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
})();
