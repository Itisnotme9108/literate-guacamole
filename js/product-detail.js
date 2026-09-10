/**
 * Editorial Resort & Intimates - Dedicated Product Detail Page Logic (Vanilla JS)
 * Client-side data rendering from data/products.json based on URL query parameter ?id=...
 */

let currentPdpProduct = null;
const pdpSelections = { top: null, bottom: null, size: null };
let currentLightboxIndex = 0;
let currentSizeGuideUnit = 'in';

document.addEventListener('DOMContentLoaded', () => {
  initProductDetailPage();
});

async function initProductDetailPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id') || 'drs-bur-cro-001';

  // Wait for catalog products or fetch directly
  if (!window.catalogProducts || window.catalogProducts.length === 0) {
    try {
      const res = await fetch('/data/products.json?v=' + Date.now()).catch(() => fetch('data/products.json?v=' + Date.now())).catch(() => null);
      if (res && res.ok) {
        window.catalogProducts = await res.json();
      } else if (typeof LOCAL_PRODUCTS_FALLBACK !== 'undefined') {
        window.catalogProducts = LOCAL_PRODUCTS_FALLBACK;
      }
    } catch (e) {
      if (typeof LOCAL_PRODUCTS_FALLBACK !== 'undefined') {
        window.catalogProducts = LOCAL_PRODUCTS_FALLBACK;
      }
    }
  }

  const products = window.catalogProducts || [];
  currentPdpProduct = products.find(p => p.id === productId) || products.find(p => p.id === 'drs-bur-cro-001') || products[0];

  if (!currentPdpProduct) {
    showPdpError();
    return;
  }

  renderPdpContent(currentPdpProduct);
  renderPdpColorSwatches(currentPdpProduct);
  renderPdpAccordions(currentPdpProduct);
  renderPdpStorySection(currentPdpProduct);
  initMobileGalleryScroll();
  initPdpWishlist();
  initStickyBarObserver();
  initSizeGuideModal();
  initPdpLightbox();
  renderRelatedProducts(currentPdpProduct);
}

function getPdpGallery(product) {
  if (product && Array.isArray(product.gallery) && product.gallery.length > 0) {
    return product.gallery.map(item => ({
      role: item.role || 'feature',
      src: item.src.startsWith('/') ? item.src : `/${item.src.replace(/^(\.\.\/)+/, '')}`
    }));
  }
  const hero = product.image ? (product.image.startsWith('/') ? product.image : `/${product.image.replace(/^(\.\.\/)+/, '')}`) : '';
  const feature = product.secondaryImage ? (product.secondaryImage.startsWith('/') ? product.secondaryImage : `/${product.secondaryImage.replace(/^(\.\.\/)+/, '')}`) : hero;

  return [
    { role: 'hero', src: hero },
    { role: 'feature', src: feature }
  ];
}

