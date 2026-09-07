/**
 * Editorial Resort & Intimates - Product Catalog & Independent Sizing Module (Vanilla JS)
 * Handles JSON fetching, upgraded catalog card rendering with soft crossfade, desktop hover Quick Add,
 * inline size selection, wishlist persistence, and PDP navigation.
 */

const LOCAL_PRODUCTS_FALLBACK = [
  {
    "id": "drs-bur-cro-001",
    "name": "Burgundy Crochet Maxi Dress",
    "price": null,
    "category": "Dresses",
    "subCategory": "dresses",
    "type": "single",
    "collection": ["Crochet Dresses", "Maxi Dresses", "Resort Wear", "New Arrivals"],
    "image": "assets/images/burgundy-crochet-maxi-dress-01-hero-front.webp",
    "secondaryImage": "assets/images/burgundy-crochet-maxi-dress-02-open-back.webp",
    "gallery": [
      { "role": "hero", "src": "assets/images/burgundy-crochet-maxi-dress-01-hero-front.webp", "alt": "Burgundy crochet maxi dress front view" },
      { "role": "feature", "src": "assets/images/burgundy-crochet-maxi-dress-02-open-back.webp", "alt": "Burgundy crochet maxi dress with open back" },
      { "role": "fit", "src": "assets/images/burgundy-crochet-maxi-dress-03-side-silhouette.webp", "alt": "Burgundy crochet maxi dress side silhouette" },
      { "role": "craft", "src": "assets/images/burgundy-crochet-maxi-dress-04-crochet-detail.webp", "alt": "Close-up of intricate crochet detailing on a burgundy maxi dress" },
      { "role": "editorial", "src": "assets/images/burgundy-crochet-maxi-dress-05-seated-editorial.webp", "alt": "Model wearing a burgundy crochet maxi dress seated indoors" },
      { "role": "lifestyle", "src": "assets/images/burgundy-crochet-maxi-dress-06-window-lifestyle.webp", "alt": "Model wearing a burgundy crochet maxi dress beside a seaside window" }
    ],
    "descriptor": "Handcrafted crochet maxi dress with an open back and flowing full-length silhouette.",
    "description": "The Burgundy Crochet Maxi Dress is a statement piece crafted for effortless, resort-inspired dressing. Featuring an open-back design, flowing full-length silhouette and intricate crochet detailing, it brings texture and movement to warm-weather occasions.",
    "details": [
      "Full-length maxi silhouette",
      "Open-back design",
      "Intricate crochet construction",
      "Flowing, feminine silhouette",
      "Burgundy colorway",
      "Designed for resort and occasion styling"
    ],
    "color": "Burgundy",
    "sku": "DRS-BUR-CRO-001",
    "seoTitle": "Burgundy Crochet Maxi Dress | Editorial Resort",
    "metaDescription": "Discover our Burgundy Crochet Maxi Dress with an open back, flowing silhouette and intricate crochet detailing, designed for effortless resort and summer dressing.",
    "primaryKeyword": "burgundy crochet maxi dress",
    "secondaryKeywords": ["crochet maxi dress", "burgundy crochet dress", "open back crochet dress", "crochet resort dress", "crochet summer dress", "crochet vacation dress"],
    "variants": {
      "size": ["TBD"]
    },
    "material": "TBD",
    "fit": "TBD",
    "care": "TBD",
    "shipping": "TBD",
    "stock": "TBD",
    "measurements": "TBD",
    "inStock": true,
    "featured": true,
    "rating": null,
    "reviewsCount": 0
  }
];

let catalogProducts = [];
const activeCardSelections = {};

// Favorites state in localStorage
const FAVORITES_KEY = 'editorial_resort_favorites';
let favoritesList = [];

document.addEventListener('DOMContentLoaded', () => {
  loadFavorites();
  fetchCatalog();
});

