<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../auth/authorize.php';
requireRole(['SUPER USUARIO']);


if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

try {

    $stmt = $pdo->query("
        SELECT num_emp, nombre_usu
        FROM usuarios
        ORDER BY nombre_usu ASC
    ");

    $usuarios = $stmt->fetchAll();

    echo json_encode($usuarios);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al obtener usuarios']);
}
