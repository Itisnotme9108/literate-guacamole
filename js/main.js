/**
 * Editorial Resort & Intimates - Main JavaScript (Vanilla JS)
 * Handles navigation bar drawer toggle, header scroll elevation & transparency,
 * hero scroll indicator auto-hide, scroll reveal entrance animations, and copyright year update.
 */

document.addEventListener('DOMContentLoaded', () => {
  initSiteLoader();
  initMobileNav();
  initHeaderScroll();
  initHeroScrollIndicator();
  initScrollReveal();
  initGalleryLightbox();
  initCustomCursor();
  initNewsletterForm();
  initAccessibilityHelpers();
  initPageTransitions();
  updateYear();
});

/**
 * Mobile Navigation Menu Toggle with Inert Accessibility
 */
function initMobileNav() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (!menuBtn || !navLinks) return;

  const setNavState = (isOpen) => {
    navLinks.classList.toggle('is-open', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen) {
      navLinks.removeAttribute('aria-hidden');
      navLinks.removeAttribute('inert');
    } else {
      navLinks.setAttribute('aria-hidden', 'true');
      navLinks.setAttribute('inert', '');
    }
  };

  // Set initial hidden state for closed menu
  setNavState(false);

  menuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('is-open');
    setNavState(!isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('is-open')) {
        setNavState(false);
      }
    });
  });
}

/**
 * Header Background opacity on scroll
 */
function initHeaderScroll() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });
}

/**
 * Hero Scroll Indicator Auto-Hide
 */
function initHeroScrollIndicator() {
  const indicator = document.getElementById('heroScrollIndicator');
  if (!indicator) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 120) {
      indicator.style.opacity = '0';
      indicator.style.pointerEvents = 'none';
    } else {
      indicator.style.opacity = '1';
      indicator.style.pointerEvents = 'auto';
    }
  });
}

/**
 * Phase 3b: Gallery Lightbox Modal
 */
function initGalleryLightbox() {
  const lightbox = document.getElementById('galleryLightbox');
  const imgEl = document.getElementById('lightboxImg');
  const captionEl = document.getElementById('lightboxCaption');
  const closeBtn = document.getElementById('lightboxCloseBtn');

  if (!lightbox || !imgEl || !captionEl) return;

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const imgSrc = item.getAttribute('data-img');
      const captionText = item.getAttribute('data-caption');

      imgEl.src = imgSrc;
      captionEl.textContent = captionText || 'Editorial Resort Atelier';

      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeBtn) closeBtn.onclick = closeLightbox;

  lightbox.onclick = (e) => {
    if (e.target === lightbox) closeLightbox();
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('is-open')) {
      closeLightbox();
    }
  });
}

/**
 * Phase 4: Site Loader Dismissal (<1s fade)
 */
function initSiteLoader() {
  const loader = document.getElementById('siteLoader');
  if (!loader) return;
  loader.classList.add('loaded');
}

if (document.readyState === 'interactive' || document.readyState === 'complete') {
  initSiteLoader();
}

/**
 * Desktop Custom Cursor (>=1024px)
 * Centered GPU-accelerated transform positioning for exact pointer alignment.
 */
