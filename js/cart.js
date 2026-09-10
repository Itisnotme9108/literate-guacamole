/**
 * Editorial Resort & Swimwear - Cart & Ecommerce Module (Vanilla JS - Phase 2)
 * State Management, localStorage persistence, Drawer & Page UI Synchronization,
 * Independent Top & Bottom size line-item labeling, Checkout Flow & Order Processing.
 */

const STORAGE_KEY = 'crochet_swim_cart_v1';
const FAVORITES_KEY = 'editorial_resort_favorites';

let cartState = [];
let favoritesList = [];

/**
 * Production-ready Checkout Configuration Point
 */
const CHECKOUT_CONFIG = {
  provider: 'stripe-payment-link',
  stripePaymentUrl: '', // Live Stripe Payment Link URL (e.g., 'https://buy.stripe.com/...')
  currency: 'USD',
  sandboxMode: true
};

document.addEventListener('DOMContentLoaded', () => {
  loadCartState();
  loadFavorites();
  initCartDrawerUI();
  renderCartDrawer();
  renderCartPage();
  renderCheckoutSummary();
  initCheckoutForm();
  syncAllBadgesAndUI();
});

/**
 * Load persisted cart state from localStorage with corruption recovery
 */
function loadCartState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        cartState = parsed;
      } else {
        throw new Error('Cart state in localStorage is not an array');
      }
    }
  } catch (e) {
    console.warn('Unable to parse cart from localStorage. Resetting storage:', e);
    cartState = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {}
  }
}

/**
 * Load persisted wishlist state from localStorage
 */
function loadFavorites() {
  try {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) favoritesList = parsed;
    }
  } catch (e) {
    favoritesList = [];
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesList));
  } catch (e) {
    console.error('Failed saving favorites:', e);
  }
  syncAllBadgesAndUI();
}

function isFavorite(productId) {
  return favoritesList.includes(productId);
}

function toggleFavorite(productId) {
  const index = favoritesList.indexOf(productId);
  if (index > -1) {
    favoritesList.splice(index, 1);
  } else {
    favoritesList.push(productId);
  }
  saveFavorites();
  return isFavorite(productId);
}

function syncAllBadgesAndUI() {
  const cartCount = cartState.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('#cartHeaderBadge, .cart-badge').forEach(b => {
    b.textContent = cartCount;
  });

  document.querySelectorAll('#wishlistHeaderBadge, .wishlist-badge').forEach(b => {
    b.textContent = favoritesList.length;
  });

  document.querySelectorAll('.favorite-btn[data-id]').forEach(btn => {
    const id = btn.getAttribute('data-id');
    const active = favoritesList.includes(id);
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-label', active ? 'Remove from Wishlist' : 'Add to Wishlist');
    btn.innerHTML = active ? '♥' : '♡';
  });

  if (typeof renderWishlistDrawer === 'function') {
    renderWishlistDrawer();
  }
}

window.addEventListener('storage', (e) => {
  if (e.key === STORAGE_KEY) {
    loadCartState();
    renderCartDrawer();
    renderCartPage();
    renderCheckoutSummary();
    syncAllBadgesAndUI();
  }
  if (e.key === FAVORITES_KEY) {
    loadFavorites();
    syncAllBadgesAndUI();
  }
});

/**
 * Save current cart state to localStorage and update all subscriber UI views
 */
function saveCartState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartState));
  } catch (e) {
    console.error('Failed saving cart state:', e);
  }
  syncAllBadgesAndUI();
}

/**
 * Add product to cart with chosen top/bottom sizes
 */
