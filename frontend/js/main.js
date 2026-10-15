/**
 * main.js — shared behavior across every page.
 * Handles: mobile menu, demo banner, config-driven contact links,
 * scroll reveal animations, FAQ accordions, and the footer year.
 */

document.addEventListener("DOMContentLoaded", () => {
  applyConfigToDOM();
  setupMobileMenu();
  setupDemoBanner();
  setupScrollReveal();
  setupFaqAccordions();
  setupFooterYear();
  setupHeaderShadowOnScroll();
  setupDasaraPopup();
});

/* Push CONFIG values (phone/whatsapp/social) into every element that
   opts in via data-attributes, so editing config.js updates the whole site. */
function applyConfigToDOM() {
  document.querySelectorAll("[data-call-link]").forEach((el) => {
    el.href = buildTelUrl();
    if (!CONFIG.phone) {
      el.setAttribute("aria-disabled", "true");
    }
  });

  document.querySelectorAll("[data-whatsapp-link]").forEach((el) => {
    const customMsg = el.getAttribute("data-wa-message");
    const message =
      customMsg ||
      `Hi ${CONFIG.businessName}, I'd like to know more about your bikes.`;
    el.href = buildWhatsAppUrl(message);
  });

  document.querySelectorAll("[data-phone-display]").forEach((el) => {
    el.textContent = CONFIG.phoneDisplay || CONFIG.phone || "+91 63059 63844";
  });

  document.querySelectorAll("[data-whatsapp-display]").forEach((el) => {
    el.textContent = CONFIG.whatsappDisplay || CONFIG.whatsapp || "+91 83283 81851";
  });

  document.querySelectorAll("[data-contact-address]").forEach((el) => {
    if (CONFIG.address) el.textContent = CONFIG.address;
  });

  document.querySelectorAll("[data-contact-hours]").forEach((el) => {
    if (CONFIG.hours) el.textContent = CONFIG.hours;
  });

  // Social links — hide icon if URL not configured
  const socialMap = {
    "[data-social='instagram']": CONFIG.instagram,
    "[data-social='youtube']": CONFIG.youtube,
    "[data-social='facebook']": CONFIG.facebook,
  };
  Object.entries(socialMap).forEach(([selector, url]) => {
    document.querySelectorAll(selector).forEach((el) => {
      if (url) {
        el.href = url;
      } else {
        el.style.display = "none";
      }
    });
  });

  document.querySelectorAll("[data-business-name]").forEach((el) => {
    el.textContent = CONFIG.businessName;
  });
}

function setupDemoBanner() {
  const banners = document.querySelectorAll("[data-demo-banner]");
  banners.forEach((b) => {
    b.style.display = CONFIG.DEMO_MODE ? "block" : "none";
  });
  document.querySelectorAll("[data-demo-only]").forEach((el) => {
    if (!CONFIG.DEMO_MODE) el.style.display = "none";
  });
}

function setupMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");
  if (!toggle || !menu) return;

  const close = () => {
    toggle.classList.remove("open");
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };
  const open = () => {
    toggle.classList.add("open");
    menu.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  toggle.addEventListener("click", () => {
    menu.classList.contains("open") ? close() : open();
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", close));
  const closeBtn = menu.querySelector(".mobile-menu-close");
  if (closeBtn) closeBtn.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function setupScrollReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;
  if (!("IntersectionObserver" in window)) {
    items.forEach((i) => i.classList.add("in-view"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  items.forEach((i) => observer.observe(i));
}

function setupFaqAccordions() {
  document.querySelectorAll(".faq-item").forEach((item) => {
    const q = item.querySelector(".faq-question");
    const a = item.querySelector(".faq-answer");
    if (!q || !a) return;
    q.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      item.closest(".faq-list").querySelectorAll(".faq-item").forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".faq-answer").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });
}

function setupFooterYear() {
  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}

function setupHeaderShadowOnScroll() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  window.addEventListener(
    "scroll",
    () => {
      header.style.boxShadow = window.scrollY > 8 ? "var(--shadow-sm)" : "none";
    },
    { passive: true }
  );
}

/* Simple toast helper used by forms across pages */
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 3200);
}

/* ============================================================
   DASARA FESTIVAL MEGA BIKE MELA POPUP
   ============================================================ */
function setupDasaraPopup() {
  if (window.location.pathname.includes('/admin/')) return;
  if (document.getElementById('dasara-popup-modal')) return;

  const defaultMsg = (typeof waMessageForDasara === 'function')
    ? waMessageForDasara()
    : `Hi ${CONFIG.businessName}, I saw your Dasara Mega Bike Mela festival offer (5 Litres Free Petrol & Exchange Bonus up to ₹5,000)! Please share available bikes.`;

  const waMainUrl = buildWhatsAppUrl(defaultMsg);

  // Determine correct relative image path
  const isHtmlSubdir = window.location.pathname.includes('/html/');
  const imagePath = isHtmlSubdir ? '../images/dasara-mega-mela.jpg' : 'images/dasara-mega-mela.jpg';
  const fallbackPath = isHtmlSubdir ? 'images/dasara-mega-mela.jpg' : '../images/dasara-mega-mela.jpg';

  // Real bikes from Hari Hara Bike Bazar for quick direct enquiry chips
  const featuredOfferBikes = [
    { name: "Classic 350", brand: "Royal Enfield", price: "₹1,48,000", year: "2018" },
    { name: "Pulsar 220F", brand: "Bajaj", price: "₹1,25,000", year: "2024" },
    { name: "Access 125", brand: "Suzuki", price: "₹89,000", year: "2024" },
    { name: "Raider 125", brand: "TVS", price: "₹89,000", year: "2024" },
    { name: "Duke 250", brand: "KTM", price: "₹2,40,000", year: "2025" },
    { name: "Jupiter", brand: "TVS", price: "₹48,000", year: "2018" }
  ];

  const bikeChipsHtml = featuredOfferBikes.map(b => {
    const bikeTitle = `${b.brand} ${b.name} (${b.year})`;
    const chipMsg = (typeof waMessageForDasara === 'function')
      ? waMessageForDasara(bikeTitle)
      : `Hi ${CONFIG.businessName}, I am interested in the Dasara Offer on ${bikeTitle} priced at ${b.price}.`;
    const chipUrl = buildWhatsAppUrl(chipMsg);
    return `<a href="${chipUrl}" target="_blank" rel="noopener" class="dasara-chip-btn" title="Enquire ${b.name} on WhatsApp">
      <span>🏍️ ${b.name}</span>
      <span class="chip-price">${b.price}</span>
    </a>`;
  }).join("");

  const popupHtml = `
    <div id="dasara-popup-modal" class="dasara-modal-backdrop" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Dasara Mega Bike Mela Offers">
      <div class="dasara-modal-wrapper">
        <button type="button" class="dasara-modal-close" id="dasaraPopupClose" aria-label="Close Dasara Offer Pop-up">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="22" height="22">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div class="dasara-modal-scrollable">
          <a href="${waMainUrl}" target="_blank" rel="noopener" class="dasara-image-link" id="dasaraPopupImageLink" title="Click anywhere to claim Dasara Offers on WhatsApp">
            <img src="${imagePath}" onerror="if(!this.dataset.tried){this.dataset.tried='1';this.src='${fallbackPath}';}" alt="Dasara Mega Bike Mela - Hari Hara Bike Bazar" class="dasara-banner-img" id="dasaraBannerImg" loading="eager">
          </a>
          <div class="dasara-modal-footer">
            <div class="dasara-footer-badges">
              <span class="dasara-badge">🪔 5 Litres Petrol Free (BS4)</span>
              <span class="dasara-badge">🎁 Exchange Bonus up to ₹5,000</span>
              <span class="dasara-badge">⚡ Low Down Payment</span>
            </div>
            <p class="dasara-bike-chips-title">🔥 Direct Bike Enquiries (Tap to chat):</p>
            <div class="dasara-bike-chips">
              ${bikeChipsHtml}
            </div>
            <div class="dasara-action-row">
              <a href="${waMainUrl}" target="_blank" rel="noopener" class="dasara-action-btn" id="dasaraMainCtaBtn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12.004 2c-5.514 0-9.996 4.478-9.996 9.999 0 1.762.463 3.486 1.34 5.003L2 22l5.115-1.341a9.965 9.965 0 0 0 4.888 1.28h.005c5.514 0 9.996-4.478 9.996-10 0-2.671-1.04-5.18-2.929-7.069A9.935 9.935 0 0 0 12.004 2zm0 18.164h-.004a8.16 8.16 0 0 1-4.166-1.14l-.299-.177-3.037.797.81-2.96-.194-.304a8.156 8.156 0 0 1-1.256-4.38c0-4.507 3.667-8.174 8.15-8.174a8.1 8.1 0 0 1 5.766 2.393 8.106 8.106 0 0 1 2.385 5.783c0 4.508-3.669 8.162-8.155 8.162z"/>
                </svg>
                <span>Claim Offer on WhatsApp</span>
              </a>
            </div>
            <p class="dasara-tap-hint">👉 Tap image anywhere to open WhatsApp with Dasara Offers</p>
          </div>
        </div>
      </div>
    </div>
    <button type="button" id="dasara-floating-trigger" class="dasara-floating-pill" title="View Dasara Mega Mela Offers">
      <span class="dasara-pill-icon">🪔</span>
      <span class="dasara-pill-text">Dasara Offers</span>
    </button>
  `;

  document.body.insertAdjacentHTML('beforeend', popupHtml);

  const modal = document.getElementById('dasara-popup-modal');
  const closeBtn = document.getElementById('dasaraPopupClose');
  const floatingTrigger = document.getElementById('dasara-floating-trigger');

  function openModal() {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    sessionStorage.setItem('hhbb_dasara_popup_dismissed', 'true');
    if (floatingTrigger) {
      floatingTrigger.classList.add('visible');
    }
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (floatingTrigger) {
    floatingTrigger.addEventListener('click', () => {
      openModal();
    });
  }

  // Show popup automatically on load if not dismissed
  const isDismissed = sessionStorage.getItem('hhbb_dasara_popup_dismissed') === 'true';
  if (!isDismissed) {
    setTimeout(openModal, 600);
  } else {
    if (floatingTrigger) {
      floatingTrigger.classList.add('visible');
    }
  }
}
