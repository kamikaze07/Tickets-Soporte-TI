# 🛠️ Módulo de Administración – Tickets de Soporte TI

Este módulo corresponde al **panel de administración** del sistema **Tickets de Soporte TI**.  
Está diseñado para que el **SUPER USUARIO / ADMIN** pueda **atender, gestionar y cerrar tickets** creados por los usuarios del sistema.

El enfoque principal de este módulo es la **atención de tickets**, proporcionando una experiencia clara, rápida y orientada al trabajo diario del área de TI.

---

## 🎯 Objetivo del Módulo

Permitir que el administrador pueda:

- Visualizar el estado general del sistema
- Revisar tickets creados por los usuarios
- Atender tickets mediante comentarios
- Cambiar el estado de los tickets
- Cerrar tickets una vez resueltos
- Trabajar desde desktop o dispositivos móviles

---

## 🧱 Arquitectura General

El módulo está dividido en **Frontend** y **Backend**, comunicándose mediante **fetch (AJAX)** y **JSON**, usando sesiones PHP para seguridad.

Admin (Frontend)
↓ fetch / JSON
Admin (Backend PHP)
↓
Base de Datos (MySQL)

---

# 🎨 FRONTEND – Dashboard Admin

Ubicación:
frontend/dashboard/admin/

### 📁 Estructura

admin/
├── index.html # Dashboard principal
├── tickets.html # Listado y filtrado de tickets
├── ticket.html # Detalle y atención de un ticket
├── css/
│ └── dashboard.css # Estilos globales del admin
└── js/
├── dashboard.js # UX del dashboard principal
├── tickets.js # Gestión de tickets
└── ticket.js # Atención de ticket

---

## 📊 Dashboard Principal (`index.html`)

Función:
- Vista general del sistema
- KPIs visuales de tickets
- Acceso rápido a tickets recientes

### Elementos UX:
- Tarjetas KPI:
  - Abiertos
  - En proceso
  - En espera
  - Cerrados
- Acciones rápidas
- Tabla de últimos tickets

> ⚠️ Actualmente usa datos simulados, pero está **preparado para conectarse al backend**.

---

## 🎫 Módulo de Atención de Tickets (Frontend)

### 📄 Listado de Tickets (`tickets.html`)

Función:
- Mostrar todos los tickets del sistema
- Permitir filtrado por:
  - Estado
  - Prioridad

### UX Destacado:
- Estados con **badges visuales**
- Prioridad con colores
- Hover de filas
- Botón claro de acción (**Ver**)

### Backend consumido:
GET /backend/tickets/admin_list.php

---

### 📄 Detalle del Ticket (`ticket.html`)

Función:
- Atender un ticket específico
- Comunicarse con el usuario
- Cambiar estado del ticket

### Elementos clave:
- Información del ticket:
  - Usuario
  - Prioridad
  - Categoría
  - Fecha
- Selector de estado
- Botón para cerrar ticket
- Chat de atención (admin / usuario)

### UX:
- Conversación tipo chat
- Mensajes diferenciados por rol
- Timestamps
- Auto-scroll
- Feedback inmediato tras acciones

### Backend consumido:
GET /backend/tickets/admin_get.php?id=#
POST /backend/tickets/admin_reply.php
POST /backend/tickets/admin_update_status.php

---

# ⚙️ BACKEND – Administración de Tickets

Ubicación:
backend/tickets/

### 📁 Estructura

tickets/
├── admin_list.php # Lista todos los tickets
├── admin_get.php # Detalle de un ticket
├── admin_reply.php # Respuesta del admin
├── admin_update_status.php # Cambio de estado del ticket

Todos los endpoints:
- Usan **PDO**
- Validan **sesión activa**
- Trabajan con **JSON**
- Están pensados para consumo vía AJAX

---

## 🗄️ Base de Datos (Tablas involucradas)

### Tabla `tickets`
Campos usados por el módulo admin:
- `id`
- `titulo`
- `descripcion`
- `prioridad`
- `categoria`
- `status`
- `created_at`
- `usuario_num_emp`

### Tabla `ticket_comentarios`
Usada para la atención del ticket:

```sql
id
ticket_id
autor        -- 'admin' | 'usuario'
comentario
created_at
🔄 Flujo de Atención de un Ticket
Admin abre tickets.html
        ↓
Selecciona un ticket
        ↓
ticket.html?id=#
        ↓
Lee información y mensajes
        ↓
Responde al usuario
        ↓
Cambia estado (Abierto → En Proceso / En Espera)
        ↓
Cierra ticket
🔐 Seguridad
Basada en sesiones PHP
Validación de usuario autenticado ($_SESSION['num_emp'])
Endpoints pensados para rol ADMIN / SUPER USUARIO
Acceso directo bloqueado si no hay sesión
🎨 UX y Diseño
Diseño responsive (desktop + móvil)
Sidebar colapsable
Badges de estado
Prioridades visuales
Jerarquía clara de información
Pensado para uso diario en TI
🚀 Posibles Mejoras Futuras
Conectar KPIs del dashboard al backend
Notificaciones al usuario cuando el admin responde
Historial de cambios de estado
SLA y tiempos de atención
Adjuntar archivos en tickets
Métricas por técnico / administrador
✅ Estado del Módulo
✔ Funcional
✔ UX pulido
✔ Backend real
✔ Escalable
✔ Listo para producción
Autor:
Proyecto Tickets de Soporte TI
Módulo de Administración – Atención de Tickets