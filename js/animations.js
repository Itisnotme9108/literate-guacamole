/**
 * Editorial Resort & Intimates - Motion Design System (GSAP + ScrollTrigger)
 * Modular animation engine for editorial luxury aesthetics.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Check if GSAP and ScrollTrigger are loaded
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
    console.warn('GSAP or ScrollTrigger not loaded. Motion system skipped.');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  // Check prefers-reduced-motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    console.log('Prefers-reduced-motion detected: GSAP animations disabled for accessibility.');
    return;
  }

  initNavScrollAnimation();
  initHeroAnimations();
  initCollectionsAnimations();
  initProcessAnimations();
  initBespokeFitAnimations();
  initLookbookAnimations();
  initPhilosophyAnimations();
  initTestimonialsAnimations();
  initProductSpotlightTilt();
});

/**
 * Navigation Scroll Refinement & Elevation
 */
function initNavScrollAnimation() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  ScrollTrigger.create({
    start: 'top -50',
    onUpdate: (self) => {
      if (self.scroll() > 50) {
        gsap.to(navbar, {
          boxShadow: '0 4px 20px rgba(26, 22, 21, 0.06)',
          backgroundColor: 'rgba(250, 247, 242, 0.96)',
          backdropFilter: 'blur(12px)',
          duration: 0.3
        });
      } else {
        gsap.to(navbar, {
          boxShadow: 'none',
          backgroundColor: 'rgba(250, 247, 242, 0.94)',
          backdropFilter: 'blur(8px)',
          duration: 0.3
        });
      }
    }
  });
}

/**
 * Phase 1: Hero Entrance Sequence & Parallax Effect
 */
function initHeroAnimations() {
  const heroSection = document.getElementById('heroSection');
  if (!heroSection) return;

  const heroImg = heroSection.querySelector('.hero-background-img');
  const eyebrow = heroSection.querySelector('.hero-eyebrow');
  const title = heroSection.querySelector('.hero-title');
  const tagline = heroSection.querySelector('.hero-tagline');
  const ctaBtns = heroSection.querySelectorAll('.hero-cta-group .btn');
  const scrollIndicator = document.getElementById('heroScrollIndicator');
  const navbar = document.querySelector('.navbar');

  // Entrance Timeline
  const entranceTl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    delay: 0.1
  });

  // Synchronize timeline with WebGL Woven Curtain Reveal
  if (sessionStorage.getItem('editorial_curtain_shown') !== 'true') {
    entranceTl.pause();
    window.addEventListener('curtainComplete', () => {
      entranceTl.play();
    }, { once: true });
  }

  // Nav entrance
  if (navbar) {
    entranceTl.fromTo(navbar, 
      { y: -20, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.7 }
    );
  }

  // Hero background image smooth reveal scale
  if (heroImg) {
    entranceTl.fromTo(heroImg,
      { scale: 1.08, opacity: 0.8 },
      { scale: 1, opacity: 1, duration: 1.2, ease: 'power2.out' },
      '-=0.5'
    );
  }

  // Crisp Editorial Text Reveals (Ending in full crisp opacity 1)
  if (eyebrow) {
    entranceTl.fromTo(eyebrow,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 },
      '-=0.9'
    );
  }

  if (title) {
    entranceTl.fromTo(title,
      { y: 25, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8 },
      '-=0.5'
    );
  }

  if (tagline) {
    entranceTl.fromTo(tagline,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 },
      '-=0.6'
    );
  }

  if (ctaBtns && ctaBtns.length > 0) {
    entranceTl.fromTo(ctaBtns,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7, stagger: 0.12 },
      '-=0.4'
    );
  }

  // Scroll Indicator reveal & subtle infinite float
  if (scrollIndicator) {
    entranceTl.fromTo(scrollIndicator,
      { y: 15, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.8,
        onComplete: () => {
          gsap.to(scrollIndicator, {
            y: 8,
            duration: 2.2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        }
      },
      '-=0.4'
    );
  }

  // ScrollTrigger Parallax on Hero Background Image Only
  if (heroImg) {
    gsap.to(heroImg, {
      yPercent: 12,
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: 'bottom top',
        scrub: true
      }
    });
  }
}

/**
 * Phase 2: Curated Collections Viewport Entry & Refined Hover Interactions
 */
