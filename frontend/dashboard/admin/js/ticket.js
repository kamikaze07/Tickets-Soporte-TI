const BASE_PATH = '/ticketssoporteti';
let TICKET_ID = null;
let ws = null;

function initWebSocket(ticketId) {
  if (ws) ws.close();

  ws = new WebSocket(`ws://${window.location.hostname}:8080`);

  ws.onopen = () => {
    ws.send(JSON.stringify({
      type: 'join',
      ticket_id: ticketId
    }));
  };

 ws.onmessage = (e) => {

  let data;

  try {
    data = JSON.parse(e.data);
  } catch (err) {
    console.warn("Mensaje WS inválido:", e.data);
    return;
  }

  if (!data || !data.type) return;

  if (data.type === 'message') {
    pintarMensajeAdmin(data.mensaje, data.autor, data.created_at);
  }

  if (data.type === 'file' && data.ticket_id == TICKET_ID) {
    pintarArchivoAdmin(data);
  }

};


  ws.onclose = () => {
    console.warn('WebSocket admin desconectado');
  };
}

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initLogout();
  cargarTicket();
  initActions();
});

function pintarArchivoAdmin(data) {

  const chat = document.getElementById('chatMessages');
  if (!chat) return;

  const div = document.createElement('div');
  div.className = `message ${data.autor === 'admin' ? 'admin' : 'user'}`;

  const extension = (data.nombre_archivo || '')
    .split('.')
    .pop()
    .toLowerCase();

  const esImagen = ['jpg','jpeg','png','gif','webp'].includes(extension);

  const fecha = data.created_at
    ? new Date(data.created_at).toLocaleString()
    : new Date().toLocaleString();

  if (esImagen) {

    const img = document.createElement('img');
    img.src = `${BASE_PATH}/${data.archivo}`;
    img.style.maxWidth = "250px";
    img.style.borderRadius = "10px";
    img.style.cursor = "pointer";
    img.style.display = "block";
    img.style.marginBottom = "6px";

    // 🖼 Abrir modal
    img.onclick = () => openImageModal(img.src);

    div.appendChild(img);

  } else {

    const link = document.createElement('a');
    link.href = `${BASE_PATH}/${data.archivo}`;
    link.target = "_blank";
    link.textContent = "📎 " + data.nombre_archivo;
    link.style.display = "block";
    link.style.marginBottom = "6px";

    div.appendChild(link);
  }

  // ⏱ Fecha
  const time = document.createElement('div');
  time.className = "message-time";
  time.textContent = fecha;

  div.appendChild(time);

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}



/* =========================
   SIDEBAR
========================= */
function initSidebar() {
  const btnMenu = document.getElementById('btnMenu');
  const sidebar = document.getElementById('sidebarNav');
  const overlay = document.querySelector('.sidebar-overlay');
  const isMobile = () => window.innerWidth <= 1023;

  btnMenu.addEventListener('click', () => {
    if (isMobile()) {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    } else {
      sidebar.classList.toggle('collapsed');
    }
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });
}

/* =========================
   LOGOUT
========================= */
function initLogout() {
  const btn = document.getElementById('btnLogout');
  if (!btn) return;

  btn.addEventListener('click', () => {
    window.location.href = `${BASE_PATH}/backend/auth/logout.php`;
  });
}

/* =========================
   LOAD TICKET
========================= */
async function cargarTicket() {
  const params = new URLSearchParams(window.location.search);
  TICKET_ID = params.get('id');

  if (!TICKET_ID) {
    window.location.href = 'tickets.html';
    return;
  }

  const res = await fetch(
    `${BASE_PATH}/backend/tickets/admin_get.php?id=${TICKET_ID}`,
    { credentials: 'include' }
  );

  const ticket = await res.json();
  renderTicket(ticket);
  initWebSocket(ticket.id);
  // Inicializar clip después de renderizar el ticket
initClip();
}

function renderTicket(ticket) {
  document.getElementById('ticketTitle').textContent =
    `#${ticket.id} – ${ticket.titulo}`;

  document.getElementById('ticketUsuario').textContent =
    ticket.usuario_num_emp;

  document.getElementById('ticketPrioridad').textContent =
    ticket.prioridad;

  document.getElementById('ticketFecha').textContent =
    new Date(ticket.created_at).toLocaleString();

  document.getElementById('ticketCategoria').textContent =
    ticket.categoria;

  document.getElementById('ticketDescripcion').textContent =
    ticket.descripcion;

  const estadoSelect = document.getElementById('estadoTicket');
  estadoSelect.innerHTML = `
    <option value="Abierto">Abierto</option>
    <option value="En Proceso">En Proceso</option>
    <option value="En Espera">En Espera</option>
    <option value="Cerrado">Cerrado</option>
  `;
  estadoSelect.value = ticket.status;

  renderMensajes(ticket.comentarios);
}

/* =========================
   CHAT RENDER
========================= */
function renderMensajes(comentarios) {

  const chat = document.getElementById('chatMessages');
  chat.innerHTML = '';

  comentarios.forEach(c => {

    if (c.tipo === 'texto') {
      pintarMensajeAdmin(c.comentario, c.autor, c.created_at);
    }

    if (c.tipo === 'archivo') {
      pintarArchivoAdmin({
        autor: c.autor,
        archivo: c.archivo,
        nombre_archivo: c.nombre_archivo,
        created_at: c.created_at
      });
    }

  });

  chat.scrollTop = chat.scrollHeight;
}


