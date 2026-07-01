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
    if (sidebarContent.querySelector('.bg-emerald-600') || sidebarContent.querySelector('.text-emerald-700') || sidebarContent.querySelector('.bg-emerald-650')) {
        accentBg = 'bg-emerald-600';
    } else if (sidebarContent.querySelector('.bg-cyan-600') || sidebarContent.querySelector('.text-cyan-700')) {
        accentBg = 'bg-cyan-600';
    } else if (sidebarContent.querySelector('.bg-red-650') || sidebarContent.querySelector('.text-red-700') || sidebarContent.querySelector('.bg-red-600')) {
        accentBg = 'bg-red-600';
    } else if (sidebarContent.querySelector('.bg-orange-600') || sidebarContent.querySelector('.text-orange-700')) {
        accentBg = 'bg-orange-600';
    } else if (sidebarContent.querySelector('.bg-amber-600') || sidebarContent.querySelector('.text-amber-700')) {
        accentBg = 'bg-amber-600';
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

    // ==========================================
    // BOTONERA DE FLUJO DEVSECOPS Y OFENSIVO FLOTANTE FIJA (SUPERIOR DERECHA)
    // ==========================================
    const isOfensivo = window.location.pathname.includes('/exploit/');
    const pasos = isOfensivo ? [
        { url: 'recon.html', label: 'Reconocimiento' },
        { url: 'exploit.html', label: 'Explotación y Detección' },
        { url: 'post_exploit.html', label: 'Post-Explotación' },
        { url: 'pentest.html', label: 'Informe de Pentest' }
    ] : [
        { url: 'setup.html', label: 'Montaje (Config)' },
        { url: 'analysis.html', label: 'Paso 1 (Análisis)' },
        { url: 'dast_vuln.html', label: 'Paso 2 (Mitigación DAST)' },
        { url: 'dast_comp.html', label: 'Paso 3 (Comparativa DAST)' },
        { url: 'sast_vuln.html', label: 'Paso 4 (Vulnerabilidad SAST)' },
        { url: 'sast_comp.html', label: 'Paso 5 (Reporte SAST)' },
        { url: 'summary.html', label: 'Paso Final (Conclusiones)' },
        { url: 'threat.html', label: 'Modelado (Threat Dragon)' }
    ];

    const currentUrl = window.location.pathname.split('/').pop();
    const currentIndex = pasos.findIndex(p => p.url === currentUrl);

    if (currentIndex !== -1) {
        const floatNav = document.createElement('div');
        floatNav.className = 'fixed top-6 right-6 z-50 flex items-center gap-1.5 bg-slate-950/80 text-white rounded-full p-1.5 shadow-2xl border border-slate-700/40 backdrop-blur-md transition-all duration-300';
        
        let prevButton = '';
        let nextButton = '';

        if (currentIndex > 0) {
            const prev = pasos[currentIndex - 1];
            prevButton = `
                <a href="${prev.url}" title="Anterior: ${prev.label}" class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-slate-200 transition-all hover:bg-slate-800 hover:text-white border border-slate-800">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"></path>
                    </svg>
                </a>
            `;
        }

        if (currentIndex < pasos.length - 1) {
            const next = pasos[currentIndex + 1];
            
            // Detectar el color de acento activo para el botón Siguiente
            let nextBtnBg = accentBg;
            
            nextButton = `
                <a href="${next.url}" title="Siguiente: ${next.label}" class="flex h-9 w-9 items-center justify-center rounded-full ${nextBtnBg} text-white transition-all hover:opacity-90 shadow-md">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"></path>
                    </svg>
                </a>
            `;
        }

        floatNav.innerHTML = `
            ${prevButton}
            ${nextButton}
        `;

        document.body.appendChild(floatNav);
    }
});
