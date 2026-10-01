---
locale: en
slug: actas-visitas-obras
title: Site Visit Minutes
summary: A Telegram bot where the site technician dictates and photographs what he has seen, and the system hands back a Word draft of the minutes that he edits and signs. It measures how much of the draft survives his editing.
role: Complete design and implementation
period: September 2026
year: 2026
order: 7
status: shipped
visibility: case-study
featured: true
confidentiality: Private repository. It contains minutes and photographs from a real construction site and client.
domains:
  - LLMs in production
  - agent orchestration
  - documents
  - process automation
stack:
  - Python 3.12
  - python-telegram-bot
  - Flask
  - python-docx
  - Pydantic
  - Whisper
  - Docker
  - Caddy
  - LiteLLM
metrics:
  - value: 452
    label: Tests green in the commit log
    basis: artifact
    source: the project's commit history
  - value: ≥ 80 %
    label: Draft → final minutes retention target
    basis: target
    source: docs/GATE.md
  - value: 10-20 s
    label: Generation latency per note
    basis: unverified
    source: project notes, not measured
  - value: 13
    label: Architecture decisions recorded as ADRs
    basis: artifact
    source: docs/adr/0001…0013
  - value: 38
    label: Test files
    basis: artifact
    source: tests/
highlights:
  - The capture core is deterministic and only a closed set of typed tools writes to it. Corrections preserve history instead of overwriting.
  - The LLM returns a JSON plan that is validated before being executed, and it never has direct write permission. If the plan fails validation, the system degrades to rules.
  - Every note has a budget of model calls, so an unusual conversation does not turn into a surprise bill.
  - The pilot's quality metric is not "is the text pretty?", but how much of the draft survives the technician's editing. That is the one that matters and the one the client notices.
  - The Word templates are two-layered to survive how Word splits replacement tags internally, a problem that only shows up once you are already in production.
limits:
  - The 80 % retention target is an **acceptance criterion**, not a measurement. The script that evaluates it writes the report to a temporary directory that is not committed, so I cannot publish a result. I state the target and I say it is a target.
  - File-based JSON storage works for the pilot and for nothing else.
  - Every set of minutes is generated from scratch, without carrying over the previous one, so the system does not learn the technician's style between visits.
  - Between 10 and 20 seconds per note is slow for someone standing on a construction site.
  - It depends on an inference gateway with several models, some of them paid.
  - "The repository stays private: it contains real minutes from a named company client, from the site, and field photographs. It is not published nor described in detail."
---

## The problem

A technician visits a construction site, looks around, takes photos and dictates voice notes. Later, at the office, he has to write up minutes in Word. The real work is not the visit: it is the second part.

The system's goal is to remove that second part without removing his control over the document. And the way to measure it is not to ask him whether he likes it, but to see **how much of what the system wrote survives when he edits it**. If he rewrites 80 % of every draft, the system was useless.

## The architecture I chose, and why

The temptation with LLMs is to let the model do the work. Here the rule is the opposite: the model **proposes**, the system **validates** and only a deterministic core **writes**.

The flow is as follows. A note arrives —text, photo or audio— and is classified. For each note type there is a rule graph that decides which typed tools need to run. When interpretation is needed, the model returns a JSON plan with the calls to those tools; the plan is validated against a schema and, if it fails, it is discarded and the system falls back to rules. The document conversion is done by `python-docx` over a template, not by the model.

That means a wrong model can produce a worse draft, but it can never write to the record. And since every note has its own call budget, an edge case degrades quality instead of multiplying cost.

## What I learned

That in a document system the hard problem is not the model, it is the format. Word templates give you far less control than they seem to: Word splits replacement tags internally and naive substitution corrupts the layout. The two-layer solution came out of that, and it is the kind of detail that does not appear until a real user opens the file.

And that the right metric is almost never the comfortable one. Retention is uncomfortable because it can come back at 40 % and ruin your week, and that is precisely why it is the one that has to be measured.

## The mistake I would not repeat

This project also taught me what my master's thesis had already taught me: a project that touches a client's data needs a data policy before the first line of code. Here the real minutes ended up in the repository history, and even though the repository is private, that is a problem that has to be cleaned up. A `.gitignore` written at the end does not fix a decision that had to be made at the beginning.
