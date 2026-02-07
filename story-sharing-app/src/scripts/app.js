import routes from "./routes.js";
import { isLoggedIn, logout } from "./auth.js";
import { initNotifToggle } from "./utils/notif.js";

export default class App {
  constructor() {
    this.main = document.getElementById("main");
    this.nav = document.getElementById("nav");
  }

  // Render navigation bar dengan aksesibilitas
  renderNav() {
    const userLoggedIn = isLoggedIn();

    this.nav.innerHTML = `
      <div style="
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:12px 20px;
        border-bottom:1px solid #eaeaea;
      ">
        <div style="display:flex; align-items:center; gap:16px;">
          ${
            userLoggedIn
              ? `
                <a href="#/home" style="text-decoration:none;color:#333;font-weight:500;">
                  Home
                </a>

                <a href="#/add" style="text-decoration:none;color:#333;font-weight:500;">
                  Tambah
                </a>

                <a href="#/favorites" style="text-decoration:none;color:#333;font-weight:500;">
                  Save
                </a>

                <!-- Checkbox Notifikasi dengan label untuk aksesibilitas -->
                <div class="form-check">
                  <input
                    type="checkbox"
                    id="notifToggle"
                    name="notification"
                    class="form-check-input"
                  />
                  <label for="notifToggle" class="form-check-label">
                    Notifikasi
                  </label>
                </div>
              `
              : `
                <a href="#/login" style="text-decoration:none;color:#333;font-weight:500;">
                  Login
                </a>
              `
          }
        </div>

        ${
          userLoggedIn
            ? `
              <button id="logoutBtn" style="
                padding:6px 14px;
                border:none;
                border-radius:6px;
                background:#ef4444;
                color:white;
                cursor:pointer;
                font-weight:500;
              ">
                Logout
              </button>
            `
            : ""
        }
      </div>
    `;

    // Event listener tombol logout
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);
  }

  // Render halaman sesuai route
  async render() {
    const url = location.hash.slice(1) || "/login";

    let page = routes[url];
    let params = {};

    // Cek dynamic route dengan parameter
    if (!page) {
      for (const route of Object.keys(routes)) {
        if (!route.includes(":")) continue;

        const routeParts = route.split("/");
        const urlParts = url.split("/");

        if (routeParts.length !== urlParts.length) continue;

        let matched = true;
        const tempParams = {};

        routeParts.forEach((part, index) => {
          if (part.startsWith(":")) {
            tempParams[part.slice(1)] = urlParts[index];
          } else if (part !== urlParts[index]) {
            matched = false;
          }
        });

        if (matched) {
          page = routes[route];
          params = tempParams;
          break;
        }
      }
    }

    // Jika page tidak ditemukan, redirect ke home
    if (!page) {
      location.hash = "/home";
      return;
    }

    // Render navigasi
    this.renderNav();

    // Render halaman utama
    const renderPage = async () => {
      this.main.innerHTML = await page.render(params);
      await page.afterRender?.(params);
      initNotifToggle();
    };

    // Dukungan animasi view transition jika ada
    if (document.startViewTransition) {
      document.startViewTransition(renderPage);
    } else {
      await renderPage();
    }
  }
}
