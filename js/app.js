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
  if(!read("velora_users",null))write("velora_users",[
    {id:"u1",name:"Elena Rossi",email:"customer@velora.com",phone:"+44 20 7946 0182",password:"Customer123!",role:"customer",status:"Active"},
    {id:"u2",name:"Marcus Chen",email:"marcus@example.com",phone:"+1 415 555 0185",password:"Demo123!",role:"customer",status:"Active"}
  ]);
  if(!read("velora_destinations",null))write("velora_destinations",destinations);
  if(!read("velora_packages",null))write("velora_packages",packages);
  if(!read("velora_hotels",null))write("velora_hotels",hotels);
  if(!read("velora_flights",null))write("velora_flights",flights);
  if(!read("velora_bookings",null))write("velora_bookings",[
    {id:"VEL-2841",type:"Tour",destination:"Amalfi Coast",date:"2026-10-12",travelDate:"2026-12-05",price:2480,status:"Confirmed",userId:"u1"},
    {id:"VEL-1918",type:"Hotel",destination:"Aegean White",date:"2026-08-20",travelDate:"2026-09-14",price:560,status:"Completed",userId:"u1"}
  ]);
  if(!read("velora_reviews",null))write("velora_reviews",[
    {id:"r1",name:"Elena R.",rating:5,itemId:"d1",comment:"Everything felt considered, unhurried and deeply local.",date:"2026-09-12"},
    {id:"r2",name:"Marcus C.",rating:5,itemId:"p1",comment:"The private boat day was unforgettable.",date:"2026-08-28"}
  ]);
  if(!read("velora_wishlist",null))write("velora_wishlist",[]);
}
initializeDemoData();

const getDest=()=>read("velora_destinations",destinations);
const getPkgs=()=>read("velora_packages",packages);
const getHotels=()=>read("velora_hotels",hotels);
const getUser=()=>read("velora_current_user",null);
function setUser(u){if(u)write("velora_current_user",u);else localStorage.removeItem("velora_current_user")}

function toast(message){const el=document.createElement("div");el.className="toast";el.textContent=message;$("#toast-region").append(el);setTimeout(()=>el.remove(),3000)}
function icons(){if(window.lucide)lucide.createIcons({attrs:{strokeWidth:1.7}})}
function nav(){
  const u=getUser();
  return `<header class="nav" id="nav"><div class="nav-inner">
    <a class="brand" href="#home"><span class="brand-mark"><i data-lucide="compass"></i></span>VELORA</a>
    <nav class="nav-links"><a href="#destinations">Destinations</a><a href="#packages">Journeys</a><a href="#hotels">Hotels</a><a href="#flights">Flights</a><a href="#gallery">Gallery</a></nav>
    <div class="nav-actions">${u?`<a class="icon-btn" href="#dashboard" title="Account"><i data-lucide="circle-user-round"></i></a><button class="icon-btn" id="logout" title="Log out"><i data-lucide="log-out"></i></button>`:`<a class="icon-btn" href="#login" title="Sign in"><i data-lucide="user"></i></a>`}<button class="menu-btn" id="menu"><i data-lucide="menu"></i></button></div>
  </div></header>`;
}
function footer(){return `<footer class="footer"><div class="shell"><div class="footer-grid"><div class="footer-brand"><div class="brand"><span class="brand-mark"><i data-lucide="compass"></i></span>VELORA</div><p>Extraordinary places, thoughtfully explored.</p></div><div><h4>Discover</h4><a href="#destinations">Destinations</a><a href="#packages">Journeys</a><a href="#hotels">Hotels</a></div><div><h4>Company</h4><a href="#contact">Contact</a><a href="#gallery">Journal</a><a href="./admin/">Admin</a></div><div><h4>Support</h4><a href="#contact">Help center</a><a href="#my-bookings">My bookings</a></div></div><div class="footer-bottom"><span>© 2026 Velora Travel</span><span>Frontend travel demonstration</span></div></div></footer>`}
function wishlist(id){const list=read("velora_wishlist",[]);return list.includes(id)}
function toggleWish(id){const u=getUser();if(!u){location.hash="#login";toast("Sign in to save journeys");return}let list=read("velora_wishlist",[]);list=list.includes(id)?list.filter(x=>x!==id):[...list,id];write("velora_wishlist",list);toast(list.includes(id)?"Saved to your wishlist":"Removed from wishlist");render()}

