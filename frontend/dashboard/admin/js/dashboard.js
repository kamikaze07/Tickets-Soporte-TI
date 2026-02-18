const BASE_PATH = '/ticketssoporteti';
let chartInstance = null;
let refreshInterval = null;

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  initLogout();
  cargarDashboard();

  // ✅ Auto refresh cada 30s (sin duplicar)
  refreshInterval = setInterval(() => {
    cargarDashboard(false);
  }, 30000);
});

/* =========================
   SIDEBAR
========================= */
function initSidebar() {
  const btnMenu = document.getElementById('btnMenu');
  const sidebar = document.getElementById('sidebarNav');
  const overlay = document.querySelector('.sidebar-overlay');
  const isMobile = () => window.innerWidth <= 1023;

  if (!btnMenu || !sidebar) return;

  btnMenu.addEventListener('click', () => {
    if (isMobile()) {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    } else {
      sidebar.classList.toggle('collapsed');
    }
  });

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }
}

/* =========================
   LOGOUT REAL
========================= */
function initLogout() {
  const btn = document.getElementById('btnLogout');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    await fetch(`${BASE_PATH}/backend/auth/logout.php`, {
      method: 'POST',
      credentials: 'include'
    });

    window.location.href = `${BASE_PATH}/frontend/login`;
  });
}

/* =========================
   LOADER (barra superior)
========================= */
function startLoader() {
  const loader = document.getElementById('topLoader');
  if (!loader) return;
  loader.style.width = '70%';
}

function stopLoader() {
  const loader = document.getElementById('topLoader');
  if (!loader) return;
  loader.style.width = '100%';
  setTimeout(() => loader.style.width = '0%', 400);
}

/* =========================
   DASHBOARD REAL
========================= */
async function cargarDashboard(animate = true) {

  startLoader();

  const res = await fetch(
    `${BASE_PATH}/backend/dashboard/admin_stats.php`,
    { credentials: 'include' }
  );

  const data = await res.json();

  stopLoader();

  if (!data || !data.kpis) return;

  /* Nombre real admin */
  const headerUser = document.querySelector('.header-user');
  if (headerUser) {
    headerUser.textContent = data.admin_nombre;
  }

  /* KPIs reales */
  updateKpi('kpiAbiertos', data.kpis['Abierto'], animate);
  updateKpi('kpiProceso', data.kpis['En Proceso'], animate);
  updateKpi('kpiEspera', data.kpis['En Espera'], animate);
  updateKpi('kpiCerrados', data.kpis['Cerrado'], animate);

  /* Indicador visual si hay abiertos */
  const openCard = document.querySelector('.stat-card.open');
  if (openCard) {
    if (data.kpis['Abierto'] > 0) {
      openCard.classList.add('alert');
    } else {
      openCard.classList.remove('alert');
    }
  }

  /* Gráfico */
  renderChart(data.kpis);

  /* Últimos 5 */
  renderUltimos(data.ultimos);
}

/* =========================
   KPI ANIMADO SUAVE
========================= */
function updateKpi(id, finalValue, animate) {

  const el = document.getElementById(id);
  if (!el) return;

  if (!animate) {
    el.textContent = finalValue;
    return;
  }

  let start = 0;
  const duration = 500;
  const stepTime = 15;
  const steps = duration / stepTime;
  const increment = finalValue / steps;

  const counter = setInterval(() => {
    start += increment;
    if (start >= finalValue) {
      el.textContent = finalValue;
      clearInterval(counter);
    } else {
      el.textContent = Math.floor(start);
    }
  }, stepTime);
}

/* =========================
   GRÁFICO CIRCULAR
========================= */
function renderChart(kpis) {

  const canvas = document.getElementById('ticketsChart');
  if (!canvas || typeof Chart === 'undefined') return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Abierto','En Proceso','En Espera','Cerrado'],
      datasets: [{
        data: [
          kpis['Abierto'],
          kpis['En Proceso'],
          kpis['En Espera'],
          kpis['Cerrado']
        ],
        backgroundColor: [
          '#16a34a',
          '#2563eb',
          '#ca8a04',
          '#6b7280'
        ],
        borderWidth: 0
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom' }
      },
      cutout: '65%'
    }
  });
}

/* =========================
   ÚLTIMOS 5
========================= */
function renderUltimos(tickets) {

  const tbody = document.getElementById('recentTickets');
  if (!tbody) return;

  tbody.innerHTML = '';

  tickets.forEach(t => {

    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${t.id}</td>
      <td>${t.titulo}</td>
      <td>${renderEstado(t.status)}</td>
      <td class="prioridad ${t.prioridad}">
        ${t.prioridad}
      </td>
      <td>${formatDate(t.created_at)}</td>
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

function formatDate(date) {
  return new Date(date).toLocaleDateString();
}
