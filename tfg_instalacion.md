```
                              [ KALI LINUX ]
                                    │  (Internet / WAN)
                                    ▼
                 [ APACHE2 Nativo (Host) Puerto 80/443 ]
                  (Filtra por IP y hace Reverse Proxy)
                                    │
            ┌───────────────────────┴───────────────────────┐
            ▼ (Red de Docker)                               ▼ (Red de Docker)
[ Contenedor: modern_app ]                      [ Contenedor: classic_app (DVWA) ]
  (webinsegura1.duckdns.org)                      (webinsegura2.duckdns.org)
```

  ## Configuracion docker-compose.yml
Eliminamos el proxy intermedio de Docker y mapeamos los puertos de las apps vulnerables a puertos locales altos (por ejemplo, 8081 y 8082) para que Apache pueda redirigir el tráfico hacia ellos.
  ```
 networks:
  lab_net:
    driver: bridge

services:
  db_server:
    image: mariadb:10.11
    container_name: lab-db-server
    restart: always
    networks:
      - lab_net
    environment:
      MYSQL_ROOT_PASSWORD: RootSecurePassword2026_Unused
      MYSQL_DATABASE: lab_modern_db
      MYSQL_USER: db_modern_user
      MYSQL_PASSWORD: InsecureAIPassword_123
    volumes:
      - db_data:/var/lib/mysql

  modern_app:
    build: ./modern_app          # Construye la imagen vulnerable localmente
    container_name: lab-modern-app
    restart: always
    ports:
      - "127.0.0.1:8081:8000"     # Expuesto internamente para Apache en el 8081
    networks:
      - lab_net
    environment:
      DB_HOST: lab-db-server
      DB_USER: db_modern_user
      DB_PASS: InsecureAIPassword_123
      DB_NAME: lab_modern_db
      NODE_ENV: development

  classic_app:
    image: cytopia/dvwa:latest     # Imagen nativa compatible con ARM64 (Raspberry Pi 5)
    container_name: lab-classic-app
    restart: always
    ports:
      - "127.0.0.1:8082:80"       # Expuesto internamente para Apache en el 8082
    networks:
      - lab_net
    environment:
      DBMS: MySQL
      DB_SERVER: lab-db-server
      MYSQL_HOSTNAME: lab-db-server
      MYSQL_USERNAME: db_modern_user
      MYSQL_PASSWORD: InsecureAIPassword_123
      MYSQL_DATABASE: lab_modern_db

volumes:
  db_data:
  ```
Nota: Al mapear los puertos como `127.0.0.1:8081`, nos aseguramos de que nadie en internet pueda saltarse tu Apache atacando directamente a los puertos de Docker.

Para que funcione debemos crear las depencias para la instalacion del alpine:18 y su React con `React2Shell (CVE-2025-55182 / CVE-2025-66478)` 
```
mkdir -p ~/docker/ciber_tfg/modern_app
```
Crea el archivo `~/docker/ciber_tfg/modern_app/package.json`:
``` 
{
  "name": "lab-react2shell",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 8000"
  },
  "dependencies": {
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "react-server-dom-webpack": "19.0.0",
    "next": "15.0.1"
  }
}
```
Crea en la carpeta modern_app el archivo Dockerfile:
```
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
EXPOSE 8000
CMD ["npm", "run", "dev"]
```

# Problemas encontrados:
### Errores críticos detectados en el despliegue inicial:

Al arrancar los contenedores por primera vez, Dozzle solo mostraba activo el servicio `lab-db-server`. Las aplicaciones `modern_app` y `classic_app` entraron en un ciclo de paradas continuas (*CrashLoop*). Tras auditar el estado con `docker compose logs`, se identificaron dos fallos de infraestructura:

1. **Fallo de Arquitectura en la app Clásica (DVWA):**
   * **Log del fallo:** `lab-classic-app | exec /main.sh: exec format error`
   * **Causa:** La imagen `vulnerables/web-dvwa:latest` está compilada exclusivamente para arquitecturas Intel/AMD (`amd64`). Al intentar correrla bajo el procesador ARM64 de la Raspberry Pi 5, el script binario de inicialización rompe por incompatibilidad de instrucciones de CPU.
   * **Corrección:** Se sustituyó por la imagen `cytopia/dvwa:latest`, mantenida activamente y con soporte nativo multiplataforma para ARM64.