function home(){
  const ds=getDest();
  return `${nav()}<main>
  <section class="hero"><div class="shell hero-content"><div class="eyebrow">The 2026 collection</div><h1>Go where life feels expansive.</h1><p>Thoughtfully curated stays and journeys for travelers seeking something beyond the ordinary.</p><a class="btn btn-light" href="#destinations">Explore destinations <i data-lucide="arrow-up-right"></i></a></div>
  <form class="search-bar" id="hero-search"><div class="search-field"><label>Where</label><input name="where" placeholder="Country or destination"></div><div class="search-field"><label>Check in</label><input name="in" type="date"></div><div class="search-field"><label>Check out</label><input name="out" type="date"></div><div class="search-field"><label>Travelers</label><select name="guests"><option>2 guests</option><option>1 guest</option><option>3 guests</option><option>4 guests</option></select></div><button class="btn btn-primary" aria-label="Search"><i data-lucide="search"></i></button></form></section>
  <section class="section"><div class="shell"><div class="section-head"><div><div class="eyebrow" style="color:var(--accent)">Places worth the journey</div><h2>Featured destinations</h2></div><a class="text-link" href="#destinations">View all destinations</a></div><div class="dest-grid">${ds.slice(0,5).map(d=>`<article class="destination-card" data-route="#destination?id=${d.id}"><img src="${d.image}" alt="${esc(d.name)}"><button class="heart-btn ${wishlist(d.id)?"active":""}" data-wish="${d.id}" aria-label="Save ${esc(d.name)}"><i data-lucide="heart"></i></button><div class="destination-copy"><span>${esc(d.country)} · ${d.duration}</span><h3>${esc(d.name)}</h3></div></article>`).join("")}</div></div></section>
  <section class="section" style="padding-top:20px"><div class="shell"><div class="section-head"><div><div class="eyebrow" style="color:var(--accent)">Curated departures</div><h2>Journeys to remember</h2></div><a class="text-link" href="#packages">Explore all journeys</a></div><div class="package-row">${getPkgs().slice(0,3).map(p=>packageCard(p)).join("")}</div></div></section>
  <section class="editorial"><div class="editorial-grid"><img class="editorial-image" src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1400&q=88" alt="A quiet tropical shoreline"><div class="editorial-copy"><div class="eyebrow">The Velora difference</div><h2>Travel at your own pace.</h2><p>We create the rare kind of trip that feels effortless: deeply researched, personally hosted and shaped around how you actually want to spend your time.</p><div class="feature-list"><div><strong>24/7</strong>Trip support</div><div><strong>48 hrs</strong>Local planning</div><div><strong>100%</strong>Flexible ideas</div></div><a class="btn btn-light" style="width:max-content;margin-top:34px" href="#packages">Find your journey</a></div></div></section>
  <section class="section"><div class="shell"><div class="section-head"><div><div class="eyebrow" style="color:var(--accent)">The season's edit</div><h2>Where to go next</h2></div></div><div class="collections"><article class="collection"><img src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=85" alt="Desert road"><div class="collection-copy"><span>Collection · 6 journeys</span><h3>Wild horizons</h3><a class="text-link" href="#packages">Explore collection</a></div></article><article class="collection"><img src="https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=85" alt="European old town"><div class="collection-copy"><span>Collection · 8 journeys</span><h3>Old-world cities</h3><a class="text-link" href="#packages">Explore collection</a></div></article></div></div></section>
  <section class="section" style="padding-top:20px"><div class="shell testimonial-grid"><div><div class="eyebrow" style="color:var(--accent)">Traveler stories</div><p class="quote">“Velora turned a complicated family trip into the easiest, most meaningful journey we've ever taken.”</p><div class="quote-author">Sofia &amp; Daniel Martin<span>Amalfi Coast, June 2026</span></div></div><div class="gallery-strip"><img src="https://images.unsplash.com/photo-1530789253388-582c481c54b0?auto=format&fit=crop&w=700&q=85" alt="Traveler in nature"><img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=700&q=85" alt="Mountain landscape"><img src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=700&q=85" alt="Desert landscape"></div></div></section>
  <section class="newsletter"><div class="shell newsletter-inner"><div><div class="eyebrow" style="color:var(--accent)">Postcards from elsewhere</div><h2>Ideas for your next escape.</h2></div><form id="newsletter"><input type="email" required placeholder="Email address" aria-label="Email address"><button class="btn btn-primary" type="submit">Subscribe</button></form></div></section></main>${footer()}`;
}

function packageCard(p){return `<article class="card"><div class="card-image"><a href="#package?id=${p.id}" aria-label="View ${esc(p.name)}"><img src="${p.image}" alt="${esc(p.name)}"></a><button type="button" class="heart-btn ${wishlist(p.id)?"active":""}" data-wish="${p.id}" aria-label="Save ${esc(p.name)}"><i data-lucide="heart"></i></button></div><div class="card-body"><div class="card-meta"><span>${esc(p.destination)} · ${p.duration} days</span><span>★ ${p.rating}</span></div><a href="#package?id=${p.id}"><h3>${esc(p.name)}</h3></a><div class="price">${money(p.price)} <span>per person</span></div></div></article>`}

function destinationsPage(){
  return `${nav()}<main><header class="page-hero"><div class="shell"><div class="eyebrow">The world, well considered</div><h1>Find your place.</h1><p>Distinctive landscapes and local stories, selected for depth rather than distance.</p></div></header><div class="shell"><form class="filter-bar" id="destination-filters"><input id="dest-search" placeholder="Search destinations"><select id="country-filter"><option value="">All countries</option>${[...new Set(getDest().map(d=>d.country))].map(c=>`<option>${c}</option>`).join("")}</select><select id="category-filter"><option value="">All styles</option><option>Coastal</option><option>Culture</option><option>Adventure</option><option>Island</option></select><select id="sort-dest"><option value="popular">Popular</option><option value="price">Lowest price</option><option value="rating">Top rated</option></select></form><div id="dest-results" class="grid-list">${getDest().map(d=>destinationCard(d)).join("")}</div></div></main>${footer()}`
}
function destinationCard(d){return `<article class="card"><div class="card-image"><a href="#destination?id=${d.id}" aria-label="View ${esc(d.name)}"><img src="${d.image}" alt="${esc(d.name)}"></a><button type="button" class="heart-btn ${wishlist(d.id)?"active":""}" data-wish="${d.id}" aria-label="Save ${esc(d.name)}"><i data-lucide="heart"></i></button></div><div class="card-body"><div class="card-meta"><span>${esc(d.country)}</span><span>★ ${d.rating}</span></div><a href="#destination?id=${d.id}"><h3>${esc(d.name)}</h3></a><p style="color:var(--muted);font-size:13px">${esc(d.description)}</p><div class="price">From ${money(d.price)} <span>/ person</span></div></div></article>`}

function packagesPage(){
  return `${nav()}<main><header class="page-hero alt"><div class="shell"><div class="eyebrow">Signature journeys</div><h1>Travel, beautifully arranged.</h1><p>Small-group and private itineraries with the freedom to make each day your own.</p></div></header><section class="section" style="padding-top:70px"><div class="shell listing-layout"><aside class="filters"><fieldset class="filter-group"><legend>Journey style</legend>${["Coastal","Culture","Adventure","Island"].map(v=>`<label class="check-row"><input type="checkbox" name="package-category" value="${v}">${v}</label>`).join("")}</fieldset><fieldset class="filter-group"><legend>Duration</legend><label class="check-row"><input type="checkbox" name="duration" value="short">Up to 5 days</label><label class="check-row"><input type="checkbox" name="duration" value="medium">6–7 days</label><label class="check-row"><input type="checkbox" name="duration" value="long">8+ days</label></fieldset></aside><div><div class="list-toolbar"><input id="package-search" placeholder="Search journeys" style="height:40px;border:1px solid var(--line);padding:0 10px;border-radius:4px"><select id="package-sort"><option value="popular">Most popular</option><option value="price-low">Lowest price</option><option value="price-high">Highest price</option></select></div><div class="grid-list" id="package-results">${getPkgs().map(packageCard).join("")}</div></div></div></section></main>${footer()}`
}

