---
locale: es
slug: dashboard-agricultura
title: Dashboard de Agricultura Inteligente
summary: "Trabajo de Fin de Máster. Dashboard que cruza imágenes Sentinel-2 con datos meteorológicos de AEMET para monitorizar olivares: índices de vegetación, series temporales y detección de anomalías contra años anteriores."
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
metrics:
  - value: 10 m/píxel
    label: Resolución del análisis satelital
    basis: artifact
    source: README.md
  - value: 3 + 1
    label: Índices de vegetación para olivar (NDVI, OSAVI, NDRE)
    basis: artifact
    source: dashboard/src/utils/satellite_utils.py
  - value: 3
    label: Fincas con polígono y análisis temporal propio
    basis: artifact
    source: dashboard/data/fincas.json
highlights:
  - "\"El dashboard traduce índices espectrales a lenguaje de agricultor: no enseña el NDVI crudo, enseña si la parcela va peor o mejor que los últimos años y en qué zona concreta.\""
  - "Cruza cuatro fuentes que no hablan entre ellas: imágenes de satélite, previsión meteorológica, una estación de campo y observaciones del propio agricultor enviadas desde el móvil."
  - Las anomalías se detectan comparando cada fecha contra el histórico de la misma parcela, no contra un umbral absoluto, porque el valor normal depende del suelo y del año.
  - Empaquetado con Docker y Compose para que el despliegue no dependa de la máquina de nadie.
  - Incluye un bot de Telegram como vía de entrada de fotos de campo, con el que se documentaron detecciones desde el móvil.
limits:
  - "\"No tengo un número de precisión que publicar: el trabajo mide tendencia y anomalía relativa por parcela, no clasificación contra una verdad de campo anotada. Presentar una exactitud sería inventarla.\""
  - El bot de Telegram recibió fotografías de una explotación real y quedó fuera de la versión publicable; el repositorio está en privado mientras se limpia.
  - Las credenciales que aparecían commiteadas están rotadas y el repositorio pasó a privado el 1 de octubre de 2026.
  - El análisis depende de la disponibilidad de imágenes sin nubes, así que hay meses sin datos útiles y no monté una estrategia de interpolación seria.
  - "\"Las tres parcelas son de un único cultivo y una única comarca: no hay validación en otras condiciones.\""
---

## El problema

Un agricultor sabe cuándo su olivar va mal, pero suele saberlo tarde y sin saber dónde. La teledetección permite verlo antes, pero cruda es inútil para él: los índices espectrales no significan nada fuera de un laboratorio.

El trabajo de fin de máster consistía en cerrar esa distancia.

## Qué hace

El dashboard combina cuatro fuentes. De Sentinel-2 saca imágenes a 10 metros por píxel y calcula índices de vegetación ajustados a olivar: NDVI, OSAVI y NDRE. De AEMET recoge la previsión meteorológica, que es lo que permite distinguir el estrés hídrico de una plaga. Y del campo entran dos cosas: una estación meteorológica con humedad, temperatura, radiación solar, viento y lluvia, y las observaciones que el propio agricultor manda por el móvil cuando ve algo raro.

Esa última fuente es la que menos parece de ciencia de datos y la que más cambió el sistema. Un índice espectral dice que hay un problema; una foto con una nota dice cuál.
Con eso construye series temporales por parcela y detecta anomalías **contra el propio histórico de esa parcela**, no contra un umbral fijo. Es la decisión que más cambia el resultado: el valor normal de una parcela depende del suelo, de la orientación y del año, así que un umbral absoluto produce falsas alarmas constantes.
La interfaz se organiza alrededor de una pregunta: ¿está esta zona peor que otros años, y desde cuándo?

## Las decisiones que cargaron peso

**Traducir, no mostrar.** Cada índice llega a pantalla con su interpretación agronómica. La métrica sigue siendo verificable, pero el texto que la acompaña está escrito para quien toma la decisión.

**Comparar consigo mismo.** Sin la comparación histórica el sistema sería un visor bonito con alarmas inútiles.

**Una parcela es un polígono, no un punto.** Todo el análisis trabaja sobre la geometría real de la finca, lo que obliga a recortar los rásteres por polígono y a tratar con las proyecciones. Es la parte aburrida y es la que hace que los números signifiquen algo.

## Lo que no haría igual

Las imágenes con nubes dejan huecos que rompen las series, y no monté una estrategia de interpolación seria. Y el bot de Telegram, que parecía un añadido simpático, acabó siendo el vector por el que entraron datos de campo de un tercero al repositorio. Un proyecto académico que usa datos reales de una explotación necesita una política de datos desde el primer día, no un `.gitignore` escrito después.
