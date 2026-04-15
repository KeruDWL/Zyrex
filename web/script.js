const state = {
    archivosRutas: [],
    procesando: false,
    drawerOpen: false,
    modos: {
        1: {
            nombre: 'Stealth Mode',
            descripcion: 'Elimina rastros básicos del origen y hardware.'
        },
        2: {
            nombre: 'Ghost Mode',
            descripcion: 'Limpieza total de metadatos.'
        },
        3: {
            nombre: 'Forge Mode',
            descripcion: 'Reescritura controlada de autor y descripción.'
        }
    }
};

const appShell = document.getElementById('appShell');
const summaryDrawer = document.getElementById('summaryDrawer');

const fileList = document.getElementById('fileList');
const terminal = document.getElementById('terminal');

const autorInput = document.getElementById('autor');
const descInput = document.getElementById('desc');
const forgeInputs = document.getElementById('forgeInputs');

const runBtn = document.getElementById('runBtn');
const runBtnLabel = document.getElementById('runBtnLabel');
const selectFilesBtn = document.getElementById('selectFilesBtn');
const clearFilesBtn = document.getElementById('clearFilesBtn');
const clearLogBtn = document.getElementById('clearLogBtn');

const policyCards = [...document.querySelectorAll('.policy-card')];
const workspaceTrack = document.getElementById('workspaceTrack');
const workspaceTabs = [...document.querySelectorAll('.switch-btn')];

const summaryToggleBtn = document.getElementById('summaryToggleBtn');
const summaryCloseBtn = document.getElementById('summaryCloseBtn');
const drawerScrim = document.getElementById('drawerScrim');

const drawerSelectedCount = document.getElementById('drawerSelectedCount');
const drawerModeLabel = document.getElementById('drawerModeLabel');
const drawerModeHint = document.getElementById('drawerModeHint');

function hasEelMethod(methodName) {
    return typeof window.eel !== 'undefined' && typeof window.eel[methodName] === 'function';
}

