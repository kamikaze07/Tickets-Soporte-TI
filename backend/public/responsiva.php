<?php
$token = $_GET['token'] ?? '';
?>

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Verificación de Responsiva</title>
<style>
body {
    font-family: Arial;
    text-align: center;
    padding: 40px;
}
.card {
    max-width: 500px;
    margin: auto;
    padding: 30px;
    border-radius: 10px;
    box-shadow: 0 5px 20px rgba(0,0,0,.1);
}
.valida { color: green; }
.revocada { color: red; }
</style>
</head>
<body>

<div class="card">
    <h2>Verificando documento...</h2>
    <div id="resultado"></div>
</div>

<script>
fetch(`../responsivas/validar.php?token=<?=$token?>`)
.then(res => res.json())
.then(data => {

    const cont = document.getElementById("resultado");

    if (!data.ok) {
        cont.innerHTML = "<h1 style='color:red'>DOCUMENTO NO ENCONTRADO</h1>";
        return;
    }

    if (data.estado === "ACTIVA") {
        cont.innerHTML = `
            <h1 class="valida">RESPONSIVA VÁLIDA</h1>
            <p><strong>Folio:</strong> ${data.folio}</p>
            <p><strong>Fecha:</strong> ${data.fecha}</p>
        `;
    } else {
        cont.innerHTML = `
            <h1 class="revocada">RESPONSIVA REVOCADA</h1>
            <p><strong>Folio:</strong> ${data.folio}</p>
        `;
    }
});
</script>

</body>
</html>