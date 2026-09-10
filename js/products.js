/**
 * Editorial Resort & Intimates - Product Catalog & Independent Sizing Module (Vanilla JS)
 * Handles JSON fetching, upgraded catalog card rendering with soft crossfade, desktop hover Quick Add,
 * inline size selection, wishlist persistence, and PDP navigation.
 */

const LOCAL_PRODUCTS_FALLBACK = [
  {
    "id": "drs-bur-cro-001",
    "name": "Burgundy Crochet Maxi Dress",
    "price": 240.00,
    "category": "Dresses",
    "subCategory": "dresses",
    "type": "single",
    "collection": ["Crochet Dresses", "Maxi Dresses", "Resort Wear", "New Arrivals"],
    "image": "assets/images/burgundy-crochet-maxi-dress-01-hero-front.webp",
    "secondaryImage": "assets/images/burgundy-crochet-maxi-dress-02-open-back.webp",
    "gallery": [
      { "role": "hero", "src": "assets/images/burgundy-crochet-maxi-dress-01-hero-front.webp", "alt": "Burgundy crochet maxi dress front view" },
      { "role": "feature", "src": "assets/images/burgundy-crochet-maxi-dress-02-open-back.webp", "alt": "Burgundy crochet maxi dress with open back" }
    ],
    "descriptor": "Handcrafted crochet maxi dress with an open back and flowing full-length silhouette.",
    "description": "The Burgundy Crochet Maxi Dress is a statement piece crafted for effortless, resort-inspired dressing.",
    "color": "Burgundy",
    "sku": "DRS-BUR-CRO-001",
    "variants": { "size": ["XS", "S", "M", "L", "XL"] },
    "inStock": true,
    "featured": true,
    "rating": 5.0,
    "reviewsCount": 18
  },
  {
    "id": "bik-sol-ter-002",
    "name": "Solis Terracotta Crochet Bikini Set",
    "price": 185.00,
    "category": "Bikini Sets",
    "subCategory": "bikini-sets",
    "type": "set",
    "collection": ["Bikini Sets", "Amalfi Coast '26", "New Arrivals"],
    "image": "assets/images/solis-set.svg",
    "secondaryImage": "assets/images/sienna-set.svg",
    "gallery": [
      { "role": "hero", "src": "assets/images/solis-set.svg", "alt": "Solis Terracotta Crochet Bikini Set front view" },
      { "role": "feature", "src": "assets/images/sienna-set.svg", "alt": "Solis Terracotta Crochet Bikini Set side view" }
    ],
    "descriptor": "Hand-crocheted 2-piece swim set with independent top and bottom sizing.",
    "color": "Terracotta",
    "sku": "BIK-SOL-TER-002",
    "variants": { "top": ["XS", "S", "M", "L"], "bottom": ["XS", "S", "M", "L"] },
    "inStock": true,
    "featured": true,
    "rating": 4.9,
    "reviewsCount": 24
  },
  {
    "id": "bik-pal-san-003",
    "name": "Paloma Sand Crochet Bikini Set",
    "price": 195.00,
    "category": "Bikini Sets",
    "subCategory": "bikini-sets",
    "type": "set",
    "collection": ["Bikini Sets", "Sienna Sunset Capsule"],
    "image": "assets/images/paloma-set.svg",
    "secondaryImage": "assets/images/solis-set.svg",
    "gallery": [
      { "role": "hero", "src": "assets/images/paloma-set.svg", "alt": "Paloma Sand Crochet Bikini Set hero view" }
    ],
    "descriptor": "Natural sand-toned crocheted bikini with halter tie neck and adjustable waist band.",
    "color": "Sand Cream",
    "sku": "BIK-PAL-SAN-003",
    "variants": { "top": ["XS", "S", "M", "L"], "bottom": ["XS", "S", "M", "L"] },
    "inStock": true,
    "featured": true,
    "rating": 5.0,
    "reviewsCount": 16
  },
  {
    "id": "top-ama-cre-004",
    "name": "Amalfi Cream Bralette Swim Top",
    "price": 110.00,
    "category": "Swim Tops",
    "subCategory": "swim-tops",
    "type": "single",
    "collection": ["Swim Tops", "Amalfi Coast '26"],
    "image": "assets/images/amalfi-top.svg",
    "secondaryImage": "assets/images/capri-top.svg",
    "gallery": [
      { "role": "hero", "src": "assets/images/amalfi-top.svg", "alt": "Amalfi Cream Bralette Swim Top front" }
    ],
    "descriptor": "Crocheted bralette swim top with thick supportive shoulder straps.",
    "color": "Cream",
    "sku": "TOP-AMA-CRE-004",
    "variants": { "size": ["XS", "S", "M", "L"] },
    "inStock": true,
    "featured": false,
    "rating": 4.8,
    "reviewsCount": 11
  },
  {
    "id": "top-cap-oli-005",
    "name": "Capri Olive Triangle Swim Top",
    "price": 98.00,
    "category": "Swim Tops",
    "subCategory": "swim-tops",
    "type": "single",
    "collection": ["Swim Tops", "Sienna Sunset Capsule"],
    "image": "assets/images/capri-top.svg",
    "secondaryImage": "assets/images/olive-bralette.svg",
    "gallery": [
      { "role": "hero", "src": "assets/images/capri-top.svg", "alt": "Capri Olive Triangle Swim Top" }
    ],
    "descriptor": "Classic triangle top in soft muted olive green with scalloped crochet borders.",
    "color": "Muted Olive",
    "sku": "TOP-CAP-OLI-005",
    "variants": { "size": ["XS", "S", "M", "L"] },
    "inStock": true,
    "featured": true,
    "rating": 4.9,
    "reviewsCount": 14
  },
  {
    "id": "bot-dun-ter-006",
    "name": "Dune Terracotta Cheeky Bottom",
    "price": 85.00,
    "category": "Swim Bottoms",
    "subCategory": "swim-bottoms",
    "type": "single",
    "collection": ["Swim Bottoms", "Amalfi Coast '26"],
    "image": "assets/images/dune-bottom.svg",
    "secondaryImage": "assets/images/bone-shorts.svg",
    "gallery": [
      { "role": "hero", "src": "assets/images/dune-bottom.svg", "alt": "Dune Terracotta Cheeky Bottom front" }
    ],
    "descriptor": "Medium-coverage crocheted swim bottom with seamless stretch lining.",
    "color": "Terracotta",
    "sku": "BOT-DUN-TER-006",
    "variants": { "size": ["XS", "S", "M", "L"] },
    "inStock": true,
    "featured": false,
    "rating": 4.7,
    "reviewsCount": 9
  },
  {
    "id": "bot-bon-cre-007",
    "name": "Bone Crochet High-Waist Bottom",
    "price": 92.00,
    "category": "Swim Bottoms",
    "subCategory": "swim-bottoms",
    "type": "single",
    "collection": ["Swim Bottoms", "Sienna Sunset Capsule"],
    "image": "assets/images/bone-shorts.svg",
    "secondaryImage": "assets/images/dune-bottom.svg",
    "gallery": [
      { "role": "hero", "src": "assets/images/bone-shorts.svg", "alt": "Bone Crochet High-Waist Bottom" }
    ],
    "descriptor": "Retro high-waisted swimsuit bottom with flattering tummy coverage.",
    "color": "Bone Cream",
    "sku": "BOT-BON-CRE-007",
    "variants": { "size": ["XS", "S", "M", "L", "XL"] },
    "inStock": true,
    "featured": true,
    "rating": 5.0,
    "reviewsCount": 21
  },
  {
    "id": "int-cott-res-008",
    "name": "Cottagecore Sheer Resort Intimate Set",
    "price": 165.00,
    "category": "Resort Intimates",
    "subCategory": "resort-intimates",
    "type": "set",
    "collection": ["Resort Intimates", "New Arrivals"],
    "image": "assets/images/cottagecore-bow.svg",
    "secondaryImage": "assets/images/heirloom-bow.svg",
    "gallery": [
      { "role": "hero", "src": "assets/images/cottagecore-bow.svg", "alt": "Cottagecore Sheer Resort Intimate Set" }
    ],
    "descriptor": "Delicate 2-piece lounge intimate set with subtle bow trim and soft sheer texture.",
    "color": "Soft Ivory",
    "sku": "INT-COTT-RES-008",
    "variants": { "top": ["XS", "S", "M", "L"], "bottom": ["XS", "S", "M", "L"] },
    "inStock": true,
    "featured": true,
    "rating": 4.9,
    "reviewsCount": 12
  }
];

