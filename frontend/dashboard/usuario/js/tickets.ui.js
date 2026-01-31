// ================================
// MOCK DE TICKETS
// ================================
let tickets = [
  {
    folio: 'TC-2026-0001',
    subject: 'No tengo acceso al sistema',
    status: 'Abierto'
  },
  {
    folio: 'TC-2026-0002',
    subject: 'Error en impresora',
    status: 'En Proceso'
  }
];

// ================================
// RENDER TICKETS
// ================================
function renderTickets() {
  const list = document.getElementById('ticketList');
  if (!list) return;

  list.innerHTML = '';

  tickets.forEach(ticket => {
    const li = document.createElement('li');
    li.className = 'ticket-item';

    li.innerHTML = `
      <strong>${ticket.folio}</strong><br/>
      <span>${ticket.subject}</span><br/>
      <span class="badge ${statusClass(ticket.status)}">
        ${ticket.status}
      </span>
    `;

    list.appendChild(li);
  });
}

// ================================
// STATUS → CLASE CSS
// ================================
function statusClass(status) {
  switch (status) {
    case 'Abierto':
      return 'badge-open';
    case 'En Proceso':
      return 'badge-progress';
    case 'En Espera':
      return 'badge-wait';
    case 'Cerrado':
      return 'badge-closed';
    default:
      return '';
  }
}

// ================================
// FORM CREAR TICKET
// ================================
document.addEventListener('submit', (e) => {
  if (e.target.id !== 'formCrearTicket') return;

  e.preventDefault();

  const form = e.target;

  const subject = form.querySelector('input').value;
  const category = form.querySelectorAll('select')[0].value;
  const priority = form.querySelectorAll('select')[1].value;
  const description = form.querySelector('textarea').value;

  const newTicket = {
    folio: generateFolio(),
    subject,
    status: 'Abierto'
  };

  tickets.unshift(newTicket);
  renderTickets();
  form.reset();
  closeModal();
});

// ================================
// FOLIO MOCK
// ================================
function generateFolio() {
  const next = tickets.length + 1;
  return `TC-2026-${String(next).padStart(4, '0')}`;
}

// ================================
// INIT
// ================================
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(renderTickets, 300);
});
