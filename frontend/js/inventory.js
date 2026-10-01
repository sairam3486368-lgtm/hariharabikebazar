/**
 * inventory.js — fetches /data/bikes.json and renders bike cards.
 * Shared by index.html (featured rides) and bikes.html (full inventory).
 * bikes.json is the ONLY file to edit when real inventory arrives —
 * this file just renders whatever it finds there.
 */

let __bikesCache = null;
const CACHE_STORAGE_KEY = 'hhbb_inventory_cache_v6';
const CACHE_TIME_KEY = 'hhbb_inventory_cache_time_v6';
const CACHE_TTL_MS = 2 * 60 * 1000; // 2 minutes fresh

window.resolveImageSrc = function (imgStr) {
  if (!imgStr) return "";
  if (imgStr.startsWith('data:image') || imgStr.startsWith('http')) return imgStr;
  return '../' + imgStr;
};

function normalizeBike(b) {
  if (!b) return b;
  if (b._id) b.id = b._id;
  if (!b.status) b.status = "available";
  if (!b.location) b.location = "Hyderabad";

  if (!b.model) {
    const lowerName = (b.name || "").toLowerCase();
    const lowerBrand = (b.brand || "").toLowerCase();
    if (lowerBrand && lowerName.startsWith(lowerBrand)) {
      b.model = (b.name || "").substring(lowerBrand.length).trim();
    } else {
      b.model = b.name || "";
    }
  }

  if (!b.owner) b.owner = "1st Owner";
  if (!b.fuel) b.fuel = "Petrol";
  if (!b.registration) b.registration = "N/A";
  if (!b.insurance) b.insurance = "N/A";

  if (!b.images || b.images.length === 0) b.images = [];
  if (b.image && b.images.length === 0) b.images.push(b.image);
  return b;
}

function getCachedBikes() {
  try {
    const raw = localStorage.getItem(CACHE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      parsed.forEach(normalizeBike);
      return parsed;
    }
  } catch (e) {
    console.warn("Error reading bikes cache:", e);
  }
  return null;
}

function saveBikesCache(bikes) {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(bikes));
    localStorage.setItem(CACHE_TIME_KEY, String(Date.now()));
  } catch (e) {
    console.warn("Storage full or unavailable for bikes cache:", e);
  }
}

function loadBikes(forceRefresh = false) {
  if (__bikesCache && !forceRefresh) return Promise.resolve(__bikesCache);

  const cached = getCachedBikes();
  const cacheTime = parseInt(localStorage.getItem(CACHE_TIME_KEY) || '0', 10);
  const isFresh = (Date.now() - cacheTime) < CACHE_TTL_MS;

  const apiUrl = (typeof CONFIG !== 'undefined' && CONFIG.apiUrl) 
    ? `${CONFIG.apiUrl}/bikes` 
    : "https://hariharabikebazar.onrender.com/api/bikes";

  const fetchFromApi = () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    return fetch(apiUrl, { signal: controller.signal })
      .then((res) => {
        clearTimeout(timeoutId);
        if (!res.ok) throw new Error("API returned status " + res.status);
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) throw new Error("Empty bikes array");
        data.forEach(normalizeBike);
        __bikesCache = data;
        saveBikesCache(data);
        window.dispatchEvent(new CustomEvent('bikes-updated', { detail: data }));
        return data;
      });
  };

  const fetchStaticFallback = () => {
    return fetch('../data/bikes.json')
      .then((res) => {
        if (!res.ok) return fetch('data/bikes.json');
        return res;
      })
      .then((res) => {
        if (!res.ok) throw new Error("Static fallback not available");
        return res.json();
      })
      .then((data) => {
        data.forEach(normalizeBike);
        if (!__bikesCache) {
          __bikesCache = data;
          saveBikesCache(data);
        }
        return data;
      });
  };

  // If cached data is present, serve it INSTANTLY (0ms!)
  if (cached && cached.length > 0) {
    __bikesCache = cached;
    if (!isFresh || forceRefresh) {
      fetchFromApi().catch((err) => {
        console.warn("Background inventory refresh notice:", err.message);
      });
    }
    return Promise.resolve(cached);
  }

  // First time visitor: Start API fetch, fallback to static CDN data if API is slow (cold start) or errors
  return new Promise((resolve, reject) => {
    let resolved = false;

    fetchFromApi()
      .then((data) => {
        if (!resolved) {
          resolved = true;
          resolve(data);
        }
      })
      .catch((apiErr) => {
        console.warn("API load failed, using static inventory backup:", apiErr.message);
        if (!resolved) {
          fetchStaticFallback()
            .then((data) => {
              if (!resolved) {
                resolved = true;
                resolve(data);
              }
            })
            .catch((staticErr) => {
              if (!resolved) {
                resolved = true;
                reject(apiErr);
              }
            });
        }
      });

    // If API takes longer than 2.5 seconds (e.g. Render server cold start), show static data first!
    setTimeout(() => {
      if (!resolved) {
        fetchStaticFallback()
          .then((data) => {
            if (!resolved) {
              resolved = true;
              console.log("Serving instant static inventory while backend starts...");
              resolve(data);
            }
          })
          .catch(() => {});
      }
    }, 2500);
  });
}

