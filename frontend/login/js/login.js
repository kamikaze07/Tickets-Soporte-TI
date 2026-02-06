document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("loginForm");
    const usuarioInput = document.getElementById("usuario");
    const passwordInput = document.getElementById("password");
    const errorMessage = document.getElementById("errorMessage");
    const loginButton = document.getElementById("loginButton");

    // 👇 ESTA ES LA CLAVE
    const BASE_URL = "/ticketssoporteti";

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        hideError();

        const usuario = usuarioInput.value.trim();
        const password = passwordInput.value.trim();

        if (!usuario || !password) {
            showError("Por favor ingresa usuario y contraseña");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/backend/auth/login.php`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ usuario, password })
            });

            // 👇 SIEMPRE leer el cuerpo
            const data = await response.json();

            if (!response.ok) {
                // Error controlado desde backend (401, 403, etc.)
                showError(data.message || "Error de autenticación");
                return;
            }

            if (data.success) {

                if (data.rol === "SUPER USUARIO") {
                    window.location.href = `${BASE_URL}/frontend/dashboard/admin/`;
                } else {
                    window.location.href = `${BASE_URL}/frontend/dashboard/usuario/`;
                }

                return;
            }

        } catch (error) {
            console.error("Error real:", error);
            showError("No se pudo conectar con el servidor");
        } finally {
            setLoading(false);
        }

    });

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = "block";
    }

    function hideError() {
        errorMessage.textContent = "";
        errorMessage.style.display = "none";
    }

    function setLoading(isLoading) {
        if (isLoading) {
            loginButton.disabled = true;
            loginButton.textContent = "Validando...";
        } else {
            loginButton.disabled = false;
            loginButton.textContent = "Iniciar sesión";
        }
    }
});
