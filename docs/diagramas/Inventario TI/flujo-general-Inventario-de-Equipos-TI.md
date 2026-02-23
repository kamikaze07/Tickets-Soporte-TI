flowchart TD

A[Inicio - Admin autenticado] --> B[Accede a Inventario TI]

B --> C[Visualiza tabla de equipos]
C --> D{Acción del usuario}

D -->|Agregar equipo| E[Formulario dinámico por tipo]
E --> F[Validar campos]
F -->|Correcto| G[Guardar en BD]
G --> H[Generar identificador + token]
H --> I[Actualizar tabla]

D -->|Asignar equipo| J[Seleccionar empleado]
J --> K[Guardar asignación en BD]
K --> I

D -->|Imprimir etiquetas| L[Seleccionar equipos]
L --> M{Cantidad <= 8?}
M -->|Sí| N[Generar hoja con QR]
M -->|No| O[Mostrar alerta]
N --> P[Enviar a impresión]

D -->|Exportar Excel| Q[Generar archivo institucional]
Q --> R[Descargar archivo]

D -->|Exportar PDF| S[Generar PDF]
S --> T[Descargar archivo]