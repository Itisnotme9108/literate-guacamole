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
  initSearchOverlay();
  initWishlistUI();
  syncActiveNavLinks();
  updateYear();
});

function syncActiveNavLinks() {
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const cleanHref = href.replace(/\/$/, '') || '/';
    if (cleanHref === currentPath || (cleanHref !== '/' && currentPath.startsWith(cleanHref))) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

/**
 * Mobile Navigation Menu Toggle with Inert Accessibility
 */
function initMobileNav() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const navLinks = document.getElementById('navLinks');

  if (!menuBtn || !navLinks) return;

  const setNavState = (isOpen) => {
    const isMobile = window.innerWidth < 768;
    navLinks.classList.toggle('is-open', isOpen);
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    
    if (isMobile) {
      if (isOpen) {
        navLinks.removeAttribute('aria-hidden');
        navLinks.removeAttribute('inert');
      } else {
        navLinks.setAttribute('aria-hidden', 'true');
        navLinks.setAttribute('inert', '');
      }
    } else {
      navLinks.removeAttribute('aria-hidden');
      navLinks.removeAttribute('inert');
    }
  };

  // Initial state check
  if (window.innerWidth < 768) {
    setNavState(false);
  } else {
    navLinks.removeAttribute('aria-hidden');
    navLinks.removeAttribute('inert');
  }

  // Handle screen resize
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) {
      navLinks.classList.remove('is-open');
      navLinks.removeAttribute('aria-hidden');
      navLinks.removeAttribute('inert');
      menuBtn.setAttribute('aria-expanded', 'false');
    } else if (!navLinks.classList.contains('is-open')) {
      setNavState(false);
    }
  });

  menuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('is-open');
    setNavState(!isOpen);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth < 768 && navLinks.classList.contains('is-open')) {
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
  const isTouchDevice = ('ontouchstart' in window) || window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  if (!cursor || window.innerWidth < 1024 || isTouchDevice) {
    if (cursor) cursor.style.display = 'none';
    return;
  }

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

/**
 * Interactive Search Overlay Module
 */
function initSearchOverlay() {
  const searchBtn = document.getElementById('searchBtn');
  const backdrop = document.getElementById('searchOverlay');
  const closeBtn = document.getElementById('searchCloseBtn');
  const clearBtn = document.getElementById('searchClearBtn');
  const input = document.getElementById('searchInput');
  const resultCount = document.getElementById('searchResultCount');
  const resultsList = document.getElementById('searchResultsList');

  if (!searchBtn || !backdrop || !input) return;

  let selectedIndex = -1;

  const openSearch = () => {
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input.focus(), 100);
  };

  const closeSearch = () => {
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    input.value = '';
    if (clearBtn) clearBtn.style.display = 'none';
    if (resultsList) resultsList.innerHTML = '';
    if (resultCount) resultCount.textContent = 'Start typing to search our atelier collection...';
    selectedIndex = -1;
  };

  searchBtn.addEventListener('click', openSearch);
  if (closeBtn) closeBtn.addEventListener('click', closeSearch);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeSearch();
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      input.focus();
      clearBtn.style.display = 'none';
      if (resultsList) resultsList.innerHTML = '';
      if (resultCount) resultCount.textContent = 'Start typing to search our atelier collection...';
    });
  }

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (clearBtn) clearBtn.style.display = query ? 'block' : 'none';

    if (!query) {
      if (resultsList) resultsList.innerHTML = '';
      if (resultCount) resultCount.textContent = 'Start typing to search our atelier collection...';
      selectedIndex = -1;
      return;
    }

    const items = typeof catalogProducts !== 'undefined' && catalogProducts.length > 0
      ? catalogProducts
      : (typeof LOCAL_PRODUCTS_FALLBACK !== 'undefined' ? LOCAL_PRODUCTS_FALLBACK : []);

    const matches = items.filter(p => {
      const nameMatch = p.name && p.name.toLowerCase().includes(query);
      const catMatch = (p.category && p.category.toLowerCase().includes(query)) || (p.subCategory && p.subCategory.toLowerCase().includes(query));
      const descMatch = (p.descriptor && p.descriptor.toLowerCase().includes(query)) || (p.description && p.description.toLowerCase().includes(query));
      return nameMatch || catMatch || descMatch;
    });

    selectedIndex = -1;

    if (matches.length === 0) {
      if (resultCount) resultCount.textContent = `No swimwear pieces found matching "${query}"`;
      if (resultsList) {
        resultsList.innerHTML = `
          <div class="search-no-results">
            <p style="font-family: var(--font-serif); font-size: 1.2rem; color: var(--text-main); margin-bottom: 0.5rem;">No Matching Atelier Pieces</p>
            <p style="font-size: 0.9rem;">Try searching for "bikini", "linen", "top", "terracotta", or "shorts".</p>
          </div>
        `;
      }
      return;
    }

    if (resultCount) {
      resultCount.textContent = `Found ${matches.length} ${matches.length === 1 ? 'piece' : 'pieces'} matching "${query}"`;
    }

    if (resultsList) {
      resultsList.innerHTML = matches.map((item, idx) => {
        const imgPath = item.image || '';
        return `
          <div class="search-result-item" data-id="${item.id}" data-idx="${idx}" tabindex="0">
            <img src="${imgPath}" alt="${item.name}" class="search-result-img" onerror="this.src='assets/images/optimized/hero-960.jpg'">
            <div class="search-result-info">
              <h4>${escapeHTML(item.name)}</h4>
              <p>${escapeHTML(item.category)} &nbsp;•&nbsp; ${escapeHTML(item.descriptor || 'Handcrafted Resortware')}</p>
            </div>
            <div class="search-result-price">${(item.price !== null && item.price !== undefined && item.price !== 'TBD') ? '$' + Number(item.price).toFixed(2) : 'Price TBD'}</div>
          </div>
        `;
      }).join('');

      // Add click listener to result items
      resultsList.querySelectorAll('.search-result-item').forEach(el => {
        el.addEventListener('click', () => {
          const prodId = el.getAttribute('data-id');
          const targetProduct = items.find(p => p.id === prodId);
          closeSearch();
          const targetPage = `/product?id=${prodId}`;
          window.location.href = targetPage;
        });
      });
    }
  });

  // Keyboard navigation for search results (ArrowDown, ArrowUp, Enter)
  input.addEventListener('keydown', (e) => {
    if (!resultsList) return;
    const items = resultsList.querySelectorAll('.search-result-item');
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
      updateSelectedSearchItem(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIndex = Math.max(selectedIndex - 1, 0);
      updateSelectedSearchItem(items);
    } else if (e.key === 'Enter' && selectedIndex >= 0 && items[selectedIndex]) {
      e.preventDefault();
      items[selectedIndex].click();
    }
  });

  function updateSelectedSearchItem(items) {
    items.forEach((item, idx) => {
      item.classList.toggle('is-selected', idx === selectedIndex);
      if (idx === selectedIndex) {
        item.scrollIntoView({ block: 'nearest' });
      }
    });
  }
}

