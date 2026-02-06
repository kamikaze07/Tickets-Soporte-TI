<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../config/database.php';

// 🔒 Validar sesión
if (!isset($_SESSION['num_emp'])) {
    http_response_code(401);
    echo json_encode([]);
    exit;
}

$num_emp = $_SESSION['num_emp'];

try {
    $sql = "
        SELECT
            id,
            titulo,
            descripcion,
            prioridad,
            categoria,
            status,
            created_at
        FROM tickets
        WHERE usuario_num_emp = :num_emp
        ORDER BY created_at DESC
    ";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':num_emp' => $num_emp
    ]);

    $tickets = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // ✅ SIEMPRE ARRAY
    echo json_encode($tickets);
    exit;

} catch (Throwable $e) {
    // 🔥 AQUÍ VERÁS EL ERROR REAL SI EXISTE
    http_response_code(500);
    echo json_encode([
        'sql_error' => $e->getMessage()
    ]);
    exit;
}