function detailPage(type,id){
  if(type==="destination"){const d=getDest().find(x=>x.id===id)||getDest()[0];const reviews=read("velora_reviews",[]).filter(r=>r.itemId===d.id);const highlights=Array.isArray(d.highlights)&&d.highlights.length?d.highlights:[d.category||"Local culture","Signature landscapes","Exceptional hospitality"];const best=d.best||"Most of the year, depending on local weather";return `${nav()}<main><div class="details-hero"><img src="${d.image}" alt="${esc(d.name)}"><div class="shell details-title"><div class="eyebrow">${esc(d.country)}</div><h1>${esc(d.name)}</h1><span>★ ${d.rating} · ${d.duration} · from ${money(d.price)}</span></div></div><div class="shell details-grid"><div class="content-panel"><h2>An extraordinary corner of ${esc(d.country)}</h2><p>${esc(d.description)}</p><h2>Why go</h2><div class="feature-list" style="color:var(--charcoal);grid-template-columns:repeat(3,1fr)">${highlights.map(h=>`<div style="border-top:1px solid var(--line)"><strong>${esc(h)}</strong>Curated local experience</div>`).join("")}</div><h2>Best time to visit</h2><p>${esc(best)} is typically the finest season for weather and local life.</p><h2>Traveler reviews</h2>${reviews.length?reviews.map(r=>`<article class="card" style="padding:18px;margin:10px 0"><div class="stars">${"★".repeat(r.rating)}</div><b>${esc(r.name)}</b><p>${esc(r.comment)}</p></article>`).join(""):`<p>No reviews yet.</p>`}<button class="btn btn-outline" data-review="${d.id}">Write a review</button></div><aside><div class="booking-card"><div class="eyebrow" style="color:var(--accent)">Plan this journey</div><h3 style="font:28px var(--serif)">Start in ${esc(d.name)}</h3><div class="form"><label>Travel month</label><input type="month"><label>Travelers</label><select><option>2 travelers</option><option>1 traveler</option><option>3 travelers</option><option>4 travelers</option></select><button class="btn btn-primary" data-enquire="${d.name}">Request availability</button></div></div></aside></div></main>${footer()}`
  }
  const p=getPkgs().find(x=>x.id===id)||getPkgs()[0];
  return `${nav()}<main><div class="details-hero"><img src="${p.image}" alt="${esc(p.name)}"><div class="shell details-title"><div class="eyebrow">${esc(p.destination)} · ${p.duration} days</div><h1>${esc(p.name)}</h1><span>★ ${p.rating} · Private journey</span></div></div><div class="shell details-grid"><div class="content-panel"><h2>Journey overview</h2><p>${esc(p.description)}</p><h2>Your day-by-day itinerary</h2><div class="timeline">${p.itinerary.map((x,i)=>`<div class="timeline-item"><span class="eyebrow" style="color:var(--accent)">Day ${i+1}</span><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p></div>`).join("")}</div><h2>Included</h2><div class="form-row">${p.included.map(x=>`<div>✓ ${esc(x)}</div>`).join("")}</div><h2>Not included</h2><div class="form-row">${p.excluded.map(x=>`<div>— ${esc(x)}</div>`).join("")}</div></div><aside><div class="booking-card"><div class="price" style="font:32px var(--serif">${money(p.price)} <span>per person</span></div><div class="form"><label>Departure date</label><input type="date" id="package-date"><label>Travelers</label><select id="package-guests"><option value="2">2 travelers</option><option value="1">1 traveler</option><option value="3">3 travelers</option><option value="4">4 travelers</option></select><button class="btn btn-primary" id="book-package" data-id="${p.id}">Reserve journey</button><small style="display:block;text-align:center;color:var(--muted);margin-top:10px">No payment required for this demo</small></div></div></aside></div></main>${footer()}`
}

