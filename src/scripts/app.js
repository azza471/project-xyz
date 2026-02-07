import routes from "./routes.js";
import { isLoggedIn, logout } from "./auth.js";
import { initNotifToggle } from "./utils/notif.js";

export default class App {
  constructor() {
    this.main = document.getElementById("main");
    this.nav = document.getElementById("nav");
  }
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

              <label style="
                display:flex;
                align-items:center;
                gap:6px;
                cursor:pointer;
                font-size:14px;
                color:#444;
              ">
                <input type="checkbox" id="notifToggle" />
                <span>Notifikasi</span>
              </label>
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

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", logout);
  }

  async render() {
    const url = location.hash.slice(1) || "/login";

    let page = routes[url];
    let params = {};

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

    if (!page) {
      location.hash = "/home";
      return;
    }

    this.renderNav();

    const renderPage = async () => {
      this.main.innerHTML = await page.render(params);
      await page.afterRender?.(params);
      initNotifToggle();
    };

    if (document.startViewTransition) {
      document.startViewTransition(renderPage);
    } else {
      await renderPage();
    }
  }
}
