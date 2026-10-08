---
locale: en
slug: dashboard-agricultura
title: Smart Agriculture Dashboard
summary: My master’s thesis brings satellite imagery, weather and field observations together to understand the evolution of an olive grove and provide early warnings of disease.
role: Author of the entire master's thesis
period: January - September 2025
year: 2025
order: 2
status: shipped
visibility: case-study
featured: true
confidentiality: Repository kept private while I clean third-party field data. The master's thesis report is public.
domains:
- remote sensing
- geospatial data
- applied data science
- visualization
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
  alt: 'Illustrative olive grove observatory: vegetation map and crop evolution.'
  caption: Illustrative view based on the project.
metrics: []
highlights:
- 'The dashboard translates spectral indices into farmer''s language. It does not show raw NDVI, it shows whether the plot is doing worse or better
  than in previous years and in which specific area.'
- 'It crosses four sources that do not talk to each other: satellite imagery, weather forecasts, a field station and observations from the farmer
  himself, sent from his phone.'
- Anomalies are detected by comparing each date against the history of the same plot and against documented theoretical thresholds for the disease.
- Packaged with Docker and Compose so that deployment does not depend on anyone's machine.
- Includes a Telegram bot as an intake channel for field photos, which was used to document detections from a phone.
limits:
- The work measures trends and relative anomalies per plot, not classification against annotated ground truth.
- The analysis depends on the availability of cloud-free images, so there may be periods without useful data.
---

## The problem

Olive leaf spot is a widespread disease affecting olive groves. It causes leaves to fall and affects the quality of the harvested fruit. Although detection is not complex, infection can remain latent for a long time. The dashboard is designed to monitor the crop and alert when conditions are favourable for the disease to develop.

## What I built

A Python dashboard using Dash and Plotly, integrating Sentinel-2 imagery, vegetation indices, AEMET forecasts and observations sent through a Telegram bot. Users can explore the plot, inspect time series and compare evolution with previous periods.

## From data to interpretation

The project covers data acquisition and preparation, caching, visualisation and potential anomaly analysis. Unusual signals help guide inspection.

The image in this case study summarises the dashboard’s purpose. Its curves are illustrative results.
