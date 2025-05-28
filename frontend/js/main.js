// frontend/js/main.js
document.addEventListener('DOMContentLoaded', () => {
    const getElem = (id) => document.getElementById(id);

    const appView = getElem('app-view');
    const welcomeSection = getElem('welcome-section');
    const loginSection = getElem('login-section');
    const registerSection = getElem('register-section');
    const profileSection = getElem('profile-section');
    const agendarCitaSection = getElem('agendar-cita-section');
    const misCitasPacienteSection = getElem('mis-citas-paciente-section');
    const disponibilidadMedicoSection = getElem('disponibilidad-medico-section');
    const miAgendaMedicoSection = getElem('mi-agenda-medico-section');
    
    const userInfoDiv = getElem('user-info');
    const logoutButton = getElem('logout-button');
    const welcomeUserMessage = getElem('welcome-user-message');
    
    const dashboardLinksDiv = getElem('dashboard-links');
    const pacienteActionsDiv = getElem('paciente-actions');
    const medicoActionsDiv = getElem('medico-actions');
    const adminActionsDiv = getElem('admin-actions');

    const showRegisterLink = getElem('show-register-link');
    const showLoginLink = getElem('show-login-link');

    const showAgendarCitaBtn = getElem('show-agendar-cita-view-btn');
    const showMisCitasPacienteBtn = getElem('show-mis-citas-paciente-view-btn');
    
    const showMiAgendaMedicoBtn = getElem('show-mi-agenda-medico-view-btn');
    const showDisponibilidadMedicoBtn = getElem('show-disponibilidad-medico-view-btn');
    
    const backButtons = [
        getElem('back-to-welcome-btn'), getElem('back-to-welcome-from-agendar-btn'),
        getElem('back-to-welcome-from-miscitas-btn'), getElem('back-to-welcome-from-dispo-btn'),
        getElem('back-to-welcome-from-agenda-btn'),
    ].filter(Boolean);

    const loginForm = getElem('login-form');
    const registerForm = getElem('register-form');
    const profileForm = getElem('profile-form');
    const agendarCitaForm = getElem('agendar-cita-form');
    const disponibilidadMedicoForm = getElem('disponibilidad-medico-form');

    const registerRoleSelect = getElem('register-role');
    const cedulaContainer = getElem('cedula-profesional-container');
    const profileCedulaContainer = getElem('profile-cedula-container');
    const profileEstadoValidacionContainer = getElem('profile-estado-validacion-container');
    const selectMedicoParaCita = getElem('select-medico');
    const medicoDisponibilidadInfoDiv = getElem('medico-disponibilidad-info');
    const listaCitasPacienteDiv = getElem('lista-citas-paciente');
    const listaCitasMedicoDiv = getElem('lista-citas-medico');
    const limiteCitasDiariasInput = getElem('limite-citas-diarias');
    const horariosSemanalesContainer = getElem('horarios-semanales-container');

    const testApiButton = getElem('testApiButton');
    const apiResponseParagraph = getElem('apiResponse');

    const API_BASE_URL = 'http://localhost:3001/api';
    let currentUserProfile = null;
    const diasSemana = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

    function saveToken(token) { localStorage.setItem('sivic_token', token); }
    function getToken() { return localStorage.getItem('sivic_token'); }
    function removeToken() { localStorage.removeItem('sivic_token'); }
    function saveUserProfile(profile) { 
        console.log("SAVE_USER_PROFILE:", JSON.stringify(profile, null, 2));
        currentUserProfile = profile; 
    }
    function getUserProfile() { return currentUserProfile; }
    function clearUserProfile() { currentUserProfile = null; }

    function showView(viewIdToShow) {
        if (appView) {
            Array.from(appView.children).forEach(section => {
                if (section && section.tagName === 'SECTION') section.style.display = 'none';
            });
        }
        const viewToShowElement = getElem(viewIdToShow);
        if (viewToShowElement) viewToShowElement.style.display = 'block';
         else console.warn(`showView: Elemento con ID '${viewIdToShow}' no encontrado.`);
    }
    
    function setupUserNavigationEventListeners(profileDataForNav) {
        const showProfileLinkElem = getElem('show-profile-link');
        if(showProfileLinkElem) {
            showProfileLinkElem.onclick = (e) => {
                e.preventDefault();
                const currentProfile = profileDataForNav || getUserProfile();
                if (currentProfile) {
                    populateProfileForm(currentProfile);
                    showView('profile-section');
                } else {
                    console.warn("setupUserNavigationEventListeners: No hay perfil actual para mostrar.");
                    updateUIAfterLogout(); 
                }
            };
        }
        if (logoutButton) {
             logoutButton.onclick = async () => {
                const token = getToken();
                try { if(token) await fetchAPI('/auth/logout', { method: 'POST' }); }
                catch (error) { console.warn('Llamada a /api/auth/logout falló:', error.message); }
                finally { removeToken(); updateUIAfterLogout(); }
            };
        }
    }

    function updateUIAfterLogin(profileData) {
        console.log("UPDATE_UI_AFTER_LOGIN: Recibido profileData:", JSON.stringify(profileData, null, 2));
        if (!profileData || !profileData.role) { 
            console.error("UPDATE_UI_AFTER_LOGIN: profileData es nulo, indefinido, o no tiene 'role'. Forzando logout.");
            removeToken(); 
            clearUserProfile(); 
            updateUIAfterLogout(); 
            alert("Hubo un problema al cargar tu información de perfil. Por favor, intenta iniciar sesión nuevamente o contacta al administrador si el problema persiste.");
            return; 
        }

        saveUserProfile(profileData);
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `Hola, <strong>${profileData.nombre_completo || profileData.email}</strong> (${profileData.role}) 
                                     | <a href="#" id="show-profile-link" class="user-nav-link">Mi Perfil</a>`;
            userInfoDiv.style.display = 'inline-block';
        }
        if (logoutButton) logoutButton.style.display = 'inline-block';
        setupUserNavigationEventListeners(profileData);
        if (welcomeUserMessage) welcomeUserMessage.textContent = `¡Bienvenido de nuevo, ${profileData.nombre_completo || profileData.email}!`;
        
        if(pacienteActionsDiv) pacienteActionsDiv.style.display = profileData.role === 'Paciente' ? 'flex' : 'none';
        if(medicoActionsDiv) medicoActionsDiv.style.display = profileData.role === 'Medico' ? 'flex' : 'none';
        if(adminActionsDiv) adminActionsDiv.style.display = profileData.role === 'Admin' ? 'flex' : 'none';
        if(dashboardLinksDiv) dashboardLinksDiv.style.display = 'block';
        showView('welcome-section'); 
        if(loginSection) loginSection.style.display = 'none';
        if(registerSection) registerSection.style.display = 'none';
        if(showRegisterLink && showRegisterLink.parentElement) showRegisterLink.parentElement.style.display = 'none';
        if(showLoginLink && showLoginLink.parentElement) showLoginLink.parentElement.style.display = 'none';
    }

    function updateUIAfterLogout() {
        clearUserProfile();
        if (userInfoDiv) { userInfoDiv.innerHTML = ''; userInfoDiv.style.display = 'none'; }
        if (logoutButton) logoutButton.style.display = 'none';
        if (welcomeUserMessage) welcomeUserMessage.textContent = '';
        if(dashboardLinksDiv) dashboardLinksDiv.style.display = 'none';
        if(pacienteActionsDiv) pacienteActionsDiv.style.display = 'none';
        if(medicoActionsDiv) medicoActionsDiv.style.display = 'none';
        if(adminActionsDiv) adminActionsDiv.style.display = 'none';
        showView('login-section'); 
        if(showRegisterLink && showRegisterLink.parentElement) showRegisterLink.parentElement.style.display = 'block';
        if(showLoginLink && showLoginLink.parentElement) showLoginLink.parentElement.style.display = 'block';
    }

    async function fetchAPI(endpoint, options = {}) {
        const token = getToken();
        const headers = { 'Content-Type': 'application/json', ...options.headers };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            data = await response.json().catch(() => ({}));
        } else {
            data = await response.text().catch(() => "");
        }
        if (!response.ok) {
            const errorMessage = (typeof data === 'object' && data.error) ? data.error : 
                                 (typeof data === 'object' && data.message) ? data.message : 
                                 (typeof data === 'string' && data.length > 0 && data.length < 200) ? data :
                                 `Error HTTP ${response.status}: ${response.statusText}`;
            throw new Error(errorMessage);
        }
        return data;
    }

    async function fetchUserProfile() {
        console.log("FETCH_USER_PROFILE: Iniciando obtención de perfil desde API.");
        const token = getToken();
        if (!token) {
            console.log("FETCH_USER_PROFILE: No hay token, retornando null.");
            return null;
        }
        try { 
            const profile = await fetchAPI('/profile/me', {method: 'GET'});
            console.log("FETCH_USER_PROFILE: Respuesta CRUDA de /api/profile/me:", JSON.stringify(profile, null, 2));
            if (!profile || typeof profile.nombre_completo === 'undefined' || !profile.role) { 
                console.error("FETCH_USER_PROFILE: El perfil obtenido de la API es nulo, no tiene nombre_completo o no tiene rol.");
                return null; 
            }
            return profile;
        }
        catch (error) { 
            console.error("FETCH_USER_PROFILE: Error obteniendo perfil de API:", error.message);
            if (error.message.includes('401') || error.message.toLowerCase().includes('token inválido') || error.message.includes('404')) { 
                console.log("FETCH_USER_PROFILE: Error 401/404 o token inválido, procediendo a logout.");
                removeToken(); 
                clearUserProfile(); 
                updateUIAfterLogout(); 
            } 
            return null; 
        }
    }
    
    async function handleAuthRedirect() {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');
        let authRedirectProcessed = false;
        if (accessToken && (type === 'signup' || type === 'recovery' || !type )) {
            authRedirectProcessed = true; saveToken(accessToken);
            if (refreshToken) localStorage.setItem('sivic_refresh_token', refreshToken);
            if (window.history.replaceState) { const cleanURL = `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}`; window.history.replaceState({ path: cleanURL }, '', cleanURL); }
            else { window.location.hash = ''; }
            await checkLoginStatus(); 
        } else if (params.get('error_description')) {
            authRedirectProcessed = true; alert(`Error de autenticación: ${decodeURIComponent(params.get('error_description'))}`);
            if (window.history.replaceState) { const cleanURL = `${window.location.protocol}//${window.location.host}${window.location.pathname}${window.location.search}`; window.history.replaceState({ path: cleanURL }, '', cleanURL); } else { window.location.hash = ''; }
            updateUIAfterLogout();
        }
        if (!authRedirectProcessed) await checkLoginStatus();
    }
    
    async function checkLoginStatus() {
        console.log("CHECK_LOGIN_STATUS: Verificando estado de login.");
        const token = getToken();
        if (token) {
            const profileData = await fetchUserProfile(); 
            if (profileData) {
                console.log("CHECK_LOGIN_STATUS: Perfil válido encontrado, actualizando UI.");
                updateUIAfterLogin(profileData);
            } else { 
                console.log("CHECK_LOGIN_STATUS: fetchUserProfile devolvió null. Token podría ser inválido o perfil no encontrado/incompleto. Haciendo logout.");
                removeToken(); 
                clearUserProfile(); 
                updateUIAfterLogout(); 
            }
        } else {
            console.log("CHECK_LOGIN_STATUS: No hay token, UI de logout.");
            updateUIAfterLogout();
        }
    }
    
    handleAuthRedirect();

    if (showRegisterLink) showRegisterLink.addEventListener('click', (e) => { e.preventDefault(); showView('register-section'); });
    if (showLoginLink) showLoginLink.addEventListener('click', (e) => { e.preventDefault(); showView('login-section'); });
    if (registerRoleSelect && cedulaContainer) {
        registerRoleSelect.addEventListener('change', (e) => { cedulaContainer.style.display = e.target.value === 'Medico' ? 'block' : 'none'; });
        if (registerRoleSelect.value !== 'Medico') cedulaContainer.style.display = 'none';
    }
    
    if (testApiButton) {
        testApiButton.addEventListener('click', async () => {
            apiResponseParagraph.textContent = 'Cargando...'; apiResponseParagraph.className = ''; 
            try {
                const data = await fetchAPI('/test', {method: 'GET'});
                apiResponseParagraph.textContent = `Respuesta del Backend: ${data}`; apiResponseParagraph.classList.add('success');
            } catch (error) { apiResponseParagraph.textContent = `Error: ${error.message}.`; apiResponseParagraph.classList.add('error'); }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const emailInput = getElem('login-email');
            const passwordInput = getElem('login-password');
            const email = emailInput ? emailInput.value : '';
            const password = passwordInput ? passwordInput.value : '';
            let loginMessage = loginForm.querySelector('.form-message');
            if (!loginMessage) { loginMessage = document.createElement('p'); loginMessage.className = 'form-message'; loginForm.appendChild(loginMessage); }
            try {
                loginMessage.textContent = 'Iniciando sesión...'; loginMessage.style.color = 'var(--dark-gray)';
                const data = await fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
                saveToken(data.session.access_token);
                const profileData = await fetchUserProfile();
                updateUIAfterLogin(profileData); 
                if (getToken() && getUserProfile()) { 
                    loginMessage.textContent = '¡Login exitoso!'; 
                    loginMessage.style.color = 'var(--seafoam-green)';
                    setTimeout(() => { if (loginMessage.parentElement) loginMessage.remove(); }, 3000);
                    loginForm.reset();
                    document.querySelectorAll('#login-form input').forEach(input => input.classList.remove('valid', 'invalid'));
                } else if (!getToken()) {
                    if (loginMessage) loginMessage.style.display = 'none'; 
                }

            } catch (error) { 
                console.error('Error de login:', error); 
                loginMessage.textContent = `Error: ${error.message}`; 
                loginMessage.style.color = 'var(--poppy-red)'; 
                loginMessage.style.display = 'block';
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nombre_completo = getElem('register-nombre').value;
            const email = getElem('register-email').value;
            const telefono = getElem('register-telefono').value;
            const password = getElem('register-password').value;
            const role = getElem('register-role').value;
            const cedula_profesional_input = getElem('register-cedula');
            let registerMessage = registerForm.querySelector('.form-message');
            if(!registerMessage){ registerMessage = document.createElement('p'); registerMessage.className = 'form-message'; registerForm.appendChild(registerMessage); }
            const payload = { nombre_completo, email, telefono, password, role };
            if (role === 'Medico') {
                payload.cedula_profesional = cedula_profesional_input.value;
                if (!payload.cedula_profesional) { registerMessage.textContent = 'Error: La cédula profesional es requerida para médicos.'; registerMessage.style.color = 'var(--poppy-red)'; return; }
            }
            try {
                registerMessage.textContent = 'Registrando...'; registerMessage.style.color = 'var(--dark-gray)';
                const data = await fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(payload) });
                registerMessage.textContent = data.message || '¡Registro exitoso! Por favor, verifica tu correo e inicia sesión.'; registerMessage.style.color = 'var(--seafoam-green)';
                setTimeout(() => { if (registerMessage.parentElement) registerMessage.remove(); showView('login-section'); }, 30000); 
                registerForm.reset();
                document.querySelectorAll('#register-form input').forEach(input => input.classList.remove('valid', 'invalid'));
                if(cedulaContainer) cedulaContainer.style.display = 'none';
            } catch (error) { console.error('Error de registro:', error); registerMessage.textContent = `Error: ${error.message}`; registerMessage.style.color = 'var(--poppy-red)'; }
        });
    }
    
    function agregarRangoHorarioInput(diaId, rango = { inicio: "", fin: "" }) {
        const rangosDiv = getElem(`rangos-${diaId}`);
        if (!rangosDiv) return;

        const itemsActuales = rangosDiv.querySelectorAll('.rango-horario-item');
        if (itemsActuales.length >= 2) {
            const btnAnadirExistente = rangosDiv.querySelector('.btn-anadir-rango');
            if(btnAnadirExistente) btnAnadirExistente.disabled = true;
            return;
        }

        const nuevoRangoDiv = document.createElement('div');
        nuevoRangoDiv.className = 'rango-horario-item';
        
        const inputInicio = document.createElement('input'); 
        inputInicio.type = 'time'; 
        inputInicio.className = 'rango-inicio'; 
        inputInicio.value = rango.inicio || ""; 
        inputInicio.step = "3600"; 

        const inputFin = document.createElement('input'); 
        inputFin.type = 'time'; 
        inputFin.className = 'rango-fin'; 
        inputFin.value = rango.fin || ""; 
        inputFin.step = "3600"; 

        const btnEliminarRango = document.createElement('button'); 
        btnEliminarRango.type = 'button'; 
        btnEliminarRango.textContent = 'X'; 
        btnEliminarRango.className = 'btn-eliminar-rango danger';
        btnEliminarRango.style.marginLeft = '10px';

        btnEliminarRango.onclick = () => {
            nuevoRangoDiv.remove();
            const btnAnadir = rangosDiv.querySelector('.btn-anadir-rango');
            if (btnAnadir) btnAnadir.disabled = rangosDiv.querySelectorAll('.rango-horario-item').length >= 2;
        };
        
        nuevoRangoDiv.appendChild(document.createTextNode('De: ')); 
        nuevoRangoDiv.appendChild(inputInicio);
        nuevoRangoDiv.appendChild(document.createTextNode(' a: ')); 
        nuevoRangoDiv.appendChild(inputFin);
        nuevoRangoDiv.appendChild(btnEliminarRango); 
        
        const btnAnadir = rangosDiv.querySelector('.btn-anadir-rango');
        if (btnAnadir) {
            rangosDiv.insertBefore(nuevoRangoDiv, btnAnadir); 
            btnAnadir.disabled = rangosDiv.querySelectorAll('.rango-horario-item').length >= 2;
        } else {
            rangosDiv.appendChild(nuevoRangoDiv); 
        }
    }

    if (horariosSemanalesContainer) {
        diasSemana.forEach(dia => {
            const checkDia = getElem(`check-${dia}`);
            const rangosDiv = getElem(`rangos-${dia}`);
            
            if (rangosDiv && !rangosDiv.querySelector('.btn-anadir-rango')) {
                const btnAnadirRango = document.createElement('button');
                btnAnadirRango.type = 'button'; 
                btnAnadirRango.textContent = '+ Añadir Rango';
                btnAnadirRango.className = 'btn-anadir-rango button-link'; 
                btnAnadirRango.style.display = 'none';
                btnAnadirRango.style.marginTop = '5px';
                btnAnadirRango.onclick = () => { 
                    if (rangosDiv.querySelectorAll('.rango-horario-item').length < 2) {
                        agregarRangoHorarioInput(dia);
                        btnAnadirRango.disabled = rangosDiv.querySelectorAll('.rango-horario-item').length >= 2;
                    }
                };
                rangosDiv.appendChild(btnAnadirRango);
            }

            if (checkDia && rangosDiv) {
                checkDia.addEventListener('change', (e) => { 
                    const btn = rangosDiv.querySelector('.btn-anadir-rango');
                    const estaMarcado = e.target.checked;

                    rangosDiv.style.display = estaMarcado ? 'block' : 'none';
                    if (btn) {
                        btn.style.display = estaMarcado ? 'inline-block' : 'none';
                    }

                    if (estaMarcado) {
                        if (rangosDiv.querySelectorAll('.rango-horario-item').length === 0) {
                            agregarRangoHorarioInput(dia); 
                        }
                        if (btn) {
                            btn.disabled = rangosDiv.querySelectorAll('.rango-horario-item').length >= 2;
                        }
                    } else {
                        rangosDiv.querySelectorAll('.rango-horario-item').forEach(item => item.remove());
                        if (btn) btn.disabled = false; 
                    }
                });
            }
        });
    }

    async function cargarDisponibilidadMedicoActual() {
        console.log("CARGAR_DISPO: Paso 1 - Iniciando");
        let perfilActualEnMemoria = getUserProfile();
        console.log("CARGAR_DISPO: Paso 2 - Perfil en memoria:", JSON.stringify(perfilActualEnMemoria, null, 2));
    
        if (!perfilActualEnMemoria || perfilActualEnMemoria.role !== 'Medico' || !disponibilidadMedicoForm) {
            console.log("CARGAR_DISPO: Paso 2.1 - Perfil no válido o form no existe. Saliendo.");
            return;
        }
    
        let perfilAUsarParaUI = perfilActualEnMemoria; 
    
        const necesitaFetchFresco = !perfilActualEnMemoria.perfiles_medicos ||
                                   !perfilActualEnMemoria.perfiles_medicos[0] ||
                                   typeof perfilActualEnMemoria.perfiles_medicos[0].horarios_disponibles === 'undefined';
        
        console.log("CARGAR_DISPO: Paso 3 - ¿Necesita fetch fresco?", necesitaFetchFresco);
    
        if (necesitaFetchFresco) {
            try {
                console.log("CARGAR_DISPO: Paso 3.1 - Perfil incompleto, obteniendo perfil FRESCO...");
                const perfilFrescoObtenido = await fetchUserProfile(); 
                console.log("CARGAR_DISPO: Paso 4 - Perfil fresco obtenido:", JSON.stringify(perfilFrescoObtenido, null, 2));
                if (perfilFrescoObtenido) {
                    saveUserProfile(perfilFrescoObtenido); 
                    perfilAUsarParaUI = perfilFrescoObtenido; 
                } else {
                    console.warn("CARGAR_DISPO: Paso 4.1 - No se pudo obtener perfil fresco. Usando perfil en memoria (podría estar incompleto).");
                }
            } catch (error) {
                console.error("CARGAR_DISPO: Paso 4.2 - Error obteniendo perfil fresco:", error);
            }
        }
        
        console.log("CARGAR_DISPO: Paso 5 - Perfil A USAR para UI:", JSON.stringify(perfilAUsarParaUI, null, 2));
        
        const perfilMedicoAnidado = perfilAUsarParaUI.perfiles_medicos?.[0] || {};
        const horariosGuardados = perfilMedicoAnidado.horarios_disponibles || {};
    
        console.log("CARGAR_DISPO: Paso 5.1 - perfilMedicoAnidado para UI:", JSON.stringify(perfilMedicoAnidado, null, 2));
        console.log("CARGAR_DISPO: Paso 5.2 - horariosGuardados para UI:", JSON.stringify(horariosGuardados, null, 2));
    
        if(limiteCitasDiariasInput) {
            limiteCitasDiariasInput.value = perfilMedicoAnidado.limite_citas_diarias ?? 10;
        }
    
        diasSemana.forEach(dia => {
            const checkDiaElem = getElem(`check-${dia}`); 
            const rangosDivElem = getElem(`rangos-${dia}`); 
            const btnAnadirRangoElem = rangosDivElem ? rangosDivElem.querySelector('.btn-anadir-rango') : null;

            if (!checkDiaElem || !rangosDivElem || !btnAnadirRangoElem) {
                console.warn(`CARGAR_DISPO: Elementos faltantes para el día ${dia}`);
                return; 
            }

            rangosDivElem.querySelectorAll('.rango-horario-item').forEach(item => item.remove());
            checkDiaElem.checked = false;
            rangosDivElem.style.display = 'none';
            btnAnadirRangoElem.style.display = 'none';
            btnAnadirRangoElem.disabled = false;

            const horariosDelDiaGuardados = horariosGuardados[dia];
            if (horariosDelDiaGuardados && Array.isArray(horariosDelDiaGuardados) && horariosDelDiaGuardados.length > 0) {
                checkDiaElem.checked = true; 
                rangosDivElem.style.display = 'block'; 
                btnAnadirRangoElem.style.display = 'inline-block';
                
                horariosDelDiaGuardados.slice(0, 2).forEach(rangoStr => { 
                    if (typeof rangoStr === 'string' && rangoStr.includes('-')) {
                        const [inicio, fin] = rangoStr.split('-'); 
                        agregarRangoHorarioInput(dia, { inicio, fin }); 
                    }
                });
                btnAnadirRangoElem.disabled = rangosDivElem.querySelectorAll('.rango-horario-item').length >= 2;
            }
        });
        console.log("CARGAR_DISPO: Paso 6 - UI (re)poblada.");
    }
    
    if (disponibilidadMedicoForm) {
        disponibilidadMedicoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const limite_citas_diarias_val = limiteCitasDiariasInput ? parseInt(limiteCitasDiariasInput.value, 10) : undefined;
            const horarios_disponibles = {}; 
            let errorEnHorarios = false;

            diasSemana.forEach(dia => {
                if(errorEnHorarios) return; 
                const checkDia = getElem(`check-${dia}`);
                if (checkDia && checkDia.checked) {
                    const rangosItems = document.querySelectorAll(`#rangos-${dia} .rango-horario-item`);
                    if (rangosItems.length === 0) { 
                        alert(`Por favor, añada al menos un rango horario para ${dia.charAt(0).toUpperCase() + dia.slice(1)} o desmárquelo si no estará disponible.`); 
                        errorEnHorarios = true; 
                        return; 
                    }
                    
                    const rangosParaDia = [];
                    for (const item of rangosItems) { 
                        if(errorEnHorarios) break; 
                        const inicioInput = item.querySelector('.rango-inicio'); 
                        const finInput = item.querySelector('.rango-fin');
                        const inicio = inicioInput ? inicioInput.value : ''; 
                        const fin = finInput ? finInput.value : '';

                        if (inicio && fin) { 
                            if (inicio >= fin) { 
                                alert(`En ${dia.charAt(0).toUpperCase() + dia.slice(1)}, la hora de inicio (${inicio}) debe ser anterior a la hora de fin (${fin}).`); 
                                errorEnHorarios = true; break; 
                            } 
                            rangosParaDia.push(`${inicio}-${fin}`); 
                        } else if (inicio || fin) { 
                            alert(`En ${dia.charAt(0).toUpperCase() + dia.slice(1)}, por favor complete ambas horas (inicio y fin) para el rango o elimínelo.`); 
                            errorEnHorarios = true; break; 
                        }
                    }
                    if(errorEnHorarios) return; 
                    if (rangosParaDia.length > 0) horarios_disponibles[dia] = rangosParaDia;
                }
            });

            if(errorEnHorarios) return;

            let dispoMessage = disponibilidadMedicoForm.querySelector('.form-message');
            if (!dispoMessage) { dispoMessage = document.createElement('p'); dispoMessage.className = 'form-message'; disponibilidadMedicoForm.appendChild(dispoMessage); }
            
            const submitButtonDispo = disponibilidadMedicoForm.querySelector('button[type="submit"]');
            if(submitButtonDispo) submitButtonDispo.disabled = true;
            dispoMessage.textContent = 'Actualizando disponibilidad...'; 
            dispoMessage.style.color = 'var(--dark-gray)';

            try {
                const payload = {};
                if (limite_citas_diarias_val !== undefined && !isNaN(limite_citas_diarias_val) && limite_citas_diarias_val >=0) {
                    payload.limite_citas_diarias = limite_citas_diarias_val;
                } else if (typeof limite_citas_diarias_val === 'number' && limite_citas_diarias_val < 0) { 
                    alert("El límite de citas diarias no puede ser negativo.");
                    dispoMessage.textContent = 'Error: Límite de citas inválido.'; dispoMessage.style.color = 'var(--poppy-red)';
                    if(submitButtonDispo) submitButtonDispo.disabled = false;
                    return;
                }

                payload.horarios_disponibles = horarios_disponibles;
                
                console.log("SUBMIT_DISPO: Enviando payload:", JSON.stringify(payload, null, 2));

                const data = await fetchAPI('/medicos/me/disponibilidad', { method: 'PUT', body: JSON.stringify(payload) });
                dispoMessage.textContent = data.message || '¡Disponibilidad actualizada exitosamente!'; 
                dispoMessage.style.color = 'var(--seafoam-green)';
                
                const updatedProfile = await fetchUserProfile(); 
                if(updatedProfile) {
                    saveUserProfile(updatedProfile); 
                    console.log("SUBMIT_DISPO: Perfil actualizado en memoria después de guardar.");
                } else {
                    console.warn("SUBMIT_DISPO: No se pudo obtener el perfil actualizado después de guardar.");
                }

                setTimeout(() => { if(dispoMessage.parentElement) dispoMessage.remove(); }, 3000);
            } catch (error) { 
                console.error("SUBMIT_DISPO: Error al actualizar disponibilidad:", error);
                dispoMessage.textContent = `Error al actualizar: ${error.message}`; 
                dispoMessage.style.color = 'var(--poppy-red)'; 
            } finally {
                if(submitButtonDispo) submitButtonDispo.disabled = false;
            }
        });
    }
    
    function populateProfileForm(profileData) {
        if (!profileForm || !profileData) return;
        getElem('profile-nombre').value = profileData.nombre_completo || '';
        getElem('profile-email').value = profileData.email || '';
        getElem('profile-telefono').value = profileData.telefono || '';
        getElem('profile-role').value = profileData.role || '';
        const esMedico = profileData.role === 'Medico';
        if(profileCedulaContainer) profileCedulaContainer.style.display = esMedico ? 'block' : 'none';
        if(profileEstadoValidacionContainer) profileEstadoValidacionContainer.style.display = esMedico ? 'block' : 'none';
        if (esMedico) {
            const perfilMedicoAnidado = profileData.perfiles_medicos?.[0]; 
            getElem('profile-cedula').value = perfilMedicoAnidado?.cedula_profesional || 'No disponible'; 
            getElem('profile-estado-validacion').value = profileData.estado_validacion || 'N/A';
        }
    }

    if (profileForm) {
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!getToken()) { showView('login-section'); return; }
            const nombre_completo = getElem('profile-nombre').value;
            const telefono = getElem('profile-telefono').value;
            let profileMessage = profileForm.querySelector('.form-message');
            if(!profileMessage){ profileMessage = document.createElement('p'); profileMessage.className = 'form-message'; profileForm.appendChild(profileMessage); }
            try {
                profileMessage.textContent = 'Actualizando perfil...'; profileMessage.style.color = 'var(--dark-gray)';
                const data = await fetchAPI('/profile/me', { method: 'PUT', body: JSON.stringify({ nombre_completo, telefono }) });
                profileMessage.textContent = '¡Perfil actualizado!'; profileMessage.style.color = 'var(--seafoam-green)';
                saveUserProfile(data.profile); 
                if (userInfoDiv) { 
                     userInfoDiv.innerHTML = `Hola, <strong>${data.profile.nombre_completo || data.profile.email}</strong> (${data.profile.role}) 
                                     | <a href="#" id="show-profile-link-updated" class="user-nav-link">Mi Perfil</a>`;
                     const showProfileLinkUpdatedElem = getElem('show-profile-link-updated');
                     if(showProfileLinkUpdatedElem) {
                        showProfileLinkUpdatedElem.onclick = (ev) => {
                            ev.preventDefault();
                            populateProfileForm(getUserProfile());
                            showView('profile-section');
                        };
                     }
                }
                setTimeout(() => { if (profileMessage.parentElement) profileMessage.remove(); }, 3000);
            } catch (error) { console.error('Error al actualizar perfil:', error); profileMessage.textContent = `Error: ${error.message}`; profileMessage.style.color = 'var(--poppy-red)'; }
        });
    }
    
    async function cargarMedicosParaSelect() {
        if (!selectMedicoParaCita) return;
        selectMedicoParaCita.innerHTML = '<option value="">Cargando médicos...</option>';
        selectMedicoParaCita.disabled = true;
        if(medicoDisponibilidadInfoDiv) medicoDisponibilidadInfoDiv.innerHTML = ''; 
        try {
            console.log("CARGAR_MEDICOS: Solicitando lista de médicos.");
            const medicos = await fetchAPI('/medicos', {method: 'GET'});
            console.log("CARGAR_MEDICOS: Médicos recibidos:", medicos);
            selectMedicoParaCita.innerHTML = '<option value="">Seleccione un médico</option>';
            if (medicos && medicos.length > 0) {
                medicos.forEach(medico => {
                    const option = document.createElement('option');
                    option.value = medico.id; 
                    option.textContent = `${medico.nombre_completo} (Cédula: ${medico.perfiles_medicos?.cedula_profesional || 'N/A'})`;
                    option.dataset.horarios = JSON.stringify(medico.perfiles_medicos?.horarios_disponibles || {});
                    option.dataset.limiteCitas = medico.perfiles_medicos?.limite_citas_diarias ?? 'N/A';
                    selectMedicoParaCita.appendChild(option);
                });
            } else {
                 selectMedicoParaCita.innerHTML = '<option value="">No hay médicos disponibles en este momento</option>';
            }
        } catch (error) { 
            selectMedicoParaCita.innerHTML = '<option value="">Error al cargar médicos</option>'; 
            console.error("CARGAR_MEDICOS: Error cargando médicos para select:", error); 
            if(medicoDisponibilidadInfoDiv) medicoDisponibilidadInfoDiv.innerHTML = `<p class="form-message" style="color:var(--poppy-red)">Error al cargar la lista de médicos: ${error.message}</p>`;
        } finally {
            selectMedicoParaCita.disabled = false;
        }
    }
    
    if (selectMedicoParaCita && medicoDisponibilidadInfoDiv) {
        selectMedicoParaCita.addEventListener('change', (e) => {
            const selectedOption = e.target.selectedOptions[0];
            medicoDisponibilidadInfoDiv.innerHTML = ''; 
            if (selectedOption && selectedOption.value && selectedOption.dataset.horarios) {
                try {
                    const horarios = JSON.parse(selectedOption.dataset.horarios);
                    const limiteCitas = selectedOption.dataset.limiteCitas;
                    let html = '<h4>Disponibilidad Configurada del Médico:</h4>';
                    if (limiteCitas !== 'N/A') {
                        html += `<p>Este médico atiende un máximo de <strong>${limiteCitas}</strong> citas por día.</p>`;
                    } else {
                        html += `<p>Límite de citas diarias no especificado por el médico.</p>`;
                    }
                    html += '<ul>';
                    let tieneHorariosDefinidos = false;
                    diasSemana.forEach(dia => { 
                        if (horarios[dia] && horarios[dia].length > 0) {
                            html += `<li><strong>${dia.charAt(0).toUpperCase() + dia.slice(1)}:</strong> ${horarios[dia].join(' | ')}</li>`;
                            tieneHorariosDefinidos = true;
                        }
                    });
                    if (!tieneHorariosDefinidos) {
                        html += '<li>Este médico no ha especificado sus horarios de atención semanales.</li>';
                    }
                    html += '</ul>'; 
                    medicoDisponibilidadInfoDiv.innerHTML = html;
                } catch (parseError) { 
                    console.error("Error al parsear horarios del médico:", parseError)
                    medicoDisponibilidadInfoDiv.textContent = 'No se pudo mostrar la disponibilidad del médico debido a un error.'; 
                }
            }
        });
    }

    if (agendarCitaForm) {
        agendarCitaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log("AGENDAR_CITA_FORM: Submit iniciado.");

            const medico_id = selectMedicoParaCita.value;
            const fecha_cita_val = getElem('fecha-cita').value;
            const hora_cita_val = getElem('hora-cita').value;

            if (!medico_id) { alert('Por favor, seleccione un médico.'); return; }
            if (!fecha_cita_val) { alert('Por favor, seleccione una fecha para la cita.'); return; }
            if (!hora_cita_val) { alert('Por favor, seleccione una hora para la cita.'); return; }
            
            const fechaSeleccionada = new Date(fecha_cita_val + 'T00:00:00'); 
            const hoy = new Date();
            hoy.setHours(0,0,0,0); 
            if (fechaSeleccionada < hoy) {
                alert('No puedes seleccionar una fecha en el pasado para la cita.');
                return;
            }

            const fecha_hora_cita = `${fecha_cita_val}T${hora_cita_val}:00`; 
            console.log("AGENDAR_CITA_FORM: Payload a enviar - medico_id:", medico_id, "fecha_hora_cita:", fecha_hora_cita);

            let agendarMessage = agendarCitaForm.querySelector('.form-message');
            if (!agendarMessage) { 
                agendarMessage = document.createElement('p'); 
                agendarMessage.className = 'form-message'; 
                const submitButtonContainer = agendarCitaForm.querySelector('button[type="submit"]').parentElement || agendarCitaForm;
                submitButtonContainer.insertBefore(agendarMessage, agendarCitaForm.querySelector('button[type="submit"]'));
            }
            
            const submitButton = agendarCitaForm.querySelector('button[type="submit"]');
            if(submitButton) submitButton.disabled = true;
            agendarMessage.textContent = 'Agendando cita, por favor espere...';
            agendarMessage.style.color = 'var(--dark-gray)';
            agendarMessage.style.display = 'block';


            try {
                const data = await fetchAPI('/citas', { method: 'POST', body: JSON.stringify({ medico_id, fecha_hora_cita }) });
                console.log("AGENDAR_CITA_FORM: Respuesta del backend:", data);
                agendarMessage.textContent = data.message || '¡Cita agendada exitosamente!'; 
                agendarMessage.style.color = 'var(--seafoam-green)';
                
                agendarCitaForm.reset(); 
                if(medicoDisponibilidadInfoDiv) medicoDisponibilidadInfoDiv.innerHTML = '';
                if(selectMedicoParaCita) selectMedicoParaCita.value = ""; 
                
                setTimeout(() => { 
                    if(agendarMessage) agendarMessage.style.display = 'none'; 
                    showView('mis-citas-paciente-section'); 
                    cargarMisCitasPaciente(); 
                }, 2500); 

            } catch (error) { 
                console.error("AGENDAR_CITA_FORM: Error al agendar:", error);
                agendarMessage.textContent = `Error al agendar la cita: ${error.message}`; 
                agendarMessage.style.color = 'var(--poppy-red)'; 
            } finally {
                if(submitButton) submitButton.disabled = false;
            }
        });
    }

    async function cargarMisCitasPaciente() {
        if (!listaCitasPacienteDiv) return;
        listaCitasPacienteDiv.innerHTML = '<p>Cargando tus citas...</p>';
        console.log("CARGAR_MIS_CITAS_PACIENTE: Solicitando citas.");
        try {
            const citas = await fetchAPI('/citas/paciente/me', {method: 'GET'});
            console.log("CARGAR_MIS_CITAS_PACIENTE: Citas recibidas:", citas);
            if (!citas || citas.length === 0) { 
                listaCitasPacienteDiv.innerHTML = '<p>No tienes citas programadas.</p>'; 
                return; 
            }
            let html = '';
            const ahora = new Date(); 

            citas.forEach(cita => {
                const fechaCitaObj = new Date(cita.fecha_hora_cita);
                const puedeCancelar = (cita.estado_cita === 'Programada' || cita.estado_cita === 'Confirmada') && 
                                   ( (fechaCitaObj.getTime() - ahora.getTime()) / (1000 * 60 * 60) > 2 ); 

                html += `<div class="card cita-card">
                            <h3>Cita con Dr(a). ${cita.medico?.nombre_completo || 'Desconocido'}</h3>
                            <p><strong>Fecha y Hora:</strong> ${fechaCitaObj.toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</p>
                            <p><strong>Estado:</strong> ${cita.estado_cita}</p>
                            ${cita.estado_cita === 'Completada' && cita.notas_diagnostico ? `<p><strong>Notas del Médico:</strong> ${cita.notas_diagnostico}</p>` : ''}
                            ${puedeCancelar ? `<button class="button-link danger btn-cancelar-cita" data-cita-id="${cita.cita_id}" style="margin-top:10px;">Cancelar Cita</button>` : ''}
                         </div>`;
            });
            listaCitasPacienteDiv.innerHTML = html;

            document.querySelectorAll('.btn-cancelar-cita').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const citaId = e.target.dataset.citaId;
                    console.log(`CANCELAR_CITA_PACIENTE: Intentando cancelar cita ID: ${citaId}`);
                    if (confirm('¿Está seguro que desea cancelar esta cita? Recuerde que no podrá cancelar con menos de 2 horas de antelación.')) {
                        btn.disabled = true; 
                        btn.textContent = "Cancelando...";
                        try { 
                            const data = await fetchAPI(`/citas/${citaId}/cancelar`, { method: 'PUT' }); 
                            console.log(`CANCELAR_CITA_PACIENTE: Respuesta de cancelación para cita ID ${citaId}:`, data);
                            alert(data.message || 'Cita cancelada exitosamente.'); 
                            cargarMisCitasPaciente(); 
                        }
                        catch (error) { 
                            console.error(`CANCELAR_CITA_PACIENTE: Error al cancelar cita ID ${citaId}:`, error);
                            alert(`Error al cancelar la cita: ${error.message}`); 
                            btn.disabled = false; 
                            btn.textContent = "Cancelar Cita";
                        }
                    }
                });
            });
        } catch (error) { 
            console.error("CARGAR_MIS_CITAS_PACIENTE: Error general al cargar citas:", error);
            listaCitasPacienteDiv.innerHTML = `<p class="form-message" style="color:var(--poppy-red);">Error al cargar tus citas: ${error.message}</p>`; 
        }
    }

    async function cargarMiAgendaMedico() {
        if (!listaCitasMedicoDiv) return;
        listaCitasMedicoDiv.innerHTML = '<p>Cargando tu agenda...</p>';
        console.log("CARGAR_MI_AGENDA_MEDICO: Solicitando agenda.");
        try {
            const citas = await fetchAPI('/citas/medico/me', {method: 'GET'});
            console.log("CARGAR_MI_AGENDA_MEDICO: Agenda recibida:", citas);
            if (!citas || citas.length === 0) { 
                listaCitasMedicoDiv.innerHTML = '<p>No tienes citas en tu agenda.</p>'; 
                return; 
            }
            let html = '';
            citas.forEach(cita => {
                const puedeModificarEstado = !['Completada', 'Cancelada_Paciente', 'Cancelada_Medico'].includes(cita.estado_cita);
                html += `<div class="card cita-card" id="card-cita-medico-${cita.cita_id}">
                            <h3>Cita con ${cita.paciente?.nombre_completo || 'Paciente Desconocido'}</h3>
                            <p><strong>Fecha y Hora:</strong> ${new Date(cita.fecha_hora_cita).toLocaleString('es-ES', { dateStyle: 'long', timeStyle: 'short' })}</p>
                            <p><strong>Tel. Paciente:</strong> ${cita.paciente?.telefono || 'N/A'}</p>
                            <p><strong>Estado Actual:</strong> <span id="estado-cita-${cita.cita_id}">${cita.estado_cita}</span></p>
                            <div id="notas-container-cita-${cita.cita_id}" class="notas-diagnostico-container">
                                ${cita.notas_diagnostico ? `<p><strong>Notas de Diagnóstico:</strong> <span id="notas-texto-cita-${cita.cita_id}">${cita.notas_diagnostico}</span></p>`: ''}
                            </div>
                            ${puedeModificarEstado ? 
                                `<div class="cita-acciones mt-1" id="acciones-cita-medico-${cita.cita_id}">
                                    <label for="select-estado-${cita.cita_id}" style="font-size:0.9em; margin-bottom:3px;">Nuevo Estado:</label>
                                    <select class="select-estado-cita" id="select-estado-${cita.cita_id}" data-cita-id="${cita.cita_id}">
                                        <option value="">-- Seleccionar --</option>
                                        <option value="Confirmada" ${cita.estado_cita === 'Confirmada' ? 'disabled' : ''}>Confirmada</option>
                                        <option value="Completada">Completada</option>
                                        <option value="Cancelada_Medico">Cancelada por Médico</option>
                                    </select>
                                    <label for="input-notas-${cita.cita_id}" style="font-size:0.9em; margin-top:10px; margin-bottom:3px; display:none;" class="label-notas-diagnostico">Notas (si se completa la cita):</label>
                                    <textarea class="input-notas-diagnostico" id="input-notas-${cita.cita_id}" data-cita-id="${cita.cita_id}" placeholder="Añadir notas de diagnóstico..." style="display:none; width:100%; margin-top:5px; min-height:60px;">${cita.notas_diagnostico || ''}</textarea>
                                    <button class="button-link btn-actualizar-estado-cita" data-cita-id="${cita.cita_id}" style="margin-top:10px;">Actualizar Estado</button>
                                 </div>` : ''}
                         </div>`;
            });
            listaCitasMedicoDiv.innerHTML = html;

            document.querySelectorAll('.select-estado-cita').forEach(select => {
                select.addEventListener('change', (e) => {
                    const citaId = e.target.dataset.citaId;
                    const inputNotas = getElem(`input-notas-${citaId}`);
                    const labelNotas = select.closest('.cita-acciones').querySelector(`.label-notas-diagnostico`);
                    if (inputNotas && labelNotas) {
                        const mostrar = e.target.value === 'Completada';
                        inputNotas.style.display = mostrar ? 'block' : 'none';
                        labelNotas.style.display = mostrar ? 'block' : 'none';
                    }
                });
                if (select.value === 'Completada') { // Simular change si el estado inicial es Completada para mostrar el textarea
                    select.dispatchEvent(new Event('change'));
                } else { // Asegurarse que el textarea de notas esté oculto si no es 'Completada'
                    const citaId = select.dataset.citaId;
                    const inputNotas = getElem(`input-notas-${citaId}`);
                    const labelNotas = select.closest('.cita-acciones').querySelector(`.label-notas-diagnostico`);
                     if (inputNotas && labelNotas && select.value !== 'Completada') {
                        inputNotas.style.display = 'none';
                        labelNotas.style.display = 'none';
                    }
                }
            });

            document.querySelectorAll('.btn-actualizar-estado-cita').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const citaId = e.target.dataset.citaId;
                    const selectEstado = getElem(`select-estado-${citaId}`);
                    const nuevoEstado = selectEstado.value;
                    const inputNotasElem = getElem(`input-notas-${citaId}`);
                    const notas = inputNotasElem ? inputNotasElem.value.trim() : ""; 

                    if (!nuevoEstado) { 
                        alert('Por favor, seleccione un nuevo estado para la cita.'); 
                        return; 
                    }
                    
                    const payload = { estado_cita: nuevoEstado };
                    if (nuevoEstado === 'Completada') {
                         payload.notas_diagnostico = notas; 
                    }
                    
                    console.log(`ACTUALIZAR_ESTADO_CITA: ID: ${citaId}, Payload:`, JSON.stringify(payload));
                    btn.disabled = true; 
                    btn.textContent = "Actualizando...";

                    try {
                        const data = await fetchAPI(`/citas/${citaId}/estado`, { method: 'PUT', body: JSON.stringify(payload) });
                        console.log(`ACTUALIZAR_ESTADO_CITA: Respuesta para ID ${citaId}:`, data);
                        alert('Estado de la cita actualizado correctamente.');
                        
                        const citaActualizada = data.cita;
                        const estadoSpan = getElem(`estado-cita-${citaId}`);
                        if (estadoSpan) estadoSpan.textContent = citaActualizada.estado_cita;
                        
                        const notasContainer = getElem(`notas-container-cita-${citaId}`);
                        if(notasContainer) {
                            if(citaActualizada.notas_diagnostico && citaActualizada.notas_diagnostico.trim() !== '') {
                                notasContainer.innerHTML = `<p><strong>Notas de Diagnóstico:</strong> <span id="notas-texto-cita-${citaId}">${citaActualizada.notas_diagnostico}</span></p>`;
                            } else {
                                notasContainer.innerHTML = ''; 
                            }
                        }
                        
                        if(['Completada', 'Cancelada_Medico', 'Cancelada_Paciente'].includes(citaActualizada.estado_cita)) {
                            const accionesDiv = btn.closest('.cita-acciones');
                            if(accionesDiv) accionesDiv.remove();
                        } else {
                            selectEstado.value = ""; 
                            if(inputNotasElem) { 
                                inputNotasElem.value = citaActualizada.notas_diagnostico || ''; 
                                inputNotasElem.style.display = 'none';
                            }
                            const labelNotas = selectEstado.closest('.cita-acciones').querySelector(`.label-notas-diagnostico`);
                            if(labelNotas) labelNotas.style.display = 'none';
                        }

                    } catch (error) { 
                        console.error(`ACTUALIZAR_ESTADO_CITA: Error para ID ${citaId}:`, error);
                        alert(`Error al actualizar estado de la cita: ${error.message}`); 
                    } finally {
                        const currentButton = btn; 
                        if(currentButton && currentButton.parentElement) { 
                           currentButton.disabled = false; 
                           currentButton.textContent = "Actualizar Estado";
                        }
                    }
                });
            });
        } catch (error) { 
            console.error("CARGAR_MI_AGENDA_MEDICO: Error general al cargar agenda:", error);
            listaCitasMedicoDiv.innerHTML = `<p class="form-message" style="color:var(--poppy-red);">Error al cargar tu agenda: ${error.message}</p>`;
        }
    }
    
    if (showAgendarCitaBtn) {
        showAgendarCitaBtn.addEventListener('click', () => { 
            console.log("SHOW_AGENDAR_CITA: Botón presionado.");
            cargarMedicosParaSelect(); 
            showView('agendar-cita-section'); 
        });
    } else {
        console.warn("Elemento con ID 'show-agendar-cita-view-btn' no encontrado.");
    }

    if (showMisCitasPacienteBtn) {
        showMisCitasPacienteBtn.addEventListener('click', () => { 
            console.log("SHOW_MIS_CITAS_PACIENTE: Botón presionado.");
            cargarMisCitasPaciente(); 
            showView('mis-citas-paciente-section'); 
        });
    } else {
        console.warn("Elemento con ID 'show-mis-citas-paciente-view-btn' no encontrado.");
    }

    if (showMiAgendaMedicoBtn) showMiAgendaMedicoBtn.addEventListener('click', () => { 
        console.log("SHOW_MI_AGENDA_MEDICO: Botón presionado.");
        cargarMiAgendaMedico(); 
        showView('mi-agenda-medico-section'); 
    });
    if (showDisponibilidadMedicoBtn) showDisponibilidadMedicoBtn.addEventListener('click', () => { 
        console.log("SHOW_DISPONIBILIDAD_MEDICO: Botón presionado. Perfil ANTES de llamar a cargar:", JSON.stringify(getUserProfile(), null, 2));
        cargarDisponibilidadMedicoActual(); 
        showView('disponibilidad-medico-section'); 
    });
    
    backButtons.forEach(btn => { 
        if (btn) { 
            btn.addEventListener('click', (e) => { 
                e.preventDefault(); 
                const currentProfile = getUserProfile();
                if (getToken() && currentProfile) {
                     if (welcomeUserMessage) welcomeUserMessage.textContent = `¡Bienvenido de nuevo, ${currentProfile.nombre_completo || currentProfile.email}!`;
                    showView('welcome-section');
                } else {
                    showView('login-section'); 
                }
            });
        } 
    });
    
    document.querySelectorAll('input[required], input[type="email"], input[type="password"][required]').forEach(input => {
        const validateInput = () => {
            let isValid = true;
            let minLength = input.type === 'password' ? 6 : 1;

            if (input.type === 'email') { 
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 
                isValid = emailRegex.test(input.value); 
            } else if (input.hasAttribute('required')) {
                isValid = input.value.trim().length >= minLength;
            }

            if (input.value.trim() === '' && !input.hasAttribute('required') && input.type !== 'email') { 
                input.classList.remove('valid', 'invalid'); return; 
            }
            
            if (isValid) { 
                input.classList.remove('invalid'); input.classList.add('valid'); 
            } else { 
                input.classList.remove('valid'); input.classList.add('invalid'); 
            }
        };
        input.addEventListener('input', validateInput);
        input.addEventListener('blur', () => { 
            if (input.value.trim() !== '' || input.hasAttribute('required')) validateInput(); 
            else input.classList.remove('valid', 'invalid'); 
        });
    });

    console.log("SIVIC Frontend: Inicialización completa. Listeners asignados.");
});