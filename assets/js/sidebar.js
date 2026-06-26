document.addEventListener('DOMContentLoaded', () => {
    // Aplicar únicamente en PC y Tablet (ancho de pantalla >= 1024px)
    if (!window.matchMedia("(min-width: 1024px)").matches) return;

    const sidebar = document.querySelector('aside');
    if (!sidebar) return;

    // Asegurar que el aside padre tenga posicionamiento relativo
    sidebar.classList.add('relative');

    const sidebarContent = sidebar.querySelector('div');
    if (!sidebarContent) return;

    // Detectar el color de acento de la página para pintar la flecha del mismo color
    let accentBg = 'bg-amber-600';
    if (sidebarContent.querySelector('.bg-emerald-600') || sidebarContent.querySelector('.text-emerald-700')) {
        accentBg = 'bg-emerald-600';
    } else if (sidebarContent.querySelector('.bg-cyan-600') || sidebarContent.querySelector('.text-cyan-700')) {
        accentBg = 'bg-cyan-600';
    }

    // Crear el indicador flotante para bajar (Down)
    const scrollDownIndicator = document.createElement('div');
    scrollDownIndicator.id = 'sidebar-scroll-down';
    scrollDownIndicator.className = `cursor-pointer absolute bottom-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full ${accentBg} text-white shadow-lg border border-white/10 transition-all duration-300 opacity-0 animate-bounce z-20 hover:scale-110 active:scale-95`;
    scrollDownIndicator.innerHTML = `
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M19 9l-7 7-7-7"></path>
        </svg>
    `;
    
    // Crear el indicador flotante para subir (Up)
    const scrollUpIndicator = document.createElement('div');
    scrollUpIndicator.id = 'sidebar-scroll-up';
    scrollUpIndicator.className = `cursor-pointer absolute top-4 left-1/2 -translate-x-1/2 flex h-8 w-8 items-center justify-center rounded-full ${accentBg} text-white shadow-lg border border-white/10 transition-all duration-300 opacity-0 animate-bounce z-20 hover:scale-110 active:scale-95`;
    scrollUpIndicator.innerHTML = `
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3.5" d="M5 15l7-7 7 7"></path>
        </svg>
    `;

    // Al hacer click en bajar, realizar scroll suave hasta abajo del menú
    scrollDownIndicator.addEventListener('click', () => {
        sidebarContent.scrollTo({
            top: sidebarContent.scrollHeight,
            behavior: 'smooth'
        });
    });

    // Al hacer click en subir, realizar scroll suave hasta arriba del menú
    scrollUpIndicator.addEventListener('click', () => {
        sidebarContent.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Añadir ambos indicadores al sidebar
    sidebar.appendChild(scrollDownIndicator);
    sidebar.appendChild(scrollUpIndicator);

    // Función para validar la visibilidad de los indicadores según el scroll
    function checkSidebarScroll() {
        // Si el menú está colapsado no mostramos ningún indicador
        if (sidebar.classList.contains('collapsed')) {
            scrollDownIndicator.classList.remove('opacity-100');
            scrollDownIndicator.classList.add('opacity-0');
            scrollUpIndicator.classList.remove('opacity-100');
            scrollUpIndicator.classList.add('opacity-0');
            return;
        }

        const hasScroll = sidebarContent.scrollHeight > sidebarContent.clientHeight;
        const scrolledToBottom = sidebarContent.scrollHeight - sidebarContent.scrollTop <= sidebarContent.clientHeight + 25;
        const scrolledToTop = sidebarContent.scrollTop <= 15;

        // Visibilidad indicador de bajar
        if (hasScroll && !scrolledToBottom) {
            scrollDownIndicator.classList.remove('opacity-0');
            scrollDownIndicator.classList.add('opacity-100');
        } else {
            scrollDownIndicator.classList.remove('opacity-100');
            scrollDownIndicator.classList.add('opacity-0');
        }

        // Visibilidad indicador de subir
        if (hasScroll && !scrolledToTop) {
            scrollUpIndicator.classList.remove('opacity-0');
            scrollUpIndicator.classList.add('opacity-100');
        } else {
            scrollUpIndicator.classList.remove('opacity-100');
            scrollUpIndicator.classList.add('opacity-0');
        }
    }

    // Agregar listeners de scroll y cambio de ventana
    sidebarContent.addEventListener('scroll', checkSidebarScroll);
    window.addEventListener('resize', checkSidebarScroll);

    // Escuchar el click en el botón de colapsar si existe en la página
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            // Pequeño timeout para permitir la transición CSS del menú antes de verificar
            setTimeout(checkSidebarScroll, 450);
        });
    }

    // Ejecutar verificación inicial
    setTimeout(checkSidebarScroll, 300);
});
