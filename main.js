/* 1. CAPTURA DE SENSORES (DOM) */
const inputObjetivo = document.getElementById('target-url');
const botonEscaneo = document.getElementById('btn-scan');
const panelVista = document.querySelector('#panel-vista .contenido-panel');
const panelTech = document.querySelector('#panel-tech .contenido-panel');
const panelEnlaces = document.querySelector('#panel-enlaces .contenido-panel');
const panelMetricas = document.querySelector('#panel-metricas .contenido-panel');

// Colores dependiendo la tecnología detectada
const coloresTech = {
    "React": "#61dafb",      
    "Nginx": "#009639",      
    "SSL": "#f4c20d",        
    "Vue": "#4fc08d",        
    "Node.js": "#339933",    
    "Google Analytics": "#e37400" 
}

/* 2. EL GATILLO DE ACCIÓN */
botonEscaneo.addEventListener('click', iniciarOperacion);

/* 3. LA LÓGICA PRINCIPAL */
async function iniciarOperacion() {
    const urlIngresada = inputObjetivo.value;
    
    if (urlIngresada.trim() === '') {
        alert('[ERROR TÁCTICO]: Ingrese un dominio objetivo válido.');
        return;
    }
    botonEscaneo.innerText = '[ ESCANEANDO... ]';
    botonEscaneo.classList.add('boton-escaneando');
    botonEscaneo.disabled = true;
    
    /* 4. ESTADO DE CARGA (Mientras esperamos al Backend) */
    const mensajeCarga = `
        <div class="loader-tactico">
            <span class="loader-texto">[ ESTABLECIENDO CONEXIÓN CON EL TARGET... ]</span>
            <div class="loader-barra"></div>
        </div>
    `;
    panelVista.innerHTML = mensajeCarga;
    panelTech.innerHTML = mensajeCarga;
    panelEnlaces.innerHTML = mensajeCarga;
    panelMetricas.innerHTML = mensajeCarga;
    inputObjetivo.value = ''; // Limpiamos el input

    /*
    try {
        const respuesta = await fetch('http://localhost:3000/api/escanear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlIngresada })
        });
        const datos = await respuesta.json();
    * / 
    /* 5. EL DISPARO A LA RED (Fetch) */
    try {
        const [respuesta] = await Promise.all([
            fetch('datos.json'),
            new Promise(resolve => setTimeout(resolve, 3000)) // segundo de retardo visual para ver los loading
        ])
        if (!respuesta.ok) {
            throw new Error('No se encontró datos.json')
        }
        const datos = await respuesta.json();
        // --- PANEL 1: VISTA  ---
        panelVista.innerHTML = `
            <div style="border: 1px solid var(--color-terminal); height: 120px; margin-bottom: 15px; position: relative; overflow: hidden; background: #000;">
                
                <img id="img-target-visor" src="${datos.vista.imagen_principal}" class="miniatura-target" alt="Imagen principal" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.4;">
                
                <span style="position: absolute; bottom: 5px; right: 5px; font-size: 0.75rem; background: rgba(0,0,0,0.8); padding: 2px 6px; border: 1px solid var(--color-terminal); z-index: 10; pointer-events: none;">[IMAGEN DEL TARGET: ${datos.vista.dominio}]</span>
            </div> 
            <p>> ESTADO RED: <span style="color: var(--color-terminal)">${datos.vista.estado_red}</span></p>
            <p>> LATENCIA: ${datos.vista.tiempo_respuesta_ms} ms</p>
        `;
        /*Se crea el visor tactico*/
       document.getElementById('img-target-visor').addEventListener('click', () => {
            const visor = document.getElementById('visor-tactico');
            const imagenAmpliada = document.getElementById('imagen-ampliada');
            imagenAmpliada.src = datos.vista.imagen_principal;
            visor.classList.add('visibilidad-activa'); 
        });
        // --- PANEL 2: TECNOLOGÍA(Con colores en cada tecnología) ---
        const listaTrackers = datos.tecnologia.trackers_vigilancia.map(vg => {
            const colorElegido = coloresTech[vg] || 'var(--color-terminal)';
            return `<li style="color: ${colorElegido}; border-radius:5px;border: 1px solid ${colorElegido}; padding: 2px 8px; margin-bottom: 6px; display: inline-block; background: rgba(0,0,0,0.5);">${vg}</li>`;
        }).join(' ');

        const listaFrameworks = datos.tecnologia.frameworks.map(fw => {
            const colorElegido = coloresTech[fw] || 'var(--color-terminal)';
            return `<li style="color: ${colorElegido}; border-radius:5px; border: 1px solid ${colorElegido}; padding: 2px 8px; margin-bottom: 6px; display: inline-block; background: rgba(0,0,0,0.5);">${fw}</li>`;
        }).join(' ');
        // 1. APLICAMOS EL COLOR A UN ÚNICO ELEMENTO (EL CORE)
        const nombreCore = datos.tecnologia.servidor_core; // Leemos qué servidor es (ej: "Nginx")
        const colorCore = coloresTech[nombreCore] || 'var(--color-terminal)'; // Buscamos su color
        
        // Fabricamos la etiqueta visual para el Core
        const coreConEstilo = `<span style="color: ${colorCore}; border-radius: 5px;border: 1px solid ${colorCore}; padding: 2px 8px; display: inline-block; background: rgba(0,0,0,0.5);">${nombreCore}</span>`;


        /*se guarda en una variable para usar con la libreria typed*/
        const contenidoTech = `
            <p>> CORE: ${coreConEstilo}</p>
            <p>> SSL: ${datos.tecnologia.ssl_valido ? '<span style="color: #00ff41; font-weight: bold;">SEGURO</span>' : '<span style="color: var(--color-alerta); font-weight: bold;">VULNERABLE</span>'}</p>            <p style="color: var(--color-alerta)">> FRAMEWORKS DETECTADOS:</p>
            <ul style="list-style: none; padding-left: 10px;">${listaFrameworks}</ul>
            <br>
            <p style="color: var(--color-alerta)">> TRACKERS DE VIGILANCIA:</p>
            <ul style="list-style: none; padding-left: 10px;">${listaTrackers}</ul>
        `;
        panelTech.innerHTML = '<div id="tipeo-tech"></div>';
        setTimeout(() => {
            new Typed('#tipeo-tech', {
                strings: [contenidoTech], // Le pasamos tu variable de texto
                typeSpeed: 10,            // Velocidad: 10 milisegundos por letra (rápido y táctico)
                showCursor: true,         // Muestra el cursor al final
                cursorChar: '█',          // Cambiamos la rayita por un bloque hacker
                contentType: 'html'       // CRÍTICO: Le dice que interprete las etiquetas HTML y no las escriba
            });
        }, 100);

        // --- PANEL 3: ENLACES ---
        const listaEnlaces = datos.enlaces.map(link => `<a class="links" href="${link}" target="_blank" style="margin-bottom: 5px; border-bottom: 1px solid rgba(255,0,0,0.2);"> > ${link}</a>`).join('');
        panelEnlaces.innerHTML = '<div id="tipeo-enlaces"></div>'
        setTimeout(() => {
            new Typed('#tipeo-enlaces', {
                strings: [listaEnlaces],
                typeSpeed: 20,
                showCursor: true,
                cursorChar: '█',
                contentType: 'html'
            });
        }, 100);
        // --- PANEL 4: MÉTRICAS ---
        
        const barrasPalabras = datos.metricas.top_palabras.map((item, index) => `
            <div style="margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                    <span>${item.palabra.toUpperCase()}</span>
                    <span>[${item.frecuencia}]</span>
                </div>
                <div style="width: 100%; height: 8px; background: rgba(220, 38, 38, 0.2); margin-top: 2px;">
                    <div id="barra-lexica-${index}" style="width: 0%; height: 100%; background: var(--color-terminal); box-shadow: 0 0 5px var(--color-terminal); transition: width 1.5s ease-out;"></div>
                </div>
            </div>
        `).join('');

        panelMetricas.innerHTML = `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dashed var(--color-terminal); padding-bottom: 10px; margin-bottom: 10px;">
                <span>IMÁGENES: ${datos.metricas.totales.imagenes}</span>
                <span>PÁRRAFOS: ${datos.metricas.totales.parrafos}</span>
                <span>SCRIPTS: ${datos.metricas.totales.scripts}</span>
            </div>
            <p style="color: var(--color-alerta)">> ANÁLISIS DE FRECUENCIA LÉXICA:</p>
            ${barrasPalabras}
        `
        setTimeout(() => {
            datos.metricas.top_palabras.forEach((item, index) => {
                const barra = document.getElementById(`barra-lexica-${index}`);
                if (barra) {
                    barra.style.width = item.frecuencia + '%';
                }
            });
        }, 100);


        botonEscaneo.innerText = '[INICIAR_ESCANEO]';
        botonEscaneo.classList.remove('boton-escaneando');
        botonEscaneo.disabled = false;
    } catch (error) {
        const msjError = '<span style="color: var(--color-alerta)">[FALLO DE ENLACE: BÚNKER CENTRAL NO RESPONDE]</span>';
        panelVista.innerHTML = msjError;
        panelTech.innerHTML = msjError;
        panelEnlaces.innerHTML = msjError;
        panelMetricas.innerHTML = msjError;
        botonEscaneo.innerText = '[INICIAR_ESCANEO]';
        botonEscaneo.classList.remove('boton-escaneando');
        botonEscaneo.disabled = false;
    }
}
const visor = document.getElementById('visor-tactico');
if (visor) {
    visor.addEventListener('click', function() {
        this.classList.remove('visibilidad-activa');
    });
}