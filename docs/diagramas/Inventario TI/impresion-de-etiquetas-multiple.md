```mermaid
flowchart TD

A[Usuario selecciona checkboxes] --> B{¿Seleccionó al menos 1?}

B -->|No| C[Mostrar alerta]
B -->|Sí| D{¿Más de 8?}

D -->|Sí| E[Mostrar alerta: Máx 8]
D -->|No| F[Construir arreglo de equipos]

F --> G[Generar ventana nueva]
G --> H[Insertar estructura HTML]
H --> I[Calcular posiciones 2x4]
I --> J[Generar QR por equipo]
J --> K[window.print()]
```