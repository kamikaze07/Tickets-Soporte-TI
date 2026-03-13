<?php
require_once __DIR__ . '/../config/database.php';

$token = $_GET['token'] ?? null;

if (!$token) {
    die("Token requerido");
}

$stmt = $pdo->prepare("
    SELECT 
        e.identificador,
        e.tipo,
        e.marca,
        e.modelo,
        e.estado,
        e.especificaciones_json,
        CONCAT(emp.nombre,' ',emp.ap_pat,' ',emp.ap_mat) AS asignado_a
    FROM inventario_equipos e
    LEFT JOIN inventario_asignaciones a
        ON a.equipo_id = e.id
        AND a.estado = 'activo'
    LEFT JOIN empleados emp
        ON emp.clave_emp = a.num_emp
    WHERE e.token_publico = :token
    AND e.activo_publico = 1
    LIMIT 1
");

$stmt->execute([':token' => $token]);
$equipo = $stmt->fetch();

if (!$equipo) {
    die("Equipo no encontrado");
}

$specs = json_decode($equipo['especificaciones_json'], true);
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><?= htmlspecialchars($equipo['identificador']) ?></title>

<style>
body {
    margin: 0;
    font-family: Arial, sans-serif;
    background: #f4f6f9;
}

.container {
    max-width: 600px;
    margin: 30px auto;
    background: white;
    padding: 25px;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
}

.logo {
    text-align: center;
    margin-bottom: 15px;
}

.logo img {
    height: 60px;
}

h1 {
    text-align: center;
    margin-bottom: 20px;
}

.badge {
    display: inline-block;
    padding: 5px 10px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 13px;
}

.disponible { background:#d4edda; color:#155724; }
.asignado { background:#cce5ff; color:#004085; }
.reparacion { background:#fff3cd; color:#856404; }
.baja { background:#f8d7da; color:#721c24; }

.specs {
    margin-top: 20px;
}

.specs h3 {
    margin-bottom: 10px;
}

.spec-item {
    margin-bottom: 6px;
}

.footer {
    text-align: center;
    margin-top: 30px;
    font-size: 12px;
    color: #777;
}

.asignado-box{
    margin-top:15px;
    padding:12px;
    border-radius:8px;
    background:#eef5ff;
    border-left:4px solid #2b6cb0;
}
</style>
</head>
<body>

<div class="container">

    <div class="logo">
        <img src="/ticketssoporteti/frontend/login/assets/logo-forsis.png">
    </div>

    <h1><?= htmlspecialchars($equipo['identificador']) ?></h1>

    <p><strong>Tipo:</strong> <?= htmlspecialchars($equipo['tipo']) ?></p>

    <p>
        <strong>Estado:</strong>
        <span class="badge <?= strtolower(str_replace(' ','',$equipo['estado'])) ?>">
            <?= htmlspecialchars($equipo['estado']) ?>
        </span>
    </p>
    <div class="asignado-box">

    <strong>Usuario asignado</strong><br>

    <?= !empty($equipo['asignado_a']) 
        ? htmlspecialchars($equipo['asignado_a']) 
        : "Equipo disponible" ?>

    </div>

    <?php if ($equipo['marca']): ?>
        <p><strong>Marca:</strong> <?= htmlspecialchars($equipo['marca']) ?></p>
    <?php endif; ?>

    <?php if ($equipo['modelo']): ?>
        <p><strong>Modelo:</strong> <?= htmlspecialchars($equipo['modelo']) ?></p>
    <?php endif; ?>

    <?php if ($specs): ?>
    <div class="specs">
        <h3>Especificaciones</h3>

    <?php foreach ($specs as $key => $value): ?>

        <?php 
            // 🔥 Ocultar número de serie
            if ($key === 'numero_serie') continue; 
        ?>

        <div class="spec-item">
            <strong><?= ucfirst(str_replace('_',' ', $key)) ?>:</strong>
            <?= htmlspecialchars($value) ?>
        </div>

    <?php endforeach; ?>
    </div>
    <?php endif; ?>

    <div class="footer">
        Sistema de Inventario TI
    </div>

</div>

</body>
</html>