function renderPdpContent(product) {
  // Update Document Title & OG Tags
  document.title = product.seoTitle || `${product.name} — EDITORIAL RESORT`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = product.metaDescription || product.description;

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = product.seoTitle || `${product.name} — EDITORIAL RESORT`;

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.content = product.metaDescription || product.description;

  const gallery = getPdpGallery(product);
  const heroImageSrc = gallery[0] ? gallery[0].src : product.image;

  let ogImage = document.querySelector('meta[property="og:image"]');
  if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
  }
  ogImage.content = heroImageSrc;

  // Breadcrumbs
  const breadCategory = document.getElementById('breadcrumbCategory');
  const breadTitle = document.getElementById('breadcrumbTitle');
  if (breadCategory) {
    breadCategory.textContent = product.category;
    breadCategory.href = `/shop?category=${product.category.toLowerCase().replace(/\s+/g, '-')}`;
  }
  if (breadTitle) breadTitle.textContent = product.name;

  // Header Info
  const titleEl = document.getElementById('pdpTitle');
  const priceEl = document.getElementById('pdpPrice');
  const ratingContainer = document.getElementById('pdpRatingContainer');
  const ratingValEl = document.getElementById('pdpRatingVal');
  const revEl = document.getElementById('pdpReviewsCount');
  const descripEl = document.getElementById('pdpDescriptor');
  const matLineEl = document.getElementById('pdpMaterialLine');
  const leadTimeEl = document.getElementById('pdpLeadTimeLine');
  const mobileBarPrice = document.getElementById('mobileBarPrice');

  if (titleEl) titleEl.textContent = product.name;
  
  const formattedPrice = (product.price === null || product.price === 'TBD') ? 'Price: TBD' : `$${Number(product.price).toFixed(2)}`;
  if (priceEl) priceEl.textContent = formattedPrice;
  if (mobileBarPrice) mobileBarPrice.textContent = formattedPrice;
  
  // Star Rating (Only if real review data exists)
  if (ratingContainer) {
    if (typeof product.rating === 'number' && product.rating > 0 && typeof product.reviewsCount === 'number' && product.reviewsCount > 0) {
      ratingContainer.style.display = 'flex';
      if (ratingValEl) ratingValEl.textContent = product.rating.toFixed(1);
      if (revEl) revEl.textContent = `(${product.reviewsCount} reviews)`;
    } else {
      ratingContainer.style.display = 'none';
    }
  }
  
  // Short material / technique line
  if (matLineEl) {
    matLineEl.textContent = product.material || 'Handcrafted Crochet';
  }

  // Lead time / Made-to-order line (ONLY if data exists in product model)
  if (leadTimeEl) {
    if (product.leadTime || product.madeToOrder) {
      leadTimeEl.style.display = 'block';
      leadTimeEl.textContent = `Made to order • ${product.leadTime || 'Handcrafted lead time applies'}`;
    } else {
      leadTimeEl.style.display = 'none';
    }
  }

  if (descripEl) descripEl.textContent = product.descriptor || 'Handcrafted Editorial Swimwear';

  // Render Gallery Stack & Thumbnails
  const galleryStack = document.getElementById('pdpGalleryStack');
  const thumbsStrip = document.getElementById('pdpGalleryThumbsStrip');
  
  if (galleryStack) {
    galleryStack.innerHTML = '';
    gallery.forEach((item, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = `pdp-gallery-item role-${item.role} ${idx === 0 ? 'active' : ''}`;
      wrapper.setAttribute('data-role', item.role);
      wrapper.setAttribute('data-index', idx);
      wrapper.setAttribute('tabindex', '0');
      wrapper.setAttribute('role', 'button');
      wrapper.setAttribute('aria-label', `Enlarge image ${idx + 1} of ${gallery.length}`);

      const isFirst = idx === 0;

      const pictureHTML = typeof createResponsivePictureHTML === 'function'
        ? createResponsivePictureHTML(item.src, `${product.name} - View ${idx + 1}`, {
            pictureClass: 'pdp-gallery-picture',
            imgClass: 'pdp-gallery-img',
            sizes: '(max-width: 768px) 100vw, 55vw',
            width: 1200,
            height: 1600,
            loading: isFirst ? 'eager' : 'lazy',
            fetchpriority: isFirst ? 'high' : undefined
          })
        : `<img src="${item.src}" alt="${product.name} - View ${idx + 1}" class="pdp-gallery-img" loading="${isFirst ? 'eager' : 'lazy'}">`;

      wrapper.innerHTML = pictureHTML;

      // Click to open lightbox
      wrapper.addEventListener('click', () => {
        openPdpLightbox(idx);
      });

      wrapper.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openPdpLightbox(idx);
        }
      });

      galleryStack.appendChild(wrapper);
    });

    const counterText = document.getElementById('pdpCounterText');
    if (counterText) {
      counterText.textContent = `01 / ${String(gallery.length).padStart(2, '0')}`;
    }

    const dotsContainer = document.getElementById('pdpGalleryDots');
    if (dotsContainer) {
      dotsContainer.innerHTML = gallery.map((_, idx) => 
        `<span class="pdp-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`
      ).join('');
    }
  }

  // Render Thumbnails Strip
  if (thumbsStrip) {
    thumbsStrip.innerHTML = gallery.map((item, idx) => `
      <button class="pdp-thumb-btn ${idx === 0 ? 'active' : ''}" data-index="${idx}" aria-label="View thumbnail ${idx + 1}">
        <img src="${item.src}" alt="${product.name} Thumbnail ${idx + 1}" loading="lazy">
      </button>
    `).join('');

    thumbsStrip.querySelectorAll('.pdp-thumb-btn').forEach(thumbBtn => {
      thumbBtn.addEventListener('click', () => {
        const targetIdx = parseInt(thumbBtn.getAttribute('data-index'), 10);
        thumbsStrip.querySelectorAll('.pdp-thumb-btn').forEach(b => b.classList.remove('active'));
        thumbBtn.classList.add('active');

        if (galleryStack) {
          const items = galleryStack.querySelectorAll('.pdp-gallery-item');
          items.forEach((itemEl, i) => {
            if (i === targetIdx) {
              itemEl.classList.add('active');
            } else {
              itemEl.classList.remove('active');
            }
          });
        }

        const counterText = document.getElementById('pdpCounterText');
        if (counterText) {
          counterText.textContent = `${String(targetIdx + 1).padStart(2, '0')} / ${String(gallery.length).padStart(2, '0')}`;
        }
      });
    });
  }

  // Render Swatches
  renderPdpSwatches(product);
}

