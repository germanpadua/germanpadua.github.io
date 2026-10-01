---
locale: en
order: 0
title: Data Scientist, credit risk
organisation: Grupo Cajamar
location: Almería
employment: full-time
period: February 2025 — present
start: 2025-02
end: present
regulated: true
accent: accent
summary: "Within the provisions parameters team under the IFRS 9 framework, I am responsible for calibrating, monitoring and projecting the LGD parameter, the severity of loss in the event of default."
responsibilities:
  - "Extraction, transformation and cleansing of large volumes of data, with the outlier treatment required by the regulatory framework."
  - "Analysis of recovery flows and calculation of the LGD parameter by portfolio segment."
  - "Development and calibration of projection models under macroeconomic scenarios, with sensitivity analysis and performance tracking."
  - "Assessment of the impact on provisions and preparation of the technical documentation in line with audit and governance standards."
  - "I introduced automated quality checks and structured logging into the calibration flows, so that a problem could be diagnosed from the logs instead of being reproduced by hand."
  - "Communication with risk, validation and business areas, including the technical defence of the model before independent validators."
stack:
  - R
  - SQL
  - Excel
---

## What I actually do

The team calculates how much the bank expects to lose if a customer defaults. That is called LGD, and it is one of the three parameters that feed the provisions under IFRS 9. My job is to make that number defensible.

I joined the sector knowing nothing about banking regulation. In a relatively short time I became the lead technical owner of the parameter calibration flows: getting the data, cleaning it, identifying anomalous recoveries, segmenting by risk profile, calibrating the model, projecting it under macroeconomic scenarios, measuring how much it moves the provisions and writing the documentation an external auditor is going to review.

One of the things that has served me most in this job is not a model: I introduced automated quality checks and structured logging into the calibration flows. Before, when something did not add up, the process had to be reproduced by hand to figure out where it had gone wrong. Now you read it in the logs. In an environment where traceability is not optional, that changes the way the whole team works.

## Why this job changed the way I work

In a normal data project, the final metric is model quality. Here the final metric is **whether an independent auditor, six months later, can walk the path from the raw data to the published number and not find an unjustified jump**.

That changes the order of everything. The documentation is written while you work, not at the end. Assumptions are declared before seeing the result. And an improvement you cannot explain is worth less than a small improvement you can.

When I later built the Formula 1 telemetry detector, I froze the configuration before the blind test and published the metrics with their provenance file. It was no accident: it is the same discipline, applied to a problem that has no auditor.

## Tools

R and SQL do almost all the work. Excel remains the common language with people who do not code, and I have learned that arguing about that is a waste of time: better to export well.
