import { addStory } from "../api.js";
import { getToken } from "../auth.js";
import {
  addToStoryQueue,
  processStoryQueue,
  debugIndexedDB,
} from "../utils/indexedDB.js";

export default {
  async render() {
    return `
    <h1>Tambah Cerita</h1>

    <form id="addForm">
      <h2>Detail Cerita</h2>

      <div class="form-group">
        <label for="description">Deskripsi</label>
        <textarea 
          id="description" 
          name="description"
          required
          aria-required="true"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="photo">Gambar</label>
        <input 
          type="file" 
          id="photo" 
          name="photo"
          accept="image/*" 
          required
          aria-required="true"
          aria-describedby="photoHelp"
        />
        <small id="photoHelp">
          Pilih gambar dari perangkat atau ambil dari kamera
        </small>
      </div>

      <button 
        type="button" 
        id="openCamera"
        aria-label="Buka kamera untuk mengambil foto"
      >
        Ambil dari Kamera
      </button>

      <video 
        id="video" 
        autoplay 
        style="display:none; width:100%"
        aria-label="Pratinjau kamera"
      ></video>

      <button 
        type="button" 
        id="capture" 
        style="display:none"
        aria-label="Ambil foto dari kamera"
      >
        Ambil Foto
      </button>

      <canvas 
        id="canvas" 
        style="display:none"
        aria-hidden="true"
      ></canvas>

      <h2>Lokasi Cerita</h2>
      <div 
        id="map" 
        style="height:300px; margin-top:1rem"
        aria-label="Peta pemilihan lokasi cerita"
      ></div>

      <p id="locationInfo" aria-live="polite">
        Klik peta untuk memilih lokasi
      </p>

      <button type="submit">Kirim Cerita</button>

      <p id="message" aria-live="polite"></p>

      <div 
        id="debug-info" 
        style="margin-top:20px; font-size:12px;"
        aria-hidden="true"
      ></div>
    </form>
  `;
  },

  async afterRender() {
    const token = getToken();
    if (!token) {
      location.hash = "/login";
      return;
    }

    if (navigator.onLine) {
      processStoryQueue(token, addStory);
    }

    window.addEventListener("online", () => {
      processStoryQueue(token, addStory);
    });

    const map = L.map("map").setView([-2.5, 118], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap",
    }).addTo(map);

    let lat = null;
    let lon = null;
    let marker = null;

    map.on("click", (e) => {
      lat = e.latlng.lat;
      lon = e.latlng.lng;

      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lon]).addTo(map);

      document.getElementById("locationInfo").textContent =
        `Lokasi: ${lat.toFixed(5)}, ${lon.toFixed(5)}`;
    });

    const video = document.getElementById("video");
    const canvas = document.getElementById("canvas");
    const photoInput = document.getElementById("photo");
    let stream = null;

    document.getElementById("openCamera").onclick = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        video.style.display = "block";
        document.getElementById("capture").style.display = "inline-block";
      } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Tidak dapat mengakses kamera: " + err.message);
      }
    };

    document.getElementById("capture").onclick = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        const file = new File([blob], "camera.jpg", { type: "image/jpeg" });
        const dt = new DataTransfer();
        dt.items.add(file);
        photoInput.files = dt.files;
      });

      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
      video.style.display = "none";
      document.getElementById("capture").style.display = "none";
    };

    const resetForm = () => {
      document.getElementById("description").value = "";
      photoInput.value = null;
      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }
      lat = null;
      lon = null;
      document.getElementById("locationInfo").textContent =
        "Klik peta untuk memilih lokasi";
    };

    document.getElementById("addForm").onsubmit = async (e) => {
      e.preventDefault();

      const description = document.getElementById("description").value;
      const photo = photoInput.files[0];
      const msg = document.getElementById("message");
      const debugInfo = document.getElementById("debug-info");

      if (!description || !photo) {
        msg.textContent = "Deskripsi dan gambar wajib diisi";
        return;
      }

      msg.textContent = "Mengirim cerita...";

      if (navigator.onLine) {
        try {
          const res = await addStory(token, {
            description,
            photo,
            lat,
            lon,
          });

          if (res.error) {
            msg.textContent = res.message || "Gagal mengirim cerita";
            return;
          }

          msg.textContent =
            "Cerita berhasil ditambahkan! Anda dapat menambahkan cerita lagi.";
          resetForm();
        } catch (error) {
          console.error("Error sending story:", error);
          msg.textContent =
            "Terjadi kesalahan: " + (error.message || "Unknown error");
        }
      } else {
        try {
          const reader = new FileReader();

          reader.onload = async (event) => {
            try {
              const photoObj = {
                name: photo.name || "photo.jpg",
                type: photo.type || "image/jpeg",
                data: event.target.result,
                lastModified: photo.lastModified || Date.now(),
              };

              console.log("Photo object created:", {
                name: photoObj.name,
                type: photoObj.type,
                size: photoObj.data.byteLength,
              });

              const result = await addToStoryQueue({
                description,
                photo: photoObj,
                lat,
                lon,
              });

              if (result.success) {
                msg.textContent =
                  "Cerita disimpan dan akan dikirim saat online! Anda dapat menambahkan cerita lagi.";
                resetForm();
              } else {
                msg.textContent =
                  "Gagal menyimpan cerita untuk pengiriman nanti.";
              }
            } catch (innerError) {
              console.error("Error dalam callback reader:", innerError);
              msg.textContent =
                "Terjadi kesalahan saat memproses gambar: " +
                (innerError.message || "Unknown error");
            }
          };

          reader.onerror = (err) => {
            msg.textContent =
              "Gagal memproses file gambar: " +
              (err.target.error?.message || "Unknown error");
          };

          reader.readAsArrayBuffer(photo);
        } catch (error) {
          console.error("Error saving to queue:", error);
          msg.textContent =
            "Terjadi kesalahan saat menyimpan cerita: " +
            (error.message || "Unknown error");
        }
      }
    };
  },
};
