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
};

/* 2. EL GATILLO DE ACCIÓN */
botonEscaneo.addEventListener('click', iniciarOperacion);

/* 3. LA LÓGICA PRINCIPAL */
async function iniciarOperacion() {
    const urlIngresada = inputObjetivo.value;
    
    if (urlIngresada.trim() === '') {
        alert('[ERROR TÁCTICO]: Ingrese un dominio objetivo válido.');
        return;
    }
    
    /* 4. ESTADO DE CARGA (Mientras esperamos al Backend) */
    const mensajeCarga = '<span style="color: var(--color-alerta)">[PROCESANDO SONDAS...]</span>';
    panelVista.innerHTML = mensajeCarga;
    panelTech.innerHTML = mensajeCarga;
    panelEnlaces.innerHTML = mensajeCarga;
    panelMetricas.innerHTML = mensajeCarga;
    
    inputObjetivo.value = ''; // Limpiamos el input
    
    /* 5. EL DISPARO A LA RED (Fetch) */
    try {
        const respuesta = await fetch('datos.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlIngresada })
        });
        
        // Atrapamos el JSON gigante que definimos
        const datos = await respuesta.json();
        
        /* 6. IMPACTO EN EL TABLERO (Desarmando el JSON) */
        
        // --- PANEL 1: VISTA ---
        panelVista.innerHTML = `
            <div style="border: 1px solid var(--color-terminal); height: 120px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; background: rgba(255,0,0,0.1);">
                <span>[IMAGEN DEL TARGET: ${datos.vista.dominio}]</span>
            </div>
            <p>> ESTADO RED: <span style="color: var(--color-terminal)">${datos.vista.estado_red}</span></p>
            <p>> LATENCIA: ${datos.vista.tiempo_respuesta_ms} ms</p>
        `;

        // --- PANEL 2: TECNOLOGÍA(Con colores en cada tecnología) ---
        const listaTrackers = datos.tecnologia.trackers_vigilancia.map(vg => {
            const colorElegido = coloresTech[vg] || 'var(--color-terminal)';
            return `<li style="color: ${colorElegido}; border: 1px solid ${colorElegido}; padding: 2px 8px; margin-bottom: 6px; display: inline-block; background: rgba(0,0,0,0.5);">${vg}</li>`;
        }).join(' ');
        const listaFrameworks = datos.tecnologia.frameworks.map(fw => {
            const colorElegido = coloresTech[fw] || 'var(--color-terminal)';
            return `<li style="color: ${colorElegido}; border: 1px solid ${colorElegido}; padding: 2px 8px; margin-bottom: 6px; display: inline-block; background: rgba(0,0,0,0.5);">${fw}</li>`;
        }).join(' ');
        // 1. APLICAMOS EL COLOR A UN ÚNICO ELEMENTO (EL CORE)
        const nombreCore = datos.tecnologia.servidor_core; // Leemos qué servidor es (ej: "Nginx")
        const colorCore = coloresTech[nombreCore] || 'var(--color-terminal)'; // Buscamos su color
        
        // Fabricamos la etiqueta visual para el Core
        const coreConEstilo = `<span style="color: ${colorCore}; border: 1px solid ${colorCore}; padding: 2px 8px; display: inline-block; background: rgba(0,0,0,0.5);">${nombreCore}</span>`;

        panelTech.innerHTML = `
            <p>> CORE: ${coreConEstilo}</p>
<p>> SSL: ${datos.tecnologia.ssl_valido ? '<span style="color: #00ff41; font-weight: bold;">SEGURO</span>' : '<span style="color: var(--color-alerta); font-weight: bold;">VULNERABLE</span>'}</p>            <p style="color: var(--color-alerta)">> FRAMEWORKS DETECTADOS:</p>
            <ul style="list-style: none; padding-left: 10px;">${listaFrameworks}</ul>
            <br>
            <p style="color: var(--color-alerta)">> TRACKERS DE VIGILANCIA:</p>
            <ul style="list-style: none; padding-left: 10px;">${listaTrackers}</ul>
        `;

        // --- PANEL 3: ENLACES ---
        const listaEnlaces = datos.enlaces.map(link => `<p style="margin-bottom: 5px; border-bottom: 1px solid rgba(255,0,0,0.2);">> ${link}</p>`).join('');
        panelEnlaces.innerHTML = listaEnlaces;

        // --- PANEL 4: MÉTRICAS ---
        const barrasPalabras = datos.metricas.top_palabras.map(item => `
            <div style="margin-top: 10px;">
                <div style="display: flex; justify-content: space-between; font-size: 0.8rem;">
                    <span>${item.palabra.toUpperCase()}</span>
                    <span>[${item.frecuencia}]</span>
                </div>
                <div style="width: 100%; height: 8px; background: rgba(255,0,0,0.2); margin-top: 2px;transition: width 1s ease-out;">
                <div style="width: ${item.frecuencia}%; height: 100%; background: var(--color-terminal); box-shadow: var(--color-alerta);"></div>
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
        `;
    } catch (error) {
        const msjError = '<span style="color: var(--color-alerta)">[FALLO DE ENLACE: BÚNKER CENTRAL NO RESPONDE]</span>';
        panelVista.innerHTML = msjError;
        panelTech.innerHTML = msjError;
        panelEnlaces.innerHTML = msjError;
        panelMetricas.innerHTML = msjError;
    }
}