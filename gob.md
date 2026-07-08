# Gobierno de Seguridad y Plan Director (PDS)

Este documento reúne las directrices de gobernanza de seguridad, la política del entorno distribuido, la asignación de responsabilidades de respuesta a incidentes, la evaluación de riesgos cuantitativos (MAGERIT v3) y la planificación estratégica a 12 meses (Plan Director de Seguridad) aplicadas al entorno del proyecto.

---

## 1. Política de Seguridad: Entorno Distribuido
El entorno del laboratorio asume un modelo distribuido compuesto por dos servidores principales para minimizar la superficie de exposición y garantizar la resiliencia operativa:

*   **Servidor 1: Frontal Perimetral (Búnker Nginx DMZ)**
    *   **Función:** Aloja la Landing Page pública, la pasarela de autenticación y el proxy reverso Nginx.
    *   **Seguridad:** Filtra payloads sospechosos, gestiona certificados SSL/TLS, aplica límites de peticiones (Rate Limiting) y reporta logs de acceso perimetrales.
*   **Servidor 2: Servidor Interno de Aplicaciones (Wazuh & Base de Datos)**
    *   **Función:** Ubicado detrás del búnker frontal. Aloja el servidor Wazuh (SIEM), la base de datos privada (MariaDB) y la lógica de negocio (Spring Boot).
    *   **Seguridad:** Solo se comunica con el Servidor 1 por canales aislados de red privada.

---

## 2. Roles y Asignación de Responsabilidades
En caso de un ataque de seguridad contra los servidores, la política dictamina la asignación de tareas específicas para evitar demoras en la respuesta:

*   **Analista de Seguridad SOC:** Monitoriza la consola de Wazuh y alertas en tiempo real. Realiza el triage inicial ante anomalías (como inyecciones SQL o fuerza bruta), descarta falsos positivos y notifica al Administrador de Sistemas.
*   **Administrador de Sistemas:** Responsable del mantenimiento de la infraestructura. Ejecuta el aislamiento lógico de servidores (mediante reglas de firewall UFW), aplica parches de seguridad y gestiona la restauración de copias de seguridad.
*   **Director de Incidentes (CISO):** Responsable estratégico de coordinar la respuesta. Declara estados de crisis de seguridad, autoriza paradas de producción si es necesario, y lidera la redacción del reporte forense.

---

## 3. Protocolo de Actuación ante Explotación
Frente a una intrusión crítica (como RCE o bypass de autenticación), se activa el protocolo en las siguientes fases:

1.  **Fase 1: Contención:** Bloqueo inmediato de IPs atacantes a nivel de UFW y Nginx. Si el Servidor 1 está comprometido, se aísla de la red privada para evitar que el ataque alcance al Servidor 2.
2.  **Fase 2: Erradicación:** Eliminación de procesos maliciosos, revocación de todas las cookies y sesiones activas del usuario afectado, y corrección en caliente de la vulnerabilidad en el código fuente.
3.  **Fase 3: Recuperación:** Restauración de servicios a partir de snapshots/backups limpios, cambio de credenciales globales del sistema y reactivación de auditorías.

---

## 4. Análisis Cuantitativo de Riesgos (Metodología MAGERIT v3)
La severidad o valor del riesgo se determina mediante la ecuación formal:
$$\text{Riesgo} = \text{Impacto (1 a 5)} \times \text{Probabilidad (1 a 5)}$$

### Matriz de Activos y Riesgos del Laboratorio:
| ID | Activo Crítico | Amenaza Identificada | Impacto (I) | Probabilidad (P) | Riesgo (I x P) | Nivel de Riesgo |
| :--- | :--- | :--- | :---: | :---: | :---: | :--- |
| **ACT-01** | Servidor de Aplicación (Next.js/Spring) | Ejecución Remota de Código (RCE) | 5 | 3 | **15** | <span style="color:red">**MUY ALTO**</span> |
| **ACT-02** | Base de Datos (MariaDB) | Inyección SQL y Robo de Credenciales | 5 | 2 | **10** | <span style="color:orange">**ALTO**</span> |
| **ACT-03** | Proxy Reverso (Búnker Nginx DMZ) | Denegación de Servicio (DoS/DDoS) o Bypass | 4 | 3 | **12** | <span style="color:orange">**ALTO**</span> |
| **ACT-04** | Servidor SIEM (Wazuh Manager) | Caída de monitoreo o falsos positivos | 4 | 2 | **8** | <span style="color:goldenrod">**MEDIO**</span> |

---

## 5. Plan Director de Seguridad (PDS) de 12 Meses
Planificación temporal para mitigar riesgos e implementar mejoras de seguridad continuas:

*   **Q1 (Meses 1-3): Hardening de Acceso y Gestión de Identidades (MFA)**
    *   Despliegue global de MFA (TOTP) en Supabase para todos los portales.
    *   Políticas estrictas de complejidad de contraseñas y auditoría de credenciales.
    *   Hardening perimetral con políticas deny-by-default en UFW.
*   **Q2 (Meses 4-6): Monitorización Activa y Detección en Tiempo Real**
    *   Centralización e ingesta de logs en Wazuh Server.
    *   Configuración de reglas de alerta personalizadas (inyección web, SSH).
    *   Escaneos automatizados de código SAST (Semgrep) e integración DAST (OWASP ZAP).
*   **Q3 (Meses 7-9): Orquestación y Automatización ante Incidentes (SOAR)**
    *   Integración del motor SOAR (Shuffle) con alertas de Wazuh.
    *   Despliegue de playbooks para bloqueo automatizado de IPs a nivel de Nginx.
    *   Ejecución del simulacro anual de Plan de Respuesta a Incidentes (PRI).
*   **Q4 (Meses 10-12): Auditoría de Control y Concienciación frente a Ingeniería Social**
    *   Ejecución de simulaciones de phishing controlado usando Gophish.
    *   Auditoría de penetración externa de la infraestructura.
    *   Actualización anual del PDS y KPIs.

---

## 6. Métricas e Indicadores de Éxito (KPIs)
*   **Tasa de Adopción de MFA y Hardening:** Objetivo del 100% de usuarios activos validados con MFA y 0 cuentas con contraseñas débiles.
*   **Tiempo Medio de Mitigación (MTTR):** Reducción de la respuesta de bloqueo a menos de 15 minutos utilizando la automatización de playbooks SOAR.
