<?php

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function requireAuth() {

    if (!isset($_SESSION['num_emp'])) {
        http_response_code(401);
        echo json_encode(['error' => 'No autenticado']);
        exit;
    }
}

function requireRole(array $rolesPermitidos) {

    requireAuth();

    if (!isset($_SESSION['rol'])) {
        http_response_code(403);
        echo json_encode(['error' => 'Rol no definido']);
        exit;
    }

    if (!in_array($_SESSION['rol'], $rolesPermitidos, true)) {
        http_response_code(403);
        echo json_encode(['error' => 'Acceso denegado']);
        exit;
    }
}