# 🖥 Sistema Integral de Gestión TI

![PHP](https://img.shields.io/badge/PHP-8%2B-777BB4?logo=php&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-10%2B-003545?logo=mariadb&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-RealTime-010101?logo=socketdotio&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![Apache](https://img.shields.io/badge/Apache-Compatible-D22128?logo=apache&logoColor=white)

Sistema web interno para la gestión integral del área de TI.

Incluye módulos de:

-   🎫 Tickets
-   💻 Inventario
-   🛠 Mantenimientos
-   🧾 Responsivas (PDF + Firma Digital)
-   🏷 Etiquetas con QR
-   🔔 Comunicación en Tiempo Real

------------------------------------------------------------------------

# 🧠 Arquitectura General

``` mermaid
flowchart TD
    A[Frontend HTML CSS JS] --> B[API PHP Backend]
    B --> C[MariaDB]
    B --> D[WebSocket Server]
    D --> A
```

------------------------------------------------------------------------

# 📦 Módulos

-   [🎫 Tickets](./README-TICKETS.md)
-   [💻 Inventario](./README-INVENTARIO.md)
-   [🛠 Mantenimientos](./README-MANTENIMIENTOS.md)
-   [🧾 Responsivas](./README-RESPONSIVAS.md)

------------------------------------------------------------------------

# 🔐 Seguridad

-   Validación de sesión en cada endpoint
-   Control de roles
-   Autenticación contra SicrePR
-   Validación backend obligatoria

------------------------------------------------------------------------

# 🚀 Instalación

1.  Configurar Apache/Nginx
2.  Configurar conexión a base de datos
3.  Ejecutar esquemas SQL
4.  Configurar variables en /infra/env
5.  Iniciar servidor WebSocket

------------------------------------------------------------------------

📅 Última actualización: 2026-02-27