let catalogProducts = [];
const activeCardSelections = {};

document.addEventListener('DOMContentLoaded', () => {
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

/**
 * Fetch product data with fallback and path normalization
 */
async function fetchCatalog() {
  try {
    if (window.location.protocol === 'file:') {
      catalogProducts = LOCAL_PRODUCTS_FALLBACK;
    } else {
      const res = await fetch('/data/products.json?v=' + Date.now())
        .catch(() => fetch('data/products.json?v=' + Date.now()))
        .catch(() => fetch('../data/products.json?v=' + Date.now()))
        .catch(() => fetch('../../data/products.json?v=' + Date.now()))
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

  const isFileProtocol = window.location.protocol === 'file:';
  catalogProducts = catalogProducts.map(p => {
    const normalizePath = (src) => {
      if (!src) return src;
      if (src.startsWith('http') || src.startsWith('data:')) return src;
      if (isFileProtocol) return src.replace(/^\/+/, '');
      let clean = src;
      if (clean.startsWith('../')) clean = clean.replace(/^(\.\.\/)+/, '');
      if (!clean.startsWith('/')) clean = '/' + clean;
      return clean;
    };
    return {
      ...p,
      image: normalizePath(p.image),
      secondaryImage: normalizePath(p.secondaryImage),
      gallery: p.gallery ? p.gallery.map(g => ({ ...g, src: normalizePath(g.src) })) : undefined
    };
  });

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
    const filterAttr = catalogGrid.getAttribute('data-filter');
    if (filterAttr && filterAttr !== 'all') {
      const filtered = catalogProducts.filter(p => 
        p.subCategory === filterAttr || 
        (p.category && p.category.toLowerCase().replace(/\s+/g, '-') === filterAttr) ||
        (Array.isArray(p.collection) && p.collection.some(c => c.toLowerCase().replace(/\s+/g, '-') === filterAttr))
      );
      renderProducts(filtered, catalogGrid);
    } else {
      renderProducts(catalogProducts, catalogGrid);
    }
  }
}

const COLOR_HEX_MAP = {
  'burgundy': '#6B1D2F',
  'terracotta': '#C86D51',
  'sand cream': '#E8DFD1',
  'sand': '#E8DFD1',
  'cream': '#F5F0EB',
  'muted olive': '#656D4A',
  'olive': '#656D4A',
  'bone cream': '#EFECE6',
  'bone': '#EFECE6',
  'soft ivory': '#F8F6F0',
  'ivory': '#F8F6F0',
  'black': '#1A1615',
  'espresso': '#2B2320'
};

function createProductCardElement(product) {
  const card = document.createElement('article');
  card.className = 'product-card';
  card.id = `card-${product.id}`;
  card.setAttribute('data-id', product.id);

  const isSoldOut = product.inStock === false || product.stock === "Sold Out";
  if (isSoldOut) {
    card.classList.add('sold-out');
  }

  const isFav = typeof isFavorite === 'function' ? isFavorite(product.id) : (typeof favoritesList !== 'undefined' && favoritesList.includes(product.id));

  // 1. Badge Top-Left (Max 1)
  let badgeHTML = '';
  if (isSoldOut) {
    badgeHTML = `<span class="product-card-badge sold-out-badge">SOLD OUT</span>`;
  } else if (product.badge) {
    badgeHTML = `<span class="product-card-badge">${escapeHTML(product.badge)}</span>`;
  } else if (product.featured || (Array.isArray(product.collection) && product.collection.includes("New Arrivals"))) {
    badgeHTML = `<span class="product-card-badge">NEW</span>`;
  } else if (typeof product.inventoryCount === 'number' && product.inventoryCount <= 5) {
    badgeHTML = `<span class="product-card-badge">LOW STOCK</span>`;
  } else if (product.madeToOrder === true || (product.shipping && String(product.shipping).toLowerCase().includes("made to order"))) {
    badgeHTML = `<span class="product-card-badge">MADE TO ORDER</span>`;
  }

  // 2. Images (4:5 Aspect ratio)
  const colors = Array.isArray(product.colors) ? product.colors : (product.color ? [product.color] : []);
  const primaryColor = colors[0] || product.color || '';
  const imgAccessibleName = `${product.name}${primaryColor ? ' — ' + primaryColor : ''}`;

  const gallery = typeof getProductGallery === 'function' ? getProductGallery(product) : [];
  const primaryImgSrc = (gallery[0] && gallery[0].src) || product.image;
  const secondaryImgSrc = (gallery[1] && gallery[1].src) || product.secondaryImage || primaryImgSrc;

  const picOptionsHero = {
    pictureClass: 'card-primary-img',
    imgClass: 'card-primary-img',
    sizes: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
    width: 960,
    height: 1200,
    loading: 'lazy'
  };

  const picOptionsSec = {
    pictureClass: 'card-secondary-img',
    imgClass: 'card-secondary-img',
    sizes: '(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw',
    width: 960,
    height: 1200,
    loading: 'lazy'
  };

  const primaryPicHTML = typeof createResponsivePictureHTML === 'function'
    ? createResponsivePictureHTML(primaryImgSrc, imgAccessibleName, picOptionsHero)
    : `<img src="${primaryImgSrc}" alt="${escapeHTML(imgAccessibleName)}" class="card-primary-img" loading="lazy">`;

  const secondaryPicHTML = (secondaryImgSrc && secondaryImgSrc !== primaryImgSrc)
    ? (typeof createResponsivePictureHTML === 'function'
        ? createResponsivePictureHTML(secondaryImgSrc, `${imgAccessibleName} Alternate`, picOptionsSec)
        : `<img src="${secondaryImgSrc}" alt="${escapeHTML(imgAccessibleName)} Alternate" class="card-secondary-img" loading="lazy">`)
    : '';

  // 3. Price HTML & Conditional Stock / Made-to-order text
  let priceHTML = '';
  if (isSoldOut) {
    priceHTML = `<span class="price-val" style="color: var(--text-muted); font-weight: 600;">SOLD OUT</span>`;
  } else if (product.price === null || product.price === undefined || product.price === 'TBD') {
    priceHTML = `<span class="price-val">Price TBD</span>`;
  } else if (product.originalPrice && Number(product.originalPrice) > Number(product.price)) {
    priceHTML = `
      <span class="sale-price">$${Number(product.price).toFixed(2)}</span>
      <span class="original-price" style="text-decoration: line-through;">$${Number(product.originalPrice).toFixed(2)}</span>
    `;
  } else {
    priceHTML = `<span class="price-val">$${Number(product.price).toFixed(2)}</span>`;
  }

  // Real Tracked Low Stock Count (Only if numeric inventory count exists in data)
  let lowStockHTML = '';
  const trackedCount = typeof product.inventoryCount === 'number' ? product.inventoryCount : (typeof product.stockCount === 'number' ? product.stockCount : null);
  if (!isSoldOut && trackedCount !== null && trackedCount > 0 && trackedCount <= 5) {
    lowStockHTML = `<p class="low-stock-text">Only ${trackedCount} left</p>`;
  }

  // Real Made-to-order Lead Time (Only if data exists)
  let madeToOrderHTML = '';
  if (product.madeToOrder === true || product.leadTime) {
    madeToOrderHTML = `<p class="made-to-order-text">Made to order • ${escapeHTML(product.leadTime || 'Handcrafted lead time applies')}</p>`;
  }

  // 4. Color Swatches / Sold-Out Email Form
  let swatchesOrNotifyHTML = '';

  if (isSoldOut) {
    swatchesOrNotifyHTML = `
      <div class="notify-me-box">
        <button class="notify-me-btn" aria-label="Notify me when ${escapeHTML(product.name)} is back in stock">NOTIFY ME</button>
        <form class="notify-email-form" style="display: none;">
          <input type="email" class="notify-email-input" placeholder="Enter email" required aria-label="Email for restock notification">
          <button type="submit" class="btn btn-solid btn-sm" style="font-size: 0.7rem; padding: 0.35rem 0.6rem;">Submit</button>
        </form>
      </div>
    `;
  } else if (colors.length > 0) {
    const maxShown = 3;
    const visibleColors = colors.slice(0, maxShown);
    const extraCount = colors.length - maxShown;

    const circlesHTML = visibleColors.map((colName, idx) => {
      const slug = String(colName).toLowerCase().trim();
      const hex = COLOR_HEX_MAP[slug] || '#D4A373';
      const isSelected = idx === 0 ? 'active' : '';
      return `<button class="swatch-circle ${isSelected}" data-color="${escapeHTML(colName)}" data-prod="${product.id}" title="${escapeHTML(colName)}" style="background-color: ${hex};" aria-label="Color ${escapeHTML(colName)}"></button>`;
    }).join('');

    const moreHTML = extraCount > 0 ? `<span class="swatch-more">+${extraCount}</span>` : '';

    swatchesOrNotifyHTML = `
      <div class="card-swatches-row" aria-label="Color options">
        ${circlesHTML}
        ${moreHTML}
      </div>
    `;
  }

  // 5. Short Descriptor
  const descriptorText = product.descriptor ? `<p class="card-descriptor">${escapeHTML(product.descriptor)}</p>` : '';

  const pdpUrl = `/product?id=${product.id}`;

  card.innerHTML = `
    <div class="card-image-box" data-pdp="${pdpUrl}">
      <a href="${pdpUrl}" class="card-image-link" aria-label="${escapeHTML(imgAccessibleName)}">
        ${primaryPicHTML}
        ${secondaryPicHTML}
      </a>
      ${badgeHTML}
      <button class="favorite-btn ${isFav ? 'active' : ''}" data-id="${product.id}" aria-label="${isFav ? 'Remove ' + escapeHTML(product.name) + ' from wishlist' : 'Add ' + escapeHTML(product.name) + ' to wishlist'}">
        ${isFav ? '♥' : '♡'}
      </button>

      ${!isSoldOut ? `
        <div class="card-quick-add-affordance">
          <button class="btn-quick-add-trigger" data-id="${product.id}" aria-label="Quick add ${escapeHTML(product.name)}">QUICK ADD +</button>
        </div>
      ` : ''}
    </div>

    <div class="card-content">
      <h3 class="card-title">
        <a href="${pdpUrl}">${escapeHTML(product.name)}</a>
      </h3>

      ${descriptorText}
      ${lowStockHTML}
      ${madeToOrderHTML}

      <div class="card-price-row">
        ${priceHTML}
      </div>

      ${swatchesOrNotifyHTML}
    </div>
  `;

  // Attach sold out notify-me form handlers
  const notifyBtn = card.querySelector('.notify-me-btn');
  const notifyForm = card.querySelector('.notify-email-form');
  if (notifyBtn && notifyForm) {
    notifyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      notifyBtn.style.display = 'none';
      notifyForm.style.display = 'flex';
    });
    notifyForm.addEventListener('submit', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (typeof showToast === 'function') {
        showToast('You will be notified when back in stock ✦');
      }
      notifyForm.innerHTML = '<span style="font-size: 0.75rem; color: var(--accent-olive); font-weight: 600;">✓ Subscribed for restock</span>';
    });
  }

  // Attach favorite event listener
  const favBtn = card.querySelector('.favorite-btn');
  if (favBtn) {
    favBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (typeof toggleFavorite === 'function') {
        toggleFavorite(product.id);
      }
    });
  }

  // Attach PDP navigation on card image box tap
  const imgBox = card.querySelector('.card-image-box');
  if (imgBox) {
    imgBox.addEventListener('click', (e) => {
      if (e.target.closest('.favorite-btn') || e.target.closest('.btn-quick-add-trigger')) return;
      window.location.href = pdpUrl;
    });
  }

  // Attach Quick Add trigger listener
  const quickAddBtn = card.querySelector('.btn-quick-add-trigger');
  if (quickAddBtn) {
    quickAddBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      openQuickAddPopover(product, card);
    });
  }

  // Attach swatch circle image swap listener
  card.querySelectorAll('.swatch-circle').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      card.querySelectorAll('.swatch-circle').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const col = btn.getAttribute('data-color');
      if (product.colorImageMap && product.colorImageMap[col]) {
        const newImgSrc = product.colorImageMap[col];
        const primImg = card.querySelector('.card-primary-img');
        if (primImg) primImg.src = newImgSrc;
      }
    });
  });

  return card;
}

