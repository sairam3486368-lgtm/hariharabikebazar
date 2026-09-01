/**
 * whatsapp.js — centralized WhatsApp lead-message builders.
 * Every flow (bike enquiry, test ride, sell-your-bike) funnels through here
 * so the message format stays consistent and easy to change in one place.
 */

function waMessageForBike(bike) {
  const url = `${CONFIG.siteUrl}/bike.html?id=${bike.id}`;
  return (
    `Hi ${CONFIG.businessName}, I'm interested in this bike:\n\n` +
    `Bike: ${bike.brand} ${bike.model}\n` +
    `Price: ${formatINR(bike.price)}\n` +
    `Page: ${url}\n\n` +
    `Please share availability and more details.`
  );
}

function waMessageForTestRide(data) {
  return (
    `Hi ${CONFIG.businessName}, I'd like to book a test ride.\n\n` +
    `Name: ${data.name}\n` +
    `Mobile: ${data.mobile}\n` +
    `Bike: ${data.bike}\n` +
    `Preferred Date: ${data.date}\n` +
    `Location: ${data.location}`
  );
}

function waMessageForSell(data) {
  return (
    `Hi ${CONFIG.businessName}, I'd like to sell my bike.\n\n` +
    `Name: ${data.name}\n` +
    `Phone: ${data.phone}\n` +
    `Brand: ${data.brand}\n` +
    `Model: ${data.model}\n` +
    `Year: ${data.year}\n` +
    `KM Driven: ${data.km}\n` +
    `Ownership: ${data.ownership}\n` +
    `Location: ${data.location}\n` +
    `Expected Price: ${data.expectedPrice}`
  );
}

function openWhatsApp(message) {
  window.open(buildWhatsAppUrl(message), "_blank", "noopener");
}
