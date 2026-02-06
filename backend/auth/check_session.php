<?php
header('Content-Type: application/json');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode([
        'authenticated' => false
    ]);
    exit;
}

echo json_encode([
    'authenticated' => true,
    'num_emp' => $_SESSION['num_emp'],
    'nombre_usu' => $_SESSION['nombre_usu'],
    'rol' => $_SESSION['rol'] ?? null
]);
exit;
