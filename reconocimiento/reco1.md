Perfecto, Aarón. Ya tengo **todas tus capturas**, el **log de SpiderFoot**, el **resultado del script**, y ahora puedo integrarlo todo en tu informe como una **sección final de auditoría automatizada**, explicando:

- qué hace tu script,  
- qué información extrae,  
- cómo se almacenan los resultados,  
- y cómo se documentan las capturas.

Aquí tienes la **sección lista para pegar en tu .md**, con redacción profesional y totalmente coherente con el resto del informe.

---

# 🟪 6. Auditoría automatizada con `auditor_seguridad.sh`

Para complementar las fases de reconocimiento manual y semiautomático (Nmap, WhatWeb, DIG, SpiderFoot), se desarrolló y ejecutó un script propio en Bash denominado **`auditor_seguridad.sh`**, encargado de automatizar la extracción de:

- Registros DNS  
- Cabeceras HTTP  
- Tecnologías detectadas por WhatWeb  
- Organización de resultados en carpetas por dominio  

Este script permite generar un **reporte reproducible**, ordenado y estandarizado para cada objetivo.

---

## 🟦 6.1 Ejecución del script

El script se hizo ejecutable y se lanzó desde el escritorio:

```
chmod +x auditor_seguridad.sh
./auditor_seguridad.sh
```

### 📸 Captura — Ejecución del script  
*(Terminal mostrando la auditoría de webinsegura1 y webinsegura2, con extracción de DNS, headers y tecnologías)*

---

## 🟩 6.2 Resultados generados para `webinsegura1.duckdns.org`

El script produjo la carpeta:

```
reporte_reconocimiento/webinsegura1.duckdns.org/
```

con los siguientes archivos:

### ✔️ `dns_a.txt`
Contiene la IP pública:

```
5.40.33.18
```

### ✔️ `headers.txt`
Cabeceras HTTP extraídas:

```
HTTP/1.1 200 OK
Server: Apache/2.4.67 (Debian)
X-Powered-By: Next.js
Content-Type: text/html; charset=utf-8
```

### ✔️ `tecnologias.txt`
Salida de WhatWeb:

```
https://webinsegura1.duckdns.org [200 OK] Apache/2.4.67, Next.js, Debian Linux
```

### 📸 Captura — Archivos generados para webinsegura1  
*(Editor mostrando headers.txt, dns_a.txt y tecnologias.txt)*

---

## 🟩 6.3 Resultados generados para `webinsegura2.duckdns.org`

El script produjo la carpeta:

```
reporte_reconocimiento/webinsegura2.duckdns.org/
```

con los siguientes archivos:

### ✔️ `dns_a.txt`
```
5.40.33.18
```

### ✔️ `dns_mx.txt`
```
50 webinsegura2.duckdns.org.
```

### ✔️ `headers.txt`
Cabeceras HTTP extraídas:

```
HTTP/1.1 302 Found
Server: Apache/2.4.54 (Debian)
X-Powered-By: PHP/8.1.16
Set-Cookie: PHPSESSID=...
```

### ✔️ `tecnologias.txt`
Salida de WhatWeb:

```
1 https://webinsegura2.duckdns.org [301 Moved Permanently] Apache/2.4.67
2 https://webinsegura2.duckdns.org [302 Found] Apache/2.4.54, PHP/8.1.16
3 https://webinsegura2.duckdns.org/login.php [200 OK] DVWA, HTML5
```

### 📸 Captura — Archivos generados para webinsegura2  
*(Editor mostrando headers.txt, dns_mx.txt, dns_a.txt y tecnologias.txt)*

---

## 🟧 6.4 Conclusión de la auditoría automatizada

> El script `auditor_seguridad.sh` permitió automatizar la recolección de información clave de reconocimiento pasivo, generando una estructura de carpetas organizada y homogénea para cada dominio.  
>  
> Los resultados confirman nuevamente que ambos objetivos comparten la misma IP pública (5.40.33.18), utilizan Apache en Debian, y exponen únicamente los servicios esperados:  
> - **Next.js** en webinsegura1  
> - **DVWA + PHP** en webinsegura2  
>  
> No se detectaron servicios adicionales ni configuraciones inesperadas.

---

## 🟦 6.5 (Opcional) — Incluir el script en el informe

Si quieres, puedo formatear tu script en un bloque de código listo para incluir en el informe, con comentarios y explicación línea por línea.

---

agregar las imagenes 10 y 11


y cerramos ya el bloque de reconocimieto el punto 1 completo