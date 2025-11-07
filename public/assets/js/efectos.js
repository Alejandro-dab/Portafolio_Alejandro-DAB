// Importar CDN de la librería three.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';

/* -------------------------------------------------------------------------- */
/* LÓGICA DE THREE.JS (ESTELA)                       */
/* -------------------------------------------------------------------------- */

// Esta función crea un "punto de luz" suave usando un <canvas> 2D
// y lo convierte en una textura para Three.js.
function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // 1. Limpiamos el lienzo por completo con transparencia
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    // Dibuja un gradiente radial (blanco en el centro, transparente en los bordes)
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

// --- Configuración Básica ---
let scene, camera, renderer;
let mouse = new THREE.Vector3(0, 0, 0); 
let particles; 
const PARTICLE_COUNT = 5000; 

// --- ATRIBUTOS DE PARTÍCULAS ---
let positions = new Float32Array(PARTICLE_COUNT * 3);
let colors = new Float32Array(PARTICLE_COUNT * 3);
let particleProperties = []; 

// --- Variables de Animación ---
let currentParticleIndex = 0; 
let hue = 0; 
const tempColor = new THREE.Color(); 

// --- Inicialización ---
function initThreeJS() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 15; 

    // Fondo transparente
    renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true // Habilitar transparencia
    });
    renderer.setClearColor(0x000000, 0); // Limpiar con color 100% transparente
    renderer.setSize(window.innerWidth, window.innerHeight);
    
    document.body.appendChild(renderer.domElement);

    // --- Creación de las Partículas ---
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

    // 3. Inicializar posiciones, propiedades
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        // Posiciones iniciales
        positions[i * 3] = 0;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = 1000; 

        // Colores iniciales
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

    // 4. Crear el objeto de Puntos
    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // --- Event Listeners ---
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('mousemove', onMouseMove);
}

// --- Funciones de Eventos ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    // 1. Convertir la posición 2D (pantalla) a posición 3D (mundo WebGL)
    const targetVector = new THREE.Vector3();
    
    // 2. Proyectar la posición del mouse en un plano de la cámara
    targetVector.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        - (event.clientY / window.innerHeight) * 2 + 1,
        0.5 
    );
    targetVector.unproject(camera);

    // 3. Calcular el objetivo real 3D
    const dir = targetVector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const targetPosition = camera.position.clone().add(dir.multiplyScalar(distance));
    
    // 4. Agregamos interpolación (mouse.lerp) para la "persecución fluida"
    mouse.lerp(targetPosition, 0.1);
}

// --- Loop de Animación ---
function animateThreeJS() {
    requestAnimationFrame(animateThreeJS); 

    // --- 1. Rotación de Color (RGB Rotativo) ---
    hue = (hue + 0.005) % 1; 
    tempColor.setHSL(hue, 1.0, 0.5); 

    // --- 2. "Reciclaje" de Partículas (Humo) ---
    const positionsArray = particles.geometry.attributes.position.array;
    const colorsArray = particles.geometry.attributes.color.array;

    const particlesToSpawn = 35; //Cantidad de particulas 
    
    for (let i = 0; i < particlesToSpawn; i++) {
        let index = currentParticleIndex;
        let prop = particleProperties[index];

        prop.life = 1.0; 
        
        // Se coloca la partícula en la posición interpolada del mouse
        positionsArray[index * 3] = mouse.x;
        positionsArray[index * 3 + 1] = mouse.y;
        positionsArray[index * 3 + 2] = mouse.z;

        prop.velocity.set(
            (Math.random() - 0.5) * 0.1, // Expansión X
            (Math.random() - 0.5) * 0.1, // Expansión Y
            (Math.random() - 0.5) * 0.1  // Expansión Z
        );
        
        // Asignamos el color
        tempColor.setHSL(hue + (Math.random() - 0.5) * 0.05, 1.0, 0.5);
        colorsArray[index * 3] = tempColor.r;
        colorsArray[index * 3 + 1] = tempColor.g;
        colorsArray[index * 3 + 2] = tempColor.b;
        
        currentParticleIndex = (currentParticleIndex + 1) % PARTICLE_COUNT;
    }

    // --- 3. Actualización de TODAS las partículas ---
    for (let i = 0; i < PARTICLE_COUNT; i++) {
        let prop = particleProperties[i];

        if (prop.life > 0) {
            // Vida natural y fluida
            prop.life -= 0.045;

            // Movimiento
            positionsArray[i * 3] += prop.velocity.x;
            positionsArray[i * 3 + 1] += prop.velocity.y;
            positionsArray[i * 3 + 2] += prop.velocity.z;
            prop.velocity.multiplyScalar(0.94);

            // --- Desvanecer color suavemente ---
            const fade = Math.pow(prop.life, 1.4);
            colorsArray[i * 3] *= fade;
            colorsArray[i * 3 + 1] *= fade;
            colorsArray[i * 3 + 2] *= fade;

        } else {
            // --- Mueve la partícula lejos del campo de visión temporalmente. ---
            positionsArray[i * 3] = 9999;
            positionsArray[i * 3 + 1] = 9999;
            positionsArray[i * 3 + 2] = 9999;

            // Asegúrate de que no aporte nada al blending
            colorsArray[i * 3] = 0;
            colorsArray[i * 3 + 1] = 0;
            colorsArray[i * 3 + 2] = 0;
        }
    }

    // --- 4. Avisar a Three.js que actualice ---
    particles.geometry.attributes.position.needsUpdate = true;
    particles.geometry.attributes.color.needsUpdate = true;

    // 5. Renderiza la escena
    renderer.render(scene, camera);
}


/* -------------------------------------------------------------------------- */
/* LÓGICA DE ANIMACIONES AL SCROLL                       */
/* -------------------------------------------------------------------------- */

// Clase CSS que contendrá la animación de entrada
const ANIMATION_CLASS = 'is-animated';
const HIDDEN_CLASS = 'is-hidden'; 

function setupScrollAnimations() {
    // 1. Obtener todas las secciones que deben animarse (excepto la primera)
    const sectionsToAnimate = document.querySelectorAll('main > section:not(:first-child)');

    // 2. Ocultar inicialmente todas las secciones animables
    sectionsToAnimate.forEach(section => {
        section.classList.add(HIDDEN_CLASS);
    });

    // 3. Configurar el Intersection Observer
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Si la sección es visible
                const section = entry.target;
                
                // 4. Agregar la clase de animación para revelarla
                section.classList.remove(HIDDEN_CLASS);
                section.classList.add(ANIMATION_CLASS);
                
                // Dejar de observar esta sección una vez que se ha animado
                observer.unobserve(section);
            }
        });
    }, {
        // La animación se activa cuando el 15% de la sección es visible
        rootMargin: '0px',
        threshold: 0.15 
    });

    // 5. Empezar a observar cada sección
    sectionsToAnimate.forEach(section => {
        observer.observe(section);
    });
}


/* -------------------------------------------------------------------------- */
/* PUNTO DE INICIO                               */
/* -------------------------------------------------------------------------- */

// Ejecuta toda la inicialización cuando el DOM esté listo
window.addEventListener('load', () => {
    // 1. Inicializa la estela de Three.js
    initThreeJS();
    animateThreeJS();

    // 2. Configura las animaciones de scroll
    setupScrollAnimations();
});