# Diagrama de Estados del Ticket

Este documento define los estados posibles de un ticket y sus transiciones permitidas.

---

## 🔄 Estados del Ticket

```mermaid
stateDiagram-v2

[*] --> Abierto

Abierto --> En_Proceso : Asignar ticket
En_Proceso --> En_Proceso : Agregar comentario

En_Proceso --> Resuelto : Resolver ticket
Resuelto --> Cerrado : Confirmar cierre

Cerrado --> [*]
