<div align="center">

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Wazuh](https://img.shields.io/badge/Wazuh-00a4e4?style=for-the-badge&logo=wazuh&logoColor=white)
![Autopsy](https://img.shields.io/badge/Autopsy-4F46E5?style=for-the-badge&logo=search&logoColor=white)
![Apache](https://img.shields.io/badge/Apache-D22128?style=for-the-badge&logo=apache&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Dedicación](https://img.shields.io/badge/Dedicaci%C3%B3n-75.40%20Horas-purple?style=for-the-badge&logo=clock&logoColor=white)

<div align="center">
  <img src="https://cdn.simpleicons.org/docker" height="50" alt="Docker" />
  <img src="https://cdn.simpleicons.org/wazuh" height="50" alt="Wazuh" />
  <img src="https://cdn.simpleicons.org/apache" height="50" alt="Apache" />
  <img src="https://cdn.simpleicons.org/nextdotjs" height="50" alt="Next.js" />
  <img src="https://cdn.simpleicons.org/tailwindcss" height="50" alt="TailwindCSS" />
</div>

<div align="center">
  <h1>Trabajo Fin de Máster — Portal de Auditoría y Laboratorio</h1>
  <p><b>Ciclo Completo de Ciberseguridad: Fase Ofensiva, DevSecOps, SOC/SIEM, Automatización SOAR y Análisis Forense Digital (Caso M57 Jean)</b></p>
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

El proyecto cuenta con un registro detallado de horas dedicadas a las simulaciones en cada fase de laboratorio, acumulando un total de **75.40 horas de trabajo práctico** auditado:

*   **Fase de Setup e Infraestructura**: `7.50 horas` (diagrama de topología, despliegue de red y agentes locales)
*   **Fase Ofensiva y Pentesting**: `31.32 horas` (reconocimiento, CVEs OpenVAS, SQLi, React2Shell RCE y reporte de pentest)
*   **Pipeline DevSecOps y Modelado**: `12.50 horas` (workflows de GitHub Actions, Semgrep, OWASP ZAP DAST y modelado Threat Dragon)
*   **Hardening de Accesos y MFA**: `3.75 horas` (firewall deny-by-default, búnker perimetral Nginx/Docker, políticas de contraseña y Supabase MFA)
*   **Monitorización SOC y SIEM**: `14.83 horas` (reglas Wazuh, playbooks SOC, simulacros PRI y las `3.33 horas` del análisis forense del caso M57)
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
