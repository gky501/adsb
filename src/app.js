const config = window.ADSB_CONFIG;

const map = L.map("map", {
  zoomControl: false
}).setView(config.MAP_CENTER, config.MAP_ZOOM);

L.control.zoom({
  position: "bottomright"
}).addTo(map);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "&copy; OpenStreetMap contributors"
}).addTo(map);

const markers = new Map();
let latestAircraft = [];

const elements = {
  feedStatus: document.getElementById("feedStatus"),
  lastUpdated: document.getElementById("lastUpdated"),
  aircraftCount: document.getElementById("aircraftCount"),
  positionCount: document.getElementById("positionCount"),
  refreshRate: document.getElementById("refreshRate"),
  aircraftList: document.getElementById("aircraftList"),
  searchBox: document.getElementById("searchBox")
};

elements.refreshRate.textContent = `${config.REFRESH_SECONDS}s`;

function aircraftIcon(track = 0) {
  return L.divIcon({
    className: "",
    html: `<div class="aircraft-icon" style="transform: rotate(${Number(track) || 0}deg)">✈</div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
}

function cleanCallsign(ac) {
  return ac.flight ? ac.flight.trim() : ac.hex?.toUpperCase() || "UNKNOWN";
}

function formatValue(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "n/a";
  return `${value}${suffix}`;
}

function popupHtml(ac) {
  const callsign = cleanCallsign(ac);
  return `
    <strong>${callsign}</strong><br>
    Hex: ${formatValue(ac.hex)}<br>
    Altitude: ${formatValue(ac.alt_baro ?? ac.alt_geom, " ft")}<br>
    Speed: ${formatValue(ac.gs, " kt")}<br>
    Track: ${formatValue(ac.track, "°")}<br>
    Type: ${formatValue(ac.t)}
  `;
}

function updateMarkers(aircraftWithPosition) {
  const seen = new Set();

  aircraftWithPosition.forEach(ac => {
    const id = ac.hex;
    if (!id) return;

    seen.add(id);

    if (!markers.has(id)) {
      const marker = L.marker([ac.lat, ac.lon], {
        icon: aircraftIcon(ac.track)
      }).addTo(map);

      marker.bindPopup(popupHtml(ac));
      markers.set(id, marker);
    } else {
      const marker = markers.get(id);
      marker.setLatLng([ac.lat, ac.lon]);
      marker.setIcon(aircraftIcon(ac.track));
      marker.setPopupContent(popupHtml(ac));
    }
  });

  for (const [id, marker] of markers) {
    if (!seen.has(id)) {
      map.removeLayer(marker);
      markers.delete(id);
    }
  }
}

function renderList() {
  const query = elements.searchBox.value.trim().toLowerCase();

  const aircraft = latestAircraft
    .filter(ac => {
      const haystack = `${cleanCallsign(ac)} ${ac.hex || ""}`.toLowerCase();
      return haystack.includes(query);
    })
    .sort((a, b) => cleanCallsign(a).localeCompare(cleanCallsign(b)));

  if (!aircraft.length) {
    elements.aircraftList.innerHTML = `<div class="empty-state">No matching aircraft.</div>`;
    return;
  }

  elements.aircraftList.innerHTML = aircraft.map(ac => {
    const callsign = cleanCallsign(ac);
    const altitude = ac.alt_baro ?? ac.alt_geom;
    const hasPosition = ac.lat && ac.lon;

    return `
      <article class="aircraft-card" data-hex="${ac.hex || ""}">
        <div class="aircraft-title">
          <div>
            <div class="callsign">${callsign}</div>
            <div class="hex">${formatValue(ac.hex)}</div>
          </div>
          <div class="hex">${hasPosition ? "Mapped" : "No position"}</div>
        </div>

        <div class="aircraft-grid">
          <div class="datum">
            <span>Altitude</span>
            <strong>${formatValue(altitude, " ft")}</strong>
          </div>
          <div class="datum">
            <span>Speed</span>
            <strong>${formatValue(ac.gs, " kt")}</strong>
          </div>
          <div class="datum">
            <span>Track</span>
            <strong>${formatValue(ac.track, "°")}</strong>
          </div>
          <div class="datum">
            <span>Type</span>
            <strong>${formatValue(ac.t)}</strong>
          </div>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll(".aircraft-card").forEach(card => {
    card.addEventListener("click", () => {
      const hex = card.dataset.hex;
      const marker = markers.get(hex);
      if (marker) {
        map.setView(marker.getLatLng(), Math.max(map.getZoom(), 10));
        marker.openPopup();
      }
    });
  });
}

async function loadAircraft() {
  try {
    const response = await fetch(config.FEED_URL, { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    latestAircraft = data.aircraft || [];

    const withPosition = latestAircraft.filter(ac => ac.lat && ac.lon);

    elements.aircraftCount.textContent = latestAircraft.length;
    elements.positionCount.textContent = withPosition.length;
    elements.feedStatus.textContent = "Feed online";
    elements.feedStatus.classList.remove("offline");
    elements.feedStatus.classList.add("online");
    elements.lastUpdated.textContent = new Date().toLocaleTimeString();

    updateMarkers(withPosition);
    renderList();
  } catch (error) {
    elements.feedStatus.textContent = "Feed offline";
    elements.feedStatus.classList.remove("online");
    elements.feedStatus.classList.add("offline");
    elements.lastUpdated.textContent = "Check feed URL";
    console.error("Could not load ADS-B feed:", error);
  }
}

elements.searchBox.addEventListener("input", renderList);

loadAircraft();
setInterval(loadAircraft, config.REFRESH_SECONDS * 1000);
