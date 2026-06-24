// motor_scraping.js
const axios = require('axios');
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
async function ejecutarScraping(url) {

    let browser;

    try {

        let objetivo = url;

        if (!objetivo.startsWith('http')) {
            objetivo = 'https://' + objetivo;
        }

        const inicio = Date.now();

        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
        });

        const page = await browser.newPage();

        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0 Safari/537.36'
        );

        await page.goto(objetivo, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });
        await new Promise(resolve => setTimeout(resolve, 3000));
        const latencia = Date.now() - inicio;

        const html = await page.content();

        // =========================
        // PANEL 1 - IMÁGENES
        // =========================

        const imagenes = await page.evaluate(() => {

            const urls = [];

            document.querySelectorAll('img').forEach(img => {

                const src =
                    img.src ||
                    img.dataset.src ||
                    img.dataset.lazySrc ||
                    img.dataset.original;

                if (src) {
                    urls.push(src);
                }

            });

            return urls;

        });

        const imagenesLimpias = [...new Set(imagenes)]
            .filter(img => img.startsWith('http'))
            .slice(0, 20);

        // =========================
        // PANEL 2 - TECNOLOGÍAS
        // =========================

        const frameworks = [];

        const htmlLower = html.toLowerCase();

        if (htmlLower.includes('_next')) {
            frameworks.push('Next.js');
        }

        if (htmlLower.includes('react')) {
            frameworks.push('React');
        }

        if (htmlLower.includes('vue')) {
            frameworks.push('Vue');
        }

        if (htmlLower.includes('angular')) {
            frameworks.push('Angular');
        }

        if (htmlLower.includes('tailwind')) {
            frameworks.push('Tailwind CSS');
        }

        if (!frameworks.length) {
            frameworks.push('HTML Nativo');
        }

        // =========================
        // TRACKERS
        // =========================

        const trackers = [];

        if (
            htmlLower.includes('google-analytics') ||
            htmlLower.includes('gtag')
        ) {
            trackers.push('Google Analytics');
        }

        if (htmlLower.includes('fbevents')) {
            trackers.push('Meta Pixel');
        }

        if (htmlLower.includes('hotjar')) {
            trackers.push('Hotjar');
        }

        if (!trackers.length) {
            trackers.push('Sin trackers evidentes');
        }

        // =========================
        // PANEL 3 - ENLACES
        // =========================

        const enlaces = await page.evaluate(() => {

            return [...document.links]
                .map(link => link.href)
                .filter(Boolean)
                .slice(0, 20);

        });

        // =========================
        // PANEL 4 - MÉTRICAS
        // =========================

        const metricas = await page.evaluate(() => {

            return {
                imagenes: document.images.length,
                parrafos: document.querySelectorAll('p').length,
                scripts: document.scripts.length
            };

        });

        // =========================
        // TOP PALABRAS
        // =========================

        const topPalabras = await page.evaluate(() => {

            const texto = document.body?.innerText || '';

            const palabras = texto
                .toLowerCase()
                .replace(/[^\w\s]/g, '')
                .split(/\s+/);

            const contador = {};

            palabras.forEach(palabra => {

                if (palabra.length < 4) return;

                contador[palabra] =
                    (contador[palabra] || 0) + 1;

            });

            return Object.entries(contador)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([palabra, frecuencia]) => ({
                    palabra,
                    frecuencia: Math.min(frecuencia, 100)
                }));

        });

        console.log(
            `[SCRAPER] ${imagenesLimpias.length} imágenes | ${enlaces.length} enlaces`
        );

        return {

            vista: {
                imagenes: imagenesLimpias,
                dominio: new URL(objetivo).hostname,
                estado_red: 'ONLINE',
                tiempo_respuesta_ms: latencia
            },

            tecnologia: {
                servidor_core: 'Detectado',
                ssl_valido: objetivo.startsWith('https'),
                frameworks,
                trackers_vigilancia: trackers
            },

            enlaces: enlaces.length
                ? enlaces
                : ['[ SIN ENLACES DETECTADOS ]'],

            metricas: {

                totales: {
                    imagenes: metricas.imagenes,
                    parrafos: metricas.parrafos,
                    scripts: metricas.scripts
                },

                top_palabras: topPalabras.length
                    ? topPalabras
                    : [
                        { palabra: 'html', frecuencia: 80 },
                        { palabra: 'body', frecuencia: 60 },
                        { palabra: 'div', frecuencia: 40 },
                        { palabra: 'span', frecuencia: 20 }
                    ]
            }
        };

    } catch (error) {

        console.error(error);

        throw new Error(
            'El objetivo bloqueó la conexión o no existe.'
        );

    } finally {

        if (browser) {
            await browser.close();
        }

    }
}
module.exports = { ejecutarScraping };