function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  if (!cursor || window.innerWidth < 1024) return;

  const cursorSpan = cursor.querySelector('span');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;
  let hasMoved = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!hasMoved) {
      hasMoved = true;
      cursor.style.opacity = '0.9';
    }
  });

  function animateCursor() {
    // Smooth lerp (0.32 factor for responsive yet silky-smooth motion)
    cursorX += (mouseX - cursorX) * 0.32;
    cursorY += (mouseY - cursorY) * 0.32;
    
    // translate3d(cursorX, cursorY, 0) + translate(-50%, -50%) centers cursor dot EXACTLY on pointer tip
    cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
    
    requestAnimationFrame(animateCursor);
  }

  requestAnimationFrame(animateCursor);

  // Contextual Hover States & Labels
  document.addEventListener('mouseover', (e) => {
    const galleryItem = e.target.closest('.gallery-item');
    const categoryTile = e.target.closest('.category-tile');
    const productCard = e.target.closest('.product-card, .swatch-btn, .btn-add-cart');
    const fitCard = e.target.closest('.fit-step-card, a[href*="bespoke"]');
    const generalClickable = e.target.closest('a, button, .icon-btn, .favorite-btn');

    if (galleryItem) {
      cursor.classList.add('hovering', 'cursor-large');
      if (cursorSpan) cursorSpan.textContent = 'VIEW ✦';
    } else if (categoryTile) {
      cursor.classList.add('hovering');
      cursor.classList.remove('cursor-large');
      if (cursorSpan) cursorSpan.textContent = 'EXPLORE';
    } else if (productCard) {
      cursor.classList.add('hovering');
      cursor.classList.remove('cursor-large');
      if (cursorSpan) cursorSpan.textContent = '+ ADD';
    } else if (fitCard) {
      cursor.classList.add('hovering');
      cursor.classList.remove('cursor-large');
      if (cursorSpan) cursorSpan.textContent = 'BESPOKE';
    } else if (generalClickable) {
      cursor.classList.add('hovering');
      cursor.classList.remove('cursor-large');
      if (cursorSpan) cursorSpan.textContent = 'SELECT';
    }
  });

  document.addEventListener('mouseout', (e) => {
    const hoverTarget = e.target.closest('.gallery-item, .category-tile, .product-card, .swatch-btn, .btn-add-cart, .fit-step-card, a, button, .icon-btn, .favorite-btn');
    if (hoverTarget) {
      cursor.classList.remove('hovering', 'cursor-large');
    }
  });
}

function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal-on-scroll');
  revealEls.forEach(el => el.classList.add('is-revealed'));

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      }
    });
  }, { threshold: 0.01 });

  revealEls.forEach(el => observer.observe(el));
}

function updateYear() {
  const yearEl = document.getElementById('currentYear');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/**
 * Generates responsive <picture> element HTML (AVIF -> WebP -> JPEG fallback) for local optimized images.
 * @param {string} imgSrc - Relative path to image (e.g. "assets/images/aegean-crochet-dress.jpg")
 * @param {string} altText - Accessible alt text
 * @param {Object} options - Custom options: { pictureClass, imgClass, sizes, width, height, style, loading, fetchpriority }
 * @returns {string} HTML string
 */
function createResponsivePictureHTML(imgSrc, altText, options = {}) {
  if (!imgSrc) return '';

  const alt = altText ? altText.replace(/"/g, '&quot;') : '';
  const imgClassAttr = options.imgClass ? `class="${options.imgClass}"` : '';
  const picClassAttr = options.pictureClass ? `class="${options.pictureClass}"` : '';
  const styleAttr = options.style ? `style="${options.style}"` : '';
  const widthAttr = options.width ? `width="${options.width}"` : '';
  const heightAttr = options.height ? `height="${options.height}"` : '';
  const loadingAttr = options.loading !== undefined ? (options.loading ? `loading="${options.loading}"` : '') : 'loading="lazy"';
  const fetchPriorityAttr = options.fetchpriority ? `fetchpriority="${options.fetchpriority}"` : '';

  // Handle SVG assets
  if (imgSrc.toLowerCase().endsWith('.svg')) {
    const svgPath = imgSrc.includes('assets/images/optimized/')
      ? imgSrc
      : imgSrc.replace('assets/images/', 'assets/images/optimized/');
    return `<img src="${svgPath}" alt="${alt}" ${imgClassAttr} ${widthAttr} ${heightAttr} ${styleAttr} ${loadingAttr} ${fetchPriorityAttr}>`;
  }

  // Determine optimized base path
  let optimizedBase = imgSrc;
  const extMatch = imgSrc.match(/\.(jpg|jpeg|png|webp|avif)$/i);
  if (extMatch) {
    const ext = extMatch[0];
    const pathWithoutExt = imgSrc.slice(0, -ext.length);
    if (!pathWithoutExt.includes('/optimized/')) {
      optimizedBase = pathWithoutExt.replace(/assets\/images\//, 'assets/images/optimized/');
    } else {
      optimizedBase = pathWithoutExt;
    }
  }

  const sizes = options.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

  const avifSrcset = `${optimizedBase}-480.avif 480w, ${optimizedBase}-960.avif 960w, ${optimizedBase}-1600.avif 1600w`;
  const webpSrcset = `${optimizedBase}-480.webp 480w, ${optimizedBase}-960.webp 960w, ${optimizedBase}-1600.webp 1600w`;
  const jpegSrcset = `${optimizedBase}-480.jpg 480w, ${optimizedBase}-960.jpg 960w, ${optimizedBase}-1600.jpg 1600w`;
  const fallbackSrc = `${optimizedBase}-960.jpg`;

  return `<picture ${picClassAttr}>
    <source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}">
    <source type="image/webp" srcset="${webpSrcset}" sizes="${sizes}">
    <source type="image/jpeg" srcset="${jpegSrcset}" sizes="${sizes}">
    <img src="${fallbackSrc}" alt="${alt}" ${imgClassAttr} ${widthAttr} ${heightAttr} ${styleAttr} ${loadingAttr} ${fetchPriorityAttr}>
  </picture>`.replace(/\s+/g, ' ').trim();
}

/**
 * Newsletter Form Submission Handler with Inline Feedback
 */
function initNewsletterForm() {
  const form = document.getElementById('newsletterForm');
  if (!form) return;

  const emailInput = document.getElementById('newsletterEmail');
  const feedback = document.getElementById('newsletterFeedback');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!emailInput || !emailInput.value.trim()) return;

    const email = emailInput.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      if (feedback) {
        feedback.style.color = '#e74c3c';
        feedback.style.fontSize = '0.8rem';
        feedback.style.marginTop = '0.35rem';
        feedback.textContent = 'Please enter a valid email address.';
      }
      return;
    }

    if (feedback) {
      feedback.style.color = 'var(--accent-terracotta)';
      feedback.style.fontSize = '0.82rem';
      feedback.style.marginTop = '0.35rem';
      feedback.textContent = '✦ Thank you for joining our Atelier Dispatch. Check your inbox for private lookbook access.';
    }

    emailInput.value = '';
  });
}

