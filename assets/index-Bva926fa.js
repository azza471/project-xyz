(function(){const o=document.createElement("link").relList;if(o&&o.supports&&o.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))a(e);new MutationObserver(e=>{for(const n of e)if(n.type==="childList")for(const i of n.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&a(i)}).observe(document,{childList:!0,subtree:!0});function r(e){const n={};return e.integrity&&(n.integrity=e.integrity),e.referrerPolicy&&(n.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?n.credentials="include":e.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(e){if(e.ep)return;e.ep=!0;const n=r(e);fetch(e.href,n)}})();const q="https://story-api.dicoding.dev/v1";async function U(t,o){return(await fetch(`${q}/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email:t,password:o})})).json()}async function A(t){return(await fetch(`${q}/stories`,{headers:{Authorization:`Bearer ${t}`}})).json()}async function S(t,o){const r=new FormData;return Object.entries(o).forEach(([e,n])=>n&&r.append(e,n)),(await fetch(`${q}/stories`,{method:"POST",headers:{Authorization:`Bearer ${t}`},body:r})).json()}async function R(t,o,r){return(await fetch("https://story-api.dicoding.dev/v1/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:t,email:o,password:r})})).json()}function N(t){localStorage.setItem("token",t)}function k(){return localStorage.getItem("token")}function _(){return!!k()}function H(){localStorage.clear(),location.hash="/login"}const z={render(){return`
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
    `},async afterRender(){const t=document.getElementById("loginForm"),o=document.getElementById("message");t.addEventListener("submit",async r=>{r.preventDefault();const a=document.getElementById("email").value,e=document.getElementById("password").value;o.textContent="Sedang login...";const n=await U(a,e);if(n.error){o.textContent=n.message;return}N(n.loginResult.token),o.textContent="Login berhasil!",location.hash="/home"})}},G={render(){return`
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
    `},async afterRender(){const t=document.getElementById("registerForm"),o=document.getElementById("message");t.onsubmit=async r=>{r.preventDefault();const a=document.getElementById("name").value,e=document.getElementById("email").value,n=document.getElementById("password").value;o.textContent="Mendaftarkan akun...";const i=await R(a,e,n);if(i.error){o.textContent=i.message;return}o.textContent="Registrasi berhasil! Silakan login.",setTimeout(()=>{location.hash="/login"},1200)}}};let x,I;function $(t){x?I.clearLayers():(x=L.map("map").setView([-2.5,118],5),L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap contributors"}).addTo(x),I=L.layerGroup().addTo(x)),t.forEach(o=>{if(o.lat&&o.lon){const r=new Date(o.createdAt).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"}),a=`
        <div class="map-popup">
          <img
            src="${o.photoUrl}"
            alt="Foto cerita oleh ${o.name}"
            style="width:100%; border-radius:6px; margin-bottom:8px;"
          />
          <h3>${o.name}</h3>
          <p style="font-size:0.85rem; color:#555;">${r}</p>
          <p>${o.description}</p>
        </div>
      `;L.marker([o.lat,o.lon]).bindPopup(a).addTo(I)}})}const W="stories-db",v="stories",K=3,b="story-queue",f="favorites",h=()=>new Promise((t,o)=>{const r=indexedDB.open(W,K);r.onerror=a=>{console.error("Database error:",a.target.error),o("Error opening database")},r.onsuccess=a=>{t(a.target.result)},r.onupgradeneeded=a=>{const e=a.target.result;e.objectStoreNames.contains(v)||(e.createObjectStore(v,{keyPath:"id"}),console.log("Created stories store")),e.objectStoreNames.contains(b)||(e.createObjectStore(b,{keyPath:"queueId",autoIncrement:!0}),console.log("Created queue store")),e.objectStoreNames.contains(f)||e.createObjectStore(f,{keyPath:"id"})}}),P=async t=>{if(!t||!Array.isArray(t)||t.length===0)return console.warn("No stories to save"),!1;try{const a=(await h()).transaction(v,"readwrite").objectStore(v);await new Promise((e,n)=>{const i=a.clear();i.onsuccess=()=>e(),i.onerror=c=>n(c)});for(const e of t)await new Promise((n,i)=>{const c=a.add(e);c.onsuccess=()=>n(),c.onerror=d=>{console.error("Error adding story:",d,e),i(d)}});return!0}catch(o){return console.error("Error saving stories to IndexedDB:",o),!1}},V=async()=>{try{const r=(await h()).transaction(v,"readonly").objectStore(v);return new Promise((a,e)=>{const n=r.getAll();n.onsuccess=()=>a(n.result||[]),n.onerror=i=>{console.error("Error getting stories:",i),e(i)}})}catch(t){return console.error("Error getting stories from IndexedDB:",t),[]}},Q=(t,o)=>{const r=async()=>{try{console.log("Melakukan sinkronisasi data dengan server...");const a=await o(t);a&&a.listStory&&(await P(a.listStory)?(console.log("Data berhasil disinkronkan"),window.dispatchEvent(new CustomEvent("stories-synced",{detail:{stories:a.listStory}}))):console.error("Gagal menyimpan data sinkronisasi"))}catch(a){console.error("Gagal sinkronisasi:",a)}};navigator.onLine&&r(),window.addEventListener("online",()=>{console.log("Koneksi internet tersedia. Memulai sinkronisasi..."),r()})},M=async()=>{try{const r=(await h()).transaction(b,"readonly").objectStore(b);return new Promise((a,e)=>{const n=r.getAll();n.onsuccess=()=>a(n.result||[]),n.onerror=i=>{console.error("Error getting queued stories:",i),e(i)}})}catch(t){return console.error("Error retrieving from queue:",t),[]}},J=async t=>{try{console.log("Menyimpan cerita ke queue...");const a=(await h()).transaction(b,"readwrite").objectStore(b),e={...t,isDraft:!0,queuedAt:new Date().toISOString()};return new Promise((n,i)=>{const c=a.add(e);c.onsuccess=()=>{console.log("Cerita berhasil ditambahkan ke queue:",c.result),n({success:!0,id:c.result})},c.onerror=d=>{var g;console.error("Error adding to queue:",d),n({success:!1,error:((g=d.target.error)==null?void 0:g.message)||"Unknown error"})}})}catch(o){return console.error("Error pada addToStoryQueue:",o),{success:!1,error:o.message}}},B=async()=>{try{const t=await V(),o=await M();console.log("Server stories:",t.length),console.log("Queued stories:",o.length);const r=[];for(const e of o)try{if(!e.photo||!e.photo.data){console.warn("Invalid photo data in queue item:",e);continue}const n=new Blob([e.photo.data],{type:e.photo.type||"image/jpeg"}),i=URL.createObjectURL(n);r.push({id:`local-${e.queueId}`,name:"Cerita Lokal",description:e.description,photoUrl:i,createdAt:e.queuedAt,lat:e.lat,lon:e.lon,isOffline:!0})}catch(n){console.error("Error formatting queue item:",n)}const a=[...t,...r];return console.log("Combined stories total:",a.length),a}catch(t){return console.error("Error getting all stories:",t),[]}},D=async(t,o)=>{if(navigator.onLine)try{const e=(await h()).transaction(b,"readwrite").objectStore(b),n=await M();console.log(`Processing ${n.length} queued stories`);for(const i of n)try{if(!i.photo||!i.photo.data){console.warn("Invalid photo data in queue item - skipping:",i);continue}const{description:c,photo:d,lat:g,lon:s}=i,p=new Blob([d.data],{type:d.type||"image/jpeg"}),l=new File([p],d.name||"photo.jpg",{type:d.type||"image/jpeg",lastModified:d.lastModified||Date.now()}),u=await o(t,{description:c,photo:l,lat:g,lon:s});u.error?console.error(`Failed to send queued story: ${i.queueId}`,u.message):(await new Promise((m,w)=>{const y=e.delete(i.queueId);y.onsuccess=()=>{console.log(`Story from queue successfully sent: ${i.queueId}`),m()},y.onerror=j=>w(j)}),window.dispatchEvent(new CustomEvent("queued-story-processed",{detail:{success:!0,queueId:i.queueId}})))}catch(c){console.error(`Error processing queue item ${i.queueId}:`,c)}}catch(r){console.error("Error processing story queue:",r)}},Y=async t=>{(await h()).transaction(f,"readwrite").objectStore(f).put(t)},O=async()=>{const r=(await h()).transaction(f,"readonly").objectStore(f);return new Promise(a=>{const e=r.getAll();e.onsuccess=()=>a(e.result||[])})},F=async t=>{(await h()).transaction(f,"readwrite").objectStore(f).delete(t)},T=async t=>{const a=(await h()).transaction(f,"readonly").objectStore(f);return new Promise(e=>{const n=a.get(t);n.onsuccess=()=>e(!!n.result)})},X={async render(){return`
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
    `},async afterRender(){const t=document.getElementById("list"),o=document.getElementById("searchInput"),r=document.getElementById("sortSelect"),a=document.getElementById("connection-status");let e=[];const n=k(),i=(s,p)=>[...s].sort((l,u)=>p==="asc"?new Date(l.createdAt)-new Date(u.createdAt):new Date(u.createdAt)-new Date(l.createdAt)),c=()=>{a.innerHTML=navigator.onLine?`<div style="background:#e7f7e7;color:#2e7d32;padding:8px;border-radius:4px;margin-bottom:10px;">
            Online - Data telah disinkronkan
          </div>`:`<div style="background:#ffebee;color:#c62828;padding:8px;border-radius:4px;margin-bottom:10px;">
            Offline - Menampilkan data lokal
          </div>`};c(),window.addEventListener("online",c),window.addEventListener("offline",c);const d=async s=>{if(t.innerHTML="",!s||s.length===0){t.innerHTML="<p>Tidak ada cerita tersedia.</p>";return}for(const l of s){const u=await T(l.id),m=l.isOffline?`<span style="background:#ff9800;color:white;padding:2px 6px;border-radius:10px;font-size:12px;margin-left:6px;">
              Offline
            </span>`:"",w=new Date(l.createdAt).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});t.innerHTML+=`
          <li class="story-item">
            <img src="${l.photoUrl}" alt="Foto cerita" class="story-image"/>
            <div class="story-content">
              <h2>${l.name} ${m}</h2>
              <p class="story-date">${w}</p>
              <p class="story-description">${l.description}</p>
              <button 
                class="fav-btn"
                data-id="${l.id}"
                style="margin-top:6px;padding:4px 10px;cursor:pointer;"
              >
                ${u?"Unsave":"Save"}
              </button>
            </div>
          </li>
        `}const p=s.filter(l=>l.lat&&l.lon);p.length>0&&$(p)};try{if(e=await B(),await d(e),navigator.onLine){const s=await A(n);s!=null&&s.listStory&&(await P(s.listStory),e=await B(),await d(e))}}catch(s){console.error(s),t.innerHTML="<p>Gagal memuat cerita. Periksa koneksi internet.</p>"}Q(n,A),window.addEventListener("stories-synced",async()=>{e=await B(),await d(e),c()});const g=async()=>{const s=o.value.toLowerCase(),p=e.filter(u=>u.name.toLowerCase().includes(s)||u.description.toLowerCase().includes(s)),l=i(p,r.value);await d(l)};o.addEventListener("input",g),r.addEventListener("change",g),t.addEventListener("click",async s=>{if(!s.target.classList.contains("fav-btn"))return;const p=s.target.dataset.id,l=e.find(m=>m.id==p);if(!l)return;await T(p)?(await F(p),s.target.textContent="Save"):(await Y(l),s.target.textContent="Unsave")})}},Z={async render(){return`
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
  `},async afterRender(){const t=k();if(!t){location.hash="/login";return}navigator.onLine&&D(t,S),window.addEventListener("online",()=>{D(t,S)});const o=L.map("map").setView([-2.5,118],5);L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{attribution:"© OpenStreetMap"}).addTo(o);let r=null,a=null,e=null;o.on("click",s=>{r=s.latlng.lat,a=s.latlng.lng,e&&o.removeLayer(e),e=L.marker([r,a]).addTo(o),document.getElementById("locationInfo").textContent=`Lokasi: ${r.toFixed(5)}, ${a.toFixed(5)}`});const n=document.getElementById("video"),i=document.getElementById("canvas"),c=document.getElementById("photo");let d=null;document.getElementById("openCamera").onclick=async()=>{try{d=await navigator.mediaDevices.getUserMedia({video:!0}),n.srcObject=d,n.style.display="block",document.getElementById("capture").style.display="inline-block"}catch(s){console.error("Error accessing camera:",s),alert("Tidak dapat mengakses kamera: "+s.message)}},document.getElementById("capture").onclick=()=>{i.width=n.videoWidth,i.height=n.videoHeight,i.getContext("2d").drawImage(n,0,0),i.toBlob(s=>{const p=new File([s],"camera.jpg",{type:"image/jpeg"}),l=new DataTransfer;l.items.add(p),c.files=l.files}),d&&d.getTracks().forEach(s=>s.stop()),n.style.display="none",document.getElementById("capture").style.display="none"};const g=()=>{document.getElementById("description").value="",c.value=null,e&&(o.removeLayer(e),e=null),r=null,a=null,document.getElementById("locationInfo").textContent="Klik peta untuk memilih lokasi"};document.getElementById("addForm").onsubmit=async s=>{s.preventDefault();const p=document.getElementById("description").value,l=c.files[0],u=document.getElementById("message");if(document.getElementById("debug-info"),!p||!l){u.textContent="Deskripsi dan gambar wajib diisi";return}if(u.textContent="Mengirim cerita...",navigator.onLine)try{const m=await S(t,{description:p,photo:l,lat:r,lon:a});if(m.error){u.textContent=m.message||"Gagal mengirim cerita";return}u.textContent="Cerita berhasil ditambahkan! Anda dapat menambahkan cerita lagi.",g()}catch(m){console.error("Error sending story:",m),u.textContent="Terjadi kesalahan: "+(m.message||"Unknown error")}else try{const m=new FileReader;m.onload=async w=>{try{const y={name:l.name||"photo.jpg",type:l.type||"image/jpeg",data:w.target.result,lastModified:l.lastModified||Date.now()};console.log("Photo object created:",{name:y.name,type:y.type,size:y.data.byteLength}),(await J({description:p,photo:y,lat:r,lon:a})).success?(u.textContent="Cerita disimpan dan akan dikirim saat online! Anda dapat menambahkan cerita lagi.",g()):u.textContent="Gagal menyimpan cerita untuk pengiriman nanti."}catch(y){console.error("Error dalam callback reader:",y),u.textContent="Terjadi kesalahan saat memproses gambar: "+(y.message||"Unknown error")}},m.onerror=w=>{var y;u.textContent="Gagal memproses file gambar: "+(((y=w.target.error)==null?void 0:y.message)||"Unknown error")},m.readAsArrayBuffer(l)}catch(m){console.error("Error saving to queue:",m),u.textContent="Terjadi kesalahan saat menyimpan cerita: "+(m.message||"Unknown error")}}}},E={BASE_URL:"https://story-api.dicoding.dev/v1",VAPID_PUBLIC_KEY:"BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk"},ee={async render(){return'<div id="detail"></div>'},async afterRender({id:t}){const o=k(),r=await fetch(`${E.BASE_URL}/stories/${t}`,{headers:{Authorization:`Bearer ${o}`}}),{story:a}=await r.json();document.getElementById("detail").innerHTML=`
      <h2>${a.name}</h2>
      <img src="${a.photoUrl}" width="300"/>
      <p>${a.description}</p>
    `}},te={async render(){return`
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
    `},async afterRender(){const t=document.getElementById("list"),o=document.getElementById("searchInput");let r=await O();const a=async e=>{if(t.innerHTML="",!e||e.length===0){t.innerHTML="<p>Belum ada cerita yang disimpan.</p>";return}for(const i of e){const c=await T(i.id),d=new Date(i.createdAt).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});t.innerHTML+=`
          <li class="story-item">
            <img src="${i.photoUrl}" alt="Foto cerita" class="story-image"/>
            <div class="story-content">
              <h2>${i.name}</h2>
              <p class="story-date">${d}</p>
              <p class="story-description">${i.description}</p>
              <button 
                class="fav-btn"
                data-id="${i.id}"
                style="margin-top:6px;padding:4px 10px;cursor:pointer;"
              >
                ${c?"Unsave":"Save"}
              </button>
            </div>
          </li>
        `}const n=e.filter(i=>i.lat&&i.lon);n.length>0&&$(n)};await a(r),o.addEventListener("input",async()=>{const e=o.value.toLowerCase(),n=r.filter(i=>i.name.toLowerCase().includes(e)||i.description.toLowerCase().includes(e));await a(n)}),t.addEventListener("click",async e=>{if(!e.target.classList.contains("fav-btn"))return;const n=e.target.dataset.id;await F(n),r=await O(),await a(r)})}},C={"/login":z,"/register":G,"/home":X,"/add":Z,"/detail/:id":ee,"/favorites":te};function oe(t){const o="=".repeat((4-t.length%4)%4),r=(t+o).replace(/-/g,"+").replace(/_/g,"/"),a=atob(r);return Uint8Array.from([...a].map(e=>e.charCodeAt(0)))}async function ne(){const t=document.getElementById("notifToggle");if(!t)return;const o=await navigator.serviceWorker.ready,r=k(),a=await o.pushManager.getSubscription();t.checked=!!a,t.onchange=async()=>{if(t.checked){if(await Notification.requestPermission()!=="granted"){t.checked=!1;return}const n=await o.pushManager.subscribe({userVisibleOnly:!0,applicationServerKey:oe(E.VAPID_PUBLIC_KEY)}),c=await(await fetch(`${E.BASE_URL}/notifications/subscribe`,{method:"POST",headers:{Authorization:`Bearer ${r}`,"Content-Type":"application/json"},body:JSON.stringify({endpoint:n.endpoint,keys:n.toJSON().keys})})).json();c.error&&await n.unsubscribe(),t.checked=!c.error}else{const e=await o.pushManager.getSubscription();if(!e)return;const i=await(await fetch(`${E.BASE_URL}/notifications/subscribe`,{method:"DELETE",headers:{Authorization:`Bearer ${r}`,"Content-Type":"application/json"},body:JSON.stringify({endpoint:e.endpoint})})).json();i.error||await e.unsubscribe(),t.checked=i.error}}}class re{constructor(){this.main=document.getElementById("main"),this.nav=document.getElementById("nav")}renderNav(){const o=_();this.nav.innerHTML=`
    <div style="
      display:flex;
      align-items:center;
      justify-content:space-between;
      padding:12px 20px;
      border-bottom:1px solid #eaeaea;
    ">
      <div style="display:flex; align-items:center; gap:16px;">
        ${o?`
              <a href="#/home" style="text-decoration:none;color:#333;font-weight:500;">
                Home
              </a>

              <a href="#/add" style="text-decoration:none;color:#333;font-weight:500;">
                Tambah
              </a>
              <a href="#/favorites" style="text-decoration:none;color:#333;font-weight:500;">
                Save
              </a>

              <div class="form-check">
                <label for="notifToggle" class="form-check-label">
                  Notifikasi
                </label>
                <input
                  type="checkbox"
                  id="notifToggle"
                  name="notification"
                  class="form-check-input"
                />
              </div>

            `:`
              <a href="#/login" style="text-decoration:none;color:#333;font-weight:500;">
                Login
              </a>
            `}
      </div>

      ${o?`
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
          `:""}
    </div>
  `;const r=document.getElementById("logoutBtn");r&&r.addEventListener("click",H)}async render(){const o=location.hash.slice(1)||"/login";let r=C[o],a={};if(!r)for(const n of Object.keys(C)){if(!n.includes(":"))continue;const i=n.split("/"),c=o.split("/");if(i.length!==c.length)continue;let d=!0;const g={};if(i.forEach((s,p)=>{s.startsWith(":")?g[s.slice(1)]=c[p]:s!==c[p]&&(d=!1)}),d){r=C[n],a=g;break}}if(!r){location.hash="/home";return}this.renderNav();const e=async()=>{var n;this.main.innerHTML=await r.render(a),await((n=r.afterRender)==null?void 0:n.call(r,a)),ne()};document.startViewTransition?document.startViewTransition(e):await e()}}document.addEventListener("DOMContentLoaded",async()=>{if("serviceWorker"in navigator)try{await navigator.serviceWorker.register("/project-xyz/sw.js"),console.log("Service Worker registered")}catch(o){console.error("Service Worker gagal",o)}const t=new re;t.render(),window.addEventListener("hashchange",()=>t.render())});
