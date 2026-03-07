/* ======================================
   ESTADO GLOBAL
====================================== */

let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();

let calendar = null;
let miniCalendar = null;

let fotosSeleccionadas = [];
let firmaVacia = true;
let mantenimientoActivo = null;

let canvas;
let ctx;
let dibujando = false;


let mantenimientoCancelar = null;
/* ======================================
   DATOS MOCK (solo visual)
====================================== */

let fechaActiva = null;

/* ======================================
   INIT
====================================== */

document.addEventListener("DOMContentLoaded", () => {
  initSwitch();
  renderVistaAnual();

  document.getElementById("inputFotos").addEventListener("change", async function(e) {

    const files = Array.from(e.target.files);

    if (files.length < 2 || files.length > 3) {
      alert("Debes subir entre 2 y 3 fotos.");
      this.value = "";
      return;
    }

    fotosSeleccionadas = [];

    const preview = document.getElementById("previewFotos");
    preview.innerHTML = "";

    for (let file of files) {

      if (file.size > 10 * 1024 * 1024) {
        alert("Una imagen es demasiado grande (máx 10MB).");
        this.value = "";
        return;
      }

      const compressed = await compressImage(file);
      fotosSeleccionadas.push(compressed);

      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      preview.appendChild(img);
    }

    validarFormularioCerrar();
  });

  canvas = document.getElementById("canvasFirma");
  ctx = canvas.getContext("2d");

  canvas.addEventListener("mousedown", () => dibujando = true);

  canvas.addEventListener("mouseup", () => {
    dibujando = false;
    firmaVacia = false;
    validarFormularioCerrar();
    ctx.beginPath();
  });

  canvas.addEventListener("mousemove", dibujar);

  canvas.addEventListener("touchstart", (e) => {
    e.preventDefault();
    dibujando = true;
  });

  canvas.addEventListener("touchend", () => {
    dibujando = false;
    firmaVacia = false;
    validarFormularioCerrar();
    ctx.beginPath();
  });

  canvas.addEventListener("touchmove", dibujarTouch);

  document.getElementById("btnCancelarCerrar").onclick = () => {
    resetModalCerrar();
    document.getElementById("modalCerrar").style.display = "none";
  };

    document.getElementById("btnLimpiarFirma").onclick = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    firmaVacia = true;
    validarFormularioCerrar();
  };

  document.getElementById("btnConfirmarCerrar").onclick = async function () {

    if (!mantenimientoActivo) {
      alert("Error: mantenimiento no válido.");
      return;
    }

    this.disabled = true;

    const firmaBase64 = canvas.toDataURL("image/png");

    const token = generarUUID();
    const urlValidacion = `${window.location.origin}/ticketssoporteti/backend/public/mantenimiento.php?token=${token}`;

    const qrBase64 = await generarQRBase64(urlValidacion);

    const payload = {
      mantenimiento_id: mantenimientoActivo,
      firma: firmaBase64,
      fotos: fotosSeleccionadas,
      token: token
    };

    const res = await fetch(
      "/ticketssoporteti/backend/mantenimientos/complete_mantenimiento.php",
      {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const result = await res.json();

    if (!result.ok) {
      alert(result.msg);
      this.disabled = false;
      return;
    }

    // 🔥 GENERAMOS PDF DESPUÉS DE GUARDAR
    const fullData = await fetch(
      `/ticketssoporteti/backend/mantenimientos/get_full.php?id=${mantenimientoActivo}`
    ).then(r => r.json());

    await generarPDFMantenimiento(fullData, qrBase64);

    calendar.refetchEvents();
    renderVistaAnual();
    renderTablaMes(currentYear, currentMonth);
    document.getElementById("modalCerrar").style.display = "none";
    resetModalCerrar();
    mantenimientoActivo = null;

    this.disabled = false;

  };

  const selectPrograma = document.getElementById("selectAnioPrograma");
  const anioActual = new Date().getFullYear();

  for (let i = anioActual; i >= 2020; i--) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    selectPrograma.appendChild(option);
  }

  selectPrograma.value = anioActual;

  document.getElementById("btnGenerarProgramaAnual")
  .addEventListener("click", async () => {

    const anio = document.getElementById("selectAnioPrograma").value;

    const res = await fetch(
      `/ticketssoporteti/backend/mantenimientos/programa_anual.php?year=${anio}`,
      { credentials: "include" }
    );

    const data = await res.json();

    if (!data.length) {
      alert("No hay mantenimientos preventivos ese año.");
      return;
    }

    generarPDFProgramaAnual(data, anio);
  });

    document.getElementById("btnCancelarCancelar").onclick = () => {
      mantenimientoCancelar = null;
      document.getElementById("modalCancelar").style.display = "none";
    };

    document.getElementById("btnConfirmarCancelacion").onclick = async () => {

    const motivo = document.getElementById("motivoCancelacion").value.trim();

    if (!motivo) {
      alert("Debes ingresar el motivo de cancelación.");
      return;
    }

    if (!mantenimientoCancelar) {
      alert("Mantenimiento no válido.");
      return;
    }

    const res = await fetch(
      "/ticketssoporteti/backend/mantenimientos/cancel_mantenimiento.php",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          mantenimiento_id: mantenimientoCancelar,
          motivo: motivo
        })
      }
    );

    const data = await res.json();

    if (!data.ok) {
      alert(data.msg);
      return;
    }

    document.getElementById("modalCancelar").style.display = "none";
    mantenimientoCancelar = null;

    alert("Mantenimiento cancelado correctamente");

    calendar.refetchEvents();
    renderVistaAnual();
    renderTablaMes(currentYear, currentMonth);

  };


});