/**
 * Universal Accessibility Helpers: Escape Key & Focus Trap
 */
function initAccessibilityHelpers() {
  // Global Escape key handler to close active overlays
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;

    // Cart drawer
    const cartDrawer = document.getElementById('cartDrawer');
    if (cartDrawer && cartDrawer.classList.contains('is-open')) {
      if (typeof closeCartDrawer === 'function') closeCartDrawer();
      else cartDrawer.classList.remove('is-open');
    }

    // Product Quick View modal
    const productModal = document.getElementById('productModal');
    if (productModal && productModal.classList.contains('is-open')) {
      if (typeof closeProductQuickViewModal === 'function') closeProductQuickViewModal();
      else productModal.classList.remove('is-open');
    }

    // Gallery Lightbox modal
    const galleryLightbox = document.getElementById('galleryLightbox');
    if (galleryLightbox && galleryLightbox.classList.contains('is-open')) {
      galleryLightbox.classList.remove('is-open');
      galleryLightbox.setAttribute('aria-hidden', 'true');
    }

    // Mobile nav
    const navLinks = document.getElementById('navLinks');
    const menuBtn = document.getElementById('mobileMenuBtn');
    if (navLinks && navLinks.classList.contains('is-open')) {
      navLinks.classList.remove('is-open');
      navLinks.setAttribute('aria-hidden', 'true');
      navLinks.setAttribute('inert', '');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  // Ensure interactive gallery items support keyboard navigation (Enter / Space)
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    if (!item.hasAttribute('tabindex')) item.setAttribute('tabindex', '0');
    if (!item.hasAttribute('role')) item.setAttribute('role', 'button');

    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });
}

/**
 * Shared Page Transition System
 */
function initPageTransitions() {
  const links = document.querySelectorAll('a[href$=".html"]');
  if (!links.length) return;

  let overlay = document.querySelector('.page-transition-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    document.body.appendChild(overlay);
  }

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetUrl = link.getAttribute('href');
      if (!targetUrl || link.target === '_blank' || targetUrl.startsWith('#') || e.ctrlKey || e.metaKey) return;

      const currentPath = window.location.pathname.split('/').pop() || 'index.html';
      const targetPath = targetUrl.split('/').pop();
      if (currentPath === targetPath) return;

      e.preventDefault();
      overlay.classList.add('is-active');
      setTimeout(() => {
        window.location.href = targetUrl;
      }, 220);
    });
  });
}
