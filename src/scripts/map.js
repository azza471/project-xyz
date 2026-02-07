let mapInstance;
let markersLayer;

export function initMap(stories) {
  // Buat map hanya sekali
  if (!mapInstance) {
    mapInstance = L.map("map").setView([-2.5, 118], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(mapInstance);

    markersLayer = L.layerGroup().addTo(mapInstance);
  } else {
    // Clear marker lama sebelum menambahkan marker baru
    markersLayer.clearLayers();
  }

  // Tambahkan marker baru
  stories.forEach((story) => {
    if (story.lat && story.lon) {
      const createdDate = new Date(story.createdAt).toLocaleDateString(
        "id-ID",
        { day: "numeric", month: "long", year: "numeric" },
      );

      const popupContent = `
        <div class="map-popup">
          <img
            src="${story.photoUrl}"
            alt="Foto cerita oleh ${story.name}"
            style="width:100%; border-radius:6px; margin-bottom:8px;"
          />
          <h3>${story.name}</h3>
          <p style="font-size:0.85rem; color:#555;">${createdDate}</p>
          <p>${story.description}</p>
        </div>
      `;

      L.marker([story.lat, story.lon])
        .bindPopup(popupContent)
        .addTo(markersLayer);
    }
  });
}
