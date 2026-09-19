/* ============================================================
   TAKTUK — Scripts
   ============================================================ */

function toggleMenu() {
  document.getElementById("mobile-menu")?.classList.toggle("open");
}

function openModal(type) {
  const modal = document.getElementById("modal");
  const title = document.getElementById("modal-title");
  const sub = document.getElementById("modal-sub");
  if (!modal) return;
  title.textContent = type === "login" ? "Log in" : "Sign up";
  sub.textContent = type === "login" ? "Welcome back to Taktuk" : "Create your Taktuk account";
  modal.classList.add("open");
}

function closeModal() {
  document.getElementById("modal")?.classList.remove("open");
}

document.getElementById("modal")?.addEventListener("click", (e) => {
  if (e.target.id === "modal") closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

document.querySelectorAll(".mobile-menu a").forEach((a) => {
  a.addEventListener("click", () =>
    document.getElementById("mobile-menu")?.classList.remove("open")
  );
});

/* Toast */
function showToast(msg, type = "default") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.className = "toast show" + (type !== "default" ? " " + type : "");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);
}

/* Sri Lankan cities for autocomplete */
const SRI_LANKA_CITIES = [
  { name: "Colombo Fort", region: "Western Province" },
  { name: "Colombo 3", region: "Kollupitiya" },
  { name: "Colombo 7", region: "Cinnamon Gardens" },
  { name: "Dehiwala", region: "Western Province" },
  { name: "Mount Lavinia", region: "Western Province" },
  { name: "Nugegoda", region: "Western Province" },
  { name: "Kotte", region: "Sri Jayawardenepura" },
  { name: "Battaramulla", region: "Western Province" },
  { name: "Kelaniya", region: "Western Province" },
  { name: "Negombo", region: "Western Province" },
  { name: "Gampaha", region: "Western Province" },
  { name: "Katunayake Airport", region: "Bandaranaike Intl" },
  { name: "Kandy", region: "Central Province" },
  { name: "Peradeniya", region: "Central Province" },
  { name: "Nuwara Eliya", region: "Central Province" },
  { name: "Galle", region: "Southern Province" },
  { name: "Unawatuna", region: "Southern Province" },
  { name: "Mirissa", region: "Southern Province" },
  { name: "Matara", region: "Southern Province" },
  { name: "Hikkaduwa", region: "Southern Province" },
  { name: "Bentota", region: "Southern Province" },
  { name: "Jaffna", region: "Northern Province" },
  { name: "Trincomalee", region: "Eastern Province" },
  { name: "Batticaloa", region: "Eastern Province" },
  { name: "Anuradhapura", region: "North Central" },
  { name: "Sigiriya", region: "Cultural Triangle" },
  { name: "Dambulla", region: "Central Province" },
  { name: "Ella", region: "Uva Province" },
  { name: "Badulla", region: "Uva Province" },
  { name: "Kurunegala", region: "North Western" },
  { name: "Ratnapura", region: "Sabaragamuwa" },
];

/* Attach autocomplete to an input */
function attachAutocomplete(inputId, listId, onSelect) {
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  if (!input || !list) return;

  let activeIndex = -1;

  function close() {
    list.classList.remove("open");
    list.innerHTML = "";
    activeIndex = -1;
  }

  function render(matches) {
    if (!matches.length) { close(); return; }
    list.innerHTML = matches.map((c, i) => `
      <div class="autocomplete-item" data-index="${i}">
        <span class="ac-icon">📍</span>
        <span class="ac-text">
          <span class="ac-name">${c.name}</span>
          <span class="ac-region">${c.region}</span>
        </span>
      </div>
    `).join("");
    list.classList.add("open");
    activeIndex = -1;

    list.querySelectorAll(".autocomplete-item").forEach((el, i) => {
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        select(matches[i]);
      });
    });
  }

  function select(city) {
    input.value = city.name;
    close();
    onSelect?.(city);
  }

  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { close(); return; }
    const matches = SRI_LANKA_CITIES
      .filter((c) =>
        c.name.toLowerCase().includes(q) || c.region.toLowerCase().includes(q)
      )
      .slice(0, 6);
    render(matches);
  });

  input.addEventListener("focus", () => {
    if (input.value.trim()) input.dispatchEvent(new Event("input"));
  });

  input.addEventListener("keydown", (e) => {
    const items = list.querySelectorAll(".autocomplete-item");
    if (!items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, items.length - 1);
      highlight(items);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      highlight(items);
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      items[activeIndex].dispatchEvent(new MouseEvent("mousedown"));
    } else if (e.key === "Escape") {
      close();
    }
  });

  function highlight(items) {
    items.forEach((el, i) => el.classList.toggle("active", i === activeIndex));
    items[activeIndex]?.scrollIntoView({ block: "nearest" });
  }

  document.addEventListener("click", (e) => {
    if (!input.contains(e.target) && !list.contains(e.target)) close();
  });
}

