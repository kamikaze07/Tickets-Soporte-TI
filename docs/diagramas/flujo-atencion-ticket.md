# Diagrama de Flujo – Atencion de Tickets

Este documento describe el flujo de atencion de un ticket por parte del Super Usuario.

---

## 🔄 Flujo de Atencion de Ticket

```mermaid
flowchart TD

A[Super usuario inicia sesion] --> B{Credenciales validas}

B -- No --> C[Error de autenticacion]
C --> A

B -- Si --> D[Crear sesion PHP]
D --> E[Acceso al portal de soporte]

E --> F[Listado de tickets]
F --> G{Seleccionar ticket}

G -- No --> F
G -- Si --> H[Ver detalle del ticket]

H --> I{Ticket abierto}

I -- No --> J[Ticket solo lectura]
J --> F

I -- Si --> K[Asignar ticket]
K --> L[Cambiar estado a en proceso]

L --> M[Agregar comentario o accion]
M --> N{Resolver ticket}

N -- No --> M

N -- Si --> O[Cambiar estado a resuelto]
O --> P[Registrar fecha y usuario]
P --> Q[Notificar cierre]
Q --> R[Regresar a listado]
