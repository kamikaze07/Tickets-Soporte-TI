📄 Módulo de Usuario – Creación de Tickets

Tickets de Soporte TI

Este módulo permite a un usuario autenticado crear tickets de soporte y consultar el estado de sus propios tickets, mediante una interfaz web ligera y una API backend en PHP.

🎯 Alcance del Módulo
Incluye

Creación de tickets por usuarios

Visualización de tickets del usuario

Estados del ticket

Interfaz UX optimizada para usuario final

Seguridad basada en sesión

No incluye

Atención de tickets

Asignación a técnicos

Administración de usuarios

Vista de otros usuarios

👤 Tipo de Usuario

Usuario final

Autenticado mediante sesión PHP

Identificado por:

num_emp

rol

🧱 Arquitectura del Módulo
Usuario
  │
  │ Interfaz Web (HTML / CSS / JS)
  │
  ▼
API Backend (PHP)
  │
  ▼
Base de Datos

🔐 Autenticación

Antes de permitir cualquier acción, el módulo valida que exista una sesión activa.

Endpoint
GET /backend/auth/check_session.php

Respuesta esperada
{
  "authenticated": true,
  "num_emp": 950,
  "rol": "LIQUIDACIONES"
}

Comportamiento

Si no hay sesión válida → redirección al login

Si hay sesión → se habilita el módulo

🖥️ Frontend – Módulo Usuario
📁 Estructura
frontend/dashboard/usuario/
├── index.html
├── css/
│   └── dashboard.css
├── js/
│   ├── dashboard.js
│   └── tickets.ui.js
└── components/
    ├── header.html
    ├── sidebar.html
    ├── cardboard.html
    └── modal_crear_ticket.html

📄 index.html

Responsabilidades:

Definir el layout del módulo

Mostrar:

Título del módulo

Lista de tickets

Panel lateral informativo

Contenedores para carga dinámica

Elemento clave:

<h3 id="ticketsTitle">Mis Tickets</h3>


Este título se personaliza con el identificador del usuario.

🧠 dashboard.js

Responsabilidades:

Validar sesión del usuario

Cargar componentes dinámicos

Inicializar sidebar, modal y logout

Personalizar el título del módulo

Ejemplo de personalización:

Tickets de CESARLIQ


No gestiona lógica de tickets directamente.

🎟️ tickets.ui.js

Responsabilidades:

Obtener tickets del usuario autenticado

Renderizar la lista de tickets

Crear nuevos tickets

Actualizar la UI sin recargar la página

🪟 Modal de Creación de Ticket

El usuario puede crear un ticket mediante un modal.

Campos del formulario

Título

Categoría (Hardware / Software)

Prioridad (Alta / Media / Baja)

Descripción

Validaciones

Campos obligatorios

Envío vía fetch en formato JSON

Feedback inmediato al usuario

⚙️ Backend – Módulo Usuario
📁 Endpoints involucrados
backend/
└── tickets/
    ├── create.php
    └── list_user.php

📝 Crear Ticket

Endpoint

POST /backend/tickets/create.php


Payload

{
  "titulo": "Nuevo Mouse",
  "categoria": "Hardware",
  "prioridad": "Alta",
  "descripcion": "El mouse no responde"
}


Reglas

Requiere sesión activa

El ticket se asocia al num_emp del usuario

Estado inicial: Abierto

📋 Listar Tickets del Usuario

Endpoint

GET /backend/tickets/list_user.php


Comportamiento

Devuelve únicamente los tickets del usuario autenticado

No permite acceso a tickets de otros usuarios

Respuesta

[
  {
    "titulo": "Nuevo Mouse",
    "categoria": "Hardware",
    "prioridad": "Alta",
    "status": "Abierto"
  }
]

🎨 Estados del Ticket (Usuario)

Estados visibles para el usuario:

Abierto

En Proceso

En Espera

Cerrado

Cada estado se representa visualmente mediante:

Indicador de color

Texto descriptivo

🧠 Experiencia de Usuario (UX)

Lista ligera tipo “work list”

Separación visual clara entre tickets

Feedback inmediato al crear ticket

No se recarga la página

Interfaz pensada para uso diario

🗄️ Base de Datos (Resumen)

Tabla tickets:

Asociada al usuario mediante num_emp

Un usuario solo puede consultar sus propios registros

🧭 Decisiones Técnicas del Módulo

Tecnología web:

Accesible desde cualquier dispositivo

Fácil despliegue

Mantenimiento sencillo

Sin frameworks para mantener control total

Separación clara entre UI y lógica

✅ Estado del Módulo

✔ Funcional
✔ Seguro
✔ UX pulido
✔ En producción interna