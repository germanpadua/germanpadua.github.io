---
locale: en
slug: inference-obs
title: inference-obs
summary: A self-hosted, observable LLM inference gateway. One operator serves several projects with virtual keys, per-project budget and every call traced down to the project and the end user who made it.
role: Design, implementation and operation
period: August - October 2026
year: 2026
order: 9
status: shipped
visibility: case-study
confidentiality: Private repository. The traces contain full prompts and responses, so the operation is deliberately closed.
domains:
  - LLMOps
  - observability
  - platform
  - security
stack:
  - Python
  - LiteLLM
  - PostgreSQL 16
  - Arize Phoenix
  - OpenTelemetry
  - Docker Compose
  - supervisord
  - GitHub Actions
metrics:
  - value: 13 + 10
    label: Unit and Docker integration test suites
    basis: artifact
    source: scripts/**/test_*.py y test-*-local.sh
  - value: 3.75 / 4 GiB
    label: Memory envelope of the two services together
    basis: artifact
    source: docs/superpowers/plans/2026-09-04-core-runtime-memory.md
  - value: 200
    label: Response code of an inference with the tracing service down
    basis: artifact
    source: docs/design.md §9, docs/runbook.md:554
  - value: 0
    label: Committed evaluation scores
    basis: artifact
    source: the results live in Phoenix, not in the repository
highlights:
  - "The degradation is tested, not assumed: with Phoenix down a request still returns 200, the trace from that window is lost and is not re-exported. It is a Docker integration test, not an intention."
  - "One project, one virtual key: the keys carry metadata that routes every trace to its project in Phoenix, so attribution does not depend on the client identifying itself correctly."
  - Four static analysis suites in continuous integration —secrets, shell, Dockerfile and dependencies— plus a dependency lock with hashes, because a gateway with access to every model is an interesting target.
  - The evaluation report separates model failures, judge failures and missing judgements, instead of throwing them all into one average.
limits:
  - "There are no committed evaluation scores: the results live in Phoenix and not in the repository, so I cannot publish any."
  - Deployment on a generic VPS is not supported in this version; it is built for a specific application platform with public HTTPS.
  - The spend is synthetic accounting, not the provider's real billing. It serves to attribute cost per project, not to reconcile an invoice.
  - The trace database is single-user. With several simultaneous operators it does not hold up.
  - The system key can read the traces of every project. It is a real security concession I accepted so that an operator can debug, and it is documented as such.
  - The traces store full prompts and responses, so the manual requires pseudonymous identifiers. It is a dependency on human discipline, not on design.
---

## The problem

When several of your own projects start calling models, three problems appear at once: you do not know how much each one spends, you do not know why a response came out wrong, and every project ends up with its own key and its own mess.

inference-obs solves that with a single entry point: an OpenAI-compatible proxy that enforces a per-project budget, and a trace server that stores every call with its attribution.

## Two applications, one operation

The core is LiteLLM with PostgreSQL in a container under supervisord, and it serves chat and transcription. The observability is Arize Phoenix, which receives traces over the open protocol and also hosts the datasets and the evaluation experiments.

It lives in an environment with 4 GiB of memory, so the envelope is not an optimisation detail: it is a requirement. The deployment plan allocates the core and the observability within that budget, with an explicit memory limit for the main container, and the check is written down.

## What matters most to me about this project

**That observability can go down without taking inference with it.** That is the central architecture decision: the core sends traces over public HTTPS, so if Phoenix does not respond, the trace is lost and the call goes on. It is verified with a test that brings up both services, kills the tracing one and checks that inference still returns 200.

The opposite —losing traces taking the service down— is a priority mistake that gets made by default when observability is treated as part of the critical path.

**And that the evaluation tells the truth about itself.** The model comparator reports separately the failures of the task, those of the automatic judge, and the judgements that could not be issued. A single average would have hidden exactly what needed to be known.
