import "../styles/styles.css";
import App from "./app.js";

document.addEventListener("DOMContentLoaded", async () => {
  if ("serviceWorker" in navigator) {
    try {
      await navigator.serviceWorker.register("/project-xyz/sw.js");
      console.log("Service Worker registered");
    } catch (err) {
      console.error("Service Worker gagal", err);
    }
  }

  const app = new App();
  app.render();

  window.addEventListener("hashchange", () => app.render());
});
