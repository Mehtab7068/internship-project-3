/*
 * Velora admin dashboard
 *
 * This file contains the small demo back-office used by the project.
 * All records are read from and written to localStorage, so no server is needed.
 */

import {
  destinations,
  packages,
  hotels
} from "../js/data.js";

// Short helpers keep repeated browser operations easy to read.
function findElement(selector) {
  return document.querySelector(selector);
}

function readFromStorage(key, fallbackValue) {
  try {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : fallbackValue;
  } catch (error) {
    // If saved JSON is damaged, start with a safe fallback value.
    return fallbackValue;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function createIcons() {
  if (window.lucide) {
    window.lucide.createIcons({
      attrs: { strokeWidth: 1.7 }
    });
  }
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  findElement("#toast-region").append(toast);

  setTimeout(() => toast.remove(), 2600);
}

function isAdminLoggedIn() {
  return sessionStorage.getItem("velora_admin") === "true";
}

// Seed demo data only when the browser does not already have it.
function initializeDemoData() {
  if (!readFromStorage("velora_users", null)) {
    saveToStorage("velora_users", [
      {
        id: "u1",
        name: "Elena Rossi",
        email: "customer@velora.com",
        phone: "+44 20 7946 0182",
        password: "Customer123!",
        role: "customer",
        status: "Active"
      }
    ]);
  }

  if (!readFromStorage("velora_destinations", null)) {
    saveToStorage("velora_destinations", destinations);
  }

  if (!readFromStorage("velora_packages", null)) {
    saveToStorage("velora_packages", packages);
  }

  if (!readFromStorage("velora_hotels", null)) {
    saveToStorage("velora_hotels", hotels);
  }

  if (!readFromStorage("velora_bookings", null)) {
    saveToStorage("velora_bookings", [
      {
        id: "VEL-2841",
        type: "Tour",
        destination: "Amalfi Coast",
        date: "2026-10-12",
        travelDate: "2026-12-05",
        price: 2480,
        status: "Confirmed",
        userId: "u1"
      }
    ]);
  }
}

initializeDemoData();

// ------------------------------
// Admin login
// ------------------------------

function renderLoginPage() {
  findElement("#admin-app").innerHTML = `
    <main class="admin-login">
      <form class="auth-box" id="admin-login">
        <a class="brand" href="../index.html" style="color:#173f35">
          <span class="brand-mark"><i data-lucide="compass"></i></span>
          VELORA
        </a>

        <h1 style="font:44px var(--serif);margin:18px 0 6px">Administration</h1>
        <p style="color:var(--muted)">Sign in to manage Velora operations.</p>

        <div class="form">
          <label>Email</label>
          <input name="email" type="email" required value="admin@velora.com">

          <label>Password</label>
          <input name="password" type="password" required value="Admin123!">

          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:16px">
            Sign in
          </button>
          <div id="admin-error"></div>
        </div>
      </form>
    </main>
  `;

  createIcons();

  findElement("#admin-login").addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const email = formData.get("email").toLowerCase().trim();
    const password = formData.get("password");

    if (email === "admin@velora.com" && password === "Admin123!") {
      sessionStorage.setItem("velora_admin", "true");
      renderDashboard();
      return;
    }

    findElement("#admin-error").innerHTML =
      '<div class="auth-error">Invalid demo credentials</div>';
  });
}

// ------------------------------
// Shared admin layout and table
// ------------------------------