/* ======================================
   SWITCH VISTA
====================================== */

function initSwitch() {

  const btnAnual = document.getElementById("btnVistaAnual");
  const btnMensual = document.getElementById("btnVistaMensual");

  btnAnual.addEventListener("click", () => {
    btnAnual.classList.add("active");
    btnMensual.classList.remove("active");

    document.getElementById("vistaAnual").classList.remove("hidden");
    document.getElementById("vistaMensual").classList.add("hidden");
  });

  btnMensual.addEventListener("click", () => {
    btnMensual.classList.add("active");
    btnAnual.classList.remove("active");

    document.getElementById("vistaAnual").classList.add("hidden");
    document.getElementById("vistaMensual").classList.remove("hidden");

    initVistaMensual(currentYear, currentMonth);
  });
}

/* ======================================
   VISTA ANUAL
====================================== */

async function renderVistaAnual() {

  const grid = document.getElementById("gridMeses");
  grid.innerHTML = "";

  const res = await fetch(
    `/ticketssoporteti/backend/mantenimientos/list_year_summary.php?year=${currentYear}`,
    { credentials: "include" }
  );

  const resumen = await res.json();

  const mapa = {};
  resumen.forEach(r => {
    mapa[r.mes - 1] = r;
  });

  const meses = [
    "Enero","Febrero","Marzo","Abril",
    "Mayo","Junio","Julio","Agosto",
    "Septiembre","Octubre","Noviembre","Diciembre"
  ];

  meses.forEach((nombre, index) => {

    const data = mapa[index] || { total: 0, pendientes: 0 };

    const card = document.createElement("div");
    card.className = "mes-card";

    if (data.pendientes > 0) card.classList.add("pendientes");
    if (data.total > 0 && data.pendientes == 0) card.classList.add("completo");

    card.innerHTML = `
      <div class="mes-nombre">${nombre}</div>
      <div class="mes-info">
        ${data.total} preventivos
      </div>
      ${data.total ? `<div class="mes-badge">${data.total}</div>` : ""}
    `;

    card.addEventListener("click", () => {
      currentMonth = index;
      document.getElementById("btnVistaMensual").click();
    });

    grid.appendChild(card);
  });
}

/* ======================================
   VISTA MENSUAL
====================================== */

function initVistaMensual(year, month) {

  renderMiniCalendar(year, month);
  renderMainCalendar(year, month);
  renderTablaMes(year, month);
}

/* ======================================
   MINI CALENDARIO
====================================== */

function renderMiniCalendar(year, month) {

  const container = document.getElementById("miniCalendar");
  container.innerHTML = "";

  miniCalendar = new FullCalendar.Calendar(container, {
    initialView: "dayGridMonth",
    height: 350,
    initialDate: new Date(year, month, 1),
    headerToolbar: {
      left: "prev,next",
      center: "title",
      right: ""
    },
    dateClick: function(info) {
      calendar.gotoDate(info.date);
    }
  });

  miniCalendar.render();
}

