---
locale: en
order: 4
title: Data Engineering on Google Cloud
institution: Fundación AI Granada Research & Innovation
kind: certification
period: September 2023 — January 2024
start: 2023-09
end: 2024-01
summary: Design of data pipelines and scalable architectures on managed Google Cloud services, in parallel with the final year of the double degree.
highlights:
  - "Building ingestion, transformation and load pipelines on managed services, including orchestration and error handling."
  - "Analytical storage modelling: when a partitioned table is the right call, when a star schema is, and when neither of the two is."
  - "Cost as a design constraint, which is something academic environments do not teach and the cloud teaches fast."
---

## What I learned

Data engineering in the cloud is an exercise in constraints, and the one that changes decisions most is cost.

Locally, processing a terabyte is a matter of letting it run. In the cloud it is a bill, and that forces you to think about the data design before writing anything: how to partition, what to compress, what to materialise and what to recompute every time.

It is a lesson I carry into everything else. When I designed the inference gateway, the memory budget was four gigabytes for two services and that defined the architecture. When I designed the telemetry detector, the false-alarm budget defined the threshold.

## Where I applied it

In the data export pipeline of my master's thesis, which downloads, coregisters and processes satellite imagery and weather data incrementally instead of from scratch every time.

And, above all, in the way of thinking: every system has a budget that is not compute. It may be memory, latency, money or error tolerance. Knowing which one it is before designing is half the job.