function hotelsPage(){
  return `${nav()}<main><header class="page-hero alt"><div class="shell"><div class="eyebrow">Exceptional stays</div><h1>Sleep somewhere special.</h1><p>Characterful hotels, restorative retreats and remarkable rooms around the world.</p></div></header><section class="section" style="padding-top:70px"><div class="shell listing-layout"><aside class="filters"><fieldset class="filter-group"><legend>Star rating</legend>${[5,4].map(n=>`<label class="check-row"><input type="checkbox" name="stars" value="${n}">${n} stars</label>`).join("")}</fieldset><fieldset class="filter-group"><legend>Amenities</legend>${["Pool","Spa","Restaurant","Breakfast"].map(v=>`<label class="check-row"><input type="checkbox" name="amenity" value="${v}">${v}</label>`).join("")}</fieldset></aside><div><div class="list-toolbar"><input id="hotel-search" placeholder="Search hotels or destinations" style="height:40px;border:1px solid var(--line);padding:0 10px;border-radius:4px"><select id="hotel-sort"><option value="rating">Top rated</option><option value="low">Lowest price</option></select></div><div class="grid-list" id="hotel-results">${getHotels().map(h=>hotelCard(h)).join("")}</div></div></div></section></main>${footer()}`
}
function hotelCard(h){return `<article class="card"><a href="#hotel?id=${h.id}"><div class="card-image"><img src="${h.image}" alt="${esc(h.name)}"></div><div class="card-body"><div class="card-meta"><span>${esc(h.destination)}</span><span>★ ${h.rating}</span></div><h3>${esc(h.name)}</h3><p style="color:var(--muted);font-size:13px">${esc(h.amenities.slice(0,3).join(" · "))}</p><div class="price">${money(h.price)} <span>per night</span></div></div></a></article>`}
function hotelDetail(id){const h=getHotels().find(x=>x.id===id)||getHotels()[0];return `${nav()}<main><div class="details-hero"><img src="${h.image}" alt="${esc(h.name)}"><div class="shell details-title"><div class="eyebrow">${esc(h.destination)} · ${h.stars} star</div><h1>${esc(h.name)}</h1><span>★ ${h.rating} · ${esc(h.property)}</span></div></div><div class="shell details-grid"><div class="content-panel"><h2>A remarkable place to stay</h2><p>${esc(h.description)}</p><h2>Available rooms</h2>${h.rooms.map((r,i)=>`<div class="card" style="padding:18px;margin:12px 0;display:flex;justify-content:space-between;align-items:center"><div><b>${esc(r.name)}</b><div style="color:var(--muted);font-size:13px">Up to ${r.capacity} guests</div></div><div class="price">${money(r.price)} <span>/ night</span></div></div>`).join("")}<h2>Amenities</h2><div class="form-row">${h.amenities.map(a=>`<div>✓ ${esc(a)}</div>`).join("")}</div></div><aside><div class="booking-card"><div class="price" style="font:28px var(--serif">${money(h.price)} <span>per night</span></div><div class="form"><label>Check in</label><input type="date" id="hotel-in"><label>Check out</label><input type="date" id="hotel-out"><label>Guests</label><select id="hotel-guests"><option>2 guests</option><option>1 guest</option><option>3 guests</option><option>4 guests</option></select><label>Room</label><select id="hotel-room">${h.rooms.map(r=>`<option value="${r.name}">${esc(r.name)}</option>`).join("")}</select><button class="btn btn-primary" id="book-hotel" data-id="${h.id}">Reserve room</button></div></div></aside></div></main>${footer()}`
}

function flightsPage(){
  return `${nav()}<main><header class="page-hero"><div class="shell"><div class="eyebrow">Air travel</div><h1>Take the next step.</h1><p>Compare sample routes and reserve a demo itinerary.</p></div></header><section class="section" style="padding-top:70px"><div class="shell"><form class="filter-bar" id="flight-search"><select id="trip-type" name="trip"><option value="round">Round trip</option><option value="one">One way</option></select><input id="flight-from" placeholder="From" value="London" required><button type="button" class="icon-btn" id="swap-flights" style="color:var(--forest);border-color:var(--line);background:white" aria-label="Swap origin and destination"><i data-lucide="arrow-right-left"></i></button><input id="flight-to" placeholder="To" value="Rome" required><input id="flight-depart" type="date" required><input id="flight-return" type="date"><select id="flight-passengers"><option>1 passenger</option><option>2 passengers</option></select><button class="btn btn-primary" type="submit">Search</button></form><div class="listing-layout"><aside class="filters"><fieldset class="filter-group"><legend>Departure</legend>${["Morning","Afternoon","Evening"].map(v=>`<label class="check-row"><input type="checkbox" name="flight-time" value="${v}">${v}</label>`).join("")}</fieldset><fieldset class="filter-group"><legend>Stops</legend><label class="check-row"><input type="checkbox" name="stops" value="Nonstop">Nonstop</label></fieldset></aside><div><div class="list-toolbar"><b id="flight-count">${flights.length} flights</b><select id="flight-sort"><option value="price">Lowest price</option><option value="duration">Shortest duration</option></select></div><div id="flight-results">${flights.map(flightCard).join("")}</div></div></div></div></section></main>${footer()}`
}
function flightCard(f){return `<article class="card" style="margin-bottom:12px"><div style="padding:18px;display:grid;grid-template-columns:1fr 1fr auto;align-items:center;gap:20px"><div><b>${esc(f.airline)}</b><div style="color:var(--muted);font-size:12px">${f.number}</div></div><div><b>${f.departure}</b> <span style="color:var(--muted)">→</span> <b>${f.arrival}</b><div style="color:var(--muted);font-size:12px">${f.duration} · ${f.stops}</div></div><div style="text-align:right"><div class="price">${money(f.price)}</div><button class="btn btn-primary" style="min-height:38px;margin-top:8px" data-book-flight="${f.id}">Select</button></div></div></article>`}

function authPage(register=false){
  return `<main class="auth-wrap"><section class="auth-image"></section><section class="auth-panel"><div class="auth-box"><a class="brand" href="#home" style="color:var(--forest)"><span class="brand-mark"><i data-lucide="compass"></i></span>VELORA</a><h1>${register?"Create your account":"Welcome back."}</h1><p style="color:var(--muted)">${register?"Your journeys, wishlist and bookings in one place.":"Sign in to manage your Velora journeys."}</p><form class="form" id="${register?"register-form":"login-form"}">${register?`<label>Full name</label><input name="name" required placeholder="Your name"><label>Phone number</label><input name="phone" required placeholder="+44 20 0000 0000">`:``}<label>Email address</label><input name="email" type="email" required placeholder="you@example.com"><label>Password</label><div class="password-wrap"><input name="password" type="password" required minlength="${register?"8":"1"}" placeholder="••••••••"><button type="button" data-show-password aria-label="Show password"><i data-lucide="eye"></i></button></div>${register?`<label>Confirm password</label><input name="confirm" type="password" required placeholder="••••••••">`:`<label class="check-row"><input type="checkbox" name="remember" checked> Remember me</label>`}<button class="btn btn-primary" type="submit">${register?"Create account":"Sign in"}</button></form><div class="auth-links">${register?`<span>Already a member?</span><a class="text-link" href="#login">Sign in</a>`:`<a href="#forgot">Forgot password?</a><a class="text-link" href="#register">Create account</a>`}</div><div id="auth-message"></div></div></section></main>`
}

