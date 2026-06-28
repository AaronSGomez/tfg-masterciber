
# 🛡️ **PASO 1 — Clasificación técnica de los hallazgos de Semgrep (SAST)**  
### ✔ Archivo afectado: `frontend/pages/api/contact.ts`  
### ✔ Líneas afectadas: 48–51  
### ✔ Severidad reportada: WARNING  
### ✔ Tipo de vulnerabilidad: **Cross-Site Scripting (XSS)**  
### ✔ CWE: **CWE‑79**  
### ✔ OWASP: **A07:2017**, **A03:2021**, **A05:2025**

---

# 🧩 **1. Descripción técnica del hallazgo**

Semgrep detecta que estás **construyendo HTML manualmente** dentro del endpoint `/api/contact`, y que **datos del usuario** se insertan directamente en ese HTML.

Cita textual del informe (permitida):

> “User data flows into the host portion of this manually-constructed HTML. This can introduce a Cross-Site-Scripting (XSS) vulnerability…”

Esto significa que si un usuario envía contenido malicioso en el formulario de contacto, ese contenido podría:

- ejecutarse como JavaScript  
- manipular el DOM  
- robar cookies  
- redirigir al usuario  
- enviar peticiones en su nombre  

Aunque en tu caso es un formulario de contacto, **la vulnerabilidad existe** y debe documentarse.

---

# 🧩 **2. Clasificación del riesgo**

### ✔ **Probabilidad (likelihood): HIGH**  
El informe lo marca como HIGH porque:

- el input viene del usuario  
- no hay sanitización  
- el HTML se construye manualmente  
- Express no filtra nada por defecto  

### ✔ **Impacto: MEDIUM**  
El impacto es medio porque:

- el endpoint no devuelve HTML al navegador del usuario final  
- el HTML se usa para enviar un correo  
- el vector de explotación es limitado  

Pero sigue siendo una vulnerabilidad real.

### ✔ **Confianza del hallazgo: MEDIUM**  
Semgrep indica que es un patrón común de riesgo, pero no puede confirmar si el input llega al navegador.

---

# 🧩 **3. Cómo se explota (explicación profesional)**

Un atacante podría enviar en el formulario:

```
<script>alert("XSS")</script>
```

Si ese contenido se inserta en un HTML que luego se renderiza en algún visor, panel admin o cliente de correo vulnerable, el script se ejecutaría.

Ejemplo de impacto:

- Si tú o tu mujer abrís el correo en un cliente que interpreta HTML sin sanitizar, el script se ejecuta.  
- Si en el futuro añades un panel admin que muestra los mensajes, el XSS sería explotable.  

Por eso Semgrep lo marca como **vulnerabilidad real**.

# 🧩 **5. Cómo se corrige (solución profesional)**

### ✔ Opción 1 — Sanitizar el input  
Usar **DOMPurify** en Node:

```ts
import DOMPurify from 'isomorphic-dompurify';

const safeMessage = DOMPurify.sanitize(message);
```

### ✔ Opción 2 — No construir HTML manualmente  
Usar plantillas seguras:

```ts
const html = `
  <p><strong>Nombre:</strong> ${escape(name)}</p>
  <p><strong>Email:</strong> ${escape(email)}</p>
  <p><strong>Mensaje:</strong> ${escape(message)}</p>
`;
```

### ✔ Opción 3 — Escapar caracteres peligrosos  
Implementar una función:

```ts
function escape(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
```

---

# 🧩 **6. Clasificación final **

| Campo | Valor |
|------|-------|
| **Tipo** | Cross-Site Scripting (XSS) |
| **CWE** | CWE‑79 |
| **OWASP** | A07:2017, A03:2021, A05:2025 |
| **Probabilidad** | Alta |
| **Impacto** | Medio |
| **Severidad** | Warning (pero real) |
| **Explotabilidad** | Moderada |
| **Corrección recomendada** | Sanitización + escape + evitar HTML manual |
| **Relevancia para TFG** | Muy alta |

---

# 🛡️ **PASO 1 — Clasificación técnica de los warnings de ZAP (DAST)**  
### ✔ Target analizado: `https://asga.vercel.app`  
### ✔ Resultado: 11 Warnings, 0 Fails  
### ✔ Tipo de análisis: Passive Scan (Baseline)

---

# 🧩 **1. Re-examine Cache-Control Directives [10015]**

### 📝 **Descripción técnica**
ZAP detecta que las respuestas HTTP no incluyen directivas de cache-control adecuadas.  
Esto significa que el navegador puede almacenar contenido que debería ser temporal o privado.

### 🎯 **Impacto**
- Riesgo de que contenido sensible quede almacenado en caché.  
- En aplicaciones con autenticación, esto puede permitir acceso a contenido tras logout.  
- En tu portfolio, el impacto es **bajo**, porque no manejas datos sensibles.

### 🔥 **Riesgo real**
**Bajo**.  
Pero es una mala práctica que se debe documentar.

### 🛠️ **Corrección**
Añadir en Vercel:

```
Cache-Control: no-store
```

o para contenido estático:

```
Cache-Control: public, max-age=31536000, immutable
```

---

# 🧩 **2. Missing Anti-clickjacking Header [10020]**

### 📝 **Descripción técnica**
Falta la cabecera:

```
X-Frame-Options: DENY
```

o su equivalente moderno:

```
Content-Security-Policy: frame-ancestors 'none';
```

### 🎯 **Impacto**
Sin esta cabecera, tu web puede ser cargada dentro de un iframe externo, permitiendo ataques de **clickjacking**.

