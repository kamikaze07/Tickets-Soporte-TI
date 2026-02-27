<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode([
        "ok" => false,
        "msg" => "No autorizado"
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$mantenimiento_id = $data['mantenimiento_id'] ?? null;
$firmaBase64 = $data['firma'] ?? null;
$fotos = $data['fotos'] ?? [];
$token = $data['token'] ?? null;

if (!$mantenimiento_id || !$firmaBase64 || !$token) {
    echo json_encode([
        "ok" => false,
        "msg" => "Datos incompletos"
    ]);
    exit;
}

try {

    $pdo->beginTransaction();

    /* =========================================
       1️⃣ Crear carpeta de mantenimiento
    ========================================== */

    $uploadDir = __DIR__ . "/../../uploads/mantenimientos/" . $mantenimiento_id;

    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    /* =========================================
       2️⃣ Guardar firma
    ========================================== */

    $firmaNombre = "firma.png";
    $firmaPath = $uploadDir . "/" . $firmaNombre;

    $firmaData = explode(',', $firmaBase64)[1];
    file_put_contents($firmaPath, base64_decode($firmaData));

    /* =========================================
       3️⃣ Guardar fotos
    ========================================== */

    $fotosGuardadas = [];

    foreach ($fotos as $index => $fotoBase64) {

        $nombreFoto = "foto_" . ($index + 1) . ".jpg";
        $rutaFoto = $uploadDir . "/" . $nombreFoto;

        $fotoData = explode(',', $fotoBase64)[1];
        file_put_contents($rutaFoto, base64_decode($fotoData));

        $fotosGuardadas[] = $nombreFoto;
    }

    $fotosJSON = json_encode($fotosGuardadas);


    $stmtEquipo = $pdo->prepare("SELECT equipo_id FROM mantenimientos WHERE id = ?");
    $stmtEquipo->execute([$mantenimiento_id]);
    $equipo_id = $stmtEquipo->fetchColumn();

    /* =========================================
       4️⃣ Actualizar mantenimiento
    ========================================== */

    $stmt = $pdo->prepare("
        UPDATE mantenimientos
        SET
            estado = 'Realizado',
            fecha_realizada = NOW(),
            realizado_por = ?,
            firma_path = ?,
            token_validacion = ?,
            fotos_evidencia = ?
        WHERE id = ?
    ");

    $stmt->execute([
        $_SESSION['num_emp'],
        $firmaNombre,
        $token,
        $fotosJSON,
        $mantenimiento_id
    ]);

    /* =========================================
    Insertar movimiento en historial equipo
    ========================================= */

    $stmtHist = $pdo->prepare("
        INSERT INTO inventario_movimientos 
        (equipo_id, tipo_movimiento, descripcion, realizado_por, fecha)
        VALUES (?, 'mantenimiento_preventivo', ?, ?, NOW())
    ");

    $stmtHist->execute([
        $equipo_id,
        "Mantenimiento preventivo realizado",
        $_SESSION['num_emp']
    ]);

    $pdo->commit();

    echo json_encode([
        "ok" => true
    ]);

} catch (Exception $e) {

    $pdo->rollBack();

    echo json_encode([
        "ok" => false,
        "msg" => $e->getMessage()
    ]);
}
