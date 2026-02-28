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

$data = json_decode(file_get_contents("php://input"), true);

$equipo_id = $data['equipo_id'] ?? null;
$num_emp = $data['num_emp'] ?? null;

if (!$equipo_id || !$num_emp) {
    http_response_code(400);
    echo json_encode(['error' => 'Datos incompletos']);
    exit;
}

try {

    $pdo->beginTransaction();

    // 🔎 Obtener tipo del equipo
    $stmtTipo = $pdo->prepare("
        SELECT tipo 
        FROM inventario_equipos 
        WHERE id = :id
    ");
    $stmtTipo->execute([':id' => $equipo_id]);
    $equipo = $stmtTipo->fetch(PDO::FETCH_ASSOC);

    if (!$equipo) {
        throw new Exception("Equipo no encontrado");
    }

    $tipo_equipo = $equipo['tipo'];

    // 🔎 Verificar si ya está asignado
    $stmtCheck = $pdo->prepare("
        SELECT id 
        FROM inventario_asignaciones
        WHERE equipo_id = :equipo_id
        AND estado = 'activo'
    ");
    $stmtCheck->execute([':equipo_id' => $equipo_id]);

    if ($stmtCheck->fetch()) {
        throw new Exception("El equipo ya está asignado");
    }

    // 📌 Crear asignación
    $stmtInsert = $pdo->prepare("
        INSERT INTO inventario_asignaciones
        (equipo_id, num_emp, asignado_por)
        VALUES
        (:equipo_id, :num_emp, :asignado_por)
    ");

    $stmtInsert->execute([
        ':equipo_id' => $equipo_id,
        ':num_emp' => $num_emp,
        ':asignado_por' => $_SESSION['num_emp']
    ]);

    // 🔄 Cambiar estado equipo
    $stmtUpdate = $pdo->prepare("
        UPDATE inventario_equipos
        SET estado = 'Asignado'
        WHERE id = :equipo_id
    ");

    $stmtUpdate->execute([':equipo_id' => $equipo_id]);

    // 📝 Movimiento
    $stmtMov = $pdo->prepare("
        INSERT INTO inventario_movimientos
        (equipo_id, tipo_movimiento, descripcion, realizado_por)
        VALUES
        (:equipo_id, 'asignacion', 'Equipo asignado', :usuario)
    ");

    $stmtMov->execute([
        ':equipo_id' => $equipo_id,
        ':usuario' => $_SESSION['num_emp']
    ]);

    $pdo->commit();

    echo json_encode([
        "ok" => true,
        "tipo" => $tipo_equipo
    ]);

} catch (Exception $e) {

    $pdo->rollBack();

    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}