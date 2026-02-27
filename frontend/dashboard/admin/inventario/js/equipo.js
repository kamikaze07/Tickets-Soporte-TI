let ultimaResponsiva = null;
document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    cargarUltimaResponsiva(id);

    if (!id) {
        alert("ID no válido");
        return;
    }

    fetch(`/ticketssoporteti/backend/inventario/equipos/get_full.php?id=${id}`)
        .then(res => res.json())
        .then(data => {
             console.log(data); // 👈 IMPORTANTÍSIMO

            if (data.error) {
                alert(data.error);
                return;
            }

            renderEquipo(data);

        });
});

function renderEquipo(data) {

    document.getElementById("tituloEquipo").innerText = data.identificador;
    document.getElementById("tituloEquipoHeader").innerText = data.identificador;

    document.getElementById("resumenTipo").innerText = data.tipo;
    document.getElementById("resumenAsignado").innerText =
    data.usuario_nombre ? "Asignado a " + data.usuario_nombre : "Sin asignar";

    // ===== BADGE ESTADO =====
    const estadoClassMap = {
        "Disponible": "badge-disponible",
        "Asignado": "badge-asignado",
        "En reparación": "badge-reparacion",
        "Dado de baja": "badge-baja"
    };

    const estadoClass = estadoClassMap[data.estado] || "badge-disponible";

    // ===== INFORMACIÓN GENERAL =====
document.getElementById("infoGeneral").innerHTML = `
    <div class="info-grid">
        <div class="info-item">
            <span>Tipo</span>
            <div>${data.tipo}</div>
        </div>

        <div class="info-item editable" data-key="marca">
            <span>Marca</span>
            <div class="value">${data.marca || "-"}</div>
        </div>

        <div class="info-item editable" data-key="modelo">
            <span>Modelo</span>
            <div class="value">${data.modelo || "-"}</div>
        </div>

        <div class="info-item editable" data-key="numero_serie">
            <span>Serie</span>
            <div class="value">${data.numero_serie || "-"}</div>
        </div>

        <div class="info-item">
            <span>Asignado a</span>
            <div>${data.usuario_nombre || "-"}</div>
        </div>

        <div class="info-item">
            <span>Fecha Alta</span>
            <div>${data.fecha_alta}</div>
        </div>
    </div>
`;



    // ===== ESPECIFICACIONES (CON LABELS BONITOS) =====
    const labels = {
        categoria: "Categoría",
        sistema_operativo: "Sistema Operativo",
        procesador: "Procesador",
        ram: "RAM",
        disco: "Disco",
        tamano: "Tamaño",
        resolucion: "Resolución",
        tipo_panel: "Tipo de panel",
        tecnologia: "Tecnología",
        monocromatica: "Monocromática",
        modelo_cartucho: "Modelo de cartucho"
    };

    const specs = JSON.parse(data.especificaciones_json || "{}");

    let specsHTML = '<div class="info-grid">';

    Object.keys(specs).forEach(key => {
        specsHTML += `
            <div class="info-item">
                <span>${labels[key] || key}</span>
                ${specs[key]}
            </div>
        `;
    });

    specsHTML += '</div>';

    document.getElementById("infoSpecs").innerHTML = specsHTML;

    // ===== HISTORIAL TIPO TIMELINE =====
    let historialHTML = "";

    if (data.historial && data.historial.length > 0) {

        data.historial.forEach(mov => {
            historialHTML += `
                <div class="timeline-item">
                    <div class="timeline-title">${mov.tipo_movimiento}</div>
                    <div>${mov.descripcion}</div>
                    <div class="timeline-date">${mov.fecha_movimiento}</div>
                </div>
            `;
        });

    } else {
        historialHTML = "<p>No hay movimientos registrados.</p>";
    }

    document.getElementById("historial").innerHTML = historialHTML;

    const estados = ["Disponible", "Asignado", "En reparación", "Dado de baja"];
    const select = document.getElementById("estadoSelect");

    select.innerHTML = estados.map(e =>
        `<option value="${e}" ${e === data.estado ? "selected" : ""}>${e}</option>`
    ).join("");

    aplicarColorEstado(select);

}

