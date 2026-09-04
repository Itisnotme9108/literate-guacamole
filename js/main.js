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
  updateYear();
});

/**
 * Mobile Navigation Menu Toggle
 */
function initMobileNav() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('is-open')) {
        navLinks.classList.remove('is-open');
        menuBtn.setAttribute('aria-expanded', 'false');
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
 * Phase 4: Desktop Custom Cursor (>=1024px)
 */
function initCustomCursor() {
  const cursor = document.getElementById('customCursor');
  if (!cursor || window.innerWidth < 1024) return;

  let mouseX = 0, mouseY = 0;
  let cursorX = 0, cursorY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    cursorX += (mouseX - cursorX) * 0.25;
    cursorY += (mouseY - cursorY) * 0.25;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
    requestAnimationFrame(animateCursor);
  }

  requestAnimationFrame(animateCursor);

  const hoverableSelector = 'a, button, .product-card, .category-tile, .gallery-item, .swatch-btn, .favorite-btn';

  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverableSelector)) {
      cursor.classList.add('hovering');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverableSelector)) {
      cursor.classList.remove('hovering');
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

const CLOUDINARY_CLOUD_NAME = 'dl4xxbq4';

function getCloudinaryUrl(src, width, format = null) {
  if (!src) return '';

  const formatOpt = format ? `f_${format},` : 'f_auto,';

  // 1. Direct Cloudinary upload URL or public ID
  if (src.includes('res.cloudinary.com')) {
    const parts = src.split('/upload/');
    if (parts.length > 1) {
      let rest = parts[1].replace(/^(f_auto,q_auto,w_\d+\/|f_auto,q_auto\/|f_[a-z]+,q_auto,w_\d+\/)/, '');
      return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${formatOpt}q_auto,w_${width}/${rest}`;
    }
  }

  // 2. Specific public ID check for Mallorca dress
  if (src.includes('aegean-crochet-dress')) {
    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${formatOpt}q_auto,w_${width}/aegean-crochet-dress`;
  }

  // 3. SVG assets stay local / SVG
  if (src.endsWith('.svg')) {
    return src;
  }

  // 4. Fetch mode for all other images hosted on Vercel
  const cleanPath = src.replace(/^\.\.\//, '').replace(/^\//, '');
  const absoluteUrl = `https://literate-guacamole-rho.vercel.app/${cleanPath}`;
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${formatOpt}q_auto,w_${width}/${absoluteUrl}`;
}

/**
 * Generates responsive <picture> element HTML (AVIF -> WebP -> JPEG fallback) using Cloudinary delivery URLs.
 * @param {string} imgSrc - Relative path or Cloudinary URL
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

  if (imgSrc.toLowerCase().endsWith('.svg')) {
    return `<img src="${imgSrc}" alt="${alt}" ${imgClassAttr} ${widthAttr} ${heightAttr} ${styleAttr} ${loadingAttr} ${fetchPriorityAttr}>`;
  }

  const sizes = options.sizes || '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw';

  const avifSrcset = `${getCloudinaryUrl(imgSrc, 480, 'avif')} 480w, ${getCloudinaryUrl(imgSrc, 960, 'avif')} 960w, ${getCloudinaryUrl(imgSrc, 1600, 'avif')} 1600w`;
  const webpSrcset = `${getCloudinaryUrl(imgSrc, 480, 'webp')} 480w, ${getCloudinaryUrl(imgSrc, 960, 'webp')} 960w, ${getCloudinaryUrl(imgSrc, 1600, 'webp')} 1600w`;
  const jpegSrcset = `${getCloudinaryUrl(imgSrc, 480, 'jpg')} 480w, ${getCloudinaryUrl(imgSrc, 960, 'jpg')} 960w, ${getCloudinaryUrl(imgSrc, 1600, 'jpg')} 1600w`;
  const fallbackSrc = getCloudinaryUrl(imgSrc, 960);

  return `<picture ${picClassAttr}>
    <source type="image/avif" srcset="${avifSrcset}" sizes="${sizes}">
    <source type="image/webp" srcset="${webpSrcset}" sizes="${sizes}">
    <source type="image/jpeg" srcset="${jpegSrcset}" sizes="${sizes}">
    <img src="${fallbackSrc}" alt="${alt}" ${imgClassAttr} ${widthAttr} ${heightAttr} ${styleAttr} ${loadingAttr} ${fetchPriorityAttr}>
  </picture>`.replace(/\s+/g, ' ').trim();
}
