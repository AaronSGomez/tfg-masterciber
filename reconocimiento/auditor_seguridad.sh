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