function renderPdpColorSwatches(product) {
  const section = document.getElementById('pdpColorSwatchesSection');
  const row = document.getElementById('pdpColorSwatchesRow');
  const nameLabel = document.getElementById('pdpSelectedColorName');
  if (!section || !row) return;

  const colors = Array.isArray(product.colors) ? product.colors : (product.color ? [product.color] : []);
  if (colors.length <= 1) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  if (nameLabel) nameLabel.textContent = colors[0];

  row.innerHTML = colors.map((col, idx) => {
    const slug = String(col).toLowerCase().trim();
    const hex = (typeof COLOR_HEX_MAP !== 'undefined' && COLOR_HEX_MAP[slug]) || '#D4A373';
    return `<button class="swatch-circle ${idx === 0 ? 'active' : ''}" data-color="${col}" style="background-color: ${hex};" aria-label="Color ${col}"></button>`;
  }).join('');

  row.querySelectorAll('.swatch-circle').forEach(btn => {
    btn.addEventListener('click', () => {
      row.querySelectorAll('.swatch-circle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const chosenCol = btn.getAttribute('data-color');
      if (nameLabel) nameLabel.textContent = chosenCol;

      if (product.colorImageMap && product.colorImageMap[chosenCol]) {
        const newSrc = product.colorImageMap[chosenCol];
        const heroImg = document.querySelector('#pdpGalleryStack .pdp-gallery-img');
        if (heroImg) heroImg.src = newSrc;
      }
    });
  });
}

function renderPdpSwatches(product) {
  const wrapper = document.getElementById('pdpVariantsWrapper');
  const microcopy = document.getElementById('pdpIndependentMicrocopy');
  if (!wrapper) return;

  const isSet = product.type === 'set' || product.category === 'Bikini Set' || product.category === 'Bikini Sets';
  let html = '';

  if (microcopy) {
    microcopy.style.display = isSet ? 'block' : 'none';
  }

  const sizeGuideTrigger = `
    <button type="button" class="pdp-size-guide-link" id="pdpSizeGuideTrigger" aria-label="Open Size Guide Modal">
      SIZE GUIDE
    </button>
  `;

  if (isSet) {
    const topSizes = (product.variants && product.variants.top) || ['XS', 'S', 'M', 'L'];
    const bottomSizes = (product.variants && product.variants.bottom) || ['XS', 'S', 'M', 'L'];

    html = `
      <div class="pdp-swatch-group">
        <div class="swatch-group-label" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span>TOP SIZE</span>
            <span class="selected-value" id="pdp-top-val">Select Top</span>
          </div>
          ${sizeGuideTrigger}
        </div>
        <div class="swatches-row" id="pdpTopRow">
          ${topSizes.map(sz => `<button class="swatch-btn pdp-swatch" data-group="top" data-size="${sz}">${sz}</button>`).join('')}
        </div>
      </div>

      <div class="pdp-swatch-group">
        <div class="swatch-group-label" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span>BOTTOM SIZE</span>
            <span class="selected-value" id="pdp-bottom-val">Select Bottom</span>
          </div>
        </div>
        <div class="swatches-row" id="pdpBottomRow">
          ${bottomSizes.map(sz => `<button class="swatch-btn pdp-swatch" data-group="bottom" data-size="${sz}">${sz}</button>`).join('')}
        </div>
      </div>
    `;
  } else {
    const singleSizes = (product.variants && product.variants.size) || ['XS', 'S', 'M', 'L'];

    html = `
      <div class="pdp-swatch-group">
        <div class="swatch-group-label" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <span>SIZE</span>
            <span class="selected-value" id="pdp-size-val">Select Size</span>
          </div>
          ${sizeGuideTrigger}
        </div>
        <div class="swatches-row" id="pdpSizeRow">
          ${singleSizes.map(sz => `<button class="swatch-btn pdp-swatch" data-group="size" data-size="${sz}">${sz}</button>`).join('')}
        </div>
      </div>
    `;
  }

  wrapper.innerHTML = html;

  // Bind Size Guide trigger
  const sgBtn = document.getElementById('pdpSizeGuideTrigger');
  if (sgBtn) {
    sgBtn.onclick = () => openPdpSizeGuide();
  }

  wrapper.querySelectorAll('.pdp-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-group');
      const size = btn.getAttribute('data-size');
      const row = btn.closest('.swatches-row');
      row.querySelectorAll('.pdp-swatch').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      pdpSelections[group] = size;
      const label = document.getElementById(`pdp-${group}-val`);
      if (label) label.textContent = size;

      validatePdpSelections(product);
    });
  });

  const addBtn = document.getElementById('pdpAddToCartBtn');
  const mobileBarBtn = document.getElementById('mobileBarAddToCartBtn');

  const handleAdd = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    const isValid = validatePdpSelections(product, true);
    if (!isValid) return;

    if (typeof addToCart === 'function') {
      addToCart(product, pdpSelections, { autoOpen: false });
      showPdpAddConfirmation();
    }
  };

  if (addBtn) addBtn.onclick = handleAdd;
  if (mobileBarBtn) mobileBarBtn.onclick = handleAdd;

  validatePdpSelections(product);
}

