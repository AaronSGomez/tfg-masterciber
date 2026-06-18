======================================================================
GUÍA DE DESPLIEGUE: LABORATORIO SOAR (THEHIVE + CORTEX + N8N)
======================================================================

Este laboratorio despliega de forma local una infraestructura SOAR completa que incluye:
- TheHive v4 (Gestión de incidentes)
- Cortex (Motor de análisis y observables)
- Elasticsearch & Cassandra (Motores de datos y persistencia)
- n8n con PostgreSQL (Automatización de flujos)

----------------------------------------------------------------------
REQUISITO PREVIO CRÍTICO EN EL SISTEMA OPERATIVO HOST
----------------------------------------------------------------------
Antes de levantar los contenedores, Elasticsearch requiere que el sistema operativo host tenga un límite alto de mapas de memoria virtual. De lo contrario, fallará silenciosamente o se pondrá en modo lectura.

En la terminal del sistema (fuera de Docker), ejecuta como root:
$ sysctl -w vm.max_map_count=262144

Para hacer este cambio permanente tras reiniciar la máquina virtual:
Añade la línea "vm.max_map_count=262144" al final del archivo /etc/sysctl.conf

----------------------------------------------------------------------
PASO 1: PREPARACIÓN DE LOS ARCHIVOS DE CONFIGURACIÓN
----------------------------------------------------------------------
En el mismo directorio donde se ubique el archivo 'docker-compose.yml', se deben crear los archivos de configuración para TheHive y Cortex. Asegúrate de respetar los nombres exactos:

Archivo 1: docker-compose.yml
Archivo 2: thehive.conf
Archivo 3: cortex.conf

----------------------------------------------------------------------
PASO 2: ARRANQUE INICIAL DE LA INFRAESTRUCTURA DE DATOS
----------------------------------------------------------------------
Para evitar problemas de sincronización e hilos colgados en el primer inicio estéril, se debe seguir una secuencia de arranque estricta.

1. Levanta únicamente los motores de datos:
$ docker compose up -d cassandra elasticsearch

2. Monitoriza el log de Cassandra y espera a que termine de inicializarse:
$ docker logs -f thehive_cassandra

NO AVANCES al siguiente paso hasta que el flujo del log se detenga por completo y veas un mensaje similar a:
"Created default superuser role 'cassandra'" o "Startup complete"

----------------------------------------------------------------------
PASO 3: CONFIGURACIÓN INICIAL EN CORTEX Y CREACIÓN DE LA ORGANIZACIÓN
----------------------------------------------------------------------
Una vez que las bases de datos estén estables, levanta el servicio de Cortex:
$ docker compose up -d cortex

1. Abre el navegador web y accede a la interfaz de Cortex:
   URL: http://localhost:9001

2. Inicia sesión con las credenciales de superadministrador por defecto:
   - Usuario: admin
   - Contraseña: secret

3. Crear la nueva Organización:
   - En el menú superior, dirígete a la sección 'Organizations'.
   - Haz clic en 'Add organization'.
   - Nómbrala exactamente: soar_lab
   - Guarda los cambios.

4. Crear el Usuario de API y asignar Roles:
   - Dirígete a la sección global de 'Users' (Menú superior).
   - Haz clic en 'Add user'.
   - Define el identificador (ej. thehive_api) y el nombre del conector.
   - ¡CLAVE DE LA INTERFAZ!: En el formulario de creación, busca el apartado 'Organizations' o 'Roles', selecciona la organización recién creada 'soar_lab' y asígnale al lado los roles 'read' y 'write' (u 'orgadmin').
   - Guarda el usuario.

5. Generar la API Key de integración:
   - Si tras crear el usuario no lo ves en la lista global, usa el menú desplegable de filtros superiores "Organization:" y cámbialo para visualizar la organización correspondiente.
   - Localiza el usuario creado y haz clic en el botón con el icono de la llave ("Create API Key").
   - Copia la clave generada inmediatamente. (Solo se mostrará una vez).

----------------------------------------------------------------------
PASO 4: VINCULACIÓN EN THEHIVE Y MODIFICACIÓN DE LA API KEY
----------------------------------------------------------------------
Con la API Key copiada de Cortex, es el momento de preparar el archivo de configuración de TheHive.

1. Abre el archivo 'thehive.conf' con tu editor de texto.
2. Localiza el bloque de configuración final destinado a 'cortex'.
3. Modifica los parámetros 'key' y 'realm' de la siguiente manera:

   cortex {
     servers = [
       {
         name = "cortex0"
         url = "http://cortex:9001"
         auth {
           type = "bearer"
           key = "PEGA_AQUÍ_LA_API_KEY_QUE_COPIASTE_DE_CORTEX"
         }
         wsConfig {
           ws.credentials.realm = "soar_lab"
         }
       }
     ]
   }

4. Guarda y cierra el archivo 'thehive.conf'.