function pintarMensajeAdmin(texto, autor, fecha = null) {
  const chat = document.getElementById('chatMessages');

  const div = document.createElement('div');
  div.className = `message ${autor === 'admin' ? 'admin' : 'user'}`;
  div.innerHTML = `
    <div>${texto}</div>
    <div class="message-time">
      ${fecha ? new Date(fecha).toLocaleString() : new Date().toLocaleString()}
    </div>
  `;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

/* =========================
   ACTIONS
========================= */
function initActions() {
  document.getElementById('btnResponder')
    .addEventListener('click', responderTicket);

  document.getElementById('btnCerrar')
    .addEventListener('click', () => cambiarEstado('Cerrado'));

  document.getElementById('estadoTicket')
    .addEventListener('change', e =>
      cambiarEstado(e.target.value)
    );
    // 📎 Inicializar clip después de que el ticket esté cargado
const chatContainer = document.querySelector(".chat-actions");
const textarea = document.getElementById("respuesta");

if (chatContainer && textarea && !document.getElementById("btnFileAdmin")) {

  const btn = document.createElement("button");
  btn.type = "button";
  btn.id = "btnFileAdmin";
  btn.className = "btn-clip";
  btn.textContent = "📎";

  const inputFile = document.createElement("input");
  inputFile.type = "file";
  inputFile.id = "fileInputAdmin";
  inputFile.hidden = true;


  chatContainer.insertBefore(btn, chatContainer.firstChild);
  chatContainer.appendChild(inputFile);

  btn.addEventListener("click", () => inputFile.click());
}

}

/* =========================
   BACKEND CALLS
========================= */
async function cambiarEstado(nuevoEstado) {
  await fetch(
    `${BASE_PATH}/backend/tickets/admin_update_status.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticket_id: TICKET_ID,
        status: nuevoEstado
      })
    }
  );
}

async function responderTicket() {
  const textarea = document.getElementById('respuesta');
  const comentario = textarea.value.trim();
  if (!comentario) return;

  await fetch(
    `${BASE_PATH}/backend/tickets/admin_reply.php`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ticket_id: TICKET_ID,
        comentario
      })
    }
  );

  textarea.value = '';

  // Notificar al usuario por WebSocket
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'message',
      ticket_id: TICKET_ID,
      autor: 'admin',
      mensaje: comentario
    }));
  }
}

/* ================================
   📎 SOPORTE ARCHIVOS ADMIN
================================ */

function enviarArchivoAdmin(file) {

  return new Promise((resolve, reject) => {

    const formData = new FormData();
    formData.append("archivo", file);
    formData.append("ticket_id", TICKET_ID);

    const xhr = new XMLHttpRequest();

    const progressContainer = document.getElementById("uploadProgressContainer");
    const progressBar = document.getElementById("uploadProgressBar");

    progressContainer.classList.remove("hidden");
    progressBar.style.width = "0%";

    xhr.upload.addEventListener("progress", function (e) {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        progressBar.style.width = percent + "%";
      }
    });

    xhr.onload = function () {

      progressContainer.classList.add("hidden");

      alert("STATUS: " + xhr.status);
      alert("RESPUESTA: " + xhr.responseText);

      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        console.log("DATA PARSEADA:", data);

        if (data.ok && ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({
            type: "file",
            ticket_id: TICKET_ID,
            autor: data.autor,
            archivo: data.archivo,
            nombre_archivo: data.nombre
          }));
        }

        resolve();
      } else {
        alert("Error subiendo archivo");
        console.log("ERROR HTTP");
        reject();
      }
    };

    xhr.onerror = function () {
      progressContainer.classList.add("hidden");
      alert("Error de conexión");
      reject();
    };

    xhr.open("POST", `${BASE_PATH}/backend/tickets/upload_file.php`, true);
    xhr.withCredentials = true;
    xhr.send(formData);

  });
}

function initClip() {

  const inputFile = document.getElementById("fileInputAdmin");
  const textarea = document.getElementById("respuesta");

  if (!inputFile) return;

  inputFile.addEventListener("change", async function () {

    if (!TICKET_ID) return;

    if (this.files && this.files.length > 0) {

      const file = this.files[0];

      try {
        await enviarArchivoAdmin(file);
      } catch (err) {
        console.error(err);
      }
    }

    inputFile.value = "";
  });

  if (textarea) {
    textarea.addEventListener("paste", async (e) => {

      if (!TICKET_ID) return;

      const items = e.clipboardData?.items;
      if (!items) return;

      for (let item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          await enviarArchivoAdmin(file);
          break;
        }
      }
    });
  }
}


function openImageModal(src) {
  const modal = document.getElementById("imageModal");
  const img = document.getElementById("modalImage");
  modal.classList.remove("hidden");
  img.src = src;
}

document.getElementById("closeImageModal")?.addEventListener("click", () => {
  document.getElementById("imageModal").classList.add("hidden");
});

document.getElementById("imageModal")?.addEventListener("click", (e) => {
  if (e.target.id === "imageModal") {
    e.currentTarget.classList.add("hidden");
  }
});
