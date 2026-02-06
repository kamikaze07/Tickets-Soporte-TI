const BASE_PATH = '/ticketssoporteti';

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initLogout();
  cargarTickets();

  document.getElementById('btnFiltrar')
    .addEventListener('click', filtrarTickets);
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
   LOAD TICKETS
========================= */
let ALL_TICKETS = [];

async function cargarTickets() {
  const res = await fetch(
    `${BASE_PATH}/backend/tickets/admin_list.php`,
    { credentials: 'include' }
  );

  ALL_TICKETS = await res.json();
  renderTickets(ALL_TICKETS);
}

function renderTickets(tickets) {
  const tbody = document.getElementById('ticketsTable');
  tbody.innerHTML = '';

  tickets.forEach(t => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${t.id}</td>
      <td>${t.titulo}</td>
      <td>${t.usuario_num_emp}</td>
      <td>${renderEstado(t.status)}</td>
      <td class="prioridad ${t.prioridad}">${t.prioridad}</td>
      <td>${formatDate(t.created_at)}</td>
      <td>
        <button class="btn view" onclick="verTicket(${t.id})">
          Ver
        </button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/* =========================
   FILTERS
========================= */
function filtrarTickets() {
  const estado = document.getElementById('filterEstado').value;
  const prioridad = document.getElementById('filterPrioridad').value;

  let filtrados = ALL_TICKETS;

  if (estado) {
    filtrados = filtrados.filter(t => t.status === estado);
  }

  if (prioridad) {
    filtrados = filtrados.filter(t => t.prioridad === prioridad);
  }

  renderTickets(filtrados);
}

/* =========================
   UTIL
========================= */
function renderEstado(estado) {
  const map = {
    'Abierto': 'abierto',
    'En Proceso': 'proceso',
    'En Espera': 'espera',
    'Cerrado': 'cerrado'
  };

  return `<span class="badge ${map[estado]}">${estado}</span>`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}

function verTicket(id) {
  window.location.href = `ticket.html?id=${id}`;
}
