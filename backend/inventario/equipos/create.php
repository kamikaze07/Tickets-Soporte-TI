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

$tipo = $data['tipo'] ?? null;
$marca = trim($data['marca'] ?? '');
$modelo = trim($data['modelo'] ?? '');
$numero_serie = trim($data['numero_serie'] ?? '');
$especificaciones = $data['especificaciones'] ?? null;

$marca = $marca !== '' ? $marca : null;
$modelo = $modelo !== '' ? $modelo : null;
$numero_serie = $numero_serie !== '' ? $numero_serie : null;

if (!$tipo) {
    http_response_code(400);
    echo json_encode(['error' => 'Tipo es obligatorio']);
    exit;
}

try {

    $pdo->beginTransaction();

    $anio = date('Y');

    // 🔎 Obtener último consecutivo
    $stmt = $pdo->prepare("
        SELECT identificador 
        FROM inventario_equipos
        WHERE tipo = :tipo
        AND identificador LIKE :pattern
        ORDER BY id DESC
        LIMIT 1
    ");

    $pattern = "TI-$tipo-$anio-%";

    $stmt->execute([
        ':tipo' => $tipo,
        ':pattern' => $pattern
    ]);

    $ultimo = $stmt->fetch();

    if ($ultimo) {
        $partes = explode('-', $ultimo['identificador']);
        $consecutivo = intval(end($partes)) + 1;
    } else {
        $consecutivo = 1;
    }

    $consecutivoFormateado = str_pad($consecutivo, 4, '0', STR_PAD_LEFT);

    $identificador = "TI-$tipo-$anio-$consecutivoFormateado";

    // 🔐 Generar token seguro
    $token = bin2hex(random_bytes(32));

    // 📦 Insertar equipo
    $stmtInsert = $pdo->prepare("
        INSERT INTO inventario_equipos
        (
            identificador,
            tipo,
            marca,
            modelo,
            numero_serie,
            especificaciones_json,
            estado,
            token_publico
        )
        VALUES
        (
            :identificador,
            :tipo,
            :marca,
            :modelo,
            :numero_serie,
            :especificaciones,
            'Disponible',
            :token
        )
    ");

    $stmtInsert->execute([
        ':identificador' => $identificador,
        ':tipo' => $tipo,
        ':marca' => $marca,
        ':modelo' => $modelo,
        ':numero_serie' => $numero_serie,
        ':especificaciones' => $especificaciones ? json_encode($especificaciones) : null,
        ':token' => $token
    ]);

    $equipo_id = $pdo->lastInsertId();

    // 📝 Registrar movimiento
    $stmtMov = $pdo->prepare("
        INSERT INTO inventario_movimientos
        (equipo_id, tipo_movimiento, descripcion, realizado_por)
        VALUES
        (:equipo_id, 'alta', 'Equipo creado en sistema', :usuario)
    ");

    $stmtMov->execute([
        ':equipo_id' => $equipo_id,
        ':usuario' => $_SESSION['num_emp']
    ]);

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'identificador' => $identificador,
        'token' => $token,
        'id' => $equipo_id
    ]);

} catch (Exception $e) {

    $pdo->rollBack();

    http_response_code(500);
    echo json_encode([
        'error' => 'Error al crear equipo',
        'detalle' => $e->getMessage()
    ]);
}