function getProductGallery(product) {
  if (product && Array.isArray(product.gallery) && product.gallery.length > 0) {
    return product.gallery;
  }
  const hero = product.image || '';
  const feature = product.secondaryImage || hero;
  return [
    { role: 'hero', src: hero },
    { role: 'feature', src: feature }
  ];
}

function loadFavorites() {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) favoritesList = JSON.parse(saved);
  } catch (e) {
    favoritesList = [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesList));
  } catch (e) {
    console.error('Failed to save favorites:', e);
  }
}

function toggleFavorite(prodId) {
  const idx = favoritesList.indexOf(prodId);
  if (idx > -1) {
    favoritesList.splice(idx, 1);
  } else {
    favoritesList.push(prodId);
  }
  saveFavorites();
  updateFavoriteIcons();
}

function updateFavoriteIcons() {
  document.querySelectorAll('.favorite-btn').forEach(btn => {
    const id = btn.getAttribute('data-id');
    const isFav = favoritesList.includes(id);
    btn.classList.toggle('active', isFav);
    btn.setAttribute('aria-label', isFav ? 'Remove from Wishlist' : 'Add to Wishlist');
    btn.innerHTML = isFav ? '♥' : '♡';
  });
}

/**
 * Fetch product data with fallback and path normalization
 */
async function fetchCatalog() {
  try {
    if (window.location.protocol === 'file:') {
      catalogProducts = LOCAL_PRODUCTS_FALLBACK;
    } else {
      const res = await fetch('data/products.json?v=' + Date.now())
        .catch(() => fetch('../data/products.json?v=' + Date.now()))
        .catch(() => null);
      if (res && res.ok) {
        catalogProducts = await res.json();
      } else {
        catalogProducts = LOCAL_PRODUCTS_FALLBACK;
      }
    }
  } catch (e) {
    console.warn('Using local fallback dataset:', e);
    catalogProducts = LOCAL_PRODUCTS_FALLBACK;
  }

  const isInsidePagesFolder = window.location.pathname.includes('/pages/');
  if (isInsidePagesFolder) {
    catalogProducts = catalogProducts.map(p => ({
      ...p,
      image: p.image.startsWith('../') ? p.image : `../${p.image}`,
      secondaryImage: p.secondaryImage ? (p.secondaryImage.startsWith('../') ? p.secondaryImage : `../${p.secondaryImage}`) : p.image,
      gallery: p.gallery ? p.gallery.map(g => ({ ...g, src: g.src.startsWith('../') ? g.src : `../${g.src}` })) : undefined
    }));
  }

  window.catalogProducts = catalogProducts;
  initCatalogRender();
  initCategoryTabs();
}

/**
 * Render grid based on current page
 */
function initCatalogRender() {
  const featuredGrid = document.getElementById('featuredProductsGrid');
  const catalogGrid = document.getElementById('catalogProductsGrid');

  if (featuredGrid) {
    const featuredItems = catalogProducts.filter(p => p.featured);
    renderProducts(featuredItems, featuredGrid);
  }

  if (catalogGrid) {
    renderProducts(catalogProducts, catalogGrid);
  }
}

/**
 * Render Product Grid DOM with Upgraded Card System & Inline Quick Add
 */
