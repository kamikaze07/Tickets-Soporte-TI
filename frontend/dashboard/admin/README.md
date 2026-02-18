🛠️ Módulo de Administración – Tickets de Soporte TI

Este módulo corresponde al panel de administración del sistema Tickets de Soporte TI.

Está diseñado para que el Administrador / SUPER USUARIO pueda monitorear, atender y cerrar tickets creados por los usuarios del sistema, con una experiencia optimizada tanto para desktop como móvil, con enfoque en productividad diaria del área de TI.

🎯 Objetivo del Módulo

Permitir que el administrador pueda:

Visualizar el estado general del sistema en tiempo real

Monitorear KPIs de tickets

Revisar y filtrar tickets

Atender tickets mediante comentarios

Cambiar el estado de los tickets

Cerrar tickets una vez resueltos

Trabajar cómodamente desde móvil o escritorio

Tener actualización automática del dashboard

🧱 Arquitectura General

El módulo está dividido en:

Frontend (HTML + CSS + JS)
↓ fetch / JSON
Backend (PHP + PDO)
↓
Base de Datos (MySQL)

Comunicación:

Fetch (AJAX)

Respuestas JSON

Autenticación mediante sesiones PHP

🎨 FRONTEND – Dashboard Admin

Ubicación:

frontend/dashboard/admin/

📁 Estructura
admin/
├── index.html          # Dashboard principal
├── tickets.html        # Listado y filtrado de tickets
├── ticket.html         # Detalle y atención de un ticket
├── css/
│   └── dashboard.css   # Estilos globales del módulo admin
└── js/
    ├── dashboard.js    # Lógica del dashboard
    ├── tickets.js      # Gestión del listado
    └── ticket.js       # Atención y chat del ticket

📊 Dashboard Principal (index.html)

El dashboard ahora está 100% conectado al backend.

Funciones actuales:

KPIs reales por estado

Tarjeta de tickets críticos

Últimos 5 tickets dinámicos

Gráfico circular de distribución por estado

Auto refresh cada 30 segundos

Nombre real del administrador en el header

Logout seguro con destrucción de sesión

🔢 KPIs Dinámicos

Estados:

Abierto

En Proceso

En Espera

Cerrado

Los valores se obtienen desde:

backend/dashboard/admin_stats.php

📈 Gráfico de Distribución

Tipo: Doughnut (Chart.js)

Muestra distribución por estado

Adaptado para desktop y móvil

Diseño compacto en dispositivos móviles

🔄 Auto Refresh

El dashboard se actualiza automáticamente cada 30 segundos:

KPIs

Últimos tickets

Tickets críticos

Gráfico

📱 Optimización Móvil

El dashboard fue adaptado con enfoque tipo app:

KPIs compactos en 2 columnas

Gráfico reducido proporcionalmente

Tabla convertida a formato tipo tarjetas

Botones full-width táctiles

Espaciado optimizado

Sidebar colapsable

Se buscó sensación de aplicación nativa.

🎫 Módulo de Atención de Tickets
📄 Listado (tickets.html)

Función:

Mostrar todos los tickets

Filtrar por:

Estado

Prioridad

UX:

Badges de estado

Colores por prioridad

Hover en desktop

Diseño tipo tarjeta en móvil

Botón claro de acción: Ver

Backend consumido:
GET /backend/tickets/admin_list.php

📄 Detalle del Ticket (ticket.html)

Función:

Visualizar información completa

Conversación tipo chat

Cambiar estado

Responder al usuario

Cerrar ticket

Información mostrada:

ID

Usuario

Prioridad

Categoría

Estado

Fecha

Descripción

Chat de Atención

Mensajes diferenciados por rol (admin / usuario)

Timestamps

Auto-scroll

Soporte para archivos adjuntos

Conversación ordenada cronológicamente

Endpoints utilizados:
GET  /backend/tickets/admin_get.php?id=#
POST /backend/tickets/admin_reply.php
POST /backend/tickets/admin_update_status.php

⚙️ BACKEND – Administración

Ubicación:

backend/

📁 Estructura relevante
auth/
├── login.php
└── logout.php

dashboard/
└── admin_stats.php

tickets/
├── admin_list.php
├── admin_get.php
├── admin_reply.php
└── admin_update_status.php

📊 Endpoint Dashboard – admin_stats.php

Devuelve:

{
  "admin_nombre": "CESAR01",
  "kpis": {
    "Abierto": 0,
    "En Proceso": 0,
    "En Espera": 1,
    "Cerrado": 11
  },
  "criticos": 0,
  "ultimos": [ ... ]
}


Incluye:

Nombre del admin desde sesión

Conteo por estado

Tickets críticos (Alta + no Cerrado)

Últimos 5 tickets ordenados por fecha

🗄️ Base de Datos
Tabla tickets
id
usuario_num_emp
tecnico_num_emp
titulo
descripcion
prioridad   ENUM('Baja','Media','Alta')
categoria
status      ENUM('Abierto','En Espera','En Proceso','Cerrado')
created_at
updated_at

Tabla ticket_comentarios
id
ticket_id
autor           -- 'admin' | 'usuario'
comentario
archivo
nombre_archivo
created_at

🔄 Flujo de Atención

Admin abre dashboard

Visualiza KPIs y últimos tickets

Accede a tickets.html

Selecciona ticket

Atiende conversación

Cambia estado

Cierra ticket

🔐 Seguridad

Autenticación por sesión PHP

Validación de $_SESSION['num_emp']

Logout destruye sesión completamente

Endpoints bloquean acceso sin sesión

Uso de PDO con prepared statements

🎨 UX & Diseño

Responsive real (no solo adaptable)

Diseño compacto tipo app en móvil

Sidebar colapsable

Badges de estado

Colores por prioridad

Gráfico visual de distribución

Animación ligera en KPIs

Auto actualización

Experiencia enfocada en productividad TI

🚀 Posibles Mejoras Futuras

Notificaciones en tiempo real (WebSocket)

Métricas por técnico

SLA y tiempos promedio de atención

Filtros avanzados

Exportación de reportes

Dashboard con métricas históricas

Notificaciones push

✅ Estado Actual del Módulo

✔ Dashboard conectado al backend
✔ KPIs reales
✔ Últimos tickets dinámicos
✔ Tickets críticos detectados
✔ Gráfico funcional
✔ Auto refresh
✔ Logout seguro
✔ UX móvil optimizada
✔ Backend funcional
✔ Listo para producción

Proyecto: Tickets de Soporte TI
Módulo: Administración – Atención de Tickets