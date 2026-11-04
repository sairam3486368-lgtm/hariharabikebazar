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
  setupDiwaliPopup();
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
   DIWALI FIRECRACKERS ENGINE: 100-WALA, ROCKETS & SPARKS
   (Renders EXCLUSIVELY outside the popup with zero overlap)
   ============================================================ */
class Ladi100Wala {
  constructor(x, y, count = 34) {
    this.x = x;
    this.y = y;
    this.count = count;
    this.crackers = [];
    this.currentIndex = 0;
    this.isBurntOut = false;
    this.nextPopTime = 0;
    this.init();
  }

  init() {
    this.crackers = [];
    this.currentIndex = 0;
    this.isBurntOut = false;
    this.nextPopTime = Date.now() + 50 + Math.random() * 50;
    const spacing = 7.5;
    for (let i = 0; i < this.count; i++) {
      this.crackers.push({
        y: this.y + i * spacing,
        side: i % 2 === 0 ? -1 : 1,
        exploded: false
      });
    }
  }

  update(now, onPop) {
    if (this.isBurntOut) return;

    if (now >= this.nextPopTime && this.currentIndex < this.count) {
      const c = this.crackers[this.currentIndex];
      c.exploded = true;
      const blastX = this.x + c.side * 10;
      const blastY = c.y;

      if (onPop) onPop(blastX, blastY);

      this.currentIndex++;
      // Authentic rapid-fire cadence: 60ms to 95ms
      this.nextPopTime = now + 10 + Math.random() * 10;

      if (this.currentIndex >= this.count) {
        this.isBurntOut = true;
        setTimeout(() => this.init(), 350 + Math.random() * 200);
      }
    }
  }

  draw(ctx) {
    ctx.save();

    // Festive Badge: "100 WALA"
    ctx.fillStyle = '#b91c1c';
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.5;
    ctx.fillRect(this.x - 24, this.y - 26, 48, 18);
    ctx.strokeRect(this.x - 24, this.y - 26, 48, 18);

    ctx.fillStyle = '#fffae0';
    ctx.font = 'bold 8.5px "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('💥 100 WALA', this.x, this.y - 17);

    // Central braided twine string
    ctx.beginPath();
    ctx.moveTo(this.x, this.y - 8);
    const lastY = this.y + this.count * 7.5;
    ctx.lineTo(this.x, lastY);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Sizzling burning fuse spark at active burning position
    if (!this.isBurntOut && this.currentIndex < this.count) {
      const curY = this.crackers[this.currentIndex].y;
      ctx.beginPath();
      ctx.arc(this.x, curY, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#ffea00';
      ctx.shadowColor = '#ff6d00';
      ctx.shadowBlur = 12;
      ctx.fill();
    }

    // Individual red paper crackers
    for (let i = 0; i < this.count; i++) {
      const c = this.crackers[i];
      const cx = this.x + (c.side === -1 ? -16 : 3);
      const cy = c.y - 3;
      if (c.exploded) {
        // Charred ash paper remnant
        ctx.fillStyle = '#374151';
        ctx.fillRect(cx, cy, 13, 5);
      } else {
        // Red firecracker body with gold fuse band
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(cx, cy, 13, 5);
        ctx.fillStyle = '#facc15';
        ctx.fillRect(cx + 4, cy, 5, 5);
      }
    }

    ctx.restore();
  }
}

class RocketCracker {
  constructor(startX, startY, targetX, targetY, color) {
    this.x = startX;
    this.y = startY;
    this.targetY = targetY;
    this.color = color;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    this.speed = 32.0 + Math.random() * 8.0;
    this.vx = (dx / dist) * this.speed;
    this.vy = (dy / dist) * this.speed;
    this.angle = Math.atan2(dy, dx);
    this.exploded = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += 0.14; // rapid deceleration at lightning speed
    if (this.y <= this.targetY || this.vy >= 0) {
      this.exploded = true;
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle + Math.PI / 2);

    // Bamboo stick
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 34);
    ctx.strokeStyle = '#c29d62';
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // Red rocket cylinder body
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-4, -18, 8, 18);