function validatePdpSelections(product, isSubmission = false) {
  const isSet = product.type === 'set' || product.category === 'Bikini Set' || product.category === 'Bikini Sets';
  const addBtn = document.getElementById('pdpAddToCartBtn');
  const mobileBarBtn = document.getElementById('mobileBarAddToCartBtn');
  const hint = document.getElementById('pdpValidationHint');

  let missing = [];

  if (isSet) {
    if (!pdpSelections.top) missing.push('Top Size');
    if (!pdpSelections.bottom) missing.push('Bottom Size');
  } else {
    if (!pdpSelections.size) missing.push('Size');
  }

  const isValid = missing.length === 0;

  if (addBtn) {
    if (isValid) {
      addBtn.removeAttribute('disabled');
      addBtn.classList.remove('disabled');
      addBtn.textContent = 'ADD TO BAG ✦';
    } else {
      addBtn.setAttribute('disabled', 'disabled');
      addBtn.classList.add('disabled');
      addBtn.textContent = isSet ? 'SELECT TOP & BOTTOM SIZE' : 'SELECT SIZE';
    }
  }

  if (mobileBarBtn) {
    if (isValid) {
      mobileBarBtn.removeAttribute('disabled');
      mobileBarBtn.classList.remove('disabled');
      mobileBarBtn.textContent = 'ADD TO BAG ✦';
    } else {
      mobileBarBtn.removeAttribute('disabled'); // Allow click to focus size section on mobile
      mobileBarBtn.classList.remove('disabled');
      mobileBarBtn.textContent = `SELECT ${missing.join(' & ').toUpperCase()}`;
    }
  }

  if (hint) {
    if (isValid) {
      hint.style.display = 'none';
      hint.textContent = '';
    } else {
      hint.style.display = 'block';
      hint.textContent = `* Please select your ${missing.join(' & ')}`;
    }
  }

  if (!isValid && isSubmission) {
    const wrapper = document.getElementById('pdpVariantsWrapper');
    if (wrapper) {
      wrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
      wrapper.classList.add('shake-highlight');
      setTimeout(() => wrapper.classList.remove('shake-highlight'), 800);
    }
  }

  return isValid;
}

function showPdpAddConfirmation() {
  const addBtn = document.getElementById('pdpAddToCartBtn');
  const mobileBarBtn = document.getElementById('mobileBarAddToCartBtn');

  if (addBtn) {
    addBtn.textContent = '✓ ADDED TO BAG';
    addBtn.style.backgroundColor = 'var(--accent-terracotta)';
    setTimeout(() => {
      addBtn.textContent = 'ADD TO BAG ✦';
      addBtn.style.backgroundColor = '';
    }, 2000);
  }

  if (mobileBarBtn) {
    mobileBarBtn.textContent = '✓ ADDED TO BAG';
    setTimeout(() => {
      mobileBarBtn.textContent = 'ADD TO BAG ✦';
    }, 2000);
  }
}

