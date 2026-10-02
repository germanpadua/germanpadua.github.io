---
locale: es
slug: telemetry-sentinel
title: Telemetry Sentinel
summary: 'Detección de pérdidas de velocidad en Fórmula 1: cruza telemetría y contexto de carrera para distinguir un problema del coche de una
  parada en boxes.'
role: Diseño, implementación y evaluación
period: septiembre - octubre 2026
year: 2026
order: 1
status: research
visibility: case-study
featured: true
confidentiality: Código privado; presentación y explorador de resultados públicos.
domains:
- detección de anomalías
- series temporales
- procesamiento de flujos
- ingeniería de datos
stack:
- Python 3.12
- FastF1
- PyArrow / Parquet
- scikit-learn
- MLflow
- pytest
- Docker
- React + Vite
metrics: []
highlights:
- Referencia robusta basada en las vueltas anteriores de cada coche.
- Supresión contextual de boxes, banderas y coches de seguridad.
- Reproducción causal y evidencia asociada a cada alerta.
limits:
- Pocos episodios reales etiquetados; las tasas deben interpretarse junto con sus recuentos.
- El sitio reproduce ejecuciones guardadas; no es un servicio de alertas conectado en directo.
links:
  demo: https://telemetry-sentinel.vercel.app/
---

## El problema

Una pérdida de velocidad puede indicar una avería, una parada en boxes o una bandera amarilla. Construí un detector que compara cada coche con sus vueltas recientes e incorpora el contexto para filtrar situaciones esperadas.

## Cómo funciona

Procesa los eventos en el orden en que se publicaron. Para cada tramo de pista calcula una referencia robusta con las vueltas limpias anteriores. Si el déficit persiste y el contexto no lo explica, genera una alerta con una instantánea de la evidencia. Las pruebas comprueban que cambiar el futuro no modifica las decisiones anteriores.

## Qué construí

La preparación de datos, el detector, las reglas de contexto, la evaluación y una interfaz para reproducir carreras y revisar alertas. Los experimentos comparan una referencia robusta con un modelo de cuantiles; la configuración se congela antes de evaluar las carreras reservadas.

## Lo que muestran los experimentos

El informe actual incluye Monza, Japón y Singapur como carreras de test, además de España para validación y Baréin para desarrollo. El número de episodios reales es pequeño y existen falsas alertas en Singapur: los resultados son evidencia inicial, con limitaciones explícitas. La presentación pública permite explorar las ejecuciones y consultar su procedencia.
