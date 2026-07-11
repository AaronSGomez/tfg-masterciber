const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { execFile } = require('child_process');

// Lista de archivos en el orden en que se compilarán en el PDF
const files = [
    { name: "Levantamiento del Laboratorio (Fase 1)", path: "lab/install.html", id: "lab-install" },
    { name: "Reconocimiento Perimetral y OSINT (Fase 2)", path: "exploit/recon.html", id: "exploit-recon" },
    { name: "Análisis y Explotación de Vulnerabilidades (Fase 2)", path: "exploit/exploit.html", id: "exploit-exploit" },
    { name: "Post-Explotación de Entornos (Fase 2)", path: "exploit/post.html", id: "exploit-post" },
    { name: "Informe Técnico de Pentesting (Fase 2)", path: "exploit/pentest.html", id: "exploit-pentest" },
    { name: "Análisis de Código Estático y Dinámico (Fase 3)", path: "pipeline/analysis.html", id: "pipeline-analysis" },
    { name: "Modelado de Amenazas STRIDE (Fase 3)", path: "pipeline/threat.html", id: "pipeline-threat" },
    { name: "Pipeline DevSecOps Automatizado (Fase 3)", path: "pipeline/setup.html", id: "pipeline-setup" },
    { name: "Autenticación Robusta y MFA (Fase 4)", path: "mfa/mfa.html", id: "mfa-mfa" },
    { name: "Reglas de Firewall y Búnker Perimetral (Fase 4)", path: "firewall/firewall.html", id: "firewall-firewall" },
    { name: "Campaña de Phishing Controlado Gophish (Fase 4)", path: "gophish/gophish.html", id: "gophish-gophish" },
    { name: "Monitorización y Casos de Uso SIEM (Fase 5)", path: "siem/siem.html", id: "siem-siem" },
    { name: "Análisis Forense Digital con Autopsy (Fase 5)", path: "forensics/forensics.html", id: "forensics-forensics" },
    { name: "Políticas de Seguridad de la Información (Fase 6)", path: "gob/politica_documentada.html", id: "gob-politica_documentada" },
    { name: "Gestión de Riesgos y Plan Director (Fase 6)", path: "gob/gob.html", id: "gob-gob" },
    { name: "Despliegue y Orquestación SOAR (Extra)", path: "soar/soar.html", id: "soar-soar" },
    { name: "Guía de Investigación de Ciberseguridad", path: "deep_r/research.html", id: "deep_r-research" },
    { name: "Fuentes Bibliográficas y Referencias", path: "deep_r/referencias.html", id: "deep_r-referencias" }
];

// Leer secciones y subsecciones de cada archivo para construir el índice dinámicamente
const tocStructure = [];

files.forEach((file) => {
    const filePath = path.join(__dirname, file.path);
    if (fs.existsSync(filePath)) {
        const htmlContent = fs.readFileSync(filePath, 'utf-8');
        const $ = cheerio.load(htmlContent);
        
        const subSections = [];
        $('aside nav a').each((i, el) => {
            const href = $(el).attr('href');
            const text = $(el).text().trim();
            if (href && href.startsWith('#') && text !== 'Portada' && !text.includes('Volver al menú') && !text.includes('Volver al Menú')) {
                subSections.push({ text, href });
            }
        });
        
        tocStructure.push({
            name: file.name,
            id: file.id,
            path: file.path,
            subSections: subSections
        });
    }
});