2. **Fallo de Estructura en la app Moderna (Node/Next.js):**
   * **Log del fallo:** `npm error enoent Could not read package.json: Error: ENOENT: no such file or directory, open '/app/package.json'`
   * **Causa:** La imagen base oficial de Node arranca completamente limpia. Al no disponer de un proyecto local montado con su correspondiente `package.json`, el contenedor aborta el comando de inicio de manera inmediata.
   * **Corrección:** Se modificó el despliegue para generar una construcción de imagen localizada (`build`) apoyada en un `Dockerfile` personalizado.

## Errores de dependencias y variables de entorno post-migración:

Tras corregir la arquitectura ARM64 y reestructurar el entorno, surgieron los últimos conflictos técnicos en la compilación y conexión de los servicios:

1. **Bloqueo del gestor de paquetes (ERESOLVE) en Next.js:**
   * **Log del fallo:** `npm error code ERESOLVE unable to resolve dependency tree ... peer react@"^18.2.0" from next@15.0.1`
   * **Causa:** La versión de desarrollo inestable de `next@15.0.1` chocaba de manera estricta contra la versión final de `react@19.0.0` requerida para forzar el entorno vulnerable a *React2Shell*.
   * **Corrección:** Se editó el `Dockerfile` añadiendo el flag `--legacy-peer-deps` en la instrucción de instalación (`RUN npm install --legacy-peer-deps`) para saltarse la comprobación de compatibilidad e inyectar el entorno comprometido.

2. **Falta del árbol de directorios de la App moderna:**
   * **Log del fallo:** `Error: > Couldn't find any 'pages' or 'app' directory. Please create one under the project root`
   * **Causa:** Next.js exige encontrar la estructura de carpetas del framework para poder iniciar el servidor de desarrollo.
   * **Corrección:** Se generó la carpeta de manera forzada mediante la consola (`mkdir -p modern_app/app`) aportando un archivo básico de entrada (`page.js`).

3. **Variables de entorno incompatibles en la nueva DVWA:**
   * **Log del fallo:** `lab-classic-app | [ERROR] MYSQL_HOSTNAME env variable is not set, but required`
   * **Causa:** El contenedor adaptado para ARM64 (`cytopia/dvwa`) no acepta los parámetros estándar `DB_SERVER` o `MYSQL_USER` declarados en la primera plantilla.
   * **Corrección:** Se remapearon las claves del diccionario `environment` en el archivo YAML asignando estrictamente las variables mapeadas del contenedor: `MYSQL_HOSTNAME` y `MYSQL_USERNAME`.

---

## Creamos los subdominios para vincular las apps
![alt text](image.png)



### Crear el archivo de configuración para la IP permitida
Crear archivo en el host 
```
sudo nano /etc/apache2/allowed_ip.conf
```
Se escribe IP de prueba, modificaremos esta con script de python para poder atacar desde Kali en pc portatil por movil-WAN 
```
Define ALLOWED_ATTACKER_IP 1.2.3.4
```

### Configurar los VirtualHost de Apache
Habilitar los módulos
```
sudo a2enmod proxy proxy_http headers rewrite
```
te devuelve algo asi:
```
makpi5@makpi5:~/docker/ciber_tfg $ sudo a2enmod proxy proxy_http headers rewrite
Module proxy already enabled
Considering dependency proxy for proxy_http:
Module proxy already enabled
Module proxy_http already enabled
Module headers already enabled
Module rewrite already enabled
```

