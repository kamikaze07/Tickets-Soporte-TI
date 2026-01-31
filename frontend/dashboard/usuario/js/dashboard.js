// ================================
// CARGA DE COMPONENTES HTML
// ================================
async function loadComponent(id, path) {
  try {
    const res = await fetch(path);
    const html = await res.text();
    document.getElementById(id).innerHTML = html;
  } catch (error) {
    console.error(`Error cargando ${path}`, error);
  }
}

// Cargar componentes
loadComponent('header', 'components/header.html');
loadComponent('sidebar', 'components/sidebar.html');
loadComponent('cardboard', 'components/cardboard.html');
loadComponent('modal', 'components/modal_crear_ticket.html');

// ================================
// EVENTOS UI GLOBALES
// ================================
document.addEventListener('click', (e) => {

  // Toggle sidebar (mobile)
  if (e.target.id === 'btnMenu') {
    const sidebar = document.getElementById('sidebarNav');
    sidebar?.classList.toggle('open');
  }

  // Abrir modal
  if (e.target.id === 'btnCrearTicket') {
    openModal();
  }

  // Cerrar modal
  if (e.target.id === 'btnCerrarModal' || e.target.id === 'modalOverlay') {
    closeModal();
  }

});

// ================================
// MODAL
// ================================
function openModal() {
  const modal = document.getElementById('modalOverlay');
  modal?.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('modalOverlay');
  modal?.classList.add('hidden');
  document.body.style.overflow = '';
}

document.addEventListener('click', (e) => {

  // Abrir / cerrar sidebar
  if (e.target.id === 'btnMenu') {
    const sidebar = document.getElementById('sidebarNav');
    sidebar.classList.toggle('open');
  }

});