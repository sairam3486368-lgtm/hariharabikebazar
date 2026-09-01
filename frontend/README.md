# Hari Hara Bike Bazar — Website Guide

This guide assumes you are **not** a programmer. Every task below is explained
step by step. If you can rename a file and edit a text file, you can maintain
this website.

---

## 1. What this website is built with

Plain HTML, CSS and JavaScript. No WordPress, no database, no paid hosting
required. All the bike listings live in one simple file:

```
/data/bikes.json
```

You never need to touch the design (HTML/CSS) to add, remove, or update a
bike. You only edit `bikes.json` and add photos.

---

## 2. How to run the website on your own computer

1. Download/copy the whole project folder to your computer.
2. Open the folder.
3. Double-click `index.html` — it opens in your browser.

   Note: some browsers block JavaScript `fetch()` requests when you open a
   file directly (double-click). If bikes don't appear on the homepage, use
   a simple local server instead:
   - If you have VS Code, install the "Live Server" extension, right-click
     `index.html`, and choose "Open with Live Server".
   - Or, if you're comfortable with a terminal: `python3 -m http.server`
     inside the project folder, then visit `http://localhost:8000`.

---

## 3. How to deploy to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com) and sign up/log in.
2. Click **"Add new site" → "Deploy manually"**.
3. Drag and drop the entire project folder onto the upload area.
4. Netlify gives you a live link within a minute (e.g.
   `https://your-site-name.netlify.app`).
5. Optional: connect a custom domain under **Site settings → Domain
   management**.

