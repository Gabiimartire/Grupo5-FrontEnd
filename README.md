# CTU | Target Analyzer

Proyecto desarrollado para la materia **Desarrollo Full Stack Web**.

Este repositorio corresponde al **FrontEnd del Grupo 5**.
La interfaz permite ingresar una URL objetivo, iniciar un escaneo y visualizar los resultados recibidos desde los otros módulos del sistema.

> Importante: este repositorio corresponde al trabajo del **Grupo 5 en el FrontEnd**.
> El **Backend / Orquestador**, incluyendo `receptor.js`, pertenece al **Grupo 2**.
> El **Robot Scraper** pertenece al **Grupo 3**.

---

## Descripción general

**CTU | Target Analyzer** es una interfaz web con estilo táctico/futurista diseñada para mostrar información obtenida del análisis de un sitio web.

El usuario ingresa una URL objetivo y el sistema presenta los datos en distintos paneles visuales:

* Vista general del sitio.
* Tecnologías detectadas.
* Enlaces encontrados.
* Métricas del sitio.
* Información SEO.
* Imágenes obtenidas durante el análisis.
* Estados de carga, error y resultado del escaneo.

---

## Arquitectura del sistema

El proyecto completo funciona mediante la integración de tres grupos:

```txt
FrontEnd - Grupo 5
        ↓
Backend / Orquestador - Grupo 2
        ↓
Robot Scraper - Grupo 3
```

Cada grupo cumple una responsabilidad distinta dentro del sistema.

| Módulo                | Grupo   | Responsabilidad                                                                      |
| --------------------- | ------- | ------------------------------------------------------------------------------------ |
| FrontEnd              | Grupo 5 | Interfaz visual, paneles, animaciones y presentación de datos                        |
| Backend / Orquestador | Grupo 2 | Recibir la solicitud del FrontEnd, coordinar la comunicación y manejar `receptor.js` |
| Robot Scraper         | Grupo 3 | Procesar la URL objetivo, realizar el análisis y devolver los datos extraídos        |

---

## Contenido de este repositorio

Este repositorio contiene principalmente el trabajo correspondiente al **FrontEnd del Grupo 5**.

```txt
Grupo5-FrontEnd/
│
├── index.html
├── style.css
├── main.js
├── radar.js
├── package.json
│
├── resources/
├── sonidos/
└── services/
```

> Aclaración: si dentro del repositorio se encuentra `receptor.js`, ese archivo corresponde al **Backend / Orquestador del Grupo 2** y se utiliza para la integración del sistema.

---

## Tecnologías utilizadas

### FrontEnd

* HTML5
* CSS3
* JavaScript
* Lucide Icons
* Typed.js
* Leaflet

### Integración local

* Node.js
* Express
* CORS
* Helmet
* Morgan
* Express Rate Limit
* Node Cache

---

## Instalación

Clonar el repositorio:

```bash
git clone https://github.com/Gabiimartire/Grupo5-FrontEnd.git
```

Entrar a la carpeta del proyecto:

```bash
cd Grupo5-FrontEnd
```

Instalar las dependencias:

```bash
npm install
```

---

## Ejecución

Para iniciar el proyecto:

```bash
npm start
```

También puede ejecutarse manualmente con:

```bash
node receptor.js
```

> Aclaración: `receptor.js` pertenece al **Backend / Orquestador del Grupo 2**.
> Se menciona en este README porque forma parte de la integración necesaria para que el FrontEnd pueda comunicarse con el resto del sistema.

---

## Funcionamiento general

El flujo del sistema es el siguiente:

1. El usuario ingresa una URL en el FrontEnd.
2. El FrontEnd envía la solicitud de escaneo.
3. El Backend / Orquestador del Grupo 2 recibe la petición.
4. El Backend se comunica con el Robot Scraper del Grupo 3.
5. El Robot analiza la URL objetivo.
6. El Backend devuelve la información procesada.
7. El FrontEnd recibe los datos y los muestra en los paneles.

---

## Paneles de la interfaz

### Panel 1: Vista

Muestra información general del sitio analizado, como dominio, estado, imágenes y datos principales.

### Panel 2: Tecnología

Muestra las tecnologías detectadas en la página analizada.

### Panel 3: Enlaces

Lista los enlaces encontrados durante el análisis.

### Panel 4: Métricas

Presenta datos del sitio, métricas generales, palabras frecuentes e información SEO.

---

## Requisitos para el funcionamiento completo

Para que el sistema funcione correctamente, deben estar activos los tres módulos:

```txt
FrontEnd - Grupo 5
Backend / Orquestador - Grupo 2
Robot Scraper - Grupo 3
```

Si solo se ejecuta este repositorio, la interfaz puede cargar, pero el escaneo completo depende de que los servicios del Grupo 2 y Grupo 3 estén funcionando correctamente.

---

## Estado del proyecto

Proyecto académico en desarrollo, orientado a la integración entre grupos para construir una aplicación Full Stack de análisis web.

El objetivo del Grupo 5 es desarrollar una interfaz clara, funcional y visualmente atractiva para mostrar los resultados obtenidos por los demás módulos del sistema.

---

## Autoría

**FrontEnd:** Grupo 5
**Backend / Orquestador:** Grupo 2
**Archivo `receptor.js`:** Grupo 2
**Robot Scraper:** Grupo 3

Repositorio del FrontEnd:

```txt
https://github.com/Gabiimartire/Grupo5-FrontEnd
```