function initPdpWishlist() {
  const dtFavBtn = document.getElementById('pdpWishlistBtn');
  const mobFavBtn = document.getElementById('pdpMobileWishlistBtn');

  if (currentPdpProduct) {
    if (dtFavBtn) dtFavBtn.setAttribute('data-id', currentPdpProduct.id);
    if (mobFavBtn) mobFavBtn.setAttribute('data-id', currentPdpProduct.id);
  }

  const updateWishlistUI = () => {
    if (!currentPdpProduct) return;
    const isFav = typeof isFavorite === 'function' ? isFavorite(currentPdpProduct.id) : false;

    [dtFavBtn, mobFavBtn].forEach(btn => {
      if (!btn) return;
      if (isFav) {
        btn.classList.add('active');
        btn.textContent = '♥';
        btn.setAttribute('aria-label', `Remove ${currentPdpProduct.name} from wishlist`);
      } else {
        btn.classList.remove('active');
        btn.textContent = '♡';
        btn.setAttribute('aria-label', `Add ${currentPdpProduct.name} to wishlist`);
      }
    });

    const headerBadge = document.getElementById('wishlistHeaderBadge');
    if (headerBadge && typeof getFavorites === 'function') {
      headerBadge.textContent = getFavorites().length;
    }
  };

  const handleToggle = (e) => {
    if (e) e.preventDefault();
    if (currentPdpProduct && typeof toggleFavorite === 'function') {
      toggleFavorite(currentPdpProduct.id);
      updateWishlistUI();
    }
  };

  if (dtFavBtn) dtFavBtn.onclick = handleToggle;
  if (mobFavBtn) mobFavBtn.onclick = handleToggle;

  updateWishlistUI();
}

