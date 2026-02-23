let equipoAsignarId = null;

let currentPage = 1;
let currentSort = "id";
let currentOrder = "DESC";
let limit = 10;
let searchTerm = "";
let searchTimeout = null;

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

    document.getElementById("busquedaGlobal")
        .addEventListener("input", (e) => {

            clearTimeout(searchTimeout);

            searchTimeout = setTimeout(() => {
                searchTerm = e.target.value.trim();
                currentPage = 1;
                cargarEquipos();
            }, 300);

        });

    document.getElementById("selectLimit")
        .addEventListener("change", (e) => {
            limit = parseInt(e.target.value);
            currentPage = 1;
            cargarEquipos();
        });

});

function cargarEquipos() {

    const filtroTipo = document.getElementById("filtroTipo").value;
    const filtroEstado = document.getElementById("filtroEstado").value;

    const params = new URLSearchParams({
        page: currentPage,
        limit: limit,
        sort: currentSort,
        order: currentOrder,
        tipo: filtroTipo,
        estado: filtroEstado,
        search: searchTerm
    });

    mostrarSkeleton();

    fetch(`/ticketssoporteti/backend/inventario/equipos/list.php?${params}`)
        .then(res => res.json())
        .then(response => {

            if (response.error) {
                console.error(response.error);
                return;
            }

            renderTabla(response.data);
            renderPaginacion(response.totalPages, response.total);
            actualizarIndicadoresSort();

        })
        .catch(err => console.error(err));
}

function mostrarSkeleton() {

    const tbody = document.getElementById("tablaEquipos");
    tbody.innerHTML = "";

    for (let i = 0; i < limit; i++) {

        const tr = document.createElement("tr");
        tr.classList.add("skeleton-row");

        tr.innerHTML = `
            <td><div class="skeleton"></div></td>
            <td><div class="skeleton"></div></td>
            <td><div class="skeleton"></div></td>
            <td><div class="skeleton"></div></td>
            <td><div class="skeleton"></div></td>
            <td><div class="skeleton"></div></td>
            <td><div class="skeleton"></div></td>
        `;

        tbody.appendChild(tr);
    }
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
    tbody.classList.add("fade-enter");
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
            <td>
                <input type="checkbox" class="check-etiqueta" 
                    value='${JSON.stringify({
                        identificador: eq.identificador,
                        token: eq.token_publico
                    })}'>
            </td>
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
        setTimeout(() => {
        tbody.classList.add("fade-enter-active");
        }, 10);

        setTimeout(() => {
            tbody.classList.remove("fade-enter", "fade-enter-active");
        }, 300);
}

function imprimirSeleccionadas() {

    const checks = document.querySelectorAll(".check-etiqueta:checked");

    if (checks.length === 0) {
        alert("Seleccione al menos un equipo");
        return;
    }

    if (checks.length > 8) {
        alert("Máximo 8 etiquetas por hoja");
        return;
    }

    const equipos = [];

    checks.forEach(c => {
        equipos.push(JSON.parse(c.value));
    });

    generarHojaEtiquetas(equipos);
}

function ordenar(columna) {

    if (currentSort === columna) {
        currentOrder = currentOrder === "ASC" ? "DESC" : "ASC";
    } else {
        currentSort = columna;
        currentOrder = "ASC";
    }

    currentPage = 1;
    cargarEquipos();
}

function renderPaginacion(totalPages, total) {

    const container = document.getElementById("paginacion");
    container.innerHTML = "";

    if (totalPages <= 1) return;

    // 🔹 Botón Anterior
    const btnPrev = document.createElement("button");
    btnPrev.textContent = "«";
    btnPrev.disabled = currentPage === 1;

    btnPrev.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            cargarEquipos();
        }
    });

    container.appendChild(btnPrev);

    // 🔹 Botones numéricos
    for (let i = 1; i <= totalPages; i++) {

        const btn = document.createElement("button");
        btn.textContent = i;

        if (i === currentPage) {
            btn.classList.add("active");
        }

        btn.addEventListener("click", () => {
            currentPage = i;
            cargarEquipos();
        });

        container.appendChild(btn);
    }

    // 🔹 Botón Siguiente
    const btnNext = document.createElement("button");
    btnNext.textContent = "»";
    btnNext.disabled = currentPage === totalPages;

    btnNext.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            cargarEquipos();
        }
    });

    container.appendChild(btnNext);

    // 🔹 Texto informativo
    const info = document.createElement("div");

    const start = (currentPage - 1) * limit + 1;
    const end = Math.min(currentPage * limit, total);

    info.className = "paginacion-info";
    info.textContent = `Mostrando ${start}–${end} de ${total} resultados`;

    container.appendChild(info);
}

