// ================================
// CONFIGURACIÓN
// ================================
const BASE_PATH = '/ticketssoporteti';


async function checkAuth() {
  try {
    const res = await fetch(
      `${BASE_PATH}/backend/auth/check_session.php`,
      { credentials: 'include' }
    );

    if (!res.ok) {
      throw new Error('No autenticado');
    }

    const data = await res.json();
    if (!data.authenticated) {
      throw new Error('No autenticado');
    }

    return data; // por si luego quieres usar rol

  } catch {
    window.location.href = `${BASE_PATH}/frontend/login/index.html`;
    throw new Error('Redirigiendo a login');
  }
}


// ================================
// CARGA DE COMPONENTES
// ================================
async function loadComponent(id, path) {
  const el = document.getElementById(id);
  if (!el) {
    console.error('Contenedor no encontrado:', id);
    return;
  }

  try {
    const res = await fetch(path);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status} al cargar ${path}`);
    }
    const html = await res.text();
    el.innerHTML = html;
    console.log(`Componente cargado: ${path}`);
  } catch (err) {
    console.error('Error cargando componente:', path, err);
  }
}

// ================================
// SIDEBAR
// ================================
function initSidebar() {
  const btnMenu = document.getElementById('btnMenu');
  const sidebar = document.getElementById('sidebarNav');
  const layout = document.querySelector('.layout');

  if (!btnMenu || !sidebar || !layout) {
    console.error('Sidebar: elementos no encontrados');
    return;
  }

  // Overlay (solo mobile)
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  const isMobile = () => window.innerWidth <= 1023;

  btnMenu.addEventListener('click', () => {
    if (isMobile()) {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    } else {
      sidebar.classList.toggle('collapsed');
      layout.classList.toggle('sidebar-collapsed');
    }
  });

  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });

  window.addEventListener('resize', () => {
    sidebar.classList.remove('open', 'collapsed');
    overlay.classList.remove('show');
    layout.classList.remove('sidebar-collapsed');
  });
}

/* ================= MODAL ================= */
function initModal() {
  const btnCrear = document.getElementById('btnCrearTicket');
  const modal = document.getElementById('modalOverlay');
  const btnCerrar = document.getElementById('btnCancelarModal');

  if (!btnCrear || !modal || !btnCerrar) {
    console.warn('Modal: elementos no encontrados');
    return;
  }

  btnCrear.addEventListener('click', () => {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  });

  btnCerrar.addEventListener('click', () => {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    }
  });
}


// ================================
// LOGOUT (RESPETA SIDEBAR DINÁMICO)
// ================================
function initLogout() {
  document.addEventListener('click', async (e) => {
    if (e.target.id !== 'btnLogout') return;

    if (!confirm('¿Deseas cerrar sesión?')) return;

    try {
      const res = await fetch(
        `${BASE_PATH}/backend/auth/logout.php`,
        {
          method: 'POST',
          credentials: 'include'
        }
      );

      const data = await res.json();

      if (data.success) {
        window.location.href = `${BASE_PATH}/frontend/login/index.html`;
      } else {
        alert('No se pudo cerrar sesión');
      }

    } catch (err) {
      console.error('Error cerrando sesión', err);
      alert('Error de conexión al cerrar sesión');
    }
  });
}

// ================================
// INIT GENERAL
// ================================
async function initDashboard() {
  // ⛔ VALIDAR SESIÓN PRIMERO
  const user = await checkAuth();
  console.log('USER:', user);

  // ✅ SOLO SI HAY SESIÓN, CARGAR COMPONENTES
  await loadComponent(
    'header',
    `${BASE_PATH}/frontend/dashboard/usuario/components/header.html`
  );

  await loadComponent(
    'sidebarNav',
    `${BASE_PATH}/frontend/dashboard/usuario/components/sidebar.html`
  );

  await loadComponent(
    'cardboard',
    `${BASE_PATH}/frontend/dashboard/usuario/components/cardboard.html`
  );

  await loadComponent(
    'modal',
    `${BASE_PATH}/frontend/dashboard/usuario/components/modal_crear_ticket.html`
  );

  const title = document.getElementById('ticketsTitle');
  if (title && user?.nombre_usu) {
    title.textContent = `Tickets de ${user.nombre_usu}`;
  }

  initSidebar();
  initModal();
  initLogout();
  initCrearTicket();
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `toast show ${type === 'error' ? 'error' : ''}`;

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, 300);
  }, 3000);
}

// ================================
// DOM READY
// ================================
document.addEventListener('DOMContentLoaded', initDashboard);

function initCrearTicket() {

  const form = document.getElementById('formCrearTicket');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo')?.value.trim();
    const descripcion = document.getElementById('descripcion')?.value.trim();
    const categoria = document.getElementById('categoria')?.value;
    const prioridad = document.getElementById('prioridad')?.value;

    if (!titulo || !descripcion) {
      showToast('Título y descripción obligatorios', 'error');
      return;
    }

    try {

      const res = await fetch(
        `${BASE_PATH}/backend/tickets/create.php`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            titulo,
            descripcion,
            categoria,
            prioridad
          })
        }
      );

      const data = await res.json();

      if (!data.ok) {
        showToast(data.msg || 'Error al crear ticket', 'error');
        return;
      }

      showToast('Ticket creado correctamente');

      form.reset();

      document.getElementById('modalOverlay')
        ?.classList.add('hidden');

      document.body.style.overflow = 'auto';

      // 🔄 Recargar lista
      if (typeof loadTickets === 'function') {
        loadTickets();
      }

    } catch (err) {
      console.error(err);
      showToast('Error de conexión', 'error');
    }
  });
}

