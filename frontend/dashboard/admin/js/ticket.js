const BASE_PATH = '/ticketssoporteti';
let TICKET_ID = null;

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initLogout();
  cargarTicket();
  initActions();
});

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
    window.location.href =
      `${BASE_PATH}/backend/auth/logout.php`;
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

  // Estado
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
   CHAT
========================= */
function renderMensajes(comentarios) {
  const chat = document.getElementById('chatMessages');
  chat.innerHTML = '';

  comentarios.forEach(c => {
    const div = document.createElement('div');
    div.className = `message ${c.autor === 'admin' ? 'admin' : 'user'}`;
    div.innerHTML = `
      <div>${c.comentario}</div>
      <div class="message-time">
        ${new Date(c.created_at).toLocaleString()}
      </div>
    `;
    chat.appendChild(div);
  });

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

  cargarTicket();
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
  cargarTicket();
}
