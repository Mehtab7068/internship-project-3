# Velora

Velora is a premium, frontend-only travel discovery and booking demonstration built with HTML5, CSS3, and vanilla JavaScript ES modules.

## Run locally

From the project root, start any static server, for example:

```powershell
python -m http.server 5500
```

Then open `http://localhost:5500`. Open `http://localhost:5500/admin/` for administration.

Using a static server is required for ES modules. Do not open `index.html` directly through `file://`.

## Demo accounts

- Customer: `customer@velora.com` / `Customer123!`
- Admin: `admin@velora.com` / `Admin123!`

Additional customer accounts can be created through the registration screen.

## Features

- Destination, package, hotel, and flight discovery
- Filters, sorting, search, and detail views
- Hotel and tour reservation simulations
- Wishlist and local customer dashboard
- Registration and demo login
- Booking history, cancellation, itinerary, reviews, gallery, and contact form
- Responsive customer experience
- Admin dashboard with user, destination, package, and booking management

## Data

Velora initializes demo data in `localStorage` only when a key is missing. User-generated and admin changes persist in the browser.
Flight demo bookings also save passenger names and the lead contact details in `velora_bookings`; use test details only. The demo does not collect passport or payment information.

Main keys:

- `velora_users`
- `velora_current_user`
- `velora_destinations`
- `velora_packages`
- `velora_hotels`
- `velora_flights`
- `velora_bookings`
- `velora_reviews`
- `velora_wishlist`

Corrupted JSON values are handled safely by the storage helpers.

## Structure

- `index.html` — customer application entry
- `css/` — shared design system and responsive styles
- `js/app.js` — customer routing and interactions
- `js/data.js` — initial destination, package, hotel, and flight data
- `admin/` — demo administration interface

This is a frontend simulation, not a production booking or authentication system. Credentials and mock bookings are stored in the browser and no real payments are processed.

## Code guide for beginners

- `index.html` is the main customer page. It loads the CSS and starts `js/app.js`.
- `js/app.js` decides which customer page to show from the URL hash, such as `#destinations`.
- `js/data.js` contains the starting destination, package, hotel, and flight records.
- `js/app.js` and `admin/admin.js` use small helper functions for `localStorage`. Their names begin with `readFromStorage` or `saveToStorage`.
- `admin/admin.js` is divided into clearly named sections: login, overview, users, destinations, packages, bookings, and add/edit actions.
- Browser data is stored under keys beginning with `velora_`. Clearing site data in browser settings resets the demo.
