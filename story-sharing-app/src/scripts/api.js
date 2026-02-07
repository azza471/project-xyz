const BASE_URL = "https://story-api.dicoding.dev/v1";

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function getStories(token) {
  const res = await fetch(`${BASE_URL}/stories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function addStory(token, data) {
  const form = new FormData();
  Object.entries(data).forEach(([k, v]) => v && form.append(k, v));

  const res = await fetch(`${BASE_URL}/stories`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return res.json();
}

export async function register(name, email, password) {
  const res = await fetch("https://story-api.dicoding.dev/v1/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return res.json();
}
