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
  initPdpAccordion();
  initMobileGalleryScroll();
  updatePdpWishlistState();
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
    breadCategory.href = `shop.html?category=${product.category.toLowerCase().replace(/\s+/g, '-')}`;
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
  
  if (priceEl) {
      priceEl.textContent = (product.price === null || product.price === 'TBD') ? 'Price: TBD' : `$${product.price.toFixed(2)}`;
  }
  if (mobileBarPrice) {
      mobileBarPrice.textContent = (product.price === null || product.price === 'TBD') ? 'Price: TBD' : `$${product.price.toFixed(2)}`;
  }
  
  if (ratingEl) {
      if (product.rating === null) {
          document.querySelector('.pdp-rating-badge').style.display = 'none';
      } else {
          ratingEl.textContent = (product.rating || 5.0).toFixed(1);
      }
  }
  if (revEl && product.reviewsCount !== undefined) {
      revEl.textContent = `(${product.reviewsCount} reviews)`;
  }
  
  if (descripEl) descripEl.textContent = product.descriptor || 'Handcrafted Editorial Swimwear';
  if (descTextEl) descTextEl.textContent = product.description;

  // TBD Fields Handling
  const detailsList = document.getElementById('pdpDetailsList');
  if (detailsList && product.details && product.details.length > 0) {
      detailsList.style.display = 'block';
      detailsList.innerHTML = product.details.map(d => `<li>${d}</li>`).join('');
  }

  const handleTbd = (elId, val) => {
      const el = document.getElementById(elId);
      if (el && val === 'TBD') el.innerHTML = '<span style="color:var(--accent-terracotta); font-weight:600;">TBD</span>';
      else if (el && val) el.innerHTML = val;
  };
  
  handleTbd('pdpCareText', product.care);
  handleTbd('pdpShippingText', product.shipping);
  
  const fitEl = document.getElementById('pdpFitText');
  const msrEl = document.getElementById('pdpMeasurementsText');
  if (product.fit === 'TBD' || product.measurements === 'TBD') {
      if (fitEl) fitEl.innerHTML = '<span style="color:var(--accent-terracotta); font-weight:600;">TBD (Fit Info Pending)</span>';
      if (msrEl) msrEl.style.display = 'none';
  }

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
  }

  // Render Swatches
  renderPdpSwatches(product);

  // Render Conditional Editorial/Lifestyle Brand Story Section
  renderBrandStorySection(product, gallery);

  // Inject JSON-LD Schema
  const jsonLd = document.getElementById('jsonLdProductSchema');
  if (jsonLd) {
    const schema = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": gallery.map(g => window.location.origin + '/' + g.src.replace(/^(\.\.\/)+/, '')),
      "description": product.description,
      "sku": product.sku || product.id,
      "brand": {
        "@type": "Brand",
        "name": "Editorial Resort"
      },
      "color": product.color
    };
    
    if (product.price !== null && product.price !== 'TBD') {
        schema.offers = {
            "@type": "Offer",
            "url": window.location.href,
            "priceCurrency": "USD",
            "price": product.price,
            "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        };
    }
    jsonLd.textContent = JSON.stringify(schema, null, 2);
  }
}

function renderPdpSwatches(product) {
  const wrapper = document.getElementById('pdpVariantsWrapper');
  if (!wrapper) return;

  const isSet = product.type === 'set';
  let html = '';

  if (isSet) {
    const topSizes = (product.variants && product.variants.top) || ['XS', 'S', 'M', 'L'];
    const bottomSizes = (product.variants && product.variants.bottom) || ['XS', 'S', 'M', 'L'];

    html = `
      <div class="pdp-swatch-group">
        <div class="swatch-group-label">
          <span>Top Size</span>
          <span class="selected-value" id="pdp-top-val">Select Top</span>
        </div>
        <div class="swatches-row" id="pdpTopRow">
          ${topSizes.map(sz => `<button class="swatch-btn pdp-swatch" data-group="top" data-size="${sz}">${sz}</button>`).join('')}
        </div>
      </div>

      <div class="pdp-swatch-group">
        <div class="swatch-group-label">
          <span>Bottom Size</span>
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
          <span>Select Size</span>
          <span class="selected-value" id="pdp-size-val">Select Size</span>
        </div>
        <div class="swatches-row" id="pdpSizeRow">
          ${singleSizes.map(sz => `<button class="swatch-btn pdp-swatch" data-group="size" data-size="${sz}">${sz}</button>`).join('')}
        </div>
      </div>
    `;
  }

  wrapper.innerHTML = html;

  // Swatch Listener Attachment
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

  // Action Button Listeners
  const addBtn = document.getElementById('pdpAddToCartBtn');
  const mobileBarBtn = document.getElementById('mobileBarAddToCartBtn');

  const handleAdd = () => {
    if (typeof addToCart === 'function') {
      addToCart(product, pdpSelections);
      showPdpAddConfirmation();
    }
  };

  if (addBtn) addBtn.onclick = handleAdd;
  if (mobileBarBtn) mobileBarBtn.onclick = handleAdd;
}

