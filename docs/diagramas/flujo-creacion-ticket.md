# Diagrama de Flujo – Creación de Tickets

Este documento describe el flujo completo para la creación de un ticket de soporte TI.

---

## 🔄 Flujo de Creación de Ticket

```mermaid
flowchart TD

A[Usuario inicia sesión] --> B{¿Credenciales válidas?}

B -- No --> C[Mostrar error de autenticación]
C --> A

B -- Sí --> D[Crear sesión PHP]
D --> E[Acceder al portal de tickets]

E --> F[Usuario selecciona "Crear Ticket"]
F --> G[Mostrar formulario de ticket]

G --> H{¿Formulario completo y válido?}

H -- No --> I[Mostrar errores de validación]
I --> G

H -- Sí --> J[Enviar datos al Backend]

J --> K[Backend valida sesión]
K --> L{¿Sesión activa?}

L -- No --> A

L -- Sí --> M[Insertar ticket en BD de Tickets]
M --> N[Asignar estado inicial: Abierto]

N --> O[Registrar fecha y usuario creador]
O --> P[Confirmar creación de ticket]

P --> Q[Mostrar folio / número de ticket]