const ICONS = {
  calendar:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',
  speed:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M12 12l4-4"/></svg>',
  pin:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
};

function budgetLabelFor(price) {
  if (price < BUDGET_CEILINGS.under50) return "under50";
  if (price < BUDGET_CEILINGS["50to1l"]) return "50to1l";
  if (price < BUDGET_CEILINGS["1to2l"]) return "1to2l";
  return "premium";
}

function renderBadges(bike) {
  const badges = [];
  if (CONFIG.DEMO_MODE) badges.push(`<span class="badge badge-demo">Demo</span>`);
  if (Array.isArray(bike.needsVerification) && bike.needsVerification.length)
    badges.push(`<span class="badge badge-verify">Needs verification</span>`);
  if (bike.featured) badges.push(`<span class="badge badge-featured">Featured</span>`);
  if (bike.newArrival) badges.push(`<span class="badge badge-new">New Arrival</span>`);
  if (bike.status === "reserved") badges.push(`<span class="badge badge-reserved">Reserved</span>`);
  if (bike.status === "sold") badges.push(`<span class="badge badge-sold">Sold</span>`);
  return badges.join("");
}

function statusOverlayHTML(bike) {
  if (bike.status === "sold") return `<div class="status-overlay"><span>SOLD</span></div>`;
  if (bike.status === "reserved") return `<div class="status-overlay"><span>RESERVED</span></div>`;
  return "";
}

function bikeCardHTML(bike) {
  const disabled = bike.status === "sold";
  const img = (bike.images && bike.images[0]) || "";
  const overlay = statusOverlayHTML(bike);
  const mediaInner = img
    ? `<div class="badge-row">${renderBadges(bike)}</div>${overlay}<img src="${resolveImageSrc(img)}" alt="${bike.brand} ${bike.model} photo" loading="lazy" width="600" height="450">`
    : `<div class="badge-row">${renderBadges(bike)}</div>${overlay}`;
  const mediaClass = "bike-card-media" + (img ? "" : " no-image");

  return `
  <article class="bike-card" data-id="${bike.id}" data-price="${bike.price}" data-brand="${bike.brand}" data-year="${bike.year}" data-status="${bike.status}" data-location="${bike.location}">
    <a class="${mediaClass}" href="bike.html?id=${bike.id}" aria-label="View ${bike.brand} ${bike.model} details">
      ${mediaInner}
    </a>
    <div class="bike-card-body">
      <h3 class="bike-card-title"><a href="bike.html?id=${bike.id}">${bike.brand} ${bike.model}</a></h3>
      <div class="bike-card-meta">
        <span>${ICONS.calendar} ${bike.year}</span>
        <span>${ICONS.pin} ${bike.location}</span>
      </div>
      <div class="bike-card-price-row">
        <span class="bike-card-price">${formatINR(bike.price)}</span>
        <span class="bike-card-emi">${bike.owner}</span>
      </div>
      <div class="bike-card-actions">
        <a class="btn btn-outline btn-sm" href="bike.html?id=${bike.id}">View Details</a>
        <a class="btn btn-whatsapp btn-sm" href="${buildWhatsAppUrl(waMessageForBike(bike))}" target="_blank" rel="noopener" ${disabled ? "aria-disabled='true'" : ""}>WhatsApp</a>
      </div>
    </div>
  </article>`;
}

function skeletonCardHTML() {
  return `
  <div class="skeleton-card">
    <div class="skeleton-media"></div>
    <div class="skeleton-line" style="width:70%"></div>
    <div class="skeleton-line" style="width:45%"></div>
    <div class="skeleton-line" style="width:55%; margin-bottom:16px;"></div>
  </div>`;
}