function reimprimirEtiqueta(identificador, token) {

    const posicion = prompt(
`¿En qué posición desea imprimir la etiqueta?

1  |  2
3  |  4
5  |  6
7  |  8

Escriba un número del 1 al 8:`);

    if (!posicion || posicion < 1 || posicion > 8) {
        alert("Posición inválida");
        return;
    }

    abrirEtiqueta(identificador, token, parseInt(posicion));
}

function generarHojaEtiquetas(equipos) {

    const ventana = window.open("", "_blank");
    const logoPath = `/ticketssoporteti/frontend/login/assets/logo-forsis.png`;

    const posiciones = [
        { top: "1cm", left: "1cm" },
        { top: "1cm", left: "11cm" },

        { top: "7.5cm", left: "1cm" },
        { top: "7.5cm", left: "11cm" },

        { top: "14cm", left: "1cm" },
        { top: "14cm", left: "11cm" },

        { top: "20.5cm", left: "1cm" },
        { top: "20.5cm", left: "11cm" }
    ];

    let etiquetasHTML = "";

    equipos.forEach((eq, index) => {

        const coords = posiciones[index];
        const urlPublica = `http://${window.location.hostname}/ticketssoporteti/backend/public/equipo.php?token=${eq.token}`;

        etiquetasHTML += `
            <div class="etiqueta" 
                style="top:${coords.top}; left:${coords.left}">
                <img src="${logoPath}" class="logo">
                <div class="id">${eq.identificador}</div>
                <canvas id="qr${index}"></canvas>
                <div class="footer">Inventario TI</div>
            </div>
        `;
    });

    ventana.document.write(`
        <html>
        <head>
            <title>Etiquetas</title>
            <script src="https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js"><\/script>
            <style>
                @page { size: Letter; margin: 0; }
                body {
                    margin: 0;
                    position: relative;
                    width: 21.6cm;
                    height: 27.9cm;
                    font-family: Arial;
                }
                .etiqueta {
                    position: absolute;
                    width: 9cm;
                    height: 6cm;
                    border: 2px solid #000;
                    padding: 10px;
                    box-sizing: border-box;
                    text-align: center;
                }
                .logo { height: 40px; }
                .id { font-weight: bold; margin: 5px 0; }
                .footer { font-size: 10px; margin-top: 5px; }
            </style>
        </head>
        <body>
            ${etiquetasHTML}
            <script>
                ${equipos.map((eq, i) => `
                    QRCode.toCanvas(
                        document.getElementById("qr${i}"),
                        "http://${window.location.hostname}/ticketssoporteti/backend/public/equipo.php?token=${eq.token}",
                        { width: 110 }
                    );
                `).join("")}

                setTimeout(() => window.print(), 600);
            <\/script>
        </body>
        </html>
    `);
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

function actualizarIndicadoresSort() {

    document.querySelectorAll("th[data-col]").forEach(th => {

        const span = th.querySelector(".sort-indicator");
        const col = th.getAttribute("data-col");

        if (col === currentSort) {
            span.textContent = currentOrder === "ASC" ? " ↑" : " ↓";
        } else {
            span.textContent = "";
        }

    });
}

function abrirEtiqueta(identificador, token, posicion = 1) {

    const ventana = window.open("", "_blank");

    const urlPublica = `http://${window.location.hostname}/ticketssoporteti/backend/public/equipo.php?token=${token}`;
    const logoPath = `/ticketssoporteti/frontend/login/assets/logo-forsis.png`;

    const posiciones = {
        1: { top: "1cm", left: "1cm" },
        2: { top: "1cm", left: "11cm" },

        3: { top: "7.5cm", left: "1cm" },
        4: { top: "7.5cm", left: "11cm" },

        5: { top: "14cm", left: "1cm" },
        6: { top: "14cm", left: "11cm" },

        7: { top: "20.5cm", left: "1cm" },
        8: { top: "20.5cm", left: "11cm" }
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

function obtenerDescripcionFiltros() {

  const tipo = document.getElementById("filtroTipo")?.value;
  const estado = document.getElementById("filtroEstado")?.value;
  const search = document.getElementById("searchInput")?.value?.trim();

  let partes = [];

  if (estado && estado !== "") {
    partes.push(estado);
  }

  if (tipo && tipo !== "") {
    partes.push(`Tipo: ${tipo}`);
  }

  if (search) {
    partes.push(`Búsqueda: ${search}`);
  }

  if (partes.length === 0) {
    return "Inventario de Equipos TI";
  }

  return "Inventario de Equipos TI | Filtros: " + partes.join(" | ");
}

async function exportarExcel() {

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Inventario");

    const fechaFormato = "18/10/24";
    const revision = "0";
    const codigo = "FMF-FOR-SIS-003";
    const elaboro = "Cesar Luis Soto Gonzalez";

    // ================================
    // LOGO
    // ================================
    const response = await fetch("/ticketssoporteti/frontend/login/assets/logo-forsis.png");
    const blob = await response.blob();
    const buffer = await blob.arrayBuffer();

    const imageId = workbook.addImage({
        buffer: buffer,
        extension: "png",
    });

    worksheet.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 110, height: 110 }
    });

    // ================================
    // TÍTULO
    // ================================
    worksheet.mergeCells("A5:F5");
    worksheet.getCell("A5").value = "INVENTARIO DE EQUIPOS TI";
    worksheet.getCell("A5").font = { size: 14, bold: true };
    worksheet.getCell("A5").alignment = { horizontal: "center" };

    // ================================
    // BLOQUE SUPERIOR CORREGIDO
    // ================================

    // FECHA - PAG - REVISION
    worksheet.getCell("A7").value = "FECHA";
    worksheet.getCell("B7").value = fechaFormato;

    worksheet.getCell("C7").value = "PAG.";
    worksheet.getCell("D7").value = "1 de 1";

    worksheet.getCell("E7").value = "REVISION";
    worksheet.getCell("F7").value = revision;

    // CODIGO (combinar columnas B-F)
    worksheet.getCell("A8").value = "CODIGO";
    worksheet.mergeCells("B8:F8");
    worksheet.getCell("B8").value = codigo;

    // ELABORÓ (combinar columnas B-F)
    worksheet.getCell("A9").value = "Elaboró:";
    worksheet.mergeCells("B9:F9");
    worksheet.getCell("B9").value = elaboro;

    // Estilo bloque superior (bordes sin fondo)
    for (let row = 7; row <= 9; row++) {
        for (let col = 1; col <= 6; col++) {
            const cell = worksheet.getRow(row).getCell(col);

            cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" }
            };

            if (col % 2 !== 0) {
                cell.font = { bold: true };
            }

            cell.alignment = { vertical: "middle" };
        }
    }

    // ================================
    // TABLA
    // ================================
    const startRow = 11;

    const headers = [
        "Identificador",
        "Tipo",
        "Marca",
        "Modelo",
        "Estado",
        "Asignado a"
    ];

    const headerRow = worksheet.insertRow(startRow, headers);

    headerRow.eachCell(cell => {
        cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
        cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "1F4E78" }
        };
        cell.alignment = { horizontal: "center" };
        cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" }
        };
    });

    // Datos visibles con zebra striping
    let rowIndex = startRow + 1;
    let zebra = false;

    document.querySelectorAll("#tablaEquipos tr").forEach(tr => {

        const cells = tr.querySelectorAll("td");

        if (cells.length > 0) {

            const row = worksheet.insertRow(rowIndex, [
                cells[1].innerText,
                cells[2].innerText,
                cells[3].innerText,
                cells[4].innerText,
                cells[5].innerText,
                cells[6].innerText
            ]);

            row.eachCell(cell => {

                cell.border = {
                    top: { style: "thin" },
                    left: { style: "thin" },
                    bottom: { style: "thin" },
                    right: { style: "thin" }
                };

                if (zebra) {
                    cell.fill = {
                        type: "pattern",
                        pattern: "solid",
                        fgColor: { argb: "F2F2F2" }
                    };
                }
            });

            zebra = !zebra;
            rowIndex++;
        }
    });

    // Autofiltro
    worksheet.autoFilter = {
        from: { row: startRow, column: 1 },
        to: { row: rowIndex - 1, column: 6 }
    };

    // Ancho columnas
    worksheet.columns = [
        { width: 22 },
        { width: 15 },
        { width: 18 },
        { width: 18 },
        { width: 15 },
        { width: 28 }
    ];

    const bufferFinal = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([bufferFinal]), "Inventario_Institucional.xlsx");
}


