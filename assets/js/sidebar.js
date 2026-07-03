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
    } else if (sidebarContent.querySelector('.bg-purple-600') || sidebarContent.querySelector('.text-purple-700')) {
        accentBg = 'bg-purple-600';
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
        { url: 'recon.html', label: 'Reconocimiento y Escaneo' },
        { url: 'exploit.html', label: 'Explotación y Wazuh' },
        { url: 'post.html', label: 'Post-Explotación' },
        { url: 'pentest.html', label: 'Informe de Pentest' }
    ] : [
        { url: 'setup.html', label: 'Montaje Pipeline' },
        { url: 'analysis.html', label: 'Análisis Inicial' },
        { url: 'dast_vuln.html', label: 'Mitigación DAST' },
        { url: 'dast_comp.html', label: 'Comparativa DAST' },
        { url: 'sast_vuln.html', label: 'Vulnerabilidad SAST' },
        { url: 'sast_comp.html', label: 'Reporte SAST' },
        { url: 'summary.html', label: 'Conclusiones Finales' },
        { url: 'threat.html', label: 'Modelado Threat' }
    ];

    const currentUrl = window.location.pathname.split('/').pop();
    const currentIndex = pasos.findIndex(p => p.url === currentUrl);

    if (currentIndex !== -1) {
        const floatNav = document.createElement('div');
        floatNav.className = 'fixed top-6 right-6 z-50 flex items-center gap-1.5 bg-white/90 text-slate-800 rounded-full p-1.5 shadow-xl border border-slate-200/80 backdrop-blur-md transition-all duration-300';
        
        let prevButton = '';
        let nextButton = '';

        if (currentIndex > 0) {
            const prev = pasos[currentIndex - 1];
            prevButton = `
                <a href="${prev.url}" title="Anterior: ${prev.label}" class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-800 border border-slate-200">
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

        // Hamburguesa flotante
        const menuHtml = `
            <div class="relative">
                <button id="float-menu-btn" title="Menú de Navegación" class="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-800 border border-slate-200">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
                <div id="float-menu-dropdown" class="hidden absolute right-0 top-12 w-56 rounded-2xl bg-white border border-slate-200 p-2 shadow-xl text-xs space-y-1 backdrop-blur-md">
                    ${pasos.map((p, idx) => `
                        <a href="${p.url}" class="block px-3 py-2 rounded-lg transition-colors ${idx === currentIndex ? accentBg + ' text-white font-bold' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}">
                            ${p.label}
                        </a>
                    `).join('')}
                    <div class="border-t border-slate-100 my-1"></div>
                    <a href="../index.html" class="block px-3 py-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                        ← Menú Principal
                    </a>
                </div>
            </div>
        `;

        floatNav.innerHTML = `
            ${prevButton}
            ${menuHtml}
            ${nextButton}
        `;

        document.body.appendChild(floatNav);

        // Inyectar CSS de vibración si no existe en la cabecera
        if (!document.getElementById('float-menu-shake-css')) {
            const style = document.createElement('style');
            style.id = 'float-menu-shake-css';
            style.innerHTML = `
                @keyframes floatMenuShake {
                    0%, 100% { transform: scale(1) rotate(0deg); }
                    15%, 45%, 75% { transform: scale(1.1) rotate(-4deg); }
                    30%, 60% { transform: scale(1.1) rotate(4deg); }
                }
                .shake-attention {
                    animation: floatMenuShake 0.7s ease-in-out 3;
                }
            `;
            document.head.appendChild(style);
        }

        // Determinar si es la página de entrada de cada flujo para mostrar siempre el aviso
        const neverShowAgain = localStorage.getItem('float_menu_tutorial_never_show') === 'true';
        const isFirstPageOfFlow = (currentUrl === 'recon.html' || currentUrl === 'setup.html');

        // Ejecutar vibración visual al cargar la página SOLO en la primera página de cada flujo y si ya se ha marcado el "no volver a mostrar"
        if (neverShowAgain && isFirstPageOfFlow) {
            setTimeout(() => {
                // Primera ejecución de la vibración
                floatNav.classList.add('shake-attention');
                setTimeout(() => {
                    floatNav.classList.remove('shake-attention');
                    
                    // Pausa de 2.2s antes de lanzar la segunda ejecución
                    setTimeout(() => {
                        floatNav.classList.add('shake-attention');
                        setTimeout(() => {
                            floatNav.classList.remove('shake-attention');
                        }, 2200);
                    }, 2200);
                    
                }, 2200);
            }, 800);
        }

        const showTutorial = !neverShowAgain && (isFirstPageOfFlow || !localStorage.getItem('float_menu_tutorial_shown'));

        if (showTutorial) {
            // Mapear colores de tema según el acento calculado de la página
            let themeBg = 'bg-amber-50';
            let themeBorder = 'border-amber-200';
            let themeText = 'text-amber-950';
            let themeTitle = 'text-amber-900';
            let themeButton = 'bg-amber-600 hover:bg-amber-700';

            if (accentBg === 'bg-red-600') {
                themeBg = 'bg-red-50';
                themeBorder = 'border-red-200';
                themeText = 'text-red-950';
                themeTitle = 'text-red-900';
                themeButton = 'bg-red-600 hover:bg-red-700';
            } else if (accentBg === 'bg-emerald-600') {
                themeBg = 'bg-emerald-50';
                themeBorder = 'border-emerald-200';
                themeText = 'text-emerald-950';
                themeTitle = 'text-emerald-900';
                themeButton = 'bg-emerald-600 hover:bg-emerald-700';
            } else if (accentBg === 'bg-cyan-600') {
                themeBg = 'bg-cyan-50';
                themeBorder = 'border-cyan-200';
                themeText = 'text-cyan-955';
                themeTitle = 'text-cyan-900';
                themeButton = 'bg-cyan-600 hover:bg-cyan-700';
            } else if (accentBg === 'bg-purple-600') {
                themeBg = 'bg-purple-50';
                themeBorder = 'border-purple-200';
                themeText = 'text-purple-950';
                themeTitle = 'text-purple-900';
                themeButton = 'bg-purple-600 hover:bg-purple-700';
            }

            const tutorialTip = document.createElement('div');
            // Tooltip estático (sin animación de rebote para fácil lectura) y con la flecha arriba señalando el botón
            tutorialTip.className = `absolute right-0 top-14 w-64 p-5 ${themeBg} border ${themeBorder} ${themeText} rounded-2xl shadow-2xl text-xs leading-relaxed z-50 flex flex-col gap-3 transition-opacity duration-300`;
            tutorialTip.innerHTML = `
                <div class="absolute -top-2 right-4 w-3.5 h-3.5 rotate-45 border-l border-t ${themeBorder} ${themeBg}"></div>
                <div class="font-extrabold text-sm flex items-center gap-1.5 ${themeTitle}">
                    <span>💡 Tip de Navegación</span>
                </div>
                <p class="font-medium text-[11px] leading-relaxed">Pulsa este botón para desplegar el menú general con todas las páginas de este laboratorio.</p>
                <div class="flex items-center gap-2 py-0.5 border-t border-slate-200/50 mt-1">
                    <input type="checkbox" id="never-show-again-chk" class="rounded border-slate-300 text-slate-700 focus:ring-0 cursor-pointer h-3.5 w-3.5">
                    <label for="never-show-again-chk" class="select-none cursor-pointer font-semibold text-[10px] text-slate-600">No volver a mostrar</label>
                </div>
                <button id="close-tutorial-btn" class="w-full ${themeButton} text-white font-bold rounded-xl py-2 transition-colors uppercase tracking-wider text-[10px] shadow-sm">Entendido</button>
            `;
            const relativeWrapper = floatNav.querySelector('.relative');
            if (relativeWrapper) {
                relativeWrapper.appendChild(tutorialTip);

                const closeTutorialBtn = tutorialTip.querySelector('#close-tutorial-btn');
                const neverShowChk = tutorialTip.querySelector('#never-show-again-chk');
                if (closeTutorialBtn) {
                    closeTutorialBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        tutorialTip.remove();
                        localStorage.setItem('float_menu_tutorial_shown', 'true');
                        // Si marca el checkbox, guardamos la exclusión definitiva
                        if (neverShowChk && neverShowChk.checked) {
                            localStorage.setItem('float_menu_tutorial_never_show', 'true');
                        }
                    });
                }

                // Autocierre después de 15 segundos si el usuario no interactúa
                setTimeout(() => {
                    if (tutorialTip.parentNode) {
                        tutorialTip.remove();
                        localStorage.setItem('float_menu_tutorial_shown', 'true');
                    }
                }, 15000);
            }
        }

        // Control del toggle del menú hamburguesa
        const menuBtn = floatNav.querySelector('#float-menu-btn');
        const dropdown = floatNav.querySelector('#float-menu-dropdown');
        if (menuBtn && dropdown) {
            menuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                dropdown.classList.toggle('hidden');
                // Al abrir el menú principal, removemos el tutorial por si seguía activo
                const activeTutorial = floatNav.querySelector('.animate-bounce');
                if (activeTutorial) {
                    activeTutorial.remove();
                    localStorage.setItem('float_menu_tutorial_shown', 'true');
                }
            });
            document.addEventListener('click', () => {
                dropdown.classList.add('hidden');
            });
        }
    }
});