### 🔥 **Riesgo real**
**Medio**.  
No crítico en un portfolio, pero sí relevante para buenas prácticas.

### 🛠️ **Corrección**
En Vercel:

```
X-Frame-Options: DENY
```

---

# 🧩 **3. X-Content-Type-Options Header Missing [10021]**

### 📝 **Descripción técnica**
Falta:

```
X-Content-Type-Options: nosniff
```

Esto evita que el navegador “adivine” el tipo de archivo, lo cual puede permitir ejecución de contenido inesperado.

### 🎯 **Impacto**
- Previene ataques de MIME sniffing.  
- Relevante para archivos estáticos.

### 🔥 **Riesgo real**
**Medio**.

### 🛠️ **Corrección**
En Vercel:

```
X-Content-Type-Options: nosniff
```

---

# 🧩 **4. Content Security Policy (CSP) Header Not Set [10038]**

### 📝 **Descripción técnica**
No existe ninguna política CSP.  
CSP es la defensa moderna contra XSS.

### 🎯 **Impacto**
Sin CSP:

- cualquier script externo puede ejecutarse  
- no hay restricciones de origen  
- no hay protección contra inyecciones

### 🔥 **Riesgo real**
**Medio-alto**, especialmente combinado con el XSS detectado por Semgrep.

### 🛠️ **Corrección**
Ejemplo seguro:

```
Content-Security-Policy: default-src 'self'; img-src 'self' https:; script-src 'self'; style-src 'self' 'unsafe-inline';
```

---

# 🧩 **5. Storable and Cacheable Content [10049]**

### 📝 **Descripción técnica**
ZAP detecta que contenido que debería ser no-cache se está almacenando.

### 🎯 **Impacto**
Similar al warning 10015.

### 🔥 **Riesgo real**
**Bajo**.

### 🛠️ **Corrección**
Configurar cache-control correctamente.

---

# 🧩 **6. Retrieved from Cache [10050]**

### 📝 **Descripción técnica**
ZAP detecta que el navegador está sirviendo contenido desde caché sin validación.

### 🎯 **Impacto**
Puede causar:

- contenido obsoleto  
- falta de invalidación  
- problemas de seguridad en apps con login

### 🔥 **Riesgo real**
**Bajo**.

---

# 🧩 **7. Permissions Policy Header Not Set [10063]**

### 📝 **Descripción técnica**
Falta la cabecera moderna:

```
Permissions-Policy
```

Controla acceso a:

- cámara  
- micrófono  
- geolocalización  
- sensores  
- fullscreen  
- etc.

### 🎯 **Impacto**
Sin esta cabecera, el navegador permite más APIs de las necesarias.

### 🔥 **Riesgo real**
**Medio**.

### 🛠️ **Corrección**
Ejemplo:

```
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

---

# 🧩 **8. Cross-Domain Misconfiguration [10098]**

### 📝 **Descripción técnica**
ZAP detecta que recursos externos se cargan sin restricciones claras.

### 🎯 **Impacto**
Puede permitir:

- carga de scripts inseguros  
- dependencia de terceros no controlados  
- vectores de ataque XSS

### 🔥 **Riesgo real**
**Medio**.

---

# 🧩 **9. Modern Web Application [10109]**

### 📝 **Descripción técnica**
ZAP detecta que tu web usa tecnologías modernas (Next.js, Webpack, etc.) y recomienda aplicar cabeceras modernas.

### 🎯 **Impacto**
No es un fallo.  
Es una recomendación.

### 🔥 **Riesgo real**
**Bajo**.

---

# 🧩 **10. Subresource Integrity Attribute Missing [90003]**

### 📝 **Descripción técnica**
Falta el atributo SRI en recursos externos:

```
integrity="sha384-..."
crossorigin="anonymous"
```

### 🎯 **Impacto**
Sin SRI:

- si un CDN es comprometido, tu web ejecuta código malicioso  
- no hay verificación de integridad

### 🔥 **Riesgo real**
**Medio-alto**.

### 🛠️ **Corrección**
Añadir SRI a scripts externos.

---

# 🧩 **11. Cross-Origin-Embedder-Policy Missing [90004]**

### 📝 **Descripción técnica**
Falta:

```
Cross-Origin-Embedder-Policy: require-corp
```

### 🎯 **Impacto**
Esta cabecera es necesaria para:

- WebAssembly  
- SharedArrayBuffer  
- aislamiento de origen

### 🔥 **Riesgo real**
**Bajo-medio**.

---

# 🟢 **Clasificación final de los 11 warnings de ZAP**

| Warning | Riesgo | Impacto | Relevancia |
|--------|--------|----------|------------|
| Cache-Control | Bajo | Bajo | Buenas prácticas |
| Anti-clickjacking | Medio | Medio | Recomendado |
| X-Content-Type-Options | Medio | Medio | Recomendado |
| CSP Missing | Medio-Alto | Alto | Crítico si hay XSS |
| Storable Content | Bajo | Bajo | Buenas prácticas |
| Retrieved from Cache | Bajo | Bajo | Buenas prácticas |
| Permissions-Policy | Medio | Medio | Recomendado |
| Cross-Domain Misconfig | Medio | Medio | Relevante |
| Modern Web App | Bajo | Bajo | Informativo |
| SRI Missing | Medio-Alto | Alto | Importante |
| COEP Missing | Bajo-Medio | Medio | Recomendado |

---
aqui incuimos enlace directo para abrir en otra pagina  C:\Proyectos\TFG_MasterCiber\assets\pipeline\report_inicial_html.html