/**
 * Interactive Wishlist / Saved Favorites Drawer Module
 */
function initWishlistUI() {
  const wishlistBtn = document.getElementById('wishlistBtn');
  const backdrop = document.getElementById('wishlistModal');
  const closeBtn = document.getElementById('wishlistCloseBtn');
  const body = document.getElementById('wishlistBody');

  if (!wishlistBtn || !backdrop) return;

  const updateWishlistBadges = () => {
    const count = typeof favoritesList !== 'undefined' ? favoritesList.length : 0;
    const badge = document.getElementById('wishlistHeaderBadge');
    if (badge) badge.textContent = count;
  };

  updateWishlistBadges();

  const openWishlist = () => {
    renderWishlistDrawer();
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeWishlist = () => {
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  wishlistBtn.addEventListener('click', openWishlist);
  if (closeBtn) closeBtn.addEventListener('click', closeWishlist);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeWishlist();
  });

  window.renderWishlistDrawer = function() {
    updateWishlistBadges();
    if (!body) return;

    const savedIds = typeof favoritesList !== 'undefined' ? favoritesList : [];
    const allProducts = typeof catalogProducts !== 'undefined' && catalogProducts.length > 0
      ? catalogProducts
      : (typeof LOCAL_PRODUCTS_FALLBACK !== 'undefined' ? LOCAL_PRODUCTS_FALLBACK : []);

    const favProducts = allProducts.filter(p => savedIds.includes(p.id));

    if (favProducts.length === 0) {
      body.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
          <p style="font-family: var(--font-serif); font-size: 1.4rem; margin-bottom: 0.5rem; color: var(--text-main);">No Favorites Saved</p>
          <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">Click the ♡ icon on any swimsuit to save it to your wishlist.</p>
          <button class="btn btn-outline btn-sm" onclick="document.getElementById('wishlistModal').classList.remove('is-open'); document.body.style.overflow='';">Explore Catalog</button>
        </div>
      `;
      return;
    }

    body.innerHTML = favProducts.map(item => {
      const imgPath = item.image || '';
      return `
        <div class="wishlist-item">
          <img src="${imgPath}" alt="${item.name}" class="wishlist-item-img" onerror="this.src='assets/images/optimized/hero-960.jpg'">
          <div class="wishlist-item-info">
            <h4>${escapeHTML(item.name)}</h4>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${escapeHTML(item.category)}</div>
            <div style="font-weight: 600; color: var(--accent-espresso); margin-top: 0.2rem;">${(item.price !== null && item.price !== undefined && item.price !== 'TBD') ? '$' + Number(item.price).toFixed(2) : 'Price TBD'}</div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 0.4rem; align-items: flex-end;">
            <button class="btn btn-solid btn-sm" onclick="openWishlistItemQuickView('${item.id}')" style="font-size: 0.75rem; padding: 0.4rem 0.75rem;">View &amp; Bag</button>
            <button class="cart-item-remove" onclick="toggleFavorite('${item.id}'); renderWishlistDrawer();" style="font-size: 0.75rem;">Remove</button>
          </div>
        </div>
      `;
    }).join('');
  };

  window.openWishlistItemQuickView = function(prodId) {
    closeWishlist();
    const allProducts = typeof catalogProducts !== 'undefined' && catalogProducts.length > 0
      ? catalogProducts
      : (typeof LOCAL_PRODUCTS_FALLBACK !== 'undefined' ? LOCAL_PRODUCTS_FALLBACK : []);
    const prod = allProducts.find(p => p.id === prodId);
    if (prod && typeof openProductQuickViewModal === 'function') {
      openProductQuickViewModal(prod);
    }
  };
}
