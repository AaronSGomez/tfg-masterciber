
# 📘 **Documentación del Pipeline DevSecOps – Caso Real en GitHub Actions**

## 🧩 **1. Introducción**

Este documento describe el proceso completo de creación, depuración y puesta en marcha de un pipeline DevSecOps en GitHub Actions para el repositorio `Porfolio2.0`.  
Incluye:

- Problemas reales encontrados durante la configuración  
- Errores derivados de rutas incorrectas  
- Limitaciones de GitHub en repositorios personales  
- Ejecución de SAST, SCA y DAST  
- Resultados obtenidos  
- Issues generados automáticamente  
- Warnings detectados por ZAP  
- Pipeline final funcionando correctamente  

El objetivo es documentar un caso realista, con fallos auténticos y soluciones profesionales, tal como se espera en un entorno DevSecOps moderno.

---

# 🧱 **2. Problema inicial: GitHub Actions no detectaba workflows**

### 🔍 **Descripción del problema**

Al comenzar la configuración del pipeline, GitHub Actions mostraba únicamente:

```
Get started with GitHub Actions
Skip this and set up a workflow yourself
```

No aparecía ningún workflow, ni siquiera después de subir archivos YAML desde Visual Studio Code.

### ❗ **Error detectado**

Tras varias pruebas, se descubrió que **Visual Studio Code había creado la carpeta `github/` sin el punto inicial**, es decir:

```
github/workflows/
```

en lugar de:

```
.github/workflows/
```

GitHub **ignora completamente** cualquier carpeta que no sea `.github/`.

### 📌 **Impacto del error**

- GitHub no detectaba workflows  
- GitHub no ejecutaba pipelines  
- GitHub no mostraba historial de acciones  
- GitHub insistía en crear `main.yml` desde la web  
- El repositorio permanecía en “bootstrap mode”  

### 📸 **Captura recomendada**
imagen C:\PROYECTS\tfg-masterciber\assets\pipeline\imagen error en carpeta.png
**Colocar aquí una captura de la vista de GitHub Actions mostrando “Get started with GitHub Actions”.**

---

# 🛠️ **3. Solución aplicada**

Se renombró correctamente la carpeta:

```
.github/
```

y se movieron dentro los workflows.

Tras hacer un commit y un push, GitHub Actions **detectó automáticamente** los workflows y comenzó a ejecutarlos.

### 📸 **Captura recomendada**
imagen C:\PROYECTS\tfg-masterciber\assets\pipeline\workflows.png
**Colocar aquí una captura de la estructura del repositorio mostrando `.github/workflows/`.**

---

# 🔐 **4. Configuración del pipeline DevSecOps**

El pipeline final incluye tres análisis:

- **SAST – CodeQL**  
- **SCA – npm audit**  
- **DAST – OWASP ZAP Baseline Scan**  

Cada uno configurado con permisos adecuados y siguiendo buenas prácticas.

### 📄 **Workflow final (`security.yml`)**

```yaml
name: DevSecOps Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  sast:
    name: SAST - CodeQL
    runs-on: ubuntu-latest
    permissions:
      actions: read
      security-events: write
      contents: read

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript

      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3

  sca:
    name: SCA - Dependency Scan
    runs-on: ubuntu-latest
    permissions:
      contents: read

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install dependencies
        working-directory: frontend
        run: npm install

      - name: Run npm audit
        working-directory: frontend
        run: npm audit --audit-level=high

  dast:
    name: DAST - OWASP ZAP Baseline Scan
    runs-on: ubuntu-latest
    permissions:
      issues: write
      contents: read

    steps:
      - name: ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.10.0
        with:
          target: "https://asga.vercel.app"
```

---

# 🧪 **5. Resultados del pipeline**

Una vez corregida la estructura del repositorio y configurados los permisos, el pipeline se ejecutó correctamente.

### 📸 **Captura recomendada**
imagen C:\PROYECTS\tfg-masterciber\assets\pipeline\jobs.png

