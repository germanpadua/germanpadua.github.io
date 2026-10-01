---
locale: es
order: 0
title: Científico de datos, riesgo de crédito
organisation: Grupo Cajamar
location: Almería
employment: full-time
period: febrero 2025 — hoy
start: 2025-02
end: present
regulated: true
accent: accent
summary: Dentro del equipo de parámetros de provisiones bajo el marco IFRS 9, soy responsable de la calibración, la monitorización y la proyección del parámetro LGD, la severidad de la pérdida en caso de impago.
responsibilities:
  - "Extracción, transformación y depuración de volúmenes grandes de datos, con el tratamiento de valores atípicos que exige el marco regulatorio."
  - "Análisis de flujos de recuperación y cálculo del parámetro LGD por segmento de cartera."
  - "Desarrollo y calibración de modelos de proyección, con análisis de sensibilidad y seguimiento del desempeño."
  - "Evaluación del impacto en provisiones y elaboración de la documentación técnica conforme a los estándares de auditoría y gobernanza."
  - "Garantía de trazabilidad, reproducibilidad y cumplimiento normativo en todo el ciclo del modelo."
stack:
  - R
  - SQL
  - Excel
---

## Qué hago exactamente

El equipo calcula cuánto espera perder el banco si un cliente no paga. Eso se llama LGD, y es uno de los tres parámetros que alimentan las provisiones bajo IFRS 9. Mi trabajo es que ese número sea defendible.

El ciclo completo: sacar el dato, limpiarlo, identificar recuperaciones anómalas, segmentar por perfil de riesgo, calibrar el modelo, proyectarlo hacia delante, medir cuánto mueve las provisiones y escribir la documentación que un auditor externo va a revisar.

## Por qué este trabajo me cambió la forma de trabajar

En un proyecto de datos normal, la métrica final es la calidad del modelo. Aquí la métrica final es **si un auditor independiente, seis meses después, puede recorrer el camino desde el dato bruto hasta el número publicado y no encontrar un salto injustificado**.

Eso cambia el orden de todo. La documentación se escribe mientras se trabaja, no al final. Los supuestos se declaran antes de ver el resultado. Y una mejora que no se puede explicar vale menos que una mejora pequeña que sí.

Cuando después construí el detector de telemetría de Fórmula 1, congelé la configuración antes del test ciego y publiqué las métricas con su fichero de procedencia. No fue casualidad: es la misma disciplina, aplicada a un problema que no tiene auditor.

## Herramientas

R y SQL hacen casi todo el trabajo. Excel sigue siendo el idioma común con quien no programa, y he aprendido que discutir eso es perder el tiempo: mejor exportar bien.
