/**
 * bike-details.js — powers bike.html?id=HHBB001
 */

let currentBike = null;
let currentImageIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("bike-detail-root");
  if (!root) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  loadBikes()
    .then((bikes) => {
      const bike = bikes.find((b) => b.id === id);
      if (!bike) {
        renderNotFound();
        return;
      }
      currentBike = bike;
      renderBikeDetail(bike);
      renderSimilarBikes(bikes, bike);
      document.title = `${bike.brand} ${bike.model} (${bike.year}) — ${CONFIG.businessName}`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute(
          "content",
          `${bike.brand} ${bike.model}, ${bike.year}, ${bike.km.toLocaleString("en-IN")} km, ${formatINR(bike.price)}. View details and contact ${CONFIG.businessName}.`
        );
      }
    })
    .catch(() => renderNotFound(true));

  setupTestRideForm();
});

function renderNotFound(loadError) {
  document.getElementById("bike-detail-root").innerHTML = `
    <div class="empty-state">
      <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M9 9h.01M15 9h.01M8 15c1.5 1.3 3 1.3 4.5 1.3S15.5 16.3 17 15"/></svg>
      <h3>${loadError ? "We couldn't load this bike right now." : "This bike listing wasn't found."}</h3>
      <p>It may have been sold, removed, or the link may be incorrect.</p>
      <div class="empty-actions">
        <a class="btn btn-primary" href="bikes.html">Browse All Bikes</a>
        <a class="btn btn-whatsapp" data-whatsapp-link href="https://wa.me/919052069191" target="_blank" rel="noopener">WhatsApp Us (+91 90520 69191)</a>
      </div>
    </div>`;
  applyConfigToDOM();
}

function renderBikeDetail(bike) {
  const root = document.getElementById("bike-detail-root");
  const disabled = bike.status === "sold";

  const waMsg = waMessageForBike(bike);
  const waUrl = buildWhatsAppUrl(waMsg);

  root.innerHTML = `
    <div class="bike-detail-grid">
      <div class="gallery-block">
        <div class="gallery-main${bike.images && bike.images[0] ? "" : " no-image"}">
          ${bike.images && bike.images[0] ? `<img id="gallery-main-img" src="${resolveImageSrc(bike.images[0])}" alt="${bike.brand} ${bike.model} photo 1">` : ""}
          <button class="gallery-nav-btn prev" id="gallery-prev" aria-label="Previous photo">
            ${chevronSVG(CHEVRON.left, 2, 18)}
          </button>
          <button class="gallery-nav-btn next" id="gallery-next" aria-label="Next photo">
            ${chevronSVG(CHEVRON.rightAlt, 2, 18)}
          </button>
        </div>
        <div class="gallery-thumbs" id="gallery-thumbs">
          ${(bike.images || [])
            .map(
              (img, i) =>
                `<img src="${resolveImageSrc(img)}" data-index="${i}" class="${i === 0 ? "active" : ""}" alt="${bike.brand} ${bike.model} thumbnail ${i + 1}">`
            )
            .join("")}
        </div>
      </div>

      <div class="detail-info">
        <div class="detail-badges">${renderBadges(bike)}</div>
        <h1>${bike.brand} ${bike.model}</h1>
        <p class="detail-id">Location: ${bike.location}</p>
        <p class="detail-price">${formatINR(bike.price)}</p>

        <div class="spec-grid">
          <div class="spec-item"><div class="k">Year</div><div class="v">${bike.year}</div></div>
          <div class="spec-item"><div class="k">KM Driven</div><div class="v">${bike.km.toLocaleString("en-IN")} km</div></div>
          <div class="spec-item"><div class="k">Ownership</div><div class="v">${bike.owner}</div></div>
        </div>

        <div class="detail-ctas">
          <a class="btn btn-dark" href="${buildTelUrl()}" ${!CONFIG.phone ? "aria-disabled='true'" : ""}>Call Now</a>
          <a class="btn btn-whatsapp" href="${waUrl}" target="_blank" rel="noopener" ${disabled ? "aria-disabled='true'" : ""}>WhatsApp</a>
          <a class="btn btn-outline" href="#test-ride">Book Test Ride</a>
        </div>
        ${disabled ? `<p class="form-disclaimer">This bike has been sold. Browse similar available bikes below.</p>` : ""}
      </div>
    </div>

    <div class="detail-section">
      <h2>Overview</h2>
      <p class="section-sub mt-0">${bike.brand} ${bike.model} (${bike.year}), ${bike.condition} condition, ${bike.km.toLocaleString("en-IN")} km driven, ${bike.owner.toLowerCase()}. Located at our ${bike.location} branch.${CONFIG.DEMO_MODE ? " This listing currently shows demo/placeholder details for development purposes." : ""}</p>
    </div>


    <div class="detail-section" id="test-ride">
      <h2>Book a Test Ride</h2>
      <form id="test-ride-form" class="form-card" novalidate style="margin-top:20px; max-width:560px;">
        <div class="form-row">
          <div class="form-field">
            <label for="tr-name">Name</label>
            <input type="text" id="tr-name" required>
            <p class="error-msg">Please enter your name.</p>
          </div>
        </div>
        <div class="form-row two-col">
          <div class="form-field">
            <label for="tr-mobile">Mobile Number</label>
            <input type="tel" id="tr-mobile" required pattern="[0-9]{10}" maxlength="10">
            <p class="error-msg">Please enter a valid 10-digit mobile number.</p>
          </div>
          <div class="form-field">
            <label for="tr-date">Preferred Date</label>
            <input type="date" id="tr-date" required>
            <p class="error-msg">Please choose a date.</p>
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label for="tr-location">Preferred Location</label>
            <input type="text" id="tr-location" placeholder="e.g. ${bike.location}" required>
            <p class="error-msg">Please enter a location.</p>
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block">Send Test Ride Request via WhatsApp</button>
        <p class="form-disclaimer">This opens WhatsApp with your details pre-filled — nothing is submitted automatically.</p>
      </form>
    </div>

    <div class="detail-section">
      <h2>Similar Bikes</h2>
      <div class="bike-grid" id="similar-bikes-grid"></div>
    </div>
  `;

  applyConfigToDOM();
  setupGallery(bike);

  // Sticky mobile CTA
  const stickyBar = document.getElementById("sticky-mobile-cta");
  if (stickyBar) {
    document.body.classList.add("has-sticky-cta");
    stickyBar.classList.add("active");
    stickyBar.innerHTML = `
      <a class="btn btn-dark" href="${buildTelUrl()}">Call</a>
      <a class="btn btn-whatsapp" href="${waUrl}" target="_blank" rel="noopener">WhatsApp</a>
      <a class="btn btn-outline" href="#test-ride">Test Ride</a>
    `;
  }
}