----------------------------------------------------------------------
PASO 5: ARRANQUE GLOBAL DEL LABORATORIO
----------------------------------------------------------------------
Una vez modificada la API Key con la organización mapeada, despliega el resto de servicios del ecosistema:

$ docker compose up -d

El framework Java/Scala de TheHive y el motor gráfico JanusGraph procederán a instanciar y estructurar las tablas e índices dentro del Keyspace de Cassandra de forma automática. Este proceso inicial puede tomar entre 1 y 2 minutos reales.

Puedes seguir el estado del arranque ejecutando:
$ docker logs -f thehive

Sabrás que ha concluido con éxito cuando visualices la línea:
"Listening for HTTP on /0.0.0.0:9000"

----------------------------------------------------------------------
PASO 6: VERIFICACIÓN FINAL
----------------------------------------------------------------------
1. Accede a la interfaz web de TheHive:
   URL: http://localhost:9000
2. Define la contraseña de administrador en el primer inicio.
3. Comprueba el estado de la integración: en el menú de administración o en la sección de Cortex, verifica que el icono del cerebro aparezca en color VERDE. 
4. Accede opcionalmente al flujo de automatización de n8n en:
   URL: http://localhost:5678

¡Laboratorio SOAR completamente funcional y listo para operar!
======================================================================



archivos
---

docker-compose.yml 

version: '3.8'

services:
  elasticsearch:
    image: elasticsearch:7.17.9
    container_name: thehive_elasticsearch
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    deploy:
      resources:
        limits:
          memory: 1024M
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - security_net

  cassandra:
    image: cassandra:3.11
    container_name: thehive_cassandra
    environment:
      - MAX_HEAP_SIZE=512M
      - HEAP_NEWSIZE=128M
      - CASSANDRA_CLUSTER_NAME=TheHive
      - CASSANDRA_CONCURRENT_READS=8
      - CASSANDRA_CONCURRENT_WRITES=8
      - CASSANDRA_CONCURRENT_COMPACTORS=1
    deploy:
      resources:
        limits:
          memory: 1024M
    volumes:
      - cassandra_data:/var/lib/cassandra
    networks:
      - security_net

  cortex:
    image: thehiveproject/cortex:3.1.7
    container_name: cortex
    depends_on:
      - elasticsearch
    environment:
      - job_directory=/opt/cortex/jobs
    ports:
      - "9001:9001"
    deploy:
      resources:
        limits:
          memory: 750M
    volumes:
      - ./cortex.conf:/etc/cortex/application.conf
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - security_net

  thehive:
    image: thehiveproject/thehive4:4.1.24
    container_name: thehive
    depends_on:
      - cassandra
      - elasticsearch
      - cortex
    ports:
      - "9000:9000"
    deploy:
      resources:
        limits:
          memory: 1024M
    volumes:
      - thehive_data:/etc/thehive
      - ./thehive.conf:/etc/thehive/application.conf 
    command: --config-file /etc/thehive/application.conf
    networks:
      - security_net

  n8n_db:
    image: postgres:16-alpine
    container_name: n8n_postgres
    environment:
      - POSTGRES_USER=n8n_user
      - POSTGRES_PASSWORD=n8n_secure_pass
      - POSTGRES_DB=n8n_database
    deploy:
      resources:
        limits:
          memory: 256M
    volumes:
      - n8n_db_data:/var/lib/postgresql/data
    networks:
      - security_net
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U n8n_user -d n8n_database"]
      interval: 5s
      timeout: 5s
      retries: 5

  n8n:
    image: n8nio/n8n:latest
    container_name: n8n_automation
    depends_on:
      n8n_db:
        condition: service_healthy
    ports:
      - "5678:5678"
    deploy:
      resources:
        limits:
          memory: 512M
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=n8n_db
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n_database
      - DB_POSTGRESDB_USER=n8n_user
      - DB_POSTGRESDB_PASSWORD=n8n_secure_pass
      - GENERIC_TIMEZONE=Europe/Madrid
      - N8N_SECURE_COOKIE=false
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - security_net

volumes:
  elasticsearch_data:
  cassandra_data:
  cortex_data:
  thehive_data:
  n8n_db_data:
  n8n_data:

networks:
  security_net:
    driver: bridge

---

thehive.conf 

play.http.secret.key="GeneraAquiUnaCadenaDeTextoAleatoriaYMuyLarga123456789"

# === CONFIGURACIÓN DE ALMACENAMIENTO (JANUSGRAPH + CASSANDRA) ===
db.janusgraph {
  storage {
    backend = "cql"
    hostname = ["thehive_cassandra"]
    cluster-name = "TheHive"
    
    cql {
      keyspace = "thehive"
      consistency-level = "LOCAL_ONE"
      read-timeout = 180000
      write-timeout = 180000
      connection-timeout = 180000
    }
  }
}

