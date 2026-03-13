const BASE_PATH = '/ticketssoporteti';

let CURRENT_PAGE = 1;
const LIMIT = 10;
let TOTAL_ROWS = 0;

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

async function cargarTickets(page = 1) {

  try {

    const estado = document.getElementById('filterEstado').value;
    const prioridad = document.getElementById('filterPrioridad').value;

    const params = new URLSearchParams({
      page: page,
      limit: LIMIT,
      estado: estado,
      prioridad: prioridad
    });

    const res = await fetch(
      `${BASE_PATH}/backend/tickets/admin_list.php?${params}`,
      { credentials: 'include' }
    );

    if (!res.ok) throw new Error("Error cargando tickets");

    const result = await res.json();

    CURRENT_PAGE = result.page;
    TOTAL_ROWS = result.total;

    renderTickets(result.data);
    renderPagination();

  } catch (err) {

    console.error(err);
    alert("No se pudieron cargar los tickets");

  }

}

function renderTickets(tickets) {

  const tbody = document.getElementById('ticketsTable');
  tbody.innerHTML = '';

  if(!tickets.length){

    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;color:#64748b;">
          No hay tickets
        </td>
      </tr>
    `;

    return;
  }

  tickets.forEach(t => {

    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${t.id}</td>
      <td>${t.titulo}</td>
      <td>
        ${t.usuario}
        <div style="font-size:11px;color:#64748b">
          ${t.usuario_num_emp}
        </div>
      </td>
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
  CURRENT_PAGE = 1;
  cargarTickets(1);
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

function renderPagination(){

  const totalPages = Math.ceil(TOTAL_ROWS / LIMIT);

  const container = document.getElementById('pagination');
  container.innerHTML = '';

  if(totalPages <= 1) return;

  for(let i = 1; i <= totalPages; i++){

    const btn = document.createElement('button');

    btn.className = "page-btn";
    btn.innerText = i;

    if(i === CURRENT_PAGE){
      btn.classList.add('active');
    }

    btn.onclick = () => cargarTickets(i);

    container.appendChild(btn);
  }
}
