import { login } from "../api.js";
import { saveToken } from "../auth.js";

export default {
  render() {
    return `
      <h1>Login</h1>

      <form id="loginForm">
        <div>
          <label for="email">Email</label>
          <input type="email" id="email" required />
        </div>

        <div>
          <label for="password">Password</label>
          <input type="password" id="password" required />
        </div>

        <button type="submit">Login</button>

        <p id="message" aria-live="polite"></p>
      </form>

      <p>
        Belum punya akun?
        <a href="#/register">Register</a>
      </p>
    `;
  },

  async afterRender() {
    const form = document.getElementById("loginForm");
    const message = document.getElementById("message");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      message.textContent = "Sedang login...";

      const res = await login(email, password);

      if (res.error) {
        message.textContent = res.message;
        return;
      }

      saveToken(res.loginResult.token);
      message.textContent = "Login berhasil!";
      location.hash = "/home";
    });
  },
};
