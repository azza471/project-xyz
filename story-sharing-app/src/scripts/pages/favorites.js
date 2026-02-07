import { initMap } from "../map.js";
import {
  getFavoriteStories,
  deleteFavoriteStory,
  isStoryFavorited,
} from "../utils/indexedDB.js";

export default {
  async render() {
    return `
      <section class="home-container">
        <h1>Saved Stories</h1>

        <div class="story-controls" style="margin-bottom:12px; display:flex; flex-wrap:wrap;">
          <label for="searchInput" style="font-weight:500;">
            Cari Cerita
          </label>
          <input 
            type="text" 
            id="searchInput" 
            placeholder="Cari cerita tersimpan..." 
            style="padding:6px 10px; border-radius:4px; border:1px solid #ccc;" 
          />
        </div>


        <div id="map" class="map-container" style="height:400px; margin-bottom:12px;"></div>

        <ul id="list" class="story-list"></ul>
      </section>
    `;
  },

  async afterRender() {
    const list = document.getElementById("list");
    const searchInput = document.getElementById("searchInput");

    let stories = await getFavoriteStories();

    const renderStories = async (data) => {
      list.innerHTML = "";

      if (!data || data.length === 0) {
        list.innerHTML = "<p>Belum ada cerita yang disimpan.</p>";
        return;
      }

      for (const story of data) {
        const isFav = await isStoryFavorited(story.id);

        const createdDate = new Date(story.createdAt).toLocaleDateString(
          "id-ID",
          { day: "numeric", month: "long", year: "numeric" },
        );

        list.innerHTML += `
          <li class="story-item">
            <img src="${story.photoUrl}" alt="Foto cerita" class="story-image"/>
            <div class="story-content">
              <h2>${story.name}</h2>
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

    await renderStories(stories);

    searchInput.addEventListener("input", async () => {
      const keyword = searchInput.value.toLowerCase();
      const filtered = stories.filter(
        (story) =>
          story.name.toLowerCase().includes(keyword) ||
          story.description.toLowerCase().includes(keyword),
      );
      await renderStories(filtered);
    });

    list.addEventListener("click", async (e) => {
      if (!e.target.classList.contains("fav-btn")) return;

      const id = e.target.dataset.id;
      await deleteFavoriteStory(id);

      stories = await getFavoriteStories();
      await renderStories(stories);
    });
  },
};
