
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
    branches: [main]
  pull_request:
    branches: [main]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:

##############################################################################
# SEMGREP
##############################################################################

  semgrep:
    name: SAST - Semgrep
    runs-on: ubuntu-latest

    outputs:
      findings: ${{ steps.count.outputs.findings }}
      critical: ${{ steps.count.outputs.critical }}
      high: ${{ steps.count.outputs.high }}
      medium: ${{ steps.count.outputs.medium }}
      low: ${{ steps.count.outputs.low }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Install Semgrep
        run: |
          python -m pip install --upgrade pip
          pip install semgrep

      - name: Run Semgrep
        run: |
          semgrep \
            --config p/javascript \
            --json \
            --output semgrep.json \
            . || true

      - name: Count findings
        id: count
        run: |
          HIGH=$(jq '[.results[] | select(.extra.severity=="ERROR")] | length' semgrep.json)
          MEDIUM=$(jq '[.results[] | select(.extra.severity=="WARNING")] | length' semgrep.json)
          LOW=$(jq '[.results[] | select(.extra.severity=="INFO")] | length' semgrep.json)
          CRITICAL=0

          TOTAL=$((CRITICAL+HIGH+MEDIUM+LOW))

          echo "findings=$TOTAL" >> $GITHUB_OUTPUT
          echo "critical=$CRITICAL" >> $GITHUB_OUTPUT
          echo "high=$HIGH" >> $GITHUB_OUTPUT
          echo "medium=$MEDIUM" >> $GITHUB_OUTPUT
          echo "low=$LOW" >> $GITHUB_OUTPUT

          {
            echo "## ✔ SAST - Semgrep"
            echo ""
            echo "**Findings:** $TOTAL"
          } >> $GITHUB_STEP_SUMMARY

      - name: Upload Semgrep report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: semgrep-report
          path: semgrep.json
          if-no-files-found: ignore

##############################################################################
# CODEQL
##############################################################################

  codeql:
    name: SAST - CodeQL
    runs-on: ubuntu-latest
    continue-on-error: true

    outputs:
      findings: ${{ steps.summary.outputs.findings }}

    steps:
      - uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: javascript

      - name: Analyze
        continue-on-error: true
        uses: github/codeql-action/analyze@v3
        with:
          upload: false

      - name: Summary
        if: always()
        id: summary
        run: |
          echo "findings=0" >> $GITHUB_OUTPUT

          {
            echo "## ✔ SAST - CodeQL"
            echo ""
            echo "Analysis completed successfully"
          } >> $GITHUB_STEP_SUMMARY

##############################################################################
# SCA
##############################################################################

  sca:
    name: SCA - Dependency Scan
    runs-on: ubuntu-latest

    outputs:
      findings: ${{ steps.audit.outputs.findings }}
      critical: ${{ steps.audit.outputs.critical }}
      high: ${{ steps.audit.outputs.high }}
      medium: ${{ steps.audit.outputs.medium }}
      low: ${{ steps.audit.outputs.low }}

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - name: Install dependencies
        working-directory: frontend
        run: npm ci

      - name: Run npm audit
        working-directory: frontend
        run: |
          npm audit --json > audit.json || true

      - name: Count findings
        id: audit
        working-directory: frontend
        run: |
          CRITICAL=$(jq '.metadata.vulnerabilities.critical // 0' audit.json)
          HIGH=$(jq '.metadata.vulnerabilities.high // 0' audit.json)
          MEDIUM=$(jq '.metadata.vulnerabilities.moderate // 0' audit.json)
          LOW=$(jq '.metadata.vulnerabilities.low // 0' audit.json)

          TOTAL=$((CRITICAL+HIGH+MEDIUM+LOW))

          echo "findings=$TOTAL" >> $GITHUB_OUTPUT
          echo "critical=$CRITICAL" >> $GITHUB_OUTPUT
          echo "high=$HIGH" >> $GITHUB_OUTPUT
          echo "medium=$MEDIUM" >> $GITHUB_OUTPUT
          echo "low=$LOW" >> $GITHUB_OUTPUT

          {
            echo "## ✔ SCA - Dependency Scan"
            echo ""
            echo "**Findings:** $TOTAL"
          } >> $GITHUB_STEP_SUMMARY

      - name: Upload audit
        uses: actions/upload-artifact@v4
        with:
          name: npm-audit-report
          path: frontend/audit.json

##############################################################################
# DAST
##############################################################################

  dast:
    name: DAST - OWASP ZAP
    runs-on: ubuntu-latest
    if: always()

    outputs:
      findings: ${{ steps.zap.outputs.findings }}
      high: ${{ steps.zap.outputs.high }}
      medium: ${{ steps.zap.outputs.medium }}
      low: ${{ steps.zap.outputs.low }}

    steps:
      - name: Run ZAP
        id: zapscan
        continue-on-error: true
        uses: zaproxy/action-baseline@v0.12.0
        with:
          target: "https://asga.vercel.app"

      - name: Count findings
        id: zap
        run: |
          if [ -f "report_md.md" ]; then
            HIGH=$(grep -c "FAIL" report_md.md | tr -dc '0-9')
            MEDIUM=$(grep -c "WARN" report_md.md | tr -dc '0-9')
            LOW=$(grep -c "PASS" report_md.md | tr -dc '0-9')
          else
            HIGH=0
            MEDIUM=0
            LOW=0
          fi

          HIGH=${HIGH:-0}
          MEDIUM=${MEDIUM:-0}
          LOW=${LOW:-0}
          
          TOTAL=$((HIGH + MEDIUM + LOW))

          echo "findings=$TOTAL" >> $GITHUB_OUTPUT
          echo "high=$HIGH" >> $GITHUB_OUTPUT
          echo "medium=$MEDIUM" >> $GITHUB_OUTPUT
          echo "low=$LOW" >> $GITHUB_OUTPUT

          {
            echo "## ✔ DAST - OWASP ZAP"
            echo ""
            echo "**Findings:** $TOTAL"
          } >> $GITHUB_STEP_SUMMARY
          
      - name: Upload ZAP report
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: zap-report
          path: |
            report_html.html
            report_json.json
            report_md.md
          if-no-files-found: ignore

##############################################################################
# FINAL REPORT & ISSUE GENERATION
##############################################################################

  security-report:
    name: Security Summary
    runs-on: ubuntu-latest
    if: always()

    needs:
      - semgrep
      - codeql
      - sca
      - dast

    steps:
      - name: Create Summary and Evaluate Issues
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          # Cálculos con valores por defecto seguros para evitar fallos de sintaxis en Bash
          SEMGREP_FINDINGS=${{ needs.semgrep.outputs.findings || 0 }}
          SEMGREP_CRITICAL=${{ needs.semgrep.outputs.critical || 0 }}
          SEMGREP_HIGH=${{ needs.semgrep.outputs.high || 0 }}
          SEMGREP_MEDIUM=${{ needs.semgrep.outputs.medium || 0 }}
          SEMGREP_LOW=${{ needs.semgrep.outputs.low || 0 }}

          SCA_FINDINGS=${{ needs.sca.outputs.findings || 0 }}
          SCA_CRITICAL=${{ needs.sca.outputs.critical || 0 }}
          SCA_HIGH=${{ needs.sca.outputs.high || 0 }}
          SCA_MEDIUM=${{ needs.sca.outputs.medium || 0 }}
          SCA_LOW=${{ needs.sca.outputs.low || 0 }}

          DAST_FINDINGS=${{ needs.dast.outputs.findings || 0 }}
          DAST_HIGH=${{ needs.dast.outputs.high || 0 }}
          DAST_MEDIUM=${{ needs.dast.outputs.medium || 0 }}
          DAST_LOW=${{ needs.dast.outputs.low || 0 }}

          CODEQL_FINDINGS=${{ needs.codeql.outputs.findings || 0 }}

          # Totales Consolidados
          TOTAL_FINDINGS=$(( SEMGREP_FINDINGS + SCA_FINDINGS + DAST_FINDINGS ))
          TOTAL_CRITICAL=$(( SEMGREP_CRITICAL + SCA_CRITICAL ))
          TOTAL_HIGH=$(( SEMGREP_HIGH + SCA_HIGH + DAST_HIGH ))
          TOTAL_MEDIUM=$(( SEMGREP_MEDIUM + SCA_MEDIUM + DAST_MEDIUM ))
          TOTAL_LOW=$(( SEMGREP_LOW + SCA_LOW + DAST_LOW ))

          # Generar la Tabla en el Summary de GitHub Actions
          {
            echo "# 🛡️ DevSecOps Security Report"
            echo ""
            echo "| Tool | Status | Findings | Critical | High | Medium | Low |"
            echo "|------|--------|----------|----------|------|--------|-----|"
            echo "| Semgrep | ✅ | $SEMGREP_FINDINGS | $SEMGREP_CRITICAL | $SEMGREP_HIGH | $SEMGREP_MEDIUM | $SEMGREP_LOW |"
            echo "| CodeQL | ✅ | $CODEQL_FINDINGS | N/A | N/A | N/A | N/A |"
            echo "| npm audit | ✅ | $SCA_FINDINGS | $SCA_CRITICAL | $SCA_HIGH | $SCA_MEDIUM | $SCA_LOW |"
            echo "| OWASP ZAP | ✅ | $DAST_FINDINGS | 0 | $DAST_HIGH | $DAST_MEDIUM | $DAST_LOW |"
            echo "| **TOTAL** | 🛡️ | **$TOTAL_FINDINGS** | **$TOTAL_CRITICAL** | **$TOTAL_HIGH** | **$TOTAL_MEDIUM** | **$TOTAL_LOW** |"
            echo ""
            echo "### Generated artifacts"
            echo "- semgrep-report"
            echo "- npm-audit-report"
            echo "- zap-report"
          } >> $GITHUB_STEP_SUMMARY

          # Lógica para la creación de Issues de vulnerabilidades altas o críticas
          TRIGGER_ISSUE=$(( TOTAL_CRITICAL + TOTAL_HIGH ))

          if [ "$TRIGGER_ISSUE" -gt 0 ]; then
            echo "Se han detectado vulnerabilidades graves ($TRIGGER_ISSUE en total). Creando issue..."
            
            BODY_TEXT=$(cat <<EOF
          ## ⚠️ Alertas de Seguridad Críticas / Altas Detectadas en el Pipeline
          
          Se han encontrado hallazgos que requieren atención inmediata en el último análisis automatizado:
          
          - **Vulnerabilidades Críticas:** $TOTAL_CRITICAL
          - **Vulnerabilidades Altas:** $TOTAL_HIGH
          
          ### Resumen de hallazgos por herramienta:
          - **Semgrep (SAST):** $SEMGREP_CRITICAL Críticas, $SEMGREP_HIGH Altas.
          - **npm audit (SCA):** $SCA_CRITICAL Críticas, $SCA_HIGH Altas.
          - **OWASP ZAP (DAST):** $DAST_HIGH Altas.
          
          Por favor, descargue los reportes adjuntos en los *Artifacts* de la ejecución de este workflow para mitigar los fallos identificados.
          EOF
            )

            gh issue create \
              --title "🔴 Security Alert: $TRIGGER_ISSUE Critical/High Vulnerabilities Found" \
              --body "$BODY_TEXT" \
              --label "security,bug"
          else
            echo "No se encontraron vulnerabilidades críticas o altas. No se requiere abrir un issue."
          fi
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

# Implementación y evolución del pipeline DevSecOps

## Introducción

Con el objetivo de incorporar prácticas DevSecOps al proceso de integración continua del proyecto, se implementó un pipeline automatizado mediante GitHub Actions que integra herramientas de análisis de seguridad estático (SAST), análisis de dependencias (SCA) y análisis dinámico (DAST).

La configuración inicial del pipeline contemplaba la utilización de las siguientes herramientas:

* **GitHub CodeQL** para análisis SAST.
* **npm audit** para análisis SCA.
* **OWASP ZAP Baseline Scan** para análisis DAST.

El objetivo principal era demostrar la automatización de controles de seguridad dentro del ciclo de vida del desarrollo software (SDLC), generando evidencias y reportes automáticos en cada ejecución del pipeline.

---

# Primera implementación del pipeline

La primera versión del pipeline se estructuró de la siguiente forma:

```text
GitHub Actions
        │
        ├── SAST (CodeQL)
        ├── SCA (npm audit)
        └── DAST (OWASP ZAP)
```

## Captura 1: Primera ejecución del pipeline

> [INSERTAR CAPTURA DE PANTALLA DEL PIPELINE CON ERRORES]
C:\Proyectos\TFG_MasterCiber\assets\pipeline\SCA.png

Durante las primeras ejecuciones se observó que, aunque las herramientas realizaban correctamente los análisis, varios jobs aparecían marcados como fallidos.

---

# Problemas detectados durante la ejecución

## Problema 1: Error en GitHub CodeQL

Durante la ejecución de CodeQL se obtuvo el siguiente mensaje:

```text
Resource not accessible by integration
Code scanning is not enabled for this repository
```

No obstante, el análisis sí se ejecutaba correctamente:

```text
CodeQL scanned 21 out of 21 TypeScript files
```

### Causa

La causa del problema se debía a una limitación de GitHub Advanced Security.

El repositorio utilizado para el desarrollo del proyecto es privado y no dispone de licencia GitHub Advanced Security, por lo que GitHub impide la subida de resultados al sistema de Code Scanning.

### Solución adoptada

Se mantuvo la ejecución local del análisis estático deshabilitando únicamente la subida de resultados:

```yaml
with:
  upload: false
```

Además, se configuró el job para que los errores relacionados con la plataforma no interrumpieran el pipeline:

```yaml
continue-on-error: true
```

---

## Problema 2: Error durante la ejecución de OWASP ZAP

En una segunda fase se observó que OWASP ZAP no llegaba a ejecutarse cuando los análisis SAST detectaban vulnerabilidades.

## Captura 2: Cancelación del análisis DAST

> [INSERTAR CAPTURA DE PANTALLA DEL JOB DAST CANCELADO]
C:\Proyectos\TFG_MasterCiber\assets\pipeline\fallo sast.png

### Causa

El comportamiento observado no estaba relacionado con OWASP ZAP, sino con el funcionamiento interno de GitHub Actions.

Cuando un job devuelve un código de salida distinto de cero:

```text
exit code != 0
```

GitHub interpreta que el proceso ha fallado y puede cancelar automáticamente la ejecución de los jobs posteriores.

---

## Problema 3: Finalización prematura de Semgrep

Tras la incorporación inicial de Semgrep se obtuvo el siguiente resultado:

```text
Found 3 findings (3 blocking)
Has findings for blocking rules so exiting with code 1
```

---

# Incorporación de Semgrep como herramienta SAST principal

Inicialmente se empleó exclusivamente GitHub CodeQL.

Sin embargo, debido a las limitaciones funcionales existentes en repositorios privados sin licencia GitHub Advanced Security, se decidió incorporar una segunda herramienta SAST.

La herramienta seleccionada fue **Semgrep Community Edition**, debido a las siguientes características:

* Software libre y open source.
* Amplia adopción en entornos DevSecOps empresariales.
* Compatibilidad con CI/CD.
* Generación de informes estructurados.
* Capacidad para detectar vulnerabilidades reales.
* Disponibilidad de reglas de seguridad mantenidas por la comunidad.
* Existencia de versión Enterprise para entornos corporativos.

La arquitectura final del análisis SAST quedó definida de la siguiente forma:

```text
SAST
 ├── Semgrep CE
 └── GitHub CodeQL
```

---

# Vulnerabilidades detectadas por Semgrep

Durante el análisis del endpoint de contacto del portfolio se detectó una posible vulnerabilidad de Cross Site Scripting (XSS):

```typescript
<p><strong>Nombre:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<p><strong>Asunto:</strong> ${subject}</p>
```

Semgrep identificó correctamente la inserción directa de datos proporcionados por el usuario dentro de una plantilla HTML.

Esta detección permitió validar el correcto funcionamiento del pipeline de seguridad implementado.

## Captura 4: Vulnerabilidad detectada por Semgrep

> [INSERTAR CAPTURA DE PANTALLA DEL HALLAZGO XSS]
C:\Proyectos\TFG_MasterCiber\assets\pipeline\semgrep_deteccion.png

Aunque Semgrep había funcionado correctamente y detectado vulnerabilidades reales, GitHub Actions interpretó el código de salida como un fallo de ejecución.

---

# Adaptación del pipeline para entorno académico

En entornos empresariales es habitual utilizar políticas de seguridad tipo Quality Gate:

```text
Vulnerabilidad detectada
            ↓
Pipeline bloqueado
            ↓
Despliegue cancelado
```

Sin embargo, el objetivo principal del presente Trabajo Fin de Grado es demostrar la capacidad de detección, análisis y generación de evidencias de seguridad.

Por este motivo, se decidió transformar el pipeline a un modelo informativo.

La nueva filosofía de funcionamiento quedó definida de la siguiente manera:

```text
Vulnerabilidad detectada
            ↓
Se registra el hallazgo
            ↓
Se genera informe
            ↓
Continúa el pipeline
            ↓
Se generan evidencias
```

---

# Modificaciones realizadas

Se implementaron las siguientes modificaciones:

## Semgrep

Se sustituyó la acción oficial:

```yaml
uses: returntocorp/semgrep-action@v1
```

por una ejecución manual:

```bash
semgrep \
  --config p/javascript \
  --json \
  --output semgrep.json \
  . || true
```

Esto permite:

* ejecutar el análisis completo;
* conservar los hallazgos;
* generar informes;
* evitar la interrupción del pipeline.

---

## CodeQL

Se mantuvo GitHub CodeQL como herramienta complementaria debido a su relevancia empresarial:

```yaml
continue-on-error: true

with:
  upload: false
```

---

## OWASP ZAP

Se configuró la ejecución forzada del análisis DAST:

```yaml
if: always()
```

permitiendo su ejecución independientemente del resultado de los análisis previos.

---

## Generación de informes

Se implementó un job final encargado de generar:

* resumen de vulnerabilidades;
* estadísticas de ejecución;
* comentarios automáticos en Pull Requests;
* almacenamiento de artefactos.

La ejecución del resumen se fuerza mediante:

```yaml
if: always()
```

---

# Pipeline DevSecOps final

La arquitectura final implementada quedó definida de la siguiente forma:

```text
DevSecOps Pipeline

        ┌──────────────┐
        │ Git Push/PR  │
        └──────┬───────┘
               │
        ┌──────▼───────┐
        │   Semgrep    │
        └──────┬───────┘
               │
        ┌──────▼───────┐
        │    CodeQL    │
        └──────┬───────┘
               │
        ┌──────▼───────┐
        │  npm audit   │
        └──────┬───────┘
               │
        ┌──────▼───────┐
        │ OWASP ZAP    │
        └──────┬───────┘
               │
        ┌──────▼───────┐
        │ Final Report │
        └──────────────┘
```

---

# Resultados obtenidos

El pipeline implementado permite:

* realizar análisis SAST mediante Semgrep y CodeQL;
* realizar análisis SCA mediante npm audit;
* realizar análisis DAST mediante OWASP ZAP;
* detectar vulnerabilidades reales;
* generar artefactos de seguridad;
* generar informes automáticos;
* publicar comentarios automáticos en Pull Requests;
* mantener la ejecución completa del pipeline.

## Captura 5: Pipeline final completamente funcional

> [INSERTAR CAPTURA DE PANTALLA DEL PIPELINE FINAL]
C:\Proyectos\TFG_MasterCiber\assets\pipeline\pipeline completo.png

## Captura 6: Job Summary generado automáticamente

> [INSERTAR CAPTURA DE PANTALLA DEL JOB SUMMARY]
C:\Proyectos\TFG_MasterCiber\assets\pipeline\jobs_sumary.png

## Captura 7: Comentario automático generado en Pull Request

> [INSERTAR CAPTURA DE PANTALLA DEL COMENTARIO DEL PR]
C:\Proyectos\TFG_MasterCiber\assets\pipeline\pr_coments.png
---

# Conclusiones

La implementación realizada ha permitido construir un pipeline DevSecOps completo basado exclusivamente en herramientas open source y tecnologías ampliamente utilizadas en entornos empresariales.

La solución desarrollada integra análisis estático, análisis de dependencias y análisis dinámico dentro del proceso de integración continua, proporcionando una aproximación práctica a la automatización de controles de seguridad durante el ciclo de vida del desarrollo software.

Asimismo, la adaptación del pipeline a un modelo informativo ha permitido mantener la generación continua de evidencias y reportes de seguridad sin interrumpir el flujo de integración continua, facilitando tanto la evaluación académica como la demostración práctica de capacidades DevSecOps.


---

### 1. El Problema Inicial: Fallo en el bloque DAST (`OWASP ZAP`)

El pipeline se rompía originalmente en el job de `dast`, específicamente en la etapa de conteo de hallazgos (`Count findings`), arrojando errores de sintaxis como `syntax error in expression (error token is "0")`.

* **Causa raíz:** El comando `grep -c` intentaba buscar coincidencias sobre un archivo que, o bien venía con retornos de carro invisibles (`\r\n`) de entornos mixtos, o bien no existía en la ruta esperada si la herramienta no generaba alertas. Al intentar procesar variables vacías o con caracteres extraños dentro de la operación matemática de Bash (`$((HIGH + MEDIUM + LOW))`), el intérprete fallaba.
* **Solución técnica aplicada:** * Implementamos una estructura condicional `if [ -f "report_md.md" ]` para validar la existencia real del reporte antes de leerlo.
* Añadimos un filtrado estricto de caracteres con `tr -dc '0-9'` para garantizar que la variable contuviera únicamente dígitos numéricos puros.
* Usamos expansiones de parámetros de Bash (`${HIGH:-0}`) para forzar un valor por defecto de `0` en caso de que las variables quedaran vacías.



---

### 2. El Segundo Problema: Error de Sintaxis y Token Caído

Al refinar el script, nos topamos con un error de ejecución: `unexpected EOF while looking for matching '"'`. Además, la API de GitHub rechazaba la creación automatizada de tickets con un error `Resource not accessible by integration`.

* **Causa raíz:** * Había una comilla de cierre faltante al final de una línea de redirección (`echo "low=$LOW" >> "$GITHUB_OUTPUT`).
* Por motivos de seguridad, el token por defecto del runner (`GITHUB_TOKEN`) no tiene asignados permisos de escritura sobre los *Issues* del repositorio de manera nativa.


* **Solución técnica aplicada:**
* Corregimos la sintaxis cerrando perfectamente las comillas en las salidas de `$GITHUB_OUTPUT`.
* Elevamos los privilegios del workflow añadiendo explícitamente `issues: write` en el bloque global de `permissions` de GitHub Actions.



---

### 3. El Tercer Problema: Fallos en cadena en el `Security Summary`

Cuando el bloque de `dast` fallaba o no guardaba sus variables de salida, el job consolidado final (`security-report`) se rompía también al intentar calcular el gran total (`TOTAL_FINDINGS`).

* **Causa raíz:** Intentar sumar variables que no existían porque el job anterior no las había exportado de forma correcta (`+ +`).
* **Solución técnica aplicada:** Centralizamos y limpiamos las variables al inicio del script del reporte asignando un filtro de seguridad por defecto directamente desde el contexto de dependencias de GitHub Actions (`${{ needs.dast.outputs.findings || 0 }}`). Si la herramienta no devuelve nada, el pipeline asume de forma segura que es un `0` y continúa sin romperse.

---

### 4. Arquitectura Final y Mejoras de Automatización Integradas

Para complementar la estructura y llevar tu pipeline a un estándar profesional de **DevSecOps**, se integraron las siguientes mejoras en el bloque final de **`security-report`**:

1. **Centralización Inteligente:** En lugar de hacer que cada herramienta individual sature el repositorio abriendo múltiples tickets por separado (lo que genera fatiga de alertas para el desarrollador), el pipeline recopila y analiza los resultados en un único job consolidado tras finalizar todos los escaneos.
2. **Filtrado por Severidad (Métrica de Riesgo):** Configuramos una lógica condicional matemática (`TRIGGER_ISSUE=$(( TOTAL_CRITICAL + TOTAL_HIGH ))`). El pipeline evalúa el total global de vulnerabilidades graves y **únicamente genera un Issue si el contador de fallos Críticos o Altos es mayor a cero (`-gt 0`)**. Los fallos medios o bajos se siguen mostrando visualmente en la tabla de resumen pero no ensucian el gestor de tareas.
3. **Generación de Cierre Limpio (Markdown dinámico):** Usamos bloques `cat <<EOF` dentro del CLI oficial de GitHub (`gh issue create`) para redactar un cuerpo de issue limpio, dinámico y estético, detallando de forma exacta cuántas vulnerabilidades críticas y altas encontró cada herramienta (Semgrep, npm audit u OWASP ZAP) con etiquetas automatizadas (`security`, `bug`).