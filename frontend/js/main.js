// frontend/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    // Selectores de Elementos (agrupados)
    const appView = document.getElementById('app-view');
    const welcomeSection = document.getElementById('welcome-section');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const profileSection = document.getElementById('profile-section');
    
    const userInfoDiv = document.getElementById('user-info');
    const logoutButton = document.getElementById('logout-button');
    const welcomeUserMessage = document.getElementById('welcome-user-message');
    const dashboardLinksDiv = document.getElementById('dashboard-links');

    const showRegisterLink = document.getElementById('show-register-link');
    const showLoginLink = document.getElementById('show-login-link');
    
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const profileForm = document.getElementById('profile-form');

    const registerRoleSelect = document.getElementById('register-role');
    const cedulaContainer = document.getElementById('cedula-profesional-container');
    
    const profileCedulaContainer = document.getElementById('profile-cedula-container');
    const profileEstadoValidacionContainer = document.getElementById('profile-estado-validacion-container');

    const testApiButton = document.getElementById('testApiButton');
    const apiResponseParagraph = document.getElementById('apiResponse');

    const API_BASE_URL = 'http://localhost:3001/api';

    // --- Almacenamiento de Sesión y Datos de Usuario ---
    let currentUserProfile = null;

    function saveToken(token) {
        localStorage.setItem('sivic_token', token);
    }

    function getToken() {
        return localStorage.getItem('sivic_token');
    }

    function removeToken() {
        localStorage.removeItem('sivic_token');
    }

    function saveUserProfile(profile) {
        currentUserProfile = profile;
    }

    function getUserProfile() {
        return currentUserProfile;
    }

    function clearUserProfile() {
        currentUserProfile = null;
    }

    // --- Actualización de UI ---
    function updateUIAfterLogin(profileData) {
        saveUserProfile(profileData);

        if (userInfoDiv) {
            userInfoDiv.innerHTML = `Hola, <strong>${profileData.nombre_completo || profileData.email}</strong> (${profileData.role}) 
                                     | <a href="#" id="show-profile-link">Mi Perfil</a>`;
            userInfoDiv.style.display = 'inline-block';
            
            const showProfileLinkElem = document.getElementById('show-profile-link');
            if(showProfileLinkElem) {
                showProfileLinkElem.addEventListener('click', (e) => {
                    e.preventDefault();
                    populateProfileForm(profileData);
                    showView('profile-section');
                });
            }
        }
        if (logoutButton) logoutButton.style.display = 'inline-block';
        
        if (welcomeUserMessage) welcomeUserMessage.textContent = `¡Bienvenido de nuevo, ${profileData.nombre_completo || profileData.email}!`;
        
        showView('welcome-section'); 
        if(loginSection) loginSection.style.display = 'none';
        if(registerSection) registerSection.style.display = 'none';

        if(showRegisterLink && showRegisterLink.parentElement) showRegisterLink.parentElement.style.display = 'none';
        if(showLoginLink && showLoginLink.parentElement) showLoginLink.parentElement.style.display = 'none';

        if(dashboardLinksDiv) dashboardLinksDiv.style.display = 'block';
    }

    function updateUIAfterLogout() {
        clearUserProfile();
        if (userInfoDiv) {
            userInfoDiv.innerHTML = '';
            userInfoDiv.style.display = 'none';
        }
        if (logoutButton) logoutButton.style.display = 'none';
        if (welcomeUserMessage) welcomeUserMessage.textContent = '';
        if(dashboardLinksDiv) dashboardLinksDiv.style.display = 'none';

        showView('login-section'); 
        if(showRegisterLink && showRegisterLink.parentElement) showRegisterLink.parentElement.style.display = 'block';
        if(showLoginLink && showLoginLink.parentElement) showLoginLink.parentElement.style.display = 'block';
    }

    // --- Función para mostrar vistas ---
    function showView(viewIdToShow) {
        if (appView) {
            Array.from(appView.children).forEach(section => {
                if (section.tagName === 'SECTION') {
                    section.style.display = 'none';
                }
            });
        }
        const viewToShowElement = document.getElementById(viewIdToShow);
        if (viewToShowElement) {
            viewToShowElement.style.display = 'block';
        }
    }

    // --- Lógica de Navegación Inicial y Links ---
    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            showView('register-section');
        });
    }
    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            showView('login-section');
        });
    }
    if (registerRoleSelect && cedulaContainer) {
        registerRoleSelect.addEventListener('change', (e) => {
            cedulaContainer.style.display = e.target.value === 'Medico' ? 'block' : 'none';
        });
        if (registerRoleSelect.value !== 'Medico') {
             cedulaContainer.style.display = 'none';
        }
    }
    
    // --- Test API Button ---
    if (testApiButton) {
        testApiButton.addEventListener('click', async () => {
            apiResponseParagraph.textContent = 'Cargando...';
            apiResponseParagraph.className = ''; 
            try {
                const response = await fetch(`${API_BASE_URL}/test`);
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


    // --- Lógica de Autenticación y Perfil ---
    async function fetchUserProfile(token) {
        const response = await fetch(`${API_BASE_URL}/profile/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: "Error al obtener perfil" }));
            throw new Error(errorData.error || `Error HTTP ${response.status} al obtener perfil`);
        }
        return await response.json();
    }
    
    async function checkLoginStatus() {
        const token = getToken();
        if (token) {
            try {
                const profileData = await fetchUserProfile(token);
                updateUIAfterLogin(profileData);
            } catch (error) {
                console.warn('Error al validar token/perfil:', error.message);
                removeToken();
                clearUserProfile();
                updateUIAfterLogout();
            }
        } else {
            updateUIAfterLogout();
        }
    }
    checkLoginStatus();

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const loginMessage = document.createElement('p');
            // Eliminar mensaje anterior si existe
            const oldMessage = loginForm.querySelector('.form-message');
            if (oldMessage) oldMessage.remove();
            loginMessage.className = 'form-message'; // Para poder seleccionarlo y quitarlo
            loginForm.appendChild(loginMessage);

            try {
                loginMessage.textContent = 'Iniciando sesión...';
                loginMessage.style.color = 'var(--dark-gray)';

                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.error || `Error HTTP: ${response.status}`);
                
                saveToken(data.session.access_token);
                const profileData = await fetchUserProfile(data.session.access_token);
                updateUIAfterLogin(profileData);

                loginMessage.textContent = '¡Login exitoso!';
                loginMessage.style.color = 'var(--seafoam-green)';
                setTimeout(() => loginMessage.remove(), 10000);
                loginForm.reset();
                document.querySelectorAll('#login-form input').forEach(input => input.classList.remove('valid', 'invalid'));


            } catch (error) {
                console.error('Error de login:', error);
                loginMessage.textContent = `Error: ${error.message}`;
                loginMessage.style.color = 'var(--poppy-red)';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre_completo = document.getElementById('register-nombre').value;
            const email = document.getElementById('register-email').value;
            const telefono = document.getElementById('register-telefono').value;
            const password = document.getElementById('register-password').value;
            const role = document.getElementById('register-role').value;
            const cedula_profesional_input = document.getElementById('register-cedula');
            
            const registerMessage = document.createElement('p');
            const oldMessage = registerForm.querySelector('.form-message');
            if (oldMessage) oldMessage.remove();
            registerMessage.className = 'form-message';
            registerForm.appendChild(registerMessage);

            const payload = { nombre_completo, email, telefono, password, role };
            if (role === 'Medico') {
                payload.cedula_profesional = cedula_profesional_input.value;
                if (!payload.cedula_profesional) {
                    registerMessage.textContent = 'Error: La cédula profesional es requerida para médicos.';
                    registerMessage.style.color = 'var(--poppy-red)';
                    return;
                }
            }

            try {
                registerMessage.textContent = 'Registrando...';
                registerMessage.style.color = 'var(--dark-gray)';
                
                // *** CORRECCIÓN AQUÍ ***
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST', // Asegurar que el método es POST
                    headers: {
                        'Content-Type': 'application/json' // Especificar el tipo de contenido
                    },
                    body: JSON.stringify(payload)
                });
                // *** FIN DE LA CORRECCIÓN ***

                const data = await response.json();
                if (!response.ok) throw new Error(data.error || `Error HTTP: ${response.status}`);

                registerMessage.textContent = data.message || '¡Registro exitoso! Por favor, inicia sesión.';
                registerMessage.style.color = 'var(--seafoam-green)';
                setTimeout(() => { 
                    registerMessage.remove(); 
                    showView('login-section'); 
                }, 10000);
                registerForm.reset();
                document.querySelectorAll('#register-form input').forEach(input => input.classList.remove('valid', 'invalid'));
                if(cedulaContainer) cedulaContainer.style.display = 'none';

            } catch (error) {
                console.error('Error de registro:', error);
                registerMessage.textContent = `Error: ${error.message}`;
                registerMessage.style.color = 'var(--poppy-red)';
            }
        });
    }
    
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            const token = getToken();
            try {
                await fetch(`${API_BASE_URL}/auth/logout`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error('Error llamando al endpoint de logout del backend (no crítico para el cliente):', error);
            } finally {
                removeToken();
                updateUIAfterLogout();
            }
        });
    }

    function populateProfileForm(profileData) {
        if (!profileForm || !profileData) return;

        document.getElementById('profile-nombre').value = profileData.nombre_completo || '';
        document.getElementById('profile-email').value = profileData.email || ''; // Usar el email del perfil si está, si no el de auth
        document.getElementById('profile-telefono').value = profileData.telefono || '';
        document.getElementById('profile-role').value = profileData.role || '';

        if (profileData.role === 'Medico') {
            if(profileCedulaContainer) profileCedulaContainer.style.display = 'block';
            if(profileEstadoValidacionContainer) profileEstadoValidacionContainer.style.display = 'block';
            // Asumimos que la cédula y estado_validacion están en el objeto profileData que viene del backend
            // Si `cedula_profesional` está en `perfiles_medicos` y no directamente en `profiles`,
            // el endpoint `/api/profile/me` del backend tendría que hacer un JOIN o una consulta adicional
            // para incluirla si se quiere mostrar/editar aquí. Por ahora, lo dejamos así.
            // document.getElementById('profile-cedula').value = profileData.cedula_profesional_de_perfiles_medicos || 'N/A'; 
            document.getElementById('profile-estado-validacion').value = profileData.estado_validacion || 'N/A';
        } else {
            if(profileCedulaContainer) profileCedulaContainer.style.display = 'none';
            if(profileEstadoValidacionContainer) profileEstadoValidacionContainer.style.display = 'none';
        }
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = getToken();
            if (!token) {
                alert('No estás autenticado.');
                showView('login-section');
                return;
            }

            const nombre_completo = document.getElementById('profile-nombre').value;
            const telefono = document.getElementById('profile-telefono').value;
            
            const profileMessage = document.createElement('p');
            const oldMessage = profileForm.querySelector('.form-message');
            if(oldMessage) oldMessage.remove();
            profileMessage.className = 'form-message';
            profileForm.appendChild(profileMessage);

            try {
                profileMessage.textContent = 'Actualizando perfil...';
                profileMessage.style.color = 'var(--dark-gray)';

                const response = await fetch(`${API_BASE_URL}/profile/me`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ nombre_completo, telefono })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || `Error HTTP: ${response.status}`);
                }
                
                profileMessage.textContent = '¡Perfil actualizado exitosamente!';
                profileMessage.style.color = 'var(--seafoam-green)';
                saveUserProfile(data.profile); 
                if (userInfoDiv) { 
                     userInfoDiv.innerHTML = `Hola, <strong>${data.profile.nombre_completo || data.profile.email}</strong> (${data.profile.role}) 
                                     | <a href="#" id="show-profile-link-updated">Mi Perfil</a>`;
                     const showProfileLinkUpdatedElem = document.getElementById('show-profile-link-updated');
                     if(showProfileLinkUpdatedElem) {
                        showProfileLinkUpdatedElem.addEventListener('click', (ev) => {
                            ev.preventDefault();
                            populateProfileForm(data.profile);
                            showView('profile-section');
                        });
                     }
                }
                setTimeout(() => profileMessage.remove(), 10000);

            } catch (error) {
                console.error('Error al actualizar perfil:', error);
                profileMessage.textContent = `Error: ${error.message}`;
                profileMessage.style.color = 'var(--poppy-red)';
            }
        });
    }

    document.querySelectorAll('input[required], input[type="email"]').forEach(input => {
        const validateInput = () => {
            let isValid = true;
            if (input.type === 'email') {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                isValid = emailRegex.test(input.value);
            } else if (input.hasAttribute('required')) {
                isValid = input.value.trim() !== '';
            }
            if (input.value.trim() === '' && !input.hasAttribute('required') && input.type !== 'email') {
                input.classList.remove('valid', 'invalid');
                return;
            }
            if (isValid) {
                input.classList.remove('invalid');
                input.classList.add('valid');
            } else {
                input.classList.remove('valid');
                input.classList.add('invalid');
            }
        };
        input.addEventListener('input', validateInput);
        input.addEventListener('blur', () => { 
            if (input.value.trim() !== '') {
                validateInput();
            } else { 
                 input.classList.remove('valid', 'invalid');
            }
        });
    });

    console.log("SIVIC Frontend con Autenticación y Perfil.");
});