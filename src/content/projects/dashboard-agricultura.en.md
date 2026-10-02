---
locale: en
slug: dashboard-agricultura
title: Smart Agriculture Dashboard
summary: My master’s thesis brings satellite imagery, weather and field observations together to understand an olive grove and explore potential
  anomalies.
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
  caption: Illustrative view based on the project; not an experimental result.
metrics: []
highlights:
- 'The dashboard translates spectral indices into farmer''s language: it does not show raw NDVI, it shows whether the plot is doing worse or better
  than in previous years and in which specific area.'
- 'It crosses four sources that do not talk to each other: satellite imagery, weather forecasts, a field station and observations from the farmer
  himself, sent from his phone.'
- Anomalies are detected by comparing each date against the history of the same plot, not against an absolute threshold, because the normal value
  depends on the soil and the year.
- Packaged with Docker and Compose so that deployment does not depend on anyone's machine.
- Includes a Telegram bot as an intake channel for field photos, which was used to document detections from a phone.
limits:
- 'I have no accuracy figure to publish: the work measures trend and relative anomaly per plot, not classification against an annotated ground
  truth. Presenting an accuracy score would be inventing it.'
- The Telegram bot received photographs from a real farm and was left out of the publishable version; the repository is private while it is cleaned
  up.
- The credentials that had been committed were rotated and the repository went private on 1 October 2026.
- The analysis depends on the availability of cloud-free images, so there are months without useful data and I did not build a serious interpolation
  strategy.
- 'The three plots are a single crop in a single region: there is no validation under other conditions.'
---

## The problem

Understanding an olive grove benefits from combining field observations, satellite imagery and weather. My master’s thesis brings those sources into an analytical interface.

## What I built

A Python dashboard using Dash and Plotly, integrating Sentinel-2 imagery, vegetation indices, AEMET forecasts and observations sent through a Telegram bot. Users can explore the plot, inspect time series and compare evolution with previous years.

## From data to interpretation

The project covers data acquisition and preparation, caching, visualisation and potential anomaly analysis. Unusual signals help guide inspection; interpretation requires the plot’s agronomic context.

The illustrative view summarises the dashboard’s purpose. Its curves are not experimental results.
