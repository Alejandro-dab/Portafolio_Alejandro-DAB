// pointerEffect.js (EL CÓDIGO PESADO)

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';

// --- Variables Globales de Three.js ---
let scene, camera, renderer;
let mouse = new THREE.Vector3(999, 999, 999); 
let particles; 
const PARTICLE_COUNT = 1000; 
let positions = new Float32Array(PARTICLE_COUNT * 3);
let colors = new Float32Array(PARTICLE_COUNT * 3);
let particleProperties = []; 
let currentParticleIndex = 0; 
let hue = 0; 
const tempColor = new THREE.Color(); 

let isAnimating = false; //Variable para evitar que Three.js se inicie varias veces

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

function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    if (!camera || !event || typeof event.clientX !== 'number') return;

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
    mouse.lerp(targetPosition, 0.12); //Suavnizamos la transición del mouse al valor objetivo
} 

function animateThreeJS() {
    if (!renderer || !scene || !camera || !particles) return;
     if (isAnimating) {
        // ya está corriendo: permitimos la recursividad natural del RAF
    } else {
        isAnimating = true;
    }
    
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
        // Offset sutil para que las partículas “persigan” sin tocar el puntero
        const offsetX = 0.3; // mover un poco a la derecha
        const offsetY = -0.15; // mover un poco hacia abajo

        positionsArray[index * 3] = mouse.x + offsetX;
        positionsArray[index * 3 + 1] = mouse.y + offsetY;
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
            prop.life -= 0.055;
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


// Esta es la función que exportaremos para ser llamada desde main.js
export function initPointerEffect(earlyStart = false) {
    try {
        //Evitamos inicializar dos veces
        if (renderer && renderer.domElement && document.body.contains(renderer.domElement)) {
        console.warn("Pointer effect ya estaba activo, se omite duplicado.");
        return;
}
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 15; 
        
        renderer = new THREE.WebGLRenderer({ 
            antialias: true, 
            alpha: true 
        });
        renderer.setClearColor(0x000000, 0); 
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // Estilamos el canvas para que siempre esté visible y no interfiera
        renderer.domElement.style.position = 'fixed';
        renderer.domElement.style.top = '0';
        renderer.domElement.style.left = '0';
        renderer.domElement.style.pointerEvents = 'none';
        renderer.domElement.style.zIndex = '9999';
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';

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

        //listeners (suena mejor en ingles)
        window.addEventListener('resize', onWindowResize, {passive:true});
        //Usamos wrapper para evitar errores, por si event no existe
        window.addEventListener('mousemove', (e) => onMouseMove(e), {passive:true});

        // Si earlyStart = true, fijamos posición inicial sin depender del movimiento real
        if (earlyStart && camera) {
            const vector = new THREE.Vector3(0, 0.31, 0); //a ver si ya no tapa mi nombre
            vector.unproject(camera);
            const dir = vector.sub(camera.position).normalize();
            const distance = -camera.position.z / dir.z;
            const position = camera.position.clone().add(dir.multiplyScalar(distance));
            mouse.copy(position); // Fijamos la posición exacta del vector de arriba
        }

        if (window.innerWidth < 768) return;

        // Iniciamos la animación
        animateThreeJS();

    } catch (error) {
        console.error("Error al inicializar Three.js:", error);
    }
}