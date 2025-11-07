
// Importar CDN de la librería three.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';

document.addEventListener('DOMContentLoaded', () => {
    
    // --- INICIALIZADORES ---
    initThreeJS();
    setupHeroCanvas(); 
    setupScrollAnimations();

    // --- ARREGLO PARA EL ZOOM y SCROLL ---
    // Forzamos manualmente una actualización de tamaño DESPUÉS de que todo se haya inicializado.
    // Esto soluciona el "zoom descomunal" en recargas forzadas (Ctrl+Shift+R).
    // (Asegura que las funciones 'onWindowResize' y 'resizeHeroCanvas' estén definidas fuera de sus 'setup')
    if (typeof onWindowResize === 'function') {
        onWindowResize(); // Llama al resize de Three.JS
    }
    if (typeof resizeHeroCanvas === 'function') { // Asegúrate de que 'resizeHeroCanvas' esté definida globalmente
        resizeHeroCanvas(); // Llama al resize de los "gusanitos"
    }
    
    // Forzar el scroll al inicio de la página en cada carga (movido al final)
    window.scrollTo(0, 0);
});
// ----------------------------------------------------------------------
// 1. CÓDIGO DE THREE.JS (Estela de Humo)
// (Tu código original, organizado en funciones)
// ----------------------------------------------------------------------

// --- Variables Globales de Three.js ---
let scene, camera, renderer;
let mouse = new THREE.Vector3(999, 999, 999); 
let particles; 
const PARTICLE_COUNT = 5000; 
let positions = new Float32Array(PARTICLE_COUNT * 3);
let colors = new Float32Array(PARTICLE_COUNT * 3);
let particleProperties = []; 
let currentParticleIndex = 0; 
let hue = 0; 
const tempColor = new THREE.Color(); 

function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    return new THREE.CanvasTexture(canvas);
}

function initThreeJS() {
    try {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 15; 
        
        renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        renderer.setClearColor(0x000000, 0); 
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Adjuntar el canvas de Three.js (estela) al body
        if (document.body.firstChild) {
            document.body.insertBefore(renderer.domElement, document.body.firstChild);
        } else {
            document.body.appendChild(renderer.domElement);
        }

        const geometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial({
            size: 0.24, 
            blending: THREE.AdditiveBlending, 
            transparent: true,
            depthWrite: false,
            vertexColors: true, 
            map: createParticleTexture(), 
            sizeAttenuation: true 
        });

        for (let i = 0; i < PARTICLE_COUNT; i++) {
            positions[i * 3] = 9999;
            positions[i * 3 + 1] = 9999;
            positions[i * 3 + 2] = 9999; 
            colors[i * 3] = 0;
            colors[i * 3 + 1] = 0;
            colors[i * 3 + 2] = 0;
            particleProperties.push({
                velocity: new THREE.Vector3(),
                life: 0 
            });
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles = new THREE.Points(geometry, material);
        scene.add(particles);

        window.addEventListener('resize', onWindowResize);
        window.addEventListener('mousemove', onMouseMove);

    } catch (error) {
        console.error("Error al inicializar Three.js:", error);
    }
}

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    if (!camera) return;
    const targetVector = new THREE.Vector3();
    targetVector.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        - (event.clientY / window.innerHeight) * 2 + 1,
        0.5 
    );
    targetVector.unproject(camera);
    const dir = targetVector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const targetPosition = camera.position.clone().add(dir.multiplyScalar(distance));
    mouse.lerp(targetPosition, 0.1);
}

function animateThreeJS() {
    if (!renderer || !scene || !camera || !particles) return;
    
    requestAnimationFrame(animateThreeJS); 

    hue = (hue + 0.005) % 1; 
    tempColor.setHSL(hue, 1.0, 0.5); 
    
    const positionsArray = particles.geometry.attributes.position.array;
    const colorsArray = particles.geometry.attributes.color.array;
    const particlesToSpawn = 35; 
    
    for (let i = 0; i < particlesToSpawn; i++) {
        let index = currentParticleIndex;
        let prop = particleProperties[index];
        prop.life = 1.0; 
        positionsArray[index * 3] = mouse.x;
        positionsArray[index * 3 + 1] = mouse.y;
        positionsArray[index * 3 + 2] = mouse.z;
        prop.velocity.set(
            (Math.random() - 0.5) * 0.1, 
            (Math.random() - 0.5) * 0.1, 
            (Math.random() - 0.5) * 0.1
        );
        tempColor.setHSL(hue + (Math.random() - 0.5) * 0.05, 1.0, 0.5);
        colorsArray[index * 3] = tempColor.r;
        colorsArray[index * 3 + 1] = tempColor.g;
        colorsArray[index * 3 + 2] = tempColor.b;
        currentParticleIndex = (currentParticleIndex + 1) % PARTICLE_COUNT;
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        let prop = particleProperties[i];
        if (prop.life > 0) {
            prop.life -= 0.045;
            positionsArray[i * 3] += prop.velocity.x;
            positionsArray[i * 3 + 1] += prop.velocity.y;
            positionsArray[i * 3 + 2] += prop.velocity.z;
            prop.velocity.multiplyScalar(0.94);
            const fade = Math.pow(prop.life, 1.4);
            colorsArray[i * 3] *= fade;
            colorsArray[i * 3 + 1] *= fade;
            colorsArray[i * 3 + 2] *= fade;
        } else {
            positionsArray[i * 3] = 9999;
            positionsArray[i * 3 + 1] = 9999;
            positionsArray[i * 3 + 2] = 9999;
            colorsArray[i * 3] = 0;
            colorsArray[i * 3 + 1] = 0;
            colorsArray[i * 3 + 2] = 0;
        }
    }

    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;
    renderer.render(scene, camera);
}