/* Fare calculation */
const RIDE_TYPES = {
  go:      { name: "Taktuk Go",      base: 150, perKm: 85,  icon: "🚗" },
  premier: { name: "Taktuk Premier", base: 250, perKm: 130, icon: "🚙" },
  tuk:     { name: "Taktuk Tuk",     base: 100, perKm: 60,  icon: "🛺" },
  moto:    { name: "Taktuk Moto",    base: 80,  perKm: 45,  icon: "🏍️" },
};

const CITY_COORDS = {
  "Colombo Fort": [6.9355, 79.8487],
  "Colombo 3": [6.9121, 79.8500],
  "Colombo 7": [6.9020, 79.8610],
  "Dehiwala": [6.8511, 79.8636],
  "Mount Lavinia": [6.8389, 79.8653],
  "Nugegoda": [6.8649, 79.8997],
  "Kotte": [6.8890, 79.9020],
  "Battaramulla": [6.8990, 79.9180],
  "Kelaniya": [6.9553, 79.9220],
  "Negombo": [7.2083, 79.8358],
  "Gampaha": [7.0917, 79.9997],
  "Katunayake Airport": [7.1808, 79.8841],
  "Kandy": [7.2906, 80.6337],
  "Peradeniya": [7.2599, 80.5970],
  "Nuwara Eliya": [6.9497, 80.7891],
  "Galle": [6.0535, 80.2210],
  "Unawatuna": [6.0100, 80.2500],
  "Mirissa": [5.9483, 80.4590],
  "Matara": [5.9485, 80.5353],
  "Hikkaduwa": [6.1395, 80.1063],
  "Bentota": [6.4261, 79.9959],
  "Jaffna": [9.6615, 80.0255],
  "Trincomalee": [8.5874, 81.2152],
  "Batticaloa": [7.7170, 81.7000],
  "Anuradhapura": [8.3114, 80.4037],
  "Sigiriya": [7.9570, 80.7603],
  "Dambulla": [7.8675, 80.6517],
  "Ella": [6.8667, 81.0466],
  "Badulla": [6.9934, 81.0550],
  "Kurunegala": [7.4863, 80.3647],
  "Ratnapura": [6.6828, 80.3992],
};

function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLon = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function estimateDistance(pickupName, dropoffName) {
  const a = CITY_COORDS[pickupName];
  const b = CITY_COORDS[dropoffName];
  if (!a || !b) return 8;
  return Math.max(1, haversineKm(a, b) * 1.35);
}

function estimateFare(distanceKm, type = "go") {
  const t = RIDE_TYPES[type];
  const total = t.base + t.perKm * distanceKm;
  const eta = Math.round(distanceKm * 2.5 + 3);
  return {
    total: Math.round(total / 10) * 10,
    eta,
    distanceKm: Math.round(distanceKm * 10) / 10,
  };
}

function updateFareDisplay(pickup, dropoff, type = "go", targetPrefix = "ride") {
  const fareEl = document.getElementById(`${targetPrefix}-fare`);
  if (!fareEl) return;

  if (!pickup || !dropoff || !CITY_COORDS[pickup] || !CITY_COORDS[dropoff]) {
    fareEl.hidden = true;
    return;
  }

  const distanceKm = estimateDistance(pickup, dropoff);
  const { total, eta } = estimateFare(distanceKm, type);

  document.getElementById(`${targetPrefix}-fare-amount`).textContent =
    `LKR ${total.toLocaleString()}`;
  document.getElementById(`${targetPrefix}-fare-detail`).textContent =
    `${distanceKm} km · ${RIDE_TYPES[type].name}`;
  document.getElementById(`${targetPrefix}-fare-badge`).textContent = `~ ${eta} min`;
  fareEl.hidden = false;
}

/* Leaflet map */
let rideMap, pickupMarker, dropoffMarker, routeLine;

function initRideMap() {
  const el = document.getElementById("ride-map");
  if (!el || typeof L === "undefined") return;

  rideMap = L.map(el, {
    center: [6.9271, 79.8612],
    zoom: 11,
    zoomControl: true,
    scrollWheelZoom: false,
  });

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
    maxZoom: 19,
  }).addTo(rideMap);

  setTimeout(() => rideMap?.invalidateSize(), 200);
}

function updateMapRoute(pickupName, dropoffName) {
  if (!rideMap || typeof L === "undefined") return;

  const a = CITY_COORDS[pickupName];
  const b = CITY_COORDS[dropoffName];

  if (pickupMarker) { rideMap.removeLayer(pickupMarker); pickupMarker = null; }
  if (dropoffMarker) { rideMap.removeLayer(dropoffMarker); dropoffMarker = null; }
  if (routeLine) { rideMap.removeLayer(routeLine); routeLine = null; }

  if (a) {
    pickupMarker = L.circleMarker(a, {
      radius: 9, color: "#fff", weight: 3, fillColor: "#2563EB", fillOpacity: 1,
    }).addTo(rideMap).bindPopup(`<strong>Pickup</strong><br>${pickupName}`);
  }
  if (b) {
    dropoffMarker = L.circleMarker(b, {
      radius: 9, color: "#fff", weight: 3, fillColor: "#FACC15", fillOpacity: 1,
    }).addTo(rideMap).bindPopup(`<strong>Dropoff</strong><br>${dropoffName}`);
  }

  if (a && b) {
    routeLine = L.polyline([a, b], {
      color: "#2563EB", weight: 4, dashArray: "8 6", opacity: 0.85,
    }).addTo(rideMap);
    rideMap.fitBounds(routeLine.getBounds(), { padding: [40, 40] });
  } else if (a || b) {
    rideMap.setView(a || b, 12);
  }
}

