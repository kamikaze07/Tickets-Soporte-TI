<?php
header('Content-Type: application/json');

require_once __DIR__ . '/../auth/authorize.php';
require_once __DIR__ . '/../config/database.php';

requireAuth();

$num_emp = $_SESSION['num_emp'];

try {

    $sql = "
        SELECT 
            e.id,
            e.identificador,
            e.tipo,
            e.marca,
            e.modelo,
            e.numero_serie,
            e.especificaciones_json
        FROM inventario_asignaciones a
        INNER JOIN inventario_equipos e 
            ON a.equipo_id = e.id
        WHERE a.num_emp = :num_emp
        AND a.estado = 'activo'
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':num_emp' => $num_emp
    ]);

    $equipos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($equipos as &$eq) {

        if ($eq['especificaciones_json']) {
            $eq['especificaciones'] = json_decode($eq['especificaciones_json'], true);
        } else {
            $eq['especificaciones'] = null;
        }

        unset($eq['especificaciones_json']);
    }

    echo json_encode([
        "ok" => true,
        "equipos" => $equipos
    ]);

} catch (Exception $e) {

    http_response_code(500);

    echo json_encode([
        "ok" => false,
        "error" => "Error obteniendo dispositivos"
    ]);
}