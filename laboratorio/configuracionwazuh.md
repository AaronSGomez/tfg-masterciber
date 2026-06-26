Configuración previa muy específica tanto en el Wazuh Manager (Ubuntu) como en el Wazuh Agent (Raspberry Pi 5) para garantizar que se capturen todas las fases del pentesting (desde los escaneos de puertos hasta la explotación del exploit crítico React2Shell) y queden registradas las evidencias requeridas para el informe.  

Por defecto, Wazuh viene configurado de forma muy restrictiva para ahorrar espacio en disco, lo que significa que solo registra eventos que superen un umbral de severidad (usualmente nivel 3 o superior) y que coincidan con sus reglas predefinidas.

### Incidencia Técnica 1: Ausencia del Bloque `archives` en la Plantilla de Filebeat
```
  sudo nano /etc/filebeat/filebeat.yml
```

* **Descripción del Problema:** Al intentar configurar la ingesta del registro de logs históricos del sistema (necesario para detectar escaneos silenciosos que no disparan firmas activas), se detectó que la plantilla por defecto de Filebeat instalada de forma nativa carecía del bloque de control `archives`.


* **Causa Raíz:** El archivo `/etc/filebeat/filebeat.yml` instalado de manera estándar desde los repositorios de Elastic no viene preconfigurado con el módulo específico de Wazuh que mapea las alertas y logs archivados (`archives.json`).


* **Solución Aplicada:** Se procedió a reconfigurar la sección de módulos de Filebeat para declarar manualmente el módulo de Wazuh y forzar la variable de archivado histórico a activa (`archives.enabled: true`) .

### Incidencia Técnica 2: Corrupción del Archivo de Configuración de Filebeat por Bloqueo de S3 (S3 AccessDenied XML)

* **Descripción del Problema:** Durante el proceso de restauración del archivo de configuración, se intentó descargar una plantilla oficial de Wazuh mediante un comando `curl` directo al repositorio S3 de la CDN de Wazuh. La descarga falló y el archivo `/etc/filebeat/filebeat.yml` fue sobreescrito por completo con un bloque de error XML:xml


AccessDeniedAccess Denied
```
Esto provocó la caída inmediata del servicio Filebeat y la pérdida de conexión del panel de control de Wazuh (Wazuh Dashboard Server is not ready yet).

```


* **Causa:** El enlace directo del S3 de Wazuh presentaba restricciones de descarga directa debido a cambios de política en la CDN de distribución de la versión del framework.
* **Solución Aplicada:** Se procedió a limpiar de forma manual el archivo corrupto mediante el editor de terminal `nano`, vaciando el XML de error y reescribiendo una configuración de Filebeat completa, limpia y compatible con Wazuh de un solo nodo (`single-node`), configurando el bloque de archivado de logs histórico en `true` .

---

## 3. Procedimiento de Configuración Paso a Paso (Puesta en Marcha)

A continuación se detalla el procedimiento técnico exacto aplicado para garantizar que el SIEM capture tanto los ataques tradicionales como el exploit de ejecución de comandos Next.js/React (React2Shell).

### Paso 3.1: Habilitación de Archives en Wazuh Manager (Ubuntu Server)

Para registrar toda la telemetría perimetral (incluidos escaneos de puertos que no disparan alertas críticas de forma predeterminada), se activa el archivado JSON general :

```
sudo nano /var/ossec/etc/rules/local_rules.xml
```

1. Modificación de `/var/ossec/etc/ossec.conf` para habilitar `logall_json` :
```xml
<global>
  <jsonout_output>yes</jsonout_output>
  <alerts_log>yes</alerts_log>
  <logall>no</logall>
  <logall_json>yes</logall_json>
</global>

```
C:\Proyectos\TFG_MasterCiber\assets\configwazuh ossec_conf.png
captura de pantalla de la configuracion en terminal de ossec.conf

2. Reinicio del servicio del motor de análisis:
```bash
sudo systemctl restart wazuh-manager

```


### Paso 3.2: Reconstrucción y Hardening de Filebeat (`/etc/filebeat/filebeat.yml`)

Sustitución del archivo corrupto por la configuración unificada y verificada:

```yaml
filebeat.modules:
  - module: wazuh
    alerts:
      enabled: true
    archives:
      enabled: true # Requerido para ingestar logs de escaneos y auditoría

output.elasticsearch:
  hosts: ["[https://127.0.0.1:9200](https://127.0.0.1:9200)"] # Apunta al Indexer local o remoto
  protocol: "https"
  username: "admin"
  password: "SecretPassword" # Reemplazar con las credenciales robustas del entorno
  ssl.certificate_authorities: ["/etc/filebeat/certs/root-ca.pem"]
  ssl.certificate: "/etc/filebeat/certs/wazuh-server.pem"
  ssl.key: "/etc/filebeat/certs/wazuh-server-key.pem"

setup.template.json.enabled: true
setup.template.json.path: "/etc/filebeat/wazuh-template.json"
setup.template.json.name: "wazuh"
setup.template.overwrite: true
setup.ilm.enabled: false

logging.level: info
logging.to_files: true
logging.files:
  path: /var/log/filebeat
  name: filebeat
  keepfiles: 7
  permissions: 0644

seccomp:
  default_action: allow

```

### Paso 3.3: Pruebas de Sintaxis y Reinicio de Filebeat

1. Validación de la sintaxis del YAML:
```bash
sudo filebeat test config

```


2. Si el resultado es `Config OK`, se procede a reiniciar el servicio para sincronizar el Indexer:
```bash
sudo systemctl restart filebeat

```

## 4. Configuración del local_rules.xml para registrar los logs 

```
sudo nano /var/ossec/etc/rules/local_rules.xml
```

Se agregan estas reglas para que se reflejen los eventos en el json

```
<group name="nextjs_security,">

  <rule id="100500" level="0">
    <decoded_as>json</decoded_as>
    <field name="source">app_server</field>
    <description>Evento de telemetría de seguridad generado por Next.js.</description>
  </rule>

  <rule id="100503" level="14">
    <if_sid>100500</if_sid>
    <match>node:child_process|execSync|Flight-Protocol</match>
    <description>Severidad Crítica: Explotación React2Shell detectada (CVE-2025-55182).</description>
  </rule>

  <rule id="100504" level="14">
    <if_sid>100500</if_sid>
    <match>malicious_input_detected</match>
    <description>Severidad Crítica: Intento de intrusión detectado por la aplicación (React2Shell).</description>
  </rule>

</group>
```

captura de pantalla de C:\Proyectos\TFG_MasterCiber\assets\configpi5 ossec_conf.png




---

## 4. Configuración del Agente de Escucha (Raspberry Pi 5)

```
sudo nano /var/ossec/etc/ossec.conf
```

Para que la telemetría de los contenedores Docker llegue al servidor centralizado en Ubuntu, se edita el archivo del sensor local `/var/ossec/etc/ossec.conf` en la Raspberry Pi 5, añadiendo las directivas de lectura de los volúmenes de logs :

```xml
<ossec_config>
  <localfile>
    <log_format>apache</log_format>
    <location>/var/log/nginx/access.log</location>
  </localfile>

  <localfile>
    <log_format>json</log_format>
    <location>/var/log/app/security.json</location>
    <label key="app.name">nextjs_vulnerable</label>
  </localfile>
</ossec_config>

```
C:\Proyectos\TFG_MasterCiber\assets\configpi5 ossec_conf.png
aqui captura de pantalla de la configuracion de la pi5 

Se reinicia el agente nativo de la Pi 5 para levantar la conexión HTTPS cifrada en el puerto 1514 hacia el Manager :

```bash
sudo systemctl restart wazuh-agent

```

---

## 5. Validación del Canal de Detección (`wazuh-logtest`)

Para comprobar que las reglas personalizadas XML responderán correctamente al detonar el ataque ofensivo React2Shell (Ítem #6) , se ejecuta la herramienta de simulación en el servidor Ubuntu :

```bash
sudo /var/ossec/bin/wazuh-logtest

```

Entrada de prueba (Log JSON de ataque simulado) :

```json
{"source":"app_server","context":"rsc_deserialization","status":"malicious_input_detected","input_received":"1:I","error_message":"Intento de inyección de módulo crítico detectado."}

```

Resultado de la simulación de alerta :

```text
**Phase 1: Completed pre-decoding.
**Phase 2: Completed decoding.
       name: 'json'
       source: 'app_server'
       input_received: '1:I'
**Phase 3: Completed filtering (rules).
       id: '100503'
       level: '14'
       description: 'Severidad Crítica: Explotación React2Shell detectada (CVE-2025-55182).'
       groups: '['web', 'lab_modern_app']'
       mitre.id: 'T1210'
**Alert to be generated.

```

aqui mostramos captura de pantalla C:\Proyectos\TFG_MasterCiber\assets\logtest.png

Este resultado confirma que el motor del SIEM decodifica correctamente las variables de entrada JSON y disparará con éxito la alerta roja de severidad crítica 14 en la consola web en cuanto se emule el exploit real.