function addToCart(product, selections = {}, options = { autoOpen: true }) {
  const isSet = product.type === 'set' || product.category === 'Bikini Set' || product.category === 'Bikini Sets';
  const topSize = selections.top || selections.size || (isSet ? 'S' : null);
  const bottomSize = selections.bottom || (isSet ? 'M' : null);
  const singleSize = selections.size || (!isSet ? 'Standard' : null);
  
  const itemKey = `${product.id}_T-${topSize || 'NA'}_B-${bottomSize || 'NA'}_S-${singleSize || 'NA'}`;
  const existingIndex = cartState.findIndex(item => item.key === itemKey);

  if (existingIndex > -1) {
    cartState[existingIndex].quantity += 1;
  } else {
    cartState.push({
      key: itemKey,
      id: product.id,
      name: product.name,
      price: Number(product.price) || 0,
      image: product.image,
      isSet: isSet,
      topSize: topSize,
      bottomSize: bottomSize,
      singleSize: singleSize,
      quantity: 1
    });
  }

  saveCartState();
  renderCartDrawer();
  renderCartPage();
  renderCheckoutSummary();

  const sizeDetail = isSet ? `(Top: ${topSize}, Bottom: ${bottomSize})` : `(Size: ${singleSize})`;
  showToast(`Added ${product.name} ${sizeDetail} to your bag ✦`);
  if (!options || options.autoOpen !== false) {
    openCartDrawer();
  }
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
  renderCartPage();
  renderCheckoutSummary();
}

/**
 * Remove line item from cart
 */
function removeFromCart(itemKey) {
  cartState = cartState.filter(i => i.key !== itemKey);
  saveCartState();
  renderCartDrawer();
  renderCartPage();
  renderCheckoutSummary();
}

/**
 * Clear all items from cart
 */
function clearCart() {
  cartState = [];
  saveCartState();
  renderCartDrawer();
  renderCartPage();
  renderCheckoutSummary();
}

/**
 * Render Slide-Out Cart Drawer DOM & Line Items
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
        <a href="/shop" class="btn btn-outline btn-sm" onclick="closeCartDrawer()">Explore Catalog</a>
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

    const imgPath = resolveImagePath(item.image);

    return `
      <div class="cart-item">
        <img src="${imgPath}" alt="${escapeHTML(item.name)}" class="cart-item-img" onerror="this.src='/assets/images/optimized/hero-960.jpg'">
        <div class="cart-item-info">
          <h4>${escapeHTML(item.name)}</h4>
          <div class="cart-item-sizes">${sizesLabel}</div>
          <div class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</div>
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
 * Render Dedicated Cart Page DOM (`/cart`)
 */