function exportarPDF() {

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'letter'
  });

  const margin = 12;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const logo = new Image();
  logo.src = '/ticketssoporteti/frontend/login/assets/logo-forsis.png';

  logo.onload = function () {

    /* =========================================
       2️⃣ HEADER INSTITUCIONAL
    ========================================== */

    doc.autoTable({
      startY: 10,
      margin: { left: margin, right: margin },
      body: [
        [
          { content: '', rowSpan: 6, styles: { cellWidth: 30 } },
          { content: 'INVENTARIO DE EQUIPOS TI', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fontSize: 14 } }
        ],
        [
          { content: 'FLETES Y MATERIALES FORSIS, S.A. DE C.V.', colSpan: 4, styles: { halign: 'center', textColor: [220,38,38], fontStyle: 'bold' } }
        ],
        [
          { content: 'FECHA', styles: { halign: 'center', fontStyle: 'bold' } },
          { content: 'PAG.', styles: { halign: 'center', fontStyle: 'bold' } },
          { content: 'REVISION', styles: { halign: 'center', fontStyle: 'bold' } },
          { content: 'CÓDIGO', styles: { halign: 'center', fontStyle: 'bold' } }
        ],
        [
          { content: '18/10/24', styles: { halign: 'center' } },
          { content: '1 de 1', styles: { halign: 'center' } },
          { content: '0', styles: { halign: 'center' } },
          { content: 'FMF-FOR-SIS-003', styles: { halign: 'center' } }
        ],
        [
          { content: 'Elaboró:', styles: { halign: 'right', fontStyle: 'bold' } },
          { content: 'Cesar Luis Soto Gonzalez', colSpan: 3 }
        ]
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 }
    });

    doc.addImage(logo, 'PNG', margin + 3, 13, 24, 24);

    /* =========================================
       3️⃣ TABLA DE DATOS
    ========================================== */

    const rows = [];

    document.querySelectorAll("#tablaEquipos tr").forEach(tr => {
      const cells = tr.querySelectorAll("td");
      if (cells.length > 0) {
        rows.push([
          cells[1].innerText,
          cells[2].innerText,
          cells[3].innerText,
          cells[4].innerText,
          cells[5].innerText,
          cells[6].innerText
        ]);
      }
    });

    const totalRegistros = rows.length;

    doc.autoTable({
      startY: doc.lastAutoTable.finalY + 6,
      margin: { left: margin, right: margin, bottom: 22 }, // 🔥 RESERVA FOOTER
      head: [[
        'Identificador',
        'Tipo',
        'Marca',
        'Modelo',
        'Estado',
        'Asignado a'
      ]],
      body: rows,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 3,
        lineColor: [200,200,200],
        lineWidth: 0.2
      },
      headStyles: {
        fillColor: [0,0,0],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245,245,245]
      }
    });

    const totalPages1 = doc.internal.getNumberOfPages();