Creamos el archivo de configuración en Apache (/etc/apache2/sites-available/tfg_vulnerable.conf):
```
sudo nano /etc/apache2/sites-available/tfg_vulnerable.conf
```
y dentro 
```
# Incluimos el archivo que contiene la IP del atacante
Include /etc/apache2/allowed_ip.conf

# ---------------------------------------------------------
# Configuración para webinsegura1 (App Moderna)
# ---------------------------------------------------------
<VirtualHost *:443>
    ServerName webinsegura1.duckdns.org

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/webinsegura1.duckdns.org/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/webinsegura1.duckdns.org/privkey.pem

    # Restricción de acceso estricta
    <Location />
        Require ip ${ALLOWED_ATTACKER_IP}
    </Location>

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:8081/
    ProxyPassReverse / http://127.0.0.1:8081/
</VirtualHost>

# ---------------------------------------------------------
# Configuración para webinsegura2 (App Clásica - DVWA)
# ---------------------------------------------------------
<VirtualHost *:443>
    ServerName webinsegura2.duckdns.org

    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/webinsegura2.duckdns.org/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/webinsegura2.duckdns.org/privkey.pem

    # Restricción de acceso estricta
    <Location />
        Require ip ${ALLOWED_ATTACKER_IP}
    </Location>

    ProxyPreserveHost On
    ProxyPass / http://127.0.0.1:8082/
    ProxyPassReverse / http://127.0.0.1:8082/
</VirtualHost>
```
Creamos los certificados Let's Encrypt


### Activamos y reiniciamos Apache
```
sudo a2ensite tfg_vulnerable.conf
sudo systemctl restart apache2
```


### Errores y soluciones en Proxy y Certificados

* **Bloqueo interactivo de Certbot**
  * **Problema:** Al lanzar Certbot, daba el error `We were unable to find a vhost...` e intentaba modificar archivos de otros servicios activos (Odoo, Spring).
  * **Solución:** Se canceló el asistente y se generaron los certificados de forma limpia con `certonly --webroot`. Así se guardan de forma aislada sin romper nada.

* **Fuga de información en el puerto 80**
  * **Problema:** Las peticiones HTTP redirigían a HTTPS de forma global. Un escáner externo recibía un `301 Redirect`, detectando que el subdominio existía antes de comprobar su IP.
  * **Solución:** Se añadieron bloques `<VirtualHost *:80>` específicos en `tfg_vulnerable.conf`. Ahora el filtro `Require ip` actúa antes de la redirección, dando un `403 Forbidden` directo a cualquier intruso.

* **Ruta única de certificados**
  * **Problema:** Al crear los certificados de forma conjunta, Let's Encrypt guardó las llaves de ambos subdominios dentro de la carpeta del primero (`/live/webinsegura1.duckdns.org/`). Apuntar a rutas separadas rompía Apache.
  * **Solución:** Se configuraron ambos VirtualHosts del puerto 443 para que apunten a la ruta unificada de `webinsegura1`.

### El Script de Python para cambiar la IP de forma remota
Crea el archivo `update_ip.py`:
```
import re
import os
import sys
import subprocess

CONFIG_PATH = "/etc/apache2/allowed_ip.conf"

def validate_ip(ip):
    # Validar estructura básica de IPv4
    match = re.match(r"^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$", ip)
    if not match:
        return False
    return all(0 <= int(component) <= 255 for component in match.groups())

def main():
    if os.geteuid() != 0:
        print("[-] Este script debe ejecutarse con privilegios de root (sudo).")
        sys.exit(1)

    new_ip = input("[+] Introduce la IP pública de tu Kali Linux: ").strip()

    if not validate_ip(new_ip):
        print("[-] Error: El formato de la IP no es válido.")
        sys.exit(1)

    try:
        # Escribir la nueva IP en el archivo de configuración de Apache
        with open(CONFIG_PATH, "w") as f:
            f.write(f"Define ALLOWED_ATTACKER_IP {new_ip}\n")
        print(f"[+] Archivo {CONFIG_PATH} actualizado con la IP: {new_ip}")

        # Validar la configuración de Apache antes de reiniciar (evita romper el servicio)
        print("[*] Validando configuración de Apache...")
        result = subprocess.run(["apache2ctl", "configtest"], capture_output=True, text=True)
        
        if "Syntax OK" in result.stderr or "Syntax OK" in result.stdout:
            # Recargar Apache sin cortar las conexiones activas
            subprocess.run(["systemctl", "reload", "apache2"])
            print("[+] Apache recargado con éxito. ¡Acceso permitido para tu Kali!")
        else:
            print("[-] Error de sintaxis en Apache detectado. Revierte los cambios.")
            print(result.stderr)

    except Exception as e:
        print(f"[-] Ocurrió un error inesperado: {e}")

if __name__ == "__main__":
    main()
```
Para usarlo:
```
sudo python3 update_ip.py
```