function renderSkeletons(container, count) {
  container.innerHTML = Array.from({ length: count }).map(skeletonCardHTML).join("");
}

function renderErrorState(container) {
  container.innerHTML = `
  <div class="empty-state" style="grid-column:1/-1">
    <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/></svg>
    <h3>We couldn't load the bike inventory right now.</h3>
    <p>Please check your connection and try again.</p>
    <div class="empty-actions">
      <button class="btn btn-primary" onclick="location.reload()">Retry</button>
    </div>
  </div>`;
}

/* Image-only tile used in the homepage Featured Rides — no text details. */
function featuredImageCardHTML(bike) {
  const img = (bike.images && bike.images[0]) || "";
  const mediaInner = img
    ? `<img src="${resolveImageSrc(img)}" alt="${bike.brand} ${bike.model} photo" loading="lazy" width="600" height="450">`
    : "";
  const mediaClass = "bike-card-media" + (img ? "" : " no-image");
  return `
  <article class="bike-card bike-card--image-only" data-id="${bike.id}">
    <a class="${mediaClass}" href="bike.html?id=${bike.id}" aria-label="View ${bike.brand} ${bike.model}">
      ${mediaInner}
    </a>
  </article>`;
}

/* ---------- Homepage: Featured Rides (Marquee & Carousel) ---------- */
function initFeaturedRides() {
  const marqueeTrack = document.getElementById("featured-marquee-track") || document.querySelector(".marquee-track");
  const grid = document.getElementById("featured-grid");

  if (!marqueeTrack && !grid) return;

  loadBikes()
    .then((bikes) => {
      const available = bikes.filter((b) => b.status !== "sold");
      const list = available.length ? available.slice(0, 10) : bikes.slice(0, 10);
      if (!list.length) return;

      if (marqueeTrack) {
        // Build cards with real bike photos and links
        const cardsHtml = list.map((b) => featuredImageCardHTML(b)).join("");
        // Duplicate cards for a seamless infinite loop animation
        marqueeTrack.innerHTML = cardsHtml + cardsHtml;
      }

      if (grid) {
        grid.innerHTML = `
          <div class="featured-carousel">
            <div class="carousel-viewport" id="carousel-viewport">
              <div class="carousel-track" id="carousel-track"></div>
            </div>
            <button class="carousel-nav carousel-prev" type="button" aria-label="Previous images">
              ${chevronSVG(CHEVRON.left, 2.5)}
            </button>
            <button class="carousel-nav carousel-next" type="button" aria-label="Next images">
              ${chevronSVG(CHEVRON.right, 2.5)}
            </button>
            <div class="carousel-dots" id="carousel-dots"></div>
          </div>`;

        const viewport = grid.querySelector(".carousel-viewport");
        const track = grid.querySelector(".carousel-track");
        const prevBtn = grid.querySelector(".carousel-prev");
        const nextBtn = grid.querySelector(".carousel-next");
        const dotsWrap = grid.querySelector(".carousel-dots");

        track.innerHTML = list
          .map((b) => `<div class="carousel-slide">${featuredImageCardHTML(b)}</div>`)
          .join("");
        setupCarousel(viewport, track, prevBtn, nextBtn, dotsWrap);
      }
    })
    .catch((err) => {
      console.warn("Could not load featured rides:", err);
      if (grid) renderErrorState(grid);
    });
}

/* ---------- Homepage: "What's your budget?" explorer ----------
 * 4 clickable amount cards. Clicking a card replaces the cards with the
 * real bike cards (from data/bikes.json) whose price falls in that band.
 * Bikes flagged showInInventory:false still appear here (homepage only);
 * bikes.html applies its own exclusion. */