function activarEdicion() {

    document.querySelectorAll(".editable").forEach(item => {

        item.onclick = () => {

            const valueDiv = item.querySelector(".value");
            const actual = valueDiv.innerText;

            valueDiv.innerHTML = `<input type="text" value="${actual}">`;
            const input = valueDiv.querySelector("input");
            input.focus();

            input.onblur = () => {

                const nuevo = input.value;

                fetch('/ticketssoporteti/backend/inventario/equipos/update_field.php', {
                    method: 'POST',
                    headers: {'Content-Type':'application/json'},
                    body: JSON.stringify({
                        id: new URLSearchParams(window.location.search).get("id"),
                        campo: item.dataset.key,
                        valor: nuevo
                    })
                });

                valueDiv.innerText = nuevo;
            };
        };

    });

}


function aplicarColorEstado(select) {
    select.className = "";
    select.classList.add("estado-" + select.value.toLowerCase().replace(" ", "-"));
}

function cambiarEstadoInline() {

    const select = document.getElementById("estadoSelect");

    aplicarColorEstado(select);

    fetch('/ticketssoporteti/backend/inventario/equipos/update_estado.php', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
            id: new URLSearchParams(window.location.search).get("id"),
            estado: select.value
        })
    });
}

function cargarUltimaResponsiva(equipoId) {

    fetch(`/ticketssoporteti/backend/responsivas/ultima.php?equipo_id=${equipoId}`)
    .then(res => res.json())
    .then(data => {
        console.log("Última responsiva:", data); // 👈 DEBUG
        if (!data.ok) return;

        ultimaResponsiva = data;

        const btn = document.getElementById("btnReimprimirResp");
        btn.style.display = "inline-block";

        btn.onclick = () => {
            generarPDFResponsiva(data.folio, data.token_publico);
        };

    });
}

