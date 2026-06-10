# 🧑‍💻 Portafolio Personal | Alejandro Del Angel Bahena

Portafolio web personal desarrollado desde cero, diseñado para presentar experiencia profesional, proyectos y habilidades técnicas. El proyecto prioriza el rendimiento y la experiencia visual mediante animaciones procedurales en canvas 2D y efectos de partículas 3D reactivos al puntero, todo con carga diferida y arquitectura modular de JavaScript.

Los efectos visuales (canvas 2D y partículas 3D con Three.js) fueron desarrollados con asistencia de IA (Claude, Gemini), integrando y adaptando el código dentro de una arquitectura modular propia. Esto como parte del proceso de aprendizaje para explorar la integración de estas tecnologías en arquitecturas web modernas.

---

## ✨ Características Clave

* **Fondo animado con Canvas 2D:** Sistema de ramificaciones procedurales que genera trayectorias aleatorias en tiempo real sobre un `<canvas>` de pantalla completa, creando un efecto visual dinámico en la sección hero.
* **Efecto de partículas 3D con Three.js:** Un sistema de 1,000 partículas renderizadas con WebGL que siguen la posición del cursor con suavizado (`lerp`), con ciclo de color HSL continuo, blending aditivo y desvanecimiento progresivo por vida útil.
* **Carga diferida y modular:** Los efectos pesados (`pointerEffect.js`) se cargan de forma asíncrona con `import()` dinámico desde `main.js`, garantizando que el hilo principal no se bloquee en la carga inicial.
* **Animaciones de scroll con IntersectionObserver:** Cada sección entra y sale de la vista con transiciones CSS activadas mediante la API nativa `IntersectionObserver`, sin dependencias externas.
* **Optimización de recursos:** Uso de `<link rel="preload">` para fuentes e iconos, imágenes en formato `.webp` con `loading="lazy"` y `fetchpriority="high"` en el recurso crítico.
* **Diseño responsive con secciones claras:** Estructura semántica con `<header>`, `<main>`, `<section>`, `<article>` y `<footer>`, organizada en secciones de Presentación, Experiencia, Proyectos, Habilidades, Sobre mí y Contacto.
* **Analytics integrado:** Google Tag Manager configurado para seguimiento de vistas sin afectar el rendimiento de carga.

---

## 🛠️ Stack Tecnológico

El portafolio utiliza exclusivamente tecnologías web nativas y una librería 3D, sin frameworks ni bundlers.

### Frontend

* **HTML5:** Estructura semántica completa con metadatos, atributos de accesibilidad y optimizaciones de carga (`preload`, `fetchpriority`, `loading`).
* **CSS3:** Estilos personalizados en `assets/css/styles.css` con variables CSS, animaciones de scroll y diseño responsive.
* **JavaScript (ES6+ Módulos nativos):** Arquitectura dividida en dos módulos con responsabilidades separadas:
    + `main.js` — Orquestador ligero: inicializa las animaciones de scroll, gestiona el canvas 2D y carga de forma asíncrona el módulo pesado.
    + `pointerEffect.js` — Módulo de efectos 3D: encapsula toda la lógica de Three.js (escena, cámara, renderer, geometría de partículas y bucle de animación).

### Librerías Externas (CDN)

* **Three.js (r0.157.0):** Motor de gráficos 3D/WebGL utilizado para el sistema de partículas reactivo al puntero. Importado como módulo ES6 desde jsDelivr.
* **Devicons:** Iconos SVG de tecnologías para la sección de Habilidades, cargados desde CDN con `preload`.
* **Google Fonts:** Familias tipográficas Lato, Montserrat y Nunito Sans con carga no bloqueante.

### Herramientas y Entorno

* **Git & GitHub:** Control de versiones y alojamiento del repositorio.
* **Google Tag Manager:** Medición de visitas integrada en el `<head>` sin afectar el rendimiento crítico de renderizado.

---

## 📁 Estructura del Proyecto

```
portafolio/
├── index.html                  # Documento principal (HTML semántico)
├── assets/
│   ├── css/
│   │   └── styles.css          # Todos los estilos del sitio
│   ├── js/
│   │   ├── main.js             # Módulo ligero: canvas 2D + orquestador
│   │   └── pointerEffect.js    # Módulo pesado: Three.js + partículas 3D
│   ├── images/
│   │   ├── Perfil.webp         # Foto de perfil principal (hero)
│   │   ├── Perfil_1.webp       # Foto de perfil secundaria (sobre mí)
│   │   ├── Ipn.webp            # Logo del IPN
│   │   ├── citibanamex.webp    # Representación de la reestructuración de Citibanamex
│   │   ├── Reelbox_0.webp      # Preview proyecto Reelbox
│   │   ├── Login_register_0.webp # Preview proyecto Login Register
│   │   └── A.ico               # Favicon
│   └── documents/
│       └── CV_Alejandro_Del_Angel_Bahena_FullStack.pdf  # CV descargable
```

---

## 🚀 Instalación y Puesta en Marcha

### Requisitos

* Un navegador moderno con soporte para ES Modules y WebGL (Chrome, Firefox, Edge, Safari actuales).
* Un servidor HTTP local (no se puede abrir directamente con `file://` por las restricciones de CORS con módulos ES6).

### Opción 1: VS Code + Live Server (Recomendada)

1. Clona el repositorio:
```bash
git clone https://github.com/Alejandro-dab/<nombre-del-repo>.git
```
2. Abre la carpeta del proyecto en VS Code.
3. Instala la extensión **Live Server** de Ritwick Dey.
4. Haz clic derecho sobre `index.html` → **"Open with Live Server"**.
5. El sitio estará disponible en `http://127.0.0.1:5500`.

### Opción 2: Python (sin instalaciones adicionales)

1. Clona el repositorio y navega a la carpeta del proyecto:
```bash
git clone https://github.com/Alejandro-dab/<nombre-del-repo>.git
cd <nombre-del-repo>
```
2. Levanta un servidor HTTP con Python:
```bash
# Python 3
python -m http.server 8080
```
3. Navega a `http://localhost:8080` en tu navegador.

### Opción 3: Node.js con `serve`

```bash
npx serve .
```

> ⚠️ **Nota sobre el efecto de partículas:** El `pointerEffect.js` se desactiva automáticamente en pantallas menores a 768px de ancho (móvil) para preservar el rendimiento. El resto de animaciones funcionan en todos los dispositivos.

---

## 🔗 Proyectos Incluidos en el Portafolio

| Proyecto | Descripción | Demo | Repositorio |
|---|---|---|---|
| **Reelbox** | Catálogo de películas con integración a la API de TMDb | [Ver demo](https://reelbox-catalogopeliculas-production.up.railway.app) | [GitHub](https://github.com/Alejandro-dab/Reelbox-Catalogo_peliculas.git) |
| **Login Register** | Sistema completo de autenticación y registro con roles y gestión de sesiones | [Ver demo](https://loginregisterweb-production.up.railway.app) | [GitHub](https://github.com/Alejandro-dab/Login_Register_Web.git) |

---

## 📬 Contacto

* **Email:** alejandro_ab24@hotmail.com
* **GitHub:** [github.com/Alejandro-dab](https://github.com/Alejandro-dab)