    // Gold decorative stripe
    ctx.fillStyle = '#ffd700';
    ctx.fillRect(-4, -11, 8, 4);

    // Conical pointed nose cone
    ctx.beginPath();
    ctx.moveTo(-5, -18);
    ctx.lineTo(0, -28);
    ctx.lineTo(5, -18);
    ctx.closePath();
    ctx.fillStyle = '#ffd700';
    ctx.fill();

    // Sizzling exhaust flame jet
    ctx.beginPath();
    ctx.moveTo(-3, 0);
    ctx.lineTo(0, 9 + Math.random() * 7);
    ctx.lineTo(3, 0);
    ctx.closePath();
    ctx.fillStyle = '#ffea00';
    ctx.shadowColor = '#ff6d00';
    ctx.shadowBlur = 12;
    ctx.fill();

    ctx.restore();
  }
}

class DiwaliCrackers {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    this.particles = [];
    this.rockets = [];
    this.paperFlakes = [];
    this.ladis = [];
    this.isRunning = false;
    this.animId = null;
    this.rocketTimer = null;
    this.resize = this.resize.bind(this);
    this.loop = this.loop.bind(this);
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.setupLadis();
  }

  setupLadis() {
    this.ladis = [];
    const modalEl = document.querySelector('.diwali-modal-wrapper');
    const mr = modalEl ? modalEl.getBoundingClientRect() : null;

    // Left 100-Wala in the left margin outside the modal
    const leftX = mr && mr.left > 80 ? Math.max(45, mr.left * 0.45) : 38;
    this.ladis.push(new Ladi100Wala(leftX, 85, 34));

    // Right 100-Wala if right margin has enough space
    if (mr && (this.canvas.width - mr.right) > 80) {
      const rightX = mr.right + (this.canvas.width - mr.right) * 0.55;
      this.ladis.push(new Ladi100Wala(rightX, 95, 34));
    }
  }

  start() {
    if (!this.canvas || !this.ctx || this.isRunning) return;
    this.isRunning = true;
    this.resize();
    window.addEventListener('resize', this.resize);

    // Lightning-fast initial Rocket launches in the side margins
    this.launchSideRocket();
    setTimeout(() => this.isRunning && this.launchSideRocket(), 80);
    setTimeout(() => this.isRunning && this.launchSideRocket(), 200);

    // Continuous ultra-fast rocket launches with twin side bursts
    this.rocketTimer = setInterval(() => {
      if (!this.isRunning) return;
      this.launchSideRocket();
      if (Math.random() > 0.35) {
        setTimeout(() => this.isRunning && this.launchSideRocket(), 120);
      }
    }, 280);

    this.loop();
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    if (this.rocketTimer) {
      clearInterval(this.rocketTimer);
      this.rocketTimer = null;
    }
    window.removeEventListener('resize', this.resize);
    this.particles = [];
    this.rockets = [];
    this.paperFlakes = [];
    this.ladis = [];
    if (this.ctx && this.canvas) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  launchSideRocket() {
    const modalEl = document.querySelector('.diwali-modal-wrapper');
    const mr = modalEl ? modalEl.getBoundingClientRect() : null;
    const isLeft = Math.random() > 0.5;

    let startX, targetX, targetY;
    if (mr && mr.left > 120 && isLeft) {
      startX = 40 + Math.random() * (mr.left - 60);
      targetX = startX + (Math.random() - 0.5) * 80;
      targetY = 60 + Math.random() * (this.canvas.height * 0.35);
    } else if (mr && (this.canvas.width - mr.right) > 120 && !isLeft) {
      startX = mr.right + 20 + Math.random() * (this.canvas.width - mr.right - 50);
      targetX = startX + (Math.random() - 0.5) * 80;
      targetY = 60 + Math.random() * (this.canvas.height * 0.35);
    } else {
      startX = this.canvas.width * (isLeft ? 0.12 : 0.88);
      targetX = startX + (Math.random() - 0.5) * 60;
      targetY = 50 + Math.random() * 120;
    }

    const startY = this.canvas.height + 20;
    const colors = ['#ffd700', '#ff1744', '#ff9100', '#00e676', '#ffea00', '#d500f9', '#00e5ff', '#ffffff'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    this.rockets.push(new RocketCracker(startX, startY, targetX, targetY, color));
  }

  explodeRocket(x, y, color) {
    const count = 65 + Math.floor(Math.random() * 30);
    const palette = [color, '#ffffff', '#ffe57f', '#ff9100'];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.35;
      const speed = 6.5 + Math.random() * 12.0;
      const pColor = palette[Math.floor(Math.random() * palette.length)];
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: 0.034 + Math.random() * 0.025,
        gravity: 0.22,
        color: pColor,
        size: 2.2 + Math.random() * 2,
        sparkle: Math.random() > 0.35
      });
    }
  }

  popLadiCracker(x, y) {
    // 100-wala bright spark burst
    for (let i = 0; i < 9; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4.2 + Math.random() * 8.5;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        alpha: 1,
        decay: 0.075 + Math.random() * 0.04,
        gravity: 0.16,
        color: Math.random() > 0.3 ? '#ffea00' : '#ffffff',
        size: 1.8 + Math.random() * 1.5,
        sparkle: true
      });
    }

    // Shredded red paper flakes flying out
    for (let i = 0; i < 3; i++) {
      this.paperFlakes.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 15,
        vy: -5.0 - Math.random() * 6.0,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.25,
        size: 3 + Math.random() * 3,
        color: Math.random() > 0.2 ? '#dc2626' : '#facc15',
        alpha: 1,
        decay: 0.040 + Math.random() * 0.025
      });
    }
  }

  loop() {
    if (!this.isRunning) return;
    this.animId = requestAnimationFrame(this.loop);
    const now = Date.now();

    // Modal isolation: get the modal's bounding box
    const modalEl = document.querySelector('.diwali-modal-wrapper');
    const mr = modalEl ? modalEl.getBoundingClientRect() : null;

    // Fade trail
    this.ctx.globalCompositeOperation = 'destination-out';
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // CRUCIAL: Clip out the modal area so ZERO pixels are ever drawn inside or over the image popup!
    if (mr) {
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.rect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.rect(mr.left - 2, mr.top - 2, mr.width + 4, mr.height + 4);
      this.ctx.clip('evenodd');
    }

    // Draw & update 100-Wala Ladis
    for (const ladi of this.ladis) {
      ladi.update(now, (bx, by) => this.popLadiCracker(bx, by));
      ladi.draw(this.ctx);
    }

    this.ctx.globalCompositeOperation = 'lighter';

    // Update & draw Rockets
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.update();
      r.draw(this.ctx);
      if (r.exploded) {
        this.explodeRocket(r.x, r.y, r.color);
        this.rockets.splice(i, 1);
      }
    }

    // Update & draw Sparks
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.96;
      p.alpha -= p.decay;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.beginPath();
      const currentSize = p.sparkle && Math.random() > 0.5 ? p.size * 1.5 : p.size;
      this.ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = p.color;
      this.ctx.shadowBlur = 6;
      this.ctx.fill();
      this.ctx.restore();
    }

    // Update & draw Shredded Red Paper Flakes
    this.ctx.globalCompositeOperation = 'source-over';
    for (let i = this.paperFlakes.length - 1; i >= 0; i--) {
      const pf = this.paperFlakes[i];
      pf.x += pf.vx;
      pf.y += pf.vy;
      pf.vy += 0.15; // flutter down
      pf.vx *= 0.98;
      pf.rot += pf.vRot;
      pf.alpha -= pf.decay;

      if (pf.alpha <= 0 || pf.y > this.canvas.height) {
        this.paperFlakes.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = pf.alpha;
      this.ctx.translate(pf.x, pf.y);
      this.ctx.rotate(pf.rot);
      this.ctx.fillStyle = pf.color;
      this.ctx.fillRect(-pf.size / 2, -pf.size / 2, pf.size, pf.size * 0.7);
      this.ctx.restore();
    }

    // Restore clip
    if (mr) {
      this.ctx.restore();
    }
  }
}

