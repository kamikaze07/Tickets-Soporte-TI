```mermaid
flowchart TD

A[Usuario inicia sesion] --> B{Credenciales validas}

B -- No --> C[Error de autenticacion]
C --> A

B -- Si --> D[Crear sesion PHP]
D --> E[Acceso al portal de tickets]

E --> F[Opcion crear ticket]
F --> G[Formulario de ticket]

G --> H{Formulario valido}

H -- No --> I[Mostrar errores de validacion]
I --> G

H -- Si --> J[Enviar datos al backend]

J --> K[Backend valida sesion]
K --> L{Sesion activa}

L -- No --> A

L -- Si --> M[Insertar ticket en BD]
M --> N[Estado inicial Abierto]

N --> O[Registrar fecha y usuario]
O --> P[Confirmar creacion]

P --> Q[Mostrar folio del ticket]
