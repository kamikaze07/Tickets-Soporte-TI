/* ===============================
   CONFIG
================================ */

/* ===============================
   ESTADO
================================ */
let tickets = [];
let ticketActual = null;
let ws = null;

/* ===============================
   WEBSOCKET
================================ */
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
      console.warn("WS inválido:", e.data);
      return;
    }

    if (data.type === 'message' && data.ticket_id == ticketActual) {
      pintarMensaje(data.mensaje, data.autor);
    }

    if (data.type === 'file' && data.ticket_id == ticketActual) {
      pintarArchivo(data);
    }
  };

  ws.onclose = () => {
    console.warn("WebSocket usuario desconectado");
  };
}

/* ===============================
   CARGAR TICKETS
================================ */
async function loadTickets() {

  const res = await fetch(
    `${BASE_PATH}/backend/tickets/list_user.php`,
    { credentials: 'include' }
  );

  if (res.status === 401) {
    window.location.href = `${BASE_PATH}/frontend/login/index.html`;
    return;
  }

  const data = await res.json();
  tickets = Array.isArray(data) ? data : [];

  renderTickets(tickets);
}

function renderTickets(tickets) {

  const container = document.getElementById('ticketsContainer');
  if (!container) return;

  container.innerHTML = '<h3>Mis Tickets</h3>';

  if (!tickets.length) {
    container.innerHTML += '<p>No hay tickets aún.</p>';
    return;
  }

  tickets.forEach(ticket => {

    const estadoTexto = ticket.estado || 'Abierto';

    const estadoClass = `status-${estadoTexto
      .toLowerCase()
      .replace(/\s/g, '-')}`;

    const div = document.createElement('div');
    div.className = `ticket-item ${estadoClass}`;

    div.innerHTML = `
      <div class="ticket-indicator"></div>

      <div class="ticket-content">
        <div class="ticket-title">
          #${ticket.id} - ${ticket.titulo}
        </div>

        <div class="ticket-meta">
          Estado: <span class="ticket-status">${estadoTexto}</span>
        </div>
      </div>
    `;

    div.addEventListener('click', () => {
      verDetalle(ticket.id);
    });

    container.appendChild(div);
  });
}


/* ===============================
   VER DETALLE
================================ */
async function verDetalle(ticketId) {

    history.pushState(
    { ticketId },
    "",
    `?ticket=${ticketId}`
  );

  ticketActual = ticketId;

  document.getElementById('ticketsContainer').style.display = 'none';
  document.getElementById('ticketDetailView').style.display = 'block';
  document.getElementById('pageTitle').textContent = 'Detalle del Ticket';

  try {

    const res = await fetch(
      `${BASE_PATH}/backend/tickets/get_ticket_user.php?id=${ticketId}`,
      { credentials: 'include' }
    );

    if (!res.ok) {
      alert("Error cargando ticket");
      return;
    }

    const t = await res.json();

    document.getElementById('dtTitulo').textContent = t.titulo;
    document.getElementById('dtDescripcion').textContent = t.descripcion;
    document.getElementById('dtEstado').textContent = t.estado;

  } catch (e) {
    alert("Error procesando ticket");
  }

  try {
    await cargarMensajes(ticketId);
  } catch (e) {
    console.warn("Error cargando mensajes");
  }

  initWebSocket(ticketId);
  initFileClipUsuario();

  const typing = document.getElementById('typingIndicator');
  if (typing) typing.style.display = 'none';
}


/* ===============================
   CHAT
================================ */
async function cargarMensajes(ticketId) {

  const res = await fetch(
    `${BASE_PATH}/backend/tickets/get_messages.php?ticket_id=${ticketId}`,
    { credentials: 'include' }
  );

  if (!res.ok) {
    console.error("Error backend mensajes:", await res.text());
    return;
  }

  const mensajes = await res.json();

  const chat = document.getElementById('chatBox');
  chat.innerHTML = '';

  mensajes.forEach(m => {

  if (m.tipo === 'texto') {
    pintarMensaje(m.comentario, m.autor);
  }

  if (m.tipo === 'archivo') {
    pintarArchivo({
      autor: m.autor,
      archivo: m.archivo,
      nombre_archivo: m.nombre_archivo
    });
  }

});


  chat.scrollTop = chat.scrollHeight;
}

