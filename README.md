<div align="center">

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Wazuh](https://img.shields.io/badge/Wazuh-00a4e4?style=for-the-badge&logo=wazuh&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Nginx](https://img.shields.io/badge/Nginx-009639?style=for-the-badge&logo=nginx&logoColor=white)
![Apache](https://img.shields.io/badge/Apache-D22128?style=for-the-badge&logo=apache&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Kali Linux](https://img.shields.io/badge/Kali_Linux-557C94?style=for-the-badge&logo=kalilinux&logoColor=white)
![Dedicación](https://img.shields.io/badge/Dedicaci%C3%B3n-82.00%20Horas-purple?style=for-the-badge&logo=clock&logoColor=white)

<div align="center" style="margin: 20px 0;">
  <img src="https://cdn.simpleicons.org/docker/2496ED" height="45" alt="Docker" style="margin: 0 10px;" />
  <img src="https://cdn.jsdelivr.net/gh/homarr-labs/dashboard-icons/png/wazuh.png" height="45" alt="Wazuh" style="margin: 0 10px;" />
  <img src="https://cdn.simpleicons.org/supabase/3ECF8E" height="45" alt="Supabase" style="margin: 0 10px;" />
  <img src="https://cdn.simpleicons.org/nginx/009639" height="45" alt="Nginx" style="margin: 0 10px;" />
  <img src="https://cdn.simpleicons.org/apache/D22128" height="45" alt="Apache" style="margin: 0 10px;" />
  <img src="https://cdn.simpleicons.org/nextdotjs/000000" height="45" alt="Next.js" style="margin: 0 10px;" />
  <img src="https://cdn.simpleicons.org/tailwindcss/38B2AC" height="45" alt="TailwindCSS" style="margin: 0 10px;" />
  <img src="https://cdn.simpleicons.org/githubactions/2088FF" height="45" alt="GitHub Actions" style="margin: 0 10px;" />
  <img src="https://cdn.simpleicons.org/letsencrypt/003A70" height="45" alt="Let's Encrypt" style="margin: 0 10px;" />
  <img src="https://cdn.simpleicons.org/python/3776AB" height="45" alt="Python" style="margin: 0 10px;" />
  <img src="https://cdn.simpleicons.org/kalilinux/557C94" height="45" alt="Kali Linux" style="margin: 0 10px;" />
</div>

<div align="center">
  <h1>Trabajo Fin de Máster — Portal de Auditoría y Laboratorio</h1>
  <p><b>Ciclo Completo de Ciberseguridad: Fase Ofensiva, DevSecOps, SOC/SIEM, Automatización SOAR y Análisis Forense Digital (Caso M57 Jean)</b></p>
  <br/>
  <h3>📥 <b><a href="TFM_AaronSGomez/AaronSGomez_tfm.pdf" target="_blank">DESCARGAR EL PDF COMPLETO DEL TFM</a></b></h3>
  <br/>
</div>

[Módulos del Sistema](#-módulos-del-sistema) • [Organización del Repositorio](#-organización-del-repositorio) • [Matriz de Cumplimiento](#-matriz-de-cumplimiento) • [Tecnologías](#-tecnologías) • [Instalación](#-instalación)

</div>

---

## 📋 Descripción

Este proyecto representa el entorno interactivo de entrega y defensa del **Trabajo Fin de Máster (TFM)** en Ciberseguridad. Consolida en un único portal unificado toda la documentación técnica de ingeniería, los playbooks del SOC, el simulacro de incidentes y el caso práctico forense.

El objetivo principal es evidenciar el despliegue e integración real de un entorno corporativo distribuido de tres nodos, abarcando desde la infiltración (fase ofensiva) hasta la monitorización defensiva activa, la orquestación de respuestas automatizadas en sistemas SOAR, y la auditoría forense posterior del sistema.

---

## ✨ Características

### ⚙️ Despliegue Perimetral e Infraestructura
- **Topología WAN Distribuida**: Red de tres nodos comunicada bajo un entorno simulado de Internet.
- **Hardening de Proxy Reverso**: Servidor web Apache2 configurado con directivas estrictas de seguridad (Let's Encrypt SSL, restricciones IP y calificación **A** en Security Headers).
- **Monitorización Unificada**: Despliegue de agentes locales de Wazuh para recopilación e ingesta en tiempo real.

### 🛡️ DevSecOps & Pipeline Seguro
- **Automatización CI/CD**: Flujo seguro en GitHub Actions integrando Semgrep (SAST), Gitleaks (secretos) y Trivy (dependencias).
- **Auditoría Dinámica (DAST)**: Configuración y escaneos interactivos mediante OWASP ZAP apuntando a subdominios productivos de DuckDNS.
- **Modelado de Amenazas**: Diagrama de flujo STRIDE diseñado sobre la herramienta OWASP Threat Dragon.

### 🚨 SOC, SIEM & Respuesta Ante Incidentes (PRI)
- **Caso de Uso Activo**: Correlación y alerta automatizada ante la detonación del exploit RCE React2Shell (Regla Wazuh 100503).
- **Playbook del SOC**: Diagramas y bitácora lógica para triaje, clasificación de severidades y escalado de incidencias.
- **Simulacro PRI**: Protocolo detallado de respuesta con comandos de contención, aislamiento y parcheo del código vulnerable.

### 🔍 Análisis Forense Digital (Caso M57 Jean Jones)
- **Fase de Adquisición (Mundo Real)**: Guía metodológica para la preservación de evidencias, cadena de custodia, bloqueadores de escritura (Write Blocking Tableau) y duplicación bit a bit (`E01`).
- **Investigación en Autopsy**: Análisis del sistema Windows XP afectado, recuperación de metadatos de la hoja de cálculo exfiltrada (`m57biz.xls`), análisis de la base de datos de correos corporativos (`outlook.pst`) e identificación del vector de ataque de spear phishing (campo SMTP `Reply-To`).

### ⚖️ Gobierno de Seguridad, Políticas y Plan Director (PDS)
- **Gobernanza sobre dos Servidores**: Delimitación y aislamiento lógico de roles de seguridad (SOC, Administrador de Sistemas y CISO) en una arquitectura distribuida perimetral.
- **Protocolo de Actuación ante Incidentes**: Flujos detallados para fases de Contención, Erradicación, Recuperación y Lecciones Aprendidas.
- **Plan Director de Seguridad (PDS) a 12 Meses**: Hitos estratégicos trimestrales de ciberseguridad para implementar MFA, automatizaciones de respuesta SOAR y concienciación del personal frente al phishing.

### 🤖 Automatización SOAR (Shuffle)
- **Orquestación de Respuestas**: Integración del motor SOAR Shuffle mediante webhooks para recibir eventos críticos del SIEM y abrir automáticamente casos en TheHive, optimizando los tiempos de respuesta.

---

## 🧩 Organización del Repositorio

La estructura del código está modularizada para facilitar la navegación interactiva y el control de versiones:

```bash
TFG_MasterCiber/
├── assets/
│   ├── css/
│   │   └── site.css          # Estilos globales y clases de maquetación del TFG
│   ├── js/
│   │   ├── sidebar.js        # Script de control de navegación y flechas flotantes
│   │   └── lightbox.js       # Visor dinámico para zoom de evidencias gráficas
│   └── docs/
│       ├── tfm-ciberseguridad.pdf    # Guía oficial del Máster
│       └── M57_Jean_Caso_Forense.pdf # Documento del caso forense M57.biz
├── lab/
│   └── install.html          # Guía de instalación, topología y configuración del proxy
├── exploit/
│   ├── recon.html            # Fase de reconocimiento (Kali, Nmap, Spiderfoot)
│   ├── exploit.html          # Explotación de vulnerabilidades y alertas SIEM
│   ├── post.html             # Tácticas de post-explotación (exfiltración DB)
│   └── pentest.html          # Informe formal de auditoría de pentest
├── pipeline/
│   └── setup.html            # Auditorías SAST/DAST, modelado STRIDE e integración CI/CD
├── mfa/
│   └── mfa.html              # Hardening de accesos, políticas de contraseñas y Supabase MFA
├── firewall/
│   └── firewall.html         # Guía de búnker perimetral con Nginx y Docker (Zero-Trust)
├── gob/
│   └── gob.html              # Gobernanza, políticas de incidentes y PDS a 12 meses
├── siem/
│   └── siem.html             # Monitoreo Wazuh, playbooks del SOC y simulacro PRI
├── soar/
│   └── soar.html             # Configuración del entorno SOAR Shuffle y flujos de automatización
├── forensics/
│   └── forensics.html        # Guía paso a paso del análisis forense en Autopsy del Caso M57
├── index.html                # Portal de entrada principal unificado
└── validador.html            # Matriz interactiva de control de evidencias y horas de laboratorio
```

---

## 📊 Matriz de Cumplimiento

El portal dispone de un **Validador de Objetivos Interactivo** (`validador.html`) para certificar el progreso de las 24 evidencias obligatorias:
- **Cálculo de Horas Dinámicas**: Cada objetivo completado acumula horas reales de laboratorio en base a la dedicación técnica registrada (por ejemplo, **3.33 horas** dedicadas exclusivamente al análisis forense en Autopsy).
- **Persistencia Local**: El estado de consecución se almacena en el navegador (`localStorage`) para facilitar la defensa presencial o remota del proyecto.
- **Acceso Directo**: Enlace a la evidencia técnica documentada y explicaciones del resultado esperado.

---

## ⏱️ Registro de Horas de Laboratorio

El proyecto cuenta con un registro detallado de horas dedicadas a las simulaciones en cada fase de laboratorio, acumulando un total de **81.98 horas de trabajo práctico** (mostrado como **82.0 horas** en el validador) auditado:

*   **Fase de Setup e Infraestructura**: `7.00 horas` (diagrama de topología y arranque de contenedores)
*   **Fase Ofensiva y Pentesting**: `31.15 horas` (reconocimiento, CVEs OpenVAS, SQLi, React2Shell RCE y reporte de pentest)
*   **Pipeline DevSecOps y Modelado**: `12.50 horas` (workflows de GitHub Actions, Semgrep, OWASP ZAP DAST y modelado Threat Dragon)
*   **Hardening de Accesos y Concienciación**: `6.50 horas` (firewall, búnker perimetral Nginx/Docker, contraseñas, Supabase MFA y campaña Gophish)
*   **Gobierno de Seguridad y PDS**: `5.00 horas` (políticas corporativas de incidentes, MAGERIT análisis de riesgos y Plan Director a 12 meses)
*   **Monitorización SOC y SIEM**: `13.83 horas` (reglas Wazuh, playbooks SOC, simulacros PRI y las `3.33 horas` del análisis forense del caso M57)
*   **Automatización SOAR**: `6.00 horas` (despliegue del orquestador Shuffle, webhooks de Wazuh y casos en TheHive)

---

## 🛠️ Tecnologías

- **Estructura y Lógica**: HTML5, Vanilla JavaScript (ES6)
- **Estilos**: Tailwind CSS & Custom CSS
- **Motor de Alertas y Logs**: Wazuh Manager & Agents (Elasticsearch/Filebeat)
- **Automatización SOAR**: Shuffle SOAR & TheHive
- **Análisis Forense**: Autopsy Forensic Browser
- **Contenedores**: Docker & Docker Compose
- **Fuentes Tipográficas**: Google Fonts (Inter, Fira Code, Outfit)

---

## 💻 Instalación

### Requisitos previos
- Un navegador web compatible con HTML5 y JavaScript moderno.
- Opcional: Un servidor web local para visualización rápida de rutas relativas.

### Ejecución Directa
Puedes abrir el portal abriendo directamente el archivo raíz en tu navegador:
*   [index.html](file:///c:/Proyectos/TFG_MasterCiber/index.html)

### Servidor de Desarrollo Local
Para levantar un servidor local rápido mediante Node.js:
```bash
# Iniciar servidor local
npx live-server
```

---

## 👥 Autor

**Aarón Gómez**
- Portfolio: [aaronsgomez.es](https://aaronsgomez.es)
- GitHub: [@AaronSGomez](https://github.com/AaronSGomez)
- LinkedIn: [Aarón Gómez Abella](https://www.linkedin.com/in/aaronsgomez/)

---

## 📄 Licencia

**Copyright © 2026 Aarón Gómez. Todos los derechos reservados.**

Queda prohibida la reproducción o redistribución no autorizada del material académico, marcas registradas y assets asociados a esta defensa de TFG sin consentimiento expreso.

---

<div align="center">
  <sub>Desarrollado con dedicación y rigor pericial para la defensa del Trabajo Fin de Máster</sub>
</div>
