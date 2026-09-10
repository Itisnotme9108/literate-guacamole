/**
 * Editorial Resort & Intimates - Dedicated Product Detail Page Logic (Vanilla JS)
 * Client-side data rendering from data/products.json based on URL query parameter ?id=...
 */

let currentPdpProduct = null;
const pdpSelections = { top: null, bottom: null, size: null };

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
  initPdpAccordion();
  initMobileGalleryScroll();
  updatePdpWishlistState();
  initStickyBarObserver();
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
  const catLabel = document.getElementById('pdpCategoryLabel');
  const titleEl = document.getElementById('pdpTitle');
  const priceEl = document.getElementById('pdpPrice');
  const ratingEl = document.getElementById('pdpRatingVal');
  const revEl = document.getElementById('pdpReviewsCount');
  const descripEl = document.getElementById('pdpDescriptor');
  const descTextEl = document.getElementById('pdpDescriptionText');
  const mobileBarPrice = document.getElementById('mobileBarPrice');

  if (catLabel) catLabel.textContent = product.category;
  if (titleEl) titleEl.textContent = product.name;
  
  const formattedPrice = (product.price === null || product.price === 'TBD') ? 'Price: TBD' : `$${Number(product.price).toFixed(2)}`;
  if (priceEl) priceEl.textContent = formattedPrice;
  if (mobileBarPrice) mobileBarPrice.textContent = formattedPrice;
  
  if (ratingEl) {
      if (product.rating === null) {
          const badge = document.querySelector('.pdp-rating-badge');
          if (badge) badge.style.display = 'none';
      } else {
          ratingEl.textContent = (product.rating || 5.0).toFixed(1);
      }
  }
  if (revEl && product.reviewsCount !== undefined) {
      revEl.textContent = `(${product.reviewsCount} reviews)`;
  }
  
  if (descripEl) descripEl.textContent = product.descriptor || 'Handcrafted Editorial Swimwear';
  if (descTextEl) descTextEl.textContent = product.description;

  // Accordions Content Fields
  const detailsList = document.getElementById('pdpDetailsList');
  if (detailsList) {
    if (product.details && product.details.length > 0) {
      detailsList.style.display = 'block';
      detailsList.innerHTML = product.details.map(d => `<li>${d}</li>`).join('');
    } else {
      detailsList.style.display = 'none';
    }
  }

  const matEl = document.getElementById('pdpMaterialText');
  if (matEl && product.material) matEl.textContent = product.material;

  const fitEl = document.getElementById('pdpFitText');
  if (fitEl && product.fit) fitEl.textContent = product.fit;

  const msrEl = document.getElementById('pdpMeasurementsText');
  if (msrEl && product.measurements && product.measurements !== 'TBD') {
    msrEl.style.display = 'block';
    msrEl.textContent = product.measurements;
  } else if (msrEl) {
    msrEl.style.display = 'none';
  }

  const careEl = document.getElementById('pdpCareText');
  if (careEl && product.care) careEl.textContent = product.care;

  const shipEl = document.getElementById('pdpShippingText');
  if (shipEl && product.shipping) shipEl.textContent = product.shipping;

  // Render Gallery Column
  const galleryStack = document.getElementById('pdpGalleryStack');
  if (galleryStack) {
    galleryStack.innerHTML = '';
    gallery.forEach((item, idx) => {
      const wrapper = document.createElement('div');
      wrapper.className = `pdp-gallery-item role-${item.role}`;
      wrapper.setAttribute('data-role', item.role);

      const isFirst = idx === 0;
      const isSecond = idx === 1;

      const pictureHTML = typeof createResponsivePictureHTML === 'function'
        ? createResponsivePictureHTML(item.src, `${product.name} - View ${idx + 1}`, {
            pictureClass: 'pdp-gallery-picture',
            imgClass: 'pdp-gallery-img',
            sizes: '(max-width: 768px) 100vw, 55vw',
            width: 1200,
            height: 1600,
            loading: isFirst || isSecond ? 'eager' : 'lazy',
            fetchpriority: isFirst ? 'high' : undefined
          })
        : `<img src="${item.src}" alt="${product.name} - View ${idx + 1}" class="pdp-gallery-img" loading="${isFirst || isSecond ? 'eager' : 'lazy'}">`;

      wrapper.innerHTML = pictureHTML;
      galleryStack.appendChild(wrapper);
    });

    const counterText = document.getElementById('pdpCounterText');
    if (counterText) counterText.textContent = `1 / ${gallery.length}`;

    const dotsContainer = document.getElementById('pdpGalleryDots');
    if (dotsContainer) {
      dotsContainer.innerHTML = gallery.map((_, idx) => 
        `<span class="pdp-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}"></span>`
      ).join('');
    }
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
  if (!wrapper) return;

  const isSet = product.type === 'set' || product.category === 'Bikini Set' || product.category === 'Bikini Sets';
  let html = '';

  if (isSet) {
    const topSizes = (product.variants && product.variants.top) || ['XS', 'S', 'M', 'L'];
    const bottomSizes = (product.variants && product.variants.bottom) || ['XS', 'S', 'M', 'L'];

    html = `
      <div class="pdp-swatch-group">
        <div class="swatch-group-label">
          <span>TOP SIZE</span>
          <span class="selected-value" id="pdp-top-val">Select Top</span>
        </div>
        <div class="swatches-row" id="pdpTopRow">
          ${topSizes.map(sz => `<button class="swatch-btn pdp-swatch" data-group="top" data-size="${sz}">${sz}</button>`).join('')}
        </div>
      </div>

      <div class="pdp-swatch-group">
        <div class="swatch-group-label">
          <span>BOTTOM SIZE</span>
          <span class="selected-value" id="pdp-bottom-val">Select Bottom</span>
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
        <div class="swatch-group-label">
          <span>SIZE</span>
          <span class="selected-value" id="pdp-size-val">Select Size</span>
        </div>
        <div class="swatches-row" id="pdpSizeRow">
          ${singleSizes.map(sz => `<button class="swatch-btn pdp-swatch" data-group="size" data-size="${sz}">${sz}</button>`).join('')}
        </div>
      </div>
    `;
  }

  wrapper.innerHTML = html;

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
    if (typeof addToCart === 'function') {
      addToCart(product, pdpSelections);
      showPdpAddConfirmation();
    }
  };

  if (addBtn) addBtn.onclick = handleAdd;
  if (mobileBarBtn) mobileBarBtn.onclick = handleAdd;
}

