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

    const tbody = document.getElementById("tablaEquipos");
    tbody.innerHTML = "";

    if (equipos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center;">No hay equipos registrados</td>
            </tr>
        `;
        return;
    }

    equipos.forEach(eq => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${eq.identificador}</td>
            <td>${eq.tipo}</td>
            <td>${eq.marca}</td>
            <td>${eq.modelo}</td>
            <td>${renderEstado(eq.estado)}</td>
            <td>${eq.usuario_nombre ? eq.usuario_nombre : "-"}</td>
            <td>
                <button onclick="verDetalle(${eq.id})">👁</button>
                <button onclick="editarEquipo(${eq.id})">✏</button>
                <button onclick="asignarEquipo(${eq.id})">👤</button>
                <button onclick="reimprimirEtiqueta('${eq.identificador}', '${eq.token_publico}')">🏷</button>
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
    location.href = `equipo.html?id=${id}`;
}

function editarEquipo(id) {
    alert("Editar equipo ID: " + id);
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
    const container = document.getElementById("specsContainer");
    container.innerHTML = "";

    if (tipo === "Computadora") {
        container.innerHTML = `
            <label>Categoría</label>
            <select id="categoria">
                <option value="Escritorio">Escritorio</option>
                <option value="Laptop">Laptop</option>
                <option value="Servidor">Servidor</option>
            </select>

            <label>Sistema Operativo</label>
            <input type="text" id="so" />

            <label>Procesador *</label>
            <input type="text" id="procesador" />

            <label>RAM *</label>
            <input type="text" id="ram" />

            <label>Disco</label>
            <input type="text" id="disco" />
        `;
    }

    if (tipo === "Monitor") {
        container.innerHTML = `
            <label>Tamaño *</label>
            <input type="text" id="tamano" />

            <label>Resolución</label>
            <input type="text" id="resolucion" />

            <label>Tipo de panel</label>
            <input type="text" id="panel" />
        `;
    }

    if (tipo === "Impresora") {
        container.innerHTML = `
            <label>Tecnología *</label>
            <select id="tecnologia">
                <option value="Laser">Laser</option>
                <option value="Inyección">Inyección</option>
            </select>

            <label>Monocromática</label>
            <select id="mono">
                <option value="Sí">Sí</option>
                <option value="No">No</option>
            </select>

            <label>Modelo de cartucho</label>
            <input type="text" id="cartucho" />
        `;
    }
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


