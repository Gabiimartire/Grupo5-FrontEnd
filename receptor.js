const express = require('express');
const cors = require('cors');
const helmet = require('helmet'); // Librería de seguridad
const rateLimit = require('express-rate-limit'); // Protección contra múltiples peticiones
const morgan = require('morgan'); // Registro de solicitudes HTTP
const { obtenerCache, guardarCache } = require("./services/cacheService");

const app = express();
const PUERTO = 3000;

/* CONFIGURACIÓN DEL SERVIDOR*/

/* URL de la API independiente */
const URL_API = 'http://localhost:4000/api/analizar';

/* Cantidad máxima de escaneos permitidos */
const LIMITE_ESCANEOS = 100;

/* Contador total de escaneos */
let totalEscaneos = 0;

/* =========================================================
   MIDDLEWARES
   ========================================================= */

/* Agrega encabezados HTTP de seguridad */
app.use(helmet());

/* Procesa datos JSON */
app.use(express.json());

/* Permite conexiones desde el Frontend */
app.use(cors());

/* Registra las solicitudes HTTP en la consola */
app.use(morgan('dev'));

/* =========================================================
   VALIDACIÓN DE URL
   ========================================================= */

/* Verifica si el texto recibido corresponde a una URL válida */
function esUrlValida(url) {

    try {

        new URL(url);
        return true;

    } catch {

        return false;

    }

}

/* =========================================================
   RATE LIMITER
   ========================================================= */

/* Evita ataques por exceso de solicitudes */
const limitadorEscaneos = rateLimit({

    windowMs: 1 * 60 * 1000,
    max: 3,

    message: {

        estado: 'DEFENSAS ACTIVAS',
        mensaje: '[ALERTA TÁCTICA]: El objetivo detectó múltiples pings. Abortando conexión temporalmente para evitar bloqueo del firewall (60s).'

    },

    standardHeaders: true,
    legacyHeaders: false,

    handler: (req, res, next, options) => {

        console.warn(
            `ALERTA: Se ha detectado un posible ataque de fuerza bruta desde la IP ${req.ip}. Limitando acceso temporalmente.`
        );

        res.status(options.statusCode).json(options.message);

    }

});

/* =========================================================
   RUTA PRINCIPAL
   ========================================================= */

app.post('/api/escanear', limitadorEscaneos, async (req, res) => {

    /* Verificar si se alcanzó el límite de escaneos */

    if (totalEscaneos >= LIMITE_ESCANEOS) {

        return res.status(403).json({

            estado: 'ERROR',
            mensaje: '[LÍMITE ALCANZADO]: No se permiten más escaneos.',
            totalEscaneos,
            limite: LIMITE_ESCANEOS

        });

    }

    /* URL enviada desde el Frontend */

    const urlRecibida = req.body.url;

    /* Validar formato de la URL */

    if (!esUrlValida(urlRecibida)) {

        return res.status(400).json({

            estado: 'ERROR',
            mensaje: '[URL INVÁLIDA]: Ingrese una dirección web válida.'

        });

    }

    /* Buscar primero en la caché */

    const resultadoCache = obtenerCache(urlRecibida);
    
    if (resultadoCache) {   
        console.log("Resultado obtenido desde la caché.");

    return res.json({

        estado: "CACHE",
        resultado: resultadoCache,
        totalEscaneos,
        limite: LIMITE_ESCANEOS

    });

}

    console.log(`Objetivo recibido: ${urlRecibida}`);

    try {

        /* =========================================================
           ENVÍO A LA API INDEPENDIENTE
           ========================================================= */

        const respuestaApi = await fetch(URL_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: urlRecibida })
        });

        const datosApi = await respuestaApi.json();
        console.log("[DEBUG API]:", JSON.stringify(datosApi, null, 2));
        /* Simulación del análisis */

        const resultado = {

            objetivo: urlRecibida,
            mensaje: "Análisis realizado correctamente.",
            analisis: datosApi.data || null

        };
        
        /* Guardar resultado en la caché */

        guardarCache(urlRecibida, resultado);

        /* Incrementar contador de escaneos */

        totalEscaneos++;


    
        /* =========================================================
           RESPUESTA AL FRONTEND
           ========================================================= */

        res.json({

            estado: "EXITO",
            resultado,
            totalEscaneos,

            limite: LIMITE_ESCANEOS

        });

    } catch (error) {

        /* =========================================================
           ERROR DE CONEXIÓN CON LA API
           ========================================================= */

        console.error(error);

        res.status(503).json({

            estado: 'ERROR',
            mensaje: '[FALLO DE CONEXIÓN]: No se pudo contactar con el servicio de análisis.',
            totalEscaneos,
            limite: LIMITE_ESCANEOS

        });

    }

});

/* =========================================================
   ARRANQUE DEL SERVIDOR
   ========================================================= */

app.listen(PUERTO, () => {

    console.log(`[BÚNKER CENTRAL]: Escuchando comunicaciones en puerto ${PUERTO}.`);

});

