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
    function saveUserProfile(profile) { currentUserProfile = profile; }
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
    }
    
    function setupUserNavigationEventListeners(profileDataForNav) {
        const showProfileLinkElem = getElem('show-profile-link');
        if(showProfileLinkElem) {
            showProfileLinkElem.onclick = (e) => {
                e.preventDefault();
                const currentProfile = profileDataForNav || getUserProfile();
                if (currentProfile) populateProfileForm(currentProfile);
                showView('profile-section');
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
        const token = getToken();
        if (!token) return null;
        try { return await fetchAPI('/profile/me', {method: 'GET'}); }
        catch (error) { if (error.message.includes('401') || error.message.toLowerCase().includes('token inválido')) { removeToken(); clearUserProfile(); updateUIAfterLogout(); } return null; }
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
            if (window.history.replaceState) { /* ... limpiar URL ... */ } else { window.location.hash = ''; }
            updateUIAfterLogout();
        }
        if (!authRedirectProcessed) await checkLoginStatus();
    }
    
    async function checkLoginStatus() {
        const token = getToken();
        if (token) {
            const profileData = await fetchUserProfile();
            if (profileData) updateUIAfterLogin(profileData);
            else if(getToken()) { removeToken(); clearUserProfile(); updateUIAfterLogout(); }
        } else updateUIAfterLogout();
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
                loginMessage.textContent = '¡Login exitoso!'; loginMessage.style.color = 'var(--seafoam-green)';
                setTimeout(() => { if (loginMessage.parentElement) loginMessage.remove(); }, 3000);
                loginForm.reset();
                document.querySelectorAll('#login-form input').forEach(input => input.classList.remove('valid', 'invalid'));
            } catch (error) { console.error('Error de login:', error); loginMessage.textContent = `Error: ${error.message}`; loginMessage.style.color = 'var(--poppy-red)'; }
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
        if (rangosDiv.querySelectorAll('.rango-horario-item').length >= 2) {
            const btnAnadirExistente = rangosDiv.querySelector('.btn-anadir-rango');
            if(btnAnadirExistente) btnAnadirExistente.disabled = true;
            alert(`Solo se permiten máximo 2 rangos horarios por día para ${diaId.charAt(0).toUpperCase() + diaId.slice(1)}.`);
            return;
        }
        const nuevoRangoDiv = document.createElement('div');
        nuevoRangoDiv.className = 'rango-horario-item';
        const inputInicio = document.createElement('input'); inputInicio.type = 'time'; inputInicio.className = 'rango-inicio'; inputInicio.value = rango.inicio; inputInicio.step = "60";
        const inputFin = document.createElement('input'); inputFin.type = 'time'; inputFin.className = 'rango-fin'; inputFin.value = rango.fin; inputFin.step = "60";
        const btnEliminarRango = document.createElement('button'); btnEliminarRango.type = 'button'; btnEliminarRango.textContent = 'X'; btnEliminarRango.className = 'btn-eliminar-rango';
        btnEliminarRango.onclick = () => {
            nuevoRangoDiv.remove();
            const btnAnadir = rangosDiv.querySelector('.btn-anadir-rango');
            if (btnAnadir) btnAnadir.disabled = false;
        };
        nuevoRangoDiv.appendChild(document.createTextNode('De: ')); nuevoRangoDiv.appendChild(inputInicio);
        nuevoRangoDiv.appendChild(document.createTextNode(' a: ')); nuevoRangoDiv.appendChild(inputFin);
        nuevoRangoDiv.appendChild(btnEliminarRango); rangosDiv.appendChild(nuevoRangoDiv);
        const btnAnadir = rangosDiv.querySelector('.btn-anadir-rango');
        if (btnAnadir && rangosDiv.querySelectorAll('.rango-horario-item').length >= 2) {
            btnAnadir.disabled = true;
        }
    }

    if (horariosSemanalesContainer) {
        diasSemana.forEach(dia => {
            const checkDia = getElem(`check-${dia}`);
            const rangosDiv = getElem(`rangos-${dia}`);
            if (rangosDiv && !rangosDiv.querySelector('.btn-anadir-rango')) {
                const btnAnadirRango = document.createElement('button');
                btnAnadirRango.type = 'button'; btnAnadirRango.textContent = '+ Añadir Rango';
                btnAnadirRango.className = 'btn-anadir-rango'; btnAnadirRango.style.display = 'none';
                btnAnadirRango.onclick = () => agregarRangoHorarioInput(dia);
                rangosDiv.appendChild(btnAnadirRango);
            }
            if (checkDia && rangosDiv) {
                checkDia.addEventListener('change', (e) => {
                    const btn = rangosDiv.querySelector('.btn-anadir-rango');
                    rangosDiv.style.display = e.target.checked ? 'block' : 'none';
                    if(btn) {
                        btn.style.display = e.target.checked ? 'inline-block' : 'none';
                        btn.disabled = rangosDiv.querySelectorAll('.rango-horario-item').length >= 2;
                    }
                    if (e.target.checked && rangosDiv.querySelectorAll('.rango-horario-item').length === 0) {
                        agregarRangoHorarioInput(dia);
                    }
                });
            }
        });
    }

    async function cargarDisponibilidadMedicoActual() {
        const perfilActual = getUserProfile();
        if (!perfilActual || perfilActual.role !== 'Medico' || !disponibilidadMedicoForm) return;
        try {
            let perfilMedicoAnidado = perfilActual.perfiles_medicos?.[0];
            if (!perfilMedicoAnidado || perfilMedicoAnidado.horarios_disponibles === undefined) {
                const perfilDetallado = await fetchUserProfile();
                if (perfilDetallado) { saveUserProfile(perfilDetallado); perfilMedicoAnidado = perfilDetallado.perfiles_medicos?.[0] || {}; }
                else perfilMedicoAnidado = {};
            }
            if(limiteCitasDiariasInput) limiteCitasDiariasInput.value = perfilMedicoAnidado?.limite_citas_diarias ?? 10;
            const horariosGuardados = perfilMedicoAnidado?.horarios_disponibles || {};
            diasSemana.forEach(dia => {
                const checkDia = getElem(`check-${dia}`); const rangosDiv = getElem(`rangos-${dia}`); const btnAnadirRango = rangosDiv ? rangosDiv.querySelector('.btn-anadir-rango') : null;
                if (rangosDiv) rangosDiv.querySelectorAll('.rango-horario-item').forEach(item => item.remove());
                if (checkDia && rangosDiv && btnAnadirRango) {
                    if (horariosGuardados[dia] && horariosGuardados[dia].length > 0) {
                        checkDia.checked = true; rangosDiv.style.display = 'block'; btnAnadirRango.style.display = 'inline-block';
                        horariosGuardados[dia].slice(0, 2).forEach(rangoStr => { const [inicio, fin] = rangoStr.split('-'); agregarRangoHorarioInput(dia, { inicio, fin }); });
                        btnAnadirRango.disabled = rangosDiv.querySelectorAll('.rango-horario-item').length >= 2;
                    } else { checkDia.checked = false; rangosDiv.style.display = 'none'; btnAnadirRango.style.display = 'none'; btnAnadirRango.disabled = false; }
                }
            });
        } catch (error) { console.error("Error cargando disponibilidad:", error); alert("Error al cargar disponibilidad: " + error.message); }
    }
    
    if (disponibilidadMedicoForm) {
        disponibilidadMedicoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const limite_citas_diarias_val = limiteCitasDiariasInput ? parseInt(limiteCitasDiariasInput.value, 10) : undefined;
            const horarios_disponibles = {}; let errorEnHorarios = false;
            diasSemana.forEach(dia => {
                if(errorEnHorarios) return; const checkDia = getElem(`check-${dia}`);
                if (checkDia && checkDia.checked) {
                    const rangosItems = document.querySelectorAll(`#rangos-${dia} .rango-horario-item`);
                    if (rangosItems.length === 0) { alert(`Añada rangos para ${dia.charAt(0).toUpperCase() + dia.slice(1)} o desmárquelo.`); errorEnHorarios = true; return; }
                    const rangosParaDia = [];
                    for (const item of rangosItems) { 
                        if(errorEnHorarios) break; 
                        const inicioInput = item.querySelector('.rango-inicio'); const finInput = item.querySelector('.rango-fin');
                        const inicio = inicioInput ? inicioInput.value : ''; const fin = finInput ? finInput.value : '';
                        if (inicio && fin) { if (inicio >= fin) { alert(`En ${dia}, inicio (${inicio}) debe ser antes que fin (${fin}).`); errorEnHorarios = true; break; } rangosParaDia.push(`${inicio}-${fin}`); }
                        else if (inicio || fin) { alert(`En ${dia}, complete ambas horas o elimine el rango.`); errorEnHorarios = true; break; }
                    }
                    if(errorEnHorarios) return; if (rangosParaDia.length > 0) horarios_disponibles[dia] = rangosParaDia;
                }
            });
            if(errorEnHorarios) return;
            let dispoMessage = disponibilidadMedicoForm.querySelector('.form-message');
            if (!dispoMessage) { dispoMessage = document.createElement('p'); dispoMessage.className = 'form-message'; disponibilidadMedicoForm.appendChild(dispoMessage); }
            try {
                dispoMessage.textContent = 'Actualizando...'; dispoMessage.style.color = 'var(--dark-gray)';
                const payload = {};
                if (limite_citas_diarias_val !== undefined && !isNaN(limite_citas_diarias_val)) payload.limite_citas_diarias = limite_citas_diarias_val;
                payload.horarios_disponibles = horarios_disponibles;
                const data = await fetchAPI('/medicos/me/disponibilidad', { method: 'PUT', body: JSON.stringify(payload) });
                dispoMessage.textContent = data.message || '¡Disponibilidad actualizada!'; dispoMessage.style.color = 'var(--seafoam-green)';
                const updatedProfile = await fetchUserProfile(); saveUserProfile(updatedProfile);
                setTimeout(() => { if(dispoMessage.parentElement) dispoMessage.remove(); }, 3000);
            } catch (error) { dispoMessage.textContent = `Error: ${error.message}`; dispoMessage.style.color = 'var(--poppy-red)'; }
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
    
    backButtons.forEach(btn => { 
        btn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            if (getToken() && getUserProfile()) showView('welcome-section'); 
            else showView('login-section'); 
        }); 
    });
    
    document.querySelectorAll('input[required], input[type="email"]').forEach(input => {
        const validateInput = () => {
            let isValid = true;
            if (input.type === 'email') { const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; isValid = emailRegex.test(input.value); }
            else if (input.hasAttribute('required')) isValid = input.value.trim() !== '';
            if (input.value.trim() === '' && !input.hasAttribute('required') && input.type !== 'email') { input.classList.remove('valid', 'invalid'); return; }
            if (isValid) { input.classList.remove('invalid'); input.classList.add('valid'); }
            else { input.classList.remove('valid'); input.classList.add('invalid'); }
        };
        input.addEventListener('input', validateInput);
        input.addEventListener('blur', () => { if (input.value.trim() !== '') validateInput(); else input.classList.remove('valid', 'invalid'); });
    });
    
    async function cargarMedicosParaSelect() {
        if (!selectMedicoParaCita) return;
        try {
            const medicos = await fetchAPI('/medicos', {method: 'GET'});
            selectMedicoParaCita.innerHTML = '<option value="">Seleccione un médico</option>';
            medicos.forEach(medico => {
                const option = document.createElement('option');
                option.value = medico.id;
                option.textContent = `${medico.nombre_completo} (Cédula: ${medico.perfiles_medicos?.cedula_profesional || 'N/A'})`;
                option.dataset.horarios = JSON.stringify(medico.perfiles_medicos?.horarios_disponibles || {});
                selectMedicoParaCita.appendChild(option);
            });
        } catch (error) { selectMedicoParaCita.innerHTML = '<option value="">Error al cargar médicos</option>'; console.error("Error cargando médicos para select:", error); }
    }
    
    if (selectMedicoParaCita && medicoDisponibilidadInfoDiv) {
        selectMedicoParaCita.addEventListener('change', (e) => {
            const selectedOption = e.target.selectedOptions[0];
            if (selectedOption && selectedOption.dataset.horarios) {
                try {
                    const horarios = JSON.parse(selectedOption.dataset.horarios);
                    let html = '<h4>Horarios del Médico:</h4><ul>';
                    diasSemana.forEach(dia => { // Mostrar en orden
                        if (horarios[dia] && horarios[dia].length > 0) {
                            html += `<li><strong>${dia.charAt(0).toUpperCase() + dia.slice(1)}:</strong> ${horarios[dia].join(', ')}</li>`;
                        }
                    });
                    if (Object.keys(horarios).length === 0) html += '<li>No hay horarios definidos.</li>';
                    html += '</ul>'; medicoDisponibilidadInfoDiv.innerHTML = html;
                } catch (parseError) { medicoDisponibilidadInfoDiv.textContent = 'No se pudo mostrar la disponibilidad.'; }
            } else { medicoDisponibilidadInfoDiv.textContent = ''; }
        });
    }

    if (agendarCitaForm) {
        agendarCitaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const medico_id = selectMedicoParaCita.value;
            const fecha_cita_val = getElem('fecha-cita').value;
            const hora_cita_val = getElem('hora-cita').value;
            if (!medico_id || !fecha_cita_val || !hora_cita_val) { alert('Por favor, complete todos los campos para agendar.'); return; }
            const fecha_hora_cita = `${fecha_cita_val}T${hora_cita_val}:00`;
            let agendarMessage = agendarCitaForm.querySelector('.form-message');
            if (!agendarMessage) { agendarMessage = document.createElement('p'); agendarMessage.className = 'form-message'; agendarCitaForm.appendChild(agendarMessage); }
            try {
                agendarMessage.textContent = 'Agendando cita...';
                const data = await fetchAPI('/citas', { method: 'POST', body: JSON.stringify({ medico_id, fecha_hora_cita }) });
                agendarMessage.textContent = data.message || '¡Cita agendada!'; agendarMessage.style.color = 'var(--seafoam-green)';
                agendarCitaForm.reset(); if(medicoDisponibilidadInfoDiv) medicoDisponibilidadInfoDiv.innerHTML = '';
                setTimeout(() => { if(agendarMessage.parentElement) agendarMessage.remove(); showView('mis-citas-paciente-section'); cargarMisCitasPaciente(); }, 2000);
            } catch (error) { agendarMessage.textContent = `Error: ${error.message}`; agendarMessage.style.color = 'var(--poppy-red)'; }
        });
    }

    async function cargarMisCitasPaciente() {
        if (!listaCitasPacienteDiv) return;
        listaCitasPacienteDiv.innerHTML = '<p>Cargando tus citas...</p>';
        try {
            const citas = await fetchAPI('/citas/paciente/me', {method: 'GET'});
            if (!citas || citas.length === 0) { listaCitasPacienteDiv.innerHTML = '<p>No tienes citas programadas.</p>'; return; }
            let html = '';
            citas.forEach(cita => {
                html += `<div class="card cita-card"><h3>Cita con Dr(a). ${cita.medico?.nombre_completo || 'Desconocido'}</h3><p><strong>Fecha y Hora:</strong> ${new Date(cita.fecha_hora_cita).toLocaleString()}</p><p><strong>Estado:</strong> ${cita.estado_cita}</p>${cita.estado_cita === 'Completada' && cita.notas_diagnostico ? `<p><strong>Notas:</strong> ${cita.notas_diagnostico}</p>` : ''}${(cita.estado_cita === 'Programada' || cita.estado_cita === 'Confirmada') ? `<button class="button-link danger btn-cancelar-cita" data-cita-id="${cita.cita_id}">Cancelar Cita</button>` : ''}</div>`;
            });
            listaCitasPacienteDiv.innerHTML = html;
            document.querySelectorAll('.btn-cancelar-cita').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const citaId = e.target.dataset.citaId;
                    if (confirm('¿Está seguro que desea cancelar esta cita?')) {
                        try { await fetchAPI(`/citas/${citaId}/cancelar`, { method: 'PUT' }); alert('Cita cancelada exitosamente.'); cargarMisCitasPaciente(); }
                        catch (error) { alert(`Error al cancelar la cita: ${error.message}`); }
                    }
                });
            });
        } catch (error) { listaCitasPacienteDiv.innerHTML = `<p style="color:var(--poppy-red);">Error al cargar citas: ${error.message}</p>`; }
    }

    async function cargarMiAgendaMedico() {
        if (!listaCitasMedicoDiv) return;
        listaCitasMedicoDiv.innerHTML = '<p>Cargando tu agenda...</p>';
        try {
            const citas = await fetchAPI('/citas/medico/me', {method: 'GET'});
            if (!citas || citas.length === 0) { listaCitasMedicoDiv.innerHTML = '<p>No tienes citas en tu agenda.</p>'; return; }
            let html = '';
            citas.forEach(cita => {
                html += `<div class="card cita-card"><h3>Cita con ${cita.paciente?.nombre_completo || 'Paciente Desconocido'}</h3><p><strong>Fecha y Hora:</strong> ${new Date(cita.fecha_hora_cita).toLocaleString()}</p><p><strong>Tel. Paciente:</strong> ${cita.paciente?.telefono || 'N/A'}</p><p><strong>Estado Actual:</strong> <span id="estado-cita-${cita.cita_id}">${cita.estado_cita}</span></p><div id="notas-container-cita-${cita.cita_id}">${cita.notas_diagnostico ? `<p><strong>Notas:</strong> <span id="notas-cita-${cita.cita_id}">${cita.notas_diagnostico}</span></p>`: ''}</div>${(cita.estado_cita === 'Programada' || cita.estado_cita === 'Confirmada') ? `<div class="cita-acciones mt-1"><label for="select-estado-${cita.cita_id}" style="font-size:0.9em; margin-bottom:3px;">Nuevo Estado:</label><select class="select-estado-cita" id="select-estado-${cita.cita_id}" data-cita-id="${cita.cita_id}"><option value="">-- Seleccionar --</option><option value="Confirmada">Confirmada</option><option value="Completada">Completada</option><option value="Cancelada_Medico">Cancelada por Médico</option></select><label for="input-notas-${cita.cita_id}" style="font-size:0.9em; margin-top:10px; margin-bottom:3px; display:none;" class="label-notas-diagnostico">Notas (si completada):</label><textarea class="input-notas-diagnostico" id="input-notas-${cita.cita_id}" data-cita-id="${cita.cita_id}" placeholder="Añadir notas..." style="display:none; width:100%; margin-top:5px;"></textarea><button class="button-link btn-actualizar-estado-cita" data-cita-id="${cita.cita_id}" style="margin-top:10px;">Actualizar Estado</button></div>` : ''}</div>`;
            });
            listaCitasMedicoDiv.innerHTML = html;
            document.querySelectorAll('.select-estado-cita').forEach(select => {
                select.addEventListener('change', (e) => {
                    const citaId = e.target.dataset.citaId;
                    const inputNotas = getElem(`input-notas-${citaId}`);
                    const labelNotas = select.parentElement.querySelector(`.label-notas-diagnostico`);
                    if (inputNotas && labelNotas) {
                        const mostrar = e.target.value === 'Completada';
                        inputNotas.style.display = mostrar ? 'block' : 'none';
                        labelNotas.style.display = mostrar ? 'block' : 'none';
                    }
                });
            });
            document.querySelectorAll('.btn-actualizar-estado-cita').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const citaId = e.target.dataset.citaId;
                    const nuevoEstado = getElem(`select-estado-${citaId}`).value;
                    const notas = getElem(`input-notas-${citaId}`).value;
                    if (!nuevoEstado) { alert('Por favor, seleccione un nuevo estado.'); return; }
                    const payload = { estado_cita: nuevoEstado };
                    if (nuevoEstado === 'Completada' && notas) payload.notas_diagnostico = notas;
                    try {
                        const citaActualizada = await fetchAPI(`/citas/${citaId}/estado`, { method: 'PUT', body: JSON.stringify(payload) });
                        alert('Estado de la cita actualizado.');
                        getElem(`estado-cita-${citaId}`).textContent = citaActualizada.cita.estado_cita;
                        const notasContainer = getElem(`notas-container-cita-${citaId}`);
                        if(notasContainer && citaActualizada.cita.notas_diagnostico) {
                            notasContainer.innerHTML = `<p><strong>Notas:</strong> <span id="notas-cita-${citaId}">${citaActualizada.cita.notas_diagnostico}</span></p>`;
                        }
                        if(citaActualizada.cita.estado_cita === 'Completada' || citaActualizada.cita.estado_cita.startsWith('Cancelada')) {
                            e.target.closest('.cita-acciones').remove(); // Quitar acciones si ya no son válidas
                        }
                    } catch (error) { alert(`Error al actualizar estado: ${error.message}`); }
                });
            });
        } catch (error) { listaCitasMedicoDiv.innerHTML = `<p style="color:var(--poppy-red);">Error al cargar agenda: ${error.message}</p>`;}
    }
    
    if (showAgendarCitaBtn) showAgendarCitaBtn.addEventListener('click', () => { cargarMedicosParaSelect(); showView('agendar-cita-section'); });
    if (showMisCitasPacienteBtn) showMisCitasPacienteBtn.addEventListener('click', () => { cargarMisCitasPaciente(); showView('mis-citas-paciente-section'); });
    if (showMiAgendaMedicoBtn) showMiAgendaMedicoBtn.addEventListener('click', () => { cargarMiAgendaMedico(); showView('mi-agenda-medico-section'); });
    if (showDisponibilidadMedicoBtn) showDisponibilidadMedicoBtn.addEventListener('click', () => { cargarDisponibilidadMedicoActual(); showView('disponibilidad-medico-section'); });
    
    backButtons.forEach(btn => { 
        btn.addEventListener('click', (e) => { 
            e.preventDefault(); 
            if (getToken() && getUserProfile()) showView('welcome-section'); 
            else showView('login-section'); 
        }); 
    });
    
    document.querySelectorAll('input[required], input[type="email"]').forEach(input => {
        const validateInput = () => {
            let isValid = true;
            if (input.type === 'email') { const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; isValid = emailRegex.test(input.value); }
            else if (input.hasAttribute('required')) isValid = input.value.trim() !== '';
            if (input.value.trim() === '' && !input.hasAttribute('required') && input.type !== 'email') { input.classList.remove('valid', 'invalid'); return; }
            if (isValid) { input.classList.remove('invalid'); input.classList.add('valid'); }
            else { input.classList.remove('valid'); input.classList.add('invalid'); }
        };
        input.addEventListener('input', validateInput);
        input.addEventListener('blur', () => { if (input.value.trim() !== '') validateInput(); else input.classList.remove('valid', 'invalid'); });
    });

    console.log("SIVIC Frontend completamente inicializado y con todos los listeners asignados.");
});