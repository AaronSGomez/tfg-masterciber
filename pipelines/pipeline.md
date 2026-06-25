# LABORATORIO: Implementación y Documentación Completa de un Pipeline DevSecOps en GitHub Actions  
Proyecto: React + Next.js + Supabase

---

## 1. Introducción

Este laboratorio documenta la implementación completa de un pipeline DevSecOps aplicado a un proyecto real desarrollado en React + Next.js + Supabase, alojado en GitHub y desplegado en Vercel.

El objetivo es demostrar:

- Integración de seguridad en el ciclo de desarrollo (DevSecOps).
- Detección automática de vulnerabilidades mediante SAST, SCA y DAST.
- Corrección de vulnerabilidades detectadas.
- Validación mediante re-ejecución del pipeline.
- Relación entre vulnerabilidades reales (DVWA + React vulnerable) y detección preventiva.

---

## 2. Objetivos del laboratorio

1. Configurar un pipeline DevSecOps en GitHub Actions.  
2. Integrar herramientas de SAST, SCA y DAST.  
3. Introducir una vulnerabilidad controlada en el proyecto.  
4. Validar que el pipeline la detecta.  
5. Corregir la vulnerabilidad.  
6. Documentar el proceso completo.

---

## 3. Arquitectura del pipeline

```
GitHub Repo (Next.js + Supabase)
        │
        ├── Push / Pull Request
        │
        ▼
GitHub Actions Pipeline
        ├── Linting (ESLint)
        ├── Build
        ├── SAST (CodeQL)
        ├── SCA (npm audit / osv-scanner)
        ├── DAST (OWASP ZAP / Nuclei)
        ▼
Resultados
        ├── Bloqueo de PR si hay fallos críticos
        └── Reportes automáticos
```

---

## 4. Preparación del entorno

### 4.1 Requisitos previos

- Repositorio en GitHub  
- Proyecto Next.js funcional  
- Despliegue en Vercel  
- Node.js 18+  
- GitHub Actions habilitado  

---

## 5. Creación del pipeline DevSecOps

Crear el archivo:

```
.github/workflows/security.yml
```

### 5.1 Pipeline completo (copiar y pegar)

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
      security-events: write
      actions: read
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

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Install dependencies
        run: npm install

      - name: Run npm audit
        run: npm audit --audit-level=high

  dast:
    name: DAST - OWASP ZAP Baseline Scan
    runs-on: ubuntu-latest

    steps:
      - name: ZAP Baseline Scan
        uses: zaproxy/action-baseline@v0.10.0
        with:
          target: "https://TU-PROYECTO.vercel.app"
```

---

## 6. Introducción de una vulnerabilidad controlada

Para demostrar detección y corrección, se introduce una dependencia vulnerable:

```
npm install lodash@4.17.15
```

Esta versión contiene CVEs conocidas.

Resultado esperado:

- SCA fallará.  
- El pipeline marcará el PR como fallido.  

---

## 7. Corrección de la vulnerabilidad

Actualizar la dependencia:

```
npm install lodash@latest
```

Confirmar:

```
npm audit
# 0 vulnerabilities
```

Subir el commit.

Resultado esperado:

- Pipeline en verde.  
- Validación de corrección.  

---

## 8. Documentación del proceso

### 8.1 Antes de la corrección

- Captura del pipeline fallando.  
- Captura del reporte de npm audit.  
- Explicación del impacto de la CVE.  

### 8.2 Después de la corrección

- Captura del pipeline en verde.  
- Captura del reporte limpio.  
- Explicación de la mitigación.  

---

## 9. Relación con las máquinas vulnerables del TFG

Aunque DVWA y la app React vulnerable no se integran en el pipeline, sirven para demostrar:

| Vulnerabilidad | Máquina vulnerable | Pipeline DevSecOps | Resultado |
|----------------|-------------------|---------------------|-----------|
| SQL Injection | DVWA | SAST | Detectable por patrón |
| XSS | DVWA | DAST | Detectable por ZAP |
| Dependencia con CVE | React vulnerable | SCA | Detectada automáticamente |
| Configuración insegura | React vulnerable | DAST | Detectable por escaneo |

---

## 10. Conclusiones

- El pipeline DevSecOps permite detectar vulnerabilidades antes del despliegue.  
- La integración en un proyecto real demuestra aplicabilidad profesional.  
- La detección y corrección documentadas validan el proceso completo.  
- Las máquinas vulnerables complementan la parte ofensiva del TFG.  

---

## 11. Fuentes consultadas

### DevSecOps
- OWASP DevSecOps Guidelines  
- GitHub Docs – CodeQL  
- GitHub Docs – Actions Security  

### SAST
- OWASP Code Review Guide  
- GitHub CodeQL Documentation  

### SCA
- npm audit documentation  
- Google OSV Scanner  

### DAST
- OWASP ZAP Documentation  
- Nuclei Project (ProjectDiscovery)  

### Next.js / React
- Next.js Security Best Practices  
- React Official Documentation  

---

## 12. Anexos sugeridos

- Capturas del pipeline fallando  
- Capturas del pipeline en verde  
- Código antes/después  
- Reportes de ZAP  
- Reportes de CodeQL  
- Reportes de npm audit  

---

Si quieres, te genero también:

- una versión más académica,  
- una versión más técnica,  
- o una versión para presentación en PowerPoint.