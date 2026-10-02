---
locale: es
slug: actas-visitas-obras
title: De una visita de obra a un acta
summary: Un bot transforma notas de voz y fotografías de una visita de obra en un borrador de acta editable, con revisión del técnico antes de
  usarlo.
role: Diseño e implementación completos
period: septiembre 2026
year: 2026
order: 7
status: shipped
visibility: case-study
featured: true
confidentiality: Repositorio privado. Contiene actas y fotografías de una obra y un cliente reales.
domains:
- LLMs en producción
- orquestación de agentes
- documentos
- automatización de procesos
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
- Captura de notas de voz y fotografías desde Telegram.
- Extracción estructurada y validación antes de generar el documento.
- Borradores editables y revisión del técnico.
limits:
- Piloto con datos privados de un cliente; pendiente de ampliar la evaluación del flujo completo.
- La calidad de la extracción depende del audio, las imágenes y el contexto disponible.
images:
- file: actas-concept
  alt: Vista ilustrativa de una nota de voz que se transforma en un borrador de acta.
  caption: Vista ilustrativa del flujo; contenido de ejemplo.
---

## El problema

Después de una visita de obra, el técnico necesita convertir sus observaciones en un acta. Las notas de voz y las fotografías contienen la información, pero organizarla y redactarla añade trabajo.

## Qué construí

Un bot de Telegram recoge el material y lo convierte en un borrador de Word. La transcripción y la extracción asistida por LLM proponen información estructurada; el sistema valida el resultado antes de escribir el documento.

## Revisión humana

El técnico conserva el control: revisa, corrige y firma el acta. Las correcciones mantienen el historial y el flujo limita las llamadas a modelos. La calidad del borrador se plantea en términos de cuánto contenido conserva el técnico tras editarlo.

El proyecto es un piloto y el repositorio contiene material privado. La imagen presenta un ejemplo ilustrativo sin datos del cliente.
