🛠️ Módulo de Mantenimientos TI

Sistema integral para la gestión de Mantenimientos Preventivos y Correctivos, completamente integrado al módulo de Inventario TI.

🚀 Funcionalidades Principales

📅 Programación de mantenimientos preventivos

🖊 Cierre con firma digital del técnico

📷 Carga obligatoria de evidencia fotográfica (2–3 imágenes)

📄 Generación dinámica de PDF (sin almacenamiento en servidor)

🔐 Validación pública mediante QR

🕘 Registro automático en historial del equipo

📊 Vista anual y mensual con calendario interactivo

🧱 Arquitectura del Módulo
frontend/dashboard/admin/mantenimientos/
backend/mantenimientos/
backend/public/
uploads/mantenimientos/
📁 Estructura de Carpetas
📂 Frontend

Ubicación:

frontend/dashboard/admin/mantenimientos/

Contiene:

mantenimientos.js

mantenimientos.css

Vista calendario (FullCalendar)

Modal de asignación

Modal de cierre

Canvas de firma

Generador de PDF (jsPDF)

📂 Backend – Endpoints

Ubicación:

backend/mantenimientos/

Endpoints principales:

create_preventivo.php → Crear mantenimiento

complete_mantenimiento.php → Cerrar mantenimiento

list_year_summary.php → Resumen anual

list_by_month.php → Lista mensual

list_by_range.php → Eventos calendario

list_by_date.php → Mantenimientos por día

get_full.php → Datos completos para PDF

list_computadoras.php → Equipos elegibles

📂 Vista Pública

Ubicación:

backend/public/mantenimiento.php

Función:

Mostrar mantenimiento validado por token

No requiere sesión

Muestra datos, fotos y firma

📂 Carpeta de Evidencias
uploads/mantenimientos/{id}/
    ├── firma.png
    ├── foto_1.jpg
    ├── foto_2.jpg
    └── foto_3.jpg

📌 No se almacenan PDFs.

🗄️ Base de Datos
📌 Tabla: mantenimientos

Campos relevantes:

equipo_id

tipo (Preventivo / Correctivo)

estado (Pendiente / Realizado / Cancelado)

fecha_programada

fecha_realizada

realizado_por

firma_path

fotos_evidencia

token_validacion

📌 Tabla: inventario_movimientos

Tipos utilizados:

mantenimiento_preventivo

mantenimiento_correctivo

Campos:

equipo_id

descripcion

realizado_por

fecha

🔄 Flujo Operativo
1️⃣ Programar Preventivo

Selección de fecha

Selección de equipo

Validación de duplicado por mes

Inserción en mantenimientos

Registro en historial

Resultado:

estado = Pendiente
2️⃣ Cerrar Mantenimiento

Requisitos obligatorios:

📷 2 a 3 fotos

🖊 Firma digital

Proceso:

Crear carpeta de evidencia

Guardar firma

Guardar fotos

Actualizar mantenimiento:

estado = Realizado

fecha_realizada = NOW()

realizado_por

token_validacion

Insertar movimiento histórico

Generar PDF dinámico

📄 Generación de PDF

Se genera en frontend usando:

jsPDF

autoTable

QRCode.js

Incluye:

Encabezado corporativo

Marca de agua

Datos del equipo

Especificaciones

Evidencia fotográfica en bloque horizontal

Firma del técnico

Código QR de validación

📌 El PDF:

No se guarda

Se regenera cuando se descarga

🖊 Firma Digital

Implementada con:

Canvas HTML5

Soporte mouse

Soporte touch

Validación obligatoria

Guardado en PNG

📷 Compresión de Imágenes

Antes de enviarse al backend:

Redimensionadas proporcionalmente

Convertidas a JPEG

Máximo 1280px

Calidad 0.7

Límite original 10MB

Beneficio:

Optimiza peso del PDF

Reduce carga del servidor

🔐 Seguridad

Validación de sesión en endpoints privados

Tokens únicos para vista pública

Validación de estado = Realizado

Uso de transacciones PDO

Control de duplicados por mes

Prepared Statements

📅 Sistema de Visualización
Vista Anual

12 tarjetas

Indicador de pendientes

Indicador de completos

Resumen mensual

Vista Mensual

FullCalendar

Vista Month / Week / List

Responsive móvil

Eventos dinámicos

🧠 Decisiones Técnicas

❌ No almacenar PDFs

✅ Guardar solo evidencia real

✅ Regeneración dinámica

✅ Token público independiente

✅ Separación frontend/backend clara

⚙️ Requisitos Técnicos

PHP 8+

MySQL (InnoDB)

FullCalendar

jsPDF

jsPDF AutoTable

QRCode.js

✅ Estado del Módulo

✔ Programación funcional

✔ Cierre con firma

✔ Evidencia obligatoria

✔ PDF dinámico

✔ QR validable

✔ Historial integrado

✔ Calendario anual/mensual

✔ Responsive