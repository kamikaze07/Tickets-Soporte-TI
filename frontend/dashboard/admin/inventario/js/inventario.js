let equipoAsignarId = null;


document.addEventListener("DOMContentLoaded", () => {

    cargarEquipos();
    document.getElementById("btnAgregar").addEventListener("click", () => {
    document.getElementById("modalEquipo").style.display = "flex";
    });

    document.getElementById("btnCerrarModal").addEventListener("click", cerrarModal);

    document.getElementById("btnGuardarEquipo").addEventListener("click", crearEquipo);

    document.getElementById("btnCerrarAsignar")
    .addEventListener("click", () => {
        document.getElementById("modalAsignar").style.display = "none";
    });

    document.getElementById("btnConfirmarAsignacion")
        .addEventListener("click", confirmarAsignacion);

    document.getElementById("tipo").addEventListener("change", renderSpecs);
    renderSpecs();

    document.getElementById("filtroTipo")
    .addEventListener("change", () => cargarEquipos());

    document.getElementById("filtroEstado")
        .addEventListener("change", () => cargarEquipos());

});

function cargarEquipos() {

    fetch('/ticketssoporteti/backend/inventario/equipos/list.php')
        .then(res => res.json())
        .then(data => {

            if (data.error) {
                console.error(data.error);
                return;
            }

            renderTabla(data);

        })
        .catch(err => {
            console.error("Error al cargar equipos:", err);
        });
}

