// sivic-app/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const testApiButton = document.getElementById('testApiButton');
    const apiResponseParagraph = document.getElementById('apiResponse');

    // Vistas
    const welcomeSection = document.getElementById('welcome-section');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');

    // Enlaces para cambiar de vista
    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');

    // Campo cédula para médicos
    const registerRoleSelect = document.getElementById('register-role');
    const cedulaContainer = document.getElementById('cedula-profesional-container');

    // Función para mostrar una vista y ocultar las otras
    function showView(viewToShow) {
        [welcomeSection, loginSection, registerSection].forEach(section => {
            if (section) section.style.display = 'none';
        });
        if (viewToShow && viewToShow) viewToShow.style.display = 'block';
    }

    // Mostrar vista de bienvenida por defecto
    // En una app real, verificarías si el usuario está logueado
    // y mostrarías el dashboard o el login.
    showView(welcomeSection); 
    // Para probar, puedes forzar la vista de login:
    // showView(loginSection);


    if (testApiButton) {
        testApiButton.addEventListener('click', async () => {
            apiResponseParagraph.textContent = 'Cargando...';
            apiResponseParagraph.className = ''; // Reset class
            try {
                const response = await fetch('http://localhost:3001/api/test');
                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
                }
                const data = await response.text();
                apiResponseParagraph.textContent = `Respuesta del Backend: ${data}`;
                apiResponseParagraph.classList.add('success');
            } catch (error) {
                console.error('Error al conectar con la API:', error);
                apiResponseParagraph.textContent = `Error: ${error.message}. Asegúrate que el servidor backend esté corriendo.`;
                apiResponseParagraph.classList.add('error');
            }
        });
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            showView(registerSection);
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showView(loginSection);
        });
    }

    if (registerRoleSelect && cedulaContainer) {
        registerRoleSelect.addEventListener('change', (e) => {
            if (e.target.value === 'Medico') {
                cedulaContainer.style.display = 'block';
            } else {
                cedulaContainer.style.display = 'none';
            }
        });
    }

    // --- Lógica de Formularios (Iteración 1) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Aquí irá la lógica para el login
            console.log('Login form submitted');
            // Validar campos, luego llamar a la API de login
            // Mostrar mensajes de éxito/error y validación visual
        });
    }

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // Aquí irá la lógica para el registro
            console.log('Register form submitted');
            // Validar campos, luego llamar a la API de registro
            // Mostrar mensajes de éxito/error y validación visual
        });
    }

    // Ejemplo de validación visual en tiempo real (muy básico)
    document.querySelectorAll('input[required]').forEach(input => {
        input.addEventListener('input', () => {
            if (input.checkValidity()) {
                input.classList.remove('invalid');
                input.classList.add('valid');
            } else {
                input.classList.remove('valid');
                input.classList.add('invalid');
            }
            // Para un mejor UX, la clase 'invalid' solo se añadiría después del primer intento de submit
            // o al perder el foco si el campo está vacío y es requerido.
        });
         // Inicialmente, no mostrar validación hasta que interactúe o intente enviar
        input.addEventListener('blur', () => {
            if (input.value !== '') { // Solo valida al salir si hay contenido
                 if (input.checkValidity()) {
                    input.classList.remove('invalid');
                    input.classList.add('valid');
                } else {
                    input.classList.remove('valid');
                    input.classList.add('invalid');
                }
            } else { // Si está vacío y es requerido, podría marcarse como inválido o esperar al submit
                input.classList.remove('valid');
                input.classList.remove('invalid');
            }
        });
    });


    console.log("SIVIC Frontend Inicializado y listo para estilos.");
});