function initCollectionsAnimations() {
  const categoriesSection = document.getElementById('categories');
  if (!categoriesSection) return;

  const sectionHeader = categoriesSection.querySelector('.section-header');
  const tiles = categoriesSection.querySelectorAll('.category-tile');

  if (sectionHeader) {
    gsap.fromTo(sectionHeader,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: categoriesSection,
          start: 'top 82%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  if (tiles.length > 0) {
    gsap.fromTo(tiles,
      { y: 45, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 1.0,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: categoriesSection,
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      }
    );

    tiles.forEach(tile => {
      const tileImg = tile.querySelector('img');
      const tileContent = tile.querySelector('.category-tile-content');
      const tileTitle = tile.querySelector('.category-tile-title');
      const tileSubtitle = tile.querySelector('.category-tile-subtitle');

      if (tileImg) {
        gsap.to(tileImg, {
          yPercent: -8,
          ease: 'none',
          scrollTrigger: {
            trigger: tile,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });

        tile.addEventListener('mouseenter', () => {
          gsap.to(tileImg, {
            scale: 1.06,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto'
          });

          if (tileContent) {
            gsap.to(tileContent, {
              y: -6,
              duration: 0.4,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }

          if (tileTitle) {
            gsap.to(tileTitle, {
              color: '#FAF7F2',
              duration: 0.3
            });
          }

          if (tileSubtitle) {
            gsap.to(tileSubtitle, {
              letterSpacing: '2px',
              duration: 0.4,
              ease: 'power2.out'
            });
          }
        });

        tile.addEventListener('mouseleave', () => {
          gsap.to(tileImg, {
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto'
          });

          if (tileContent) {
            gsap.to(tileContent, {
              y: 0,
              duration: 0.4,
              ease: 'power2.out',
              overwrite: 'auto'
            });
          }

          if (tileSubtitle) {
            gsap.to(tileSubtitle, {
              letterSpacing: '1.5px',
              duration: 0.4,
              ease: 'power2.out'
            });
          }
        });
      }
    });
  }
}

/**
 * Phase 3: The Atelier Knotted Process — Interactive Scroll Storytelling Sequence
 */
function initProcessAnimations() {
  const processSection = document.getElementById('process');
  if (!processSection) return;

  const sectionHeader = processSection.querySelector('.section-header');
  const progressBar = document.getElementById('processProgressBar');
  const nodes = processSection.querySelectorAll('.process-node');
  const stepItems = processSection.querySelectorAll('.process-step-item');

  if (sectionHeader) {
    gsap.fromTo(sectionHeader,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        scrollTrigger: {
          trigger: processSection,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  if (stepItems.length > 0) {
    gsap.fromTo(stepItems,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: '#processStepsGrid',
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  function setActiveStep(activeIndex) {
    stepItems.forEach((item, idx) => {
      item.classList.remove('is-active', 'is-passed');
      if (idx === activeIndex) {
        item.classList.add('is-active');
      } else if (idx < activeIndex) {
        item.classList.add('is-passed');
      }
    });

    nodes.forEach((node, idx) => {
      node.classList.remove('is-active', 'is-passed');
      if (idx === activeIndex) {
        node.classList.add('is-active');
      } else if (idx < activeIndex) {
        node.classList.add('is-passed');
      }
    });

    if (progressBar) {
      const progressPercent = (activeIndex / (stepItems.length - 1)) * 100;
      progressBar.style.width = `${progressPercent}%`;
    }
  }

  ScrollTrigger.create({
    trigger: processSection,
    start: 'top 65%',
    end: 'bottom 45%',
    scrub: true,
    onUpdate: (self) => {
      const progress = self.progress;
      const totalSteps = stepItems.length;
      const rawStep = progress * (totalSteps - 0.001);
      const activeIdx = Math.min(Math.floor(rawStep), totalSteps - 1);
      setActiveStep(activeIdx);
    }
  });

  gsap.to(processSection, {
    backgroundColor: '#F5F0EB',
    scrollTrigger: {
      trigger: processSection,
      start: 'top 50%',
      end: 'bottom 50%',
      scrub: true
    }
  });
}

/**
 * Phase 4: Bespoke Fit Journey — Scroll-Triggered Reveals & Progressive Movement
 */
function initBespokeFitAnimations() {
  const fitSection = document.querySelector('[aria-label="3-Step Custom Fit Process"]');
  if (!fitSection) return;

  const header = fitSection.querySelector('.section-header');
  const fitCards = fitSection.querySelectorAll('.fit-step-card');

  if (header) {
    gsap.fromTo(header,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: fitSection,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  if (fitCards.length > 0) {
    gsap.fromTo(fitCards,
      { y: 45, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.95,
        stagger: 0.18,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: fitSection,
          start: 'top 72%',
          toggleActions: 'play none none none'
        }
      }
    );

    fitCards.forEach((card) => {
      const stepNum = card.querySelector('.fit-step-number');
      const microLabel = card.querySelector('.micro-label');
      const ctaBtn = card.querySelector('.btn');

      gsap.fromTo(stepNum,
        { scale: 0.9, color: 'var(--text-light)' },
        {
          scale: 1,
          color: 'var(--accent-terracotta)',
          duration: 0.5,
          scrollTrigger: {
            trigger: card,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      if (microLabel) {
        gsap.fromTo(microLabel,
          { opacity: 0, x: -10 },
          {
            opacity: 1,
            x: 0,
            duration: 0.6,
            delay: 0.2,
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      if (ctaBtn) {
        gsap.fromTo(ctaBtn,
          { opacity: 0, y: 10 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            delay: 0.3,
            scrollTrigger: {
              trigger: card,
              start: 'top 80%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -6,
          borderColor: 'var(--accent-terracotta)',
          boxShadow: '0 12px 28px rgba(184, 83, 56, 0.1)',
          duration: 0.35,
          ease: 'power2.out'
        });
        if (stepNum) {
          gsap.to(stepNum, {
            scale: 1.1,
            duration: 0.3,
            ease: 'back.out(1.7)'
          });
        }
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          borderColor: 'var(--border-hairline)',
          boxShadow: 'none',
          duration: 0.35,
          ease: 'power2.out'
        });
        if (stepNum) {
          gsap.to(stepNum, {
            scale: 1,
            duration: 0.3
          });
        }
      });
    });
  }
}

/**
 * Phase 5: Lookbook — Staggered Reveals, Parallax & Refined Editorial Interactions
 */
function initLookbookAnimations() {
  const gallerySection = document.querySelector('[aria-label="Follow the Atelier Gallery"]');
  if (!gallerySection) return;

  const header = gallerySection.querySelector('.section-header');
  const galleryGrid = gallerySection.querySelector('.atelier-gallery-grid');
  const galleryItems = gallerySection.querySelectorAll('.gallery-item');

  if (header) {
    gsap.fromTo(header,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gallerySection,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  // 3D Perspective Grid Tilt on Scroll
  if (galleryGrid && window.innerWidth >= 768) {
    gsap.fromTo(galleryGrid,
      { rotateX: 4, rotateY: -2 },
      {
        rotateX: -3,
        rotateY: 2,
        ease: 'none',
        scrollTrigger: {
          trigger: gallerySection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true
        }
      }
    );
  }

  if (galleryItems.length > 0) {
    gsap.fromTo(galleryItems,
      { y: 40, opacity: 0, scale: 0.95 },
      {
        y: 0,
        opacity: 1,
        scale: 1,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: gallerySection,
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      }
    );

    galleryItems.forEach((item, idx) => {
      const img = item.querySelector('img');
      const overlayBadge = item.querySelector('.gallery-item-overlay span');
      const parallaxShift = idx % 2 === 0 ? -6 : 6;

      if (img) {
        gsap.to(img, {
          yPercent: parallaxShift,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });

        item.addEventListener('mouseenter', () => {
          gsap.to(item, {
            borderColor: 'var(--accent-terracotta)',
            boxShadow: 'inset 0 0 20px rgba(184, 83, 56, 0.15), 0 10px 24px rgba(26, 22, 21, 0.12)',
            duration: 0.4
          });
          gsap.to(img, {
            scale: 1.08,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto'
          });
          if (overlayBadge) {
            gsap.to(overlayBadge, {
              scale: 1.05,
              y: -2,
              duration: 0.3,
              ease: 'power2.out'
            });
          }
        });

        item.addEventListener('mouseleave', () => {
          gsap.to(item, {
            borderColor: 'var(--border-hairline)',
            boxShadow: 'inset 0 0 16px rgba(26, 22, 21, 0.08)',
            duration: 0.4
          });
          gsap.to(img, {
            scale: 1,
            duration: 0.6,
            ease: 'power2.out',
            overwrite: 'auto'
          });
          if (overlayBadge) {
            gsap.to(overlayBadge, {
              scale: 1,
              y: 0,
              duration: 0.3
            });
          }
        });
      }
    });
  }
}

/**
 * Phase 6: Atelier Philosophy — Large Editorial Typography Reveal & Stats Count
 */
function initPhilosophyAnimations() {
  const philosophySection = document.getElementById('philosophy');
  if (!philosophySection) return;

  const label = philosophySection.querySelector('.micro-label');
  const title = philosophySection.querySelector('h2');
  const paragraph = philosophySection.querySelector('p');
  const stats = philosophySection.querySelectorAll('.story-stats-grid > div');
  const moodboardImg = philosophySection.querySelector('.drop-banner-img');

  const philTl = gsap.timeline({
    scrollTrigger: {
      trigger: philosophySection,
      start: 'top 75%',
      toggleActions: 'play none none none'
    }
  });

  if (label) {
    philTl.fromTo(label, { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 });
  }

  if (title) {
    philTl.fromTo(title, 
      { y: 35, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 1.0, ease: 'power3.out' },
      '-=0.4'
    );
  }

  if (paragraph) {
    philTl.fromTo(paragraph, 
      { y: 25, opacity: 0 }, 
      { y: 0, opacity: 1, duration: 0.8 },
      '-=0.6'
    );
  }

  if (stats.length > 0) {
    philTl.fromTo(stats,
      { y: 20, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 0.8, stagger: 0.15, ease: 'back.out(1.5)' },
      '-=0.5'
    );
  }

  if (moodboardImg) {
    gsap.to(moodboardImg, {
      yPercent: -10,
      ease: 'none',
      scrollTrigger: {
        trigger: philosophySection,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }
}

/**
 * Phase 6: Testimonials Entrance & Rating Glow
 */
function initTestimonialsAnimations() {
  const testSection = document.querySelector('[aria-label="Client Testimonials & Fits"]');
  if (!testSection) return;

  const header = testSection.querySelector('.section-header');
  const cards = testSection.querySelectorAll('.confidence-card');

  if (header) {
    gsap.fromTo(header,
      { y: 30, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: testSection,
          start: 'top 80%',
          toggleActions: 'play none none none'
        }
      }
    );
  }

  if (cards.length > 0) {
    gsap.fromTo(cards,
      { y: 40, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.9,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: testSection,
          start: 'top 75%',
          toggleActions: 'play none none none'
        }
      }
    );

    cards.forEach(card => {
      const stars = card.querySelector('div');
      
      if (stars) {
        gsap.fromTo(stars,
          { opacity: 0.4, scale: 0.9 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.6,
            scrollTrigger: {
              trigger: card,
              start: 'top 82%',
              toggleActions: 'play none none none'
            }
          }
        );
      }

      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          y: -5,
          borderColor: 'var(--accent-terracotta)',
          boxShadow: '0 10px 24px rgba(26, 22, 21, 0.08)',
          duration: 0.35,
          ease: 'power2.out'
        });
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          y: 0,
          borderColor: 'var(--border-hairline)',
          boxShadow: 'none',
          duration: 0.35,
          ease: 'power2.out'
        });
      });
    });
  }
}

/**
 * Phase 3: Desktop Product Spotlight Card Mouse Tilt
 */
function initProductSpotlightTilt() {
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (window.innerWidth < 1024 || isTouchDevice) return;

  let currentCard = null;

  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.product-card');

    if (card) {
      if (currentCard && currentCard !== card) {
        gsap.to(currentCard, {
          rotateX: 0,
          rotateY: 0,
          translateZ: 0,
          duration: 0.45,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
      currentCard = card;

      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
      const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

      const maxTilt = 5.5; // Restrained 5.5deg amplitude
      const rotateY = x * maxTilt;
      const rotateX = -y * maxTilt;

      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        translateZ: 10,
        duration: 0.35,
        ease: 'power2.out',
        overwrite: 'auto'
      });
    } else if (currentCard) {
      gsap.to(currentCard, {
        rotateX: 0,
        rotateY: 0,
        translateZ: 0,
        duration: 0.5,
        ease: 'power2.out',
        overwrite: 'auto'
      });
      currentCard = null;
    }
  });
}