function renderPdpAccordions(product) {
  const container = document.getElementById('pdpAccordion');
  if (!container) return;

  const sections = [];

  // Overview
  let overviewHTML = '';
  if (product.description) {
    overviewHTML += `<p class="accordion-body">${product.description}</p>`;
  }
  if (Array.isArray(product.details) && product.details.length > 0) {
    overviewHTML += `<ul class="pdp-details-list" style="margin-top: 0.85rem; padding-left: 1.25rem;">${product.details.map(d => `<li>${d}</li>`).join('')}</ul>`;
  }
  if (overviewHTML) {
    sections.push({ title: 'Overview', content: overviewHTML });
  }

  // Materials
  if (product.material && product.material !== 'TBD') {
    sections.push({ title: 'Materials', content: `<p class="accordion-body">${product.material}</p>` });
  }

  // Care
  if (product.care && product.care !== 'TBD') {
    sections.push({ title: 'Care', content: `<p class="accordion-body">${product.care}</p>` });
  }

  // Shipping
  if (product.shipping && product.shipping !== 'TBD') {
    sections.push({ title: 'Shipping', content: `<p class="accordion-body">${product.shipping}</p>` });
  }

  // Returns
  sections.push({ title: 'Returns', content: `<p class="accordion-body">Complimentary 14-day return window for unworn items in original packaging with intact hygiene seal.</p>` });

  container.innerHTML = sections.map(sec => `
    <div class="accordion-item">
      <button class="accordion-header" aria-expanded="false">
        <h2 class="accordion-h2">${sec.title}</h2>
        <svg class="accordion-chevron" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div class="accordion-content">
        ${sec.content}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.accordion-item').forEach(item => {
    const header = item.querySelector('.accordion-header');
    if (!header) return;

    item.classList.remove('is-open');
    header.setAttribute('aria-expanded', 'false');

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      header.setAttribute('aria-expanded', String(!isOpen));
    });
  });
}

function renderPdpStorySection(product) {
  const grid = document.getElementById('pdpStoryGrid');
  if (!grid) return;

  const gallery = getPdpGallery(product);
  const storyImages = gallery.slice(1, 3).concat(gallery.slice(0, 1));

  grid.innerHTML = `
    <div class="story-card">
      <div class="story-card-media">
        <img src="${storyImages[0] ? storyImages[0].src : product.image}" alt="${product.name} Craftsmanship" class="story-card-img" loading="lazy">
      </div>
      <div class="story-card-content">
        <span class="micro-label">ARTISANAL WEAVE</span>
        <h3 class="story-card-headline">Handcrafted Open-Knit Tension</h3>
        <p class="story-card-body">Woven using individual cotton-linen threads that expand and flex naturally with your movement while maintaining structural elegance.</p>
      </div>
    </div>

    <div class="story-card">
      <div class="story-card-media">
        <img src="${storyImages[1] ? storyImages[1].src : product.image}" alt="${product.name} Silhouette" class="story-card-img" loading="lazy">
      </div>
      <div class="story-card-content">
        <span class="micro-label">DESIGN PHILOSOPHY</span>
        <h3 class="story-card-headline">Tailored Dual Silhouette</h3>
        <p class="story-card-body">Engineered with independent top and bottom proportions, ensuring no compromises between bust support and hip contouring.</p>
      </div>
    </div>
  `;
}

/* =========================================================================
   SIZE GUIDE MODAL
   ========================================================================= */
function initSizeGuideModal() {
  const modal = document.getElementById('pdpSizeGuideModal');
  const closeBtn = document.getElementById('sizeGuideCloseBtn');
  const inBtn = document.getElementById('unitInchesBtn');
  const cmBtn = document.getElementById('unitCmBtn');

  if (!modal) return;

  const renderTable = (unit) => {
    currentSizeGuideUnit = unit;
    const tableBody = document.querySelector('#pdpSizeTable tbody');
    if (!tableBody) return;

    if (inBtn) inBtn.classList.toggle('active', unit === 'in');
    if (cmBtn) cmBtn.classList.toggle('active', unit === 'cm');

    const data = unit === 'in' ? [
      { size: 'XS', bust: '30" - 32"', underbust: '24" - 26"', waist: '23" - 25"', hip: '33" - 35"' },
      { size: 'S',  bust: '32" - 34"', underbust: '26" - 28"', waist: '25" - 27"', hip: '35" - 37"' },
      { size: 'M',  bust: '34" - 36"', underbust: '28" - 30"', waist: '27" - 29"', hip: '37" - 39"' },
      { size: 'L',  bust: '36" - 38"', underbust: '30" - 32"', waist: '29" - 31"', hip: '39" - 41"' },
      { size: 'XL', bust: '38" - 40"', underbust: '32" - 34"', waist: '31" - 33"', hip: '41" - 43"' }
    ] : [
      { size: 'XS', bust: '76 - 81 cm', underbust: '61 - 66 cm', waist: '58 - 64 cm', hip: '84 - 89 cm' },
      { size: 'S',  bust: '81 - 86 cm', underbust: '66 - 71 cm', waist: '64 - 69 cm', hip: '89 - 94 cm' },
      { size: 'M',  bust: '86 - 91 cm', underbust: '71 - 76 cm', waist: '69 - 74 cm', hip: '94 - 99 cm' },
      { size: 'L',  bust: '91 - 97 cm', underbust: '76 - 81 cm', waist: '74 - 79 cm', hip: '99 - 104 cm' },
      { size: 'XL', bust: '97 - 102 cm', underbust: '81 - 86 cm', waist: '79 - 84 cm', hip: '104 - 109 cm' }
    ];

    tableBody.innerHTML = data.map(row => `
      <tr>
        <td><strong>${row.size}</strong></td>
        <td>${row.bust}</td>
        <td>${row.underbust}</td>
        <td>${row.waist}</td>
        <td>${row.hip}</td>
      </tr>
    `).join('');
  };

  if (inBtn) inBtn.onclick = () => renderTable('in');
  if (cmBtn) cmBtn.onclick = () => renderTable('cm');

  renderTable('in');

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.onclick = closeModal;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });
}

function openPdpSizeGuide() {
  const modal = document.getElementById('pdpSizeGuideModal');
  if (modal) {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

/* =========================================================================
   FULLSCREEN LIGHTBOX MODAL
   ========================================================================= */
function initPdpLightbox() {
  const modal = document.getElementById('pdpLightboxModal');
  const closeBtn = document.getElementById('lightboxCloseBtn');
  const prevBtn = document.getElementById('lightboxPrevBtn');
  const nextBtn = document.getElementById('lightboxNextBtn');

  if (!modal) return;

  const updateLightboxView = () => {
    if (!currentPdpProduct) return;
    const gallery = getPdpGallery(currentPdpProduct);
    if (gallery.length === 0) return;

    currentLightboxIndex = (currentLightboxIndex + gallery.length) % gallery.length;
    const imgEl = document.getElementById('lightboxImg');
    const counterEl = document.getElementById('lightboxCounter');

    if (imgEl) {
      imgEl.src = gallery[currentLightboxIndex].src;
      imgEl.alt = `${currentPdpProduct.name} View ${currentLightboxIndex + 1}`;
    }

    if (counterEl) {
      counterEl.textContent = `${currentLightboxIndex + 1} / ${gallery.length}`;
    }
  };

  if (prevBtn) prevBtn.onclick = () => { currentLightboxIndex--; updateLightboxView(); };
  if (nextBtn) nextBtn.onclick = () => { currentLightboxIndex++; updateLightboxView(); };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.onclick = closeModal;

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  window.addEventListener('keydown', (e) => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') { currentLightboxIndex--; updateLightboxView(); }
    if (e.key === 'ArrowRight') { currentLightboxIndex++; updateLightboxView(); }
  });
}

function openPdpLightbox(index = 0) {
  const modal = document.getElementById('pdpLightboxModal');
  if (modal && currentPdpProduct) {
    currentLightboxIndex = index;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const gallery = getPdpGallery(currentPdpProduct);
    const imgEl = document.getElementById('lightboxImg');
    const counterEl = document.getElementById('lightboxCounter');

    if (imgEl && gallery[index]) {
      imgEl.src = gallery[index].src;
      imgEl.alt = `${currentPdpProduct.name} View ${index + 1}`;
    }
    if (counterEl) {
      counterEl.textContent = `${index + 1} / ${gallery.length}`;
    }
  }
}

function initMobileGalleryScroll() {
  const galleryStack = document.getElementById('pdpGalleryStack');
  const counterText = document.getElementById('pdpCounterText');
  const dotsContainer = document.getElementById('pdpGalleryDots');
  if (!galleryStack) return;

  const items = galleryStack.querySelectorAll('.pdp-gallery-item');
  if (items.length <= 1) return;

  galleryStack.addEventListener('scroll', () => {
    const width = galleryStack.clientWidth;
    if (width === 0) return;
    const scrollLeft = galleryStack.scrollLeft;
    const currentIndex = Math.min(Math.floor((scrollLeft + width / 2) / width), items.length - 1);
    
    if (counterText) counterText.textContent = `${currentIndex + 1} / ${items.length}`;

    if (dotsContainer) {
      const dots = dotsContainer.querySelectorAll('.pdp-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }
  }, { passive: true });
}

function initStickyBarObserver() {
  const stickyBar = document.querySelector('.mobile-pdp-sticky-bar');
  const variantsWrapper = document.getElementById('pdpVariantsWrapper');
  const ctaBtn = document.getElementById('pdpAddToCartBtn');
  if (!stickyBar || (!variantsWrapper && !ctaBtn)) return;

  const target = ctaBtn || variantsWrapper;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stickyBar.classList.remove('is-visible');
        } else {
          if (entry.boundingClientRect.top < 0) {
            stickyBar.classList.add('is-visible');
          } else {
            stickyBar.classList.remove('is-visible');
          }
        }
      });
    }, { threshold: 0.1 });

    observer.observe(target);
  } else {
    window.addEventListener('scroll', () => {
      const rect = target.getBoundingClientRect();
      if (rect.bottom < 0) {
        stickyBar.classList.add('is-visible');
      } else {
        stickyBar.classList.remove('is-visible');
      }
    }, { passive: true });
  }
}

function renderRelatedProducts(currentProduct) {
  const container = document.getElementById('pdpRelatedRow');
  if (!container || !window.catalogProducts || window.catalogProducts.length === 0) return;

  container.innerHTML = '';
  const related = window.catalogProducts
    .filter(p => p.id !== currentProduct.id)
    .slice(0, 6);

  related.forEach(p => {
    if (typeof window.createProductCardElement === 'function') {
      const card = window.createProductCardElement(p);
      container.appendChild(card);
    }
  });
}

function showPdpError() {
  const main = document.getElementById('pdpMain');
  if (main) {
    main.innerHTML = `
      <div class="container" style="text-align: center; padding: 6rem 1rem;">
        <h1 style="font-family: var(--font-serif); font-size: 2rem;">Product Not Found</h1>
        <p style="margin-top: 1rem; color: var(--text-muted);">The requested resortwear piece could not be located in our catalog.</p>
        <a href="shop.html" class="btn btn-solid" style="margin-top: 2rem; display: inline-block;">Return to Shop</a>
      </div>
    `;
  }
}