function renderCartPage() {
  const container = document.getElementById('pageCartView');
  if (!container) return;

  const totalItemCount = cartState.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartState.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const estimatedShipping = subtotal >= 250 || subtotal === 0 ? 0 : 15;
  const estimatedTotal = subtotal + estimatedShipping;

  if (cartState.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 4rem 1rem;">
        <span class="micro-label" style="color: var(--accent-terracotta);">SHOPPING BAG</span>
        <h2 style="font-family: var(--font-serif); font-size: 2rem; margin: 0.75rem 0 0.5rem; color: var(--text-main);">Your Shopping Bag is Empty</h2>
        <p style="font-size: 1.05rem; color: var(--text-muted); margin-bottom: 2rem;">Explore our readymade swimwear catalog and bespoke fitting options.</p>
        <a href="/shop" class="btn btn-solid">Explore Shop Catalog &rarr;</a>
      </div>
    `;
    return;
  }

  const itemsHTML = cartState.map(item => {
    let sizesLabel = '';
    if (item.isSet) {
      sizesLabel = `Top: <strong>${item.topSize}</strong> &nbsp;|&nbsp; Bottom: <strong>${item.bottomSize}</strong>`;
    } else {
      sizesLabel = `Size: <strong>${item.singleSize || 'Standard'}</strong>`;
    }

    const imgPath = resolveImagePath(item.image);

    return `
      <div style="display: flex; gap: 1.5rem; align-items: center; padding: 1.5rem 0; border-bottom: 1px solid var(--border-hairline);">
        <img src="${imgPath}" alt="${escapeHTML(item.name)}" style="width: 90px; height: 120px; object-fit: cover; border-radius: var(--radius-strict); background: var(--bg-sand);" onerror="this.src='/assets/images/optimized/hero-960.jpg'">
        <div style="flex: 1;">
          <h3 style="font-size: 1.15rem; margin-bottom: 0.35rem; font-family: var(--font-heading);">${escapeHTML(item.name)}</h3>
          <div style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 0.5rem;">${sizesLabel}</div>
          <div style="font-size: 1.05rem; font-weight: 600; color: var(--text-main);">$${item.price.toFixed(2)} USD</div>
        </div>
        <div style="display: flex; align-items: center; gap: 1rem;">
          <div class="cart-item-quantity">
            <button class="qty-btn" onclick="updateItemQuantity('${item.key}', -1)" aria-label="Decrease quantity">-</button>
            <span class="qty-val">${item.quantity}</span>
            <button class="qty-btn" onclick="updateItemQuantity('${item.key}', 1)" aria-label="Increase quantity">+</button>
          </div>
          <div style="font-size: 1.1rem; font-weight: 700; width: 90px; text-align: right;">$${(item.price * item.quantity).toFixed(2)}</div>
          <button class="cart-item-remove" onclick="removeFromCart('${item.key}')" style="margin-left: 0.5rem;">Remove</button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 340px; gap: 3rem; align-items: start;">
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 1rem; border-bottom: 2px solid var(--border-color);">
          <h2 style="font-size: 1.25rem; font-family: var(--font-heading); font-weight: 600;">Items (${totalItemCount})</h2>
          <button class="btn btn-outline btn-sm" onclick="clearCart()" style="font-size: 0.78rem;">Clear Bag</button>
        </div>
        ${itemsHTML}
      </div>

      <div style="background: var(--bg-sand); padding: 2rem; border-radius: var(--radius-strict); border: 1px solid var(--border-hairline);">
        <h3 style="font-size: 1.2rem; font-family: var(--font-heading); margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-hairline); padding-bottom: 0.75rem;">Order Summary</h3>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.95rem;">
          <span style="color: var(--text-light);">Subtotal</span>
          <span style="font-weight: 600;">$${subtotal.toFixed(2)} USD</span>
        </div>

        <div style="display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.95rem;">
          <span style="color: var(--text-light);">Estimated Express Shipping</span>
          <span style="font-weight: 600;">${estimatedShipping === 0 ? 'Complimentary' : `$${estimatedShipping.toFixed(2)} USD`}</span>
        </div>

        ${subtotal > 0 && subtotal < 250 ? `
          <p style="font-size: 0.8rem; color: var(--accent-terracotta); margin-bottom: 1rem; line-height: 1.4;">
            Add $${(250 - subtotal).toFixed(2)} more for complimentary express global shipping!
          </p>
        ` : ''}

        <div style="display: flex; justify-content: space-between; border-top: 2px solid var(--border-color); padding-top: 1rem; margin-top: 1rem; margin-bottom: 1.5rem; font-size: 1.2rem; font-weight: 700;">
          <span>Estimated Total</span>
          <span style="color: var(--accent-espresso);">$${estimatedTotal.toFixed(2)} USD</span>
        </div>

        <a href="/checkout" class="btn btn-solid" style="display: block; text-align: center; width: 100%; padding: 0.9rem;">
          Proceed to Checkout ✦
        </a>
      </div>
    </div>
  `;
}

/**
 * Render Dedicated Checkout Page Order Breakdown (`/checkout`)
 */
function renderCheckoutSummary() {
  const container = document.getElementById('checkoutItemsList');
  const subtotalEl = document.getElementById('checkoutSubtotal');
  const shippingEl = document.getElementById('checkoutShipping');
  const totalEl = document.getElementById('checkoutTotal');

  const subtotal = cartState.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 250 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)} USD`;
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Complimentary' : `$${shipping.toFixed(2)} USD`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)} USD`;

  if (!container) return;

  if (cartState.length === 0) {
    container.innerHTML = `
      <p style="text-align: center; color: var(--text-muted); padding: 2rem 0; font-size: 0.9rem;">
        Your bag is currently empty. <a href="/shop" style="color: var(--accent-terracotta);">Return to shop</a>.
      </p>
    `;
    return;
  }

  container.innerHTML = cartState.map(item => {
    let sizesLabel = '';
    if (item.isSet) {
      sizesLabel = `Top: ${item.topSize} | Bottom: ${item.bottomSize}`;
    } else {
      sizesLabel = `Size: ${item.singleSize || 'Standard'}`;
    }

    const imgPath = resolveImagePath(item.image);

    return `
      <div style="display: flex; gap: 1rem; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid var(--border-hairline);">
        <img src="${imgPath}" alt="${escapeHTML(item.name)}" style="width: 54px; height: 72px; object-fit: cover; border-radius: 4px; background: var(--bg-sand);" onerror="this.src='/assets/images/optimized/hero-960.jpg'">
        <div style="flex: 1;">
          <h4 style="font-size: 0.92rem; margin-bottom: 0.2rem; font-family: var(--font-heading);">${escapeHTML(item.name)}</h4>
          <div style="font-size: 0.78rem; color: var(--text-muted);">${sizesLabel} &nbsp;×&nbsp; ${item.quantity}</div>
        </div>
        <div style="font-size: 0.95rem; font-weight: 600;">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `;
  }).join('');
}

/**
 * Handle Checkout Form Submit & Order Confirmation Generation
 */
function initCheckoutForm() {
  const form = document.getElementById('checkoutForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (cartState.length === 0) {
      alert('Your shopping bag is empty.');
      return;
    }

    const email = document.getElementById('checkoutEmail')?.value.trim();
    const fullName = document.getElementById('checkoutFullName')?.value.trim();
    const address = document.getElementById('checkoutAddress')?.value.trim();
    const city = document.getElementById('checkoutCity')?.value.trim();
    const zip = document.getElementById('checkoutZip')?.value.trim();

    if (!email || !fullName || !address || !city || !zip) {
      alert('Please fill in all required shipping address fields.');
      return;
    }

    processCheckoutOrder({ email, fullName, address, city, zip });
  });
}

