import CONFIG from "../config.js";
import { getToken } from "../auth.js";

const DetailPage = {
  async render() {
    return `<div id="detail"></div>`;
  },

  async afterRender({ id }) {
    const token = getToken();

    const res = await fetch(`${CONFIG.BASE_URL}/stories/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const { story } = await res.json();

    document.getElementById("detail").innerHTML = `
      <h2>${story.name}</h2>
      <img src="${story.photoUrl}" width="300"/>
      <p>${story.description}</p>
    `;
  },
};

export default DetailPage;
