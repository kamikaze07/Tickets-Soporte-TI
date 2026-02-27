# 🧾 Módulo de Responsivas

Generación automatizada de documentos legales de asignación de equipo.

## 🚀 Funcionalidades

-   Generación automática de PDF
-   Firma digital (Canvas)
-   Código QR del equipo
-   Control de estado (Activa / Revocada)
-   Reimpresión de responsivas

## 🔄 Flujo de Generación

``` mermaid
flowchart TD
    A[Asignar equipo] --> B[Capturar firma]
    B --> C[Generar PDF]
    C --> D[Guardar registro en BD]
    D --> E[Responsiva Activa]
```

📅 Última actualización: 2026-02-27
