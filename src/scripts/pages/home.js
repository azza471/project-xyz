import { getStories } from "../api.js";
import { getToken } from "../auth.js";
import { initMap } from "../map.js";
import {
  saveStories,
  getAllStories,
  syncStoriesWhenOnline,
  saveFavoriteStory,
  deleteFavoriteStory,
  isStoryFavorited,
} from "../utils/indexedDB.js";

export default {
  async render() {
    return `
      <section class="home-container">
        <h1>Daftar Cerita</h1>
        <div id="connection-status"></div>

       <div class="story-controls" style="
  margin-bottom: 16px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-end;
">

  <div style="flex: 1 1 50%; display:flex; flex-direction:column; gap:6px;">
    <label for="searchInput" style="font-weight:500;">Cari Cerita</label>
    <input 
      type="text" 
      id="searchInput" 
      placeholder="Cari cerita..." 
      style="
        padding: 10px 12px;
        border-radius: 6px;
        border: 1px solid #ccc;
        width: 100%;
      " 
    />
  </div>

  <div style="flex: 1 1 50%; display:flex; flex-direction:column; gap:6px;">
    <label for="sortSelect" style="font-weight:500;">Urutkan</label>
    <select 
      id="sortSelect" 
      style="
        padding: 10px 12px;
        border-radius: 6px;
        border: 1px solid #ccc;
        width: 100%;
        cursor: pointer;
      "
    >
      <option value="desc">Terbaru</option>
      <option value="asc">Terlama</option>
    </select>
  </div>

</div>

        <div id="map" class="map-container" style="height:400px; margin-bottom:12px;"></div>

        <ul id="list" class="story-list"></ul>
      </section>
    `;
  },

  async afterRender() {
    const list = document.getElementById("list");
    const searchInput = document.getElementById("searchInput");
    const sortSelect = document.getElementById("sortSelect");
    const connectionStatus = document.getElementById("connection-status");

    let stories = [];
    const token = getToken();

    const sortStories = (data, order) => {
      return [...data].sort((a, b) => {
        return order === "asc"
          ? new Date(a.createdAt) - new Date(b.createdAt)
          : new Date(b.createdAt) - new Date(a.createdAt);
      });
    };

    const updateConnectionStatus = () => {
      connectionStatus.innerHTML = navigator.onLine
        ? `<div style="background:#e7f7e7;color:#2e7d32;padding:8px;border-radius:4px;margin-bottom:10px;">
            Online - Data telah disinkronkan
          </div>`
        : `<div style="background:#ffebee;color:#c62828;padding:8px;border-radius:4px;margin-bottom:10px;">
            Offline - Menampilkan data lokal
          </div>`;
    };

    updateConnectionStatus();
    window.addEventListener("online", updateConnectionStatus);
    window.addEventListener("offline", updateConnectionStatus);

    const renderStories = async (data) => {
      list.innerHTML = "";

      if (!data || data.length === 0) {
        list.innerHTML = "<p>Tidak ada cerita tersedia.</p>";
        return;
      }

      for (const story of data) {
        const isFav = await isStoryFavorited(story.id);

        const offlineIndicator = story.isOffline
          ? `<span style="background:#ff9800;color:white;padding:2px 6px;border-radius:10px;font-size:12px;margin-left:6px;">
              Offline
            </span>`
          : "";

        const createdDate = new Date(story.createdAt).toLocaleDateString(
          "id-ID",
          { day: "numeric", month: "long", year: "numeric" },
        );

        list.innerHTML += `
          <li class="story-item">
            <img src="${story.photoUrl}" alt="Foto cerita" class="story-image"/>
            <div class="story-content">
              <h2>${story.name} ${offlineIndicator}</h2>
              <p class="story-date">${createdDate}</p>
              <p class="story-description">${story.description}</p>
              <button 
                class="fav-btn"
                data-id="${story.id}"
                style="margin-top:6px;padding:4px 10px;cursor:pointer;"
              >
                ${isFav ? "Unsave" : "Save"}
              </button>
            </div>
          </li>
        `;
      }

      const storiesWithLocation = data.filter(
        (story) => story.lat && story.lon,
      );
      if (storiesWithLocation.length > 0) {
        initMap(storiesWithLocation);
      }
    };

    try {
      stories = await getAllStories();
      await renderStories(stories);

      if (navigator.onLine) {
        const res = await getStories(token);
        if (res?.listStory) {
          await saveStories(res.listStory);
          stories = await getAllStories();
          await renderStories(stories);
        }
      }
    } catch (err) {
      console.error(err);
      list.innerHTML = "<p>Gagal memuat cerita. Periksa koneksi internet.</p>";
    }

    syncStoriesWhenOnline(token, getStories);

    window.addEventListener("stories-synced", async () => {
      stories = await getAllStories();
      await renderStories(stories);
      updateConnectionStatus();
    });

    const applyFilter = async () => {
      const keyword = searchInput.value.toLowerCase();
      const filtered = stories.filter(
        (story) =>
          story.name.toLowerCase().includes(keyword) ||
          story.description.toLowerCase().includes(keyword),
      );
      const sorted = sortStories(filtered, sortSelect.value);
      await renderStories(sorted);
    };

    searchInput.addEventListener("input", applyFilter);
    sortSelect.addEventListener("change", applyFilter);

    list.addEventListener("click", async (e) => {
      if (!e.target.classList.contains("fav-btn")) return;

      const id = e.target.dataset.id;
      const story = stories.find((s) => s.id == id);
      if (!story) return;

      const isFav = await isStoryFavorited(id);

      if (isFav) {
        await deleteFavoriteStory(id);
        e.target.textContent = "Save";
      } else {
        await saveFavoriteStory(story);
        e.target.textContent = "Unsave";
      }
    });
  },
};