function initBudgetExplorer() {
  const root = document.getElementById("budget-explorer");
  if (!root) return;

  // Build the 4 amount cards from the shared BUDGET_CARDS definition.
  function renderCards() {
    root.innerHTML = `
      <div class="budget-grid">
        ${BUDGET_CARDS.map(
      (c) => `
          <button class="budget-card" type="button" data-budget="${c.key}" aria-label="Show bikes in ${c.range}">
            <div class="label">${c.label}</div>
            <div class="range">${c.range}</div>
            <div class="cta">Browse bikes ${chevronSVG(CHEVRON.right, 3)}</div>
          </button>`
    ).join("")}
      </div>`;

    Array.from(root.querySelectorAll(".budget-card")).forEach((btn) => {
      btn.addEventListener("click", () => showBikes(btn.dataset.budget));
    });
  }

  function showBikes(key) {
    const band = BUDGET_BANDS[key];
    if (!band) return;

    root.innerHTML = `
      <button class="budget-back" type="button" aria-label="Back to budget options">${chevronSVG(CHEVRON.left, 3)} All budgets</button>
      <div class="budget-explorer-head">
        <h3>${band.label}</h3>
        <a class="btn btn-outline btn-sm" href="bikes.html?budget=${key}">View all in this range</a>
      </div>
      <div class="bike-grid" id="budget-bikes-grid"></div>`;

    root.querySelector(".budget-back").addEventListener("click", renderCards);

    const gridEl = root.querySelector("#budget-bikes-grid");
    renderSkeletons(gridEl, 4);

    loadBikes()
      .then((bikes) => {
        // Exclude unpriced bikes (price 0 = "Not specified") so they don't
        // fall into the Under ₹50K band before real amounts are set.
        const matches = bikes.filter((b) => b.status !== "sold" && b.price > 0 && band.test(b.price));
        if (!matches.length) {
          gridEl.innerHTML = `<p class="section-sub mt-0" style="grid-column:1/-1">No bikes in this range yet — check back soon or <a href="bikes.html" style="color:var(--red);font-weight:700;">browse all bikes</a>.</p>`;
          return;
        }
        gridEl.innerHTML = matches.map(bikeCardHTML).join("");
      })
      .catch(() => renderErrorState(gridEl));
  }

  renderCards();
}

function setupCarousel(viewport, track, prevBtn, nextBtn, dotsWrap) {
  const GAP = 22; // must match .carousel-track gap in CSS
  const slides = Array.from(track.children);
  const total = slides.length;

  function perView() {
    const w = viewport.clientWidth;
    if (w >= 1040) return 4;
    if (w >= 780) return 3;
    if (w >= 500) return 2;
    return 1;
  }

  function slideWidth(pv) {
    return Math.max((viewport.clientWidth - GAP * (pv - 1)) / pv, 200);
  }

  function step() {
    return slideWidth(perView()) + GAP;
  }

  function maxScroll() {
    return track.scrollWidth - viewport.clientWidth;
  }

  function layout() {
    const sw = slideWidth(perView());
    slides.forEach((s) => (s.style.flexBasis = sw + "px"));
  }

  function goTo(direction) {
    const max = maxScroll();
    if (direction > 0) {
      if (viewport.scrollLeft >= max - 1) {
        viewport.scrollTo({ left: 0, behavior: "auto" });
      } else {
        viewport.scrollTo({ left: Math.min(viewport.scrollLeft + step(), max), behavior: "smooth" });
      }
    } else {
      if (viewport.scrollLeft <= 1) {
        viewport.scrollTo({ left: max, behavior: "auto" });
      } else {
        viewport.scrollTo({ left: Math.max(viewport.scrollLeft - step(), 0), behavior: "smooth" });
      }
    }
  }

  let lastIndex = -1;
  function updateDots() {
    const idx = Math.round(viewport.scrollLeft / step());
    if (idx === lastIndex) return;
    lastIndex = idx;
    Array.from(dotsWrap.children).forEach((d, i) => d.classList.toggle("active", i === idx));
  }

  function buildDots() {
    const pages = Math.max(total - perView() + 1, 1);
    dotsWrap.innerHTML = Array.from({ length: pages })
      .map((_, i) => `<button class="carousel-dot" type="button" aria-label="Go to slide ${i + 1}"></button>`)
      .join("");
    Array.from(dotsWrap.children).forEach((d, i) =>
      d.addEventListener("click", () => {
        viewport.scrollTo({ left: i * step(), behavior: "smooth" });
      })
    );
    updateDots();
  }

  layout();
  buildDots();

  nextBtn.addEventListener("click", () => goTo(1));
  prevBtn.addEventListener("click", () => goTo(-1));
  viewport.addEventListener("scroll", updateDots, { passive: true });

  /* Auto-play: advance every 4s, pause while hovering */
  let timer = setInterval(() => goTo(1), 4000);
  const carousel = viewport.closest(".featured-carousel");
  carousel.addEventListener("mouseenter", () => clearInterval(timer));
  carousel.addEventListener("mouseleave", () => {
    clearInterval(timer);
    timer = setInterval(() => goTo(1), 4000);
  });

  /* Re-layout on resize (debounced) */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      layout();
      buildDots();
    }, 150);
  });
}
