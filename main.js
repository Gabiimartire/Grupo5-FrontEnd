/* 1. CAPTURA DE SENSORES (DOM) */
const inputObjetivo = document.getElementById('target-url');
const botonEscaneo = document.getElementById('btn-scan');
const panelVista = document.querySelector('#panel-vista .contenido-panel');
const panelTech = document.querySelector('#panel-tech .contenido-panel');
const panelEnlaces = document.querySelector('#panel-enlaces .contenido-panel');
const panelMetricas = document.querySelector('#panel-metricas .contenido-panel');

// Colores dependiendo la tecnología detectada
const mapaColores = {
    "Frameworks": "#35ff6b",
    "Analytics": "#ff9a00",
    "SEO": "#4ea8ff",
    "Marketing": "#b45cff",
    "Otros": "#ffffff"
};
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
const sndRadarMilitar = new Audio('sonidos/radartactico.wav')
const sndAccion = new Audio('sonidos/accion.wav')



/* 2. EL GATILLO DE ACCIÓN */
botonEscaneo.addEventListener('click', iniciarOperacion);

/* 3. LA LÓGICA PRINCIPAL */
function esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function normalizarUrl(valor) {
    let url = valor.trim();

    if (url === "") {
        return {
            ok: false,
            mensaje: "[ERROR]: INGRESE UN OBJETIVO"
        };
    }

    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "https://" + url;
    }

    try {
        new URL(url);

        return {
            ok: true,
            url
        };

    } catch {
        return {
            ok: false,
            mensaje: "[URL INVÁLIDA]: Use un formato como https://ejemplo.com"
        };
    }
}
async function iniciarOperacion() {
    const validacion = normalizarUrl(inputObjetivo.value);
    if (!validacion.ok) {
        mostrarErrorFront(validacion.mensaje);
        return;
    }
    const urlIngresada = validacion.url;;
    
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
    rastrearObjetivo(urlIngresada);
    const todosLosPaneles = document.querySelectorAll('.panel'); 
    
    todosLosPaneles.forEach(panel => {
        // Le damos medio segundo de transición para que no desaparezca de golpe
        panel.style.opacity = '0.55'; 
        // Desactivamos los clics por si el usuario intenta tocar algo invisible
        panel.style.pointerEvents = 'none'; 
    });
    botonEscaneo.innerText = '[ ESCANEANDO... ]';
    botonEscaneo.classList.add('boton-escaneando');
    botonEscaneo.disabled = true;
    sndAccion.play(); 
    sndRadarMilitar.play() 
    
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
    try {
        const inicioAnimacion = Date.now();
        const respuesta = await fetch('http://localhost:3000/api/escanear', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlIngresada })
        });

        const paqueteReceptor = await respuesta.json();

        const tiempoMinimoRadar = 7500;
        const tiempoTranscurrido = Date.now() - inicioAnimacion;

        if (tiempoTranscurrido < tiempoMinimoRadar) {
            await esperar(tiempoMinimoRadar - tiempoTranscurrido);
        }
        
        if (!respuesta.ok) {
            throw new Error(
                paqueteReceptor.mensaje || `Enlace rechazado. Status: ${respuesta.status}`
            );
        }
        const vinoDeCache = paqueteReceptor.estado === "CACHE";
        const datos = paqueteReceptor.resultado.analisis;
        const analisis = {
            titulo: datos.title,
            descripcion: datos.description,
            url: datos.url,
            favicon: datos.favicon,
            screenshot: datos.screenshot,
            tecnologias: datos.technologies || [],
            imagenes: datos.images || [],
            enlaces: datos.links || [],
            seo: datos.seo || {},
            metricas: datos.metrics || {}
        };

        imagenesTarget = analisis.imagenes.map(img => img.src);
        const resumenTech = clasificarTecnologias(analisis.tecnologias);
        if (!datos) {
            sndError.play()
            sndRadarTactico.pause();           
            sndRadarTactico.currentTime = 0;  
            throw new Error("[DATOS VACÍOS]: El backend no pudo adjuntar el análisis en el paquete.");
        }           
        sndExito.play();
        sndRadarMilitar.pause();           
        sndRadarMilitar.currentTime = 0;  
        todosLosPaneles.forEach(panel => {
            panel.style.opacity = '1'; 
            panel.style.pointerEvents = 'auto'; // Volvemos a habilitar los clics
        });
        const titulo =
        analisis.titulo.length > 60
            ? analisis.titulo.substring(0, 60) + "..."
            : analisis.titulo;        
        // --- PANEL 1: VISTA  ---
        panelVista.innerHTML = `
            <div style="border:1px solid var(--color-terminal);
                        height:160px;
                        margin-bottom:12px;
                        overflow:hidden;
                        position:relative;
                        background:black;">
                <img
                    id="img-target-visor"
                    src="${imagenesTarget[0] || analisis.favicon}"
                    class="miniatura-target"
                    style="width:100%;
                        height:100%;
                        object-fit:cover;
                        cursor:pointer;">
                <span style="
                    position:absolute;
                    right:8px;
                    bottom:8px;
                    padding:4px 8px;
                    background:#000a;
                    border:1px solid var(--color-terminal);
                    font-size:.75rem;">
                    ${imagenesTarget.length} IMG
                </span>
            </div>
            <p>> TÍTULO</p>
            <p>${titulo}</p>
            <p>> DESCRIPCIÓN</p>
            <p>${analisis.descripcion}</p>
            <p>> URL</p>
            <p>${analisis.url}</p>
            `;
        document.getElementById('img-target-visor').addEventListener('click', () => {
        indiceImagenActual = 0;
        mostrarImagenActual();
        document
            .getElementById('visor-tactico')
            .classList.add('visibilidad-activa');
        });

        // --- PANEL 2: TECNOLOGÍA ---
        // El resumen se inyecta estático para que el flexbox funcione correctamente.
        // Solo la lista de tecnologías pasa por Typed.js para mantener la animación.

        const resumenHTML = `
            <h4 class="titulo-resumen">>> RESUMEN DE CATEGORÍAS</h4>
            ${filaResumen("FRAMEWORKS", resumenTech.Frameworks || 0, mapaColores.Frameworks, "cpu")}
            ${filaResumen("ANALYTICS",  resumenTech.Analytics  || 0, mapaColores.Analytics, "chart-column")}
            ${filaResumen("SEO",        resumenTech.SEO        || 0, mapaColores.SEO, "search")}
            ${filaResumen("MARKETING",  resumenTech.Marketing  || 0, mapaColores.Marketing, "megaphone")}
            ${filaResumen("OTROS",      resumenTech.Otros      || 0, mapaColores.Otros, "boxes")}
            <hr style="border:0; border-top:1px solid #dc2626; margin:10px 0;">
            <h4 class="titulo-resumen">>> TECNOLOGÍAS DETECTADAS</h4>
            <div id="tipeo-tech"></div>
        `;

        panelTech.innerHTML = resumenHTML;
        lucide.createIcons();
        const listaHTML = analisis.tecnologias.map(tech => {
            const cat   = obtenerCategoria(tech);
            const color = mapaColores[cat] || "#fff";
            return `<div class="tech-item" style="border-left:3px solid ${color}; display:flex; justify-content:space-between; padding:4px 8px; margin-bottom:5px; background:rgba(255,255,255,0.03);"><span>${tech.toUpperCase()}</span><span style="color:${color}; font-size:0.7rem;">${cat.toUpperCase()}</span></div>`;
        }).join("");

        setTimeout(() => {
            new Typed('#tipeo-tech', {
                strings: [listaHTML],
                typeSpeed: 20,
                showCursor: true,
                cursorChar: '█',
                contentType: 'html'
            });
        }, 1000);
        // --- PANEL 3: ENLACES ---
       const listaEnlaces = analisis.enlaces.map(link=>{
        const href = link.href;
        if(!href) return "";
        const texto = href.length > 65
            ? href.substring(0,65)+"..."
            : href;
        return `
        <a
            class="links"
            href="${href}"
            target="_blank"
            title="${href}">
            > ${texto}
        </a>
        `;
    }).join("");
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
        const barrasPalabras =
    analisis.metricas.top_palabras?.map(item => `
        <div style="margin-top:10px">

            <div style="display:flex;
                        justify-content:space-between;
                        font-size:.8rem;">

                <span>${item.palabra.toUpperCase()}</span>

                <span>${item.frecuencia}</span>

            </div>

            <div style="
                width:100%;
                height:8px;
                background:#222;
                margin-top:3px;">

                <div
                    class="animacion-barra"
                    style="
                        --ancho-final:${Math.min(item.frecuencia * 10,100)}%;
                        height:100%;
                        background:var(--color-terminal);">
                </div>

            </div>

        </div>
    `).join("") || "";
        panelMetricas.innerHTML = `
            <p>> SEO SCORE: <b>${analisis.seo.score}/100</b></p>

            <p>> IMÁGENES: ${analisis.metricas.totalImages}</p>

            <p>> LINKS: ${analisis.metricas.totalLinks}</p>

            <p>> SCRIPTS: ${analisis.metricas.totalScripts}</p>

            <p>> CSS: ${analisis.metricas.totalStylesheets}</p>

            <p>> FORMULARIOS: ${analisis.metricas.forms}</p>

            <hr>

            <p style="color:var(--color-alerta)">
            > PALABRAS MÁS FRECUENTES
            </p>

            ${barrasPalabras}
            `;
        botonEscaneo.innerText = '[INICIAR_ESCANEO]';
        botonEscaneo.classList.remove('boton-escaneando');
        botonEscaneo.disabled = false;
    } catch (error) {
        const todosLosPaneles = document.querySelectorAll('.panel');
        todosLosPaneles.forEach(panel => {
            panel.style.opacity = '1';
            panel.style.pointerEvents = 'auto';
        });
        sndRadarMilitar.pause();           
        sndRadarMilitar.currentTime = 0;
        sndError.play();           
        console.error("[REPORTE DE DAÑOS FATAL]:", error); 
        const msjError = `
            <span style="color:var(--color-alerta)">
                ${error.message || "[FALLO DE ENLACE]: BÚNKER CENTRAL NO RESPONDE"}
            </span>`;
        panelVista.innerHTML = msjError;
        panelTech.innerHTML = msjError;
        panelEnlaces.innerHTML = msjError;
        panelMetricas.innerHTML = msjError;
        botonEscaneo.innerText = '[INICIAR_ESCANEO]';
        botonEscaneo.classList.remove('boton-escaneando');
        botonEscaneo.disabled = false;
        lucide.createIcons();
    }
}

    // 1. Seleccionamos todos los botones de expansión
