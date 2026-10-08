---
locale: en
slug: telemetry-sentinel
title: Telemetry Sentinel
summary: 'Detecting speed losses in Formula 1. Combines telemetry and race context to distinguish a car problem from a pit stop or yellow flags.'
role: Design, implementation and evaluation
period: September - October 2026
year: 2026
order: 1
status: research
visibility: case-study
featured: true
confidentiality: Private code; public presentation and results explorer.
domains:
- anomaly detection
- time series
- stream processing
- data engineering
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
- Robust reference based on each car’s previous laps.
- Contextual suppression for pits, flags and safety cars.
- Causal replay and evidence attached to every alert.
limits:
- Few real labelled episodes.
- The site replays saved runs, it is not a live alerting service.
links:
  demo: https://telemetry-sentinel.vercel.app/
---

## The problem

A speed loss can mean a mechanical problem, a pit stop or a yellow flag. I built a detector that compares each car with its recent laps and uses race context to filter expected slowdowns.

## How it works

Events are processed in their publication order. A robust reference is computed from previous clean laps for each part of the circuit. A persistent unexplained deficit produces an alert and an evidence snapshot.

## What I built

Data preparation, detection, context rules, evaluation and a race replay interface. Experiments compare a robust reference with a quantile model.

## Experimental evidence

The current report includes Monza, Japan and Singapore as test races, Spain for validation and Bahrain for development. Real episodes are scarce and Singapore contains false alerts. The public website lets readers explore saved runs and their provenance.
