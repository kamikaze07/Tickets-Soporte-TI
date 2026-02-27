<?php
require_once __DIR__ . '/../config/database.php';

$token = $_GET['token'] ?? null;

if (!$token) {
    die("Token no válido");
}

$stmt = $pdo->prepare("
    SELECT 
        m.id,
        m.fecha_programada,
        m.fecha_realizada,
        m.firma_path,
        m.fotos_evidencia,
        e.identificador,
        e.marca,
        e.modelo,
        e.numero_serie,
        e.especificaciones_json
    FROM mantenimientos m
    JOIN inventario_equipos e ON e.id = m.equipo_id
    WHERE m.token_validacion = ?
    AND m.estado = 'Realizado'
");

$stmt->execute([$token]);
$data = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$data) {
    die("Mantenimiento no encontrado o no válido");
}

?>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Mantenimiento <?= $data['id'] ?></title>
<style>
body { font-family: Arial; padding: 40px; background: #f5f5f5; }
.card { background: white; padding: 30px; border-radius: 10px; }
h1 { margin-top: 0; }
img { max-width: 200px; margin: 10px; }
.fotos { display: flex; gap: 20px; flex-wrap: wrap; }
</style>
</head>
<body>

<div class="card">

<h1>Mantenimiento Preventivo</h1>

<p><strong>Equipo:</strong> <?= htmlspecialchars($data['identificador']) ?></p>
<p><strong>Marca / Modelo:</strong> <?= htmlspecialchars($data['marca'] . " " . $data['modelo']) ?></p>
<p><strong>Serie:</strong> <?= htmlspecialchars($data['numero_serie']) ?></p>
<p><strong>Fecha Programada:</strong> <?= $data['fecha_programada'] ?></p>
<p><strong>Fecha Realizada:</strong> <?= $data['fecha_realizada'] ?></p>

<h3>Especificaciones</h3>

<?php
if ($data['especificaciones_json']) {
    $specs = json_decode($data['especificaciones_json'], true);
    foreach ($specs as $k => $v) {
        echo "<p><strong>$k:</strong> $v</p>";
    }
}
?>

<h3>Evidencia Fotográfica</h3>

<div class="fotos">
<?php
if ($data['fotos_evidencia']) {
    $fotos = json_decode($data['fotos_evidencia'], true);
    foreach ($fotos as $foto) {
        echo "<img src='/ticketssoporteti/uploads/mantenimientos/{$data['id']}/$foto'>";
    }
}
?>
</div>

<h3>Firma del Técnico</h3>

<?php
if ($data['firma_path']) {
    echo "<img src='/ticketssoporteti/uploads/mantenimientos/{$data['id']}/{$data['firma_path']}'>";
}
?>

</div>

</body>
</html>