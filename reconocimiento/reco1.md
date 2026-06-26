Para automatizar este proceso y mantener la estructura profesional que buscamos, he diseñado un script en Bash. Este script es "limpio" porque no depende de APIs externas complejas y se enfoca en lo que realmente aporta valor a tu auditoría: infraestructura, servicios expuestos y seguridad de cabeceras.

Crea un archivo llamado auditor_seguridad.sh en tu carpeta de proyecto:
Script: auditor_seguridad.sh
Bash

#!/bin/bash

# Configuración: Lista de tus dominios objetivo
DOMINIOS=("webinsegura1.duckdns.org" "webinsegura2.duckdns.org")
DIR_SALIDA="reporte_reconocimiento"

mkdir -p $DIR_SALIDA

for DOMINIO in "${DOMINIOS[@]}"; do
    echo "[*] Iniciando auditoría para: $DOMINIO"
    CARPETA="$DIR_SALIDA/$DOMINIO"
    mkdir -p $CARPETA

    # 1. Resolución DNS básica y Registros
    echo "[+] Extrayendo registros DNS..."
    dig NS $DOMINIO +short > "$CARPETA/dns_ns.txt"
    dig MX $DOMINIO +short > "$CARPETA/dns_mx.txt"
    dig A $DOMINIO +short > "$CARPETA/dns_a.txt"

    # 2. Análisis de cabeceras HTTP (Hardening)
    echo "[+] Extrayendo cabeceras HTTP..."
    curl -I -s -k "https://$DOMINIO" > "$CARPETA/headers.txt"

    # 3. Verificación de servicios (Banner grabbing)
    echo "[+] Identificando tecnologías..."
    whatweb "$DOMINIO" --log-brief="$CARPETA/tecnologias.txt"

    echo "[*] Finalizado: $DOMINIO. Resultados en $CARPETA"
done

echo "--- Auditoría completada. Estructura de carpetas generada. ---"

Cómo ejecutarlo:

    Dale permisos de ejecución: chmod +x auditor_seguridad.sh

    Lánzalo: ./auditor_seguridad.sh

Por qué este script es superior para tu reporte:

    Estructura jerárquica: Crea una carpeta para cada dominio, lo cual es el sueño de cualquier auditor técnico (orden, limpieza y trazabilidad).

    Validación de seguridad: Al usar curl -I, estás capturando las Security Headers (X-Content-Type-Options, Content-Security-Policy, etc.). Si faltan, ya tienes un hallazgo directo para tu informe.

    Sin dependencias bloqueantes: No requiere configurar APIs (como AbuseIPDB o AbstractAPI) ni se quedará colgado procesando 100 nodos innecesarios.