function renderProducts(items, container) {
  container.innerHTML = '';

  if (!items || items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <p style="font-family: var(--font-serif); font-size: 1.5rem; color: var(--text-main);">No Swimwear Found</p>
        <p>No products match the selected category filter.</p>
      </div>
    `;
    return;
  }

  const isInsidePagesFolder = window.location.pathname.includes('/pages/');

  items.forEach(product => {
    if (!activeCardSelections[product.id]) {
      activeCardSelections[product.id] = { top: null, bottom: null, size: null };
    }

    const card = document.createElement('article');
    card.className = 'product-card';
    card.id = `card-${product.id}`;

    const isSet = product.type === 'set';
    const isFav = favoritesList.includes(product.id);
    const gallery = getProductGallery(product);
    const heroImgSrc = gallery[0] ? gallery[0].src : product.image;
    const secondaryImgSrc = gallery[1] ? gallery[1].src : heroImgSrc;

    const pdpUrl = isInsidePagesFolder ? `product.html?id=${product.id}` : `pages/product.html?id=${product.id}`;

    let swatchHTML = '';
    if (isSet) {
      const topSizes = (product.variants && product.variants.top) || ['XS', 'S', 'M', 'L'];
      const bottomSizes = (product.variants && product.variants.bottom) || ['XS', 'S', 'M', 'L'];

      swatchHTML = `
        <div class="swatch-group">
          <div class="swatch-group-label">
            <span>Top Size</span>
            <span class="selected-value" id="top-val-${product.id}">Select Top</span>
          </div>
          <div class="swatches-row">
            ${topSizes.map(sz => `<button class="swatch-btn" data-prod="${product.id}" data-group="top" data-size="${sz}">${sz}</button>`).join('')}
          </div>
        </div>

        <div class="swatch-group">
          <div class="swatch-group-label">
            <span>Bottom Size</span>
            <span class="selected-value" id="bottom-val-${product.id}">Select Bottom</span>
          </div>
          <div class="swatches-row">
            ${bottomSizes.map(sz => `<button class="swatch-btn" data-prod="${product.id}" data-group="bottom" data-size="${sz}">${sz}</button>`).join('')}
          </div>
        </div>
      `;
    } else {
      const singleSizes = (product.variants && product.variants.size) || ['XS', 'S', 'M', 'L'];
      swatchHTML = `
        <div class="swatch-group">
          <div class="swatch-group-label">
            <span>Size</span>
            <span class="selected-value" id="size-val-${product.id}">Select Size</span>
          </div>
          <div class="swatches-row">
            ${singleSizes.map(sz => `<button class="swatch-btn" data-prod="${product.id}" data-group="size" data-size="${sz}">${sz}</button>`).join('')}
          </div>
        </div>
      `;
    }

    const descriptorText = product.descriptor || 'Handcrafted Resortwear';

    const picOptionsHero = {
      pictureClass: 'card-primary-img',
      imgClass: 'card-primary-img',
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      width: 960,
      height: 1280,
      loading: 'eager'
    };

    const picOptionsSecondary = {
      pictureClass: 'card-secondary-img',
      imgClass: 'card-secondary-img',
      sizes: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
      width: 960,
      height: 1280,
      loading: 'lazy'
    };

    const heroPicHTML = typeof createResponsivePictureHTML === 'function'
      ? createResponsivePictureHTML(heroImgSrc, product.name, picOptionsHero)
      : `<img src="${heroImgSrc}" alt="${product.name}" class="card-primary-img" loading="eager">`;

    const secPicHTML = (secondaryImgSrc && secondaryImgSrc !== heroImgSrc)
      ? (typeof createResponsivePictureHTML === 'function'
          ? createResponsivePictureHTML(secondaryImgSrc, `${product.name} Secondary`, picOptionsSecondary)
          : `<img src="${secondaryImgSrc}" alt="${product.name} Hover" class="card-secondary-img" loading="lazy">`)
      : '';

    card.innerHTML = `
      <div class="card-image-box" data-pdp="${pdpUrl}">
        <span class="card-category-tag">${escapeHTML(product.category)}</span>
        <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${product.id}" aria-label="${isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}">
          ${isFav ? '♥' : '♡'}
        </button>

        ${heroPicHTML}
        ${secPicHTML}

        <div class="card-quick-actions-overlay">
          <button class="btn-quick-add-trigger" data-id="${product.id}">
            Quick Add +
          </button>
          <button class="btn-quick-view-trigger" data-id="${product.id}" title="Quick View">
            ✦ Quick View
          </button>
        </div>
      </div>

      <div class="card-content">
        <div class="card-header">
          <h3 class="card-title">
            <a href="${pdpUrl}" class="card-title-link">${escapeHTML(product.name)}</a>
          </h3>
          <span class="card-price">${(product.price !== null && product.price !== undefined && product.price !== 'TBD') ? '$' + Number(product.price).toFixed(2) : 'Price TBD'}</span>
        </div>

        <p class="card-descriptor">${escapeHTML(descriptorText)}</p>

        <!-- Inline Quick Add Box (Revealed when Quick Add is clicked on card) -->
        <div class="inline-quick-add-box" id="quick-add-box-${product.id}" style="display: none;">
          ${swatchHTML}

          <div class="card-validation-hint" id="hint-${product.id}">
            * ${isSet ? 'Select Top & Bottom sizes' : 'Select a size'}
          </div>

          <button class="btn btn-solid btn-add-cart disabled" id="add-btn-${product.id}" data-id="${product.id}" disabled>
            Add to Bag
          </button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });

  attachCardEvents(container);
  attachSwatchListeners(container);
  attachFavoriteListeners(container);
  attachQuickViewModalListeners(container);
}