function processCheckoutOrder(customer) {
  const orderRef = `ER-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const subtotal = cartState.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal >= 250 || subtotal === 0 ? 0 : 15;
  const total = subtotal + shipping;
  const purchasedItems = [...cartState];

  clearCart();

  const checkoutFormBox = document.getElementById('checkoutFormBox');
  const confirmationContainer = document.getElementById('orderConfirmationContainer');

  if (checkoutFormBox && confirmationContainer) {
    checkoutFormBox.style.display = 'none';
    confirmationContainer.style.display = 'block';

    const itemsSummaryHTML = purchasedItems.map(i => `
      <li style="font-size: 0.9rem; color: var(--text-light); margin-bottom: 0.5rem; display: flex; justify-content: space-between;">
        <span><strong>${escapeHTML(i.name)}</strong> (${i.isSet ? `Top: ${i.topSize}, Bottom: ${i.bottomSize}` : `Size: ${i.singleSize}`}) × ${i.quantity}</span>
        <span style="font-weight: 600;">$${(i.price * i.quantity).toFixed(2)} USD</span>
      </li>
    `).join('');

    confirmationContainer.innerHTML = `
      <div style="background: var(--bg-sand); padding: 3.5rem 2.5rem; border-radius: var(--radius-strict); border: 1px solid var(--border-hairline); text-align: center; max-width: 680px; margin: 0 auto;">
        <span class="micro-label" style="color: var(--accent-terracotta); letter-spacing: 3px;">ORDER CONFIRMED ✦</span>
        <h2 style="font-size: 2.2rem; font-family: var(--font-heading); margin: 0.75rem 0 0.5rem; color: var(--text-main);">Thank You for Your Order</h2>
        <p style="font-size: 0.95rem; color: var(--text-muted); margin-bottom: 2rem;">
          Order Reference: <strong style="color: var(--accent-espresso); font-family: monospace; font-size: 1.1rem;">#${orderRef}</strong>
        </p>

        <div style="background: var(--bg-cream); padding: 1.75rem; border-radius: var(--radius-strict); text-align: left; margin-bottom: 2rem; border: 1px solid var(--border-hairline);">
          <h3 style="font-size: 1.1rem; font-family: var(--font-heading); margin-bottom: 1rem; border-bottom: 1px solid var(--border-hairline); padding-bottom: 0.5rem;">Dispatch Details</h3>
          <p style="font-size: 0.88rem; color: var(--text-light); margin-bottom: 0.35rem;"><strong>Recipient:</strong> ${escapeHTML(customer.fullName)} (${escapeHTML(customer.email)})</p>
          <p style="font-size: 0.88rem; color: var(--text-light); margin-bottom: 1.25rem;"><strong>Shipping Address:</strong> ${escapeHTML(customer.address)}, ${escapeHTML(customer.city)} ${escapeHTML(customer.zip)}</p>

          <h3 style="font-size: 1.1rem; font-family: var(--font-heading); margin-bottom: 0.75rem; border-bottom: 1px solid var(--border-hairline); padding-bottom: 0.5rem;">Ordered Items</h3>
          <ul style="list-style: none; padding: 0; margin: 0 0 1rem;">
            ${itemsSummaryHTML}
          </ul>
          
          <div style="display: flex; justify-content: space-between; border-top: 2px solid var(--border-color); padding-top: 0.75rem; font-size: 1.1rem; font-weight: 700; color: var(--accent-espresso);">
            <span>Total Amount Paid</span>
            <span>$${total.toFixed(2)} USD</span>
          </div>
        </div>

        <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 2rem; line-height: 1.6;">
          A confirmation dispatch email has been sent to <strong>${escapeHTML(customer.email)}</strong>. Our master knitter is preparing your pieces for express courier delivery.
        </p>

        <a href="/shop" class="btn btn-solid" style="display: inline-block;">Continue Exploring Catalog ✦</a>
      </div>
    `;
  }
}

/**
 * Toast Notification Popup Banner
 */
function showToast(message) {
  let toast = document.getElementById('editorialToastBanner');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'editorialToastBanner';
    toast.style.cssText = `
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: var(--accent-espresso);
      color: #FAF7F2;
      padding: 0.85rem 1.75rem;
      border-radius: 40px;
      font-size: 0.88rem;
      font-weight: 500;
      letter-spacing: 0.5px;
      box-shadow: 0 8px 24px rgba(26,22,21,0.25);
      z-index: 10000;
      opacity: 0;
      transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';

  clearTimeout(toast.__timer);
  toast.__timer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(100px)';
  }, 3200);
}

/**
 * Helper to resolve image paths cleanly across nested routes
 */
function resolveImagePath(imgSrc) {
  if (!imgSrc) return '/assets/images/optimized/hero-960.jpg';
  if (imgSrc.startsWith('/')) return imgSrc;
  if (imgSrc.startsWith('../')) return imgSrc.replace('../', '/');
  return `/${imgSrc}`;
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
      closeCartDrawer();
      window.location.href = '/checkout';
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
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

window.addToCart = addToCart;
window.updateItemQuantity = updateItemQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.openCartDrawer = openCartDrawer;
window.closeCartDrawer = closeCartDrawer;
window.showToast = showToast;
window.isFavorite = isFavorite;
window.toggleFavorite = toggleFavorite;
window.syncAllBadgesAndUI = syncAllBadgesAndUI;
window.loadFavorites = loadFavorites;
window.saveFavorites = saveFavorites;

