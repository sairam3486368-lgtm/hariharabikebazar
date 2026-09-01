/**
 * filters.js — powers bikes.html: filter sidebar + mobile drawer, search,
 * sort, active-filter chips, budget shortcuts, and Load More pagination.
 * BUDGET_BANDS is defined once in config.js (loaded first on every page).
 */

const PAGE_SIZE = 12;

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

const state = {
  budget: new Set(),
  brand: new Set(),
  location: new Set(),
  ownership: new Set(),
  status: new Set(["available", "reserved"]), // hide sold by default
  search: "",
  sort: "featured",
  visibleCount: PAGE_SIZE,
};

let ALL_BIKES = [];

document.addEventListener("DOMContentLoaded", () => {
  const grid = document.getElementById("inventory-grid");
  if (!grid) return; // not on bikes.html

  applyUrlParams();
  renderSkeletons(grid, 8);

  loadBikes()
    .then((bikes) => {
      ALL_BIKES = bikes;
      buildDynamicFilterOptions(bikes);
      bindControls();
      renderAll();
    })
    .catch(() => renderErrorState(grid));
});

function applyUrlParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("budget") && BUDGET_BANDS[params.get("budget")]) {
    state.budget.add(params.get("budget"));
  }
  if (params.get("brand")) {
    state.brand.add(params.get("brand"));
  }
  if (params.get("q")) {
    state.search = params.get("q");
  }
}

function buildDynamicFilterOptions(bikes) {
  const brandWraps = [
    document.getElementById("filter-brand-options"),
    document.getElementById("filter-brand-options-mobile"),
  ].filter(Boolean);
  const locWraps = [
    document.getElementById("filter-location-options"),
    document.getElementById("filter-location-options-mobile"),
  ].filter(Boolean);

  if (brandWraps.length) {
    const brands = [...new Set(bikes.map((b) => b.brand))].sort();
    const brandHTML = brands
      .map(
        (b) => `
      <label class="filter-option">
        <input type="checkbox" data-group="brand" value="${b}" ${state.brand.has(b) ? "checked" : ""}>
        ${b}
      </label>`
      )
      .join("");
    brandWraps.forEach((wrap) => (wrap.innerHTML = brandHTML));
  }
  if (locWraps.length) {
    const locs = [...new Set(bikes.map((b) => b.location))].sort();
    const locHTML = locs
      .map(
        (l) => `
      <label class="filter-option">
        <input type="checkbox" data-group="location" value="${l}" ${state.location.has(l) ? "checked" : ""}>
        ${l}
      </label>`
      )
      .join("");
    locWraps.forEach((wrap) => (wrap.innerHTML = locHTML));
  }
  // reflect pre-set budget checkboxes from URL (desktop sidebar + mobile drawer both have data-group="budget")
  document.querySelectorAll("[data-group='budget']").forEach((el) => {
    if (state.budget.has(el.value)) el.checked = true;
  });
}

function bindControls() {
  document.body.addEventListener("change", (e) => {
    const group = e.target.getAttribute("data-group");
    if (!group) return;
    const set = state[group];
    if (!set) return;
    if (e.target.checked) set.add(e.target.value);
    else set.delete(e.target.value);
    state.visibleCount = PAGE_SIZE;
    renderAll();
  });

  const searchInput = document.getElementById("inventory-search");
  if (searchInput) {
    searchInput.value = state.search;
    searchInput.addEventListener("input", (e) => {
      state.search = e.target.value.trim().toLowerCase();
      state.visibleCount = PAGE_SIZE;
      renderAll();
    });
  }

  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      state.sort = e.target.value;
      renderAll();
    });
  }

  document.body.addEventListener("click", (e) => {
    if (e.target.matches("[data-clear-all]")) clearAllFilters();
  });

  const loadMoreBtn = document.getElementById("load-more-btn");
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      state.visibleCount += PAGE_SIZE;
      renderAll();
    });
  }

  // Mobile filter drawer
  const drawer = document.getElementById("filter-drawer");
  const backdrop = document.getElementById("filter-drawer-backdrop");
  const openBtn = document.getElementById("filter-trigger-mobile");
  const closeBtn = document.getElementById("filter-drawer-close");
  const applyBtn = document.getElementById("filter-drawer-apply");
  if (drawer && backdrop && openBtn) {
    const open = () => {
      drawer.classList.add("open");
      backdrop.classList.add("open");
      document.body.style.overflow = "hidden";
    };
    const close = () => {
      drawer.classList.remove("open");
      backdrop.classList.remove("open");
      document.body.style.overflow = "";
    };
    openBtn.addEventListener("click", open);
    backdrop.addEventListener("click", close);
    if (closeBtn) closeBtn.addEventListener("click", close);
    if (applyBtn) applyBtn.addEventListener("click", close);
  }
}

function applyFilters(bikes) {
  return bikes.filter((b) => {
    // Page-scoped exclusion: bikes flagged for the homepage carousel only
    // (showInInventory === false) are skipped on the full inventory page.
    if (b.showInInventory === false) return false;
    if (state.budget.size && ![...state.budget].some((key) => BUDGET_BANDS[key].test(b.price))) return false;
    if (state.brand.size && !state.brand.has(b.brand)) return false;
    if (state.location.size && !state.location.has(b.location)) return false;
    if (state.ownership.size && !state.ownership.has(b.owner)) return false;
    if (state.status.size && !state.status.has(b.status)) return false;
    if (state.search) {
      const haystack = `${b.brand} ${b.model} ${b.year}`.toLowerCase();
      if (!haystack.includes(state.search)) return false;
    }
    return true;
  });
}

