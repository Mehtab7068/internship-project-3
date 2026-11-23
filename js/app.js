/*
 * Velora customer website
 *
 * The page is loaded through hash links such as #destinations.
 * JavaScript reads the hash, chooses a page renderer, and updates #app.
 */

import { destinations, packages, hotels, flights } from "./data.js";

// Find one HTML element by CSS selector.
const findElement = selector => document.querySelector(selector);

// Convert text to safe HTML before placing it inside a template.
const escapeHtml = text => String(text ?? "").replace(
  /[&<>"']/g,
  character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[character]
);

// Format numbers consistently as US dollars.
const formatMoney = amount =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(amount);

function getTodayDateString() {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().slice(0, 10);
}

// Read and write JSON values in browser localStorage.
function readFromStorage(key, fallbackValue) {
  try {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : fallbackValue;
  } catch (error) {
    return fallbackValue;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Friendly short names are kept for the existing page templates.
const $ = findElement;
const esc = escapeHtml;
const money = formatMoney;
const read = readFromStorage;
const write = saveToStorage;

// ------------------------------
// Demo data setup
// ------------------------------

function initializeDemoData() {
  if (!read("velora_users", null)) write("velora_users", [
    { id: "u1", name: "Elena Rossi", email: "customer@velora.com", phone: "+44 20 7946 0182", password: "Customer123!", role: "customer", status: "Active" },
    { id: "u2", name: "Marcus Chen", email: "marcus@example.com", phone: "+1 415 555 0185", password: "Demo123!", role: "customer", status: "Active" }
  ]);
  if (!read("velora_destinations", null)) write("velora_destinations", destinations);
  if (!read("velora_packages", null)) write("velora_packages", packages);
  if (!read("velora_hotels", null)) write("velora_hotels", hotels);
  if (!read("velora_flights", null)) write("velora_flights", flights);
  if (!read("velora_bookings", null)) write("velora_bookings", [
    { id: "VEL-2841", type: "Tour", destination: "Amalfi Coast", date: "2026-10-12", travelDate: "2026-12-05", price: 2480, status: "Confirmed", userId: "u1" },
    { id: "VEL-1918", type: "Hotel", destination: "Aegean White", date: "2026-08-20", travelDate: "2026-09-14", price: 560, status: "Completed", userId: "u1" }
  ]);
  if (!read("velora_reviews", null)) write("velora_reviews", [
    { id: "r1", name: "Elena R.", rating: 5, itemId: "d1", comment: "Everything felt considered, unhurried and deeply local.", date: "2026-09-12" },
    { id: "r2", name: "Marcus C.", rating: 5, itemId: "p1", comment: "The private boat day was unforgettable.", date: "2026-08-28" }
  ]);
  if (!read("velora_wishlist", null)) write("velora_wishlist", []);
}
initializeDemoData();

const getDest = () => read("velora_destinations", destinations).map(destination => {
  if (typeof destination.duration === "string" && destination.duration.trim()) {
    return destination;
  }
  const seedDestination = destinations.find(item => item.id === destination.id);
  return {
    ...destination,
    duration: seedDestination?.duration || "5 days"
  };
});
const getPkgs = () => read("velora_packages", packages);
const getHotels = () => read("velora_hotels", hotels).map(hotel => {
  if (hotel.price) return hotel;
  const firstRoom = hotel.rooms?.[0];
  return {
    ...hotel,
    price: firstRoom?.price || 300
  };
});
const getUser = () => {
  const rememberedUser = read("velora_current_user", null);
  if (rememberedUser) return rememberedUser;

  try {
    const sessionValue = sessionStorage.getItem("velora_session_user");
    return sessionValue ? JSON.parse(sessionValue) : null;
  } catch {
    return null;
  }
};
function setUser(user, remember = false) {
  localStorage.removeItem("velora_current_user");
  sessionStorage.removeItem("velora_session_user");

  if (!user) return;

  if (remember) {
    write("velora_current_user", user);
  } else {
    sessionStorage.setItem("velora_session_user", JSON.stringify(user));
  }
}

function toast(message) { const el = document.createElement("div"); el.className = "toast"; el.textContent = message; $("#toast-region").append(el); setTimeout(() => el.remove(), 3000) }
function icons() { if (window.lucide) lucide.createIcons({ attrs: { strokeWidth: 1.7 } }) }
function nav() {
  const u = getUser();
  const currentRoute = (location.hash || "#home").split("?")[0].slice(1);
  const isDestination = ["destinations", "destination"].includes(currentRoute);
  const isPackage = ["packages", "package", "itinerary"].includes(currentRoute);
  const isHotel = ["hotels", "hotel"].includes(currentRoute);
  const isFlight = currentRoute === "flights";
  const isGallery = currentRoute === "gallery";
  return `<header class="nav" id="nav"><div class="nav-inner">
    <a class="brand" href="#home"><span class="brand-mark"><i data-lucide="compass"></i></span>VELORA</a>
    <nav class="nav-links"><a class="${isDestination ? "active" : ""}" href="#destinations">Destinations</a><a class="${isPackage ? "active" : ""}" href="#packages">Journeys</a><a class="${isHotel ? "active" : ""}" href="#hotels">Hotels</a><a class="${isFlight ? "active" : ""}" href="#flights">Flights</a><a class="${isGallery ? "active" : ""}" href="#gallery">Gallery</a></nav>
    <div class="nav-actions">${u ? `<a class="icon-btn" href="#dashboard" title="Account"><i data-lucide="circle-user-round"></i></a><button class="icon-btn" id="logout" title="Log out"><i data-lucide="log-out"></i></button>` : `<a class="icon-btn" href="#login" title="Sign in"><i data-lucide="user"></i></a>`}<button class="menu-btn" id="menu"><i data-lucide="menu"></i></button></div>
  </div></header>`;
}
function footer() { return `<footer class="footer"><div class="shell"><div class="footer-grid"><div class="footer-brand"><div class="brand"><span class="brand-mark"><i data-lucide="compass"></i></span>VELORA</div><p>Extraordinary places, thoughtfully explored.</p></div><div><h4>Discover</h4><a href="#destinations">Destinations</a><a href="#packages">Journeys</a><a href="#hotels">Hotels</a></div><div><h4>Company</h4><a href="#contact">Contact</a><a href="#gallery">Journal</a><a href="./admin/">Admin</a></div><div><h4>Support</h4><a href="#contact">Help center</a><a href="#my-bookings">My bookings</a></div></div><div class="footer-bottom"><span>© 2026 Velora Travel</span><span>Frontend travel demonstration</span></div></div></footer>` }
function wishlist(id) { const list = read("velora_wishlist", []); return list.includes(id) }
function toggleWish(id) { const u = getUser(); if (!u) { location.hash = "#login"; toast("Sign in to save journeys"); return } let list = read("velora_wishlist", []); list = list.includes(id) ? list.filter(x => x !== id) : [...list, id]; write("velora_wishlist", list); toast(list.includes(id) ? "Saved to your wishlist" : "Removed from wishlist"); render() }

function home() {
  const ds = getDest();
  return `${nav()}<main>
  <section class="hero"><div class="shell hero-content"><div class="eyebrow">The 2026 collection</div><h1>Go where life feels expansive.</h1><p>Thoughtfully curated stays and journeys for travelers seeking something beyond the ordinary.</p><div class="quick-search" aria-label="Popular searches"><button type="button" data-quick-search="coastal">Coastal escapes</button><button type="button" data-quick-search="under2000">Under $2,000</button><button type="button" data-quick-search="summer">Summer journeys</button></div></div>
  <form class="search-bar" id="hero-search">
    <div class="search-field"><label>Explore</label><select name="type" id="global-search-type"><option value="destinations">Destinations</option><option value="packages">Journeys</option><option value="hotels">Hotels</option><option value="flights">Flights</option></select></div>
    <div class="search-field"><label>Where</label><input name="where" id="global-search-where" placeholder="Country or destination"></div>
    <div class="search-field"><label>Check in</label><input name="in" type="date"></div>
    <div class="search-field"><label>Check out</label><input name="out" type="date"></div>
    <div class="search-field"><label>Travelers</label><select name="guests"><option>2 guests</option><option>1 guest</option><option>3 guests</option><option>4 guests</option></select></div>
    <button class="btn btn-primary" aria-label="Search"><i data-lucide="search"></i></button>
  </form></section>
  <section class="section"><div class="shell"><div class="section-head"><div><div class="eyebrow" style="color:var(--accent)">Places worth the journey</div><h2>Featured destinations</h2></div><a class="text-link" href="#destinations">View all destinations</a></div><div class="dest-grid">${ds.slice(0, 5).map(d => `<article class="destination-card" data-route="#destination?id=${d.id}"><img src="${d.image}" alt="${esc(d.name)}"><button class="heart-btn ${wishlist(d.id) ? "active" : ""}" data-wish="${d.id}" aria-label="Save ${esc(d.name)}"><i data-lucide="heart"></i></button><div class="destination-copy"><span>${esc(d.country)} · ${d.duration}</span><h3>${esc(d.name)}</h3></div></article>`).join("")}</div></div></section>
  <section class="section" style="padding-top:20px"><div class="shell"><div class="section-head"><div><div class="eyebrow" style="color:var(--accent)">Curated departures</div><h2>Journeys to remember</h2></div><a class="text-link" href="#packages">Explore all journeys</a></div><div class="package-row">${getPkgs().slice(0, 3).map(p => packageCard(p)).join("")}</div></div></section>
  <section class="editorial"><div class="editorial-grid"><img class="editorial-image" src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1400&q=88" alt="A quiet mountain lake"><div class="editorial-copy"><div class="eyebrow">The Velora difference</div><h2>Travel at your own pace.</h2><p>We create the rare kind of trip that feels effortless: deeply researched, personally hosted and shaped around how you actually want to spend your time.</p><div class="feature-list"><div><strong>24/7</strong>Trip support</div><div><strong>48 hrs</strong>Local planning</div><div><strong>100%</strong>Flexible ideas</div></div><a class="btn btn-light" style="width:max-content;margin-top:34px" href="#packages">Find your journey</a></div></div></section>
  <section class="section"><div class="shell"><div class="section-head"><div><div class="eyebrow" style="color:var(--accent)">The season's edit</div><h2>Where to go next</h2></div></div><div class="collections"><article class="collection"><img src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85" alt="Desert road"><div class="collection-copy"><span>Collection · 6 journeys</span><h3>Wild horizons</h3><a class="text-link" href="#packages">Explore collection</a></div></article><article class="collection"><img src="https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=85" alt="Historic Italian coastline"><div class="collection-copy"><span>Collection · 8 journeys</span><h3>Old-world cities</h3><a class="text-link" href="#packages">Explore collection</a></div></article></div></div></section>
  <section class="section" style="padding-top:20px"><div class="shell testimonial-grid"><div><div class="eyebrow" style="color:var(--accent)">Traveler stories</div><p class="quote">“Velora turned a complicated family trip into the easiest, most meaningful journey we've ever taken.”</p><div class="quote-author">Sofia &amp; Daniel Martin<span>Amalfi Coast, June 2026</span></div></div><div class="gallery-strip"><img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=700&q=85" alt="Traveler in nature"><img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=700&q=85" alt="Mountain landscape"><img src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=85" alt="Desert landscape"></div></div></section>
  <section class="newsletter"><div class="shell newsletter-inner"><div><div class="eyebrow" style="color:var(--accent)">Postcards from elsewhere</div><h2>Ideas for your next escape.</h2></div><form id="newsletter"><input type="email" required placeholder="Email address" aria-label="Email address"><button class="btn btn-primary" type="submit">Subscribe</button></form></div></section></main>${footer()}`;
}

function packageCard(p) { return `<article class="card"><div class="card-image"><a href="#package?id=${p.id}" aria-label="View ${esc(p.name)}"><img src="${p.image}" alt="${esc(p.name)}"></a><button type="button" class="heart-btn ${wishlist(p.id) ? "active" : ""}" data-wish="${p.id}" aria-label="Save ${esc(p.name)}"><i data-lucide="heart"></i></button><span class="card-badge">Free cancellation</span></div><div class="card-body"><div class="card-meta"><span>${esc(p.destination)} · ${p.duration} days</span><span>★ ${p.rating} · 12 reviews</span></div><a href="#package?id=${p.id}"><h3>${esc(p.name)}</h3></a><div class="card-trust"><span><i data-lucide="shield-check"></i> Local expert</span><span><i data-lucide="calendar-check"></i> Flexible dates</span></div><div class="price">${money(p.price)} <span>per person · no booking fees</span></div></div></article>` }

function destinationsPage() {
  const savedSearch = sessionStorage.getItem("velora_search") || "";
  const savedStyle = sessionStorage.getItem("velora_destination_style") || "";
  sessionStorage.removeItem("velora_search");
  return `${nav()}<main><header class="page-hero"><div class="shell"><div class="eyebrow">The world, well considered</div><h1>Find your place.</h1><p>Distinctive landscapes and local stories, selected for depth rather than distance.</p></div></header><div class="shell"><form class="filter-bar" id="destination-filters"><input id="dest-search" value="${esc(savedSearch)}" placeholder="Search destinations"><select id="country-filter"><option value="">All countries</option>${[...new Set(getDest().map(d => d.country))].map(c => `<option>${c}</option>`).join("")}</select><select id="category-filter"><option value="">All styles</option>${["Coastal", "Culture", "Adventure", "Island"].map(style => `<option ${savedStyle === style ? "selected" : ""}>${style}</option>`).join("")}</select><select id="sort-dest"><option value="popular">Popular</option><option value="price">Lowest price</option><option value="rating">Top rated</option></select></form><div id="dest-results" class="grid-list">${getDest().map(d => destinationCard(d)).join("")}</div></div></main>${footer()}`
}
function destinationCard(d) { return `<article class="card"><div class="card-image"><a href="#destination?id=${d.id}" aria-label="View ${esc(d.name)}"><img src="${d.image}" alt="${esc(d.name)}"></a><button type="button" class="heart-btn ${wishlist(d.id) ? "active" : ""}" data-wish="${d.id}" aria-label="Save ${esc(d.name)}"><i data-lucide="heart"></i></button><span class="card-badge">${esc(d.category)}</span></div><div class="card-body"><div class="card-meta"><span>${esc(d.country)} · ${esc(d.duration)}</span><span>★ ${d.rating} · verified</span></div><a href="#destination?id=${d.id}"><h3>${esc(d.name)}</h3></a><p style="color:var(--muted);font-size:13px">${esc(d.description)}</p><div class="price">From ${money(d.price)} <span>/ person · best for ${esc(d.category.toLowerCase())} travel</span></div></div></article>` }

function packagesPage() {
  const savedSearch = sessionStorage.getItem("velora_search") || "";
  const savedStyle = sessionStorage.getItem("velora_package_style") || "";
  sessionStorage.removeItem("velora_search");
  return `${nav()}<main><header class="page-hero alt"><div class="shell"><div class="eyebrow">Signature journeys</div><h1>Travel, beautifully arranged.</h1><p>Small-group and private itineraries with the freedom to make each day your own.</p></div></header><section class="section" style="padding-top:70px"><div class="shell listing-layout"><aside class="filters"><fieldset class="filter-group"><legend>Journey style</legend>${["Coastal", "Culture", "Adventure", "Island"].map(v => `<label class="check-row"><input type="checkbox" name="package-category" value="${v}" ${savedStyle === v ? "checked" : ""}>${v}</label>`).join("")}</fieldset><fieldset class="filter-group"><legend>Duration</legend><label class="check-row"><input type="checkbox" name="duration" value="short">Up to 5 days</label><label class="check-row"><input type="checkbox" name="duration" value="medium">6–7 days</label><label class="check-row"><input type="checkbox" name="duration" value="long">8+ days</label></fieldset></aside><div><div class="list-toolbar"><input id="package-search" value="${esc(savedSearch)}" placeholder="Search journeys" style="height:40px;border:1px solid var(--line);padding:0 10px;border-radius:4px"><select id="package-sort"><option value="popular">Most popular</option><option value="price-low">Lowest price</option><option value="price-high">Highest price</option></select></div><div class="grid-list" id="package-results">${getPkgs().map(packageCard).join("")}</div></div></div></section></main>${footer()}`
}

function detailPage(type, id) {
  if (type === "destination") {
    const d = getDest().find(x => x.id === id) || getDest()[0]; const reviews = read("velora_reviews", []).filter(r => r.itemId === d.id); const highlights = Array.isArray(d.highlights) && d.highlights.length ? d.highlights : [d.category || "Local culture", "Signature landscapes", "Exceptional hospitality"]; const best = d.best || "Most of the year, depending on local weather"; return `${nav()}<main><div class="details-hero"><img src="${d.image}" alt="${esc(d.name)}"><div class="shell details-title"><div class="eyebrow">${esc(d.country)}</div><h1>${esc(d.name)}</h1><span>★ ${d.rating} · ${d.duration} · from ${money(d.price)}</span></div></div><div class="shell details-grid"><div class="content-panel"><h2>An extraordinary corner of ${esc(d.country)}</h2><p>${esc(d.description)}</p><h2>Why go</h2><div class="feature-list" style="color:var(--charcoal);grid-template-columns:repeat(3,1fr)">${highlights.map(h => `<div style="border-top:1px solid var(--line)"><strong>${esc(h)}</strong>Curated local experience</div>`).join("")}</div><h2>Best time to visit</h2><p>${esc(best)} is typically the finest season for weather and local life.</p><h2>Traveler reviews</h2>${reviews.length ? reviews.map(r => `<article class="card" style="padding:18px;margin:10px 0"><div class="stars">${"★".repeat(r.rating)}</div><b>${esc(r.name)}</b><p>${esc(r.comment)}</p></article>`).join("") : `<p>No reviews yet.</p>`}<button class="btn btn-outline" data-review="${d.id}">Write a review</button></div><aside><div class="booking-card"><div class="eyebrow" style="color:var(--accent)">Plan this journey</div><h3 style="font:28px var(--serif)">Start in ${esc(d.name)}</h3><div class="form"><label>Travel month</label><input type="month"><label>Travelers</label><select><option>2 travelers</option><option>1 traveler</option><option>3 travelers</option><option>4 travelers</option></select><button class="btn btn-primary" data-enquire="${d.name}">Request availability</button></div></div></aside></div></main>${footer()}`
  }
  const p = getPkgs().find(x => x.id === id) || getPkgs()[0];
  return `${nav()}<main><div class="details-hero"><img src="${p.image}" alt="${esc(p.name)}"><div class="shell details-title"><div class="eyebrow">${esc(p.destination)} · ${p.duration} days</div><h1>${esc(p.name)}</h1><span>★ ${p.rating} · 12 verified reviews · Local expert</span></div></div><div class="shell details-grid"><div class="content-panel"><h2>Journey overview</h2><p>${esc(p.description)}</p><h2>Your day-by-day itinerary</h2><div class="timeline">${p.itinerary.map((x, i) => `<div class="timeline-item"><span class="eyebrow" style="color:var(--accent)">Day ${i + 1}</span><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p></div>`).join("")}</div><h2>Included</h2><div class="form-row">${p.included.map(x => `<div>✓ ${esc(x)}</div>`).join("")}</div><h2>Not included</h2><div class="form-row">${p.excluded.map(x => `<div>— ${esc(x)}</div>`).join("")}</div></div><aside><div class="booking-card"><div class="booking-progress"><span class="active">1. Dates</span><span>2. Review</span><span>3. Confirm</span></div><div class="price" style="font:32px var(--serif">${money(p.price)} <span>per person</span></div><div class="form"><label>Departure date</label><input type="date" id="package-date"><label>Travelers</label><select id="package-guests"><option value="2">2 travelers</option><option value="1">1 traveler</option><option value="3">3 travelers</option><option value="4">4 travelers</option></select><div class="booking-summary" id="package-summary"><div><span>Package</span><b>${money(p.price)} × 2</b></div><div><span>Demo booking fees</span><b>$0</b></div><div class="booking-total"><span>Estimated total</span><b>${money(p.price * 2)}</b></div></div><button class="btn btn-primary" id="book-package" data-id="${p.id}">Review & reserve</button><small style="display:block;text-align:center;color:var(--muted);margin-top:10px">Free cancellation · No real payment</small></div></div></aside></div></main>${footer()}`
}

function hotelsPage() {
  const savedSearch = sessionStorage.getItem("velora_search") || "";
  const checkIn = sessionStorage.getItem("velora_hotel_checkin") || "";
  const checkOut = sessionStorage.getItem("velora_hotel_checkout") || "";
  const guests = sessionStorage.getItem("velora_hotel_guests") || "";
  const rooms = sessionStorage.getItem("velora_hotel_rooms") || "";
  sessionStorage.removeItem("velora_search");
  sessionStorage.removeItem("velora_hotel_checkin");
  sessionStorage.removeItem("velora_hotel_checkout");
  sessionStorage.removeItem("velora_hotel_guests");
  sessionStorage.removeItem("velora_hotel_rooms");
  return `${nav()}<main><header class="page-hero alt"><div class="shell"><div class="eyebrow">Exceptional stays</div><h1>Sleep somewhere special.</h1><p>Characterful hotels, restorative retreats and remarkable rooms around the world.</p></div></header><section class="section" style="padding-top:70px"><div class="shell listing-layout"><aside class="filters"><fieldset class="filter-group"><legend>Star rating</legend>${[5, 4].map(n => `<label class="check-row"><input type="checkbox" name="stars" value="${n}">${n} stars</label>`).join("")}</fieldset><fieldset class="filter-group"><legend>Amenities</legend>${["Pool", "Spa", "Restaurant", "Breakfast"].map(v => `<label class="check-row"><input type="checkbox" name="amenity" value="${v}">${v}</label>`).join("")}</fieldset></aside><div><div class="list-toolbar"><input id="hotel-search" value="${esc(savedSearch)}" placeholder="Search hotels or destinations" style="height:40px;border:1px solid var(--line);padding:0 10px;border-radius:4px"><input id="hotel-list-checkin" type="date" value="${esc(checkIn)}" aria-label="Check in"><input id="hotel-list-checkout" type="date" value="${esc(checkOut)}" aria-label="Check out"><select id="hotel-list-guests" aria-label="Guests">${["1 guest", "2 guests", "3 guests", "4 guests"].map(value => `<option ${guests === value ? "selected" : ""}>${value}</option>`).join("")}</select><select id="hotel-list-rooms" aria-label="Rooms">${["1 room", "2 rooms", "3 rooms"].map(value => `<option ${rooms === value ? "selected" : ""}>${value}</option>`).join("")}</select><select id="hotel-sort"><option value="rating">Top rated</option><option value="low">Lowest price</option></select></div><div class="grid-list" id="hotel-results">${getHotels().map(h => hotelCard(h)).join("")}</div></div></div></section></main>${footer()}`
}
function hotelCard(h) { return `<article class="card"><a href="#hotel?id=${h.id}"><div class="card-image"><img src="${h.image}" alt="${esc(h.name)}"><span class="card-badge">Free cancellation</span></div><div class="card-body"><div class="card-meta"><span>${esc(h.destination)} · ${h.stars} star</span><span>★ ${h.rating} · guest favorite</span></div><h3>${esc(h.name)}</h3><p style="color:var(--muted);font-size:13px">${esc(h.amenities.slice(0, 3).join(" · "))}</p><div class="price">${money(h.price)} <span>per night · taxes included</span></div></div></a></article>` }
function hotelDetail(id) {
  const h = getHotels().find(x => x.id === id) || getHotels()[0]; return `${nav()}<main><div class="details-hero"><img src="${h.image}" alt="${esc(h.name)}"><div class="shell details-title"><div class="eyebrow">${esc(h.destination)} · ${h.stars} star</div><h1>${esc(h.name)}</h1><span>★ ${h.rating} · ${esc(h.property)}</span></div></div><div class="shell details-grid"><div class="content-panel"><h2>A remarkable place to stay</h2><p>${esc(h.description)}</p><h2>Available rooms</h2>${h.rooms.map((r, i) => `<div class="card" style="padding:18px;margin:12px 0;display:flex;justify-content:space-between;align-items:center"><div><b>${esc(r.name)}</b><div style="color:var(--muted);font-size:13px">Up to ${r.capacity} guests</div></div><div class="price">${money(r.price)} <span>/ night</span></div></div>`).join("")}<h2>Amenities</h2><div class="form-row">${h.amenities.map(a => `<div>✓ ${esc(a)}</div>`).join("")}</div></div><aside><div class="booking-card"><div class="price" style="font:28px var(--serif">${money(h.price)} <span>per night</span></div><div class="form"><label>Check in</label><input type="date" id="hotel-in"><label>Check out</label><input type="date" id="hotel-out"><label>Guests</label><select id="hotel-guests"><option>2 guests</option><option>1 guest</option><option>3 guests</option><option>4 guests</option></select><label>Room</label><select id="hotel-room">${h.rooms.map(r => `<option value="${r.name}">${esc(r.name)}</option>`).join("")}</select><button class="btn btn-primary" id="book-hotel" data-id="${h.id}">Reserve room</button></div></div></aside></div></main>${footer()}`
}

function flightsPage() {
  let flightSearch = null;
  try {
    flightSearch = JSON.parse(sessionStorage.getItem("velora_flight_search") || "null");
  } catch {
    flightSearch = null;
  }
  const from = flightSearch?.from || "London";
  const to = flightSearch?.to || "Rome";
  const departure = flightSearch?.departure || "";
  const storedReturnDate = flightSearch?.returnDate || "";
  const tripType = flightSearch?.tripType || (flightSearch ? (storedReturnDate ? "round" : "one") : "round");
  const returnDate = tripType === "round" ? storedReturnDate : "";
  const savedPassengerCount = Number(flightSearch?.passengers) || Number.parseInt(flightSearch?.travelers, 10) || 1;
  const passengerOptions = [1, 2, 3, 4].map(count =>
    `<option value="${count}" ${savedPassengerCount === count ? "selected" : ""}>${count} passenger${count === 1 ? "" : "s"}</option>`
  ).join("");
  return `${nav()}<main><header class="page-hero"><div class="shell"><div class="eyebrow">Air travel</div><h1>Take the next step.</h1><p>Compare sample routes and reserve a demo itinerary.</p></div></header><section class="section" style="padding-top:70px"><div class="shell"><form class="filter-bar" id="flight-search"><select id="trip-type" name="trip" aria-label="Trip type"><option value="round" ${tripType === "round" ? "selected" : ""}>Round trip</option><option value="one" ${tripType === "one" ? "selected" : ""}>One way</option></select><input id="flight-from" placeholder="From" value="${esc(from)}" aria-label="From" required><button type="button" class="icon-btn" id="swap-flights" style="color:var(--forest);border-color:var(--line);background:white" aria-label="Swap origin and destination"><i data-lucide="arrow-right-left"></i></button><input id="flight-to" placeholder="To" value="${esc(to)}" aria-label="To" required><input id="flight-depart" type="date" value="${esc(departure)}" aria-label="Departure date" required><input id="flight-return" type="date" value="${esc(returnDate)}" aria-label="Return date" ${tripType === "round" ? "required" : ""} ${tripType === "one" ? "disabled" : ""}><select id="flight-passengers" aria-label="Passengers">${passengerOptions}</select><button class="btn btn-primary" type="submit">Search flights</button></form><div class="listing-layout"><aside class="filters"><fieldset class="filter-group"><legend>Departure</legend>${["Morning", "Afternoon", "Evening"].map(v => `<label class="check-row"><input type="checkbox" name="flight-time" value="${v}">${v}</label>`).join("")}</fieldset><fieldset class="filter-group"><legend>Stops</legend><label class="check-row"><input type="checkbox" name="stops" value="Nonstop">Nonstop</label></fieldset></aside><div><div class="list-toolbar"><b id="flight-count">${flights.length} flights</b><select id="flight-sort"><option value="price">Lowest price</option><option value="duration">Shortest duration</option></select></div><div id="flight-results">${flights.map(flight => flightCard(flight, tripType)).join("")}</div></div></div></div></section></main>${footer()}`
}
function flightCard(f, tripType = "round") { return `<article class="card" style="margin-bottom:12px"><div style="padding:18px;display:grid;grid-template-columns:1fr 1fr auto;align-items:center;gap:20px"><div><b>${esc(f.airline)}</b><div style="color:var(--muted);font-size:12px">${esc(f.number)}</div><div class="flight-trust"><i data-lucide="luggage"></i> Cabin bag included</div></div><div><b>${esc(f.departure)}</b> <span style="color:var(--muted)">→</span> <b>${esc(f.arrival)}</b><div style="color:var(--muted);font-size:12px">${esc(f.duration)} · ${esc(f.stops)}</div><div class="flight-trust"><i data-lucide="circle-check"></i> Changeable fare</div></div><div style="text-align:right"><div class="price">${money(f.price)} <span>per passenger · ${tripType === "round" ? "round trip" : "one way"}</span></div><button class="btn btn-primary" style="min-height:38px;margin-top:8px" data-book-flight="${esc(f.id)}">Select</button></div></div></article>` }

function authPage(register = false) {
  return `<main class="auth-wrap"><section class="auth-image"></section><section class="auth-panel"><div class="auth-box"><a class="brand" href="#home" style="color:var(--forest)"><span class="brand-mark"><i data-lucide="compass"></i></span>VELORA</a><h1>${register ? "Create your account" : "Welcome back."}</h1><p style="color:var(--muted)">${register ? "Your journeys, wishlist and bookings in one place." : "Sign in to manage your Velora journeys."}</p><form class="form" id="${register ? "register-form" : "login-form"}">${register ? `<label>Full name</label><input name="name" required placeholder="Your name"><label>Phone number</label><input name="phone" required placeholder="+44 20 0000 0000">` : ``}<label>Email address</label><input name="email" type="email" required placeholder="you@example.com"><label>Password</label><div class="password-wrap"><input name="password" type="password" required minlength="${register ? "8" : "1"}" placeholder="••••••••"><button type="button" data-show-password aria-label="Show password" aria-pressed="false"><i data-lucide="eye"></i></button></div>${register ? `<label>Confirm password</label><input name="confirm" type="password" required placeholder="••••••••">` : `<label class="check-row"><input type="checkbox" name="remember" checked> Remember me</label>`}<button class="btn btn-primary" type="submit">${register ? "Create account" : "Sign in"}</button></form><div class="auth-links">${register ? `<span>Already a member?</span><a class="text-link" href="#login">Sign in</a>` : `<a href="#forgot">Forgot password?</a><a class="text-link" href="#register">Create account</a>`}</div><div id="auth-message"></div></div></section></main>`
}

function dashboard() {
  const u = getUser(); if (!u) { location.hash = "#login"; return "" }
  const bookings = read("velora_bookings", []).filter(b => b.userId === u.id);
  const wishlistIds = read("velora_wishlist", []);
  return `${nav()}<main><header class="page-hero"><div class="shell"><div class="eyebrow">My Velora</div><h1>Welcome, ${esc(u.name.split(" ")[0])}.</h1></div></header><section class="section" style="padding-top:60px"><div class="shell dashboard-grid"><aside class="side-nav"><button class="active" data-dash-tab="overview"><i data-lucide="layout-dashboard"></i>Overview</button><button data-dash-tab="bookings"><i data-lucide="ticket"></i>My bookings</button><button data-dash-tab="wishlist"><i data-lucide="heart"></i>Wishlist</button><button data-dash-tab="profile"><i data-lucide="settings"></i>Profile</button></aside><div class="dashboard-content" id="dashboard-content">${dashboardOverview(u, bookings, wishlistIds)}</div></div></section></main>${footer()}`
}
function dashboardOverview(u, bookings, wishlistIds) {
  return `<div class="stat-grid"><div class="stat"><span>Upcoming trips</span><strong>${bookings.filter(b => b.status === "Confirmed").length}</strong></div><div class="stat"><span>Saved places</span><strong>${wishlistIds.length}</strong></div><div class="stat"><span>Total journeys</span><strong>${bookings.length}</strong></div><div class="stat"><span>Member status</span><strong style="font-size:20px">Gold</strong></div></div><h2 style="font:38px var(--serif);margin-top:38px">Your journeys</h2>${bookingTable(bookings)}`
}
function bookingTable(bookings) { return bookings.length ? `<div class="table-wrap"><table class="table"><thead><tr><th>Reference</th><th>Journey</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>${bookings.map(b => `<tr><td>${esc(b.id)}</td><td><b>${esc(b.destination)}</b><br><small>${b.type === "Flight" ? `${b.passengerCount || 1} passenger${(b.passengerCount || 1) === 1 ? "" : "s"}` : esc(b.type)}</small></td><td>${esc(b.travelDate)}${b.returnDate ? ` – ${esc(b.returnDate)}` : ""}</td><td>${money(b.price)}</td><td><span class="status ${b.status.toLowerCase()}">${esc(b.status)}</span></td><td>${b.status === "Confirmed" ? `<button class="btn btn-outline" style="min-height:36px" data-cancel="${esc(b.id)}">Cancel</button>` : ""}</td></tr>`).join("")}</tbody></table></div>` : `<div class="empty">No bookings yet. <a class="text-link" href="#destinations">Start exploring</a></div>` }

function galleryPage() {
  const ds = getDest(); return `${nav()}<main><header class="page-hero"><div class="shell"><div class="eyebrow">The travel journal</div><h1>Scenes to remember.</h1></div></header><section class="section"><div class="shell"><div class="filter-bar" id="gallery-filter">${["All", ...ds.map(d => d.country)].slice(0, 7).map((c, i) => `<button class="btn ${i ? "btn-outline" : "btn-primary"}" data-gallery-filter="${c}">${c}</button>`).join("")}</div><div class="gallery-strip" id="gallery-grid" style="grid-template-columns:repeat(3,1fr);grid-template-rows:280px 280px">${ds.map((d, i) => `<img data-gallery-country="${d.country}" src="${d.image}" alt="${esc(d.name)}" data-gallery-index="${i}" style="cursor:pointer;grid-row:${i === 0 ? "1/3" : "auto"}">`).join("")}</div></div></section></main>${footer()}`
}
function contactPage() {
  return `${nav()}<main><header class="page-hero"><div class="shell"><div class="eyebrow">We would love to hear from you</div><h1>Let's start a conversation.</h1></div></header><section class="section"><div class="shell" style="display:grid;grid-template-columns:.7fr 1.3fr;gap:70px"><div><h2 style="font:38px var(--serif)">How can we help?</h2><p>Our travel specialists are available Monday–Saturday, 09:00–18:00.</p><p><b>Email</b><br>hello@velora.travel</p><p><b>Phone</b><br>+44 20 7946 0182</p><h3 style="font:28px var(--serif)">Frequently asked</h3><p><b>Is this a real booking?</b><br>This project is a frontend simulation. No payment is collected.</p></div><form class="form" id="contact-form"><label>Name</label><input name="name" required><label>Email</label><input name="email" type="email" required><label>Subject</label><input name="subject" required><label>Message</label><textarea name="message" required></textarea><button class="btn btn-primary" type="submit">Send message</button><div id="contact-message"></div></form></div></section></main>${footer()}`
}

function route() {
  const hash = location.hash || "#home";
  const [path, query = ""] = hash.slice(1).split("?");
  const params = new URLSearchParams(query);
  let html;
  switch (path) {
    case "home": html = home(); break;
    case "destinations": html = destinationsPage(); break;
    case "destination": html = detailPage("destination", params.get("id")); break;
    case "packages": html = packagesPage(); break;
    case "package": html = detailPage("package", params.get("id")); break;
    case "hotels": html = hotelsPage(); break;
    case "hotel": html = hotelDetail(params.get("id")); break;
    case "flights": html = flightsPage(); break;
    case "gallery": html = galleryPage(); break;
    case "contact": html = contactPage(); break;
    case "login": html = authPage(false); break;
    case "register": html = authPage(true); break;
    case "forgot": html = authPage(false).replace("Welcome back.", "Reset your password").replace("Sign in to manage your Velora journeys.", "Enter your account email and we will prepare a demo reset.").replace('<form class="form" id="login-form">', '<form class="form" id="forgot-form">').replace('<label>Password</label><div class="password-wrap"><input name="password" type="password" required minlength="1" placeholder="••••••••"><button type="button" data-show-password aria-label="Show password"><i data-lucide="eye"></i></button></div><label class="check-row"><input type="checkbox" name="remember" checked> Remember me</label>', '').replace('<button class="btn btn-primary" type="submit">Sign in</button>', '<button class="btn btn-primary" type="submit">Send reset link</button>'); break;
    case "dashboard": case "profile": case "my-bookings": html = dashboard(); break;
    case "itinerary": html = itineraryPage(); break;
    default: html = home();
  }
  $("#app").innerHTML = html;
  icons();
  bind();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function itineraryPage() {
  const b = read("velora_bookings", [])[0]; const p = getPkgs()[0];
  return `${nav()}<main><header class="page-hero"><div class="shell"><div class="eyebrow">Your itinerary</div><h1>${esc(p.name)}</h1><p>${b?.travelDate || "December 5"} · ${p.duration} days · Amalfi Coast</p></div></header><section class="section"><div class="shell details-grid"><div><div class="timeline">${p.itinerary.map((x, i) => `<div class="timeline-item"><span class="eyebrow" style="color:var(--accent)">Day ${i + 1}</span><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p></div>`).join("")}</div></div><aside><div class="booking-card"><h3 style="font:28px var(--serif)">Trip essentials</h3><p><b>Destination</b><br>${p.destination}</p><p><b>Accommodation</b><br>Boutique villa</p><p><b>Transport</b><br>Private transfers</p></div></aside></div></section></main>${footer()}`
}

function render() { route() }
function modal(html, title = "Review") {
  const el = document.createElement("div"); el.className = "modal-backdrop"; el.innerHTML = `<div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>${esc(title)}</h2><button data-close-modal aria-label="Close"><i data-lucide="x"></i></button></div>${html}</div>`; document.body.append(el); document.body.classList.add("modal-open"); el.querySelectorAll("[data-close-modal]").forEach(button => button.addEventListener("click", closeModal)); icons();
}
function closeModal() { document.querySelector(".modal-backdrop")?.remove(); document.body.classList.remove("modal-open") }

function getFlightRequest() {
  const from = $("#flight-from")?.value.trim() || "";
  const to = $("#flight-to")?.value.trim() || "";
  const departure = $("#flight-depart")?.value || "";
  const tripType = $("#trip-type")?.value || "round";
  const returnDate = tripType === "round" ? ($("#flight-return")?.value || "") : "";
  const passengerCount = Number($("#flight-passengers")?.value);

  if (!from || !to) {
    toast("Enter both origin and destination");
    return null;
  }
  if (from.toLowerCase() === to.toLowerCase()) {
    toast("Origin and destination must be different");
    return null;
  }
  if (!departure) {
    toast("Choose a departure date");
    return null;
  }
  if (departure < getTodayDateString()) {
    toast("Departure date must be today or later");
    return null;
  }
  if (tripType === "round" && !returnDate) {
    toast("Choose a return date for a round trip");
    return null;
  }
  if (returnDate && returnDate < departure) {
    toast("Return date cannot be before departure");
    return null;
  }
  if (!Number.isInteger(passengerCount) || passengerCount < 1 || passengerCount > 4) {
    toast("Choose between 1 and 4 passengers");
    return null;
  }

  return { from, to, departure, returnDate, tripType, passengerCount };
}

function openFlightPassengerModal(flight, search, user) {
  const total = flight.price * search.passengerCount;
  const passengerFields = Array.from({ length: search.passengerCount }, (_, index) => `
    <fieldset class="filter-group" style="border-bottom:0;padding:4px 0;margin:0">
      <legend>Passenger ${index + 1}</legend>
      <label for="flight-passenger-${index + 1}">Full name as shown on travel ID</label>
      <input id="flight-passenger-${index + 1}" name="passengerName" autocomplete="name" maxlength="100" value="${index === 0 ? esc(user.name) : ""}" required>
    </fieldset>
  `).join("");
  const html = `
    <div class="booking-summary">
      <div><span>Flight</span><b>${esc(flight.airline)} · ${esc(flight.number)}</b></div>
      <div><span>Route</span><b>${esc(search.from)} to ${esc(search.to)}</b></div>
      <div><span>Dates</span><b>${esc(search.departure)}${search.returnDate ? ` – ${esc(search.returnDate)}` : " · one way"}</b></div>
      <div><span>Passengers</span><b>${search.passengerCount}</b></div>
      <div class="booking-total"><span>Estimated total</span><b>${money(total)}</b></div>
    </div>
    <form class="form" id="flight-passenger-form">
      <h3>Passenger details</h3>
      ${passengerFields}
      <h3>Contact details</h3>
      <label for="flight-contact-email">Email address</label>
      <input id="flight-contact-email" name="contactEmail" type="email" autocomplete="email" value="${esc(user.email)}" required>
      <label for="flight-contact-phone">Phone number</label>
      <input id="flight-contact-phone" name="contactPhone" type="tel" autocomplete="tel" minlength="7" value="${esc(user.phone || "")}" required>
      <p style="color:var(--muted)">Use each passenger's full name as it appears on their travel ID. This is a demo booking; no payment is collected.</p>
      <button class="btn btn-primary" type="submit">Confirm demo booking</button>
    </form>
  `;

  modal(html, "Passenger details");
  $("#flight-passenger-form").addEventListener("submit", event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const passengerNames = formData.getAll("passengerName").map(name => String(name).trim());
    const contactEmail = String(formData.get("contactEmail")).trim();
    const contactPhone = String(formData.get("contactPhone")).trim();
    if (passengerNames.some(name => !name) || !contactEmail || contactPhone.length < 7) {
      toast("Complete all passenger and contact details");
      return;
    }

    closeModal();
    createBooking(
      "Flight",
      `${search.from} to ${search.to}`,
      total,
      search.departure,
      user,
      {
        airline: flight.airline,
        flightNumber: flight.number,
        from: search.from,
        to: search.to,
        tripType: search.tripType,
        returnDate: search.returnDate,
        passengerCount: search.passengerCount,
        passengerNames,
        contactEmail,
        contactPhone
      }
    );
  });
}

function bindCardActions() {
  document.querySelectorAll("[data-wish]").forEach(element => {
    element.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      toggleWish(element.dataset.wish);
    });
  });

  document.querySelectorAll("[data-route]").forEach(element => {
    element.addEventListener("click", event => {
      if (!event.target.closest(".heart-btn")) {
        location.hash = element.dataset.route.slice(1);
      }
    });
  });

  document.querySelectorAll("[data-book-flight]").forEach(button => {
    button.addEventListener("click", () => {
      const search = getFlightRequest();
      if (!search) return;

      const selectedFlight = flights.find(flight => flight.id === button.dataset.bookFlight);
      if (!selectedFlight) {
        toast("That flight is no longer available");
        return;
      }
      if (selectedFlight.from.toLowerCase() !== search.from.toLowerCase()
        || selectedFlight.to.toLowerCase() !== search.to.toLowerCase()) {
        toast("Search this flight's exact route before selecting it");
        return;
      }

      const user = getUser();
      if (!user) {
        location.hash = "#login";
        toast("Sign in to reserve");
        return;
      }
      openFlightPassengerModal(selectedFlight, search, user);
    });
  });
}

function bind() {
  const today = getTodayDateString();

  function submitHomeSearch(event) {
    event.preventDefault();
    const data = new FormData(event.target);
    const searchType = data.get("type");
    const searchText = (data.get("where") || data.get("from") || data.get("destination") || "").trim();
    const checkIn = data.get("in");
    const checkOut = data.get("out");
    const departure = data.get("departure");
    const returnDate = data.get("return");

    if (searchType === "flights") {
      const to = data.get("to")?.trim();
      if (!searchText || !to) {
        toast("Enter both origin and destination");
        return;
      }
      if (searchText.toLowerCase() === to.toLowerCase()) {
        toast("Origin and destination must be different");
        return;
      }
      if (!departure) {
        toast("Choose a departure date");
        return;
      }
      if (departure < today) {
        toast("Departure date must be today or later");
        return;
      }
      if (returnDate && returnDate < departure) {
        toast("Return date cannot be before departure");
        return;
      }
      sessionStorage.setItem("velora_search", `${searchText} to ${to}`);
      sessionStorage.setItem("velora_flight_search", JSON.stringify({
        from: searchText,
        to,
        departure,
        returnDate,
        tripType: returnDate ? "round" : "one",
        passengers: Number(data.get("guests")) || 1,
        travelers: data.get("guests")
      }));
    } else if (checkIn && checkOut && checkOut <= checkIn) {
      toast("Check-out must be after check-in");
      return;
    } else if (searchText) {
      sessionStorage.setItem("velora_search", searchText);
    }

    if (searchType === "packages") {
      const style = data.get("style");
      if (style) sessionStorage.setItem("velora_package_style", style);
    }
    if (searchType === "destinations") {
      const style = data.get("style");
      if (style) sessionStorage.setItem("velora_destination_style", style);
    }
    if (searchType === "hotels") {
      const checkIn = data.get("in");
      const checkOut = data.get("out");
      const guests = data.get("guests");
      const rooms = data.get("rooms");
      if (checkIn) sessionStorage.setItem("velora_hotel_checkin", checkIn);
      if (checkOut) sessionStorage.setItem("velora_hotel_checkout", checkOut);
      if (guests) sessionStorage.setItem("velora_hotel_guests", guests);
      if (rooms) sessionStorage.setItem("velora_hotel_rooms", rooms);
    }

    toast(`Showing ${searchType === "packages" ? "journeys" : searchType}`);
    location.hash = `#${searchType}`;
  }

  function updateHomeSearchFields() {
    const form = $("#hero-search");
    const typeSelect = $("#global-search-type");
    if (!form || !typeSelect) return;

    const selectedType = typeSelect.value;
    let fields = "";

    if (selectedType === "flights") {
      fields = `
        <div class="search-field"><label>From</label><input name="where" id="global-search-where" value="London" placeholder="Departure city" required></div>
        <div class="search-field"><label>To</label><input name="to" placeholder="Destination city" value="Rome" required></div>
        <div class="search-field"><label>Departure</label><input name="departure" type="date" min="${today}" required></div>
        <div class="search-field"><label>Return</label><input name="return" type="date" min="${today}"></div>
        <div class="search-field"><label>Travelers</label><select name="guests"><option value="1">1 traveler</option><option value="2">2 travelers</option><option value="3">3 travelers</option><option value="4">4 travelers</option></select></div>
      `;
    } else if (selectedType === "hotels") {
      fields = `
        <div class="search-field"><label>Destination</label><input name="where" id="global-search-where" placeholder="City or hotel"></div>
        <div class="search-field"><label>Check in</label><input name="in" type="date" min="${today}"></div>
        <div class="search-field"><label>Check out</label><input name="out" type="date" min="${today}"></div>
        <div class="search-field"><label>Guests</label><select name="guests"><option>2 guests</option><option>1 guest</option><option>3 guests</option><option>4 guests</option></select></div>
        <div class="search-field"><label>Rooms</label><select name="rooms"><option>1 room</option><option>2 rooms</option><option>3 rooms</option></select></div>
      `;
    } else if (selectedType === "packages") {
      fields = `
        <div class="search-field"><label>Destination</label><input name="where" id="global-search-where" placeholder="Country or destination"></div>
        <div class="search-field"><label>Departure</label><input name="in" type="date" min="${today}"></div>
        <div class="search-field"><label>Flexible dates</label><select name="flexible"><option>Exact dates</option><option>+/- 3 days</option><option>+/- 7 days</option></select></div>
        <div class="search-field"><label>Travelers</label><select name="guests"><option>2 travelers</option><option>1 traveler</option><option>3 travelers</option><option>4 travelers</option></select></div>
        <div class="search-field"><label>Journey style</label><select name="style"><option value="">Any style</option><option>Coastal</option><option>Culture</option><option>Adventure</option><option>Island</option></select></div>
      `;
    } else {
      fields = `
        <div class="search-field"><label>Where</label><input name="where" id="global-search-where" placeholder="Country or destination"></div>
        <div class="search-field"><label>Travel month</label><input name="in" type="month"></div>
        <div class="search-field"><label>Trip style</label><select name="style"><option value="">Any style</option><option>Coastal</option><option>Culture</option><option>Adventure</option><option>Island</option></select></div>
        <div class="search-field"><label>Travelers</label><select name="guests"><option>2 travelers</option><option>1 traveler</option><option>3 travelers</option><option>4 travelers</option></select></div>
        <div class="search-field"><label>Duration</label><select name="duration"><option>Any duration</option><option>Up to 5 days</option><option>6–7 days</option><option>8+ days</option></select></div>
      `;
    }

    form.innerHTML = `
      <div class="search-field"><label>Explore</label><select name="type" id="global-search-type">
        <option value="destinations" ${selectedType === "destinations" ? "selected" : ""}>Destinations</option>
        <option value="packages" ${selectedType === "packages" ? "selected" : ""}>Journeys</option>
        <option value="hotels" ${selectedType === "hotels" ? "selected" : ""}>Hotels</option>
        <option value="flights" ${selectedType === "flights" ? "selected" : ""}>Flights</option>
      </select></div>
      ${fields}
      <button class="btn btn-primary" aria-label="Search"><i data-lucide="search"></i></button>
    `;

    $("#global-search-type")?.addEventListener("change", updateHomeSearchFields);
    form.addEventListener("submit", submitHomeSearch);
    icons();

    const departure = form.querySelector('[name="departure"]');
    const returnField = form.querySelector('[name="return"]');
    if (departure && returnField) {
      departure.addEventListener("change", () => {
        returnField.min = departure.value || today;
      });
    }
  }

  if ($("#hero-search")) updateHomeSearchFields();
  $("#menu")?.addEventListener("click", () => $("#nav").classList.toggle("open"));
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", () => {
      $("#nav")?.classList.remove("open");
    });
  });
  $("#logout")?.addEventListener("click", () => { setUser(null); toast("Signed out"); location.hash = "#home" });
  bindCardActions();


  document.querySelectorAll("[data-quick-search]").forEach(button => {
    button.addEventListener("click", () => {
      const filter = button.dataset.quickSearch;
      if (filter === "under2000") {
        location.hash = "#packages";
        setTimeout(() => {
          const sort = $("#package-sort");
          if (sort) {
            sort.value = "price-low";
            sort.dispatchEvent(new Event("change"));
          }
        }, 100);
        return;
      }
      if (filter === "coastal") {
        location.hash = "#destinations";
        setTimeout(() => {
          const category = $("#category-filter");
          if (category) {
            category.value = "Coastal";
            category.dispatchEvent(new Event("change"));
          }
        }, 100);
        return;
      }
      location.hash = "#packages";
    });
  });
  $("#newsletter")?.addEventListener("submit", e => { e.preventDefault(); toast("Welcome to the Velora journal"); e.target.reset() });

  const destSearch = () => { const text = $("#dest-search")?.value.toLowerCase() || ""; const country = $("#country-filter")?.value || ""; const category = $("#category-filter")?.value || ""; const sort = $("#sort-dest")?.value || "popular"; let list = getDest().filter(d => (!text || d.name.toLowerCase().includes(text) || d.country.toLowerCase().includes(text)) && (!country || d.country === country) && (!category || d.category === category)); if (sort === "price") list.sort((a, b) => a.price - b.price); if (sort === "rating") list.sort((a, b) => b.rating - a.rating); $("#dest-results").innerHTML = list.length ? list.map(destinationCard).join("") : `<div class="empty" style="grid-column:1/-1">No destinations match those filters.</div>`; icons(); bindCardActions() }
  ["dest-search", "country-filter", "category-filter", "sort-dest"].forEach(id => $("#" + id)?.addEventListener(id === "dest-search" ? "input" : "change", destSearch));
  if ($("#dest-search")?.value) {
    destSearch();
  } else if ($("#category-filter")?.value) {
    destSearch();
  }
  sessionStorage.removeItem("velora_destination_style");

  const pkgFilter = () => { const text = $("#package-search")?.value.toLowerCase() || ""; const cats = [...document.querySelectorAll("[name=package-category]:checked")].map(x => x.value); const durations = [...document.querySelectorAll("[name=duration]:checked")].map(x => x.value); const sort = $("#package-sort")?.value || "popular"; let list = getPkgs().filter(p => (!text || p.name.toLowerCase().includes(text) || p.destination.toLowerCase().includes(text)) && (!cats.length || cats.includes(p.category)) && (!durations.length || durations.some(d => (d === "short" && p.duration <= 5) || (d === "medium" && p.duration >= 6 && p.duration <= 7) || (d === "long" && p.duration >= 8)))); if (sort === "price-low") list.sort((a, b) => a.price - b.price); if (sort === "price-high") list.sort((a, b) => b.price - a.price); else if (sort === "popular") list.sort((a, b) => b.popularity - a.popularity); $("#package-results").innerHTML = list.length ? list.map(packageCard).join("") : `<div class="empty" style="grid-column:1/-1">No journeys match those filters.</div>`; icons(); bindCardActions() }
  $("#package-search")?.addEventListener("input", pkgFilter); $("#package-sort")?.addEventListener("change", pkgFilter); document.querySelectorAll("[name=package-category],[name=duration]").forEach(x => x.addEventListener("change", pkgFilter));
  if ($("#package-search")?.value) { pkgFilter(); }
  if (document.querySelector("[name=package-category]:checked")) { pkgFilter(); }
  sessionStorage.removeItem("velora_package_style");

  const hotelFilter = () => { const text = $("#hotel-search")?.value.toLowerCase() || ""; const stars = [...document.querySelectorAll("[name=stars]:checked")].map(x => +x.value); const am = [...document.querySelectorAll("[name=amenity]:checked")].map(x => x.value); let list = getHotels().filter(h => (!text || h.name.toLowerCase().includes(text) || h.destination.toLowerCase().includes(text)) && (!stars.length || stars.includes(h.stars)) && (!am.length || am.every(a => h.amenities.includes(a)))); if ($("#hotel-sort")?.value === "low") list.sort((a, b) => a.price - b.price); else list.sort((a, b) => b.rating - a.rating); $("#hotel-results").innerHTML = list.length ? list.map(hotelCard).join("") : `<div class="empty" style="grid-column:1/-1">No stays match those filters.</div>`; icons(); bindCardActions() }
  $("#hotel-search")?.addEventListener("input", hotelFilter); $("#hotel-sort")?.addEventListener("change", hotelFilter); document.querySelectorAll("[name=stars],[name=amenity]").forEach(x => x.addEventListener("change", hotelFilter));
  if ($("#hotel-search")?.value) { hotelFilter(); }

  const flightFilter = () => {
    const from = $("#flight-from")?.value.trim().toLowerCase() || "";
    const to = $("#flight-to")?.value.trim().toLowerCase() || "";
    const times = [...document.querySelectorAll("[name=flight-time]:checked")].map(input => input.value);
    const nonstop = document.querySelector("[name=stops]:checked");
    let matchingFlights = flights.filter(flight =>
      (!from || flight.from.toLowerCase() === from)
      && (!to || flight.to.toLowerCase() === to)
      && (!times.length || times.includes(flight.time))
      && (!nonstop || flight.stops === "Nonstop")
    );

    if ($("#flight-sort")?.value === "duration") {
      matchingFlights.sort((first, second) => first.duration.localeCompare(second.duration));
    } else {
      matchingFlights.sort((first, second) => first.price - second.price);
    }

    const tripType = $("#trip-type")?.value || "round";
    $("#flight-results").innerHTML = matchingFlights.length
      ? matchingFlights.map(flight => flightCard(flight, tripType)).join("")
      : `<div class="empty">No flights match those filters.</div>`;
    $("#flight-count").textContent = `${matchingFlights.length} flights`;
    icons();
    bindCardActions();
  };

  $("#swap-flights")?.addEventListener("click", () => { const from = $("#flight-from"), to = $("#flight-to");[from.value, to.value] = [to.value, from.value]; flightFilter() });
  $("#trip-type")?.addEventListener("change", () => {
    const returnField = $("#flight-return");
    const isRoundTrip = $("#trip-type").value === "round";
    returnField.disabled = !isRoundTrip;
    returnField.required = isRoundTrip;
    if (!isRoundTrip) returnField.value = "";
    flightFilter();
  });
  if ($("#flight-depart")) $("#flight-depart").min = today;
  if ($("#flight-return")) $("#flight-return").min = $("#flight-depart")?.value || today;
  $("#flight-depart")?.addEventListener("change", () => {
    if ($("#flight-return")) $("#flight-return").min = $("#flight-depart").value || today;
  });
  $("#flight-search")?.addEventListener("submit", event => {
    event.preventDefault();
    if (getFlightRequest()) flightFilter();
  });
  $("#flight-sort")?.addEventListener("change", flightFilter);
  document.querySelectorAll("[name=flight-time],[name=stops]").forEach(input => input.addEventListener("change", flightFilter));
  if ($("#flight-results")) flightFilter();

  $("#register-form")?.addEventListener("submit", e => { e.preventDefault(); const d = new FormData(e.target), users = read("velora_users", []); if (d.get("password") !== d.get("confirm")) return showAuth("Passwords do not match.", "error"); if (users.some(u => u.email.toLowerCase() === d.get("email").toLowerCase().trim())) return showAuth("An account already exists with this email.", "error"); const u = { id: "u" + Date.now(), name: d.get("name"), email: d.get("email").trim(), phone: d.get("phone"), password: d.get("password"), role: "customer", status: "Active" }; users.push(u); write("velora_users", users); setUser(u); showAuth("Account created successfully.", "success"); setTimeout(() => location.hash = "#dashboard", 500) });
  $("#login-form")?.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(e.target);
    const users = read("velora_users", []);
    const u = users.find(user => {
      return user.email.toLowerCase() === d.get("email").toLowerCase().trim()
        && user.password === d.get("password");
    });
    if (!u) return showAuth("Email or password is incorrect.", "error");
    if (u.status === "Inactive") return showAuth("This demo account is inactive.", "error");

    const remember = d.get("remember") === "on";
    setUser(u, remember);
    showAuth("Welcome back.", "success");
    setTimeout(() => location.hash = "#dashboard", 300);
  });
  $("#forgot-form")?.addEventListener("submit", e => { e.preventDefault(); const d = new FormData(e.target), email = d.get("email").trim(), users = read("velora_users", []); if (!email) return showAuth("Enter your email address.", "error"); if (!users.some(u => u.email.toLowerCase() === email.toLowerCase())) return showAuth("No demo account uses that email.", "error"); showAuth("Reset instructions are simulated; use your existing demo password.", "success") });
  document.querySelectorAll("[data-show-password]").forEach(button => {
    button.addEventListener("click", event => {
      const passwordInput = event.currentTarget.parentElement.querySelector("input");
      const showPassword = passwordInput.type === "password";
      passwordInput.type = showPassword ? "text" : "password";
      event.currentTarget.setAttribute("aria-label", showPassword ? "Hide password" : "Show password");
      event.currentTarget.setAttribute("aria-pressed", String(showPassword));
      event.currentTarget.innerHTML = `<i data-lucide="${showPassword ? "eye-off" : "eye"}"></i>`;
      icons();
    });
  });

  if ($("#package-date")) { $("#package-date").min = today }
  if ($("#hotel-in")) { $("#hotel-in").min = today }
  if ($("#hotel-out")) { $("#hotel-out").min = today }
  $("#hotel-in")?.addEventListener("change", () => { if ($("#hotel-in").value) $("#hotel-out").min = $("#hotel-in").value });
  const updatePackageSummary = () => {
    const summary = $("#package-summary");
    const guestsSelect = $("#package-guests");
    if (!summary || !guestsSelect) return;
    const guests = Number(guestsSelect.value || 2);
    const packageId = $("#book-package")?.dataset.id;
    const travelPackage = getPkgs().find(item => item.id === packageId);
    if (!travelPackage) return;
    summary.innerHTML = `
      <div><span>Package</span><b>${money(travelPackage.price)} × ${guests}</b></div>
      <div><span>Demo booking fees</span><b>$0</b></div>
      <div class="booking-total"><span>Estimated total</span><b>${money(travelPackage.price * guests)}</b></div>
    `;
  };
  $("#package-guests")?.addEventListener("change", updatePackageSummary);
  updatePackageSummary();

  const updateHotelSummary = () => {
    const summary = $("#hotel-summary");
    const checkIn = $("#hotel-in");
    const checkOut = $("#hotel-out");
    const roomSelect = $("#hotel-room");
    if (!summary || !checkIn || !checkOut || !roomSelect) return;

    const hotelId = $("#book-hotel")?.dataset.id;
    const hotel = getHotels().find(item => item.id === hotelId);
    const room = hotel?.rooms.find(item => item.name === roomSelect.value);
    const nightlyRate = room?.price || hotel?.price || 0;
    let nights = 1;

    if (checkIn.value && checkOut.value && checkOut.value > checkIn.value) {
      nights = Math.ceil((new Date(checkOut.value) - new Date(checkIn.value)) / 86400000);
    }

    summary.innerHTML = `
      <div><span>Room · ${nights} night${nights === 1 ? "" : "s"}</span><b>${money(nightlyRate)} × ${nights}</b></div>
      <div><span>Taxes & fees</span><b>Included</b></div>
      <div class="booking-total"><span>Estimated total</span><b>${money(nightlyRate * nights)}</b></div>
    `;
  };
  $("#hotel-in")?.addEventListener("change", () => { if ($("#hotel-in").value) $("#hotel-out").min = $("#hotel-in").value; updateHotelSummary() });
  $("#hotel-out")?.addEventListener("change", updateHotelSummary);
  $("#hotel-room")?.addEventListener("change", updateHotelSummary);
  updateHotelSummary();
  $("#book-package")?.addEventListener("click", e => { const u = getUser(); if (!u) { location.hash = "#login"; toast("Sign in to reserve"); return } const p = getPkgs().find(x => x.id === e.currentTarget.dataset.id); const date = $("#package-date").value; if (!date || date < today) return toast("Choose a valid departure date"); const guests = +$("#package-guests").value || 2; createBooking("Tour", p.destination, p.price * guests, date, u) });
  $("#book-hotel")?.addEventListener("click", e => { const u = getUser(); if (!u) { location.hash = "#login"; toast("Sign in to reserve"); return } const h = getHotels().find(x => x.id === e.currentTarget.dataset.id), iin = $("#hotel-in").value, iout = $("#hotel-out").value; if (!iin || !iout || iin < today || iout <= iin) return toast("Choose valid check-in and check-out dates"); const nights = Math.ceil((new Date(iout) - new Date(iin)) / 86400000); createBooking("Hotel", h.name, h.price * nights, iin, u) });

  document.querySelectorAll("[data-cancel]").forEach(b => b.addEventListener("click", () => { const all = read("velora_bookings", []), x = all.find(v => v.id === b.dataset.cancel); if (x) { x.status = "Cancelled"; write("velora_bookings", all); toast("Booking cancelled"); render() } }));
  document.querySelectorAll("[data-dash-tab]").forEach(b => b.addEventListener("click", () => { document.querySelectorAll("[data-dash-tab]").forEach(x => x.classList.remove("active")); b.classList.add("active"); const u = getUser(), bookings = read("velora_bookings", []).filter(v => v.userId === u.id), target = $("#dashboard-content"); if (b.dataset.dashTab === "overview") target.innerHTML = dashboardOverview(u, bookings, read("velora_wishlist", [])); if (b.dataset.dashTab === "bookings") target.innerHTML = `<h2 style="font:38px var(--serif)">My bookings</h2>${bookingTable(bookings)}`; if (b.dataset.dashTab === "wishlist") { const ids = read("velora_wishlist", []); const ds = getDest().filter(d => ids.includes(d.id)); target.innerHTML = `<h2 style="font:38px var(--serif)">Saved places</h2><div class="grid-list">${ds.length ? ds.map(destinationCard).join("") : `<div class="empty" style="grid-column:1/-1">Your wishlist is empty.</div>`}</div>` } if (b.dataset.dashTab === "profile") target.innerHTML = `<h2 style="font:38px var(--serif)">Profile</h2><form class="form" id="profile-form"><label>Full name</label><input name="name" value="${esc(u.name)}"><label>Email</label><input name="email" type="email" value="${esc(u.email)}"><label>Phone</label><input name="phone" value="${esc(u.phone || "")}"><button class="btn btn-primary" type="submit" style="margin-top:16px">Save changes</button></form>`; icons(); bind() }));
  $("#profile-form")?.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(e.target);
    const u = getUser();
    const users = read("velora_users", []);
    const idx = users.findIndex(user => user.id === u.id);
    const updated = {
      ...u,
      name: d.get("name").trim(),
      email: d.get("email").trim(),
      phone: d.get("phone").trim()
    };
    if (idx >= 0) users[idx] = updated;
    write("velora_users", users);
    setUser(updated, Boolean(read("velora_current_user", null)));
    toast("Profile updated");
    render();
  });

  $("#contact-form")?.addEventListener("submit", e => { e.preventDefault(); $("#contact-message").innerHTML = `<div class="auth-success" style="margin-top:12px">Thank you. Your message has been received.</div>`; e.target.reset() });
  document.querySelectorAll("[data-enquire]").forEach(b => b.addEventListener("click", () => toast(`Availability request sent for ${b.dataset.enquire}`)));
  document.querySelectorAll("[data-review]").forEach(b => b.addEventListener("click", () => { if (!getUser()) { location.hash = "#login"; toast("Sign in to write a review"); return } modal(`<form class="form" id="review-form"><label>Rating</label><select name="rating"><option value="5">5 — Exceptional</option><option value="4">4 — Excellent</option><option value="3">3 — Good</option><option value="2">2 — Fair</option><option value="1">1 — Poor</option></select><label>Your review</label><textarea name="comment" required></textarea><button class="btn btn-primary" type="submit" style="margin-top:16px">Submit review</button></form>`); $("#review-form").dataset.item = b.dataset.review; $("#review-form").addEventListener("submit", e => { e.preventDefault(); const d = new FormData(e.target), u = getUser(), reviews = read("velora_reviews", []); reviews.push({ id: "r" + Date.now(), name: u.name, rating: +d.get("rating"), itemId: e.target.dataset.item, comment: d.get("comment"), date: new Date().toISOString().slice(0, 10) }); write("velora_reviews", reviews); closeModal(); toast("Review submitted"); render() }) }));
  document.querySelectorAll("[data-gallery-filter]").forEach(b => b.addEventListener("click", () => { document.querySelectorAll("[data-gallery-filter]").forEach(x => { x.className = "btn btn-outline" }); b.className = "btn btn-primary"; const c = b.dataset.galleryFilter; document.querySelectorAll("[data-gallery-country]").forEach(img => img.style.display = c === "All" || img.dataset.galleryCountry === c ? "block" : "none") }));
  const gallery = [...document.querySelectorAll("[data-gallery-index]")]; gallery.forEach(img => img.addEventListener("click", () => openLightbox(gallery.indexOf(img), gallery)));
}

