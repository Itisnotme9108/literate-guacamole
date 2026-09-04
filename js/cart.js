/**
 * Editorial Resort & Swimwear - Cart Drawer Module (Vanilla JS)
 * State Management, localStorage persistence, Slide-Out Drawer DOM updates,
 * Independent Top & Bottom size line-item labeling, Checkout CTA attributes.
 */

const STORAGE_KEY = 'crochet_swim_cart_v1';
let cartState = [];

document.addEventListener('DOMContentLoaded', () => {
  loadCartState();
  initCartDrawerUI();
  renderCartDrawer();
});

/**
 * Load persisted cart state from localStorage
 */
function loadCartState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      cartState = JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Unable to parse cart from localStorage:', e);
    cartState = [];
  }
}

/**
 * Save current cart state to localStorage
 */
function saveCartState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartState));
  } catch (e) {
    console.error('Failed saving cart state:', e);
  }
}

/**
 * Add product to cart with chosen top/bottom sizes
 */
function addToCart(product, selections) {
  const topSize = selections.top || selections.size || 'N/A';
  const bottomSize = selections.bottom || 'N/A';
  const isSet = product.type === 'set' || product.category === 'Bikini Set';
  
  const itemKey = `${product.id}_T-${topSize}_B-${bottomSize}`;
  const existingIndex = cartState.findIndex(item => item.key === itemKey);

  if (existingIndex > -1) {
    cartState[existingIndex].quantity += 1;
  } else {
    cartState.push({
      key: itemKey,
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      isSet: isSet,
      topSize: selections.top || null,
      bottomSize: selections.bottom || null,
      singleSize: selections.size || null,
      quantity: 1
    });
  }

  saveCartState();
  renderCartDrawer();
  openCartDrawer();
}

/**
 * Update line item quantity
 */
function updateItemQuantity(itemKey, delta) {
  const item = cartState.find(i => i.key === itemKey);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeFromCart(itemKey);
    return;
  }

  saveCartState();
  renderCartDrawer();
}

/**
 * Remove line item from cart
 */
function removeFromCart(itemKey) {
  cartState = cartState.filter(i => i.key !== itemKey);
  saveCartState();
  renderCartDrawer();
}

/**
 * Render Cart Drawer DOM & Line Items
 */
function renderCartDrawer() {
  const container = document.getElementById('cartDrawerItems');
  const subtotalEl = document.getElementById('cartSubtotalAmount');
  const badgeEl = document.getElementById('cartHeaderBadge');
  const checkoutBtn = document.getElementById('checkoutCtaBtn');

  const totalItemCount = cartState.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartState.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (badgeEl) {
    badgeEl.textContent = totalItemCount;
  }

  if (subtotalEl) {
    subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  }

  if (!container) return;

  if (cartState.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <p style="font-family: var(--font-serif); font-size: 1.4rem; margin-bottom: 0.5rem; color: var(--text-main);">Your Bag is Empty</p>
        <p style="font-size: 0.9rem; margin-bottom: 1.5rem;">Discover our handcrafted swimwear and resort collections.</p>
        <button class="btn btn-outline btn-sm" onclick="closeCartDrawer()">Explore Catalog</button>
      </div>
    `;
    if (checkoutBtn) checkoutBtn.classList.add('disabled');
    return;
  }

  if (checkoutBtn) checkoutBtn.classList.remove('disabled');

  const skuList = cartState.map(i => `${i.id}_T:${i.topSize||'NA'}_B:${i.bottomSize||'NA'}:${i.quantity}`).join(',');
  if (checkoutBtn) {
    checkoutBtn.setAttribute('data-checkout-skus', skuList);
    checkoutBtn.setAttribute('data-checkout-provider', 'stripe-payment-link');
  }

  container.innerHTML = cartState.map(item => {
    let sizesLabel = '';
    if (item.isSet) {
      sizesLabel = `Top: <strong>${item.topSize}</strong> &nbsp;|&nbsp; Bottom: <strong>${item.bottomSize}</strong>`;
    } else {
      sizesLabel = `Size: <strong>${item.singleSize || 'Standard'}</strong>`;
    }

    return `
      <div class="cart-item">
        ${createResponsivePictureHTML(item.image, item.name, { pictureClass: 'cart-item-img', imgClass: 'cart-item-img', sizes: '120px', width: 480, height: 480, loading: 'lazy' })}
        <div class="cart-item-info">
          <h4>${escapeHTML(item.name)}</h4>
          <div class="cart-item-sizes">${sizesLabel}</div>
          <div class="cart-item-price">$${item.price.toFixed(2)}</div>
        </div>
        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
          <div class="cart-item-quantity">
            <button class="qty-btn" onclick="updateItemQuantity('${item.key}', -1)" aria-label="Decrease quantity">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="updateItemQuantity('${item.key}', 1)" aria-label="Increase quantity">+</button>
          </div>
          <button class="cart-item-remove" onclick="removeFromCart('${item.key}')">Remove</button>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Initialize Cart Drawer UI Handlers & Keyboard Trap
 */
function initCartDrawerUI() {
  const triggerBtn = document.getElementById('cartTriggerBtn');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  const closeBtn = document.getElementById('cartDrawerCloseBtn');

  if (triggerBtn) {
    triggerBtn.addEventListener('click', openCartDrawer);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeCartDrawer);
  }

  if (backdrop) {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeCartDrawer();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop && backdrop.classList.contains('is-open')) {
      closeCartDrawer();
    }
  });

  const checkoutBtn = document.getElementById('checkoutCtaBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (cartState.length === 0) return;

      const provider = checkoutBtn.getAttribute('data-checkout-provider');
      const skus = checkoutBtn.getAttribute('data-checkout-skus');
      
      alert(`[Checkout Demo Hook]\nProvider: ${provider}\nSelected Line Item SKUs: ${skus}\n\nSee README.md for drop-in Stripe / Snipcart integration instructions!`);
    });
  }
}

function openCartDrawer() {
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (backdrop) {
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
}

function closeCartDrawer() {
  const backdrop = document.getElementById('cartDrawerBackdrop');
  if (backdrop) {
    backdrop.classList.remove('is-open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}
