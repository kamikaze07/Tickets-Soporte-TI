<?php
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

require_once __DIR__ . '/../auth/authorize.php';
requireRole(['SUPER USUARIO']);

if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode(['error' => 'No autenticado']);
    exit;
}

try {

    /* =========================
       KPIs
    ========================= */

    $statuses = ['Abierto','En Proceso','En Espera','Cerrado'];
    $kpis = [];

    foreach ($statuses as $status) {
        $stmt = $pdo->prepare("
            SELECT COUNT(*) as total
            FROM tickets
            WHERE status = ?
        ");
        $stmt->execute([$status]);
        $kpis[$status] = (int)$stmt->fetch()['total'];
    }

    /* =========================
       Tickets críticos
       (Alta + no cerrados)
    ========================= */

    $stmt = $pdo->query("
        SELECT COUNT(*) as total
        FROM tickets
        WHERE prioridad = 'Alta'
        AND status != 'Cerrado'
    ");

    $criticos = (int)$stmt->fetch()['total'];

    /* =========================
    Mantenimientos hoy
    ========================= */

    $stmt = $pdo->query("
        SELECT COUNT(*) as total
        FROM mantenimientos
        WHERE DATE(fecha_programada) = CURDATE()
        AND estado = 'Pendiente'
    ");

    $mantenimientosHoy = (int)$stmt->fetch()['total'];

    /* =========================
    Equipos con mantenimiento hoy
    ========================= */

    $stmt = $pdo->query("
        SELECT 
            e.identificador,
            e.tipo,
            emp.nombre,
            emp.ap_pat
        FROM mantenimientos m
        JOIN inventario_equipos e 
            ON e.id = m.equipo_id
        LEFT JOIN inventario_asignaciones a
            ON a.equipo_id = e.id
            AND a.estado = 'activo'
        LEFT JOIN empleados emp
            ON emp.clave_emp = a.num_emp
        WHERE DATE(m.fecha_programada) = CURDATE()
        AND m.estado = 'Pendiente'
    ");

    $mantenimientosHoyLista = $stmt->fetchAll(PDO::FETCH_ASSOC);

    /* =========================
    Próximos mantenimientos
    (7 días)
    ========================= */

    $stmt = $pdo->query("
        SELECT COUNT(*) as total
        FROM mantenimientos
        WHERE fecha_programada > CURDATE()
        AND fecha_programada <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        AND estado = 'Pendiente'
    ");

    $mantenimientosProximos = (int)$stmt->fetch()['total'];

    /* =========================
       Últimos 5
    ========================= */

    $stmt = $pdo->query("
        SELECT id, titulo, status, prioridad, created_at
        FROM tickets
        ORDER BY created_at DESC
        LIMIT 5
    ");

    $ultimos = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode([
        'admin_nombre' => $_SESSION['nombre_usu'],
        'kpis' => $kpis,
        'criticos' => $criticos,
        'mantenimientos_hoy' => $mantenimientosHoy,
        'mantenimientos_proximos' => $mantenimientosProximos,
        'mantenimientos_hoy_lista' => $mantenimientosHoyLista,
        'ultimos' => $ultimos
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error servidor']);
}
