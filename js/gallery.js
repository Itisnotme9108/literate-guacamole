/**
 * Cozy Yarn - Product Gallery Filtering & Dynamic JSON Loader (Vanilla JS)
 * Handles client-side filtering (All, Physical, Digital, Subcategories),
 * accessibility keyboard controls, dynamic rendering, and product modal details.
 */

// Fallback embedded dataset in case user opens index.html directly via file:// protocol without a web server
const FALLBACK_PRODUCTS = [
  {
    "id": "prod-001",
    "name": "Berry Bear Plushie",
    "price": 38.00,
    "category": "plushies",
    "subCategory": "Plushies",
    "type": "physical",
    "image": "assets/images/berry-bear.svg",
    "description": "Handcrafted with velvety chenille yarn in a soft dusty rose hue. Features embroidered eyes for safety and a squishy strawberry backpack.",
    "tags": ["Best Seller", "Handmade"]
  },
  {
    "id": "prod-002",
    "name": "Sage Meadow Cardigan Pattern",
    "price": 8.50,
    "category": "patterns",
    "subCategory": "Sweaters",
    "type": "digital",
    "image": "assets/images/sage-cardigan-pattern.svg",
    "description": "Instant download PDF crochet pattern. Includes step-by-step photo tutorial, size instructions XS to 3XL, and stitch gauge checklist.",
    "tags": ["Digital PDF", "Intermediate"]
  },
  {
    "id": "prod-003",
    "name": "Cozy Daisy Granny Square Blanket",
    "price": 125.00,
    "category": "home",
    "subCategory": "Blankets",
    "type": "physical",
    "image": "assets/images/daisy-blanket.svg",
    "description": "Warm lap blanket composed of 48 individual daisy granny squares stitched together with organic cream cotton yarn.",
    "tags": ["One of a Kind", "Home Decor"]
  },
  {
    "id": "prod-004",
    "name": "Buttercup Bunny Amigurumi",
    "price": 34.00,
    "category": "plushies",
    "subCategory": "Plushies",
    "type": "physical",
    "image": "assets/images/buttercup-bunny.svg",
    "description": "Adorable floppy-eared bunny stuffed with eco-friendly hypoallergenic polyfill. Dressed in a tiny removable buttercup yellow overalls.",
    "tags": ["Plushie", "Soft Toy"]
  },
  {
    "id": "prod-005",
    "name": "Chunky Mushroom Tote Bag Pattern",
    "price": 6.00,
    "category": "patterns",
    "subCategory": "Accessories",
    "type": "digital",
    "image": "assets/images/mushroom-tote-pattern.svg",
    "description": "Beginner-friendly PDF pattern for a sturdy, textured mushroom motif market tote bag. Uses heavy aran weight yarn.",
    "tags": ["Digital PDF", "Beginner Friendly"]
  },
  {
    "id": "prod-006",
    "name": "Terracotta Sunset Bucket Hat",
    "price": 28.00,
    "category": "accessories",
    "subCategory": "Accessories",
    "type": "physical",
    "image": "assets/images/terracotta-hat.svg",
    "description": "Breathable 100% cotton yarn bucket hat in warm terracotta and cream stripes. Flexible brim keeps sunny rays at bay.",
    "tags": ["Wearable", "Summer Favorite"]
  },
  {
    "id": "prod-007",
    "name": "Mini Bobble Tea Keychain Plushie",
    "price": 16.00,
    "category": "plushies",
    "subCategory": "Accessories",
    "type": "physical",
    "image": "assets/images/boba-keychain.svg",
    "description": "Pocket-sized boba milk tea plushie with a gold swivel lobster clasp. Features tiny felt pearls and a cute stitched smile.",
    "tags": ["Stocking Stuffer", "Cute"]
  },
  {
    "id": "prod-008",
    "name": "Honeybee Beanie Pattern",
    "price": 5.50,
    "category": "patterns",
    "subCategory": "Accessories",
    "type": "digital",
    "image": "assets/images/honeybee-beanie-pattern.svg",
    "description": "Digital PDF crochet pattern for a textured waffle-stitch beanie with a cute puff-stitch bee motif around the brim.",
    "tags": ["Digital PDF", "Easy"]
  }
];

let allProducts = [];
let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', () => {
  const gridContainer = document.getElementById('productsGrid');
  if (!gridContainer) return; // Not on gallery page/section

  fetchProducts();
  initFilterButtons();
  initModalListeners();
});

/**
 * Async fetch products from JSON data with fallback safety
 */
async function fetchProducts() {
  const gridContainer = document.getElementById('productsGrid');
  
  try {
    const response = await fetch('data/products.json');
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    allProducts = await response.json();
  } catch (error) {
    console.warn('Using local dataset fallback (file protocol or fetch restriction):', error);
    allProducts = FALLBACK_PRODUCTS;
  }

  updateFilterBadges();
  renderGallery(allProducts);
}

/**
 * Initialize Pill Filter Buttons & ARIA Accessibility
 */
function initFilterButtons() {
  const filterBtns = document.querySelectorAll('.filter-btn');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const selectedFilter = btn.getAttribute('data-filter');
      if (selectedFilter === currentFilter) return;

      // Update active classes and aria-pressed attributes
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });

      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      currentFilter = selectedFilter;
      filterGallery(currentFilter);
    });

    // Keyboard Arrow key navigation between filter pills
    btn.addEventListener('keydown', (e) => {
      const btnArray = Array.from(filterBtns);
      const index = btnArray.indexOf(btn);

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        const nextBtn = btnArray[(index + 1) % btnArray.length];
        nextBtn.focus();
        nextBtn.click();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const prevBtn = btnArray[(index - 1 + btnArray.length) % btnArray.length];
        prevBtn.focus();
        prevBtn.click();
      }
    });
  });
}

