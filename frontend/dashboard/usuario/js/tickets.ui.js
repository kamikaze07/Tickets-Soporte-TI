/* ===============================
   ESTADO
================================ */
let tickets = [];
let ticketActual = null;

/* ===============================
   CARGAR TICKETS
================================ */
async function loadTickets() {
  try {
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

  } catch (err) {
    console.error(err);
    renderTickets([]);
  }
}

/* ===============================
   RENDER TICKETS
================================ */
function renderTickets(list) {
  const container = document.getElementById('ticketList');
  container.innerHTML = '';

  if (list.length === 0) {
    container.innerHTML = '<p>No tienes tickets aún.</p>';
    return;
  }

  list.forEach(t => {
    const item = document.createElement('div');
    item.className = `ticket-item status-${t.status.toLowerCase().replace(' ', '-')}`;

    item.innerHTML = `
      <div class="ticket-indicator"></div>
      <div class="ticket-content">
        <div class="ticket-title">${t.titulo}</div>
        <div class="ticket-meta">${t.categoria} · ${t.prioridad}</div>
        <span class="ticket-status">${t.status}</span>
      </div>
    `;

    item.addEventListener('click', () => verDetalle(t.id));
    container.appendChild(item);
  });
}

/* ===============================
   VER DETALLE (NUEVO)
================================ */
async function verDetalle(ticketId) {
  ticketActual = ticketId;

  document.getElementById('ticketsListView').style.display = 'none';
  document.getElementById('ticketDetailView').style.display = 'block';
  document.getElementById('pageTitle').textContent = 'Detalle del Ticket';

  const res = await fetch(
    `${BASE_PATH}/backend/tickets/get_ticket_user.php?id=${ticketId}`,
    { credentials: 'include' }
  );

  if (!res.ok) {
    console.error('No autorizado o error al cargar ticket');
    return;
  }

  const t = await res.json();

  document.getElementById('dtTitulo').textContent = t.titulo;
  document.getElementById('dtDescripcion').textContent = t.descripcion;
  document.getElementById('dtEstado').textContent = t.estado;

  cargarMensajes(ticketId);
}


/* ===============================
   VOLVER
================================ */
document.getElementById('btnVolver').addEventListener('click', () => {
  document.getElementById('ticketDetailView').style.display = 'none';
  document.getElementById('ticketsListView').style.display = 'block';
  document.getElementById('pageTitle').textContent = 'Mis Tickets';
});

/* ===============================
   CHAT
================================ */
async function cargarMensajes(ticketId) {
  const res = await fetch(
    `${BASE_PATH}/backend/tickets/get_messages.php?ticket_id=${ticketId}`,
    { credentials: 'include' }
  );
  const mensajes = await res.json();

  const chat = document.getElementById('chatBox');
  chat.innerHTML = '';

  mensajes.forEach(m => {
    const div = document.createElement('div');
    div.className = `chat-msg ${m.autor}`; // admin | usuario
    div.textContent = m.comentario;
    chat.appendChild(div);
  });

  chat.scrollTop = chat.scrollHeight;
}

document.getElementById('chatForm').addEventListener('submit', async e => {
  e.preventDefault();

  const texto = chatInput.value.trim();
  if (!texto) return;

  await fetch(`${BASE_PATH}/backend/tickets/user_reply.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      ticket_id: ticketActual,
      comentario: texto
    })
  });

  chatInput.value = '';
  cargarMensajes(ticketActual);
});

/* ===============================
   INIT
================================ */
loadTickets();
