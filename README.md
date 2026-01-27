# Tickets de Soporte TI

Sistema web interno para la creación, gestión y resolución de tickets de soporte de TI.

Este proyecto está diseñado para integrarse con infraestructura existente, priorizando simplicidad, mantenibilidad y bajo consumo de recursos.

---

## 🎯 Objetivo

Centralizar las solicitudes de soporte técnico de la organización mediante un sistema web que permita:

- Crear tickets de soporte de TI
- Dar seguimiento a su estado
- Asignar y resolver tickets por personal autorizado
- Mantener un historial completo de solicitudes

---

## 🧩 Alcance del Proyecto

### Incluye
- Autenticación contra base de datos existente **SicrePR**
- Portal de usuarios para creación y seguimiento de tickets
- Portal de soporte para atención y resolución
- Control de roles por nivel de usuario
- Historial y estados de tickets

### No incluye
- Registro de usuarios (solo lectura desde SicrePR)
- Dependencias innecesarias o frameworks pesados
- Node.js o servicios externos

---

## 🏗️ Stack Tecnológico

### Backend
- **Lenguaje:** PHP
- **Arquitectura:** API interna (PHP estructurado)
- **Servidor Web:** Apache o Nginx
- **Sesiones:** PHP Sessions
- **Autenticación:** Validación directa contra tabla de usuarios de SicrePR
- **Roles:**
  - Usuario
  - Super Usuario (personal de soporte)

> ❌ No se utiliza Node.js  
> ❌ No se utilizan frameworks JavaScript del lado del servidor  

---

### Frontend
- HTML
- CSS
- JavaScript (Vanilla)

Sin frameworks JS.  
La prioridad es compatibilidad, simplicidad y fácil mantenimiento.

---

### Base de Datos
- **Motor:** MariaDB
- **Usuarios:** Consumidos desde base de datos existente **SicrePR**
- **Tickets:** Tablas propias del proyecto
- **Relación:** Usuarios ↔ Tickets por identificador interno

---

## 🔐 Seguridad

- Autenticación mediante credenciales existentes
- Manejo de sesiones del lado del servidor
- Control de acceso por nivel de usuario
- Validación de permisos en cada acción sensible

---

## 📁 Estructura del Proyecto

```text
tickets-soporte-ti/
├── docs/                 # Documentación técnica
│   ├── arquitectura/
│   ├── diagramas/
│   └── decisiones-tecnicas.md
│
├── infra/                # Infraestructura y configuración
│   ├── apache/
│   ├── nginx/
│   ├── php/
│   └── env/
│
├── backend/              # Lógica del sistema (PHP)
│   ├── README.md
│   └── src/
│
├── frontend/             # Interfaz de usuario
│   ├── README.md
│   └── src/
│
├── database/             # Esquemas y notas de BD
│   ├── README.md
│   └── schemas/
│
├── scripts/              # Scripts de mantenimiento
│   └── mantenimiento/
│
├── .gitignore
├── README.md
└── workspace.code-workspace