/**
 * Handle Card Click Navigation (Desktop & Mobile) and Quick Add Toggle
 */
function attachCardEvents(container) {
  container.querySelectorAll('.card-image-box').forEach(box => {
    box.addEventListener('click', (e) => {
      // Do not navigate if clicking favorite button, quick add trigger, or quick view trigger
      if (
        e.target.closest('.favorite-btn') ||
        e.target.closest('.btn-quick-add-trigger') ||
        e.target.closest('.btn-quick-view-trigger')
      ) {
        return;
      }

      const pdpUrl = box.getAttribute('data-pdp');
      if (pdpUrl) {
        window.location.href = pdpUrl;
      }
    });
  });

  container.querySelectorAll('.btn-quick-add-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const prodId = btn.getAttribute('data-id');
      const box = document.getElementById(`quick-add-box-${prodId}`);
      if (!box) return;

      const isHidden = box.style.display === 'none' || !box.style.display;
      document.querySelectorAll('.inline-quick-add-box').forEach(b => {
        if (b !== box) b.style.display = 'none';
      });

      box.style.display = isHidden ? 'block' : 'none';
      btn.textContent = isHidden ? 'Close Add -' : 'Quick Add +';
    });
  });
}

/**
 * Quick-View Modal Logic (Maintained as quick view option)
 */
const modalSelections = { top: null, bottom: null, size: null };

function attachQuickViewModalListeners(container) {
  container.querySelectorAll('.btn-quick-view-trigger').forEach(target => {
    target.addEventListener('click', (e) => {
      e.stopPropagation();
      const prodId = target.getAttribute('data-id');
      const product = catalogProducts.find(p => p.id === prodId);
      if (product) openProductQuickViewModal(product);
    });
  });
}