function getTimestamp() {
    return new Date().toLocaleTimeString('es-MX', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function escapeHtml(text) {
    return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

function logLine(message, type = 'info') {
    const line = document.createElement('div');
    line.className = `log-line ${type}`;
    line.innerHTML = `
        <span class="log-time">${getTimestamp()}</span>
        <span class="log-bullet"></span>
        <span class="log-message">${escapeHtml(message)}</span>
    `;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

function getCurrentLevel() {
    const selected = document.querySelector('input[name="level"]:checked');
    return selected ? Number(selected.value) : 2;
}

function updateSummaryUI() {
    const level = getCurrentLevel();
    const mode = state.modos[level];
    const count = state.archivosRutas.length;

    drawerSelectedCount.textContent = String(count);
    drawerModeLabel.textContent = mode.nombre;
    drawerModeHint.textContent = mode.descripcion;
}

function updateModeUI() {
    const level = getCurrentLevel();
    forgeInputs.classList.toggle('hidden', level !== 3);

    policyCards.forEach((card) => {
        const selected = Number(card.dataset.mode) === level;
        card.classList.toggle('selected', selected);
    });

    updateSummaryUI();
}

function getExtension(filePath) {
    const filename = filePath.split(/[/\\]/).pop() || filePath;
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop().toUpperCase() : 'FILE';
}

function renderEmptyFiles() {
    fileList.className = 'file-list empty-state';
    fileList.innerHTML = `
        <div class="empty-visual">
            <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Zm0 0v5h5"></path>
            </svg>
        </div>
        <p>No hay archivos seleccionados todavía.</p>
    `;
}

function renderFiles() {
    if (!state.archivosRutas.length) {
        renderEmptyFiles();
        updateSummaryUI();
        return;
    }

    fileList.className = 'file-list';
    fileList.innerHTML = state.archivosRutas.map((ruta, index) => {
        const filename = ruta.split(/[/\\]/).pop() || ruta;
        const ext = getExtension(ruta);

        return `
            <article class="file-item">
                <div class="file-item-icon">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Zm0 0v5h5"></path>
                    </svg>
                </div>

                <div class="file-item-content">
                    <div class="file-item-top">
                        <strong>${escapeHtml(filename)}</strong>
                        <span class="file-ext">${escapeHtml(ext)}</span>
                    </div>
                    <small title="${escapeHtml(ruta)}">#${index + 1} · ${escapeHtml(ruta)}</small>
                </div>
            </article>
        `;
    }).join('');

    updateSummaryUI();
}

function setProcessing(isProcessing) {
    state.procesando = isProcessing;
    runBtn.disabled = isProcessing;
    selectFilesBtn.disabled = isProcessing;
    clearFilesBtn.disabled = isProcessing;

    if (isProcessing) {
        runBtn.classList.add('is-loading');
        runBtnLabel.textContent = 'Procesando...';
    } else {
        runBtn.classList.remove('is-loading');
        runBtnLabel.textContent = 'Ejecutar sanitización';
    }
}

function setWorkspaceSlide(index) {
    workspaceTabs.forEach((btn, i) => {
        btn.classList.toggle('active', i === index);
    });

    if (!workspaceTrack) {
        return;
    }

    if (window.innerWidth <= 1220) {
        workspaceTrack.style.transform = 'translateX(0)';
        return;
    }

    workspaceTrack.style.transform = `translateX(-${index * 50}%)`;
}

function setDrawerOpen(isOpen) {
    state.drawerOpen = isOpen;
    appShell.classList.toggle('drawer-open', isOpen);
    summaryDrawer.setAttribute('aria-hidden', String(!isOpen));
    summaryToggleBtn.setAttribute('aria-expanded', String(isOpen));
}

function openDrawer() {
    setDrawerOpen(true);
}

function closeDrawer() {
    setDrawerOpen(false);
}

function toggleDrawer() {
    setDrawerOpen(!state.drawerOpen);
}

async function seleccionarArchivos() {
    if (!hasEelMethod('seleccionar_archivos_nativo')) {
        logLine('Eel no está disponible. Esta vista debe abrirse desde la app de escritorio.', 'error');
        return;
    }

    try {
        const rutas = await window.eel.seleccionar_archivos_nativo()();

        if (!rutas || !rutas.length) {
            logLine('Selección cancelada por el usuario.', 'warn');
            return;
        }

        state.archivosRutas = rutas;
        renderFiles();
        logLine(`Se cargaron ${rutas.length} archivo(s) correctamente.`, 'success');
        setWorkspaceSlide(0);
    } catch (error) {
        logLine(`No fue posible abrir el selector nativo: ${error}`, 'error');
    }
}

async function iniciarProceso() {
    if (state.procesando) {
        return;
    }

    const nivel = getCurrentLevel();
    const autor = autorInput.value.trim();
    const desc = descInput.value.trim();

    if (!state.archivosRutas.length) {
        logLine('Primero debes seleccionar al menos un archivo.', 'error');
        setWorkspaceSlide(0);
        return;
    }

    if (nivel === 3 && (!autor || !desc)) {
        logLine('Forge Mode requiere capturar autor y descripción.', 'error');
        setWorkspaceSlide(1);
        return;
    }

    if (!hasEelMethod('procesar_archivos_python')) {
        logLine('El backend no está disponible. Ejecuta la aplicación desde Python + Eel.', 'error');
        return;
    }

    setProcessing(true);
    logLine(
        `Iniciando sanitización en ${state.modos[nivel].nombre} para ${state.archivosRutas.length} archivo(s).`,
        'info'
    );

    try {
        const resultados = await window.eel.procesar_archivos_python(
            state.archivosRutas,
            nivel,
            autor,
            desc
        )();

        let exitos = 0;
        let fallos = 0;

        resultados.forEach(([ok, mensaje]) => {
            if (ok) {
                exitos += 1;
                logLine(mensaje, 'success');
            } else {
                fallos += 1;
                logLine(mensaje, 'error');
            }
        });

        logLine(
            `Proceso finalizado. Éxitos: ${exitos} · Fallos: ${fallos}.`,
            fallos ? 'warn' : 'success'
        );
    } catch (error) {
        logLine(`Se produjo un error durante el procesamiento: ${error}`, 'error');
    } finally {
        setProcessing(false);
    }
}

function clearFiles() {
    state.archivosRutas = [];
    renderFiles();
    logLine('Lista de archivos reiniciada.', 'warn');
}

function clearLog() {
    terminal.innerHTML = '';
    logLine('Registro reiniciado.', 'info');
}

function handleResize() {
    if (window.innerWidth <= 1220) {
        workspaceTrack.style.transform = 'translateX(0)';
        return;
    }

    const activeIndex = workspaceTabs.findIndex((btn) => btn.classList.contains('active'));
    setWorkspaceSlide(activeIndex >= 0 ? activeIndex : 0);
}

function bindEvents() {
    document.getElementsByName('level').forEach((radio) => {
        radio.addEventListener('change', updateModeUI);
    });

    workspaceTabs.forEach((btn) => {
        btn.addEventListener('click', () => {
            const slide = Number(btn.dataset.slide || 0);
            setWorkspaceSlide(slide);
        });
    });

    summaryToggleBtn.addEventListener('click', toggleDrawer);
    summaryCloseBtn.addEventListener('click', closeDrawer);
    drawerScrim.addEventListener('click', closeDrawer);

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && state.drawerOpen) {
            closeDrawer();
        }
    });

    selectFilesBtn.addEventListener('click', seleccionarArchivos);
    runBtn.addEventListener('click', iniciarProceso);
    clearFilesBtn.addEventListener('click', clearFiles);
    clearLogBtn.addEventListener('click', clearLog);

    window.addEventListener('resize', handleResize);
}

function init() {
    bindEvents();
    updateModeUI();
    renderFiles();
    updateSummaryUI();
    setWorkspaceSlide(0);
    setDrawerOpen(false);
    logLine('Interfaz inicializada. Sistema listo para operar.', 'success');
}

document.addEventListener('DOMContentLoaded', init);