function openLightbox(index, items) {
  let current = index; const el = document.createElement("div"); el.className = "lightbox"; el.innerHTML = `<button class="close" aria-label="Close"><i data-lucide="x"></i></button><button class="prev" aria-label="Previous"><i data-lucide="chevron-left"></i></button><img src="${items[current].src}" alt="${esc(items[current].alt)}"><button class="next" aria-label="Next"><i data-lucide="chevron-right"></i></button>`; document.body.append(el); icons();
  const update = () => { el.querySelector("img").src = items[current].src; el.querySelector("img").alt = items[current].alt }; el.querySelector(".close").addEventListener("click", () => el.remove()); el.querySelector(".prev").addEventListener("click", () => { current = (current - 1 + items.length) % items.length; update() }); el.querySelector(".next").addEventListener("click", () => { current = (current + 1) % items.length; update() }); el.addEventListener("click", e => { if (e.target === el) el.remove() });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && document.body.contains(el)) {
      el.remove();
    }
  });
}
function showAuth(message, type) { const el = $("#auth-message"); el.innerHTML = `<div class="auth-${type}">${esc(message)}</div>` }
function createBooking(type, destination, price, travelDate, u, details = {}) {
  const all = read("velora_bookings", []);
  const id = "VEL-" + Math.floor(1000 + Math.random() * 8999);
  all.unshift({
    id,
    type,
    destination,
    date: getTodayDateString(),
    travelDate,
    price,
    status: "Confirmed",
    userId: u.id,
    ...details
  });
  write("velora_bookings", all);

  const bookingDetails = type === "Flight"
    ? `${esc(destination)}<br>${esc(travelDate)}${details.returnDate ? ` – ${esc(details.returnDate)}` : " · one way"}<br>${details.passengerCount} passenger${details.passengerCount === 1 ? "" : "s"} · ${money(price)}`
    : `${esc(destination)} · ${money(price)}`;

  modal(`
    <div style="text-align:center;padding:20px">
      <div style="width:64px;height:64px;border-radius:50%;background:#edf5ef;color:#24643d;margin:auto;display:grid;place-items:center">
        <i data-lucide="check"></i>
      </div>
      <h2 style="font:38px var(--serif);margin:12px 0">Your reservation is confirmed</h2>
      <p><b>${esc(id)}</b><br>${bookingDetails}</p>
      <p style="color:var(--muted)">This is a demonstration booking. No payment or real reservation was made.</p>
      <a class="btn btn-primary" href="#my-bookings" data-close-modal>View my bookings</a>
    </div>
  `, type === "Flight" ? "Your ticket" : "Reservation confirmed");
}

window.addEventListener("hashchange", route);

window.addEventListener("scroll", () => {
  const navEl = $("#nav");
  if (navEl) navEl.classList.toggle("scrolled", window.scrollY > 120);
}, { passive: true });

document.addEventListener("error", (event) => {
  if (event.target instanceof HTMLImageElement) {
    event.target.src = "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82";
  }
}, true);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    $("#nav")?.classList.remove("open");
    closeModal();
  }
});

route();