// Iniciar HTML maestro con estilos y fuentes optimizados
let masterHtml = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>TFG - Máster en Ciberseguridad - Aarón S. Gómez</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="assets/css/site.css?v=1.3">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        /* Configuración de página de impresión */
        @page {
            size: A4;
            margin: 25mm 20mm 20mm 20mm;
        }

        /* Estilos de impresión para PDF */
        @media print {
            body {
                background: white !important;
                color: black !important;
                font-size: 11pt;
                line-height: 1.6;
            }
            .chapter {
                page-break-before: always;
            }
            .no-print, aside, nav, .back-btn, .progress-status, .chip {
                display: none !important;
            }
            
            /* Quitar marcos, fondos, sombras y estilos de tarjeta web */
            section, article, div.rounded-3xl, header.rounded-3xl, 
            div.border, div.shadow-xl, div.shadow-2xl, div.bg-white,
            div.backdrop-blur {
                border: none !important;
                box-shadow: none !important;
                background: transparent !important;
                background-color: transparent !important;
                padding: 0 !important;
                margin-top: 1rem !important;
                margin-bottom: 1rem !important;
                border-radius: 0 !important;
                width: 100% !important;
                max-width: 100% !important;
                page-break-inside: auto !important; /* Permitir que los contenedores se dividan libremente */
            }

            /* Permitir que el texto fluya libremente */
            p, h2, h3, h4, li, span {
                page-break-inside: auto !important;
            }

            /* Permitir que las tablas se dividan entre páginas de forma limpia */
            table {
                page-break-inside: auto !important;
                width: 100% !important;
                border-collapse: collapse !important;
                margin-top: 1.5rem !important;
                margin-bottom: 1.5rem !important;
            }
            tr {
                page-break-inside: avoid !important;
                page-break-after: auto !important;
            }
            thead {
                display: table-header-group !important;
            }
            td, th {
                border: 1px solid #cbd5e1 !important;
                padding: 8px !important;
            }

            /* Ajuste de imágenes para que no se corten */
            img {
                page-break-inside: avoid !important;
                max-height: 180mm !important;
                object-fit: contain !important;
            }

            /* Ajuste de código pre y blockquote */
            pre, pre * {
                white-space: pre-wrap !important;
                word-wrap: break-word !important;
                word-break: break-word !important;
                background-color: #0b1220 !important;
                color: #f8fafc !important;
                border: 1px solid #0f172a !important;
                padding: 10px !important;
                font-size: 9.5pt !important;
                page-break-inside: auto !important;
            }
            code:not(pre code) {
                white-space: pre-wrap !important;
                word-wrap: break-word !important;
                word-break: break-word !important;
                background-color: #f8fafc !important;
                color: #0f172a !important; /* Forzar color oscuro para que no sea blanco */
                border: 1px solid #e2e8f0 !important;
                padding: 2px 6px !important;
                font-size: 9.5pt !important;
                page-break-inside: avoid !important;
                border-radius: 4px !important;
            }
            blockquote {
                page-break-inside: avoid !important;
                border-left: 4px solid #cbd5e1 !important;
                padding-left: 15px !important;
                margin-left: 0 !important;
                font-style: italic !important;
            }

            /* Estructura para el índice del PDF con números de página dinámicos */
            .toc-list {
                width: 100%;
            }
            .toc-row {
                display: flex;
                align-items: flex-end;
                margin-bottom: 8px;
            }
            .toc-title {
                background: white;
                padding-right: 5px;
                position: relative;
                z-index: 1;
            }
            .toc-leader {
                flex-grow: 1;
                border-bottom: 1px dotted #94a3b8;
                margin-bottom: 4px;
                margin-left: 5px;
                margin-right: 5px;
            }
            .toc-num {
                background: white;
                padding-left: 5px;
                position: relative;
                z-index: 1;
                font-family: monospace;
                font-weight: bold;
            }
            .toc-num::after {
                content: target-counter(attr(data-target), page);
            }
            .toc-sub-row {
                display: flex;
                align-items: flex-end;
                margin-left: 24px;
                margin-bottom: 4px;
                font-size: 10pt;
                color: #475569;
            }
        }

        .chapter-title {
            border-bottom: 2px solid #0f172a;
            padding-bottom: 0.5rem;
            margin-bottom: 2rem;
        }
    </style>
</head>
<body class="bg-white text-slate-900">

    <!-- ÍNDICE DINÁMICO -->
    <div class="chapter p-12 md:p-20 bg-slate-50 min-h-screen" id="indice-master" style="page-break-after: always;">
        <div class="max-w-4xl mx-auto">
            <h2 class="text-3xl font-black text-slate-900 border-b border-slate-200 pb-4 mb-8">Índice del TFG</h2>
            <div class="toc-list space-y-4">
`;

// Construcción del índice dinámico en el HTML consolidado
tocStructure.forEach((chapter, index) => {
    masterHtml += `
                <div>
                    <div class="toc-row">
                        <a href="#chapter-${chapter.id}" class="toc-title font-bold text-cyan-800 hover:text-cyan-950 hover:underline">
                            ${index + 1}. ${chapter.name}
                        </a>
                        <div class="toc-leader"></div>
                        <span class="toc-num" data-target="#chapter-${chapter.id}"></span>
                    </div>`;
                    
    chapter.subSections.forEach((sub) => {
        masterHtml += `
                    <div class="toc-sub-row">
                        <a href="${sub.href}" class="toc-title hover:text-cyan-900 hover:underline">
                            ${sub.text}
                        </a>
                        <div class="toc-leader"></div>
                        <span class="toc-num" data-target="${sub.href}"></span>
                    </div>`;
    });
    
    masterHtml += `
                </div>`;
});

masterHtml += `
            </div>
        </div>
    </div>

    <!-- CONTENIDOS -->
