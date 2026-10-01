---
locale: en
slug: telemetry-sentinel
title: Telemetry Sentinel
summary: Causal detector of velocity drops in public Formula 1 telemetry. It only looks at the past, so its alerts can be defended live, and each one arrives with the evidence that justifies it.
role: Design, implementation and evaluation
period: September - October 2026
year: 2026
order: 1
status: shipped
visibility: case-study
featured: true
confidentiality: Private repository while I prepare the launch of the showcase site.
domains:
  - anomaly detection
  - time series
  - causal inference
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
metrics:
  - value: 1.00
    label: Recall on Monza 2023, blind
    basis: artifact
    source: reports/metrics/2023-monza-r-test-*.json
  - value: 0
    label: False alarms in 1.19 hours of car
    basis: artifact
    source: reports/report.md §4
  - value: 2.3 s
    label: Mean detection delay
    basis: artifact
    source: reports/report.md §4
  - value: 414/415
    label: Tests passing (1 skipped)
    basis: artifact
    source: openspec/changes/add-provenance-integrity/tasks.md
  - value: 0.00
    label: False alarms per hour in validation (Spain)
    basis: artifact
    source: reports/metrics/validation-2023-spain-r-tune-*.json
highlights:
  - "Causality is enforced by construction, not promised: prefix-invariance and future-perturbation tests, with a live witness for every stateful component."
  - The suppression rules were reviewed by looking at the validation false alarms and then frozen before the blind test, which is the right order and the one almost nobody follows.
  - Every published number points to a committed metrics file and to a specific MLflow run. An undefined metric is a label, never a zero.
  - "The detector suppresses what context already explains: pit entry, yellow flag, safety car and blue flag."
limits:
  - The blind test had a single true positive, and one positive is not a rate. The confidence interval is so wide that the 1.00 reads as "it did not fail on the only case there was".
  - "I do not publish the figure of 957 tests that appears in the project notes: it only exists in prose, with no artifact, and the committed counts say 414, 418 and 533 depending on the moment and the scope. A number I cannot point at does not go in."
  - "There is one measured defect that remains unfixed: 40 alerts after the chequered flag."
  - A single human annotator, with no inter-annotator agreement. The second pass was withdrawn.
  - The end of the race depends on a message that the public feed sometimes omits.
  - The showcase site replays precomputed runs and requires regenerating the export, which is not committed.
---

## The problem

In a race, a car that suddenly loses speed can have a puncture, a mechanical problem, or it may simply have pitted. The data is public and abundant, but the hard part is not detecting the drop: it is **discarding the ones that context already explains** without discarding the one that mattered.

## Why it only looks at the past

A detector that uses the full race window is easier to write and more accurate in the lab. And it is useless live, because on lap 20 it does not have lap 50.

Here causality is not a promise in the documentation: it is enforced by construction and verified with two families of tests. The prefix-invariance tests check that truncating the future does not change the result. The future-perturbation tests check that altering it does not either. Every stateful component has a live witness that fails if the guarantee is broken.

## How an anomaly is decided

The reference is not a fixed threshold but a robust model per 25 metres of track: the median of the car's five previous clean laps, with its median absolute deviation. The threshold is the maximum between an absolute value and four times that dispersion, so it adapts to the car and the lap without losing interpretability.

Competing against that model is a contextual one trained only with the median of the residual distribution, with no labels, because the human labels were far too few to train anything serious.

## The order that matters

The suppression rules were tuned **after** looking at the false alarms of the Spain validation, and frozen **before** the blind test at Monza. Tuning after the test would be cheating; tuning without looking at the validation would be negligence. The frozen configuration has a hash and an asset manifest.

At Monza the detector produced no false alarms in 1.19 hours of car and detected the only positive in 2.3 seconds. That does not prove the system is good: it proves it did not fail on one case. The report says it that plainly, and that is why I find the project more defensible than one with better metrics and worse explanations.
