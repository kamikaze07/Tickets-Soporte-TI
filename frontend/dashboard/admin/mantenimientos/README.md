🛠️ Módulo de Mantenimientos TI

Sistema de gestión de Mantenimientos Preventivos y Correctivos integrado al ecosistema de Inventario TI.

Permite:

📅 Programar mantenimientos preventivos

🖊 Cerrar mantenimientos con firma digital

📷 Subir evidencia fotográfica

📄 Generar PDF dinámico (sin almacenar el archivo)

🔐 Validar mantenimiento mediante QR público

🕘 Registrar movimientos en historial del equipo

📊 Visualización anual y mensual con calendario

🧱 Arquitectura del Módulo

El módulo está dividido en:

frontend/dashboard/admin/mantenimientos/
backend/mantenimientos/
backend/public/
uploads/mantenimientos/
📁 Estructura de Carpetas
📂 frontend/dashboard/admin/mantenimientos/

Contiene toda la lógica visual y generación de PDF:

mantenimientos.js

mantenimientos.css

Vista calendario (FullCalendar)

Modal asignar

Modal cerrar

Canvas de firma

Generador PDF (jsPDF)

📂 backend/mantenimientos/

Endpoints REST del módulo:

Archivo	Función
create_preventivo.php	Crear mantenimiento preventivo
complete_mantenimiento.php	Cerrar mantenimiento
list_year_summary.php	Resumen anual
list_by_month.php	Lista mensual
list_by_range.php	Eventos para calendario
list_by_date.php	Mantenimientos por día
get_full.php	Datos completos para PDF
list_computadoras.php	Equipos elegibles
📂 backend/public/
Archivo	Función
mantenimiento.php	Vista pública validada por token
📂 uploads/mantenimientos/

Estructura dinámica:

uploads/mantenimientos/{id_mantenimiento}/
    firma.png
    foto_1.jpg
    foto_2.jpg
    foto_3.jpg

No se almacenan PDFs.

🗄️ Base de Datos
📌 Tabla: mantenimientos

Controla el ciclo completo del mantenimiento.

Campos clave:

equipo_id

tipo (Preventivo / Correctivo)

estado (Pendiente / Realizado / Cancelado)

fecha_programada

fecha_realizada

firma_path

fotos_evidencia (JSON)

token_validacion

realizado_por

📌 Tabla: inventario_movimientos

Registra eventos históricos del equipo.

Tipos utilizados por este módulo:

mantenimiento_preventivo

mantenimiento_correctivo

Siempre registra:

equipo_id

descripcion

realizado_por

fecha

🔄 Flujo Completo del Módulo
1️⃣ Programar Preventivo

Se selecciona fecha

Se elige equipo

Se valida que no exista preventivo ese mes

Se inserta en mantenimientos

Se registra movimiento en historial

Resultado:
Estado = Pendiente

2️⃣ Cerrar Mantenimiento

Modal incluye:

📷 2 a 3 fotos obligatorias

🖊 Firma en canvas obligatoria

Al confirmar:

Se crea carpeta en uploads

Se guardan fotos

Se guarda firma

Se actualiza mantenimiento:

estado = Realizado

fecha_realizada = NOW()

realizado_por

token_validacion

Se inserta movimiento histórico

Se genera PDF dinámico en frontend

Resultado:
Estado = Realizado

3️⃣ Generación de PDF

Se genera en frontend con:

jsPDF

autoTable

Marca de agua corporativa

QR dinámico

Evidencia en bloque horizontal

Firma del técnico

El PDF:

❌ NO se guarda en servidor

✅ Se puede regenerar en cualquier momento

✅ Siempre usa datos actuales

4️⃣ Validación por QR

El QR contiene:

backend/public/mantenimiento.php?token=XXXX

El token:

Es único

Se guarda en token_validacion

Solo funciona si estado = Realizado

La vista pública:

No requiere sesión

Muestra datos

Muestra fotos

Muestra firma

Es segura (no expone IDs internos)

📅 Sistema de Visualización
Vista Anual

12 tarjetas

Indicador de pendientes

Indicador de completos

Resumen por mes

Vista Mensual

FullCalendar

Vista month / week / list

Eventos dinámicos

Cambio responsive móvil

🖊 Firma Digital

Implementada con:

Canvas HTML5

Soporte mouse

Soporte touch

Validación obligatoria

Guardado en PNG

📷 Compresión de Imágenes

Antes de enviar al backend:

Se redimensionan

Se comprimen a JPEG

Máx 1280px

Calidad 0.7

Límite 10MB original

Optimiza peso del PDF.

🔐 Seguridad

Validación de sesión en todos los endpoints privados

Tokens únicos para vista pública

Validación de estado antes de mostrar mantenimiento

Transacciones en cierre

Control de duplicados por mes

⚙️ Buenas Prácticas Aplicadas

Transacciones PDO

Prepared statements

Validación frontend + backend

No almacenamiento innecesario de PDF

Historial centralizado

Separación clara frontend/backend

Estructura modular

🚀 Estado del Módulo

✔ Programación funcional
✔ Cierre con firma
✔ Evidencia fotográfica
✔ PDF dinámico corporativo
✔ QR validable
✔ Historial integrado
✔ Calendario anual/mensual
✔ Responsive

🧠 Decisiones Técnicas Importantes
❌ No guardar PDF en base de datos

Evita peso innecesario y duplicación.

❌ No guardar PDF en servidor

Siempre se regenera dinámicamente.

✅ Guardar solo evidencia real

Firma + fotos.

✅ Token público independiente

Evita exponer ID interno.

📌 Requisitos

PHP 8+

MySQL (InnoDB)

FullCalendar

jsPDF

autoTable

QRCode.js

🔮 Posibles Mejoras Futuras

Firma del usuario receptor

Aprobación digital

Certificado digital

Exportación masiva

Dashboard estadístico

Filtros avanzados

Auditoría extendida

👨‍💻 Autor

Desarrollado como parte del sistema:

Tickets de Soporte TI + Inventario TI