function dashboard(){
  const u=getUser();if(!u){location.hash="#login";return ""}
  const bookings=read("velora_bookings",[]).filter(b=>b.userId===u.id);
  const wishlistIds=read("velora_wishlist",[]);
  return `${nav()}<main><header class="page-hero"><div class="shell"><div class="eyebrow">My Velora</div><h1>Welcome, ${esc(u.name.split(" ")[0])}.</h1></div></header><section class="section" style="padding-top:60px"><div class="shell dashboard-grid"><aside class="side-nav"><button class="active" data-dash-tab="overview"><i data-lucide="layout-dashboard"></i>Overview</button><button data-dash-tab="bookings"><i data-lucide="ticket"></i>My bookings</button><button data-dash-tab="wishlist"><i data-lucide="heart"></i>Wishlist</button><button data-dash-tab="profile"><i data-lucide="settings"></i>Profile</button></aside><div class="dashboard-content" id="dashboard-content">${dashboardOverview(u,bookings,wishlistIds)}</div></div></section></main>${footer()}`
}
function dashboardOverview(u,bookings,wishlistIds){return `<div class="stat-grid"><div class="stat"><span>Upcoming trips</span><strong>${bookings.filter(b=>b.status==="Confirmed").length}</strong></div><div class="stat"><span>Saved places</span><strong>${wishlistIds.length}</strong></div><div class="stat"><span>Total journeys</span><strong>${bookings.length}</strong></div><div class="stat"><span>Member status</span><strong style="font-size:20px">Gold</strong></div></div><h2 style="font:38px var(--serif);margin-top:38px">Your journeys</h2>${bookingTable(bookings)}`
}
function bookingTable(bookings){return bookings.length?`<div class="table-wrap"><table class="table"><thead><tr><th>Reference</th><th>Journey</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>${bookings.map(b=>`<tr><td>${b.id}</td><td><b>${esc(b.destination)}</b><br><small>${b.type}</small></td><td>${b.travelDate}</td><td>${money(b.price)}</td><td><span class="status ${b.status.toLowerCase()}">${b.status}</span></td><td>${b.status==="Confirmed"?`<button class="btn btn-outline" style="min-height:36px" data-cancel="${b.id}">Cancel</button>`:""}</td></tr>`).join("")}</tbody></table></div>`:`<div class="empty">No bookings yet. <a class="text-link" href="#destinations">Start exploring</a></div>`}

function galleryPage(){const ds=getDest();return `${nav()}<main><header class="page-hero"><div class="shell"><div class="eyebrow">The travel journal</div><h1>Scenes to remember.</h1></div></header><section class="section"><div class="shell"><div class="filter-bar" id="gallery-filter">${["All",...ds.map(d=>d.country)].slice(0,7).map((c,i)=>`<button class="btn ${i?"btn-outline":"btn-primary"}" data-gallery-filter="${c}">${c}</button>`).join("")}</div><div class="gallery-strip" id="gallery-grid" style="grid-template-columns:repeat(3,1fr);grid-template-rows:280px 280px">${ds.map((d,i)=>`<img data-gallery-country="${d.country}" src="${d.image}" alt="${esc(d.name)}" data-gallery-index="${i}" style="cursor:pointer;grid-row:${i===0?"1/3":"auto"}">`).join("")}</div></div></section></main>${footer()}`
}
function contactPage(){return `${nav()}<main><header class="page-hero"><div class="shell"><div class="eyebrow">We would love to hear from you</div><h1>Let's start a conversation.</h1></div></header><section class="section"><div class="shell" style="display:grid;grid-template-columns:.7fr 1.3fr;gap:70px"><div><h2 style="font:38px var(--serif)">How can we help?</h2><p>Our travel specialists are available Monday–Saturday, 09:00–18:00.</p><p><b>Email</b><br>hello@velora.travel</p><p><b>Phone</b><br>+44 20 7946 0182</p><h3 style="font:28px var(--serif)">Frequently asked</h3><p><b>Is this a real booking?</b><br>This project is a frontend simulation. No payment is collected.</p></div><form class="form" id="contact-form"><label>Name</label><input name="name" required><label>Email</label><input name="email" type="email" required><label>Subject</label><input name="subject" required><label>Message</label><textarea name="message" required></textarea><button class="btn btn-primary" type="submit">Send message</button><div id="contact-message"></div></form></div></section></main>${footer()}`
}

function route(){
  const hash=location.hash||"#home";
  const [path,query=""]=hash.slice(1).split("?");
  const params=new URLSearchParams(query);
  let html;
  switch(path){
    case "home":html=home();break;
    case "destinations":html=destinationsPage();break;
    case "destination":html=detailPage("destination",params.get("id"));break;
    case "packages":html=packagesPage();break;
    case "package":html=detailPage("package",params.get("id"));break;
    case "hotels":html=hotelsPage();break;
    case "hotel":html=hotelDetail(params.get("id"));break;
    case "flights":html=flightsPage();break;
    case "gallery":html=galleryPage();break;
    case "contact":html=contactPage();break;
    case "login":html=authPage(false);break;
    case "register":html=authPage(true);break;
    case "forgot":html=authPage(false).replace("Welcome back.","Reset your password").replace("Sign in to manage your Velora journeys.","Enter your account email and we will prepare a demo reset.").replace('<form class="form" id="login-form">','<form class="form" id="forgot-form">').replace('<label>Password</label><div class="password-wrap"><input name="password" type="password" required minlength="1" placeholder="••••••••"><button type="button" data-show-password aria-label="Show password"><i data-lucide="eye"></i></button></div><label class="check-row"><input type="checkbox" name="remember" checked> Remember me</label>','').replace('<button class="btn btn-primary" type="submit">Sign in</button>','<button class="btn btn-primary" type="submit">Send reset link</button>');break;
    case "dashboard":case "profile":case "my-bookings":html=dashboard();break;
    case "itinerary":html=itineraryPage();break;
    default:html=home();
  }
  $("#app").innerHTML=html;
  icons();
  bind();
  window.scrollTo({top:0,behavior:"instant"});
}

