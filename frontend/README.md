# Frontend – Sistema de Tickets de Soporte TI

## Descripción
Este proyecto corresponde al **Frontend** de la WebApp de Tickets de Soporte TI.
Su función es proveer las interfaces visuales para que los usuarios y técnicos
interactúen con el sistema de tickets, consumiendo un backend en PHP mediante
peticiones AJAX.

El frontend **no contiene lógica de negocio**, validaciones críticas ni manejo
directo de base de datos. Toda la lógica reside en el backend.

---

## Stack Tecnológico
- HTML5
- JavaScript (Vanilla)
- Bootstrap 5
- AJAX / Fetch API

No se utilizan frameworks de frontend (React, Vue, Angular).

---

## Estructura general
El frontend se organiza por **portales**, dependiendo del rol del usuario:

- Portal Usuario
- Portal Técnico

La separación de portales se determina desde el backend en base a la sesión
del usuario autenticado.

---

## Autenticación y sesiones
- El frontend **no maneja credenciales directamente**.
- El login se realiza contra el backend.
- La sesión PHP determina:
  - Si el usuario está autenticado
  - Qué portal debe mostrarse
- El frontend solo valida si la sesión existe antes de cargar cada vista.

---

## Portales

### Portal Usuario
Funcionalidades:
- Inicio de sesión
- Creación de tickets
- Visualización del historial de tickets propios
- Consulta del detalle del ticket
- Comunicación tipo chat con el técnico asignado

Restricciones:
- Solo puede ver sus propios tickets
- No puede cambiar estatus manualmente
- No puede ver tickets de otros usuarios

---

### Portal Técnico
Funcionalidades:
- Visualización de tickets abiertos
- Toma de tickets
- Cambio de estatus
- Atención de tickets
- Comunicación tipo chat con el usuario
- Cierre de tickets

Restricciones:
- Solo accesible para usuarios con rol de técnico
- No puede modificar información de usuarios

---

## Estados del Ticket
El frontend debe respetar y mostrar únicamente los siguientes estados:

- ABIERTO
- EN_ESPERA
- EN_PROCESO
- CERRADO

El frontend **no decide transiciones de estado**, solo refleja los cambios
confirmados por el backend.

---

## Comunicación con el Backend
- Todas las interacciones se realizan vía AJAX / Fetch.
- El frontend consume endpoints REST internos.
- Las respuestas del backend se manejan en formato JSON.

Ejemplos de acciones:
- Crear ticket
- Listar tickets
- Obtener detalle de ticket
- Enviar mensaje de chat
- Actualizar estatus

---

## Chat por Ticket
- El chat está asociado a un ticket específico.
- Se implementa mediante polling o peticiones periódicas.
- Cada mensaje incluye:
  - Emisor (usuario o técnico)
  - Fecha y hora
  - Contenido del mensaje

El frontend solo muestra la conversación; la persistencia y validación
corresponden al backend.

---

## Responsividad
- El frontend debe ser completamente responsive.
- Optimizado para:
  - Escritorio
  - Tablet
  - Móvil
- Bootstrap se utiliza como base del diseño responsivo.

---

## Seguridad
- El frontend no expone información sensible.
- Todas las validaciones críticas se realizan en backend.
- El acceso a vistas protegidas depende de la sesión activa.

---

## Alcance del Frontend
Incluye:
- Interfaces visuales
- Formularios
- Tablas y dashboards
- Comunicación con el backend

No incluye:
- Lógica de autenticación
- Manejo de usuarios
- Acceso directo a base de datos
- Envío de correos
- Gestión de SLA

---

## Evolución futura
- Mejora visual del dashboard
- WebSockets para chat en tiempo real
- Notificaciones visuales
- Componentización de vistas
- Temas visuales

---

## Notas finales
Este frontend está diseñado para ser:
- Simple
- Mantenible
- Escalable
- Compatible con backend PHP estructurado

Cualquier cambio en reglas de negocio debe realizarse exclusivamente en el backend.