function openProductQuickViewModal(product) {
  const backdrop = document.getElementById('productQuickViewBackdrop');
  const modalBody = document.getElementById('productModalBody');
  const closeBtn = document.getElementById('productModalCloseBtn');

  if (!backdrop || !modalBody) return;

  modalSelections.top = null;
  modalSelections.bottom = null;
  modalSelections.size = null;

  const isSet = product.type === 'set';
  const ratingVal = (product.rating || 5.0).toFixed(1);
  const revCount = product.reviewsCount || 12;

  let swatchHTML = '';
  if (isSet) {
    const topSizes = (product.variants && product.variants.top) || ['XS', 'S', 'M', 'L'];
    const bottomSizes = (product.variants && product.variants.bottom) || ['XS', 'S', 'M', 'L'];

    swatchHTML = `
      <div>
        <div class="swatch-group-label">
          <span>Top Size</span>
          <span class="selected-value" id="modal-top-val">Select Top</span>
        </div>
        <div class="swatches-row" id="modalTopRow">
          ${topSizes.map(sz => `<button class="swatch-btn modal-swatch" data-group="top" data-size="${sz}">${sz}</button>`).join('')}
        </div>
      </div>

      <div>
        <div class="swatch-group-label">
          <span>Bottom Size</span>
          <span class="selected-value" id="modal-bottom-val">Select Bottom</span>
        </div>
        <div class="swatches-row" id="modalBottomRow">
          ${bottomSizes.map(sz => `<button class="swatch-btn modal-swatch" data-group="bottom" data-size="${sz}">${sz}</button>`).join('')}
        </div>
      </div>
    `;
  } else {
    const singleSizes = (product.variants && product.variants.size) || ['XS', 'S', 'M', 'L'];
    swatchHTML = `
      <div>
        <div class="swatch-group-label">
          <span>Size</span>
          <span class="selected-value" id="modal-size-val">Select Size</span>
        </div>
        <div class="swatches-row" id="modalSizeRow">
          ${singleSizes.map(sz => `<button class="swatch-btn modal-swatch" data-group="size" data-size="${sz}">${sz}</button>`).join('')}
        </div>
      </div>
    `;
  }

  const mainImg = product.image.startsWith('../') ? product.image : (window.location.pathname.includes('/pages/') ? `../${product.image}` : product.image);

  modalBody.innerHTML = `
    <div class="product-modal-image-col">
      ${typeof createResponsivePictureHTML === 'function' ? createResponsivePictureHTML(mainImg, product.name, { sizes: '(max-width: 767px) 100vw, 450px', style: 'width: 100%; height: 100%; object-fit: cover;', width: 960, height: 1280 }) : `<img src="${mainImg}" alt="${product.name}">`}
    </div>
    <div class="product-modal-details-col">
      <span class="micro-label">${escapeHTML(product.category)}</span>
      <h2 class="product-modal-title">${escapeHTML(product.name)}</h2>
      
      <div class="product-modal-meta">
        <span class="product-modal-price">${(product.price !== null && product.price !== undefined && product.price !== 'TBD') ? '$' + Number(product.price).toFixed(2) : 'Price TBD'}</span>
        <div class="product-modal-rating">
          <span class="star-icon">★</span> ${ratingVal} <span class="reviews-count">(${revCount} reviews)</span>
        </div>
      </div>

      <p class="product-modal-description">
        ${escapeHTML(product.description)}
      </p>

      <div class="variant-selection-box modal-cta-box">
        ${swatchHTML}

        <div class="card-validation-hint" id="modalHint">* ${isSet ? 'Select Top & Bottom sizes' : 'Select a size'}</div>

        <button class="btn btn-solid disabled" id="modalAddToCartBtn" disabled style="width: 100%; margin-top: 0.75rem;">
          Add to Bag
        </button>
      </div>
    </div>
  `;

  modalBody.querySelectorAll('.modal-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.getAttribute('data-group');
      const size = btn.getAttribute('data-size');
      const parent = btn.closest('.swatches-row');
      parent.querySelectorAll('.modal-swatch').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      modalSelections[group] = size;
      const label = document.getElementById(`modal-${group}-val`);
      if (label) label.textContent = size;

      const modalBtn = document.getElementById('modalAddToCartBtn');
      const modalHint = document.getElementById('modalHint');

      const isValid = isSet ? (modalSelections.top && modalSelections.bottom) : Boolean(modalSelections.size);

      if (isValid) {
        if (modalBtn) {
          modalBtn.classList.remove('disabled');
          modalBtn.removeAttribute('disabled');
        }
        if (modalHint) {
          modalHint.textContent = 'Ready to add to bag ✦';
          modalHint.style.color = 'var(--accent-olive)';
        }
      } else {
        if (modalBtn) {
          modalBtn.classList.add('disabled');
          modalBtn.setAttribute('disabled', 'true');
        }
      }
    });
  });

  const modalBtn = document.getElementById('modalAddToCartBtn');
  if (modalBtn) {
    modalBtn.addEventListener('click', () => {
      addToCart(product, modalSelections);
      closeProductQuickViewModal();
    });
  }

  backdrop.classList.add('is-open');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  if (closeBtn) closeBtn.onclick = closeProductQuickViewModal;
  backdrop.onclick = (e) => {
    if (e.target === backdrop) closeProductQuickViewModal();
  };
}