function getAdminShell(pageContent, pageTitle = "Overview") {
  return `
    <div class="admin-shell">
      <aside class="admin-sidebar">
        <div class="brand">
          <span class="brand-mark"><i data-lucide="compass"></i></span>
          VELORA
        </div>

        <nav class="admin-nav">
          <button data-view="overview" ${pageTitle === "Overview" ? "class=active" : ""}>
            <i data-lucide="layout-dashboard"></i>Overview
          </button>
          <button data-view="users" ${pageTitle === "Users" ? "class=active" : ""}>
            <i data-lucide="users"></i>Users
          </button>
          <button data-view="destinations" ${pageTitle === "Destinations" ? "class=active" : ""}>
            <i data-lucide="map"></i>Destinations
          </button>
          <button data-view="packages" ${pageTitle === "Packages" ? "class=active" : ""}>
            <i data-lucide="luggage"></i>Packages
          </button>
          <button data-view="bookings" ${pageTitle === "Bookings" ? "class=active" : ""}>
            <i data-lucide="ticket"></i>Bookings
          </button>
        </nav>

        <button id="admin-logout" class="btn"
          style="margin-top:30px;width:100%;background:rgba(255,255,255,.1);color:white">
          <i data-lucide="log-out"></i>Sign out
        </button>
      </aside>

      <main class="admin-main">
        <div class="admin-top">
          <h1>${pageTitle}</h1>
          <a class="btn btn-outline" href="../index.html">View website</a>
        </div>
        ${pageContent}
      </main>
    </div>
  `;
}

function getTable(headers, rows) {
  return `
    <div class="table-wrap">
      <table class="table admin-table">
        <thead>
          <tr>${headers.map(header => `<th>${header}</th>`).join("")}</tr>
        </thead>
        <tbody>${rows.join("")}</tbody>
      </table>
    </div>
  `;
}

function attachShellEvents() {
  document.querySelectorAll("[data-view]").forEach(button => {
    button.addEventListener("click", () => {
      const viewName = button.dataset.view;

      if (viewName === "overview") renderOverview();
      if (viewName === "users") renderUsers();
      if (viewName === "destinations") renderDestinations();
      if (viewName === "packages") renderPackages();
      if (viewName === "bookings") renderBookings();
    });
  });

  findElement("#admin-logout")?.addEventListener("click", () => {
    sessionStorage.removeItem("velora_admin");
    renderLoginPage();
  });

  createIcons();
}

// ------------------------------
// Overview page
// ------------------------------

function renderOverview() {
  const users = readFromStorage("velora_users", []);
  const bookings = readFromStorage("velora_bookings", []);
  const destinationsList = readFromStorage("velora_destinations", []);
  const packagesList = readFromStorage("velora_packages", []);

  const pageContent = `
    <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="stat"><span>Total users</span><strong>${users.length}</strong></div>
      <div class="stat"><span>Total bookings</span><strong>${bookings.length}</strong></div>
      <div class="stat"><span>Destinations</span><strong>${destinationsList.length}</strong></div>
      <div class="stat"><span>Packages</span><strong>${packagesList.length}</strong></div>
    </div>

    <h2 style="font:34px var(--serif);margin-top:36px">Recent bookings</h2>
    ${getTable(
      ["Reference", "Guest", "Type", "Destination", "Status"],
      bookings.slice(0, 8).map(booking => {
        const guest = users.find(user => user.id === booking.userId);
        return `
          <tr>
            <td>${booking.id}</td>
            <td>${guest?.name || "Guest"}</td>
            <td>${booking.type}</td>
            <td>${booking.destination}</td>
            <td>
              <span class="status ${booking.status.toLowerCase()}">${booking.status}</span>
            </td>
          </tr>
        `;
      })
    )}
  `;

  findElement("#admin-app").innerHTML = getAdminShell(pageContent, "Overview");
  attachShellEvents();
}

// ------------------------------
// User management
// ------------------------------

function getUserRows(users) {
  return users.map(user => `
    <tr>
      <td><b>${user.name}</b></td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>
        <button class="btn btn-outline" style="min-height:34px"
          data-toggle-user="${user.id}">
          ${user.status}
        </button>
      </td>
      <td>
        <div class="admin-actions">
          <button title="Edit" data-edit-user="${user.id}">
            <i data-lucide="pencil"></i>
          </button>
          <button title="Delete" data-delete-user="${user.id}">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </td>
    </tr>
  `);
}