/* ============================================================
   DIWALI FESTIVAL MEGA BIKE MELA POPUP
   ============================================================ */
function setupDiwaliPopup() {
  if (window.location.pathname.includes('/admin/')) return;
  if (document.getElementById('diwali-popup-modal') || document.getElementById('dasara-popup-modal')) return;

  const defaultMsg = (typeof waMessageForDiwali === 'function')
    ? waMessageForDiwali()
    : `Hi ${CONFIG.businessName}, I saw your Diwali Mega Bike Mela festival offer (5 Litres Free Petrol & Exchange Bonus up to ₹5,000)! Please share available bikes.`;

  const waMainUrl = buildWhatsAppUrl(defaultMsg);
  const waBookUrl = (typeof waMessageForDiwali === 'function')
    ? buildWhatsAppUrl(waMessageForDiwali(null, 'book'))
    : waMainUrl;

  // Determine correct relative image path & catalog link
  const isHtmlSubdir = window.location.pathname.includes('/html/');
  const imagePath = isHtmlSubdir ? '../images/diwali-mega-mela.jpg' : 'images/diwali-mega-mela.jpg';
  const fallbackPath = isHtmlSubdir ? 'images/diwali-mega-mela.jpg' : '../images/diwali-mega-mela.jpg';
  const bikesCatalogUrl = isHtmlSubdir ? 'bikes.html' : 'frontend/html/bikes.html';

  // 6 Featured Offer Bikes matching the reference design exactly
  const featuredOfferBikes = [
    { name: "Classic 350", brand: "Royal Enfield", price: "₹1,48,000", year: "2018" },
    { name: "Pulsar 220F", brand: "Bajaj", price: "₹1,25,000", year: "2024" },
    { name: "Access 125", brand: "Suzuki", price: "₹89,000", year: "2024" },
    { name: "Raider 125", brand: "TVS", price: "₹89,000", year: "2024" },
    { name: "Duke 250", brand: "KTM", price: "₹2,40,000", year: "2025" },
    { name: "Jupiter", brand: "TVS", price: "₹48,000", year: "2018" }
  ];

  function getBikeWaUrl(b) {
    const bikeTitle = `${b.brand} ${b.name} (${b.year})`;
    const msg = (typeof waMessageForDiwali === 'function')
      ? waMessageForDiwali(bikeTitle)
      : `Hi ${CONFIG.businessName}, I am interested in the Diwali Offer on ${bikeTitle} priced at ${b.price}.`;
    return buildWhatsAppUrl(msg);
  }

  const bikeUrls = featuredOfferBikes.map(b => ({
    name: b.name,
    price: b.price,
    url: getBikeWaUrl(b)
  }));

  const popupHtml = `
    <div id="diwali-popup-modal" class="diwali-modal-backdrop dasara-modal-backdrop" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Diwali Mega Bike Mela Offers">
      <!-- Fullscreen Festive Firecrackers Canvas -->
      <canvas id="diwaliCrackersCanvas" class="diwali-crackers-canvas"></canvas>

      <div class="diwali-modal-wrapper dasara-modal-wrapper">
        <div class="diwali-modal-scrollable dasara-modal-scrollable">
          <div class="diwali-interactive-container">
            <img src="${imagePath}" onerror="if(!this.dataset.tried){this.dataset.tried='1';this.src='${fallbackPath}';}" alt="Diwali Mega Bike Mela - Hari Hara Bike Bazar" class="diwali-banner-img dasara-banner-img" id="diwaliBannerImg" loading="eager">

            <!-- Clickable Interactive Hotspots aligned with reference artwork -->
            <!-- 1. SINGLE Close button hotspot directly over drawn red X -->
            <button type="button" class="diwali-hotspot hotspot-close" id="diwaliHotspotClose" style="top: 2.2%; left: 86.6%; width: 8.8%; height: 9.8%;" aria-label="Close Diwali Offer Pop-up" title="Close Pop-up"></button>

            <!-- 2. Arch 'Claim on WhatsApp' button -->
            <a href="${waMainUrl}" target="_blank" rel="noopener" class="diwali-hotspot hotspot-pill" style="top: 30.5%; left: 65.5%; width: 22.0%; height: 4.5%;" title="Claim Offer on WhatsApp" aria-label="Claim Offer on WhatsApp"></a>

            <!-- 3. Arch 'Explore Offers' button -->
            <a href="${bikesCatalogUrl}" class="diwali-hotspot hotspot-pill" style="top: 35.5%; left: 68.8%; width: 15.6%; height: 4.5%;" title="Explore All Offers" aria-label="Explore All Offers"></a>

            <!-- 4. Arch 'BOOK YOUR RIDE NOW' banner -->
            <a href="${waBookUrl}" target="_blank" rel="noopener" class="diwali-hotspot hotspot-pill" style="top: 40.8%; left: 37.0%; width: 24.5%; height: 5.0%;" title="Book Your Ride Now on WhatsApp" aria-label="Book Your Ride Now"></a>

            <!-- 5. Six Bike Cards (Tap to chat about that bike) -->
            <a href="${bikeUrls[0].url}" target="_blank" rel="noopener" class="diwali-hotspot hotspot-card" style="top: 44.8%; left: 9.6%; width: 12.5%; height: 16.5%;" title="Enquire ${bikeUrls[0].name} (${bikeUrls[0].price}) on WhatsApp" aria-label="${bikeUrls[0].name}"></a>
            <a href="${bikeUrls[1].url}" target="_blank" rel="noopener" class="diwali-hotspot hotspot-card" style="top: 44.8%; left: 22.9%; width: 12.5%; height: 16.5%;" title="Enquire ${bikeUrls[1].name} (${bikeUrls[1].price}) on WhatsApp" aria-label="${bikeUrls[1].name}"></a>
            <a href="${bikeUrls[2].url}" target="_blank" rel="noopener" class="diwali-hotspot hotspot-card" style="top: 44.8%; left: 36.3%; width: 12.5%; height: 16.5%;" title="Enquire ${bikeUrls[2].name} (${bikeUrls[2].price}) on WhatsApp" aria-label="${bikeUrls[2].name}"></a>
            <a href="${bikeUrls[3].url}" target="_blank" rel="noopener" class="diwali-hotspot hotspot-card" style="top: 44.8%; left: 49.7%; width: 12.5%; height: 16.5%;" title="Enquire ${bikeUrls[3].name} (${bikeUrls[3].price}) on WhatsApp" aria-label="${bikeUrls[3].name}"></a>
            <a href="${bikeUrls[4].url}" target="_blank" rel="noopener" class="diwali-hotspot hotspot-card" style="top: 44.8%; left: 63.1%; width: 12.5%; height: 16.5%;" title="Enquire ${bikeUrls[4].name} (${bikeUrls[4].price}) on WhatsApp" aria-label="${bikeUrls[4].name}"></a>
            <a href="${bikeUrls[5].url}" target="_blank" rel="noopener" class="diwali-hotspot hotspot-card" style="top: 44.8%; left: 76.5%; width: 12.5%; height: 16.5%;" title="Enquire ${bikeUrls[5].name} (${bikeUrls[5].price}) on WhatsApp" aria-label="${bikeUrls[5].name}"></a>

            <!-- 6. Six Direct Bike Enquiry Chips -->
            <a href="${bikeUrls[0].url}" target="_blank" rel="noopener" class="diwali-hotspot hotspot-pill" style="top: 71.8%; left: 5.4%; width: 22.0%; height: 4.4%;" title="Enquire ${bikeUrls[0].name} on WhatsApp" aria-label="${bikeUrls[0].name} Enquiry"></a>
            <a href="${bikeUrls[1].url}" target="_blank" rel="noopener" class="diwali-hotspot hotspot-pill" style="top: 71.8%; left: 28.8%; width: 22.5%; height: 4.4%;" title="Enquire ${bikeUrls[1].name} on WhatsApp" aria-label="${bikeUrls[1].name} Enquiry"></a>
            <a href="${bikeUrls[2].url}" target="_blank" rel="noopener" class="diwali-hotspot hotspot-pill" style="top: 71.8%; left: 52.7%; width: 21.0%; height: 4.4%;" title="Enquire ${bikeUrls[2].name} on WhatsApp" aria-label="${bikeUrls[2].name} Enquiry"></a>
            <a href="${bikeUrls[3].url}" target="_blank" rel="noopener" class="diwali-hotspot hotspot-pill" style="top: 71.8%; left: 74.7%; width: 21.0%; height: 4.4%;" title="Enquire ${bikeUrls[3].name} on WhatsApp" aria-label="${bikeUrls[3].name} Enquiry"></a>
            <a href="${bikeUrls[4].url}" target="_blank" rel="noopener" class="diwali-hotspot hotspot-pill" style="top: 77.1%; left: 29.8%; width: 22.4%; height: 4.4%;" title="Enquire ${bikeUrls[4].name} on WhatsApp" aria-label="${bikeUrls[4].name} Enquiry"></a>
            <a href="${bikeUrls[5].url}" target="_blank" rel="noopener" class="diwali-hotspot hotspot-pill" style="top: 77.1%; left: 53.7%; width: 19.5%; height: 4.4%;" title="Enquire ${bikeUrls[5].name} on WhatsApp" aria-label="${bikeUrls[5].name} Enquiry"></a>

            <!-- 7. Main Green Bottom CTA: 'Claim Offer on WhatsApp' -->
            <a href="${waMainUrl}" target="_blank" rel="noopener" class="diwali-hotspot hotspot-pill" style="top: 83.3%; left: 26.5%; width: 47.2%; height: 6.8%;" title="Claim Diwali Festival Offer on WhatsApp" aria-label="Claim Offer on WhatsApp"></a>
          </div>
        </div>
      </div>
    </div>
    <button type="button" id="diwali-floating-trigger" class="diwali-floating-pill dasara-floating-pill" title="View Diwali Mega Mela Offers">
      <span class="diwali-pill-icon dasara-pill-icon">🪔</span>
      <span class="diwali-pill-text dasara-pill-text">Diwali Offers</span>
    </button>
  `;

  document.body.insertAdjacentHTML('beforeend', popupHtml);

  const modal = document.getElementById('diwali-popup-modal');
  const hotspotClose = document.getElementById('diwaliHotspotClose');
  const floatingTrigger = document.getElementById('diwali-floating-trigger');
  const canvas = document.getElementById('diwaliCrackersCanvas');
  const crackers = canvas ? new DiwaliCrackers(canvas) : null;

  function openModal() {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (crackers) crackers.start();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    sessionStorage.setItem('hhbb_diwali_popup_dismissed', 'true');
    sessionStorage.setItem('hhbb_dasara_popup_dismissed', 'true');
    if (crackers) crackers.stop();
    if (floatingTrigger) {
      floatingTrigger.classList.add('visible');
    }
  }

  if (hotspotClose) {
    hotspotClose.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      closeModal();
    });
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target === canvas) {
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
  const isDismissed = sessionStorage.getItem('hhbb_diwali_popup_dismissed') === 'true';
  if (!isDismissed) {
    setTimeout(openModal, 100);
  } else {
    if (floatingTrigger) {
      floatingTrigger.classList.add('visible');
    }
  }
}

// Backward compatibility alias
function setupDasaraPopup() {
  setupDiwaliPopup();
}
