// Importar CDN de la librería three.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';


// Esta función crea un "punto de luz" suave usando un <canvas> 2D
// y lo convierte en una textura para Three.js.
function createParticleTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    // 1. Limpiamos el lienzo por completo con transparencia
    // Esto es CRUCIAL para que no haya un fondo blanco/negro opaco.
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    
    // Dibuja un gradiente radial (blanco en el centro, transparente en los bordes)
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width / 2
    );
    // Nota: El punto más interno debe ser opaco (1) y el borde totalmente transparente (0)
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    return new THREE.CanvasTexture(canvas);
}

// --- Configuración Básica ---
let scene, camera, renderer;
// ¡IMPORTANTE! Inicializamos el mouse en (0, 0, 0)
let mouse = new THREE.Vector3(0, 0, 0); 
let particles; // El objeto que contendrá todas las partículas
const PARTICLE_COUNT = 5000; // 5000 partículas para un humo denso

// --- ATRIBUTOS DE PARTÍCULAS ---
let positions = new Float32Array(PARTICLE_COUNT * 3);
let colors = new Float32Array(PARTICLE_COUNT * 3);
// Eliminamos 'alphas' y 'onBeforeCompile' para máxima estabilidad
let particleProperties = []; 

// --- Variables de Animación ---
let currentParticleIndex = 0; 
let hue = 0; 
const tempColor = new THREE.Color(); 

// --- Inicialización ---
function init() {
    scene = new THREE.Scene();

    // Usamos una posición de cámara cercana para mapear mejor el mouse
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
        size: 0.24, // TAMAÑO AJUSTADO: Más pequeño y sutil
        blending: THREE.AdditiveBlending, 
        transparent: true,
        depthWrite: false,
        vertexColors: true, // ¡La clave para que el color de cada partícula funcione!
        
        // --- ¡USAR LA TEXTURA DEL CANVAS 2D! ---
        map: createParticleTexture(), // Llamamos a la función corregida
        
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
    
    // 2. Proyectar la posición del mouse en un plano de la cámara (profundidad z=0.5 es un buen punto de partida)
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
    // El 0.1 es el factor de suavizado.
    mouse.lerp(targetPosition, 0.1);
}

// --- Loop de Animación ---
function animate() {
    requestAnimationFrame(animate); 

    // --- 1. Rotación de Color (RGB Rotativo) ---
    hue = (hue + 0.005) % 1; 
    // Luminosidad AJUSTADA A 0.5: Menos brillo para recuperar los tonos RGB
    tempColor.setHSL(hue, 1.0, 0.5); 

    // --- 2. "Reciclaje" de Partículas (Humo) ---
    const positionsArray = particles.geometry.attributes.position.array;
    const colorsArray = particles.geometry.attributes.color.array;

    const particlesToSpawn = 35; //Cantidad de particulas 
    
    for (let i = 0; i < particlesToSpawn; i++) {
        let index = currentParticleIndex;
        let prop = particleProperties[index];

        prop.life = 1.0; // Resetea su "vida"
        
        // Se coloca la partícula en la posición interpolada del mouse
        positionsArray[index * 3] = mouse.x;
        positionsArray[index * 3 + 1] = mouse.y;
        positionsArray[index * 3 + 2] = mouse.z;

        prop.velocity.set(
            (Math.random() - 0.5) * 0.1, // Expansión X
            (Math.random() - 0.5) * 0.1, // Expansión Y
            (Math.random() - 0.5) * 0.1  // Expansión Z
        );
        
        // Asignamos el color con luminosidad 0.5
        tempColor.setHSL(hue + (Math.random() - 0.5) * 0.05, 1.0, 0.5);
        colorsArray[index * 3] = tempColor.r;
        colorsArray[index * 3 + 1] = tempColor.g;
        colorsArray[index * 3 + 2] = tempColor.b;
        
        currentParticleIndex = (currentParticleIndex + 1) % PARTICLE_COUNT;
    }

    // --- 3. Actualización de TODAS las partículas ---
    // --- 3. Actualización de TODAS las partículas ---
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
        // --- Evita sombras y residuos ---
        // Mueve la partícula lejos del campo de visión temporalmente.
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

// --- ¡Empezar! ---
init();
animate();