function renderUsers() {
  const users = readFromStorage("velora_users", []);
  const pageContent = `
    <div class="admin-toolbar">
      <input id="admin-search" placeholder="Search users">
    </div>
    <div id="admin-list">
      ${getTable(
        ["Name", "Email", "Role", "Status", "Actions"],
        getUserRows(users)
      )}
    </div>
  `;

  findElement("#admin-app").innerHTML = getAdminShell(pageContent, "Users");
  attachShellEvents();
  attachCrudEvents();

  findElement("#admin-search").addEventListener("input", event => {
    const searchText = event.target.value.toLowerCase().trim();
    const filteredUsers = readFromStorage("velora_users", []).filter(user =>
      user.name.toLowerCase().includes(searchText) ||
      user.email.toLowerCase().includes(searchText)
    );

    findElement("#admin-list").innerHTML = getTable(
      ["Name", "Email", "Role", "Status", "Actions"],
      getUserRows(filteredUsers)
    );

    createIcons();
    attachCrudEvents();
  });
}

// ------------------------------
// Destination and package management
// ------------------------------

function renderDestinations() {
  const destinationList = readFromStorage("velora_destinations", []);
  const pageContent = `
    <div class="admin-toolbar">
      <input id="admin-search" placeholder="Search destinations">
      <button class="btn btn-primary" id="add-destination">Add destination</button>
    </div>
    <div id="admin-list">
      ${getTable(
        ["Destination", "Country", "Style", "Price", "Actions"],
        destinationList.map(destination => `
          <tr>
            <td><b>${destination.name}</b></td>
            <td>${destination.country}</td>
            <td>${destination.category}</td>
            <td>$${destination.price}</td>
            <td>
              <div class="admin-actions">
                <button data-edit-destination="${destination.id}">
                  <i data-lucide="pencil"></i>
                </button>
                <button data-delete-destination="${destination.id}">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </td>
          </tr>
        `)
      )}
    </div>
  `;

  findElement("#admin-app").innerHTML = getAdminShell(pageContent, "Destinations");
  attachShellEvents();

  findElement("#add-destination").addEventListener("click", () => {
    openCrudModal("destination", null);
  });

  findElement("#admin-search").addEventListener("input", event => {
    const searchText = event.target.value.toLowerCase().trim();
    const filteredDestinations = readFromStorage("velora_destinations", [])
      .filter(destination =>
        destination.name.toLowerCase().includes(searchText) ||
        destination.country.toLowerCase().includes(searchText)
      );

    findElement("#admin-list").innerHTML = getTable(
      ["Destination", "Country", "Style", "Price", "Actions"],
      filteredDestinations.map(destination => `
        <tr>
          <td>${destination.name}</td>
          <td>${destination.country}</td>
          <td>${destination.category}</td>
          <td>$${destination.price}</td>
          <td>
            <div class="admin-actions">
              <button data-edit-destination="${destination.id}">
                <i data-lucide="pencil"></i>
              </button>
              <button data-delete-destination="${destination.id}">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `)
    );

    createIcons();
    attachCrudEvents();
  });

  attachCrudEvents();
}

