<?php
session_start();
if (!isset($_SESSION['num_emp'])) {
    die("No autorizado");
}

$id = $_GET['id'] ?? null;
if (!$id) {
    die("ID requerido");
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Imprimir Etiqueta</title>
<link rel="stylesheet" href="css/print.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
</head>
<body>

<div id="sheet" class="sheet"></div>

<script>
const equipoId = <?php echo (int)$id; ?>;

fetch(`/ticketssoporteti/backend/inventario/equipos/get_by_id.php?id=${equipoId}`)
.then(res => res.json())
.then(data => {

    if (data.error) {
        alert(data.error);
        return;
    }

    const sheet = document.getElementById("sheet");

    const label = document.createElement("div");
    label.className = "label";

    label.innerHTML = `
        <img src="/ticketssoporteti/frontend/login/assets/logo-forsis.png" class="logo">
        <div class="identificador">${data.identificador}</div>
        <div id="qr" class="qr"></div>
        <div class="footer">Inventario TI</div>
    `;

    sheet.appendChild(label);

    new QRCode(document.getElementById("qr"), {
        text: data.token_publico,
        width: 120,
        height: 120
    });

    setTimeout(() => {
        window.print();
    }, 600);

});
</script>


</body>
</html>