`;

// Procesar cada archivo HTML e incorporarlo
files.forEach((file, index) => {
    const filePath = path.join(__dirname, file.path);
    const fileDir = path.dirname(file.path);
    
    if (!fs.existsSync(filePath)) {
        console.error(`Error: El archivo ${filePath} no existe.`);
        return;
    }
    
    console.log(`Procesando archivo [${index + 1}/${files.length}]: ${file.path}`);
    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    const $ = cheerio.load(htmlContent);
    
    // Extraer el contenedor de contenido principal
    let $content = $('section.min-w-0, section.flex-1, main').first();
    if ($content.length === 0) {
        $content = $('body');
    }
    
    // Usamos isDocument: false para que cheerio no agregue tags html/head/body a nivel de fragmento
    const cleanContent = cheerio.load($content.html(), { isDocument: false });
    
    // Eliminar barras de progreso, badges de objetivos, aside, nav, footer
    cleanContent('aside, nav, footer, .no-print, button:contains("Copiar"), .copy-btn, .progress-status, .chip').remove();
    
    // Eliminar marcas de agua de "APROBADO" (comprobando class absolute y que contenga el texto)
    cleanContent('div, span, p').each((i, el) => {
        const $el = cleanContent(el);
        const text = $el.text().trim();
        if (text === 'APROBADO' || $el.hasClass('absolute') && text.includes('APROBADO')) {
            $el.remove();
        }
    });

    // Eliminar enlaces que vuelven al menú principal
    cleanContent('a').each((i, el) => {
        const href = cleanContent(el).attr('href');
        const text = cleanContent(el).text();
        if (href && (href.includes('index.html') || text.includes('Volver al Menú') || text.includes('Volver al menú'))) {
            cleanContent(el).remove();
        }
    });

    // Ajustar imágenes locales
    cleanContent('img').each((i, el) => {
        let src = cleanContent(el).attr('src');
        if (src) {
            src = decodeURIComponent(src);
            if (src.startsWith('../')) {
                const newSrc = src.substring(3);
                cleanContent(el).attr('src', newSrc);
            } else if (!src.startsWith('http') && !src.startsWith('/')) {
                const newSrc = path.posix.join(fileDir, src);
                cleanContent(el).attr('src', newSrc);
            }
        }
        cleanContent(el).addClass('max-w-full h-auto rounded-xl shadow-md my-6 block mx-auto');
    });

    // Ajustar hipervínculos internos y externos
    cleanContent('a').each((i, el) => {
        let href = cleanContent(el).attr('href');
        if (href) {
            if (href.startsWith('http')) {
                cleanContent(el).attr('target', '_blank');
            } else if (href.startsWith('../') || (!href.startsWith('#') && href.endsWith('.html'))) {
                const hashIndex = href.indexOf('#');
                if (hashIndex !== -1) {
                    cleanContent(el).attr('href', href.substring(hashIndex));
                } else {
                    const relativePath = href.startsWith('../') ? href.substring(3) : path.posix.join(fileDir, href);
                    const cleanPath = relativePath.replace(/\.html$/, '').replace(/\//g, '-');
                    cleanContent(el).attr('href', `#chapter-${cleanPath}`);
                }
            }
        }
    });

    // Envolver contenido en un contenedor de capítulo con salto de página obligatorio
    masterHtml += `
    <div class="chapter p-8 md:p-16 max-w-5xl mx-auto" id="chapter-${file.id}">
        <h2 class="text-3xl md:text-4xl font-black text-slate-955 chapter-title">${index + 1}. ${file.name}</h2>
        <div class="prose max-w-none text-slate-800 text-sm leading-relaxed space-y-6">
            ${cleanContent.html()}
        </div>
    </div>
    `;
});

masterHtml += `
</body>
</html>
`;

// Guardar el documento completo compilado
const outputHtmlPath = path.join(__dirname, 'tfg_documento_completo.html');
fs.writeFileSync(outputHtmlPath, masterHtml, 'utf-8');
console.log(`\n¡Éxito! Archivo maestro consolidado creado en: ${outputHtmlPath}`);

const puppeteer = require('puppeteer-core');
const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const pdfPath = path.join(__dirname, 'tfg_master_ciberseguridad.pdf');

// Borrar el archivo viejo primero para asegurar escritura limpia
if (fs.existsSync(pdfPath)) {
    try {
        fs.unlinkSync(pdfPath);
    } catch (e) {
        console.error('El archivo PDF está bloqueado por otro proceso.', e);
    }
}

console.log('Iniciando exportación de PDF con Puppeteer...');
(async () => {
    try {
        const browser = await puppeteer.launch({
            executablePath: chromePath,
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        
        const fileUrl = `file:///${outputHtmlPath.replace(/\\/g, '/')}`;
        await page.goto(fileUrl, { waitUntil: 'networkidle0' });
        
        await page.pdf({
            path: pdfPath,
            displayHeaderFooter: true,
            headerTemplate: '<div style="font-size: 8px; color: transparent; height: 0px; opacity: 0;">&nbsp;</div>',
            footerTemplate: '<div style="font-size: 8px; font-family: sans-serif; width: 100%; text-align: right; padding-right: 20px; color: #64748b;"><span class="pageNumber"></span></div>',
            printBackground: true,
            preferCSSPageSize: true
        });
        
        await browser.close();
        console.log(`PDF generado correctamente en: ${pdfPath}`);
        process.exit(0);
    } catch (err) {
        console.error('Error al generar el PDF con Puppeteer:', err);
        process.exit(1);
    }
})();
