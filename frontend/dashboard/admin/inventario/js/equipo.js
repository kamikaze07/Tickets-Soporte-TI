document.addEventListener("DOMContentLoaded", () => {

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

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


