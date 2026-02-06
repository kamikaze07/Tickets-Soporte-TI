const BASE_PATH = '/ticketssoporteti';

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initLogout();
  cargarDashboard();
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
   DASHBOARD DATA (MOCK)
========================= */
function cargarDashboard() {
  // KPIs (luego fetch real)
  document.getElementById('kpiAbiertos').textContent = 3;
  document.getElementById('kpiProceso').textContent = 2;
  document.getElementById('kpiEspera').textContent = 1;
  document.getElementById('kpiCerrados').textContent = 6;

  // Últimos tickets
  const tickets = [
    { id: 6, asunto: 'Instalación impresora', estado: 'Cerrado', prioridad: 'Alta', fecha: '05/02/2026' },
    { id: 5, asunto: 'Nuevo teclado', estado: 'Cerrado', prioridad: 'Media', fecha: '05/02/2026' },
    { id: 4, asunto: 'PC lenta', estado: 'En Proceso', prioridad: 'Alta', fecha: '04/02/2026' }
  ];

  const tbody = document.getElementById('recentTickets');
  tbody.innerHTML = '';

  tickets.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.id}</td>
      <td>${t.asunto}</td>
      <td>${renderEstado(t.estado)}</td>
      <td class="prioridad ${t.prioridad}">${t.prioridad}</td>
      <td>${t.fecha}</td>
      <td>
        <button class="btn view"
          onclick="location.href='ticket.html?id=${t.id}'">
          Ver
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
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