function sortBikes(bikes) {
  const copy = [...bikes];
  switch (state.sort) {
    case "price-low":
      return copy.sort((a, b) => a.price - b.price);
    case "price-high":
      return copy.sort((a, b) => b.price - a.price);
    case "newest":
      return copy.sort((a, b) => b.year - a.year);
    case "km-low":
      return copy.sort((a, b) => a.km - b.km);
    case "featured":
    default:
      return copy.sort((a, b) => (b.featured === a.featured ? 0 : b.featured ? 1 : -1));
  }
}

function renderChips() {
  const wrap = document.getElementById("active-filters");
  if (!wrap) return;
  const chips = [];

  state.budget.forEach((key) =>
    chips.push({ label: BUDGET_BANDS[key].label, group: "budget", value: key })
  );
  state.brand.forEach((v) => chips.push({ label: v, group: "brand", value: v }));
  state.location.forEach((v) => chips.push({ label: v, group: "location", value: v }));
  state.ownership.forEach((v) => chips.push({ label: v, group: "ownership", value: v }));
  if (state.search) chips.push({ label: `"${state.search}"`, group: "search", value: state.search });

  if (!chips.length) {
    wrap.innerHTML = "";
    return;
  }

  wrap.innerHTML =
    chips
      .map(
        (c) => `
      <span class="filter-chip" data-chip-group="${c.group}" data-chip-value="${escapeHTML(c.value)}">
        ${escapeHTML(c.label)}
        <button type="button" aria-label="Remove filter ${escapeHTML(c.label)}">&times;</button>
      </span>`
      )
      .join("") + `<button type="button" class="clear-all-link" data-clear-all>Clear all</button>`;

  wrap.querySelectorAll(".filter-chip button").forEach((btn) => {
    btn.addEventListener("click", () => {
      const chipEl = btn.closest(".filter-chip");
      const group = chipEl.getAttribute("data-chip-group");
      const value = chipEl.getAttribute("data-chip-value");
      if (group === "search") {
        state.search = "";
        const input = document.getElementById("inventory-search");
        if (input) input.value = "";
      } else {
        state[group].delete(value);
        const checkbox = document.querySelector(`input[data-group="${group}"][value="${CSS.escape(value)}"]`);
        if (checkbox) checkbox.checked = false;
      }
      renderAll();
    });
  });
}

function clearAllFilters() {
  state.budget.clear();
  state.brand.clear();
  state.location.clear();
  state.ownership.clear();
  state.search = "";
  const input = document.getElementById("inventory-search");
  if (input) input.value = "";
  document.querySelectorAll("input[data-group='budget'], input[data-group='brand'], input[data-group='location'], input[data-group='ownership']").forEach((el) => (el.checked = false));
  state.visibleCount = PAGE_SIZE;
  renderAll();
}

function syncCheckboxes() {
  document.querySelectorAll("input[data-group]").forEach((el) => {
    const group = el.getAttribute("data-group");
    const set = state[group];
    if (set instanceof Set) {
      el.checked = set.has(el.value);
    }
  });
}

function renderAll() {
  const grid = document.getElementById("inventory-grid");
  if (!grid) return;
  syncCheckboxes();

  const filtered = sortBikes(applyFilters(ALL_BIKES));

  const countEl = document.getElementById("results-count-num");
  if (countEl) countEl.textContent = filtered.length;

  renderChips();

  if (!filtered.length) {
    grid.innerHTML = "";
    document.getElementById("empty-state-inventory")?.classList.remove("hidden-state");
    document.getElementById("load-more-wrap")?.classList.add("hidden-state");
    return;
  }
  document.getElementById("empty-state-inventory")?.classList.add("hidden-state");

  const visible = filtered.slice(0, state.visibleCount);
  
  // Categorize visible bikes based on price if no heavy filters are active
  const isDefaultView = state.budget.size === 0 && state.brand.size === 0 && state.search === "" && state.sort === "featured";
  
  if (isDefaultView) {
      const groupedHTML = [];
      const bands = [
          { key: 'under50', label: 'Starter Bikes (Under ₹50K)' },
          { key: '50to1l', label: 'Everyday Commuters (₹50K – ₹1L)' },
          { key: '1to2l', label: 'Upgrade & Sport (₹1L – ₹2L)' },
          { key: 'premium', label: 'Premium Collection (₹2L+)' }
      ];
      
      bands.forEach(band => {
          const bandBikes = visible.filter(b => BUDGET_BANDS[band.key].test(b.price));
          if (bandBikes.length > 0) {
              groupedHTML.push(`<h2 style="grid-column: 1/-1; margin-top: 1rem; margin-bottom: 0.5rem; border-bottom: 2px solid var(--border-color); padding-bottom: 5px; font-size: 1.5rem; color: var(--primary-color);">${band.label}</h2>`);
              groupedHTML.push(bandBikes.map(bikeCardHTML).join(""));
          }
      });
      grid.innerHTML = groupedHTML.join("");
  } else {
      grid.innerHTML = visible.map(bikeCardHTML).join("");
  }

  const loadMoreWrap = document.getElementById("load-more-wrap");
  if (loadMoreWrap) {
    loadMoreWrap.classList.toggle("hidden-state", visible.length >= filtered.length);
  }
}