function validatePdpSelections(product) {
  const isSet = product.type === 'set' || product.category === 'Bikini Set' || product.category === 'Bikini Sets';
  const hint = document.getElementById('pdpValidationHint');
  const addBtn = document.getElementById('pdpAddToCartBtn');
  const mobileBarBtn = document.getElementById('mobileBarAddToCartBtn');

  let isValid = false;

  if (isSet) {
    if (pdpSelections.top && pdpSelections.bottom) {
      isValid = true;
    } else if (pdpSelections.top) {
      if (hint) hint.textContent = 'Please select a Bottom size';
    } else if (pdpSelections.bottom) {
      if (hint) hint.textContent = 'Please select a Top size';
    } else {
      if (hint) hint.textContent = '* Select Top & Bottom sizes';
    }
  } else {
    if (pdpSelections.size) {
      isValid = true;
    } else {
      if (hint) hint.textContent = '* Select a size';
    }
  }

  if (isValid) {
    if (hint) {
      hint.textContent = 'Ready to add to bag ✦';
      hint.style.color = 'var(--accent-olive)';
    }
    if (addBtn) {
      addBtn.classList.remove('disabled');
      addBtn.removeAttribute('disabled');
    }
    if (mobileBarBtn) {
      mobileBarBtn.classList.remove('disabled');
      mobileBarBtn.removeAttribute('disabled');
      mobileBarBtn.textContent = 'ADD TO BAG ✦';
    }
  } else {
    if (hint) hint.style.color = 'var(--accent-terracotta)';
    if (addBtn) {
      addBtn.classList.add('disabled');
      addBtn.setAttribute('disabled', 'true');
    }
    if (mobileBarBtn) {
      mobileBarBtn.classList.add('disabled');
      mobileBarBtn.setAttribute('disabled', 'true');
      mobileBarBtn.textContent = 'SELECT A SIZE';
    }
  }
}

function showPdpAddConfirmation() {
  const addBtn = document.getElementById('pdpAddToCartBtn');
  const mobileBarBtn = document.getElementById('mobileBarAddToCartBtn');
  const prevText = addBtn ? addBtn.textContent : 'Add to Bag';

  if (addBtn) addBtn.textContent = 'ADDED TO BAG ✦';
  if (mobileBarBtn) mobileBarBtn.textContent = 'ADDED TO BAG ✦';

  setTimeout(() => {
    if (addBtn) addBtn.textContent = prevText;
    if (mobileBarBtn) mobileBarBtn.textContent = 'ADD TO BAG ✦';
  }, 2500);
}

function updatePdpWishlistState() {
  const wishBtn = document.getElementById('pdpWishlistBtn');
  const mobileOverlayWishBtn = document.getElementById('pdpMobileWishlistBtn');
  if (!currentPdpProduct) return;

  const isFav = typeof isFavorite === 'function' ? isFavorite(currentPdpProduct.id) : (typeof favoritesList !== 'undefined' && favoritesList.includes(currentPdpProduct.id));

  [wishBtn, mobileOverlayWishBtn].forEach(btn => {
    if (!btn) return;
    btn.classList.toggle('active', isFav);
    btn.innerHTML = isFav ? '♥' : '♡';

    btn.onclick = (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (typeof toggleFavorite === 'function') {
        toggleFavorite(currentPdpProduct.id);
        const newFav = typeof isFavorite === 'function' ? isFavorite(currentPdpProduct.id) : favoritesList.includes(currentPdpProduct.id);
        [wishBtn, mobileOverlayWishBtn].forEach(b => {
          if (b) {
            b.classList.toggle('active', newFav);
            b.innerHTML = newFav ? '♥' : '♡';
          }
        });
      }
    };
  });
}

function initPdpAccordion() {
  const items = document.querySelectorAll('#pdpAccordion .accordion-item');
  items.forEach(item => {
    const header = item.querySelector('.accordion-header');
    if (!header) return;

    // Collapsed by default on mobile
    item.classList.remove('is-open');
    header.setAttribute('aria-expanded', 'false');

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      item.classList.toggle('is-open', !isOpen);
      header.setAttribute('aria-expanded', String(!isOpen));
    });
  });
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