function setupGallery(bike) {
  const mainImg = document.getElementById("gallery-main-img");
  const thumbs = document.querySelectorAll("#gallery-thumbs img");
  const prevBtn = document.getElementById("gallery-prev");
  const nextBtn = document.getElementById("gallery-next");
  currentImageIndex = 0;

  function show(index) {
    currentImageIndex = (index + bike.images.length) % bike.images.length;
    mainImg.src = bike.images[currentImageIndex];
    thumbs.forEach((t, i) => t.classList.toggle("active", i === currentImageIndex));
  }

  thumbs.forEach((t) => t.addEventListener("click", () => show(parseInt(t.dataset.index, 10))));
  if (prevBtn) prevBtn.addEventListener("click", () => show(currentImageIndex - 1));
  if (nextBtn) nextBtn.addEventListener("click", () => show(currentImageIndex + 1));
}

function renderSimilarBikes(bikes, current) {
  const grid = document.getElementById("similar-bikes-grid");
  if (!grid) return;
  const similar = bikes
    .filter((b) => b.id !== current.id && b.status !== "sold" && (b.brand === current.brand || budgetLabelFor(b.price) === budgetLabelFor(current.price)))
    .slice(0, 4);
  grid.innerHTML = similar.length
    ? similar.map(bikeCardHTML).join("")
    : `<p class="section-sub mt-0">No similar bikes available right now. <a href="bikes.html" style="color:var(--red); font-weight:700;">Browse all bikes</a>.</p>`;
}

function setupTestRideForm() {
  document.body.addEventListener("submit", (e) => {
    if (e.target.id !== "test-ride-form") return;
    e.preventDefault();
    const form = e.target;
    let valid = true;
    const fields = [
      { id: "tr-name" },
      { id: "tr-mobile", pattern: /^[0-9]{10}$/ },
      { id: "tr-date" },
      { id: "tr-location" },
    ];
    fields.forEach(({ id, pattern }) => {
      const input = document.getElementById(id);
      const field = input.closest(".form-field");
      const ok = pattern ? pattern.test(input.value.trim()) : input.value.trim().length > 0;
      field.classList.toggle("has-error", !ok);
      if (!ok) valid = false;
    });
    if (!valid) return;

    const data = {
      name: document.getElementById("tr-name").value.trim(),
      mobile: document.getElementById("tr-mobile").value.trim(),
      date: document.getElementById("tr-date").value,
      location: document.getElementById("tr-location").value.trim(),
      bike: currentBike ? `${currentBike.brand} ${currentBike.model} (${currentBike.id})` : "General enquiry",
    };
    openWhatsApp(waMessageForTestRide(data));
    showToast("Opening WhatsApp with your test ride request…");
    form.reset();
  });
}
