---
locale: en
slug: dashboard-agricultura
title: "Smart Agriculture Dashboard"
summary: "Master's thesis. A dashboard that crosses Sentinel-2 imagery with AEMET weather data to monitor olive groves: vegetation indices, time series and anomaly detection against previous years."
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
  - file: agricultura-satelite
    alt: "Satellite view of an olive parcel with the NDVI vegetation index overlaid and the analysis configuration panels."
  - file: agricultura-historico
    alt: "Historical weather analysis: precipitation, humidity and temperature series with the repilo risk thresholds marked."
metrics:
  - value: 10 m/pixel
    label: Resolution of the satellite analysis
    basis: artifact
    source: README.md
  - value: 3 + 1
    label: Vegetation indices for olive trees (NDVI, OSAVI, NDRE)
    basis: artifact
    source: dashboard/src/utils/satellite_utils.py
  - value: 3
    label: Farms with their own polygon and time-series analysis
    basis: artifact
    source: dashboard/data/fincas.json
highlights:
  - "The dashboard translates spectral indices into farmer's language: it does not show raw NDVI, it shows whether the plot is doing worse or better than in previous years and in which specific area."
  - "It crosses four sources that do not talk to each other: satellite imagery, weather forecasts, a field station and observations from the farmer himself, sent from his phone."
  - Anomalies are detected by comparing each date against the history of the same plot, not against an absolute threshold, because the normal value depends on the soil and the year.
  - Packaged with Docker and Compose so that deployment does not depend on anyone's machine.
  - Includes a Telegram bot as an intake channel for field photos, which was used to document detections from a phone.
limits:
  - "I have no accuracy figure to publish: the work measures trend and relative anomaly per plot, not classification against an annotated ground truth. Presenting an accuracy score would be inventing it."
  - The Telegram bot received photographs from a real farm and was left out of the publishable version; the repository is private while it is cleaned up.
  - The credentials that had been committed were rotated and the repository went private on 1 October 2026.
  - The analysis depends on the availability of cloud-free images, so there are months without useful data and I did not build a serious interpolation strategy.
  - "The three plots are a single crop in a single region: there is no validation under other conditions."
---

## The problem

A farmer knows when his olive grove is doing badly, but he usually finds out late and without knowing where. Remote sensing makes it possible to see it earlier, but raw it is useless to him: spectral indices mean nothing outside a laboratory.

The master's thesis was about closing that distance.

## What it does

The dashboard combines four sources. From Sentinel-2 it takes 10-metre-per-pixel imagery and computes vegetation indices tuned for olive trees: NDVI, OSAVI and NDRE. From AEMET it pulls the weather forecast, which is what makes it possible to tell water stress apart from a pest. And from the field two things come in: a weather station with humidity, temperature, solar radiation, wind and rain, and the observations the farmer himself sends from his phone when he sees something odd.

That last source is the one that looks least like data science and the one that changed the system the most. A spectral index says there is a problem; a photo with a note says which one.
With that it builds per-plot time series and detects anomalies **against the plot's own history**, not against a fixed threshold. It is the decision that changes the result the most: the normal value of a plot depends on the soil, the orientation and the year, so an absolute threshold produces constant false alarms.
The interface is organised around one question: is this area doing worse than in other years, and since when?

## The decisions that carried the most weight

**Translate, don't display.** Every index reaches the screen with its agronomic interpretation. The metric is still verifiable, but the text that accompanies it is written for the person making the decision.

**Compare against itself.** Without the historical comparison the system would be a pretty viewer with useless alarms.

**A plot is a polygon, not a point.** The whole analysis works on the real geometry of the farm, which forces clipping the rasters per polygon and dealing with projections. It is the boring part and it is what makes the numbers mean something.

## What I would not do the same way

Cloudy images leave gaps that break the time series, and I did not build a serious interpolation strategy. And the Telegram bot, which seemed like a friendly addition, ended up being the vector through which third-party field data entered the repository. An academic project using real data from a working farm needs a data policy from day one, not a `.gitignore` written afterwards.
