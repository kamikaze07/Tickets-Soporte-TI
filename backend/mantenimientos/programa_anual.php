<?php
require_once "../config/database.php";
require_once "../auth/authorize.php";

header("Content-Type: application/json; charset=UTF-8");

try {

    if (!isset($_GET['year'])) {
        echo json_encode([]);
        exit;
    }

    $year = (int) $_GET['year'];

    $sql = "
    SELECT 
        m.id,
        e.identificador,
        e.marca,
        e.modelo,
        MONTH(m.fecha_programada) AS mes,
        m.fecha_programada,
        m.estado,

        CONCAT(emp.nombre, ' ', emp.ap_pat, ' ', emp.ap_mat) AS usuario

    FROM mantenimientos m

    INNER JOIN inventario_equipos e 
        ON e.id = m.equipo_id

    LEFT JOIN inventario_asignaciones ia
        ON ia.equipo_id = e.id
        AND ia.estado = 'activo'

    LEFT JOIN empleados emp
        ON emp.clave_emp = ia.num_emp

    WHERE m.tipo = 'Preventivo'
    AND YEAR(m.fecha_programada) = :year

    ORDER BY e.identificador, m.fecha_programada
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':year' => $year
    ]);

    $datos = $stmt->fetchAll();

    echo json_encode($datos);

} catch (PDOException $e) {

    http_response_code(500);
    echo json_encode([
        "error" => $e->getMessage()
    ]);
}