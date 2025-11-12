// pointerEffect.js (EL CÓDIGO PESADO)

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.157.0/build/three.module.js';

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
    // ... (Tu función createParticleTexture va aquí sin cambios) ...
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

// Esta es la función que exportaremos para ser llamada desde main.js
export function initPointerEffect() {
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

        // Iniciamos la animación
        animateThreeJS();

    } catch (error) {
        console.error("Error al inicializar Three.js:", error);
    }
}