// ----------------------------------------------------------------------
// 2. NUEVO: LÓGICA CANVAS HERO (Ramificaciones 2D)
// ----------------------------------------------------------------------

/**
 * Clase para una "ramificación" (o tubería) individual.
 */
class Branch {
    constructor(x, y, canvasWidth, canvasHeight) {
        this.x = x;
        this.y = y;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        // Color HSL (Tono 240 es azul/morado, como tu --color-primary)
        this.hue = 240 + Math.random() * 60; // Tonos entre azul y magenta
        this.color = `hsl(${this.hue}, 100%, 70%)`;
        this.lineWidth = Math.random() * 2 + 1;
        this.life = Math.random() * 200 + 100; // Cuánto vive
        this.vx = (Math.random() - 0.5) * 4; // Velocidad X
        this.vy = (Math.random() - 0.5) * 4; // Velocidad Y
    }

    // Actualiza la posición y la vida
    update() {
        this.life--;

        // Cambia de dirección aleatoriamente
        if (Math.random() < 0.05) {
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 0.5) * 4;
        }

        // Mover
        this.x += this.vx;
        this.y += this.vy;

        // Comprobar bordes (si sale, "muere")
        if (this.x < 0 || this.x > this.canvasWidth || this.y < 0 || this.y > this.canvasHeight) {
            this.life = 0;
        }

        return this.life > 0;
    }

    // Dibuja la línea
    draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.moveTo(this.x - this.vx, this.y - this.vy); // Desde la posición anterior
        ctx.lineTo(this.x, this.y); // Hasta la nueva posición
        ctx.stroke();
    }
}

/**
 * Configura y anima el canvas de la sección 'hero'.
 */
function setupHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) {
        console.warn('No se encontró el #hero-canvas. Saltando animación de ramificaciones.');
        return;
    }

    const ctx = canvas.getContext('2d');
    let branches = [];
    const MAX_BRANCHES = 50; // Número máximo de ramificaciones en pantalla

    // Ajustar tamaño del canvas a su contenedor
    function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    }

    // Loop de animación para el hero canvas
    function animateHeroCanvas() {
        // 1. Desvanecer lentamente el canvas para el efecto de "desaparición"
        // Usa el color de fondo oscuro para el desvanecimiento
        ctx.fillStyle = 'rgba(2, 2, 39, 0.08)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 2. Crear nuevas ramificaciones aleatoriamente
        if (branches.length < MAX_BRANCHES && Math.random() < 0.3) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            branches.push(new Branch(x, y, canvas.width, canvas.height));
        }

        // 3. Actualizar y dibujar cada ramificación (en reversa para poder eliminar)
        for (let i = branches.length - 1; i >= 0; i--) {
            const branch = branches[i];
            if (branch.update()) {
                branch.draw(ctx);
            } else {
                // Si la ramificación "muere", se elimina del array
                branches.splice(i, 1);
            }
        }

        requestAnimationFrame(animateHeroCanvas);
    }

    // Iniciar
    resizeCanvas();
    animateHeroCanvas();

    // Reajustar si la ventana cambia de tamaño
    window.addEventListener('resize', resizeCanvas);
}


// ----------------------------------------------------------------------
// 3. LÓGICA DE SCROLL (Animaciones de Entrada Simples)
// (Esta es la versión estable que SÍ funcionaba)
// ----------------------------------------------------------------------
function setupScrollAnimations() {
    try {
        const sections = document.querySelectorAll('section');
        if (sections.length === 0) {
            console.warn('No se encontraron secciones para animar.');
            return;
        }

        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1 // Se activa cuando el 10% de la sección es visible
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Añade la clase 'is-animated' para mostrar la sección
                    entry.target.classList.add('is-animated');
                    
                    // Opcional: deja de observar una vez que se ha animado
                    // observer.unobserve(entry.target); 
                } else {
                    // Opcional: Si quieres que la animación se repita al salir y volver
                    entry.target.classList.remove('is-animated');
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            // Oculta la sección al inicio
            section.classList.add('is-hidden');
            // Empieza a observar la sección
            observer.observe(section);
        });

    } catch (error) {
        console.error("Error en setupScrollAnimations:", error);
    }
}


// ----------------------------------------------------------------------
// 4. INICIALIZACIÓN DE TODO
// ----------------------------------------------------------------------

// Iniciar Three.js (Estela de mouse)
initThreeJS();
animateThreeJS();

// Iniciar las animaciones del DOM (Scroll y Hero Canvas)
document.addEventListener('DOMContentLoaded', () => {
    setupScrollAnimations();
    setupHeroCanvas(); // <-- ¡NUEVA FUNCIÓN AÑADIDA!
});