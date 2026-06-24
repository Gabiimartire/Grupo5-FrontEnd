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
//Almacenar imagenes dependiendo de como la envien y atajar cualquier forma
let imagenesTarget = [];
let indiceImagenActual = 0;
function mostrarImagenActual(){
    if(!imagenesTarget.length) return;
    const img = document.getElementById('imagen-ampliada');
    const contador = document.getElementById('contador-imagen');
    img.src = imagenesTarget[indiceImagenActual];
    contador.textContent =
        `[${indiceImagenActual + 1} / ${imagenesTarget.length}]`;
    const btnAnt = document.getElementById('btn-anterior');
    const btnSig = document.getElementById('btn-siguiente');
    if(imagenesTarget.length <= 1){
        btnAnt.style.display = 'none';
        btnSig.style.display = 'none';
    } else {
        btnAnt.style.display = 'block';
        btnSig.style.display = 'block';
    }
}

// Sonidos
const sndClick = new Audio('sonidos/click.mp3');
const sndRadar = new Audio('sonidos/radar.mp3');
sndRadar.loop = true; 
const sndExito = new Audio('sonidos/exito.mp3');
const sndError = new Audio('sonidos/error.mp3');

/* 2. EL GATILLO DE ACCIÓN */
botonEscaneo.addEventListener('click', iniciarOperacion);

/* 3. LA LÓGICA PRINCIPAL */
async function iniciarOperacion() {
    const urlIngresada = inputObjetivo.value;
    
    if (urlIngresada.trim() === '') {
        sndError.play(); 
        inputObjetivo.style.border = "1px solid var(--color-alerta)";
        inputObjetivo.style.boxShadow = "0 0 10px var(--color-alerta)";
        inputObjetivo.value = "";
        inputObjetivo.placeholder = "[ ERROR: DOMINIO REQUERIDO ]";
        setTimeout(() => {
            inputObjetivo.style.border = "1px solid var(--color-terminal)";
            inputObjetivo.style.boxShadow = "0 0 10px var(--color-terminal)";
            inputObjetivo.placeholder = "Ingrese dominio objetivo ...";
        }, 2000);

        const msjErrorInput = '<span style="color: var(--color-alerta)">[ERROR DE SINTAXIS: PARÁMETRO VACÍO]</span>';
        panelVista.innerHTML = msjErrorInput;
        panelTech.innerHTML = msjErrorInput;
        panelEnlaces.innerHTML = msjErrorInput;
        panelMetricas.innerHTML = msjErrorInput;
        return; 
    }
    botonEscaneo.innerText = '[ ESCANEANDO... ]';
    botonEscaneo.classList.add('boton-escaneando');
    botonEscaneo.disabled = true;
    sndClick.play(); 
    sndRadar.play() 
    
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
    //http://localhost:3000/api/escanear
    try {
        const [respuesta] = await Promise.all([
            fetch('http://localhost:3000/api/escanear', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: urlIngresada })
            }),
            new Promise(resolve => setTimeout(resolve, 3000)) 
        ]);
        if (!respuesta.ok) {
            throw new Error(`Enlace rechazado. Status: ${respuesta.status}`);
        }
        const datos = await respuesta.json()
        imagenesTarget = datos.vista.imagenes || [];        
        sndRadar.pause();           
        sndRadar.currentTime = 0;  
        // --- PANEL 1: VISTA  ---
        panelVista.innerHTML = `
    <div style="border: 1px solid var(--color-terminal); height: 120px; margin-bottom: 15px; position: relative; overflow: hidden; background: #000;">
        <img
            id="img-target-visor"
            src="${imagenesTarget[0]}"
            class="miniatura-target animacion-fade"
            alt="Imagen principal"
            style="width:100%;height:100%;object-fit:cover;cursor:crosshair;"
        >
        <span style="position:absolute;bottom:5px;right:5px;font-size:0.75rem;background:rgba(0,0,0,0.8);padding:2px 6px;border:1px solid var(--color-terminal);z-index:10;pointer-events:none;">
            [${imagenesTarget.length} IMÁGENES]
        </span>
        </div>
        <p>> ESTADO RED:
            <span style="color: var(--color-terminal)">
                ${datos.vista.estado_red}
            </span>
        </p>
        <p>> LATENCIA: ${datos.vista.tiempo_respuesta_ms} ms</p>
    `;
        document.getElementById('img-target-visor').addEventListener('click', () => {
        indiceImagenActual = 0;
        mostrarImagenActual();
        document
            .getElementById('visor-tactico')
            .classList.add('visibilidad-activa');
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
                strings: [contenidoTech], 
                typeSpeed: 10,
                showCursor: true,         
                cursorChar: '█',          
                contentType: 'html' 
            });
        }, 100);

        // --- PANEL 3: ENLACES ---
        const listaEnlaces = datos.enlaces.map(link => `<a class="links" href="${link}" target="_blank" style="margin-bottom: 5px; border-bottom: 1px solid rgba(255,0,0,0.2);"> > ${link}</a>`).join('');
        panelEnlaces.innerHTML = '<div id="tipeo-enlaces"></div>'
        setTimeout(() => {
            new Typed('#tipeo-enlaces', {
                strings: [listaEnlaces],
                typeSpeed: 15,
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
                    <div class="animacion-barra" style="--ancho-final: ${item.frecuencia}%; height: 100%; background: var(--color-terminal); box-shadow: 0 0 5px var(--color-terminal);"></div>
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
        botonEscaneo.innerText = '[INICIAR_ESCANEO]';
        botonEscaneo.classList.remove('boton-escaneando');
        botonEscaneo.disabled = false;
    } catch (error) {
        sndRadar.pause();           
        sndRadar.currentTime = 0;
        sndError.play();           
        console.error("[REPORTE DE DAÑOS FATAL]:", error); 
        const msjError = '<span style="color: var(--color-alerta)">[FALLO DE ENLACE: BÚNKER CENTRAL NO RESPONDE]</span>';
        panelVista.innerHTML = msjError;
        panelTech.innerHTML = msjError;
        panelEnlaces.innerHTML = msjError;
        panelMetricas.innerHTML = msjError;
        botonEscaneo.innerText = '[INICIAR_ESCANEO]';
        botonEscaneo.classList.remove('boton-escaneando');
        botonEscaneo.disabled = false;
    }
    sndExito.play();
}
const visor = document.getElementById('visor-tactico');
if (visor) {
    visor.addEventListener('click', function() {
        this.classList.remove('visibilidad-activa');
    });
}
document
    .getElementById('btn-siguiente')
    .addEventListener('click', (e) => {

        e.stopPropagation();

        indiceImagenActual++;

        if(indiceImagenActual >= imagenesTarget.length){
            indiceImagenActual = 0;
        }

        mostrarImagenActual();

    });
document
    .getElementById('btn-anterior')
    .addEventListener('click', (e) => {

        e.stopPropagation();

        indiceImagenActual--;

        if(indiceImagenActual < 0){
            indiceImagenActual = imagenesTarget.length - 1;
        }
        mostrarImagenActual();
    });