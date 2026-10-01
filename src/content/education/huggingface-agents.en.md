---
locale: en
order: 2
title: Agents and LLMs
institution: Hugging Face
kind: certification
period: December 2025
start: 2025-12
end: 2025-12
summary: Training on building AI agents, retrieval-augmented pipelines and model orchestration with LangGraph.
highlights:
  - "Agent development with tools, memory and flow control, including when it makes sense for the model to decide and when it does not."
  - "RAG pipelines, with the part that almost never gets covered: evaluating whether retrieval is bringing back what needs to be brought back."
  - "Orchestrating several models within a single flow, which is where the failures you cannot see in a one-step demo show up."
---

## What it was useful for

Not for learning to call an API, because that takes an afternoon. For understanding **where you should not let the model decide**.

The idea I took away and apply in everything I build afterwards: a useful agent is one with typed tools, a clear contract about what it can write, and a call budget. Everything else is a demo that impresses on video and breaks with the first real user.

That is exactly what I applied in the construction visit minutes project: the model proposes a plan, the system validates it, and only a deterministic core writes. The certification did not give me that architecture; it gave me the vocabulary to explain it and the desire to look inside the tools instead of using them blindly.

## Context

It is a platform certification, not a degree. I put it in its place: what is genuinely verifiable is the code I write, and there you have the minutes project, the inference gateway and the telemetry detector.