function itineraryPage(){
  const b=read("velora_bookings",[])[0];const p=getPkgs()[0];
  return `${nav()}<main><header class="page-hero"><div class="shell"><div class="eyebrow">Your itinerary</div><h1>${esc(p.name)}</h1><p>${b?.travelDate||"December 5"} · ${p.duration} days · Amalfi Coast</p></div></header><section class="section"><div class="shell details-grid"><div><div class="timeline">${p.itinerary.map((x,i)=>`<div class="timeline-item"><span class="eyebrow" style="color:var(--accent)">Day ${i+1}</span><h3>${esc(x[0])}</h3><p>${esc(x[1])}</p></div>`).join("")}</div></div><aside><div class="booking-card"><h3 style="font:28px var(--serif)">Trip essentials</h3><p><b>Destination</b><br>${p.destination}</p><p><b>Accommodation</b><br>Boutique villa</p><p><b>Transport</b><br>Private transfers</p></div></aside></div></section></main>${footer()}`
}

function render(){route()}
function modal(html){
  const el=document.createElement("div");el.className="modal-backdrop";el.innerHTML=`<div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>Review</h2><button data-close-modal aria-label="Close"><i data-lucide="x"></i></button></div>${html}</div>`;document.body.append(el);document.body.classList.add("modal-open");icons();
}
function closeModal(){document.querySelector(".modal-backdrop")?.remove();document.body.classList.remove("modal-open")}