**Colocar aquí la captura del pipeline con los tres jobs (SAST, SCA, DAST).**

---

# 🚨 **6. Errores detectados (SAST, SCA y DAST)**

A continuación se documentan los fallos detectados por cada herramienta.

---

## 🧨 **6.1. SAST – CodeQL**

### ✔ Resultado del análisis

CodeQL analizó correctamente:

- 21 archivos TypeScript  
- 1 archivo JavaScript  
- 1 archivo de GitHub Actions  

### ❗ **Error detectado (NO crítico)**

```
Warning: Code scanning is not enabled for this repository.
Error: Please verify that the necessary features are enabled
```

### 📌 **Explicación técnica**

GitHub **no permite subir resultados de CodeQL** a la interfaz de “Security” en repositorios personales.

El análisis **sí se ejecuta**, pero **no puede subir los resultados**.

### 📸 **Captura recomendada**
assets\pipeline\SAST.png
**Captura del log de CodeQL mostrando el warning.**

---

## 🧨 **6.2. SCA – npm audit**

El análisis de dependencias se ejecutó correctamente.

### ✔ Resultado

- Dependencias instaladas  
- Auditoría ejecutada  
- Sin fallos críticos detectados  

### 📸 **Captura recomendada**
assets\pipeline\SCA.png
**Captura del job SCA en verde.**

---

## 🧨 **6.3. DAST – OWASP ZAP**

ZAP realizó un escaneo pasivo completo sobre:

```
https://asga.vercel.app
```

### ✔ Resultado general

- **PASS:** 56 reglas  
- **WARN:** 11 reglas  
- **FAIL:** 0  

### 📸 **Captura recomendada**
assets\pipeline\SAST.png
**Captura del job DAST mostrando los warnings.**

---

# 🚨 **7. Errores detectados por ZAP (DAST)**

A continuación se listan los warnings detectados, clasificados por categoría.

---

## ⚠️ **7.1. Cabeceras de seguridad ausentes**

### ❗ **Errores detectados**

- **Missing Anti-clickjacking Header**  
- **X-Content-Type-Options Missing**  
- **Content Security Policy (CSP) Not Set**  
- **Permissions Policy Header Not Set**  
- **Cross-Origin-Embedder-Policy Missing**

### 📌 **Impacto**

Estas cabeceras protegen contra:

- Clickjacking  
- MIME sniffing  
- Carga de recursos inseguros  
- Políticas de permisos del navegador  

### 📸 **Captura recomendada**
C:\PROYECTS\tfg-masterciber\assets\pipeline\issues.png
**Captura del issue creado automáticamente por ZAP.**

---

## ⚠️ **7.2. Problemas de integridad y recursos**

### ❗ **Errores detectados**

- **Subresource Integrity Missing (SRI)**  
- **Cross-Domain Misconfiguration**  
- **Cache-Control débil**  
- **Contenido recuperado desde caché**  

### 📌 **Impacto**

- Riesgo de manipulación de scripts externos  
- Riesgo de fuga de información por caché  
- Riesgo de carga de recursos inseguros  

---

# 🧩 **8. Issue automático creado por ZAP**

ZAP creó automáticamente un issue en el repositorio:

```
Process completed successfully and a new issue #1 has been created for the ZAP Scan.
```

### 📸 **Captura recomendada**
C:\PROYECTS\tfg-masterciber\assets\pipeline\issue1.png
**Captura del issue #1 en GitHub.**

---

# 🧱 **9. Conclusiones**

El pipeline DevSecOps implementado:

- Detecta vulnerabilidades reales  
- Ejecuta SAST, SCA y DAST correctamente  
- Genera issues automáticos  
- Proporciona logs detallados  
- Funciona como un pipeline profesional  

Además, se documentaron fallos reales:

- Error inicial por carpeta mal nombrada  
- Limitaciones de GitHub en repos personales  
- Warnings de seguridad detectados por ZAP  
- Problemas de cabeceras y configuración del servidor  

Este documento refleja un caso real, completo y profesional de implementación DevSecOps.

---

