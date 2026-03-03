<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../auth/authorize.php';
requireRole(['SUPER USUARIO']);

$q = $_GET['q'] ?? '';

if (strlen($q) < 2) {
    echo json_encode([]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT clave_emp, nombre, ap_pat, ap_mat
    FROM empleados
    WHERE actual = 0
    AND (
        clave_emp LIKE :q
        OR nombre LIKE :q
        OR ap_pat LIKE :q
        OR ap_mat LIKE :q
    )
    ORDER BY nombre ASC
    LIMIT 15
");

$stmt->execute([':q' => "%$q%"]);

$empleados = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($empleados);