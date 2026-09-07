/**
 * ============================================================
 * HARI HARA BIKE BAZAR — CENTRAL CONFIGURATION
 * ============================================================
 * Edit the values below to update the ENTIRE website in one place.
 * No other file should need to change for these settings.
 *
 * DEMO_MODE:
 *   true  -> shows a "DEMO INVENTORY" indicator across the site
 *            because bikes.json currently holds placeholder data.
 *   false -> hides the demo indicator. Set this to false once
 *            bikes.json contains real inventory.
 * ============================================================
 */

const CONFIG = {
  businessName: "Hari Hara Bike Bazar",
  tagline: "Quality pre-owned motorcycles for every budget.",

  // --- CONTACT (fill in real numbers, then every button site-wide updates) ---
  phone: "+916305963844",              // e.g. "+919999999999"
  phoneDisplay: "+91 63059 63844",    // displayed on screen
  whatsapp: "9052069191",              // WhatsApp mobile number (9052069191)
  whatsappDisplay: "+91 90520 69191", // displayed on screen
  address: "Kukatpally, Hyderabad, Telangana",
  hours: "Mon – Sun: 9:30 AM – 8:30 PM",

  // --- SOCIAL (leave blank to hide the icon) ---
  instagram: "",
  youtube: "",
  facebook: "",

  // --- MODE ---
  DEMO_MODE: false,

  // --- MISC ---
  currencySymbol: "₹",
  siteUrl: "https://hariharabikebazar.netlify.app",

  // --- API BACKEND ---
  apiUrl: "https://hariharabikebazar.onrender.com/api",

  // Finance defaults for EMI calculator
  finance: {
    defaultInterestRate: 11.5, // annual %
    defaultTenureMonths: 24,
    minDownPaymentPercent: 10
  }
};

// Budget band upper bounds (exclusive). Single source of truth shared by
// filters.js (BUDGET_BANDS) and inventory.js (budgetLabelFor).
const BUDGET_CEILINGS = { under50: 50000, "50to1l": 100000, "1to2l": 200000 };

// Budget bands — one shared definition used by bikes.html filters and the
// homepage "What's your budget?" explorer. Each band knows how to test a
// price and what label to show.
const BUDGET_BANDS = {
  under50: { label: "Under ₹50K", test: (p) => p < BUDGET_CEILINGS.under50 },
  "50to1l": { label: "₹50K – ₹1L", test: (p) => p >= BUDGET_CEILINGS.under50 && p < BUDGET_CEILINGS["50to1l"] },
  "1to2l": { label: "₹1L – ₹2L", test: (p) => p >= BUDGET_CEILINGS["50to1l"] && p < BUDGET_CEILINGS["1to2l"] },
  premium: { label: "Premium (₹2L+)", test: (p) => p >= BUDGET_CEILINGS["1to2l"] },
};

// The 4 clickable cards on the homepage budget explorer. `key` maps to a
// BUDGET_BANDS entry so clicking a card shows bikes in that price band.
const BUDGET_CARDS = [
  { key: "under50", label: "Starter", range: "Under ₹50K" },
  { key: "50to1l", label: "Everyday", range: "₹50K – ₹1L" },
  { key: "1to2l", label: "Upgrade", range: "₹1L – ₹2L" },
  { key: "premium", label: "Premium", range: "₹2L & Above" },
];

// Helper: format a number as Indian Rupees, e.g. 145000 -> "₹1,45,000"
function formatINR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "Price on request";
  const num = Math.round(amount);
  const str = num.toString();
  const lastThree = str.substring(str.length - 3);
  const otherNumbers = str.substring(0, str.length - 3);
  const formatted =
    otherNumbers !== ""
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree
      : lastThree;
  return CONFIG.currencySymbol + formatted;
}

// Helper: build a WhatsApp click-to-chat URL with a prefilled message
function buildWhatsAppUrl(message) {
  let number = String(CONFIG.whatsapp || "").replace(/\D/g, "");
  if (number.length === 10) {
    number = "91" + number;
  }
  if (!number) return "#";
  if (message && String(message).trim()) {
    const encoded = encodeURIComponent(String(message).trim());
    return `https://wa.me/${number}?text=${encoded}`;
  }
  return `https://wa.me/${number}`;
}

// Helper: build a tel: link
function buildTelUrl() {
  const phone = String(CONFIG.phone || "").replace(/[^\d+]/g, "");
  return phone ? `tel:${phone}` : "#";
}

// Helper: consistent chevron/arrow SVG for carousels and galleries.
// Pass a CHEVRON path constant; strokeWidth defaults to 2, size (px) is optional.
const CHEVRON = {
  left: "M15 18l-6-6 6-6",
  right: "M9 6l6 6-6 6",
  rightAlt: "M9 18l6-6-6-6",
};
function chevronSVG(d, strokeWidth = 2, size = "") {
  const sizeAttr = size ? ` width="${size}" height="${size}"` : "";
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${strokeWidth}"${sizeAttr}><path d="${d}"/></svg>`;
}
