---
locale: es
slug: dashboard-agricultura
title: Agricultura vista desde los datos
summary: Mi TFM reúne imágenes de satélite, meteorología y observaciones de campo para entender la evolución de un olivar y alertar de forma temprana la aparición de una enfermedad.
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
  caption: Vista ilustrativa basada en el proyecto.
metrics: []
highlights:
- '"El dashboard traduce índices espectrales a lenguaje de agricultor. No enseña el NDVI crudo, enseña si la parcela va peor o mejor que los últimos años y en qué zona concreta."'
- 'Cruza cuatro fuentes que no hablan entre ellas: imágenes de satélite, previsión meteorológica, una estación de campo y observaciones del propio agricultor enviadas desde el móvil.'
- Las anomalías se detectan comparando cada fecha contra el histórico de la misma parcela, y contra los umbrales teóricos documentados de la enfermedad.
- Empaquetado con Docker y Compose para que el despliegue no dependa de la máquina de nadie.
- Incluye un bot de Telegram como vía de entrada de fotos de campo, con el que se documentaron detecciones desde el móvil.
limits:
- El trabajo mide tendencia y anomalía relativa por parcela, no clasificación contra una verdad de campo anotada.
- El análisis depende de la disponibilidad de imágenes sin nubes, así que puede haber periodos sin datos útiles.
---

## El problema

El repilo es una enfermedad muy extendida que afecta al cultivo de olivar. Esta enfermedad causa la caída de las hojas y afecta a la calidad del fruto recogido. Aunque la detección no es compleja, la infección puede permanecer latente durante mucho tiempo. Por esta razón se diseña un dashboard para realizar un seguimiento del cultivo y alertar cuando se dan las condiciones idóneas para el desarrollo del repilo.

## Qué construí

Desarrollé un dashboard con Python, Dash y Plotly. Integra imágenes Sentinel-2, índices de vegetación, previsiones de AEMET y observaciones enviadas mediante un bot de Telegram. Permite explorar el estado de la parcela, consultar series temporales y comparar su evolución con periodos anteriores.

## Del dato a la interpretación

El trabajo incluye adquisición y preparación de datos, caché para reducir consultas, visualizaciones y análisis de posibles anomalías. Una señal inusual ayuda a decidir qué revisar.

La imagen de esta ficha resume la idea del dashboard. Sus curvas son resultados ilustrativos.
