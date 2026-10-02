---
locale: es
slug: dashboard-agricultura
title: Agricultura vista desde los datos
summary: Mi TFM reúne imágenes de satélite, meteorología y observaciones de campo para entender la evolución de un olivar y explorar posibles
  anomalías.
role: Autor del TFM completo
period: enero - septiembre 2025
year: 2025
order: 2
status: shipped
visibility: case-study
featured: true
confidentiality: Repositorio en privado mientras limpio datos de campo de un tercero. La memoria del TFM es pública.
domains:
- teledetección
- datos geoespaciales
- ciencia de datos aplicada
- visualización
stack:
- Python
- Dash
- dash-leaflet
- geopandas
- rasterio
- scikit-image
- Sentinel-2
- AEMET
- Docker
images:
- file: agricultura-concept
  alt: 'Vista ilustrativa del observatorio del olivar: mapa de vegetación y evolución del cultivo.'
  caption: Vista ilustrativa basada en el proyecto; no representa un resultado experimental.
metrics: []
highlights:
- '"El dashboard traduce índices espectrales a lenguaje de agricultor: no enseña el NDVI crudo, enseña si la parcela va peor o mejor que los últimos
  años y en qué zona concreta."'
- 'Cruza cuatro fuentes que no hablan entre ellas: imágenes de satélite, previsión meteorológica, una estación de campo y observaciones del propio
  agricultor enviadas desde el móvil.'
- Las anomalías se detectan comparando cada fecha contra el histórico de la misma parcela, no contra un umbral absoluto, porque el valor normal
  depende del suelo y del año.
- Empaquetado con Docker y Compose para que el despliegue no dependa de la máquina de nadie.
- Incluye un bot de Telegram como vía de entrada de fotos de campo, con el que se documentaron detecciones desde el móvil.
limits:
- '"No tengo un número de precisión que publicar: el trabajo mide tendencia y anomalía relativa por parcela, no clasificación contra una verdad
  de campo anotada. Presentar una exactitud sería inventarla."'
- El bot de Telegram recibió fotografías de una explotación real y quedó fuera de la versión publicable; el repositorio está en privado mientras
  se limpia.
- Las credenciales que aparecían commiteadas están rotadas y el repositorio pasó a privado el 1 de octubre de 2026.
- El análisis depende de la disponibilidad de imágenes sin nubes, así que hay meses sin datos útiles y no monté una estrategia de interpolación
  seria.
- '"Las tres parcelas son de un único cultivo y una única comarca: no hay validación en otras condiciones."'
---

## El problema

La evolución de un olivar se entiende mejor al combinar lo que se observa en el campo con imágenes de satélite y datos meteorológicos. Mi TFM reúne esas fuentes en una interfaz de análisis.

## Qué construí

Desarrollé un dashboard con Python, Dash y Plotly. Integra imágenes Sentinel-2, índices de vegetación, previsiones de AEMET y observaciones enviadas mediante un bot de Telegram. Permite explorar el estado de la parcela, consultar series temporales y comparar su evolución con años anteriores.

## Del dato a la interpretación

El trabajo incluye adquisición y preparación de datos, caché para reducir consultas, visualizaciones y análisis de posibles anomalías. Una señal inusual ayuda a decidir qué revisar; su interpretación necesita el contexto agronómico de la parcela.

La vista ilustrativa de esta ficha resume la idea del dashboard. Sus curvas no son resultados experimentales.
