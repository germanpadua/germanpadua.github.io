---
locale: en
order: 3
title: Machine Learning Engineer Track
institution: DataCamp
kind: certification
period: December 2024 — January 2025
start: 2024-12
end: 2025-01
summary: Specialisation in the full life cycle of a model in production, from data versioning to monitoring of the deployed service.
highlights:
  - "Data and model versioning with DVC and MLflow, which is what lets you know later what the running thing was trained with."
  - "Packaging and deployment with Docker, and continuous integration pipelines applied to models rather than to applications."
  - "Monitoring models in production: not just whether the service responds, but whether the distribution of incoming data still resembles the one used for training."
---

### Why I did it

Because I knew how to train models and did not know how to maintain them.

A model in a notebook is an experiment. A model in production is a service with dependencies, versions, a record of what data it was trained with, and an alert for when the world changes and the predictions stop making sense.

That leap — from experiment to service — is what this specialisation covers and what later let me design things like the inference gateway with traces, or require that every number published in a project points to a concrete run.

### What I put into practice

The idea of **provenance**. A result without its originating run is not a result, it is an anecdote. In my projects that translates into committed metric files and manifests with hashes: the configuration of a frozen experiment can be verified months later.

And the distinction between monitoring the infrastructure and monitoring the model. The service responding in 40 milliseconds says nothing about whether the predictions are still valid.