const botonesToggle = document.querySelectorAll('.btn-toggle-expand');

botonesToggle.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const panel = e.target.closest('.panel');
        const iconContainer = btn.querySelector('i');
        const isExpanding = !panel.classList.contains('expandido');

        if (isExpanding) {
            // ESTADO EXPANDIR
            panel.classList.add('expandido');
            document.querySelectorAll('.panel').forEach(p => {
                if (p !== panel) p.classList.add('dimmed');
            });
            // Cambiamos el icono a 'X' o 'Minimize'
            iconContainer.setAttribute('data-lucide', 'x');
        } else {
            // ESTADO CERRAR
            panel.classList.remove('expandido');
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('dimmed'));
            // Cambiamos el icono de vuelta a 'Maximize'
            iconContainer.setAttribute('data-lucide', 'maximize-2');
        }
        // Refrescamos los iconos de Lucide para que el cambio se vea
        lucide.createIcons();
    });
});
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
function clasificarTecnologias(tecnologias) {

    const categorias = {
        Frameworks: 0,
        Analytics: 0,
        SEO: 0,
        Marketing: 0,
        Otros: 0
    };

    tecnologias.forEach(tech => {

        switch (tech.toLowerCase()) {

            case "react":
            case "vue":
            case "angular":
            case "jquery":
            case "node.js":
                categorias.Frameworks++;
                break;

            case "google analytics":
            case "facebook pixel":
                categorias.Analytics++;
                break;

            case "open graph":
            case "json-ld":
                categorias.SEO++;
                break;

            case "hubspot":
                categorias.Marketing++;
                break;

            default:
                categorias.Otros++;
        }

    });

    return categorias;
}
function filaResumen(nombre, valor, color, icono) {
    const ancho = Math.min(valor * 25, 100);

    return `
        <div class="fila-tech">

            <div class="tech-info">
                <i data-lucide="${icono}" class="icono-tech"></i>
                <span class="tech-nombre">${nombre}</span>
            </div>

            <div class="tech-barra">
                <div class="tech-barra-fill"
                     style="width:${ancho}%; background:${color}; box-shadow:0 0 8px ${color};">
                </div>
            </div>

            <span class="tech-numero" style="color:${color}">
                ${String(valor).padStart(2, "0")}
            </span>

        </div>
    `;
}
function obtenerCategoria(tech) {
    const t = tech.toLowerCase();
    if (["react", "vue", "angular", "jquery", "node.js", "next.js"].includes(t)) return "Frameworks";
    if (["google analytics", "facebook pixel"].includes(t)) return "Analytics";
    if (["json-ld", "open graph"].includes(t)) return "SEO";
    if (["hubspot"].includes(t)) return "Marketing";
    return "Otros";
}

function generarBarras(valor, color) {
    let html = '<div class="meter-container" style="display:flex; gap:3px;">';
    for (let i = 0; i < 8; i++) {
        // Cada unidad llena 2 bloques
        const activo = i < (valor * 2) ? `style="background:${color}; border: 1px solid ${color};"` : 'style="background:#1a1a1a; border: 1px solid #333;"';
        html += `<div class="meter-block" style="width:12px; height:12px;" ${activo}></div>`;
    }
    html += '</div>';
    return html;
}
function mostrarErrorFront(mensaje) {
    sndError.play();

    inputObjetivo.classList.add("input-error");

    const msj = `
        <span style="color:var(--color-alerta)">
            ${mensaje}
        </span>
    `;

    panelVista.innerHTML = msj;
    panelTech.innerHTML = msj;
    panelEnlaces.innerHTML = msj;
    panelMetricas.innerHTML = msj;

    setTimeout(() => {
        inputObjetivo.classList.remove("input-error");
    }, 1800);
}
lucide.createIcons();