# 🖥 Sistema Integral de Gestión TI

### Plataforma Modular de Operación Tecnológica Interna

![PHP](https://img.shields.io/badge/PHP-8%2B-777BB4?logo=php&logoColor=white)
![MariaDB](https://img.shields.io/badge/MariaDB-10%2B-003545?logo=mariadb&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-RealTime-010101?logo=socketdotio&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?logo=javascript&logoColor=black)
![Apache](https://img.shields.io/badge/Apache-Compatible-D22128?logo=apache&logoColor=white)

------------------------------------------------------------------------

# 🎯 Visión del Proyecto

El sistema evolucionó desde un gestor de tickets tradicional hacia una
plataforma integral de gestión TI.

------------------------------------------------------------------------

# 🏗 Arquitectura de Infraestructura

``` mermaid
flowchart LR
    User[Usuario / Soporte] --> Browser[Navegador]
    Browser -->|HTTP| WebServer[Apache / Nginx]
    WebServer -->|PHP| Backend[API PHP]
    Backend --> DB[(MariaDB)]
    Backend --> WS[Servidor WebSocket :8080]
    WS --> Browser
```

------------------------------------------------------------------------

# 🧠 Arquitectura de Base de Datos (ERD)

``` mermaid
erDiagram

    USUARIOS {
        int id
        string num_emp
        string nombre
        string rol
    }

    TICKETS {
        int id
        int usuario_id
        string estado
        datetime fecha_creacion
    }

    MENSAJES {
        int id
        int ticket_id
        int usuario_id
        text mensaje
        datetime fecha
    }

    EQUIPOS {
        int id
        string codigo_interno
        string estado
        string tipo
    }

    RESPONSIVAS {
        int id
        int equipo_id
        int usuario_id
        string estado
        datetime fecha_generacion
    }

    MANTENIMIENTOS {
        int id
        int equipo_id
        string tipo
        text observaciones
        datetime fecha
    }

    USUARIOS ||--o{ TICKETS : crea
    TICKETS ||--o{ MENSAJES : contiene
    USUARIOS ||--o{ MENSAJES : escribe
    USUARIOS ||--o{ RESPONSIVAS : firma
    EQUIPOS ||--o{ RESPONSIVAS : genera
    EQUIPOS ||--o{ MANTENIMIENTOS : recibe
```

------------------------------------------------------------------------

# 📈 Flujo Completo del Sistema

``` mermaid
flowchart TD

    A[Usuario crea Ticket] --> B[Validación Backend]
    B --> C[Guardar en BD]
    C --> D[Notificar vía WebSocket]
    D --> E[Soporte atiende]
    E --> F[Cambio de Estado]
    F --> G[Cerrar Ticket]

    H[Registrar Equipo] --> I[Asignar a Usuario]
    I --> J[Capturar Firma]
    J --> K[Generar PDF]
    K --> L[Responsiva Activa]

    L --> M[Registrar mantenimiento]
    M --> N[Equipo Disponible]
```

------------------------------------------------------------------------

📅 Última actualización: 2026-02-27

👨‍💻 Proyecto desarrollado por César Soto