function renderPackages() {
  const packageList = readFromStorage("velora_packages", []);
  const pageContent = `
    <div class="admin-toolbar">
      <input id="admin-search" placeholder="Search packages">
      <button class="btn btn-primary" id="add-package">Add package</button>
    </div>
    <div id="admin-list">
      ${getTable(
        ["Package", "Destination", "Days", "Price", "Actions"],
        packageList.map(travelPackage => `
          <tr>
            <td><b>${travelPackage.name}</b></td>
            <td>${travelPackage.destination}</td>
            <td>${travelPackage.duration}</td>
            <td>$${travelPackage.price}</td>
            <td>
              <div class="admin-actions">
                <button data-edit-package="${travelPackage.id}">
                  <i data-lucide="pencil"></i>
                </button>
                <button data-delete-package="${travelPackage.id}">
                  <i data-lucide="trash-2"></i>
                </button>
              </div>
            </td>
          </tr>
        `)
      )}
    </div>
  `;

  findElement("#admin-app").innerHTML = getAdminShell(pageContent, "Packages");
  attachShellEvents();

  findElement("#add-package").addEventListener("click", () => {
    openCrudModal("package", null);
  });

  findElement("#admin-search").addEventListener("input", event => {
    const searchText = event.target.value.toLowerCase().trim();
    const filteredPackages = readFromStorage("velora_packages", [])
      .filter(travelPackage =>
        travelPackage.name.toLowerCase().includes(searchText) ||
        travelPackage.destination.toLowerCase().includes(searchText)
      );

    findElement("#admin-list").innerHTML = getTable(
      ["Package", "Destination", "Days", "Price", "Actions"],
      filteredPackages.map(travelPackage => `
        <tr>
          <td>${travelPackage.name}</td>
          <td>${travelPackage.destination}</td>
          <td>${travelPackage.duration}</td>
          <td>$${travelPackage.price}</td>
          <td>
            <div class="admin-actions">
              <button data-edit-package="${travelPackage.id}">
                <i data-lucide="pencil"></i>
              </button>
              <button data-delete-package="${travelPackage.id}">
                <i data-lucide="trash-2"></i>
              </button>
            </div>
          </td>
        </tr>
      `)
    );

    createIcons();
    attachCrudEvents();
  });

  attachCrudEvents();
}

// ------------------------------
// Booking management
// ------------------------------

