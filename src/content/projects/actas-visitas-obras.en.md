---
locale: en
slug: actas-visitas-obras
title: Site Visit Minutes
summary: A bot turns voice notes and photographs from a site visit into an editable report draft, reviewed by the professional before use.
role: Complete design and implementation
period: September 2026
year: 2026
order: 7
status: in-progress
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
metrics: []
highlights:
- Voice notes and photograph capture through Telegram.
- Structured extraction and validation before document generation.
- Editable drafts and professional review.
limits:
- Pilot with private client data; broader end-to-end evaluation remains pending.
- Extraction quality depends on audio, images and available context.
images:
- file: actas-concept
  alt: Illustrative view of a voice note becoming a report draft.
  caption: Illustrative workflow view; example content.
---

## The problem

After a site visit, the professional needs to turn observations into a report. Voice notes and photographs contain the information, but organising and writing it adds work.

## What I built

A Telegram bot collects the material and produces a Word draft. Transcription and LLM extraction propose structured information; the system validates it before writing the document.

## Human review

The professional reviews, edits and signs the report. Corrections preserve the history and the workflow limits model calls. Draft quality is assessed through how much content survives editing.

This is a pilot with private client material. The image is an illustrative example without client data.
