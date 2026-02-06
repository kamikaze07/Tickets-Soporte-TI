<?php
session_start();

// Vaciar variables de sesión
$_SESSION = [];

// Destruir sesión
session_destroy();

// Evitar cache
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Pragma: no-cache");

// Respuesta JSON
header("Content-Type: application/json");
echo json_encode([
  "success" => true
]);
exit;