/* ======================================
   CALENDARIO PRINCIPAL
====================================== */

function renderMainCalendar(year, month) {

  const container = document.getElementById("calendar");
  container.innerHTML = "";

  const isMobile = window.innerWidth < 768;

  calendar = new FullCalendar.Calendar(container, {
    initialView: isMobile ? "listMonth" : "dayGridMonth",
    initialDate: new Date(year, month, 1),
    height: isMobile ? "auto" : 600,

    headerToolbar: isMobile
      ? {
          left: "prev,next",
          center: "title",
          right: "listMonth,dayGridMonth"
        }
      : {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,listMonth"
        },

    events: function(fetchInfo, successCallback, failureCallback) {
      fetch(`/ticketssoporteti/backend/mantenimientos/list_by_range.php?start=${fetchInfo.startStr}&end=${fetchInfo.endStr}`, {
        credentials: "include"
      })
      .then(res => res.json())
      .then(data => successCallback(data))
      .catch(err => failureCallback(err));
    },

    dateClick: function(info) {
      abrirModalDia(info.dateStr);
    }
  });

  calendar.render();
}

/* ======================================
   TABLA MES
====================================== */

async function renderTablaMes(year, month) {

  const tbody = document.getElementById("tablaMantenimientos");
  tbody.innerHTML = "<tr><td colspan='7'>Cargando...</td></tr>";

  const res = await fetch(
    `/ticketssoporteti/backend/mantenimientos/list_by_month.php?year=${year}&month=${month}`,
    { credentials: "include" }
  );

  const lista = await res.json();

  tbody.innerHTML = "";

  if (!lista.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center;">
          Sin mantenimientos este mes
        </td>
      </tr>
    `;
    return;
  }

  lista.forEach(m => {

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${m.id}</td>
      <td>${m.identificador}</td>
      <td>${m.usuario}</td>
      <td>${m.tipo}</td>
      <td>${m.fecha_programada}</td>
      <td>${m.fecha_realizada || "-"}</td>
      <td>${m.estado}</td>
      <td>
        ${m.estado === "Pendiente"
          ? `
            <button class="btn" onclick="abrirModalCerrar(${m.id})">
              Cerrar
            </button>

            <button class="btn cancel" onclick="abrirModalCancelar(${m.id})">
              Cancelar
            </button>
            `

          : m.estado === "Realizado"
          ? `
            <button class="btn view" onclick="descargarPDFMantenimiento(${m.id})">
              Descargar PDF
            </button>
            `

          : m.estado === "Cancelado"
          ? `
            <button class="btn cancel" onclick="verMotivoCancelacion('${m.motivo_cancelacion || "Sin motivo registrado"}')">
              Ver motivo
            </button>
            `
          : ""
        }
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/* ======================================
   MODAL DÍA
====================================== */

async function abrirModalDia(fechaStr) {

  fechaActiva = fechaStr;

  const modal = document.getElementById("modalDia");
  const lista = document.getElementById("listaMantenimientosDia");
  const titulo = document.getElementById("modalFechaTitulo");
  const btnAsignar = document.getElementById("btnAsignarPreventivo");

  titulo.textContent = `Mantenimientos - ${fechaStr}`;
  lista.innerHTML = "Cargando...";

  const res = await fetch(
    `/ticketssoporteti/backend/mantenimientos/list_by_date.php?date=${fechaStr}`,
    { credentials: "include" }
  );

  const mantenimientosDia = await res.json();

  lista.innerHTML = "";

  if (!mantenimientosDia.length) {
    lista.innerHTML = `<p>No hay mantenimientos este día.</p>`;
    btnAsignar.style.display = "inline-block";
  } else {

    btnAsignar.style.display = "inline-block";

    mantenimientosDia.forEach(m => {
      lista.innerHTML += `
        <div class="mantenimiento-item">
          <strong>${m.identificador}</strong>
          ${m.tipo} - ${m.estado}
        </div>
      `;
    });
  }

  modal.style.display = "flex";

  document.getElementById("btnCerrarModalDia")
    .onclick = () => modal.style.display = "none";

  btnAsignar.onclick = abrirModalAsignar;
}

async function abrirModalAsignar() {

  const modal = document.getElementById("modalAsignar");
  const select = document.getElementById("selectEquipo");
  const fechaLabel = document.getElementById("fechaSeleccionada");

  fechaLabel.textContent = fechaActiva;
  select.innerHTML = "Cargando...";

  const res = await fetch(
    `/ticketssoporteti/backend/mantenimientos/list_computadoras.php`,
    { credentials: "include" }
  );

  const equipos = await res.json();

  select.innerHTML = "";

  if (!equipos.length) {
    select.innerHTML = `<option>No hay computadoras disponibles</option>`;
    document.getElementById("btnGuardarPreventivo").disabled = true;
  } else {

    document.getElementById("btnGuardarPreventivo").disabled = false;

    equipos.forEach(eq => {

      const option = document.createElement("option");
      option.value = eq.id;

      let texto = eq.identificador;

      if (eq.usuario) {
        texto += ` (Asignado a: ${eq.usuario})`;
      } else {
        texto += ` (Disponible)`;
      }

      option.textContent = texto;
      select.appendChild(option);
    });
  }

  modal.style.display = "flex";

  document.getElementById("btnCancelarAsignar")
    .onclick = () => modal.style.display = "none";

  document.getElementById("btnGuardarPreventivo")
    .onclick = guardarPreventivo;
}


async function guardarPreventivo() {

  const select = document.getElementById("selectEquipo");
  const equipoSeleccionado = select.value;

  if (!equipoSeleccionado) return;

  const res = await fetch(
    "/ticketssoporteti/backend/mantenimientos/create_preventivo.php",
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        equipo_id: parseInt(equipoSeleccionado),
        fecha_programada: fechaActiva
      })
    }
  );

  const data = await res.json();

  if (!data.ok) {
    alert(data.msg);
    return;
  }

  calendar.refetchEvents();
  renderTablaMes(
    new Date(fechaActiva).getFullYear(),
    new Date(fechaActiva).getMonth()
  );
  renderVistaAnual();

  document.getElementById("modalAsignar").style.display = "none";
  document.getElementById("modalDia").style.display = "none";

  // Aquí después llamaremos fetch real para recargar datos
}

function dibujar(e) {
  if (!dibujando) return;

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";

  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
}

function dibujarTouch(e) {
  if (!dibujando) return;

  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0];

  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.strokeStyle = "#000";

  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
}

function validarFormularioCerrar() {
  const btn = document.getElementById("btnConfirmarCerrar");
  btn.disabled = !(fotosSeleccionadas.length >= 2 && !firmaVacia);
}

function generarQRBase64(url) {
  return new Promise((resolve) => {

    const tempDiv = document.createElement("div");

    const qr = new QRCode(tempDiv, {
      text: url,
      width: 200,
      height: 200
    });

    setTimeout(() => {
      const img = tempDiv.querySelector("img");
      resolve(img.src); // base64
    }, 300);

  });
}

async function enviarCierre(data) {

  const res = await fetch(
    "/ticketssoporteti/backend/mantenimientos/complete_mantenimiento.php",
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    }
  );

  const result = await res.json();

  if (!result.ok) {
    alert(result.msg);
    return;
  }

  calendar.refetchEvents();
  renderVistaAnual();

  alert("Mantenimiento cerrado correctamente ✅");

  document.getElementById("modalCerrar").style.display = "none";

  resetModalCerrar();
  mantenimientoActivo = null;
}

function resetModalCerrar() {
  fotosSeleccionadas = [];
  firmaVacia = true;

  document.getElementById("previewFotos").innerHTML = "";
  document.getElementById("inputFotos").value = "";

  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  validarFormularioCerrar();
}

function abrirModalCerrar(id) {
  mantenimientoActivo = id;
  resetModalCerrar();
  document.getElementById("modalCerrar").style.display = "flex";
}

async function compressImage(file) {

  return new Promise((resolve, reject) => {

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = function (event) {

      const img = new Image();
      img.src = event.target.result;

      img.onload = function () {

        const canvasTemp = document.createElement("canvas");
        const ctxTemp = canvasTemp.getContext("2d");

        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 1280;
        const QUALITY = 0.7;

        let width = img.width;
        let height = img.height;

        // Escalar proporcionalmente
        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvasTemp.width = width;
        canvasTemp.height = height;

        ctxTemp.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvasTemp.toDataURL("image/jpeg", QUALITY);

        resolve(compressedBase64);
      };

      img.onerror = reject;
    };

    reader.onerror = reject;
  });
}

async function generarPDFMantenimiento(data, qrBase64) {

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "letter"
  });

  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  /* =====================================
     LOGO
  ===================================== */

  const logo = new Image();
  logo.src = "/ticketssoporteti/frontend/login/assets/logo-forsis.png";

  await new Promise(resolve => logo.onload = resolve);

  /* =====================================
     MARCA DE AGUA
  ===================================== */

  doc.setGState(new doc.GState({ opacity: 0.05 }));
  doc.addImage(logo, "PNG",
    (pageWidth - 120) / 2,
    (pageHeight - 120) / 2,
    120,
    120
  );
  doc.setGState(new doc.GState({ opacity: 1 }));

  /* =====================================
     HEADER
  ===================================== */

  doc.autoTable({
    startY: 10,
    margin: { left: margin, right: margin },
    body: [
      [
        { content: '', rowSpan: 4, styles: { cellWidth: 30 } },
        { content: 'REPORTE DE MANTENIMIENTO PREVENTIVO', colSpan: 3, styles: { halign: 'center', fontStyle: 'bold', fontSize: 12 } }
      ],
      [
        { content: 'FLETES Y MATERIALES FORSIS, S.A. DE C.V.', colSpan: 3, styles: { halign: 'center', textColor: [220,38,38], fontStyle: 'bold' } }
      ],
      [
        { content: 'Fecha', styles: { fontStyle: 'bold' } },
        { content: new Date(data.fecha_realizada).toLocaleString(), colSpan: 2 }
      ],
      [
        { content: 'Folio Interno', styles: { fontStyle: 'bold' } },
        { content: `MTTO-${data.id}`, colSpan: 2 }
      ]
    ],
    theme: "grid",
    styles: { fontSize: 8 }
  });

  doc.addImage(logo, "PNG", margin + 3, 13, 24, 24);

  let y = doc.lastAutoTable.finalY + 10;

  /* =====================================
     QR
  ===================================== */

  doc.addImage(qrBase64, "PNG",
    pageWidth - margin - 30,
    y - 5,
    30,
    30
  );

  /* =====================================
     DATOS DEL EQUIPO
  ===================================== */

  doc.setFontSize(11);
  doc.setFont(undefined, "bold");
  doc.text("DATOS DEL EQUIPO", margin, y);
  y += 6;

  doc.setFont(undefined, "normal");
  doc.setFontSize(10);

  doc.text(`Identificador: ${data.identificador}`, margin, y); y += 6;
  doc.text(`Marca / Modelo: ${data.marca} ${data.modelo}`, margin, y); y += 6;
  doc.text(`Serie: ${data.numero_serie || '-'}`, margin, y); y += 6;
  doc.text(`Fecha Programada: ${data.fecha_programada}`, margin, y); y += 6;
  doc.text(`Fecha Realizada: ${data.fecha_realizada}`, margin, y); y += 10;

  /* =====================================
     ESPECIFICACIONES
  ===================================== */

  if (data.especificaciones_json) {

    const specs = JSON.parse(data.especificaciones_json);

    doc.setFont(undefined, "bold");
    doc.text("ESPECIFICACIONES", margin, y);
    y += 6;

    doc.setFont(undefined, "normal");

    Object.keys(specs).forEach(key => {
      doc.text(`${key}: ${specs[key]}`, margin, y);
      y += 5;
    });

    y += 5;
  }

  /* =====================================
     FOTOS EVIDENCIA
  ===================================== */

/* =====================================
   EVIDENCIA FOTOGRÁFICA (MEJORADO)
===================================== */

  if (data.fotos_evidencia) {

    const fotos = JSON.parse(data.fotos_evidencia);

    if (y > 200) {
      doc.addPage();
      y = 20;
    }

    doc.setFont(undefined, "bold");
    doc.text("EVIDENCIA FOTOGRÁFICA", margin, y);
    y += 8;

    // Dibujar marco
    doc.rect(margin, y - 5, pageWidth - 30, 55);

    const imgWidth = 50;
    const imgHeight = 40;
    const spacing = 10;

    let xPosition = margin + 5;

    for (let i = 0; i < fotos.length; i++) {

      const imgUrl = `/ticketssoporteti/uploads/mantenimientos/${data.id}/${fotos[i]}`;
      const blob = await fetch(imgUrl).then(r => r.blob());
      const base64 = await blobToBase64(blob);

      doc.addImage(base64, "JPEG", xPosition, y, imgWidth, imgHeight);

      xPosition += imgWidth + spacing;
    }

    y += 60;
  }

  /* =====================================
     FIRMA TÉCNICO
  ===================================== */

  if (data.firma_path) {

    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setFont(undefined, "bold");
    doc.text("FIRMA DEL TÉCNICO", margin, y);
    y += 5;

    const firmaUrl = `/ticketssoporteti/uploads/mantenimientos/${data.id}/${data.firma_path}`;
    const blob = await fetch(firmaUrl).then(r => r.blob());
    const firmaBase64 = await blobToBase64(blob);

    doc.addImage(firmaBase64, "PNG", margin, y, 60, 25);
  }

  /* =====================================
     DESCARGA
  ===================================== */

  doc.save(`Mantenimiento_${data.id}.pdf`);
}

async function descargarPDFMantenimiento(id) {

  // 1️⃣ Traemos toda la info del mantenimiento
  const data = await fetch(
    `/ticketssoporteti/backend/mantenimientos/get_full.php?id=${id}`,
    { credentials: "include" }
  ).then(r => r.json());

  if (data.error) {
    alert(data.error);
    return;
  }

  // 2️⃣ Regeneramos el QR usando el token guardado
  const qrUrl = `${window.location.origin}/ticketssoporteti/backend/public/mantenimiento.php?token=${data.token_publico}`;
  const qrBase64 = await generarQRBase64(qrUrl);

  // 3️⃣ Volvemos a generar el PDF
  await generarPDFMantenimiento(data, qrBase64);
}

function generarUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function generarPDFProgramaAnual(data, anio) {

  const { jsPDF } = window.jspdf;

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "letter"
  });

  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const equiposPorPagina = 15;

  const logo = new Image();
  logo.src = "/ticketssoporteti/frontend/login/assets/logo-forsis.png";
  await new Promise(resolve => logo.onload = resolve);

  const hoy = new Date();
  const fechaElaboracion = hoy.toLocaleDateString("es-MX");

  // =========================
  // HEADER SOLO PRIMERA PAGINA
  // =========================

  doc.autoTable({
    startY: 10,
    margin: { left: 10, right: 10 },
    body: [
      [
        { content: '', rowSpan: 5, styles: { cellWidth: 30 } },
        {
          content: 'FLETES Y MATERIALES FORSIS, S.A. DE C.V.',
          colSpan: 4,
          styles: { halign: 'center', textColor: [220,38,38], fontStyle: 'bold', fontSize: 11 }
        }
      ],
      [
        {
          content: `Programa Anual de Mantenimiento Preventivo ${anio}`,
          colSpan: 4,
          styles: { halign: 'center', fontStyle: 'bold' }
        }
      ],
      [
        { content: 'FECHA', styles: { fontStyle: 'bold' } },
        { content: '11/11/18' },
        { content: 'PAG.', styles: { fontStyle: 'bold' } },
        { content: '1 de 1' }
      ],
      [
        { content: 'REVISIÓN', styles: { fontStyle: 'bold' } },
        { content: '0' },
        { content: 'CÓDIGO', styles: { fontStyle: 'bold' } },
        { content: 'FMF-FOR-SIS-002' }
      ],
      [
        { content: 'Fecha de elaboración', styles: { fontStyle: 'bold' } },
        { content: fechaElaboracion },
        { content: 'Elaboró:', styles: { fontStyle: 'bold' } },
        { content: 'Cesar L. Soto Gonzalez' }
      ]
    ],
    theme: "grid",
    styles: { fontSize: 8 }
  });

  doc.addImage(logo, "PNG", 13, 13, 24, 24);

  // =========================
  // AGRUPAR EQUIPOS
  // =========================

  const mapa = {};

  data.forEach(item => {

    if (!mapa[item.identificador]) {
      mapa[item.identificador] = {
        marca: item.marca || "",
        modelo: item.modelo || "",
        usuario: item.usuario || "Sin usuario",
        meses: Array(12).fill(null)
      };
    }

    const dia = parseInt(item.fecha_programada.split("-")[2]);

    mapa[item.identificador].meses[item.mes - 1] = {
      estado: item.estado,
      dia: dia
    };
  });

  const equipos = Object.keys(mapa);

  let startY = doc.lastAutoTable.finalY + 10;

  // =========================
  // PAGINACION EQUIPOS
  // =========================

  for (let i = 0; i < equipos.length; i += equiposPorPagina) {

    const slice = equipos.slice(i, i + equiposPorPagina);

    const body = [];

    slice.forEach(eq => {

      const equipo = mapa[eq];

      const fila = [
        eq,
        (equipo.marca + " " + equipo.modelo).trim(),
        equipo.usuario
      ];

      equipo.meses.forEach(info => {

        let cell = {
          content: "",
          styles: {
            halign: "center",
            valign: "middle",
            lineWidth: 0.2,
            fontStyle: "bold"
          }
        };

        if (info) {

          cell.content = String(info.dia);

          if (info.estado === "Realizado") {
            cell.styles.fillColor = [34,197,94];
            cell.styles.textColor = 255;
          }

          if (info.estado === "Pendiente") {
            cell.styles.fillColor = [245,158,11];
            cell.styles.textColor = 0;
          }

          if (info.estado === "Cancelado") {
            cell.styles.fillColor = [239,68,68];
            cell.styles.textColor = 255;
          }

        }

        fila.push(cell);
      });

      body.push(fila);

    });

    doc.autoTable({
      startY: startY,
      head: [[
        "Equipo","Marca / Modelo","Usuario",
        "Ene","Feb","Mar","Abr","May","Jun",
        "Jul","Ago","Sep","Oct","Nov","Dic"
      ]],
      body: body,
      theme: "grid",
      styles: {
        fontSize: 7,
        halign: "center",
        valign: "middle",
        fillColor: false
      },
      columnStyles: {
        0: { halign: "left" },
        1: { halign: "left" },
        2: { halign: "left" }
      },
      headStyles: {
        fillColor: [15,23,42],
        textColor: 255
      }
    });

    if (i + equiposPorPagina < equipos.length) {
      doc.addPage();
      startY = 20;
    }

  }

  // =========================
  // MARCA DE AGUA TODAS PAGINAS
  // =========================

  const totalPages = doc.internal.getNumberOfPages();

  for (let i = 1; i <= totalPages; i++) {

    doc.setPage(i);

    doc.setGState(new doc.GState({ opacity: 0.05 }));

    doc.addImage(
      logo,
      "PNG",
      pageWidth / 2 - 70,
      pageHeight / 2 - 70,
      140,
      140
    );

    doc.setGState(new doc.GState({ opacity: 1 }));

    doc.setFontSize(8);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 40, pageHeight - 10);
  }

  // =========================
  // LEYENDA ULTIMA PAGINA
  // =========================

  doc.setPage(totalPages);

  let y = doc.lastAutoTable.finalY + 12;

  doc.setFontSize(9);
  doc.setFont(undefined, "bold");
  doc.text("Leyenda:", 15, y);

  y += 6;

  doc.setFillColor(34,197,94);
  doc.rect(15, y - 4, 6, 6, "F");
  doc.setFont(undefined, "normal");
  doc.text("Realizado", 24, y);

  y += 7;

  doc.setFillColor(245,158,11);
  doc.rect(15, y - 4, 6, 6, "F");
  doc.text("Pendiente", 24, y);

  y += 7;

  doc.setFillColor(239,68,68);
  doc.rect(15, y - 4, 6, 6, "F");
  doc.text("Cancelado", 24, y);

  y += 7;

  doc.text("Número dentro del cuadro = día programado del mantenimiento", 15, y);

  doc.save(`Programa_Anual_Mantenimiento_${anio}.pdf`);
}

function abrirModalCancelar(id) {

  mantenimientoCancelar = id;

  document.getElementById("motivoCancelacion").value = "";
  document.getElementById("modalCancelar").style.display = "flex";

}

function verMotivoCancelacion(motivo) {
  alert("Motivo de cancelación:\n\n" + motivo);
}