function bind(){
  const today=new Date().toISOString().slice(0,10);
  $("#menu")?.addEventListener("click",()=>$("#nav").classList.toggle("open"));
  $("#logout")?.addEventListener("click",()=>{setUser(null);toast("Signed out");location.hash="#home"});
  document.querySelectorAll("[data-wish]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();toggleWish(el.dataset.wish)}));
  document.querySelectorAll("[data-route]").forEach(el=>el.addEventListener("click",e=>{if(!e.target.closest(".heart-btn"))location.hash=el.dataset.route.slice(1)}));

  $("#hero-search")?.addEventListener("submit",e=>{e.preventDefault();const data=new FormData(e.target),checkIn=data.get("in"),checkOut=data.get("out");if(checkIn&&checkOut&&checkOut<=checkIn){toast("Check-out must be after check-in");return}toast("Showing trips matching your search");location.hash="#packages"});
  $("#newsletter")?.addEventListener("submit",e=>{e.preventDefault();toast("Welcome to the Velora journal");e.target.reset()});

  const destSearch=()=>{const text=$("#dest-search")?.value.toLowerCase()||"";const country=$("#country-filter")?.value||"";const category=$("#category-filter")?.value||"";const sort=$("#sort-dest")?.value||"popular";let list=getDest().filter(d=>(!text||d.name.toLowerCase().includes(text)||d.country.toLowerCase().includes(text))&&(!country||d.country===country)&&(!category||d.category===category));if(sort==="price")list.sort((a,b)=>a.price-b.price);if(sort==="rating")list.sort((a,b)=>b.rating-a.rating);$("#dest-results").innerHTML=list.length?list.map(destinationCard).join(""):`<div class="empty" style="grid-column:1/-1">No destinations match those filters.</div>`;icons();bind()}
  ["dest-search","country-filter","category-filter","sort-dest"].forEach(id=>$("#"+id)?.addEventListener(id==="dest-search"?"input":"change",destSearch));

  const pkgFilter=()=>{const text=$("#package-search")?.value.toLowerCase()||"";const cats=[...document.querySelectorAll("[name=package-category]:checked")].map(x=>x.value);const durations=[...document.querySelectorAll("[name=duration]:checked")].map(x=>x.value);const sort=$("#package-sort")?.value||"popular";let list=getPkgs().filter(p=>(!text||p.name.toLowerCase().includes(text)||p.destination.toLowerCase().includes(text))&&(!cats.length||cats.includes(p.category))&&(!durations.length||durations.some(d=>(d==="short"&&p.duration<=5)||(d==="medium"&&p.duration>=6&&p.duration<=7)||(d==="long"&&p.duration>=8))));if(sort==="price-low")list.sort((a,b)=>a.price-b.price);if(sort==="price-high")list.sort((a,b)=>b.price-a.price);else if(sort==="popular")list.sort((a,b)=>b.popularity-a.popularity);$("#package-results").innerHTML=list.length?list.map(packageCard).join(""):`<div class="empty" style="grid-column:1/-1">No journeys match those filters.</div>`;icons();bind()}
  $("#package-search")?.addEventListener("input",pkgFilter);$("#package-sort")?.addEventListener("change",pkgFilter);document.querySelectorAll("[name=package-category],[name=duration]").forEach(x=>x.addEventListener("change",pkgFilter));

  const hotelFilter=()=>{const text=$("#hotel-search")?.value.toLowerCase()||"";const stars=[...document.querySelectorAll("[name=stars]:checked")].map(x=>+x.value);const am=[...document.querySelectorAll("[name=amenity]:checked")].map(x=>x.value);let list=getHotels().filter(h=>(!text||h.name.toLowerCase().includes(text)||h.destination.toLowerCase().includes(text))&&(!stars.length||stars.includes(h.stars))&&(!am.length||am.every(a=>h.amenities.includes(a))));if($("#hotel-sort")?.value==="low")list.sort((a,b)=>a.price-b.price);else list.sort((a,b)=>b.rating-a.rating);$("#hotel-results").innerHTML=list.length?list.map(hotelCard).join(""):`<div class="empty" style="grid-column:1/-1">No stays match those filters.</div>`;icons();bind()}
  $("#hotel-search")?.addEventListener("input",hotelFilter);$("#hotel-sort")?.addEventListener("change",hotelFilter);document.querySelectorAll("[name=stars],[name=amenity]").forEach(x=>x.addEventListener("change",hotelFilter));

  const flightFilter=()=>{const text1=$("#flight-from")?.value.toLowerCase(),text2=$("#flight-to")?.value.toLowerCase();const times=[...document.querySelectorAll("[name=flight-time]:checked")].map(x=>x.value);const nonstop=document.querySelector("[name=stops]:checked");let list=flights.filter(f=>(!text1||f.from.toLowerCase().includes(text1)||f.to.toLowerCase().includes(text1))&&(!text2||f.to.toLowerCase().includes(text2))&&(!times.length||times.includes(f.time))&&(!nonstop||f.stops==="Nonstop"));if($("#flight-sort")?.value==="duration")list.sort((a,b)=>a.duration.localeCompare(b.duration));else list.sort((a,b)=>a.price-b.price);$("#flight-results").innerHTML=list.length?list.map(flightCard).join(""):`<div class="empty">No flights match those filters.</div>`;$("#flight-count").textContent=`${list.length} flights`;icons();bind()}
  $("#swap-flights")?.addEventListener("click",()=>{const from=$("#flight-from"),to=$("#flight-to");[from.value,to.value]=[to.value,from.value];flightFilter()});
  $("#trip-type")?.addEventListener("change",()=>{const returnField=$("#flight-return");returnField.disabled=$("#trip-type").value==="one";if(returnField.disabled)returnField.value=""});
  if($("#flight-depart"))$("#flight-depart").min=today;
  if($("#flight-return"))$("#flight-return").min=today;
  $("#flight-depart")?.addEventListener("change",()=>{if($("#flight-depart").value){$("#flight-return").min=$("#flight-depart").value}});
  $("#flight-search")?.addEventListener("submit",e=>{e.preventDefault();const depart=$("#flight-depart").value,ret=$("#flight-return").value;if(!depart||(ret&&!$("#flight-return").disabled&&ret<depart)){toast("Choose valid departure and return dates");return}if($("#flight-from").value.trim().toLowerCase()===$("#flight-to").value.trim().toLowerCase()){toast("Origin and destination must be different");return}flightFilter()});$("#flight-sort")?.addEventListener("change",flightFilter);document.querySelectorAll("[name=flight-time],[name=stops]").forEach(x=>x.addEventListener("change",flightFilter));

  $("#register-form")?.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.target),users=read("velora_users",[]);if(d.get("password")!==d.get("confirm"))return showAuth("Passwords do not match.","error");if(users.some(u=>u.email.toLowerCase()===d.get("email").toLowerCase().trim()))return showAuth("An account already exists with this email.","error");const u={id:"u"+Date.now(),name:d.get("name"),email:d.get("email").trim(),phone:d.get("phone"),password:d.get("password"),role:"customer",status:"Active"};users.push(u);write("velora_users",users);setUser(u);showAuth("Account created successfully.","success");setTimeout(()=>location.hash="#dashboard",500)});
  $("#login-form")?.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.target),users=read("velora_users",[]);const u=users.find(x=>x.email.toLowerCase()===d.get("email").toLowerCase().trim()&&x.password===d.get("password"));if(!u)return showAuth("Email or password is incorrect.","error");setUser(u);showAuth("Welcome back.","success");setTimeout(()=>location.hash="#dashboard",300)});
  $("#forgot-form")?.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.target),email=d.get("email").trim(),users=read("velora_users",[]);if(!email)return showAuth("Enter your email address.","error");if(!users.some(u=>u.email.toLowerCase()===email.toLowerCase()))return showAuth("No demo account uses that email.","error");showAuth("Reset instructions are simulated; use your existing demo password.","success")});
  document.querySelector("[data-show-password]")?.addEventListener("click",e=>{const input=e.currentTarget.parentElement.querySelector("input");input.type=input.type==="password"?"text":"password"});

  if($("#package-date")){$("#package-date").min=today}
  if($("#hotel-in")){$("#hotel-in").min=today}
  if($("#hotel-out")){$("#hotel-out").min=today}
  $("#hotel-in")?.addEventListener("change",()=>{if($("#hotel-in").value)$("#hotel-out").min=$("#hotel-in").value});
  $("#book-package")?.addEventListener("click",e=>{const u=getUser();if(!u){location.hash="#login";toast("Sign in to reserve");return}const p=getPkgs().find(x=>x.id===e.currentTarget.dataset.id);const date=$("#package-date").value;if(!date||date<today)return toast("Choose a valid departure date");const guests=+$("#package-guests").value||2;createBooking("Tour",p.destination,p.price*guests,date,u)});
  $("#book-hotel")?.addEventListener("click",e=>{const u=getUser();if(!u){location.hash="#login";toast("Sign in to reserve");return}const h=getHotels().find(x=>x.id===e.currentTarget.dataset.id),iin=$("#hotel-in").value,iout=$("#hotel-out").value;if(!iin||!iout||iin<today||iout<=iin)return toast("Choose valid check-in and check-out dates");const nights=Math.ceil((new Date(iout)-new Date(iin))/86400000);createBooking("Hotel",h.name,h.price*nights,iin,u)});
  document.querySelectorAll("[data-book-flight]").forEach(b=>b.addEventListener("click",()=>{const u=getUser();if(!u){location.hash="#login";toast("Sign in to reserve");return}const f=flights.find(x=>x.id===b.dataset.bookFlight);createBooking("Flight",`${f.from} to ${f.to}`,f.price,"2026-12-10",u)}));

  document.querySelectorAll("[data-cancel]").forEach(b=>b.addEventListener("click",()=>{const all=read("velora_bookings",[]),x=all.find(v=>v.id===b.dataset.cancel);if(x){x.status="Cancelled";write("velora_bookings",all);toast("Booking cancelled");render()}}));
  document.querySelectorAll("[data-dash-tab]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-dash-tab]").forEach(x=>x.classList.remove("active"));b.classList.add("active");const u=getUser(),bookings=read("velora_bookings",[]).filter(v=>v.userId===u.id),target=$("#dashboard-content");if(b.dataset.dashTab==="overview")target.innerHTML=dashboardOverview(u,bookings,read("velora_wishlist",[]));if(b.dataset.dashTab==="bookings")target.innerHTML=`<h2 style="font:38px var(--serif)">My bookings</h2>${bookingTable(bookings)}`;if(b.dataset.dashTab==="wishlist"){const ids=read("velora_wishlist",[]);const ds=getDest().filter(d=>ids.includes(d.id));target.innerHTML=`<h2 style="font:38px var(--serif)">Saved places</h2><div class="grid-list">${ds.length?ds.map(destinationCard).join(""):`<div class="empty" style="grid-column:1/-1">Your wishlist is empty.</div>`}</div>`}if(b.dataset.dashTab==="profile")target.innerHTML=`<h2 style="font:38px var(--serif)">Profile</h2><form class="form" id="profile-form"><label>Full name</label><input name="name" value="${esc(u.name)}"><label>Email</label><input name="email" type="email" value="${esc(u.email)}"><label>Phone</label><input name="phone" value="${esc(u.phone||"")}"><button class="btn btn-primary" type="submit" style="margin-top:16px">Save changes</button></form>`;icons();bind()}));
  $("#profile-form")?.addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.target),u=getUser(),users=read("velora_users",[]),idx=users.findIndex(x=>x.id===u.id),updated={...u,name:d.get("name"),email:d.get("email"),phone:d.get("phone")};users[idx]=updated;write("velora_users",users);setUser(updated);toast("Profile updated");render()});

  $("#contact-form")?.addEventListener("submit",e=>{e.preventDefault();$("#contact-message").innerHTML=`<div class="auth-success" style="margin-top:12px">Thank you. Your message has been received.</div>`;e.target.reset()});
  document.querySelectorAll("[data-enquire]").forEach(b=>b.addEventListener("click",()=>toast(`Availability request sent for ${b.dataset.enquire}`)));
  document.querySelectorAll("[data-review]").forEach(b=>b.addEventListener("click",()=>{if(!getUser()){location.hash="#login";toast("Sign in to write a review");return}modal(`<form class="form" id="review-form"><label>Rating</label><select name="rating"><option value="5">5 — Exceptional</option><option value="4">4 — Excellent</option><option value="3">3 — Good</option><option value="2">2 — Fair</option><option value="1">1 — Poor</option></select><label>Your review</label><textarea name="comment" required></textarea><button class="btn btn-primary" type="submit" style="margin-top:16px">Submit review</button></form>`);$("#review-form").dataset.item=b.dataset.review;$("#review-form").addEventListener("submit",e=>{e.preventDefault();const d=new FormData(e.target),u=getUser(),reviews=read("velora_reviews",[]);reviews.push({id:"r"+Date.now(),name:u.name,rating:+d.get("rating"),itemId:e.target.dataset.item,comment:d.get("comment"),date:new Date().toISOString().slice(0,10)});write("velora_reviews",reviews);closeModal();toast("Review submitted");render()})}));
  document.querySelector("[data-close-modal]")?.addEventListener("click",closeModal);

  document.querySelectorAll("[data-gallery-filter]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-gallery-filter]").forEach(x=>{x.className="btn btn-outline"});b.className="btn btn-primary";const c=b.dataset.galleryFilter;document.querySelectorAll("[data-gallery-country]").forEach(img=>img.style.display=c==="All"||img.dataset.galleryCountry===c?"block":"none")}));
  const gallery=[...document.querySelectorAll("[data-gallery-index]")];gallery.forEach(img=>img.addEventListener("click",()=>openLightbox(gallery.indexOf(img),gallery)));
}