function getBookingRows(bookings) {
  const users = readFromStorage("velora_users", []);

  return bookings.map(booking => {
    const guest = users.find(user => user.id === booking.userId);
    return `
      <tr>
        <td>${booking.id}</td>
        <td>${guest?.name || "Guest"}</td>
        <td>${booking.type}</td>
        <td>${booking.destination}</td>
        <td>
          <select data-status="${booking.id}">
            <option ${booking.status === "Confirmed" ? "selected" : ""}>Confirmed</option>
            <option ${booking.status === "Pending" ? "selected" : ""}>Pending</option>
            <option ${booking.status === "Completed" ? "selected" : ""}>Completed</option>
            <option ${booking.status === "Cancelled" ? "selected" : ""}>Cancelled</option>
          </select>
        </td>
        <td>
          <div class="admin-actions">
            <button data-delete-booking="${booking.id}" title="Cancel">
              <i data-lucide="ban"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
}

function filterBookings() {
  const searchText = findElement("#admin-search").value.toLowerCase();
  const selectedType = findElement("#booking-filter").value;

  const matchingBookings = readFromStorage("velora_bookings", [])
    .filter(booking => {
      const matchesType = !selectedType || booking.type === selectedType;
      const matchesSearch =
        !searchText ||
        booking.id.toLowerCase().includes(searchText) ||
        booking.destination.toLowerCase().includes(searchText);

      return matchesType && matchesSearch;
    });

  findElement("#admin-list").innerHTML = getTable(
    ["Reference", "Guest", "Type", "Destination", "Status", "Actions"],
    getBookingRows(matchingBookings)
  );

  createIcons();
  attachCrudEvents();
}

function renderBookings() {
  const bookings = readFromStorage("velora_bookings", []);
  const pageContent = `
    <div class="admin-toolbar">
      <input id="admin-search" placeholder="Search booking ID or destination">
      <select id="booking-filter">
        <option value="">All types</option>
        <option>Tour</option>
        <option>Hotel</option>
        <option>Flight</option>
      </select>
    </div>
    <div id="admin-list">
      ${getTable(
        ["Reference", "Guest", "Type", "Destination", "Status", "Actions"],
        getBookingRows(bookings)
      )}
    </div>
  `;

  findElement("#admin-app").innerHTML = getAdminShell(pageContent, "Bookings");
  attachShellEvents();

  findElement("#admin-search").addEventListener("input", filterBookings);
  findElement("#booking-filter").addEventListener("change", filterBookings);
  attachCrudEvents();
}

// ------------------------------
// Shared add/edit modal
// ------------------------------

function openCrudModal(typeName, existingItem) {
  const isEditing = Boolean(existingItem);
  const item = existingItem || {};

  let formFields = "";

  if (typeName === "destination") {
    formFields = `
      <div class="admin-form-grid">
        <div class="form">
          <label>Name</label>
          <input name="name" value="${item.name || ""}" required>
        </div>
        <div class="form">
          <label>Country</label>
          <input name="country" value="${item.country || ""}" required>
        </div>
        <div class="form">
          <label>Category</label>
          <input name="category" value="${item.category || ""}" required>
        </div>
        <div class="form">
          <label>Starting price</label>
          <input name="price" type="number" min="0" value="${item.price || ""}" required>
        </div>
      </div>
    `;
  } else {
    formFields = `
      <div class="admin-form-grid">
        <div class="form">
          <label>Name</label>
          <input name="name" value="${item.name || ""}" required>
        </div>
        <div class="form">
          <label>Destination</label>
          <input name="destination" value="${item.destination || ""}" required>
        </div>
        <div class="form">
          <label>Duration</label>
          <input name="duration" type="number" min="1"
            value="${item.duration || ""}" required>
        </div>
        <div class="form">
          <label>Price</label>
          <input name="price" type="number" min="0"
            value="${item.price || ""}" required>
        </div>
      </div>
    `;
  }

  const modal = document.createElement("div");
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal">
      <div class="modal-head">
        <h2>${isEditing ? "Edit" : "Add"} ${typeName}</h2>
        <button type="button" data-admin-close aria-label="Close">
          <i data-lucide="x"></i>
        </button>
      </div>

      <form class="form" id="admin-crud-form">
        ${formFields}
        <button type="submit" class="btn btn-primary" style="margin-top:16px">
          Save
        </button>
      </form>
    </div>
  `;

  document.body.append(modal);
  createIcons();

  modal.querySelector("[data-admin-close]").addEventListener("click", () => {
    modal.remove();
    document.removeEventListener("keydown", handleModalEscape);
  });

  const handleModalEscape = event => {
    if (event.key === "Escape") {
      modal.remove();
      document.removeEventListener("keydown", handleModalEscape);
    }
  };
  document.addEventListener("keydown", handleModalEscape);

  modal.querySelector("form").addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const storageKey =
      typeName === "destination"
        ? "velora_destinations"
        : "velora_packages";

    const savedList = readFromStorage(storageKey, []);
    const name = formData.get("name").trim();
    const price = Number(formData.get("price"));

    if (!name || Number.isNaN(price) || price < 0) {
      showToast("Name and a valid price are required");
      return;
    }

    const savedItem = {
      ...item,
      id: item.id || typeName[0] + Date.now(),
      name,
      country: typeName === "destination"
        ? formData.get("country").trim()
        : item.country,
      destination: typeName === "destination"
        ? item.destination || formData.get("country").trim()
        : formData.get("destination").trim(),
      category: typeName === "destination"
        ? formData.get("category").trim()
        : item.category || "Culture",
      duration: typeName === "destination"
        ? (
            typeof item.duration === "string" && item.duration.includes("days")
              ? item.duration
              : destinations.find(destination => destination.id === item.id)?.duration || "7 days"
          )
        : Number(formData.get("duration") || item.duration || 5),
      price,
      rating: item.rating || 4.8,
      popularity: item.popularity || 75,
      image: item.image ||
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85",
      description: item.description || "A thoughtfully curated Velora journey.",
      highlights: item.highlights || [
        formData.get("category")?.trim() || "Local culture",
        "Signature landscapes",
        "Exceptional hospitality"
      ],
      best: item.best || "Most of the year, depending on local weather",
      itinerary: item.itinerary || [
        ["Arrival", "Meet your local host"],
        ["Explore", "Discover the destination"],
        ["Departure", "Private transfer"]
      ],
      included: item.included || ["Accommodation", "Breakfast"],
      excluded: item.excluded || ["Flights"]
    };

    if (isEditing) {
      const itemIndex = savedList.findIndex(record => record.id === item.id);
      if (itemIndex >= 0) {
        savedList[itemIndex] = savedItem;
      }
    } else {
      savedList.push(savedItem);
    }

    saveToStorage(storageKey, savedList);
    modal.remove();
    showToast(`${typeName === "destination" ? "Destination" : "Package"} saved`);
    renderDashboard();
  });
}

