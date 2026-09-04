/**
 * Editorial Resort & Intimates - Product Catalog & Independent Sizing Module (Vanilla JS)
 * Handles JSON fetching, rendering upgraded product cards (secondary image swap, ratings, favorites),
 * independent top/bottom variant swatches, Add-to-cart validation gating, and category tab filtering.
 */

const LOCAL_PRODUCTS_FALLBACK = [
  {
    "id": "resort-001",
    "name": "The Mallorca Ring-Front Crochet Dress",
    "price": 210.00,
    "category": "Resortwear",
    "subCategory": "resortwear",
    "type": "single",
    "collection": "amalfi-26",
    "image": "assets/images/aegean-crochet-dress.jpg",
    "secondaryImage": "assets/images/aegean-crochet-dress.jpg",
    "descriptor": "Chunky crochet rib • Slate blue knit",
    "description": "Sculpted from a breathable cotton-linen ribbed crochet in soft slate blue. Features a plunging neckline, tonal ring-bound waist cutouts, and bishop sleeves with handcrafted tassel ties.",
    "variants": { "size": ["XS", "S", "M", "L"] },
    "inStock": true,
    "featured": true,
    "rating": 5.0,
    "reviewsCount": 18
  },
  {
    "id": "swim-001",
    "name": "The Sienna Crochet Bikini Set",
    "price": 185.00,
    "category": "Bikini Sets",
    "subCategory": "bikini-sets",
    "type": "set",
    "collection": "sienna-sunset",
    "image": "assets/images/sienna-set.svg",
    "secondaryImage": "assets/images/solis-set.svg",
    "descriptor": "Hand-crocheted • Unbleached organic linen",
    "description": "Hand-stitched from unbleached organic linen yarn. Features a minimal halter triangle top and high-cut skimpy bottoms with delicate hand-knotted ties.",
    "variants": { "top": ["XS", "S", "M", "L"], "bottom": ["XS", "S", "M", "L"] },
    "inStock": true,
    "featured": true,
    "rating": 5.0,
    "reviewsCount": 24
  },
  {
    "id": "swim-002",
    "name": "The Amalfi Terracotta Halter Top",
    "price": 95.00,
    "category": "Tops",
    "subCategory": "tops",
    "type": "single",
    "collection": "amalfi-26",
    "image": "assets/images/amalfi-top.svg",
    "secondaryImage": "assets/images/capri-top.svg",
    "descriptor": "Hand-knitted • Terracotta rib",
    "description": "Sculptural ribbed crochet halter top in warm terracotta. Designed for light support with self-tie back straps and scalloped edges.",
    "variants": { "size": ["XS", "S", "M", "L"] },
    "inStock": true,
    "featured": true,
    "rating": 4.9,
    "reviewsCount": 18
  },
  {
    "id": "swim-003",
    "name": "The Dune Ribbed Cheeky Bottom",
    "price": 85.00,
    "category": "Bottoms",
    "subCategory": "bottoms",
    "type": "single",
    "collection": "amalfi-26",
    "image": "assets/images/dune-bottom.svg",
    "secondaryImage": "assets/images/bone-shorts.svg",
    "descriptor": "Minimalist high-leg • Dune beige cotton",
    "description": "Minimalist high-leg crochet swim bottoms crafted in dune beige cotton yarn. Fast-drying weave with hidden elastic reinforcement.",
    "variants": { "size": ["XS", "S", "M", "L"] },
    "inStock": true,
    "featured": false,
    "rating": 4.8,
    "reviewsCount": 14
  },
  {
    "id": "swim-004",
    "name": "The Paloma Resort Monokini Set",
    "price": 220.00,
    "category": "Bikini Sets",
    "subCategory": "bikini-sets",
    "type": "set",
    "collection": "amalfi-26",
    "image": "assets/images/paloma-set.svg",
    "secondaryImage": "assets/images/sienna-set.svg",
    "descriptor": "Resort Cutout • Sheer black lace",
    "description": "Statement cutout crochet set featuring an adjustable bralette top and high-waist vintage-cut bottom connected by sheer lace detailing.",
    "variants": { "top": ["XS", "S", "M", "L"], "bottom": ["XS", "S", "M", "L"] },
    "inStock": true,
    "featured": true,
    "rating": 5.0,
    "reviewsCount": 31
  },
  {
    "id": "swim-005",
    "name": "The Olive Knit Bralette Intimate",
    "price": 110.00,
    "category": "Intimates",
    "subCategory": "intimates",
    "type": "single",
    "collection": "sienna-sunset",
    "image": "assets/images/olive-bralette.svg",
    "secondaryImage": "assets/images/amalfi-top.svg",
    "descriptor": "Fine bamboo thread • Soft unlined fit",
    "description": "Ultra-soft intimate bralette crocheted in fine muted olive bamboo thread. Unlined silhouette designed for lounging and low-impact wear.",
    "variants": { "size": ["XS", "S", "M", "L"] },
    "inStock": true,
    "featured": false,
    "rating": 4.9,
    "reviewsCount": 22
  },
  {
    "id": "swim-006",
    "name": "The Solis Terracotta Bikini Set",
    "price": 195.00,
    "category": "Bikini Sets",
    "subCategory": "bikini-sets",
    "type": "set",
    "collection": "amalfi-26",
    "image": "assets/images/solis-set.svg",
    "secondaryImage": "assets/images/paloma-set.svg",
    "descriptor": "Molded cup set • Brass hardware",
    "description": "Earthy terracotta crochet bikini pairing a soft molded cup top with adjustable tie-side bottoms. Accented with brass bead hardware.",
    "variants": { "top": ["XS", "S", "M", "L"], "bottom": ["XS", "S", "M", "L"] },
    "inStock": true,
    "featured": true,
    "rating": 5.0,
    "reviewsCount": 19
  },
  {
    "id": "swim-007",
    "name": "The Bone Knit Lounge Short Intimate",
    "price": 90.00,
    "category": "Intimates",
    "subCategory": "intimates",
    "type": "single",
    "collection": "sienna-sunset",
    "image": "assets/images/bone-shorts.svg",
    "secondaryImage": "assets/images/dune-bottom.svg",
    "descriptor": "High-waist lounge • Unbleached bone",
    "description": "Relaxed high-waist knit lounge shorts in unbleached bone yarn. Features a drawstring waist and fine scalloped hems.",
    "variants": { "size": ["XS", "S", "M", "L"] },
    "inStock": true,
    "featured": false,
    "rating": 4.8,
    "reviewsCount": 16
  },
  {
    "id": "swim-008",
    "name": "The Capri Underwire Crochet Top",
    "price": 115.00,
    "category": "Tops",
    "subCategory": "tops",
    "type": "single",
    "collection": "amalfi-26",
    "image": "assets/images/capri-top.svg",
    "secondaryImage": "assets/images/amalfi-top.svg",
    "descriptor": "Underwire support • Gold clasp detail",
    "description": "Structured crochet top featuring subtle underwire support, wide shoulder straps, and custom gold-toned back clasp.",
    "variants": { "size": ["XS", "S", "M", "L"] },
    "inStock": true,
    "featured": false,
    "rating": 4.9,
    "reviewsCount": 27
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
 * Fetch product data with fallback
 */
async function fetchCatalog() {
  try {
    if (window.location.protocol === 'file:') {
      catalogProducts = LOCAL_PRODUCTS_FALLBACK;
    } else {
      const res = await fetch('data/products.json?v=' + Date.now()).catch(() => fetch('../data/products.json?v=' + Date.now())).catch(() => null);
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
      secondaryImage: p.secondaryImage ? (p.secondaryImage.startsWith('../') ? p.secondaryImage : `../${p.secondaryImage}`) : p.image
    }));
  }

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
 * Render Product Grid DOM with Upgraded Card System & Independent Swatches
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

  items.forEach(product => {
    if (!activeCardSelections[product.id]) {
      activeCardSelections[product.id] = { top: null, bottom: null, size: null };
    }

    const card = document.createElement('article');
    card.className = 'product-card';
    card.id = `card-${product.id}`;

    const isSet = product.type === 'set';
    const isFav = favoritesList.includes(product.id);
    const secondaryImgSrc = product.secondaryImage || product.image;

    let swatchHTML = '';
    if (isSet) {
      const topSizes = product.variants.top || ['XS', 'S', 'M', 'L'];
      const bottomSizes = product.variants.bottom || ['XS', 'S', 'M', 'L'];

      swatchHTML = `
        <div>
          <div class="swatch-group-label">
            <span>Top Size</span>
            <span class="selected-value" id="top-val-${product.id}">Select Top</span>
          </div>
          <div class="swatches-row">
            ${topSizes.map(sz => `<button class="swatch-btn" data-prod="${product.id}" data-group="top" data-size="${sz}">${sz}</button>`).join('')}
          </div>
        </div>

        <div>
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
      const singleSizes = product.variants.size || ['XS', 'S', 'M', 'L'];
      swatchHTML = `
        <div>
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

    const ratingVal = (product.rating || 5.0).toFixed(1);
    const revCount = product.reviewsCount || 12;
    const descriptorText = product.descriptor || 'Handcrafted Resortware';

    card.innerHTML = `
      <div class="card-image-box">
        <span class="card-category-tag">${escapeHTML(product.category)}</span>
        <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${product.id}" aria-label="${isFav ? 'Remove from Wishlist' : 'Add to Wishlist'}">
          ${isFav ? '♥' : '♡'}
        </button>

        <img src="${product.image}" alt="${escapeHTML(product.name)}" class="card-primary-img" loading="lazy">
        <img src="${secondaryImgSrc}" alt="${escapeHTML(product.name)} Hover View" class="card-secondary-img" loading="lazy">
      </div>
      <div class="card-content">
        <div class="card-rating">
          <span style="color: var(--accent-terracotta);">★</span>
          <span>${ratingVal}</span>
          <span style="color: var(--text-light); font-size: 0.76rem;">(${revCount})</span>
        </div>

        <div class="card-header">
          <h3 class="card-title">${escapeHTML(product.name)}</h3>
          <span class="card-price">$${product.price.toFixed(2)}</span>
        </div>

        <p class="card-descriptor">${escapeHTML(descriptorText)}</p>

        <div class="variant-selection-box">
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

  attachSwatchListeners(container);
  attachFavoriteListeners(container);
  attachQuickViewModalListeners(container);
}

/**
 * Phase 2c: Product Quick-View Modal Logic
 */
const modalSelections = { top: null, bottom: null, size: null };

function attachQuickViewModalListeners(container) {
  container.querySelectorAll('.card-image-box').forEach(box => {
    box.addEventListener('click', (e) => {
      if (e.target.classList.contains('favorite-btn')) return;
      const card = box.closest('.product-card');
      const prodId = card.id.replace('card-', '');
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

  // Reset modal selections
  modalSelections.top = null;
  modalSelections.bottom = null;
  modalSelections.size = null;

  const isSet = product.type === 'set';
  const secondaryImgSrc = product.secondaryImage || product.image;
  const ratingVal = (product.rating || 5.0).toFixed(1);
  const revCount = product.reviewsCount || 12;

  let swatchHTML = '';
  if (isSet) {
    const topSizes = product.variants.top || ['XS', 'S', 'M', 'L'];
    const bottomSizes = product.variants.bottom || ['XS', 'S', 'M', 'L'];

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
    const singleSizes = product.variants.size || ['XS', 'S', 'M', 'L'];
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

  modalBody.innerHTML = `
    <div style="aspect-ratio: 3/4; background-color: var(--bg-sand); overflow: hidden; border-radius: var(--radius-strict);">
      <img src="${product.image}" alt="${escapeHTML(product.name)}" style="width: 100%; height: 100%; object-fit: cover;">
    </div>
    <div style="display: flex; flex-direction: column; justify-content: center;">
      <span class="micro-label">${escapeHTML(product.category)}</span>
      <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">${escapeHTML(product.name)}</h2>
      
      <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
        <span style="font-family: var(--font-serif); font-size: 1.5rem; font-weight: 600;">$${product.price.toFixed(2)}</span>
        <div style="font-size: 0.88rem; font-weight: 600;">
          <span style="color: var(--accent-terracotta);">★</span> ${ratingVal} <span style="color: var(--text-light);">(${revCount} reviews)</span>
        </div>
      </div>

      <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.6;">
        ${escapeHTML(product.description)}
      </p>

      <div class="variant-selection-box" style="border-top: 1px solid var(--border-hairline); padding-top: 1.25rem;">
        ${swatchHTML}

        <div class="card-validation-hint" id="modalHint">* ${isSet ? 'Select Top & Bottom sizes' : 'Select a size'}</div>

        <button class="btn btn-solid disabled" id="modalAddToCartBtn" disabled style="width: 100%; margin-top: 0.75rem;">
          Add to Bag
        </button>
      </div>
    </div>
  `;

  // Attach modal swatch listeners
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

      // Validate modal selections
      const modalBtn = document.getElementById('modalAddToCartBtn');
      const modalHint = document.getElementById('modalHint');

      const isValid = isSet ? (modalSelections.top && modalSelections.bottom) : Boolean(modalSelections.size);

      if (isValid) {
        modalBtn.classList.remove('disabled');
        modalBtn.removeAttribute('disabled');
        modalHint.textContent = 'Ready to add to bag ✦';
        modalHint.style.color = 'var(--accent-olive)';
      } else {
        modalBtn.classList.add('disabled');
        modalBtn.setAttribute('disabled', 'true');
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

  if (closeBtn) {
    closeBtn.onclick = closeProductQuickViewModal;
  }

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

/**
 * Favorite Toggle Click Listener
 */
function attachFavoriteListeners(container) {
  container.querySelectorAll('.favorite-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const prodId = btn.getAttribute('data-id');
      toggleFavorite(prodId);
    });
  });
}

/**
 * Handle Independent Swatch Clicking & Validation State Updates
 */
function attachSwatchListeners(container) {
  container.querySelectorAll('.swatch-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
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
    btn.addEventListener('click', () => {
      const prodId = btn.getAttribute('data-id');
      const product = catalogProducts.find(p => p.id === prodId);
      const selections = activeCardSelections[prodId];

      if (!product || !selections) return;

      const isValid = product.type === 'set'
        ? (selections.top && selections.bottom)
        : Boolean(selections.size);

      if (isValid) {
        addToCart(product, selections);
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

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const category = tab.getAttribute('data-category');

      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const catalogGrid = document.getElementById('catalogProductsGrid');
      if (!catalogGrid) return;

      if (category === 'all') {
        renderProducts(catalogProducts, catalogGrid);
      } else {
        const filtered = catalogProducts.filter(p => p.subCategory === category);
        renderProducts(filtered, catalogGrid);
      }
    });
  });
}
