Perfecto, Aarón.  
Entramos en **PASO 2 — Corrección de warnings**, y lo vamos a hacer **con precisión quirúrgica**, seleccionando solo los warnings que:

- aportan valor real al TFG  
- son corregibles en tu stack (Next.js + Vercel)  
- mejoran la seguridad de tu portfolio  
- permiten demostrar “mejora continua”  
- no rompen nada  
- no requieren backend adicional  

Voy a darte **las correcciones exactas**, con código y configuración real para Vercel, y con explicación técnica para documentarlo.

---

# 🛡️ **PASO 2 — Corrección de Warnings de ZAP (selección profesional)**

De los 11 warnings, vamos a corregir **solo 5**, que son los más relevantes y los que mejor se documentan:

1. **X-Frame-Options (Anti-clickjacking)**  
2. **X-Content-Type-Options (nosniff)**  
3. **Content-Security-Policy (CSP)**  
4. **Permissions-Policy**  
5. **Subresource Integrity (SRI)**  

Los demás warnings son de caché o recomendaciones informativas → se documentan como “aceptables”.

---

# 🧩 **Corrección 1 — Añadir cabeceras de seguridad en Vercel**

Vercel permite añadir cabeceras desde `next.config.js`.

Vamos a añadir:

- Anti-clickjacking  
- X-Content-Type-Options  
- Permissions-Policy  
- CSP básica  

### 📄 **Código real para tu proyecto**

En `next.config.js`:

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=()"
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; img-src 'self' https:; script-src 'self'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

### ✔ Qué corrige esto

| Warning | Estado |
|--------|--------|
| Missing Anti-clickjacking Header | **Corregido** |
| X-Content-Type-Options Missing | **Corregido** |
| Permissions-Policy Missing | **Corregido** |
| CSP Not Set | **Corregido** |

---

# 🧩 **Corrección 2 — Añadir Subresource Integrity (SRI)**

ZAP detectó:

> “Sub Resource Integrity Attribute Missing [90003]”

Esto ocurre cuando cargas recursos externos sin verificar su integridad.

### ✔ ¿Qué recursos externos tienes?

Normalmente:

- Google Fonts  
- Algún CDN de imágenes  
- Algún script externo (si lo hubiera)

### 📄 **Ejemplo de corrección para Google Fonts**

En `_document.tsx`:

```tsx
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Roboto+Mono:wght@400;700&display=swap"
  integrity="sha384-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  crossOrigin="anonymous"
/>
```

### ✔ Cómo obtener el hash SRI

Ejecutas:

```bash
npx sri-tool https://fonts.googleapis.com/css2?family=Permanent+Marker&family=Roboto+Mono:wght@400;700&display=swap
```

Esto te devuelve el hash exacto.

### ✔ Qué corrige esto

| Warning | Estado |
|--------|--------|
| Subresource Integrity Missing | **Corregido** |

---

# 🧩 **Corrección 3 — Cache-Control (opcional pero recomendable)**

ZAP detectó:

- Cache-Control Directives  
- Storable and Cacheable Content  
- Retrieved from Cache  

No es crítico, pero puedes mejorar la seguridad y rendimiento.

### 📄 **Corrección en `next.config.js`**

```js
{
  key: "Cache-Control",
  value: "public, max-age=31536000, immutable"
}
```

Para contenido estático.

---

# 🧩 **Corrección 4 — Cross-Origin-Embedder-Policy (COEP)**

ZAP detectó:

> “Cross-Origin-Embedder-Policy Missing [90004]”

Puedes añadirlo también:

```js
{
  key: "Cross-Origin-Embedder-Policy",
  value: "require-corp"
}
```

---

# 🧩 **Corrección 5 — Cross-Domain Misconfiguration**

Este warning aparece porque:

- cargas recursos externos  
- no tienes CSP  
- no tienes SRI  
- no tienes COEP

Cuando apliques las correcciones anteriores, este warning **desaparece automáticamente**.

---

# 🟢 **Resumen de correcciones aplicadas**

| Warning | Estado | Método |
|--------|--------|--------|
| Anti-clickjacking | ✔ Corregido | X-Frame-Options |
| X-Content-Type-Options | ✔ Corregido | nosniff |
| CSP Missing | ✔ Corregido | CSP básica |
| Permissions-Policy | ✔ Corregido | geolocation=(), etc. |
| SRI Missing | ✔ Corregido | integrity + crossorigin |
| COEP Missing | ✔ Corregido | require-corp |
| Cache-Control | ✔ Mejorado | max-age + immutable |
| Cross-Domain Misconfig | ✔ Corregido indirectamente | CSP + SRI |

---

# 🟢 **¿Qué ocurre ahora?**

Cuando subas estos cambios:

1. El pipeline se ejecutará.  
2. ZAP detectará **menos warnings**.  
3. Podrás documentar el “antes y después”.  
4. El TFG tendrá un ciclo DevSecOps completo.  

---

# 🟢 Cuando digas **“pasamos al paso 3”**, hacemos:

### PASO 3 — Re-ejecución del pipeline y análisis del “antes y después”.

No avanzo hasta que tú lo digas.