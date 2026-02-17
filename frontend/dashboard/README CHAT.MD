📘 README – Módulo de Chat (Usuario & Admin)
# 💬 Módulo de Chat – Tickets Soporte TI

Este módulo implementa el sistema de conversación en tiempo real entre **Usuario** y **Administrador (SUPER USUARIO)** dentro del sistema de Tickets de Soporte TI.

Incluye:

- 🔄 Comunicación en tiempo real con WebSocket (Ratchet)
- 💬 Mensajes de texto
- 📎 Envío de archivos (imágenes y documentos)
- 🖼️ Vista previa de imágenes
- 🗄️ Persistencia en base de datos
- 🔐 Validación de sesión PHP

---

# 🏗️ Arquitectura General



Usuario (Frontend JS)
↕ WebSocket (ws://:8080)
ChatServer.php (Ratchet)
↕
Backend PHP (REST)
↕
Base de Datos (MySQL)


---

# 👤 Chat Usuario

📂 Ubicación:


/frontend/dashboard/usuario/


## ✨ Funcionalidades

- Ver listado de tickets
- Abrir detalle del ticket
- Enviar mensajes en tiempo real
- Enviar archivos mediante:
  - 📎 Selector de archivos
  - 📋 Pegado desde portapapeles
- Visualizar imágenes dentro del chat
- Modal para ampliar imágenes

---

## 🔌 Flujo de Mensaje (Usuario)

1. Usuario escribe mensaje
2. Se envía a:


backend/tickets/user_reply.php

3. Se guarda en base de datos
4. Se notifica por WebSocket
5. Admin recibe mensaje en tiempo real

---

## 📎 Envío de Archivos (Usuario)

Endpoint:



backend/tickets/upload_file.php


Soporta:

- 🖼️ jpg, jpeg, png, gif, webp
- 📄 pdf
- 📝 doc, docx
- 📊 xls, xlsx

### 🔒 Seguridad

- Validación de sesión activa
- Límite máximo: **10MB**
- Validación de extensión
- Redimensionamiento automático de imágenes > 1920px
- Nombre único generado con `uniqid()`

---

# 🛠️ Chat Administrador

📂 Ubicación:


/frontend/dashboard/admin/


## ✨ Funcionalidades

- Visualizar detalles completos del ticket
- Cambiar estado del ticket:
  - Abierto
  - En Proceso
  - En Espera
  - Cerrado
- Enviar mensajes en tiempo real
- Enviar archivos
- Visualizar archivos enviados por usuario
- Indicador de hora del mensaje

---

## 🔌 Flujo de Mensaje (Admin)

1. Admin escribe mensaje
2. Se envía a:


backend/tickets/admin_reply.php

3. Se guarda en base de datos
4. Se emite evento WebSocket
5. Usuario recibe mensaje en tiempo real

---

# 🔄 WebSocket (Ratchet)

📂 Archivo:


ChatServer.php


## 🎯 Funciones

- `join` → Asocia conexión a un ticket_id
- `message` → Envía mensaje a todos los clientes del mismo ticket
- `file` → Envía evento de archivo subido

### 📡 Puerto


ws://hostname:8080


---

## 🧠 Lógica Interna

```php
$this->clients[$conn->resourceId] = [
    'conn' => $conn,
    'ticket_id' => null
];


Filtra por ticket_id para enviar solo a participantes del mismo ticket.

🗄️ Base de Datos

Tabla principal:


ticket_comentarios



Campos relevantes:

ticket_id

autor (usuario / admin)

tipo (texto / archivo)

comentario

archivo

nombre_archivo

created_at

🖼️ Manejo de Imágenes
🔹 Frontend

Si es imagen → se renderiza <img>

Si es documento → se renderiza <a target="_blank">

Modal para ampliación

🔹 Backend

Redimensiona imágenes mayores a 1920px

Convierte a JPG optimizado (calidad 80)

🔐 Seguridad

Validación de sesión en cada endpoint

Cookies PHP con credentials: 'include'

Control de tamaño de archivo

Validación de tipo permitido

Aislamiento por ticket_id en WebSocket

🌐 HTTP vs HTTPS

Actualmente configurado para funcionar en:


http://servidor



Para usar HTTPS se requiere:

Certificado SSL válido

WebSocket seguro wss://

Cookies Secure habilitadas

Configuración de Apache con SSL

📦 Estructura de Archivos Relevantes

backend/
├── tickets/
│   ├── user_reply.php
│   ├── admin_reply.php
│   ├── upload_file.php
│   ├── get_messages.php
│   └── get_ticket_user.php
│
├── websocket/
│   └── ChatServer.php

frontend/
├── dashboard/
│   ├── usuario/
│   │   └── dashboard.js
│   └── admin/
│       └── ticket.js


🚀 Flujo Completo del Sistema

1️⃣ Usuario crea ticket
2️⃣ Admin abre ticket
3️⃣ Conversación en tiempo real
4️⃣ Archivos almacenados en /uploads
5️⃣ Persistencia completa en BD
6️⃣ Sincronización mediante WebSocket

🧪 Pruebas Recomendadas

Envío de mensaje texto usuario → admin

Envío de mensaje texto admin → usuario

Subida imagen usuario → admin

Subida documento admin → usuario

Cambio de estado en tiempo real

Validación de sesión expirada

👨‍💻 Tecnologías Utilizadas

PHP 8.x

MySQL

JavaScript Vanilla

Ratchet WebSocket

Apache 2 (Debian 11)

HTML5 / CSS3

📌 Notas Técnicas

El sistema usa WebSocket para evitar polling.

Los archivos se almacenan físicamente en /uploads.

Las imágenes se optimizan automáticamente.

Compatible con entorno local en red LAN.

🏁 Estado del Módulo

✅ Funcional en entorno HTTP
⚙️ Listo para migración a HTTPS con ajustes WSS

Autor: Sistema Tickets Soporte TI
Módulo: Chat Usuario / Admin