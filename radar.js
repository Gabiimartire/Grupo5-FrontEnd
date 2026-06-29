// radar.js - Motor de Rastreo Dinámico y Sensores Locales
let mapaTactico = null;
let marcadorObjetivo = null;
let marcadorBase = null;
/* --- 1. INICIALIZACIÓN DEL BÚNKER (AL CARGAR LA PÁGINA) --- */
function calibrarSensoresLocales() {
    console.log('[SISTEMA]: Inicializando matriz de radar...');
    // Instanciamos el mapa ocultando controles 
    // Configuramos coordenadas por defecto cercanas a Fátima, Argentina en caso de que bloquees el GPS
    mapaTactico = L.map('mapa-bunker', {
        zoomControl: false,
        attributionControl: false,
        
        // --- BLOQUEO TÁCTICO: Congelamos el mapa ---
        dragging: false,         // Bloquea arrastrar con el clic
        touchZoom: false,        // Bloquea zoom con los dedos en pantallas táctiles
        doubleClickZoom: false,  // Bloquea zoom al hacer doble clic
        scrollWheelZoom: false,  // Bloquea zoom con la ruedita del mouse
        boxZoom: false,          
        keyboard: false          // Bloquea moverlo con las flechas del teclado
    }).setView([-34.45, -58.95], 12);
    // Inyectamos el mapa oscuro (CartoDB Dark Matter) [cite: 122]
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(mapaTactico);
    document.body.style.backgroundColor = 'transparent';
    // Solicitar coordenadas exactas al GPS del navegador
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (posicion) => {
                const lat = posicion.coords.latitude;
                const lon = posicion.coords.longitude;
                
                console.log(`[BASE CONFIRMADA]: Coordenadas locales detectadas: ${lat}, ${lon}`);
                
                // Centramos el mapa en la ubicación real del usuario
                mapaTactico.setView([lat, lon], 13);
                
                // Colocamos una baliza marcando el Centro de Mando
                marcadorBase = L.marker([lat, lon]).addTo(mapaTactico);
            },
            (error) => {
                console.warn('[ALERTA]: GPS bloqueado o inaccesible. Operando desde ubicación de red predeterminada.');
            }
        );
    } else {
        console.error('[FALLA CRÍTICA]: El navegador no soporta geolocalización.');
    }
}
// Ejecutamos la calibración automáticamente al abrir la interfaz
document.addEventListener('DOMContentLoaded', calibrarSensoresLocales);
/* --- 2. RASTREO DE OBJETIVOS (AL HACER CLIC EN ESCANEAR) --- */
/* --- 2. RASTREO DE OBJETIVOS CORREGIDO --- */
/* --- 2. RASTREO DE OBJETIVOS (CON BUFFER DE MEMORIA) --- */
async function rastrearObjetivo(urlIngresada) {
    try {
        const urlObj = new URL(urlIngresada.startsWith('http') ? urlIngresada : 'https://' + urlIngresada);
        const dominio = urlObj.hostname;
        
        const respuestaGeo = await fetch(`http://ip-api.com/json/${dominio}`);
        const datosGeo = await respuestaGeo.json();
        
        if (datosGeo.status === 'success') {
            const lat = datosGeo.lat;
            const lon = datosGeo.lon;

            console.log(`[RASTREO CONFIRMADO]: ${datosGeo.city}, ${datosGeo.country} | COORDENADAS: ${lat}, ${lon}`);
            
            // FASE 0: Encendemos el radar
            document.getElementById('mapa-bunker').style.opacity = '1';
            const origen = mapaTactico.getCenter();

            // FASE 1: Ascenso a Órbita (Zoom Out)
            // Obligamos al mapa a alejarse. Al llegar a zoom 3, hay tan pocas imágenes del mundo
            // que el navegador las guarda automáticamente en la memoria caché al instante.
            mapaTactico.flyTo(origen, 3, {
                animate: true,
                duration: 1.5
            });

            // FASE 2: Desplazamiento Satelital Global - LENTO (4.0s)
            // Al darle más tiempo, Leaflet hace un movimiento fluido y no "teletransporta"
            setTimeout(() => {
                mapaTactico.flyTo([lat, lon], 3, {
                    animate: true,
                    duration: 4.0 
                });

                // FASE 3: Descenso Táctico sobre el Objetivo - Rápido (1.5s)
                setTimeout(() => {
        const etiquetaDestino = `[TARGET]: ${datosGeo.city}, ${datosGeo.country}`;
        
        if (marcadorObjetivo) {
            marcadorObjetivo.setLatLng([lat, lon]);
            marcadorObjetivo.setPopupContent(etiquetaDestino);
        } else {
            marcadorObjetivo = L.marker([lat, lon]).addTo(mapaTactico);
            marcadorObjetivo.bindPopup(etiquetaDestino);
        }
        marcadorObjetivo.openPopup(); // ¡Esto mostrará la etiqueta finalmente!
        
        mapaTactico.flyTo([lat, lon], 12, { animate: true, duration: 1.5 });
    }, 4100); // IMPORTANTE: Este tiempo debe ser ligeramente mayor al duration de la fase 2

            }, 1600); // Este tiempo debe ser ligeramente mayor al duration de la fase 1
        } else {
            console.warn('[ALERTA]: Imposible triangular coordenadas del objetivo.');
        }
    } catch (error) {
        console.error('[FALLA DE SENSORES]: Error crítico en el módulo de geolocalización.', error);
    }
}