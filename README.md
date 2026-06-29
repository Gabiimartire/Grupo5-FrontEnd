# Target Analyzer MVP - Backend

Este es el repositorio del backend para el proyecto Target Analyzer. Básicamente, es una API desarrollada con Node.js y Express que funciona como receptor de los objetivos para nuestro sistema de escaneo.

## Instalación y uso

Para levantar el proyecto en un entorno local, el proceso es bastante directo. Primero es necesario clonar el repositorio y abrir una terminal en la carpeta raíz. Ejecutando `npm install` se descargan las dependencias necesarias (Express, CORS y Express-Rate-Limit). Una vez finalizado, el servidor se inicia con `npm start` y queda escuchando peticiones en el puerto 3000.

## Decisiones de arquitectura y seguridad

A medida que fuimos armando la integración, surgió la necesidad de atajar un problema clásico de experiencia de usuario: los clics múltiples. Es muy común que si la interfaz demora un segundo de más en procesar, la persona haga varios clics por impaciencia. Para evitar que el robot de scraping colapse intentando procesar cinco veces la misma URL al mismo tiempo, me encargué de implementar una capa de seguridad a nivel de la API.

Para esto utilicé el middleware express-rate-limit y lo configuré para aceptar un máximo de 3 peticiones por IP cada minuto. La idea no era solo poner un límite técnico, sino que tuviera sentido con la temática del proyecto. Si una IP supera el límite, la API intercepta la petición y devuelve un mensaje personalizado avisando que "el objetivo detectó múltiples pings y se abortó la conexión para evitar el firewall". De esta forma, el bloqueo se siente como una mecánica propia de la herramienta y no como un error del sistema.

Por otro lado, me pareció importante dejar un registro de estas acciones. Como el rate limiter suele bloquear en silencio, modifiqué la configuración agregando un handler. Gracias a esto, cada vez que se frena un intento de saturación, el servidor imprime una alerta en la consola registrando la IP involucrada. Esto nos sirve para tener un control y poder auditar la seguridad del backend de forma rápida.

Haber implementado este escudo directamente en la ruta de recepción nos ayuda a organizarnos mejor como equipo. Ahora, los compañeros que están desarrollando la lógica de la caché y el comportamiento del robot saben que cualquier dato que pase por esa ruta ya viene filtrado y validado, lo que les ahorra tener que programar validaciones redundantes.