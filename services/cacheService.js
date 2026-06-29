// Importamos la librería que nos permite guardar datos en memoria
const NodeCache = require("node-cache");

// Creamos una caché.
// stdTTL = tiempo que dura guardado cada dato (600 segundos = 10 minutos)
const cache = new NodeCache({
    stdTTL: 600
});

/*
    Esta función busca si una URL ya fue analizada.
    Si existe devuelve el resultado.
    Si no existe devuelve undefined.
*/
function obtenerCache(url) {
    return cache.get(url);
}

/*
    Esta función guarda un análisis nuevo usando la URL como clave.
*/
function guardarCache(url, resultado) {
    cache.set(url, resultado);
}

// Exportamos las funciones para poder usarlas desde receptor.js
module.exports = {
    obtenerCache,
    guardarCache
};