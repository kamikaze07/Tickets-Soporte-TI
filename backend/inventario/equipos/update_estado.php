<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../../config/database.php';

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autorizado']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$id = $data['id'] ?? null;
$estado = $data['estado'] ?? null;

if (!$id || !$estado) {
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

try {

    $pdo->beginTransaction();

    // 🔹 Actualizar estado del equipo
    $stmt = $pdo->prepare("
        UPDATE inventario_equipos
        SET estado = :estado
        WHERE id = :id
    ");

    $stmt->execute([
        ':estado' => $estado,
        ':id' => $id
    ]);

    // 🔹 Si pasa a Disponible → cerrar asignación activa
    if ($estado === 'Disponible') {

        $stmtCerrar = $pdo->prepare("
            UPDATE inventario_asignaciones
            SET estado = 'cerrado'
            WHERE equipo_id = :id
            AND estado = 'activo'
        ");

        $stmtCerrar->execute([
            ':id' => $id
        ]);

        $stmt = $pdo->prepare("
        UPDATE responsivas
        SET estado = 'REVOCADA'
        WHERE equipo_id = ?
        AND estado = 'ACTIVA'
        ");

        $stmt->execute([$id]);
    }

    $pdo->commit();

    echo json_encode(['success' => true]);

} catch (Exception $e) {

    $pdo->rollBack();
    echo json_encode(['error' => 'Error al actualizar']);
}