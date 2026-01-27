# Diagrama de Arquitectura General
Tickets de Soporte TI

Este documento describe la arquitectura general del sistema y la interacción entre sus componentes.

---

## 🧱 Arquitectura General

```mermaid
flowchart LR

U[Usuario Final] -->|HTTP| FE[Frontend<br/>HTML + CSS + JS]
SU[Super Usuario] -->|HTTP| FE

FE -->|Requests| BE[Backend PHP]

BE -->|Auth / Read| DB1[(SicrePR<br/>Usuarios)]
BE -->|CRUD| DB2[(BD Tickets)]

BE -->|Session| S[PHP Sessions]
