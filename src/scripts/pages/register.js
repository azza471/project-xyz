import { register } from "../api.js";

export default {
  render() {
    return `
      <h1>Register Akun</h1>

       <form id="registerForm">
        <div>
          <label for="name">Nama</label>
          <input type="text" id="name" required />
        </div>

        <div>
          <label for="email">Email</label>
          <input type="email" id="email" required />
        </div>

        <div>
          <label for="password">Password</label>
          <input type="password" id="password" required minlength="8" />
        </div>

        <button type="submit">Register</button>
        <p id="message" aria-live="polite"></p>

        <p>
          Sudah punya akun?
          <a href="#/login">Login</a>
        </p>
      </form>
    `;
  },

  async afterRender() {
    const form = document.getElementById("registerForm");
    const message = document.getElementById("message");

    form.onsubmit = async (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      message.textContent = "Mendaftarkan akun...";

      const res = await register(name, email, password);

      if (res.error) {
        message.textContent = res.message;
        return;
      }

      message.textContent = "Registrasi berhasil! Silakan login.";
      setTimeout(() => {
        location.hash = "/login";
      }, 1200);
    };
  },
};