async function generarPDFResponsiva(folio, token) {

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter"
  });

  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const logo = new Image();
  logo.src = "/ticketssoporteti/frontend/login/assets/logo-forsis.png";

  logo.onload = async function () {

    /* ==============================
       MARCA DE AGUA
    ============================== */
    doc.setGState(new doc.GState({ opacity: 0.05 }));
    doc.addImage(logo, "PNG",
      (pageWidth - 120) / 2,
      (pageHeight - 120) / 2,
      120,
      120
    );
    doc.setGState(new doc.GState({ opacity: 1 }));

    /* ==============================
       HEADER
    ============================== */
    doc.autoTable({
      startY: 10,
      margin: { left: margin, right: margin },
      body: [
        [
          { content: '', rowSpan: 6, styles: { cellWidth: 30 } },
          { content: 'RESPONSIVA Y RESGUARDO DE EQUIPO DE CÓMPUTO', colSpan: 4, styles: { halign: 'center', fontStyle: 'bold', fontSize: 12 } }
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
          { content: new Date().toLocaleDateString(), styles: { halign: 'center' } },
          { content: '1 de 1', styles: { halign: 'center' } },
          { content: '0', styles: { halign: 'center' } },
          { content: 'FMF-FOR-SIS-001', styles: { halign: 'center' } }
        ],
        [
          { content: 'FOLIO:', styles: { halign: 'right', fontStyle: 'bold' } },
          { content: folio, colSpan: 3 }
        ]
      ],
      theme: "grid",
      styles: { fontSize: 8 }
    });

    doc.addImage(logo, "PNG", margin + 3, 13, 24, 24);

    let y = doc.lastAutoTable.finalY + 10;

        /* ==============================
    QR POSICIONADO DEBAJO DEL HEADER
    ============================== */

    const qrUrl = `http://${window.location.hostname}/ticketssoporteti/backend/public/responsiva.php?token=${token}`;

    const qrContainer = document.createElement("div");

    new QRCode(qrContainer, {
    text: qrUrl,
    width: 120,
    height: 120
    });

    let qrImg;
    const canvas = qrContainer.querySelector("canvas");
    const img = qrContainer.querySelector("img");

    if (canvas) {
    qrImg = canvas.toDataURL("image/png");
    } else if (img) {
    qrImg = img.src;
    }

    const qrSize = 30;

    // 🔥 alineado con borde derecho de la tabla
    const qrX = pageWidth - margin - qrSize;

    // 🔥 alineado verticalmente con "DATOS DEL EQUIPO"
    const qrY = y - 5;

    doc.addImage(
    qrImg,
    "PNG",
    qrX,
    qrY,
    qrSize,
    qrSize
    );

    /* ==============================
       DATOS EQUIPO (desde snapshot backend)
    ============================== */

    const res = await fetch(`/ticketssoporteti/backend/responsivas/get_by_token.php?token=${token}`);
    const data = await res.json();

    const eq = data.snapshot_equipo;
    const emp = data.snapshot_empleado;

    doc.setFontSize(11);
    doc.setFont(undefined, "bold");
    doc.text("DATOS DEL EQUIPO", margin, y);
    y += 6;

    doc.setFont(undefined, "normal");
    doc.setFontSize(10);

    doc.text(`Identificador: ${eq.identificador}`, margin, y); y += 6;
    doc.text(`Marca / Modelo: ${eq.marca} ${eq.modelo}`, margin, y); y += 6;
    doc.text(`Serie: ${eq.numero_serie || '-'}`, margin, y); y += 6;
    doc.text(`Procesador: ${eq.procesador}`, margin, y); y += 6;
    doc.text(`RAM: ${eq.ram}`, margin, y); y += 6;
    doc.text(`Sistema Operativo: ${eq.sistema_operativo}`, margin, y); y += 10;

    /* ==============================
       DATOS EMPLEADO
    ============================== */

    doc.setFont(undefined, "bold");
    doc.text("DATOS DEL USUARIO", margin, y);
    y += 6;

    doc.setFont(undefined, "normal");
    doc.text(`Nombre: ${emp.nombre}`, margin, y); y += 6;
    doc.text(`Número empleado: ${emp.num_emp}`, margin, y); y += 6;
    doc.text(`Departamento: ${emp.departamento}`, margin, y); y += 10;

    /* ==============================
       CLÁUSULA CORTA
    ============================== */

    doc.setFontSize(9);
    doc.text(
      "Declaro recibir el equipo descrito en óptimas condiciones y me comprometo a su resguardo y buen uso.",
      margin,
      y,
      { maxWidth: pageWidth - 30 }
    );

    y += 25;

    /* ==============================
       FIRMAS
    ============================== */

    const firmaUsuarioImg = `/ticketssoporteti/uploads/responsivas/${data.firma_usuario}`;
    const firmaAdminImg = `/ticketssoporteti/uploads/responsivas/${data.firma_admin}`;

    doc.text("Firma Usuario", margin, y);
    doc.text("Firma Sistemas", pageWidth - 70, y);

    y += 5;

    const firmaUsuario = await fetch(firmaUsuarioImg).then(r => r.blob());
    const firmaAdmin = await fetch(firmaAdminImg).then(r => r.blob());

    const userBase64 = await blobToBase64(firmaUsuario);
    const adminBase64 = await blobToBase64(firmaAdmin);

    doc.addImage(userBase64, "PNG", margin, y, 60, 25);
    doc.addImage(adminBase64, "PNG", pageWidth - 75, y, 60, 25);

    /* ==============================
       QR
    ============================== */

    doc.save(`Responsiva_${folio}.pdf`);
  };
}

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}