# Decisiones Tecnicas
Tickets de Soporte TI

Este documento registra las decisiones tecnicas del proyecto y su justificacion.
Su objetivo es servir como referencia unica para el desarrollo y mantenimiento del sistema.

---

## 1. Enfoque General

El sistema se disena como una aplicacion web interna, simple, mantenible y alineada con la infraestructura existente.

Principios base:
- Simplicidad sobre complejidad
- Menor cantidad de dependencias
- Facilidad de mantenimiento
- Integracion con sistemas existentes
- Control total del lado del servidor


### 1.1 Tecnologia Web

El sistema se desarrolla como una aplicacion web.

Justificacion:
- Permite el uso desde dispositivos moviles y equipos de escritorio
- No requiere instalacion en los equipos del usuario
- Facilita el despliegue centralizado
- Permite actualizaciones inmediatas sin intervencion del usuario
- Compatible con multiples sistemas operativos
- Reduce costos de mantenimiento y soporte

La aplicacion se accede unicamente mediante navegador web.


---

## 2. Backend

### 2.1 Lenguaje
- PHP

Justificacion:
- Lenguaje ya utilizado en la organizacion
- Amplia compatibilidad con servidores existentes
- Bajo consumo de recursos
- Curva de aprendizaje conocida

---

### 2.2 Frameworks
- No se utiliza framework PHP

Justificacion:
- El proyecto no requiere complejidad adicional
- Se busca control total del flujo
- Menor sobrecarga y dependencias
- Facilita depuracion y mantenimiento

---

### 2.3 Arquitectura
- Arquitectura de capas
- Backend centralizado
- Separacion clara entre frontend y backend

El backend es el unico punto de acceso a la logica del sistema y a la base de datos.

---

## 3. Frontend

### 3.1 Tecnologias
- HTML
- CSS
- JavaScript Vanilla

Justificacion:
- Interfaz sencilla
- Sin necesidad de frameworks modernos
- Mayor compatibilidad entre navegadores
- Menor deuda tecnica

---

### 3.2 Comunicacion
- Comunicacion mediante HTTP
- Backend expone endpoints internos
- No hay acceso directo a base de datos

---

## 4. Base de Datos

### 4.1 Motor
- MariaDB

Justificacion:
- Motor ya existente
- Estable y confiable
- Compatible con PHP

---

### 4.2 Usuarios
- Los usuarios se obtienen de la base de datos SicrePR
- No se permite registro de usuarios
- Solo lectura sobre la tabla de usuarios

---

### 4.3 Tickets
- Base de datos propia del proyecto
- Tablas separadas para:
  - Tickets
  - Estados
  - Historial de cambios

---

## 5. Autenticacion y Sesiones

### 5.1 Autenticacion
- Validacion directa contra SicrePR
- Uso de usuario y contrasena existentes

---

### 5.2 Sesiones
- PHP Sessions
- Sesiones controladas del lado del servidor
- Validacion de sesion en cada accion sensible

---

## 6. Roles y Permisos

### Roles definidos:
- Usuario
- Super Usuario

Permisos:
- Usuario:
  - Crear tickets
  - Consultar estado e historial

- Super Usuario:
  - Ver todos los tickets
  - Atender tickets
  - Cambiar estados
  - Resolver tickets

---

## 7. Seguridad

Decisiones clave:
- Toda validacion se realiza en el backend
- Control de acceso por rol
- Proteccion de endpoints
- La base SicrePR nunca se modifica

---

## 8. Infraestructura

### 8.1 Servidor Web
- Apache o Nginx

La decision final se tomara segun el entorno de despliegue.

---

### 8.2 Node.js
- No se utiliza Node.js

Justificacion:
- No aporta valor al proyecto
- Aumenta complejidad innecesaria
- PHP cubre completamente las necesidades

---

## 9. Control de Versiones

- Git como sistema de control de versiones
- Repositorio inicializado desde la fase de infraestructura
- Commits claros y descriptivos

---

## 10. Documentacion

- Toda decision relevante debe documentarse en este archivo
- Diagramas en formato Markdown + Mermaid
- La documentacion es parte del proyecto, no un extra

---

## 11. Estado del Documento

Documento activo  
Debe actualizarse conforme el proyecto evolucione