/* Homepage ride request */
function requestRide() {
  const pickup = document.getElementById("pickup")?.value.trim();
  const dropoff = document.getElementById("dropoff")?.value.trim();
  if (!pickup || !dropoff) return;

  const btn = document.getElementById("hero-request-btn");
  btn?.classList.add("loading");

  setTimeout(() => {
    btn?.classList.remove("loading");
    showToast(`🚗 Driver is on the way to ${pickup}`, "success");
  }, 1400);
}

function showPrices() {
  const pickup = document.getElementById("pickup")?.value.trim();
  const dropoff = document.getElementById("dropoff")?.value.trim();
  if (!pickup || !dropoff) {
    showToast("Please enter both pickup and dropoff first", "error");
    return;
  }
  const distanceKm = estimateDistance(pickup, dropoff);
  const lines = Object.entries(RIDE_TYPES).map(([key, t]) => {
    const { total } = estimateFare(distanceKm, key);
    return `${t.name}: LKR ${total.toLocaleString()}`;
  });
  showToast(lines.join(" · "));
}

/* Ride page */
function submitRide(event) {
  const pickup = document.getElementById("ride-pickup")?.value.trim();
  const dropoff = document.getElementById("ride-dropoff")?.value.trim();
  if (!pickup || !dropoff) return;

  const selected = document.querySelector(".ride-option.selected");
  const type = selected?.dataset.type || "go";
  const btn = document.getElementById("ride-submit");

  btn?.classList.add("loading");
  btn.textContent = "Finding your driver…";

  setTimeout(() => {
    btn?.classList.remove("loading");
    btn.textContent = "Confirm and request →";
    showToast(`✅ ${RIDE_TYPES[type].name} confirmed: ${pickup} → ${dropoff}`, "success");
  }, 1600);
}

function submitDrive() {
  showToast("✅ Application submitted! We'll contact you within 24 hours.", "success");
  document.getElementById("drive-form")?.reset();
}

/* Ride option selection */
document.querySelectorAll(".ride-option").forEach((option) => {
  const select = () => {
    document.querySelectorAll(".ride-option").forEach((o) => {
      o.classList.remove("selected");
      o.setAttribute("aria-checked", "false");
    });
    option.classList.add("selected");
    option.setAttribute("aria-checked", "true");

    const pickup = document.getElementById("ride-pickup")?.value.trim();
    const dropoff = document.getElementById("ride-dropoff")?.value.trim();
    updateFareDisplay(pickup, dropoff, option.dataset.type, "ride");
  };

  option.addEventListener("click", select);
  option.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      select();
    }
  });
});

/* Boot */
document.addEventListener("DOMContentLoaded", () => {
  // Homepage autocomplete
  if (document.getElementById("pickup")) {
    attachAutocomplete("pickup", "pickup-list", () => {
      const p = document.getElementById("pickup").value.trim();
      const d = document.getElementById("dropoff").value.trim();
      updateFareDisplay(p, d, "go", "hero");
    });
  }
  if (document.getElementById("dropoff")) {
    attachAutocomplete("dropoff", "dropoff-list", () => {
      const p = document.getElementById("pickup").value.trim();
      const d = document.getElementById("dropoff").value.trim();
      updateFareDisplay(p, d, "go", "hero");
    });
  }

  // Ride page autocomplete
  if (document.getElementById("ride-pickup")) {
    attachAutocomplete("ride-pickup", "ride-pickup-list", () => {
      const p = document.getElementById("ride-pickup").value.trim();
      const d = document.getElementById("ride-dropoff").value.trim();
      const type = document.querySelector(".ride-option.selected")?.dataset.type || "go";
      updateFareDisplay(p, d, type, "ride");
      updateMapRoute(p, d);
    });
  }
  if (document.getElementById("ride-dropoff")) {
    attachAutocomplete("ride-dropoff", "ride-dropoff-list", () => {
      const p = document.getElementById("ride-pickup").value.trim();
      const d = document.getElementById("ride-dropoff").value.trim();
      const type = document.querySelector(".ride-option.selected")?.dataset.type || "go";
      updateFareDisplay(p, d, type, "ride");
      updateMapRoute(p, d);
    });
  }

  // Leaflet map
  if (document.getElementById("ride-map")) {
    initRideMap();
  }
});