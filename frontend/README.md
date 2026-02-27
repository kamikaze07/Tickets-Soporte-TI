# 🎫 Módulo de Tickets

Sistema de gestión de solicitudes de soporte con comunicación en tiempo
real.

## 🚀 Funcionalidades

-   Creación de tickets
-   Adjuntos
-   Chat en tiempo real (WebSocket)
-   Cambio de estados dinámico
-   Historial completo
-   Notificaciones automáticas

## 🔄 Flujo de Estados

``` mermaid
stateDiagram-v2
    [*] --> Abierto
    Abierto --> En_Proceso
    En_Proceso --> En_Espera
    En_Espera --> En_Proceso
    En_Proceso --> Cerrado
```

## 🧠 Arquitectura del Módulo

``` mermaid
flowchart LR
    Usuario --> Frontend
    Frontend --> API_PHP
    API_PHP --> MariaDB
    API_PHP --> WebSocket
    WebSocket --> Frontend
```

📅 Última actualización: 2026-02-27