function pintarMensaje(texto, autor) {

  const chat = document.getElementById('chatBox');

  const div = document.createElement('div');
  div.className = `chat-msg ${autor}`;
  div.textContent = texto;

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function pintarArchivo(data) {

  const chat = document.getElementById('chatBox');
  if (!chat) return;

  const div = document.createElement('div');
  div.className = `chat-msg ${data.autor}`;

  const extension = (data.nombre_archivo || '')
    .split('.')
    .pop()
    .toLowerCase();

  const esImagen = ['jpg','jpeg','png','gif','webp'].includes(extension);

  if (esImagen) {

    const img = document.createElement('img');
    img.src = `${BASE_PATH}/${data.archivo}`;
    img.style.maxWidth = "250px";
    img.style.borderRadius = "10px";
    img.style.cursor = "pointer";
    img.style.display = "block";

    // 🔥 Ahora usa el modal
    img.onclick = () => openImageModal(img.src);

    div.appendChild(img);

  } else {

    const link = document.createElement('a');
    link.href = `${BASE_PATH}/${data.archivo}`;
    link.target = "_blank";
    link.textContent = "📎 " + data.nombre_archivo;
    link.style.display = "block";

    div.appendChild(link);
  }

  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}



/* ===============================
   ENVIAR MENSAJE
================================ */
document.getElementById('chatForm')
  .addEventListener('submit', async e => {

  e.preventDefault();

  const input = document.getElementById('mensaje');
  const texto = input.value.trim();
  if (!texto || !ticketActual) return;

  await fetch(`${BASE_PATH}/backend/tickets/user_reply.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      ticket_id: ticketActual,
      comentario: texto
    })
  });

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: 'message',
      ticket_id: ticketActual,
      autor: 'usuario',
      mensaje: texto
    }));
  }

  input.value = '';
});

/* ===============================
   CLIP ARCHIVOS USUARIO
================================ */
function initFileClipUsuario() {

  const btnFile = document.getElementById("btnFileUsuario");
  const inputDocumento = document.getElementById("fileInputDocumento");
  const chatInput = document.getElementById("mensaje");

  if (!btnFile || !inputDocumento || !chatInput) return;

  // 📎 Abrir selector normal
  btnFile.onclick = () => inputDocumento.click();

  // Cuando el usuario selecciona archivo
  inputDocumento.onchange = async function () {

    if (!ticketActual) return;

    if (this.files && this.files.length > 0) {
      await subirArchivoUsuario(this.files[0]);
    }

    this.value = "";
  };

  // 📋 Pegar imagen desde portapapeles
  chatInput.addEventListener("paste", async (e) => {

    if (!ticketActual) return;

    const items = e.clipboardData?.items;
    if (!items) return;

    for (let item of items) {
      if (item.type.startsWith("image/")) {
        e.preventDefault();
        const file = item.getAsFile();
        await subirArchivoUsuario(file);
        break;
      }
    }
  });
}

async function subirArchivoUsuario(file) {

  if (!ticketActual) return;

  let archivoFinal = file;

  if (file.type.startsWith("image/")) {
    archivoFinal = await comprimirImagenLigera(file);
  }

  const formData = new FormData();
  formData.append("archivo", archivoFinal);
  formData.append("ticket_id", ticketActual);

  const res = await fetch(`${BASE_PATH}/backend/tickets/upload_file.php`, {
    method: "POST",
    credentials: "include",
    body: formData
  });

  if (!res.ok) {
    alert("Error subiendo archivo");
    return;
  }

  const data = await res.json();

  if (data.ok && ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({
      type: "file",
      ticket_id: ticketActual,
      autor: data.autor,
      archivo: data.archivo,
      nombre_archivo: data.nombre,
      created_at: new Date().toISOString()
    }));
  }
}


function comprimirImagenLigera(file) {
  return new Promise((resolve) => {

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => img.src = e.target.result;

    img.onload = function () {

      const maxWidth = 1280;
      const scale = Math.min(maxWidth / img.width, 1);

      const canvas = document.createElement("canvas");
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, { type: "image/jpeg" }));
      }, "image/jpeg", 0.7);
    };

    reader.readAsDataURL(file);
  });
}

/* ===============================
   INIT
================================ */
loadTickets();

const params = new URLSearchParams(window.location.search);
const ticketFromURL = params.get("ticket");

if (ticketFromURL) {
  verDetalle(ticketFromURL);
}

document.getElementById('btnVolver')?.addEventListener('click', () => {
  history.back();
});

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

window.addEventListener("popstate", (event) => {

  if (event.state && event.state.ticketId) {
    // Volver a abrir ticket
    verDetalle(event.state.ticketId);
  } else {
    // Volver al listado
    document.getElementById('ticketDetailView').style.display = 'none';
    document.getElementById('ticketsContainer').style.display = 'block';
    document.getElementById('pageTitle').textContent = 'Mis Tickets';

    if (ws) {
      ws.close();
      ws = null;
    }
  }
});