function openQuickAddPopover(product, cardElement) {
  document.querySelectorAll('.quick-add-popover').forEach(p => p.remove());

  const imgBox = cardElement.querySelector('.card-image-box');
  if (!imgBox) return;

  const isSet = product.type === 'set' || product.category === 'Bikini Set' || product.category === 'Bikini Sets';
  const popover = document.createElement('div');
  popover.className = 'quick-add-popover';
  popover.id = `popover-${product.id}`;

  const selections = { top: null, bottom: null, size: null };

  if (isSet) {
    const topSizes = (product.variants && product.variants.top) || ['XS', 'S', 'M', 'L'];
    const bottomSizes = (product.variants && product.variants.bottom) || ['XS', 'S', 'M', 'L'];

    popover.innerHTML = `
      <div class="popover-header">
        <span>Select Dual Fit</span>
        <button class="popover-close-btn" aria-label="Close Quick Add">&times;</button>
      </div>
      <div class="popover-group">
        <span class="popover-label">Top Size</span>
        <div class="popover-sizes-row">
          ${topSizes.map(sz => `<button class="swatch-btn popover-swatch" data-group="top" data-size="${sz}">${sz}</button>`).join('')}
        </div>
      </div>
      <div class="popover-group">
        <span class="popover-label">Bottom Size</span>
        <div class="popover-sizes-row">
          ${bottomSizes.map(sz => `<button class="swatch-btn popover-swatch" data-group="bottom" data-size="${sz}">${sz}</button>`).join('')}
        </div>
      </div>
      <button class="btn btn-solid popover-add-btn disabled" disabled style="width: 100%; margin-top: 0.25rem;">
        ADD TO BAG
      </button>
      <div class="popover-status" style="display: none;"></div>
    `;

    const addBtn = popover.querySelector('.popover-add-btn');

    popover.querySelectorAll('.popover-swatch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const group = btn.getAttribute('data-group');
        const size = btn.getAttribute('data-size');
        const row = btn.closest('.popover-sizes-row');
        row.querySelectorAll('.popover-swatch').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selections[group] = size;

        if (selections.top && selections.bottom) {
          addBtn.classList.remove('disabled');
          addBtn.removeAttribute('disabled');
        }
      });
    });

    addBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (!selections.top || !selections.bottom) return;

      if (typeof addToCart === 'function') {
        addToCart(product, selections, { autoOpen: false });
      }

      addBtn.textContent = '✓ ADDED TO BAG';
      addBtn.style.backgroundColor = 'var(--accent-olive)';
      addBtn.style.borderColor = 'var(--accent-olive)';

      setTimeout(() => {
        addBtn.textContent = 'VIEW BAG →';
        addBtn.style.backgroundColor = 'var(--text-main)';
        addBtn.style.borderColor = 'var(--text-main)';
        addBtn.onclick = (ev) => {
          ev.stopPropagation();
          ev.preventDefault();
          popover.remove();
          if (typeof openCartDrawer === 'function') openCartDrawer();
        };
      }, 1500);
    });
  } else {
    const singleSizes = (product.variants && product.variants.size) || ['XS', 'S', 'M', 'L'];

    popover.innerHTML = `
      <div class="popover-header">
        <span>Select Size</span>
        <button class="popover-close-btn" aria-label="Close Quick Add">&times;</button>
      </div>
      <div class="popover-sizes-row">
        ${singleSizes.map(sz => `<button class="swatch-btn popover-swatch" data-group="size" data-size="${sz}">${sz}</button>`).join('')}
      </div>
      <div class="popover-status" style="display: none;"></div>
    `;

    const statusEl = popover.querySelector('.popover-status');

    popover.querySelectorAll('.popover-swatch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        const size = btn.getAttribute('data-size');
        selections.size = size;

        if (typeof addToCart === 'function') {
          addToCart(product, selections, { autoOpen: false });
        }

        popover.querySelectorAll('.popover-swatch').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        if (statusEl) {
          statusEl.style.display = 'block';
          statusEl.innerHTML = `✓ ADDED TO BAG &nbsp;<a href="#" class="view-bag-link" style="color: var(--text-main); font-weight: 700; text-decoration: underline;">VIEW BAG →</a>`;
          const viewLink = statusEl.querySelector('.view-bag-link');
          if (viewLink) {
            viewLink.onclick = (ev) => {
              ev.preventDefault();
              popover.remove();
              if (typeof openCartDrawer === 'function') openCartDrawer();
            };
          }
        }
      });
    });
  }

  const removePopover = () => {
    popover.remove();
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('click', onOutsideClick);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') removePopover();
  };

  const onOutsideClick = (e) => {
    if (!popover.contains(e.target) && !e.target.closest('.btn-quick-add-trigger')) {
      removePopover();
    }
  };

  setTimeout(() => {
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('click', onOutsideClick);
  }, 10);

  const closeBtn = popover.querySelector('.popover-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();
      removePopover();
    });
  }

  imgBox.appendChild(popover);
}

window.createProductCardElement = createProductCardElement;

/**
 * Render Product Grid DOM using Single Shared Product Card Component
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
    const card = createProductCardElement(product);
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