function validatePdpSelections(product) {
  const isSet = product.type === 'set';
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
      mobileBarBtn.textContent = 'Add to Bag';
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
      mobileBarBtn.textContent = 'Select a Size';
    }
  }
}

function showPdpAddConfirmation() {
  const addBtn = document.getElementById('pdpAddToCartBtn');
  const mobileBarBtn = document.getElementById('mobileBarAddToCartBtn');
  const prevText = addBtn ? addBtn.textContent : 'Add to Bag';

  if (addBtn) addBtn.textContent = 'Added to Bag ✦';
  if (mobileBarBtn) mobileBarBtn.textContent = 'Added to Bag ✦';

  setTimeout(() => {
    if (addBtn) addBtn.textContent = prevText;
    if (mobileBarBtn) mobileBarBtn.textContent = prevText;
  }, 2500);
}

function updatePdpWishlistState() {
  const wishBtn = document.getElementById('pdpWishlistBtn');
  if (!wishBtn || !currentPdpProduct) return;

  const isFav = typeof favoritesList !== 'undefined' && favoritesList.includes(currentPdpProduct.id);
  wishBtn.classList.toggle('active', isFav);
  wishBtn.innerHTML = isFav ? '♥' : '♡';

  wishBtn.onclick = () => {
    if (typeof toggleFavorite === 'function') {
      toggleFavorite(currentPdpProduct.id);
      const newFav = favoritesList.includes(currentPdpProduct.id);
      wishBtn.classList.toggle('active', newFav);
      wishBtn.innerHTML = newFav ? '♥' : '♡';
    }
  };
}

function renderBrandStorySection(product, gallery) {
  const section = document.getElementById('pdpBrandStorySection');
  const grid = document.getElementById('pdpBrandStoryGrid');
  if (!section || !grid) return;

  const storyImages = gallery.filter(img => img.role === 'editorial' || img.role === 'lifestyle');

  if (!storyImages || storyImages.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  grid.innerHTML = '';
  
  const titleEl = document.getElementById('pdpBrandStoryTitle');
  if (titleEl && product.id === 'drs-bur-cro-001') {
      titleEl.textContent = 'The Art of Crochet';
  }

  const copyMap = {
    editorial: {
      headline: "Artisanal Grace",
      body: "Sculpted with organic tactile ribbing designed to move fluidly in high summer sun."
    },
    lifestyle: {
      headline: "Resort Living",
      body: "Breathable unbleached fibers handcrafted for effortless poolside lounging and coastal escapes."
    }
  };

  storyImages.forEach(imgObj => {
    const card = document.createElement('div');
    card.className = `story-card story-role-${imgObj.role}`;

    const copy = copyMap[imgObj.role] || { headline: "Tactile Luxury", body: "Woven by hand in limited atelier quantities." };

    const pictureHTML = typeof createResponsivePictureHTML === 'function'
      ? createResponsivePictureHTML(imgObj.src, `${product.name} ${imgObj.role}`, {
          pictureClass: 'story-card-img',
          imgClass: 'story-card-img',
          sizes: '(max-width: 768px) 100vw, 50vw',
          loading: 'lazy'
        })
      : `<img src="${imgObj.src}" alt="${product.name}" class="story-card-img" loading="lazy">`;

    card.innerHTML = `
      <div class="story-card-media">
        ${pictureHTML}
      </div>
      <div class="story-card-content">
        <span class="micro-label">${imgObj.role.toUpperCase()} ATELIER</span>
        <h3 class="story-card-headline">${copy.headline}</h3>
        <p class="story-card-body">${copy.body}</p>
      </div>
    `;

    grid.appendChild(card);
  });
}

function initPdpAccordion() {
  const items = document.querySelectorAll('#pdpAccordion .accordion-item');
  items.forEach(item => {
    const header = item.querySelector('.accordion-header');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');
      items.forEach(i => {
        i.classList.remove('is-open');
        const h = i.querySelector('.accordion-header');
        if (h) h.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('is-open');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function initMobileGalleryScroll() {
  const galleryStack = document.getElementById('pdpGalleryStack');
  const counterText = document.getElementById('pdpCounterText');
  if (!galleryStack || !counterText) return;

  const items = galleryStack.querySelectorAll('.pdp-gallery-item');
  if (items.length <= 1) return;

  galleryStack.addEventListener('scroll', () => {
    const width = galleryStack.clientWidth;
    if (width === 0) return;
    const scrollLeft = galleryStack.scrollLeft;
    const currentIndex = Math.min(Math.floor((scrollLeft + width / 2) / width) + 1, items.length);
    counterText.textContent = `${currentIndex} / ${items.length}`;
  }, { passive: true });
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