function renderTabla(equipos) {

    const filtroTipo = document.getElementById("filtroTipo").value;
    const filtroEstado = document.getElementById("filtroEstado").value;

    const equiposFiltrados = equipos.filter(eq => {

        const coincideTipo = filtroTipo ? eq.tipo === filtroTipo : true;
        const coincideEstado = filtroEstado ? eq.estado === filtroEstado : true;

        return coincideTipo && coincideEstado;
    });

    const tbody = document.getElementById("tablaEquipos");
    tbody.innerHTML = "";

    if (equiposFiltrados.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">Sin resultados</td>
            </tr>
        `;
        return;
    }

    equiposFiltrados.forEach(eq => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${eq.identificador}</td>
            <td>${eq.tipo}</td>
            <td>${eq.marca || "-"}</td>
            <td>${eq.modelo || "-"}</td>
            <td>${renderEstado(eq.estado)}</td>
            <td>${eq.empleado_nombre || "-"}</td>
            <td class="acciones">
                <button onclick="verDetalle(${eq.id})" class="btn-icon">👁</button>
                <button onclick="asignarEquipo(${eq.id})" class="btn-icon">👤</button>
                <button onclick="reimprimirEtiqueta('${eq.identificador}', '${eq.token_publico}')" class="btn-icon">🏷</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}



function reimprimirEtiqueta(identificador, token) {

    const posicion = prompt(
`¿En qué posición desea imprimir la etiqueta?

1  |  2
3  |  4
5  |  6

Escriba un número del 1 al 6:`);

    if (!posicion || posicion < 1 || posicion > 6) {
        alert("Posición inválida");
        return;
    }

    abrirEtiqueta(identificador, token, parseInt(posicion));
}


function renderEstado(estado) {

    let clase = "";

    switch (estado) {
        case "Disponible":
            clase = "badge-disponible";
            break;
        case "Asignado":
            clase = "badge-asignado";
            break;
        case "En reparación":
            clase = "badge-reparacion";
            break;
        case "Dado de baja":
            clase = "badge-baja";
            break;
    }

    return `<span class="badge ${clase}">${estado}</span>`;
}

function verDetalle(id) {
    location.href = `inventario/equipo.html?id=${id}`;
}

function asignarEquipo(id) {
    alert("Asignar equipo ID: " + id);
}

function cerrarModal() {
    document.getElementById("modalEquipo").style.display = "none";
}

function crearEquipo() {

    const tipo = document.getElementById("tipo").value;
    const marca = document.getElementById("marca").value.trim();
    const modelo = document.getElementById("modelo").value.trim();
    const numero_serie = document.getElementById("numero_serie").value.trim();

    const especificaciones = {};

    if (tipo === "Computadora") {

        const categoria = document.getElementById("categoria").value;
        const procesador = document.getElementById("procesador").value.trim();
        const ram = document.getElementById("ram").value.trim();

        if (!procesador || !ram) {
            alert("Procesador y RAM son obligatorios");
            return;
        }

        especificaciones.categoria = categoria;
        especificaciones.sistema_operativo = document.getElementById("so").value.trim();
        especificaciones.procesador = procesador;
        especificaciones.ram = ram;
        especificaciones.disco = document.getElementById("disco").value.trim();
    }

    if (tipo === "Monitor") {

        const tamano = document.getElementById("tamano").value.trim();

        if (!tamano) {
            alert("El tamaño es obligatorio");
            return;
        }

        especificaciones.tamano = tamano;
        especificaciones.resolucion = document.getElementById("resolucion").value.trim();
        especificaciones.tipo_panel = document.getElementById("panel").value.trim();
    }

    if (tipo === "Impresora") {

        const tecnologia = document.getElementById("tecnologia").value;

        especificaciones.tecnologia = tecnologia;
        especificaciones.monocromatica = document.getElementById("mono").value;
        especificaciones.modelo_cartucho = document.getElementById("cartucho").value.trim();
    }

    fetch('/ticketssoporteti/backend/inventario/equipos/create.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            tipo,
            marca,
            modelo,
            numero_serie,
            especificaciones
        })
    })
    .then(res => res.json())
    .then(data => {

        if (data.error) {
            alert(data.error);
            return;
        }

        if (confirm("Equipo creado correctamente. ¿Desea imprimir etiqueta?")) {
            window.open(`inventario/print_label.php?id=${data.id}`)
        }

        cerrarModal();
        limpiarFormulario();
        cargarEquipos();
    })
    .catch(err => {
        console.error("Error:", err);
    });
}


function limpiarFormulario() {
    document.getElementById("marca").value = "";
    document.getElementById("modelo").value = "";
    document.getElementById("numero_serie").value = "";
}

function asignarEquipo(id) {

    equipoAsignarId = id;

    fetch('/ticketssoporteti/backend/inventario/asignaciones/usuarios.php')
        .then(res => res.json())
        .then(data => {

            const select = document.getElementById("usuarioSelect");
            select.innerHTML = "";

            data.forEach(u => {
                select.innerHTML += `
                    <option value="${u.num_emp}">
                        ${u.nombre_usu}
                    </option>
                `;
            });

            document.getElementById("modalAsignar").style.display = "flex";
        });
}

function confirmarAsignacion() {

    const num_emp = document.getElementById("usuarioSelect").value;

    fetch('/ticketssoporteti/backend/inventario/asignaciones/asignar.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            equipo_id: equipoAsignarId,
            num_emp: num_emp
        })
    })
    .then(res => res.json())
    .then(data => {

        if (data.error) {
            alert(data.error);
            return;
        }

        document.getElementById("modalAsignar").style.display = "none";
        cargarEquipos();
    });
}

function renderSpecs() {

    const tipo = document.getElementById("tipo").value;
    const icono = document.getElementById("tipoIcono");
    const container = document.getElementById("specsContainer");

    // 🔹 Cambiar icono
    if (tipo === "Computadora") {
        icono.innerHTML = `<span class="material-icons">computer</span>`;
    }

    if (tipo === "Monitor") {
        icono.innerHTML = `<span class="material-icons">desktop_windows</span>`;
    }

    if (tipo === "Impresora") {
        icono.innerHTML = `<span class="material-icons">print</span>`;
    }

    // 🔹 Animación salida
    container.classList.add("specs-hidden");

    setTimeout(() => {

        let nuevoContenido = "";

        if (tipo === "Computadora") {
            nuevoContenido = `
                <div class="form-group">
                    <label>Categoría</label>
                    <select id="categoria">
                        <option value="Escritorio">Escritorio</option>
                        <option value="Laptop">Laptop</option>
                        <option value="Servidor">Servidor</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Sistema Operativo</label>
                    <input type="text" id="so">
                </div>

                <div class="form-group">
                    <label>Procesador *</label>
                    <input type="text" id="procesador">
                </div>

                <div class="form-group">
                    <label>RAM *</label>
                    <input type="text" id="ram">
                </div>

                <div class="form-group">
                    <label>Disco</label>
                    <input type="text" id="disco">
                </div>
            `;
        }

        if (tipo === "Monitor") {
            nuevoContenido = `
                <div class="form-group">
                    <label>Tamaño *</label>
                    <input type="text" id="tamano">
                </div>

                <div class="form-group">
                    <label>Resolución</label>
                    <input type="text" id="resolucion">
                </div>

                <div class="form-group">
                    <label>Tipo de panel</label>
                    <input type="text" id="panel">
                </div>
            `;
        }

        if (tipo === "Impresora") {
            nuevoContenido = `
                <div class="form-group">
                    <label>Tecnología *</label>
                    <select id="tecnologia">
                        <option value="Laser">Laser</option>
                        <option value="Inyección">Inyección</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Monocromática</label>
                    <select id="mono">
                        <option value="Sí">Sí</option>
                        <option value="No">No</option>
                    </select>
                </div>

                <div class="form-group">
                    <label>Modelo de cartucho</label>
                    <input type="text" id="cartucho">
                </div>
            `;
        }

        // 🔹 Cambiar contenido
        container.innerHTML = nuevoContenido;

        // 🔹 Animación entrada
        container.classList.remove("specs-hidden");

    }, 150);
}


function abrirEtiqueta(identificador, token, posicion = 1) {

    const ventana = window.open("", "_blank");

    const urlPublica = `http://${window.location.hostname}/ticketssoporteti/backend/public/equipo.php?token=${token}`;
    const logoPath = `/ticketssoporteti/frontend/login/assets/logo-forsis.png`;

    const posiciones = {
        1: { top: "1cm", left: "1cm" },
        2: { top: "1cm", left: "11cm" },
        3: { top: "10cm", left: "1cm" },
        4: { top: "10cm", left: "11cm" },
        5: { top: "19cm", left: "1cm" },
        6: { top: "19cm", left: "11cm" }
    };

    const coords = posiciones[posicion];

    ventana.document.write(`
        <html>
        <head>
            <title>Etiqueta ${identificador}</title>
            <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"><\/script>

            <style>
                @page {
                    size: Letter;
                    margin: 0;
                }

                body {
                    margin: 0;
                    position: relative;
                    width: 21.6cm;
                    height: 27.9cm;
                    font-family: Arial, sans-serif;
                }

                .etiqueta {
                    position: absolute;
                    top: ${coords.top};
                    left: ${coords.left};
                    width: 9cm;
                    height: 6cm;
                    border: 2px solid #000;
                    padding: 10px;
                    box-sizing: border-box;
                    text-align: center;
                }

                .logo {
                    height: 40px;
                    margin-bottom: 5px;
                }

                .id {
                    font-weight: bold;
                    font-size: 14px;
                    margin-bottom: 5px;
                }

                .footer {
                    font-size: 10px;
                    margin-top: 5px;
                }

            </style>
        </head>

        <body>

            <div class="etiqueta">
                <img src="${logoPath}" class="logo">
                <div class="id">${identificador}</div>
                <canvas id="qrCanvas"></canvas>
                <div class="footer">Inventario TI</div>
            </div>

            <script>
                QRCode.toCanvas(
                    document.getElementById("qrCanvas"),
                    "${urlPublica}",
                    { width: 110 }
                );

                setTimeout(() => window.print(), 500);
            <\/script>

        </body>
        </html>
    `);
}

function exportarExcel() {

    const table = document.querySelector("table").cloneNode(true);

    // Eliminar columna Acciones
    table.querySelectorAll("tr").forEach(row => {
        row.deleteCell(-1);
    });

    const wb = XLSX.utils.table_to_book(table, { sheet: "Inventario TI" });

    XLSX.writeFile(wb, "Inventario_TI.xlsx");
}


function exportarPDF() {

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const table = document.querySelector("table").cloneNode(true);

    table.querySelectorAll("tr").forEach(row => {
        row.deleteCell(-1);
    });

    doc.autoTable({
        html: table,
        styles: { fontSize: 8 }
    });

    doc.save("Inventario_TI.pdf");
}


