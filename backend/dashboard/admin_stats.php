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
        'ultimos' => $ultimos
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error servidor']);
}
