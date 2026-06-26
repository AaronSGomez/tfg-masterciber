document.addEventListener('DOMContentLoaded', () => {
    // Aplicar únicamente a imágenes dentro de las secciones de contenido de la web
    const images = document.querySelectorAll('main img, section img');
    if (images.length === 0) return;

    // Crear la estructura HTML del modal si no existe
    let modal = document.getElementById('image-lightbox-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'image-lightbox-modal';
        modal.className = 'fixed inset-0 z-[100] hidden flex items-center justify-center bg-slate-950/90 backdrop-blur-md select-none transition-opacity duration-300 opacity-0';
        
        modal.innerHTML = `
            <!-- Botón de Cerrar -->
            <button id="lightbox-close" class="absolute top-6 right-6 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all text-2xl border border-white/10 shadow-lg active:scale-95" title="Cerrar (Esc)">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>

            <!-- Controles Flotantes inferiores -->
            <div class="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2 rounded-2xl bg-slate-900/80 p-2.5 backdrop-blur-md border border-white/10 shadow-2xl">
                <button id="lightbox-zoom-out" class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95" title="Alejar (-)">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M20 12H4"></path>
                    </svg>
                </button>
                <button id="lightbox-zoom-reset" class="flex h-10 px-4 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all text-xs font-bold font-mono tracking-wider active:scale-95" title="Restaurar escala">
                    RESET (1:1)
                </button>
                <button id="lightbox-zoom-in" class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all active:scale-95" title="Acercar (+)">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"></path>
                    </svg>
                </button>
            </div>

            <!-- Contenedor de la Imagen con Cursor Grab -->
            <div id="lightbox-img-container" class="w-full h-full flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing">
                <img id="lightbox-img" class="max-w-[92%] max-h-[86%] object-contain transition-transform duration-150 ease-out origin-center pointer-events-none" src="" alt="Zoomed view" draggable="false">
            </div>
        `;
        document.body.appendChild(modal);
    }

    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close');
    const zoomInBtn = document.getElementById('lightbox-zoom-in');
    const zoomOutBtn = document.getElementById('lightbox-zoom-out');
    const zoomResetBtn = document.getElementById('lightbox-zoom-reset');
    const imgContainer = document.getElementById('lightbox-img-container');

    let scale = 1;
    let isDragging = false;
    let startX = 0, startY = 0;
    let translateX = 0, translateY = 0;

    // Configurar cursor y click en las imágenes de origen
    images.forEach(img => {
        img.classList.add('cursor-zoom-in');
        img.addEventListener('click', () => {
            lightboxImg.src = img.src;
            modal.classList.remove('hidden');
            setTimeout(() => {
                modal.classList.remove('opacity-0');
                modal.classList.add('opacity-100');
            }, 10);
            resetZoom();
        });
    });

    // Cerrar modal
    function closeModal() {
        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }

    closeBtn.addEventListener('click', closeModal);
    
    // Cerrar si hacen click en el fondo oscuro
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target === imgContainer) {
            closeModal();
        }
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
            closeModal();
        }
    });

    // Aplicar transformación
    function applyTransform() {
        lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    }

    // Resetear zoom
    function resetZoom() {
        scale = 1;
        translateX = 0;
        translateY = 0;
        applyTransform();
    }

    // Zoom manual
    zoomInBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        scale = Math.min(scale + 0.35, 5);
        applyTransform();
    });

    zoomOutBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        scale = Math.max(scale - 0.35, 0.5);
        applyTransform();
    });

    zoomResetBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        resetZoom();
    });

    // Zoom por rueda del ratón
    imgContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const step = 0.15;
        if (e.deltaY < 0) {
            scale = Math.min(scale + step, 5);
        } else {
            scale = Math.max(scale - step, 0.5);
        }
        applyTransform();
    }, { passive: false });

    // Lógica para arrastrar/papear (Drag and Pan)
    imgContainer.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        imgContainer.setPointerCapture(e.pointerId);
    });

    imgContainer.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        applyTransform();
    });

    imgContainer.addEventListener('pointerup', (e) => {
        isDragging = false;
        imgContainer.releasePointerCapture(e.pointerId);
    });

    imgContainer.addEventListener('pointercancel', (e) => {
        isDragging = false;
    });
});
