---
locale: es
slug: hackspain-prosper
title: KermitPanic · Agentes de voz
summary: Un agente de voz para gestionar citas médicas, avisar al doctor correspondiente y controlar todo lo que pasa. Proyecto desarrollado para HackSpain.
role: Arnés de evaluación e integración
period: 18-20 septiembre 2026
year: 2026
order: 4
status: shipped
visibility: public
featured: true
domains:
- agentes de voz
- LLMs
- evaluación
- trabajo en equipo
stack:
- Python
- FastAPI
- pipecat
- Gemini Live
- Twilio Media Streams
- Next.js
- Astro
- Fly.io
links:
  repo: https://github.com/rh45-one/hackspain-kermit-prosper
  demo: https://kermitpanic-hackspain.vercel.app/
metrics: []
highlights:
- Clínica simulada para probar el agente sin consumir minutos del reto.
- Escenarios de reservas, cambios, cancelaciones e interrupciones.
- Verificación determinista de la reserva final y contrato de integración con el agente.
limits:
- Evaluación local con una clínica simulada que no equivale al juez oficial.
images:
- file: kermitpanic-concept
  alt: Vista ilustrativa del agente de voz y la confirmación de una cita.
  caption: Vista ilustrativa del flujo; contenido de ejemplo.
---

## El reto

Durante HackSpain 2026, mi equipo desarrolló un agente de voz para atender llamadas y gestionar citas en una clínica ficticia. El agente debía conversar con el paciente y ejecutar la operación contra la plataforma del reto de Prosper AI.

## Mi aportación

Construí el entorno de evaluación, un catálogo de escenarios y un comparador que verifica cada campo de la reserva final. Así podíamos probar cambios sin consumir los minutos limitados de la plataforma oficial y evaluar el rendimiento de nuestro agente.
