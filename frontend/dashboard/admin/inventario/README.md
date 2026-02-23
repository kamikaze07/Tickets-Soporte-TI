📦 Módulo de Inventario TI

Sistema Tickets de Soporte TI

📌 Descripción General

El módulo Inventario TI permite administrar, controlar y etiquetar los equipos tecnológicos de la organización de manera estructurada, trazable y profesional.

Este módulo está diseñado para el SUPER USUARIO / ADMIN, proporcionando herramientas completas para:

📋 Registro de equipos

🔎 Búsqueda y filtrado avanzado

👤 Asignación a empleados

🏷 Generación e impresión de etiquetas QR

📊 Exportación a Excel y PDF

📄 Control institucional de inventario

🏗 Arquitectura del Módulo
📂 Frontend

Ubicación:

/frontend/dashboard/admin/inventario/

Incluye:

inventario.html

inventario.js

inventario.css

Tecnologías utilizadas:

Vanilla JavaScript

CSS moderno (grid, animaciones, badges)

ExcelJS

jsPDF + AutoTable

QRCode.js

⚙ Backend

Ubicación:

/backend/inventario/

Componentes principales:

equipos/list.php

equipos/create.php

asignaciones/asignar.php

asignaciones/usuarios.php

public/equipo.php (acceso público por token QR)

Base de datos involucrada:

inventario_equipos

inventario_asignaciones

empleados

✨ Funcionalidades Principales
➕ 1. Registro de Equipos

Permite registrar equipos según su tipo:

🖥 Computadora

Categoría (Escritorio / Laptop / Servidor)

Sistema Operativo

Procesador *

RAM *

Disco

🖥 Monitor

Tamaño *

Resolución

Tipo de panel

🖨 Impresora

Tecnología (Láser / Inyección)

Monocromática

Modelo de cartucho

Cada equipo genera:

🆔 Identificador único automático

🔐 Token público para QR

📅 Registro en base de datos

📋 2. Tabla Inteligente de Inventario

Incluye:

🔎 Búsqueda global en tiempo real

📂 Filtro por tipo

📌 Filtro por estado

🔢 Paginación dinámica

🔄 Ordenamiento por columnas

🎨 Badges visuales por estado

Estados disponibles:

🟢 Disponible

🔵 Asignado

🟡 En reparación

🔴 Dado de baja

👤 3. Asignación de Equipos

Permite:

Seleccionar usuario activo

Registrar asignación

Mostrar empleado actual en la tabla

Controlar estado activo/inactivo

Las asignaciones quedan registradas en:

inventario_asignaciones
🏷 Sistema de Etiquetas QR (Multi-Selección)
🚀 Características

Selección múltiple de equipos

Impresión automática hasta 8 etiquetas por hoja

Distribución automática (2 columnas x 4 filas)

Generación de QR dinámico

Acceso público mediante token seguro

📄 Formato de hoja

Tamaño: Letter

8 etiquetas por hoja

Posicionamiento absoluto preciso

Impresión optimizada

🧠 Lógica implementada

Checkbox por equipo

Validación de máximo 8 etiquetas

Generación automática de hoja

Creación dinámica de QR por equipo

📊 Exportaciones
📈 Exportar a Excel

Librería: ExcelJS

Incluye:

🖼 Logo institucional

📅 Fecha

📄 Código de formato institucional

🔢 Número de revisión

👤 Elaboró

📋 Tabla con formato profesional

🎨 Zebra striping

🔍 AutoFiltro activado

📏 Columnas ajustadas

❌ Exclusión de columna de checkboxes

Nombre de archivo generado:

Inventario_Institucional.xlsx
📑 Exportar a PDF

Librería: jsPDF + AutoTable

Generación directa desde tabla HTML

Exclusión automática de columna de acciones

Diseño limpio y compacto

Archivo generado:

Inventario_TI.pdf
🔐 Seguridad

Validación de sesión obligatoria ($_SESSION['num_emp'])

Protección contra ordenamiento SQL no permitido

Uso de consultas preparadas (PDO)

Tokens públicos para QR

Separación clara de frontend/backend

🎨 Diseño UI

Características visuales:

Interfaz moderna tipo SaaS

Botones con gradientes

Animaciones suaves (fade-enter)

Skeleton loader en carga de datos

Badges de estado con colores semánticos

Tabla responsive

Selects personalizados

Experiencia limpia y profesional

📌 Flujo Completo del Usuario

➕ Registrar equipo

👁 Visualizar en tabla

👤 Asignar a empleado

🏷 Seleccionar múltiples equipos

🖨 Imprimir etiquetas QR en lote

📊 Exportar inventario institucional

📦 Mejoras Futuras (Roadmap)

📄 Generación automática de múltiples hojas si >8 etiquetas

🏷 Compatibilidad con plantillas Avery

📊 Dashboard estadístico del inventario

📌 Historial de movimientos por equipo

🔔 Alertas de mantenimiento

📷 Adjuntar evidencia fotográfica por equipo

🧩 Dependencias Externas
ExcelJS
FileSaver.js
jsPDF
jsPDF-AutoTable
QRCode.js
Material Icons
🧠 Buenas Prácticas Aplicadas

Separación de responsabilidades

Código modular

Evita duplicidad de datos

UI desacoplada del backend

Control de estados claros

Escalable para futuras mejoras

👨‍💻 Autor

Cesar Luis Soto Gonzalez
Sistema: Tickets de Soporte TI
Módulo: Inventario TI

📜 Licencia

Uso interno institucional.