function openLightbox(index,items){
  let current=index;const el=document.createElement("div");el.className="lightbox";el.innerHTML=`<button class="close" aria-label="Close"><i data-lucide="x"></i></button><button class="prev" aria-label="Previous"><i data-lucide="chevron-left"></i></button><img src="${items[current].src}" alt="${esc(items[current].alt)}"><button class="next" aria-label="Next"><i data-lucide="chevron-right"></i></button>`;document.body.append(el);icons();
  const update=()=>{el.querySelector("img").src=items[current].src;el.querySelector("img").alt=items[current].alt};el.querySelector(".close").addEventListener("click",()=>el.remove());el.querySelector(".prev").addEventListener("click",()=>{current=(current-1+items.length)%items.length;update()});el.querySelector(".next").addEventListener("click",()=>{current=(current+1)%items.length;update()});el.addEventListener("click",e=>{if(e.target===el)el.remove()});
}
function showAuth(message,type){const el=$("#auth-message");el.innerHTML=`<div class="auth-${type}">${esc(message)}</div>`}
function createBooking(type,destination,price,travelDate,u){
  const all=read("velora_bookings",[]),id="VEL-"+Math.floor(1000+Math.random()*8999);all.unshift({id,type,destination,date:new Date().toISOString().slice(0,10),travelDate,price,status:"Confirmed",userId:u.id});write("velora_bookings",all);modal(`<div style="text-align:center;padding:20px"><div style="width:64px;height:64px;border-radius:50%;background:#edf5ef;color:#24643d;margin:auto;display:grid;place-items:center"><i data-lucide="check"></i></div><h2 style="font:38px var(--serif);margin:12px 0">Your reservation is confirmed</h2><p><b>${id}</b><br>${esc(destination)} · ${money(price)}</p><p style="color:var(--muted)">This is a demonstration booking. No payment or real reservation was made.</p><a class="btn btn-primary" href="#my-bookings" data-close-modal>View my bookings</a></div>`);icons();document.querySelector("[data-close-modal]")?.addEventListener("click",closeModal)
}

window.addEventListener("hashchange",route);

window.addEventListener("scroll",()=>{
  const navEl=$("#nav");
  if(navEl)navEl.classList.toggle("scrolled",window.scrollY>120);
},{passive:true});

document.addEventListener("error",(event)=>{
  if(event.target instanceof HTMLImageElement){
    event.target.src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=82";
  }
},true);

route();
