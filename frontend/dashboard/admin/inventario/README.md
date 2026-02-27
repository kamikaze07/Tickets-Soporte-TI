# 💻 Módulo de Inventario

Gestión completa de activos tecnológicos.

## 🚀 Funcionalidades

-   Registro de equipos
-   Edición de información técnica
-   Asignación a usuarios
-   Generación de código QR
-   Impresión masiva de etiquetas
-   Control de estados operativos

## 🔄 Estados del Equipo

``` mermaid
stateDiagram-v2
    [*] --> Disponible
    Disponible --> Asignado
    Asignado --> Mantenimiento
    Mantenimiento --> Disponible
    Asignado --> Baja
```

## 📊 Relación con Otros Módulos

``` mermaid
flowchart TD
    Inventario --> Responsivas
    Inventario --> Mantenimientos
```

📅 Última actualización: 2026-02-27