# === INDEXADOR (ELASTICSEARCH) ===
search {
  backend = "elasticsearch"
  elasticsearch {
    hosts = ["http://thehive_elasticsearch:9200"]
  }
}

# === INTEGRACIÓN CON CORTEX (CORREGIDO EL ARRAY CON CORCHETES) ===
cortex {
  servers = [
    {
      name = "cortex0"
      url = "http://cortex:9001"
      auth {
        type = "bearer"
        key = "sH6HxpfUvaFglTog8cadYPet2YZtbSqu"
      }
      wsConfig {
        ws.credentials.realm = "soar_lab"
      }
    }
  ]
}

---
cortex.conf

# === CONFIGURACIÓN DE CORTEX ===

# Dónde ejecutará Cortex los scripts de los analizadores
job {
  directory = "/opt/cortex/jobs"
}

# Rutas internas del contenedor donde se mapean los analizadores
analyzer {
  urls = [
    "/opt/cortex/analyzers"
  ]
}

responder {
  urls = [
    "/opt/cortex/responders"
  ]
}

# Indexador propio de Cortex (Apunta a tu contenedor de Elasticsearch)
search {
  backend = elasticsearch
  elasticsearch {
    hosts = ["http://thehive_elasticsearch:9200"]
  }
}

===================================================================
PASO 3: CONSTRUIR EL FLUJO DE PRUEBA (WORKFLOW) EN N8N
===================================================================

1. CREACIÓN DEL DISPARADOR (WEBHOOK PARA WAZUH)
-------------------------------------------------------------------
- En el menú izquierdo de n8n, ve a "Workflows" y haz clic en "Create a workflow".
- Elimina el nodo manual por defecto ("When clicking Execute Workflow").
- Haz clic en el botón "+" e integra el nodo "Webhook" con la siguiente configuración:
  * Authentication: None
  * HTTP Method: POST
  * Path: wazuh-alerts
- Copia la URL de producción que genera n8n (formato: http://<IP_DE_N8N>:5678/webhook/wazuh-alerts).

2. INTEGRACIÓN DEL NODO DE THEHIVE
-------------------------------------------------------------------
- Haz clic en el botón "+" a la derecha del nodo Webhook y busca "TheHive".
- En la lista de acciones iniciales, selecciona: "Case" -> "get many".
- Haz clic en el botón azul "Add Node" para colocarlo en el lienzo.
- Configuración en el panel principal:
  * Credential for TheHive v4: Selecciona la credencial API creada en el Paso 1.
  * Resource: Case
  * Operation: Get Many / Get All
- Configuración en la pestaña "Settings" (parte superior del panel):
  * ACTIVA la opción "Always Output Data". Esto es crucial para que n8n continúe el flujo hacia Cortex aunque la lista de casos inicial esté vacía ([ ]).

3. INTEGRACIÓN DEL NODO DE CORTEX
-------------------------------------------------------------------
- Haz clic en el botón "+" a la derecha del nodo de TheHive y busca "Cortex".
- En la lista de acciones iniciales, selecciona: "Job" -> "get".
- Haz clic en el botón azul "Add Node" para colocarlo en el lienzo.
- Configuración en el panel principal:
  * Credential for Cortex: Selecciona la credencial API de Cortex creada en el Paso 2.
  * Job ID: Escribe '1' (parámetro de prueba inicial).
- Configuración en la pestaña "Settings" (parte superior del panel):
  * ACTIVA la opción "Continue On Fail". Esto evita que el workflow se congele o rompa cuando Cortex devuelva que el Job 1 no existe (comportamiento normal con la base de datos limpia).

4. AUTOMATIZACIÓN EN SEGUNDO PLANO
-------------------------------------------------------------------
- En la esquina superior derecha de n8n, cambia el interruptor a "Active" (Activado).
- El flujo queda guardado en producción y escuchará de forma permanente sin necesidad de ejecuciones manuales.

===================================================================
PASO 4: VINCULACIÓN INTERNA DESDE WAZUH (OSSEC.CONF)
===================================================================

Para que Wazuh envíe de forma automática las alertas al Webhook de n8n, añade el bloque de integración exacta al final de tu archivo de configuración.

1. Abre el archivo de configuración en caliente:
   sudo nano /var/ossec/etc/ossec.conf

2. Desplázate hasta el final del archivo e inserta el bloque de integración JUSTO ANTES de la etiqueta de cierre final </ossec_config> (asegúrate de no duplicar cabeceras):

  <integration>
    <name>custom-webhook</name>
    <hook_url>http://192.168.1.88:5678/webhook/wazuh-alerts</hook_url>
    <level>3</level> 
    <alert_format>json</alert_format>
  </integration>
</ossec_config>

3. Valida la estructura XML para asegurar que no hay errores de sintaxis:
   /var/ossec/bin/wazuh-analysisd -t

4. Si no hay errores, reinicia el manager para aplicar los cambios en segundo plano:
   systemctl restart wazuh-manager

