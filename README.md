# CTU | Target Analyzer

Proyecto **Target Analyzer** desarrollado para el Trabajo Especial de Desarrollo Full Stack Web.

Este repositorio contiene el **frontend** y el **backend/orquestador** del sistema.

El frontend permite ingresar una URL objetivo, enviar la petición al backend, recibir el resultado del análisis y mostrar la información en cuatro paneles visuales.

El backend recibe la URL enviada desde el frontend y se comunica con el **robot scraper del Grupo 3**, que debe estar levantado por separado.

---

## Arquitectura del proyecto

```txt
Frontend
   ↓
Backend / Orquestador(Grupo 2)
   ↓
Robot Scraper - Grupo 3(no incluido en este repositorio)