function closeProductQuickViewModal() {
  const backdrop = document.getElementById('productQuickViewBackdrop');
  if (backdrop) {
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function attachFavoriteListeners(container) {
  container.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const prodId = btn.getAttribute('data-id');
      toggleFavorite(prodId);
    });
  });
}

function attachSwatchListeners(container) {
  container.querySelectorAll('.swatch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const prodId = btn.getAttribute('data-prod');
      const group = btn.getAttribute('data-group');
      const sizeVal = btn.getAttribute('data-size');

      const parentRow = btn.closest('.swatches-row');
      parentRow.querySelectorAll('.swatch-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      activeCardSelections[prodId][group] = sizeVal;

      const labelEl = document.getElementById(`${group}-val-${prodId}`);
      if (labelEl) labelEl.textContent = sizeVal;

      validateCardSelections(prodId);
    });
  });

  container.querySelectorAll('.btn-add-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const prodId = btn.getAttribute('data-id');
      const product = catalogProducts.find(p => p.id === prodId);
      const selections = activeCardSelections[prodId];

      if (!product || !selections) return;

      const isValid = product.type === 'set'
        ? (selections.top && selections.bottom)
        : Boolean(selections.size);

      if (isValid) {
        addToCart(product, selections);
        btn.textContent = 'Added to Bag ✦';
        setTimeout(() => { btn.textContent = 'Add to Bag'; }, 2000);
      }
    });
  });
}

function validateCardSelections(prodId) {
  const product = catalogProducts.find(p => p.id === prodId);
  const selections = activeCardSelections[prodId];
  const btn = document.getElementById(`add-btn-${prodId}`);
  const hint = document.getElementById(`hint-${prodId}`);

  if (!product || !selections || !btn || !hint) return;

  let isValid = false;

  if (product.type === 'set') {
    if (selections.top && selections.bottom) {
      isValid = true;
    } else if (selections.top) {
      hint.textContent = 'Please select a Bottom size';
    } else if (selections.bottom) {
      hint.textContent = 'Please select a Top size';
    } else {
      hint.textContent = '* Select Top & Bottom sizes';
    }
  } else {
    if (selections.size) {
      isValid = true;
    } else {
      hint.textContent = '* Select a size';
    }
  }

  if (isValid) {
    btn.classList.remove('disabled');
    btn.removeAttribute('disabled');
    hint.textContent = 'Ready to add to bag ✦';
    hint.style.color = 'var(--accent-olive)';
  } else {
    btn.classList.add('disabled');
    btn.setAttribute('disabled', 'true');
    hint.style.color = 'var(--accent-terracotta)';
  }
}

function initCategoryTabs() {
  const tabs = document.querySelectorAll('.filter-tab-btn');
  if (!tabs || tabs.length === 0) return;

  const filterByCategory = (category) => {
    tabs.forEach(t => {
      const isMatch = t.getAttribute('data-category') === category;
      t.classList.toggle('active', isMatch);
      t.setAttribute('aria-selected', isMatch ? 'true' : 'false');
    });

    const catalogGrid = document.getElementById('catalogProductsGrid');
    if (!catalogGrid) return;

    if (!category || category === 'all') {
      renderProducts(catalogProducts, catalogGrid);
    } else {
      const filtered = catalogProducts.filter(p => p.subCategory === category || p.category.toLowerCase().replace(/\s+/g, '-') === category);
      renderProducts(filtered, catalogGrid);
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.getAttribute('data-category');
      filterByCategory(category);
    });
  });

  const urlCategory = new URLSearchParams(window.location.search).get('category');
  if (urlCategory) {
    filterByCategory(urlCategory);
  }
}