// ------------------------------
// Button actions for all tables
// ------------------------------

function attachCrudEvents() {
  document.querySelectorAll("[data-delete-user]").forEach(button => {
    button.addEventListener("click", () => {
      const users = readFromStorage("velora_users", []);
      const remainingUsers = users.filter(
        user => user.id !== button.dataset.deleteUser
      );

      saveToStorage("velora_users", remainingUsers);
      showToast("User deleted");
      renderUsers();
    });
  });

  document.querySelectorAll("[data-toggle-user]").forEach(button => {
    button.addEventListener("click", () => {
      const users = readFromStorage("velora_users", []);
      const selectedUser = users.find(
        user => user.id === button.dataset.toggleUser
      );

      if (selectedUser) {
        selectedUser.status =
          selectedUser.status === "Active" ? "Inactive" : "Active";
        saveToStorage("velora_users", users);
        showToast("Status updated");
        renderUsers();
      }
    });
  });

  document.querySelectorAll("[data-edit-user]").forEach(button => {
    button.addEventListener("click", () => {
      const users = readFromStorage("velora_users", []);
      const selectedUser = users.find(
        user => user.id === button.dataset.editUser
      );

      if (!selectedUser) return;

      const newName = prompt("User name", selectedUser.name);
      if (newName) {
        selectedUser.name = newName;
        saveToStorage("velora_users", users);
        showToast("User updated");
        renderUsers();
      }
    });
  });

  document.querySelectorAll("[data-delete-destination]").forEach(button => {
    button.addEventListener("click", () => {
      const destinationsList = readFromStorage("velora_destinations", [])
        .filter(destination =>
          destination.id !== button.dataset.deleteDestination
        );

      saveToStorage("velora_destinations", destinationsList);
      showToast("Destination deleted");
      renderDestinations();
    });
  });

  document.querySelectorAll("[data-edit-destination]").forEach(button => {
    button.addEventListener("click", () => {
      const destination = readFromStorage("velora_destinations", [])
        .find(item => item.id === button.dataset.editDestination);
      openCrudModal("destination", destination);
    });
  });

  document.querySelectorAll("[data-delete-package]").forEach(button => {
    button.addEventListener("click", () => {
      const packageList = readFromStorage("velora_packages", [])
        .filter(travelPackage =>
          travelPackage.id !== button.dataset.deletePackage
        );

      saveToStorage("velora_packages", packageList);
      showToast("Package deleted");
      renderPackages();
    });
  });

  document.querySelectorAll("[data-edit-package]").forEach(button => {
    button.addEventListener("click", () => {
      const travelPackage = readFromStorage("velora_packages", [])
        .find(item => item.id === button.dataset.editPackage);
      openCrudModal("package", travelPackage);
    });
  });

  document.querySelectorAll("[data-delete-booking]").forEach(button => {
    button.addEventListener("click", () => {
      const bookings = readFromStorage("velora_bookings", []);
      const selectedBooking = bookings.find(
        booking => booking.id === button.dataset.deleteBooking
      );

      if (selectedBooking) {
        selectedBooking.status = "Cancelled";
        saveToStorage("velora_bookings", bookings);
        showToast("Booking cancelled");
        renderBookings();
      }
    });
  });

  document.querySelectorAll("[data-status]").forEach(select => {
    select.addEventListener("change", () => {
      const bookings = readFromStorage("velora_bookings", []);
      const selectedBooking = bookings.find(
        booking => booking.id === select.dataset.status
      );

      if (selectedBooking) {
        selectedBooking.status = select.value;
        saveToStorage("velora_bookings", bookings);
        showToast("Booking status updated");
      }
    });
  });
}

// ------------------------------
// Application start
// ------------------------------

function renderDashboard() {
  if (!isAdminLoggedIn()) {
    renderLoginPage();
    return;
  }

  renderOverview();
}

renderDashboard();