### Pruebas de Acceso Perimetral (Script Python)

Para validar el aislamiento de los contenedores mediante el proxy inverso, se empleó el script dinámico de gestión de IP (`update_ip.py`).

* **Prueba desde Red Externa (Móvil WAN):** * Se obtuvo la IP pública del smartphone (aislado de la red Wi-Fi local).
  * Tras introducir dicha IP en el script, se comprobó el acceso exitoso: `webinsegura1.duckdns.org` resolvió en el panel de **React2Shell** y `webinsegura2.duckdns.org` expuso correctamente el login de **DVWA**.
* **Prueba de Aislamiento Perimetral:**
  * Cualquier petición externa fuera de la IP registrada recibió un código de estado `403 Forbidden` directo desde la directiva del puerto 80, confirmando el blindaje total frente a escaneos aleatorios de internet.

---

### Instalación y Configuración del Agente de Seguridad Wazuh

Para integrar la Raspberry Pi 5 en la infraestructura de monitorización y auditoría del TFG, se configuró el agente oficial de Wazuh de forma nativa explotando la arquitectura ARM64 del host.

#### 1. Firma y Repositorios Oficiales
Para asegurar la integridad de los paquetes descargados, se importó la clave criptográfica GPG de Wazuh y se dio de alta su canal de distribución estable compatible con Debian:

    # Importar clave GPG oficial
    curl -s [https://packages.wazuh.com/key/GPG-KEY-WAZUH](https://packages.wazuh.com/key/GPG-KEY-WAZUH) | sudo gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import
    sudo chmod 644 /usr/share/keyrings/wazuh.gpg

    # Indexar el repositorio en las fuentes del sistema
    echo "deb [signed-by=/usr/share/keyrings/wazuh.gpg] [https://packages.wazuh.com/4.x/apt/](https://packages.wazuh.com/4.x/apt/) stable main" | sudo tee /etc/apt/sources.list.d/wazuh.list
    sudo apt update

#### 2. Despliegue Orientado al Manager
El agente requiere conocer la ubicación del panel central (alojado en la máquina virtual Debian). Se realizó el aprovisionamiento automatizado inyectando la variable de entorno del host durante la instalación por `apt`:

    sudo WAZUH_MANAGER='IP_DE_LA_VM_DEBIAN' apt-get install wazuh-agent

#### 3. Auditoría y Enlace de Comunicación
Para verificar la persistencia o reconfigurar la IP del servidor en caso de migración de subredes de la máquina virtual, se edita el bloque cliente del archivo de configuración centralizado:

    sudo nano /var/ossec/etc/ossec.conf

Fichero de configuración interna (`ossec.conf`):

    <client>
      <server>
        <address>IP_LOCAL_DE_LA_VM_DEBIAN</address>
        <port>1514</port>
        <protocol>tcp</protocol>
      </server>
    </client>

#### 4. Gestión del Demonio del Sistema
Por seguridad, el agente no inicia sus hilos de monitorización de forma automática tras el empaquetado. Se procedió a recargar el gestor de arranque, habilitar la persistencia tras reinicios del hardware e iniciar los servicios activos:

    sudo systemctl daemon-reload
    sudo systemctl enable wazuh-agent
    sudo systemctl start wazuh-agent

#### 5. Diagnóstico de Conexión
Para certificar que el proceso nativo reporta telemetría en tiempo real de forma exitosa (comprobando submódulos críticos como `wazuh-syscheckd` y `wazuh-logcollector`), se ejecuta la inspección del estado del demonio:

    sudo systemctl status wazuh-agent

Salida esperada del estado:

    ● wazuh-agent.service - Wazuh agent
         Loaded: loaded (/usr/lib/systemd/system/wazuh-agent.service; enabled; preset: enabled)
         Active: active (running) since Sun 2026-06-07 23:43:12 CEST; 3 days ago
       CGroup: /system.slice/wazuh-agent.service
               ├─1945 /var/ossec/bin/wazuh-execd
               ├─1959 /var/ossec/bin/wazuh-agentd
               ├─2276 /var/ossec/bin/wazuh-syscheckd
               └─2289 /var/ossec/bin/wazuh-logcollector

Validar logs de sincronización TLS con el Manager:

    sudo tail -n 20 /var/ossec/logs/ossec.log | grep -E "agentd|connected|status"

Salida esperada de los logs:

    wazuh-agentd: INFO: Agent is now connected to the manager

---
AQUI

### Instalación y Despliegue de Wazuh Server en Entorno Virtual

Para centralizar la recepción de alertas, el análisis de logs y la auditoría de cumplimiento del laboratorio, se desplegó una instancia centralizada de **Wazuh Manager** en una máquina virtual dedicada.

#### 1. Aprovisionamiento de la Máquina Virtual (VMware)
Se creó una máquina virtual sobre **VMware Workstation/ESXi** utilizando una distribución base **Debian 12 (Bookworm) x86_64** configurada con los siguientes recursos mínimos de hardware para garantizar la estabilidad de los motores indexadores (Wazuh Indexer y Dashboard):
* **CPU:** 2 Cores.
* **Memoria RAM:** 4 GB DDR4.
* **Almacenamiento:** 30 GB SSD.

#### 2. Configuración de Red en Modo Bridge (Puente)
Para que el agente nativo de la Raspberry Pi 5 y el servidor de Wazuh puedan comunicarse de forma bidireccional y transparente, se descartó el direccionamiento NAT aislado del hipervisor.

* **Acción:** Se editó la configuración de hardware de la máquina virtual en VMware, conmutando el adaptador de red a **Network Connection: Bridged (Replicate physical network connection state)**.
* **Resultado:** La máquina virtual Debian pasó a formar parte de la misma subred local física que la Raspberry Pi 5, obteniendo una dirección IP privada directa a través del servidor DHCP del router.

> **[ CAPTURA DE PANTALLA 1: Configuración de hardware de VMware mostrando el adaptador de red en modo 'Bridged' ]**

---

#### 3. Instalación Automatizada de Wazuh Server
Una vez levantado el sistema operativo Debian y con conectividad de red validada, se ejecutó el script oficial de instalación desatendida proporcionado por Wazuh, el cual despliega de forma integrada el Indexer, el Server y el Dashboard mediante certificados TLS locales autofirmados:

    curl -sO https://packages.wazuh.com/4.x/wazuh-install.sh && sudo bash wazuh-install.sh -a

Al finalizar el despliegue, el script genera las credenciales de acceso administrador por defecto (`admin / contraseña_aleatoria`).

---

#### 4. Verificación de Servicios del Servidor
Para garantizar que todos los sockets y servicios del backend de seguridad están escuchando correctamente en la máquina virtual, se audita el estado del clúster local:

    sudo tar -xf wazuh-install-files.tar
    sudo bash wazuh-install.sh --check-health

O inspeccionando directamente los demonios del sistema:

    sudo systemctl status wazuh-manager wazuh-indexer wazuh-dashboard

> **[ CAPTURA DE PANTALLA 2: Terminal de la VM Debian ejecutando la comprobación de salud o mostrando los servicios en estado 'active (running)' ]**

---

#### 5. Acceso al Panel de Control (Wazuh Dashboard)
Con el direccionamiento puente validado, se accede a la interfaz web de administración desde cualquier navegador de la red local introduciendo la IP privada asignada a la máquina virtual Debian:

    https://IP_DE_LA_VM_DEBIAN

Tras autenticarse con las credenciales cifradas de administrador, el panel muestra el estado global de la infraestructura, confirmando que el agente nativo de la Raspberry Pi 5 (`makpi5`) se encuentra sincronizado, activo y transmitiendo eventos de seguridad en tiempo real.

> **[ CAPTURA DE PANTALLA 3: Interfaz Web de Wazuh Dashboard donde se aprecie el panel principal y el listado de Agentes Activos mostrando la Raspberry Pi 5 conectada ]**