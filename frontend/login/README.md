🔐 Login – Tickets de Soporte TI

Módulo de autenticación del sistema Tickets de Soporte TI, encargado de validar usuarios contra la base de datos SicrePR, iniciar sesión y redirigir al dashboard correspondiente según el rol.

🎯 Objetivo

Autenticar usuarios existentes en SicrePR

Iniciar sesión mediante PHP ($_SESSION)

Redirigir según rol:

SUPER USUARIO → Panel de atención de tickets

Cualquier otro usuario → Panel de creación/consulta de tickets

Proteger rutas privadas del sistema

🧠 Modelo de roles

El sistema solo maneja dos casos lógicos:

Rol en BD (priv)	Comportamiento
SUPER USUARIO	Atiende tickets
Cualquier otro valor	Usuario creador de tickets

No se hace distinción adicional por puesto, área o privilegio.

🌐 URL de acceso
/ticketssoporteti/login


La URL es limpia gracias a reglas de mod_rewrite en .htaccess.

📁 Estructura del módulo
frontend/
└── login/
    ├── index.html        # Vista del login
    ├── css/
    │   └── styles.css    # Estilos (glassmorphism + responsive)
    ├── js/
    │   └── login.js      # Validación y comunicación con backend
    ├── assets/
    │   └── logo-forsis.png
    └── README.md

🔁 Flujo de autenticación

Usuario accede a /login

Ingresa usuario y contraseña

login.js valida campos (frontend)

Se envía petición POST vía fetch a:

/ticketssoporteti/backend/auth/login.php


Backend:

Valida credenciales contra la tabla usuarios

Verifica contraseña (MD5, legado SicrePR)

Inicia sesión PHP

Devuelve JSON con success y rol

Frontend redirige:

SUPER USUARIO → /dashboard/admin

Otros → /dashboard/usuario

🔐 Backend involucrado
backend/
└── auth/
    ├── login.php     # Autenticación
    ├── logout.php    # Cierre de sesión
    └── check-auth.php# Middleware de protección

Respuesta esperada del backend
{
  "success": true,
  "rol": "SUPER USUARIO"
}


o

{
  "success": false,
  "message": "Credenciales inválidas"
}

🛡️ Seguridad

Uso de prepared statements

Contraseñas validadas con MD5 (legado SicrePR)

Sesión PHP ($_SESSION)

Protección de rutas sensibles

El frontend no decide seguridad, solo redirige

📱 Responsive

El login está diseñado mobile-first, ya que la mayoría de los usuarios accederán desde celular.

Características:

Inputs grandes

Botón full-width

Diseño tipo glassmorphism

Compatible con iOS / Android / Desktop

🚪 Logout

El cierre de sesión se realiza en:

/ticketssoporteti/logout


Esto destruye la sesión y redirige automáticamente al login.

📌 Dependencias

Apache 2.4+

PHP 8+

MariaDB / MySQL

mod_rewrite habilitado

Base de datos sicrePR

🧭 Estado del módulo

✔️ Diseño finalizado
✔️ Login funcional
✔️ Sesión activa
✔️ Redirección por rol
✔️ Rutas protegidas
✔️ Listo para producción interna