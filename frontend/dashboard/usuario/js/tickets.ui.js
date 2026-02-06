/* ===============================
   ESTADO
================================ */
let tickets = [];

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

    if (!res.ok) {
      console.error('Error HTTP:', res.status);
      renderTickets([]);
      return;
    }

    const data = await res.json();

    if (!Array.isArray(data)) {
      console.error('Formato inválido de tickets:', data);
      renderTickets([]);
      return;
    }

    tickets = data;
    renderTickets(tickets);

  } catch (err) {
    console.error('Error cargando tickets:', err);
    renderTickets([]);
  }
}

/* ===============================
   RENDER TICKETS
================================ */
function renderTickets(list) {
  const container = document.getElementById('ticketList');
  if (!container) return;

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
        <div class="ticket-meta">
          ${t.categoria} · ${t.prioridad}
        </div>
        <span class="ticket-status">
          ${t.status}
        </span>
      </div>
    `;


    container.appendChild(item);
  });
}

/* ===============================
   CREAR TICKET
================================ */
function initCreateTicket() {
  const form = document.getElementById('formCrearTicket');
  if (!form) {
    console.warn('No existe #formCrearTicket');
    return;
  }

  // Evitar múltiples listeners
  if (form.dataset.bound === 'true') return;
  form.dataset.bound = 'true';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const titulo = document.getElementById('titulo');
    const categoria = document.getElementById('categoria');
    const prioridad = document.getElementById('prioridad');
    const descripcion = document.getElementById('descripcion');

    if (!titulo || !categoria || !prioridad || !descripcion) {
      console.error('Campos del formulario no encontrados');
      return;
    }

    const payload = {
      titulo: titulo.value.trim(),
      categoria: categoria.value,
      prioridad: prioridad.value,
      descripcion: descripcion.value.trim()
    };

    if (!payload.titulo || !payload.descripcion) {
      alert('Asunto y descripción son obligatorios');
      return;
    }

    try {
      const res = await fetch(
        `${BASE_PATH}/backend/tickets/create.php`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const data = await res.json();

      if (!res.ok || !data.ok) {
        alert(data.msg || 'Error al crear ticket');
        return;
      }

      // Éxito
      showToast('✅ Ticket creado correctamente');


      // ✅ Cerrar modal
      document.getElementById('modalOverlay')?.classList.add('hidden');

      // ✅ Limpiar formulario
      form.reset();

      // ✅ Recargar tickets
      loadTickets();

    } catch (err) {
      console.error('Error creando ticket:', err);

      showToast('❌ Error al crear el ticket', 'error');

      alert('Error de conexión al crear ticket');
    }
  });
}


/* ===============================
   ESPERAR HTML DINÁMICO
================================ */
function waitForTicketUI() {
  const observer = new MutationObserver(() => {
    if (document.getElementById('ticketList')) {
      loadTickets();
    }
    if (document.getElementById('formCrearTicket')) {
      initCreateTicket();
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

/* ===============================
   INIT
================================ */
document.addEventListener('DOMContentLoaded', () => {
  waitForTicketUI();
});
