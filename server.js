// backend.js
const express = require('express');
const cors = require('cors');

// Importamos nuestra herramienta táctica externa
const { ejecutarScraping } = require('./motor_scraping');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/escanear', async (req, res) => {
    const urlObjetivo = req.body.url;
    console.log(`\n[ RADAR ACTIVO ]: Recibida orden de escaneo para -> ${urlObjetivo}`);

    try {
        // Delegamos el trabajo pesado al motor de scraping
        const datosExtraidos = await ejecutarScraping(urlObjetivo);
        
        // Enviamos la carga útil al Front End
        res.json(datosExtraidos);
        console.log(`[ MISIÓN CUMPLIDA ]: Datos enviados al visor táctico.`);

    } catch (error) {
        console.error(`\n[ ERROR DE ENLACE ]: ${error.message}`);
        res.status(500).json({ error: "No se pudo penetrar las defensas del objetivo." });
    }
});

// Inicializamos el servidor
app.listen(3000, () => {
    console.log('\n[ BÚNKER CENTRAL EN LÍNEA ] -> Backend modular operando en puerto 3000');
});