for (let i = 1; i <= totalPages1; i++) {

  doc.setPage(i);

  doc.setGState(new doc.GState({ opacity: 0.05 }));

  const watermarkSize = 130;

  doc.addImage(
    logo,
    'PNG',
    (pageWidth - watermarkSize) / 2,
    (pageHeight - watermarkSize) / 2,
    watermarkSize,
    watermarkSize
  );

  doc.setGState(new doc.GState({ opacity: 1 }));
}

    /* =========================================
       4️⃣ FOOTER ELEGANTE (SIN INVADIR)
    ========================================== */

    const totalPages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {

      doc.setPage(i);

      doc.setDrawColor(200);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 18, pageWidth - margin, pageHeight - 18);

      doc.setFontSize(8);
      doc.setTextColor(80);

      const now = new Date();
      const fechaGeneracion =
        now.toLocaleDateString() + " " +
        now.toLocaleTimeString();

      doc.text(
        `Generado: ${fechaGeneracion}`,
        margin,
        pageHeight - 10
      );

      doc.setFont(undefined, 'bold');

    const descripcionFiltros = obtenerDescripcionFiltros();

    doc.setFont(undefined, 'bold');

    doc.text(
    `${descripcionFiltros} | Registros: ${totalRegistros}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center', maxWidth: pageWidth - 60 }
    );

    doc.setFont(undefined, 'normal');

      doc.setFont(undefined, 'normal');

      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - margin,
        pageHeight - 10,
        { align: 'right' }
      );
    }

    doc.save('Inventario_TI.pdf');
  };
}
