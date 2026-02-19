🖥️📦 Módulo de Inventario – Sistema de Control de Activos TI

Este módulo corresponde al Sistema de Control de Activos TI integrado dentro del proyecto Tickets de Soporte TI.

Su propósito es administrar, identificar, asignar y controlar los equipos tecnológicos de la organización mediante:

Identificadores únicos

Tokens públicos encriptados

Códigos QR

Asignaciones controladas

Historial de movimientos

Control de estados

🎯 Objetivo del Módulo

Centralizar el inventario de:

🖥 Equipos de cómputo

🖥 Monitores

🖨 Impresoras

Eliminando la dependencia de archivos Excel y permitiendo:

Gestión desde el sistema

Control de asignaciones

Consulta rápida mediante QR

Escalabilidad futura (PDF, dashboard usuario, reportes)

🏢 Alcance Operativo (Versión 1.0)

✅ Una sola sucursal
❌ Sin centros de costo
❌ Sin depreciación
❌ Sin control de garantías
✅ Generación obligatoria de QR
✅ Token público encriptado
✅ Asignación / desasignación
✅ Historial de movimientos
🚧 PDF de asignación (Fase 2)
🚧 Visualización en dashboard usuario (Fase 2)

🧱 Stack Tecnológico
🔹 Backend

PHP 8.3

Arquitectura modular

API interna en JSON

Sesiones PHP existentes

Control de roles (ADMIN / USUARIO)

🔹 Base de Datos

MySQL / MariaDB

Modelo relacional normalizado

Integrado a base existente

🔹 Frontend

HTML

CSS (dashboard.css)

JavaScript Vanilla

Fetch API

🔹 Generación de QR

Librería PHP (a definir en implementación)

Generación automática

Almacenamiento en /uploads/qrs/

🆔 Sistema de Identificación
📌 Formato del Identificador
TI-[TIPO]-[AÑO]-[CONSECUTIVO]


Ejemplos:

TI-PC-2026-0001
TI-IMP-2026-0002
TI-MON-2026-0003

Reglas

Consecutivo por categoría y año

Generado automáticamente

No editable

Único

🔐 Sistema de Token Público Encriptado

Cada equipo tendrá:

token_publico

activo_publico (boolean)

Ejemplo de acceso:

equipo.php?ref=7f9aX2kLmQp8ZrT8bK9zLm2QaX

Características del token:

32–64 caracteres

Generado criptográficamente

No predecible

Único

No editable manualmente

🔄 Gestión Avanzada de Token (Opción C)

El sistema permitirá:

🔁 Regenerar QR

Genera nuevo token

Invalida el anterior

Genera nueva imagen QR

❌ Invalidar Token

Desactiva acceso público

Mantiene historial

Puede reactivarse generando nuevo token

📱 Funcionamiento del QR

Al escanear:

Se accede a vista pública

Se valida token

Si está activo:

Muestra ficha técnica

Si no:

Error 404 controlado

🖥 Vista Pública del Equipo
Mostrará:

Identificador

Tipo

Marca

Modelo

Número de serie

Estado actual

Usuario asignado (nombre únicamente)

No mostrará:

Historial

Movimientos

Tickets

Datos internos

Acciones administrativas

Vista responsiva y de solo lectura.

👤 Sistema de Roles
🔐 ADMIN

Puede:

Crear equipo

Editar equipo

Cambiar estado

Asignar

Desasignar

Regenerar QR

Invalidar token

👤 USUARIO

Puede:

Ver equipos asignados (Fase 2)

Consultar información vía QR

🔄 Estados del Equipo

🟢 Disponible

🔵 Asignado

🟡 En reparación

🔴 Dado de baja

📌 Sistema de Asignaciones

Cada equipo:

Solo puede tener una asignación activa

Al desasignar se registra fecha de cierre

Todo movimiento queda registrado

🗂 Estructura de Base de Datos
📦 inventario_equipos

id

identificador

token_publico

activo_publico

categoria_id

marca

modelo

numero_serie

especificaciones_json

estado

fecha_alta

activo

👤 inventario_asignaciones

id

equipo_id

num_emp

fecha_asignacion

fecha_desasignacion

asignado_por

estado

📜 inventario_movimientos

id

equipo_id

tipo_movimiento

descripcion

realizado_por

fecha

Movimientos posibles:

alta

asignacion

desasignacion

cambio_estado

regeneracion_token

invalidacion_token

🗂 Estructura de Carpetas
backend/
  inventario/
    equipos/
    asignaciones/
    movimientos/
    qr/

frontend/
  dashboard/
    admin/
      inventario/
    publico/
      equipo.php

uploads/
  qrs/

🔄 Flujo de Alta de Equipo
[ADMIN]
   │
   ▼
Formulario Alta Equipo
   │
   ▼
Validación Backend
   │
   ├── Generar Identificador
   ├── Generar Token Seguro
   ├── Insertar en DB
   ├── Generar Imagen QR
   └── Registrar Movimiento (alta)
   │
   ▼
Confirmación Exitosa

🔄 Flujo de Asignación
[ADMIN]
   │
   ▼
Selecciona Equipo
   │
   ▼
Selecciona Usuario
   │
   ▼
Validación:
   ├── ¿Tiene asignación activa?
   │        ├─ Sí → Error
   │        └─ No → Continúa
   │
   ▼
Crear Registro Asignación
   │
   ├── Cambiar Estado a "Asignado"
   └── Registrar Movimiento
   │
   ▼
Asignación Confirmada

🔄 Flujo de Desasignación
[ADMIN]
   │
   ▼
Selecciona Equipo Asignado
   │
   ▼
Cerrar Asignación Activa
   │
   ├── Actualizar fecha_desasignacion
   ├── Cambiar estado a "Disponible"
   └── Registrar Movimiento
   │
   ▼
Desasignación Exitosa

🔄 Flujo de Regeneración de QR
[ADMIN]
   │
   ▼
Regenerar Token
   │
   ├── Generar nuevo token
   ├── Actualizar DB
   ├── Invalidar token anterior
   ├── Generar nueva imagen QR
   └── Registrar Movimiento
   │
   ▼
Nuevo QR Disponible

🔐 Seguridad

Validación por sesión

Validación por rol

Acceso público solo mediante token válido

Tokens no enumerables

Historial inmutable

Operaciones críticas dentro de transacciones

🚀 Fase 2 (Planeado)

📄 Generación automática de PDF de asignación

🖊 Documento imprimible para firma física

🖥 Sección "Mis Equipos" en dashboard usuario

🔗 Botón "Reportar falla" vinculado a Tickets

📌 Principios del Módulo

Simplicidad estructural

Seguridad primero

Escalabilidad futura

Trazabilidad completa

Integración total con sistema actual

Cero dependencia de Excel

🏁 Resultado Esperado

Un sistema de control de activos:

Profesional

Seguro

Escalable

Operativo en campo (QR)

Integrado con soporte TI