Every time you make changes, just drag and drop the folder again (or connect
a GitHub repository for automatic deploys — ask your developer to set this up
if you'd like).

---

## 4. How to add a new bike

1. Open `/data/bikes.json` in any text editor (Notepad, VS Code, etc.).
2. Copy one existing bike entry (the text between `{` and `}`), and paste it
   as a new entry — remember to add a comma between entries.
3. Fill in the fields:

```json
{
  "id": "HHBB051",
  "brand": "Royal Enfield",
  "model": "Classic 350",
  "year": 2019,
  "price": 135000,
  "km": 18000,
  "owner": "1st Owner",
  "location": "Kurnool",
  "registration": "AP 21 1234",
  "insurance": "Valid till Mar 2027",
  "category": "cruiser",
  "fuel": "Petrol",
  "condition": "Good",
  "featured": false,
  "newArrival": true,
  "status": "available",
  "images": [
    "images/bikes/HHBB051-1.webp",
    "images/bikes/HHBB051-2.webp",
    "images/bikes/HHBB051-3.webp"
  ],
  "demo": false
}
```

4. Save the file.
5. Deploy again (see Section 3).

**Important:** every bike needs a unique `id` (e.g. `HHBB051`, `HHBB052`...).

---

## 5. How to add bike photos

1. Take clear photos of the bike (front-3/4, side, rear, and any close-ups
   of damage or wear).
2. Rename them using the bike's ID:
   ```
   HHBB051-1.webp
   HHBB051-2.webp
   HHBB051-3.webp
   ```
   (WebP format keeps file sizes small and the site fast. If you only have
   JPG/PNG photos, that's fine too — just update the file extension in
   `bikes.json` to match, e.g. `HHBB051-1.jpg`.)
3. Copy the renamed photos into the `/images/bikes/` folder.
4. In `bikes.json`, update that bike's `"images"` array to list the new
   filenames (see example above).
5. Deploy again.

---

## 6. How to set price, year, or KM driven

Open `/data/bikes.json`, find the bike (search for its `id`), and edit:

- `"price": 135000` — enter the number only, no commas or ₹ symbol.
- `"year": 2019` — the manufacturing/model year.
- `"km": 18000` — kilometres driven, number only.

Save and deploy.

---

## 7. How to mark a bike as Sold or Reserved

Find the bike in `bikes.json` and change the `"status"` field:

- `"status": "available"` — shown normally, all buttons active.
- `"status": "reserved"` — shows a "RESERVED" badge and overlay.
- `"status": "sold"` — shows a "SOLD" badge and overlay, WhatsApp button is
  visually disabled.

---

## 8. How to feature a bike

Set `"featured": true` on that bike in `bikes.json`. Featured bikes appear
in the homepage "Featured Rides" section and get a **FEATURED** badge
everywhere. Set `"newArrival": true` similarly for the **NEW ARRIVAL** badge.

---

## 9. How to change the WhatsApp number

1. Open `/js/config.js`.
2. Find this line:
   ```js
   whatsapp: "",
   ```
3. Enter the number in international format, digits only, no `+` or spaces:
   ```js
   whatsapp: "919999999999",
   ```
4. Save and deploy. Every WhatsApp button on the entire site updates
   automatically — you never need to touch this in more than one place.

---

## 10. How to change the phone number

1. Open `/js/config.js`.
2. Find:
   ```js
   phone: "",
   ```
3. Enter the number with country code:
   ```js
   phone: "+919999999999",
   ```
4. Save and deploy. Every "Call Now" button updates automatically.

---

## 11. How to add a branch

1. Open `/data/branches.json`.
2. Copy an existing branch entry and add a new one:

```json
{
  "id": "branch-3",
  "name": "Hari Hara Bike Bazar — New Branch",
  "address": "Full address here",
  "phone": "",
  "whatsapp": "",
  "maps": "https://maps.google.com/?q=...",
  "demo": false
}
```

3. Save and deploy.

---

## 12. How to update social links

Open `/js/config.js` and fill in:

```js
instagram: "https://instagram.com/yourpage",
youtube: "https://youtube.com/yourchannel",
facebook: "https://facebook.com/yourpage",
```

Leave any of them blank (`""`) to hide that icon in the footer.

---

## 13. How to switch Demo Mode off

The website currently shows a small **"DEMO INVENTORY"** banner and badges
because `bikes.json` contains placeholder/demo data.

Once your real inventory, prices, and photos are added:

1. Open `/js/config.js`.
2. Find:
   ```js
   DEMO_MODE: true,
   ```
3. Change it to:
   ```js
   DEMO_MODE: false,
   ```
4. In `bikes.json`, you can also remove the `"demo": true` line from each
   real bike entry (optional — it's just a marker).
5. Save and deploy. The demo banner and "Demo" badges disappear site-wide.

---

## 14. How to update inventory after the website is live

Same steps as Sections 4–8 above:

1. Edit `/data/bikes.json` (add/update/remove bikes).
2. Add any new photos to `/images/bikes/`.
3. Deploy the updated folder to Netlify (drag-and-drop again, or push to
   GitHub if auto-deploy is set up).

No HTML, CSS, or design changes are ever required for routine inventory
updates — that's the whole point of this structure.

---

## 15. Project structure reference

```
/
  index.html          Homepage
  bikes.html           Full inventory with filters
  bike.html             Individual bike detail (uses ?id=HHBB001 in the URL)
  sell-bike.html       Sell / exchange form
  finance.html          Finance info + EMI calculator
  branches.html        Branch locations
  about.html            About + FAQ
  contact.html          Contact page
  privacy.html          Privacy policy
  terms.html             Terms & disclaimer
  404.html                Not-found page

  /css/
    style.css            Design system + all components
    responsive.css     Breakpoints
    animations.css     Micro-interactions

  /js/
    config.js            <-- Central settings (phone, WhatsApp, social, demo mode)
    main.js               Shared behavior (menu, reveal animations, FAQ, etc.)
    inventory.js         Loads bikes.json, renders bike cards
    filters.js             Powers the Buy Bikes filter/search/sort page
    bike-details.js     Powers the individual bike detail page
    whatsapp.js         Builds WhatsApp messages
    emi.js                  EMI calculator logic

  /data/
    bikes.json            <-- Your inventory (edit this to add/update bikes)
    branches.json       <-- Your branch locations

  /images/
    bikes/                 Bike photos go here
    logo/                   Logo files
    hero/                   Homepage hero graphic

  robots.txt, sitemap.xml, netlify.toml
```

---

## 16. A note on the current placeholder content

Everything currently in `bikes.json` and `branches.json` is **demo data**
generated for development and layout testing. Prices, years, KM, addresses,
and photos are not real. Replace them using the steps above whenever you're
ready — no redesign needed.

---

## 17. Questions?

If anything here is unclear, reach out to whoever built this site with the
specific section number above, and they can walk you through it.
