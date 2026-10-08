---
locale: es
order: 3
title: Machine Learning Engineer Track
institution: DataCamp
kind: certification
period: diciembre 2024 — enero 2025
start: 2024-12
end: 2025-01
summary: Especialización en el ciclo de vida completo de un modelo en producción, desde el versionado del dato hasta la monitorización del servicio desplegado.
highlights:
  - Versionado de datos y modelos con DVC y MLflow, que es lo que permite saber después con qué se entrenó lo que está corriendo.
  - Empaquetado y despliegue con Docker, y pipelines de integración continua aplicados a modelos en lugar de a aplicaciones.
  - Monitorización de modelos en producción.
---

### Por qué lo hice

Porque sabía entrenar modelos y no sabía mantenerlos.

Un modelo en un cuaderno es un experimento. Un modelo en producción es un servicio con dependencias, versiones, un registro de con qué datos se entrenó y una alerta para cuando el mundo cambia y las predicciones dejan de tener sentido.

Ese salto —de experimento a servicio— es el que cubre esta especialización y el que después me permitió diseñar cosas como la pasarela de inferencia con trazas, o exigir que cada número publicado en un proyecto apunte a una ejecución concreta.

### Qué me llevé a la práctica

La idea de **procedencia**. Un resultado sin su ejecución de origen no es un resultado, es una anécdota. En mis proyectos eso se traduce en ficheros de métricas commiteados y en manifiestos con hashes: la configuración de un experimento congelado se puede verificar meses después.

Y la distinción entre monitorizar la infraestructura y monitorizar el modelo. Que el servicio responda en 40 milisegundos no dice nada sobre si las predicciones siguen siendo válidas.
