// main.js (EL CÓDIGO LIGERO)

document.addEventListener('DOMContentLoaded', () => {
    
    // --- INICIALIZADORES LIGEROS ---
    setupHeroCanvas(); 
    setupScrollAnimations();
    
    // Forzamos manualmente una actualización de tamaño
    if (typeof resizeHeroCanvas === 'function') {
        resizeHeroCanvas(); // Llama al resize de los "gusanitos"
    }
});

// ----------------------------------------------------------------------
// 1. LÓGICA CANVAS HERO (Ramificaciones 2D)
// (Este es ligero y se queda aquí)
// ----------------------------------------------------------------------

class Branch {
    constructor(x, y, canvasWidth, canvasHeight) {
        this.x = x;
        this.y = y;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.hue = 240 + Math.random() * 60; 
        this.color = `hsl(${this.hue}, 100%, 70%)`;
        this.lineWidth = Math.random() * 2 + 1;
        this.life = Math.random() * 200 + 100; 
        this.vx = (Math.random() - 0.5) * 4; 
        this.vy = (Math.random() - 0.5) * 4; 
    }
    update() {
        this.life--;
        if (Math.random() < 0.05) {
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 0.5) * 4;
        }
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > this.canvasWidth || this.y < 0 || this.y > this.canvasHeight) {
            this.life = 0;
        }
        return this.life > 0;
    }
    draw(ctx) {
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.lineWidth;
        ctx.beginPath();
        ctx.moveTo(this.x - this.vx, this.y - this.vy); 
        ctx.lineTo(this.x, this.y); 
        ctx.stroke();
    }
}

function setupHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) {
        console.warn('No se encontró el #hero-canvas.');
        return;
    }

    const ctx = canvas.getContext('2d');
    let branches = [];
    const MAX_BRANCHES = 50; 

    // Hacemos esta función global para llamarla desde DOMContentLoaded
    window.resizeHeroCanvas = () => { 
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function animateHeroCanvas() {
        ctx.fillStyle = 'rgba(2, 2, 39, 0.08)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if (branches.length < MAX_BRANCHES && Math.random() < 0.3) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            branches.push(new Branch(x, y, canvas.width, canvas.height));
        }

        for (let i = branches.length - 1; i >= 0; i--) {
            const branch = branches[i];
            if (branch.update()) {
                branch.draw(ctx);
            } else {
                branches.splice(i, 1);
            }
        }
        requestAnimationFrame(animateHeroCanvas);
    }

    resizeHeroCanvas();
    animateHeroCanvas();
    window.addEventListener('resize', resizeHeroCanvas); // Aseguramos el resize
}

// ----------------------------------------------------------------------
// 2. LÓGICA DE SCROLL (Animaciones de Entrada Simples)
// (Este también es ligero y se queda)
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
            threshold: 0.2 // Se activa cuando el 10% de la sección es visible 
        };

        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-animated');
                    // observer.unobserve(entry.target); // Descomenta si solo quieres que se anime una vez
                } else {
                    entry.target.classList.remove('is-animated'); // Comenta si solo quieres una vez
                }
            });
        }, observerOptions);

        sections.forEach(section => {
            section.classList.add('is-hidden');
            observer.observe(section);
        });

    } catch (error) {
        console.error("Error en setupScrollAnimations:", error);
    }
}

// En main.js, DENTRO de document.addEventListener('DOMContentLoaded', () => { ... });

    // Llamamos a la función de inmediato para que cargue en segundo plano
    loadPointerEffect();

    async function loadPointerEffect() {
        try {
            // Importación dinámica: Solo descarga este archivo cuando se llama a la función
            const pointerModule = await import('./pointerEffect.js');
            
            // Una vez cargado, llama a la función que inicia todo
            pointerModule.initPointerEffect();

        } catch (error) {
            console.error("No se pudo cargar el módulo del puntero:", error);
        }
    }