/**
 * Filter items client-side with smooth transition
 */
function filterGallery(filter) {
  const gridContainer = document.getElementById('productsGrid');
  gridContainer.style.opacity = '0.3';
  gridContainer.style.transition = 'opacity 0.2s ease';

  setTimeout(() => {
    let filtered = [];
    if (filter === 'all') {
      filtered = allProducts;
    } else if (filter === 'physical' || filter === 'digital') {
      filtered = allProducts.filter(item => item.type === filter);
    } else {
      // Sub-category filters (Plushies, Sweaters, Accessories, Blankets)
      filtered = allProducts.filter(item => 
        item.subCategory.toLowerCase() === filter.toLowerCase() ||
        item.category.toLowerCase() === filter.toLowerCase()
      );
    }

    renderGallery(filtered);
    gridContainer.style.opacity = '1';
  }, 180);
}

/**
 * Render Product Grid & Empty State
 */
function renderGallery(items) {
  const gridContainer = document.getElementById('productsGrid');
  gridContainer.innerHTML = '';

  if (!items || items.length === 0) {
    gridContainer.innerHTML = `
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <h3>No Crochet Items Found</h3>
        <p>We couldn't find any items matching your selected filter. Check back soon for new handmade additions!</p>
        <button class="btn btn-secondary btn-sm" onclick="resetGalleryFilter()">View All Items</button>
      </div>
    `;
    return;
  }

  items.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.setAttribute('aria-label', product.name);

    const typeBadgeLabel = product.type === 'physical' ? 'Physical Item' : 'Digital PDF';
    
    card.innerHTML = `
      <div class="card-image-wrapper">
        <span class="type-badge ${product.type}">${typeBadgeLabel}</span>
        ${createResponsivePictureHTML(product.image, `${product.name} - Handmade Crochet`, { sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw', width: 960, height: 960, loading: 'lazy' })}
      </div>
      <div class="card-body">
        <h3 class="card-title">${escapeHTML(product.name)}</h3>
        <p class="card-description">${escapeHTML(product.description)}</p>
        <div class="card-footer">
          <span class="card-price">$${product.price.toFixed(2)}</span>
          <button class="btn btn-secondary btn-sm quick-view-btn" data-id="${product.id}" aria-label="View details for ${escapeHTML(product.name)}">
            View Details ✦
          </button>
        </div>
      </div>
    `;

    gridContainer.appendChild(card);
  });

  // Attach modal trigger listeners
  document.querySelectorAll('.quick-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prodId = btn.getAttribute('data-id');
      const item = allProducts.find(p => p.id === prodId);
      if (item) openQuickViewModal(item);
    });
  });
}

/**
 * Update filter count badges
 */
function updateFilterBadges() {
  const counts = {
    all: allProducts.length,
    physical: allProducts.filter(p => p.type === 'physical').length,
    digital: allProducts.filter(p => p.type === 'digital').length,
    plushies: allProducts.filter(p => p.subCategory === 'Plushies').length
  };

  document.querySelectorAll('.filter-btn').forEach(btn => {
    const filter = btn.getAttribute('data-filter');
    const badge = btn.querySelector('.filter-badge');
    if (badge && counts[filter] !== undefined) {
      badge.textContent = counts[filter];
    }
  });
}

function resetGalleryFilter() {
  const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
  if (allBtn) allBtn.click();
}

/**
 * Quick View Product Detail Modal
 */
function openQuickViewModal(product) {
  const backdrop = document.getElementById('modalBackdrop');
  const modalContent = document.getElementById('modalContent');
  if (!backdrop || !modalContent) return;

  const isDigital = product.type === 'digital';
  const ctaText = isDigital ? 'Download PDF / Custom Request' : 'Order Custom Commission';
  const commissionUrl = `pages/commission.html?item=${encodeURIComponent(product.name)}&type=${product.type}`;

  modalContent.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1.1fr; gap: 1.5rem; align-items: center;">
      <div style="background-color: var(--bg-alt); border-radius: var(--radius-md); overflow: hidden;">
        ${createResponsivePictureHTML(product.image, product.name, { sizes: '(max-width: 768px) 90vw, 450px', style: 'width: 100%; aspect-ratio: 1/1; object-fit: cover;', width: 960, height: 960 })}
      </div>
      <div>
        <span class="type-badge ${product.type}" style="position: static; display: inline-block; margin-bottom: 0.5rem;">
          ${isDigital ? 'Digital PDF Pattern' : 'Handmade Physical Item'}
        </span>
        <h3 style="font-size: 1.6rem; margin-bottom: 0.5rem;">${escapeHTML(product.name)}</h3>
        <p style="font-family: var(--font-heading); font-size: 1.4rem; color: var(--pastel-terracotta-dark); font-weight: 700; margin-bottom: 1rem;">
          $${product.price.toFixed(2)}
        </p>
        <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 1.5rem; line-height: 1.6;">
          ${escapeHTML(product.description)}
        </p>
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <a href="${commissionUrl}" class="btn btn-primary btn-sm">
            ${ctaText}
          </a>
          <a href="mailto:hello@cozyyarncrochet.com?subject=Inquiry regarding ${encodeURIComponent(product.name)}" class="btn btn-secondary btn-sm">
            Email Inquiry
          </a>
        </div>
      </div>
    </div>
  `;

  backdrop.classList.add('active');
  backdrop.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function initModalListeners() {
  const backdrop = document.getElementById('modalBackdrop');
  const closeBtn = document.getElementById('modalCloseBtn');

  if (!backdrop) return;

  const closeModal = () => {
    backdrop.classList.remove('active');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('active')) {
      closeModal();
    }
  });
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
