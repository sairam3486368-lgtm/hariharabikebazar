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
    el.textContent = CONFIG.phone || CONFIG.phoneDisplay;
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
