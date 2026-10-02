---
locale: es
slug: hackspain-prosper
title: KermitPanic · Agentes de voz
summary: Un agente de voz para gestionar citas médicas. En el equipo KermitPanic construí el entorno de evaluación y la integración con la plataforma
  del hackathon.
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
team:
  name: KermitPanic
  size: 5
  contribution: El arnés de evaluación completo, la integración entre el agente y la plataforma del reto, y la documentación técnica.
metrics: []
highlights:
- Clínica simulada por WebSocket para probar el agente sin consumir minutos del reto.
- Escenarios de reservas, cambios, cancelaciones e interrupciones.
- Verificación determinista de la reserva final y contrato de integración con el agente.
limits:
- Evaluación local con una clínica simulada; no equivale al juez oficial.
- La posición en el marcador durante el evento no es una clasificación final oficial.
images:
- file: kermitpanic-concept
  alt: Vista ilustrativa del agente de voz y la confirmación de una cita.
  caption: Vista ilustrativa del flujo; contenido de ejemplo.
---

## El reto

Durante HackSpain 2026, el equipo KermitPanic desarrolló un agente de voz para atender llamadas y gestionar citas en una clínica ficticia. El agente debía conversar con el paciente y ejecutar la operación contra la plataforma del reto.

## Mi aportación

Construí el entorno de evaluación: una clínica simulada por WebSocket, un catálogo de escenarios y un comparador que verifica cada campo de la reserva final. Así podíamos probar cambios sin consumir los minutos limitados de la plataforma oficial.

También trabajé en la integración entre el agente y el evaluador, con un contrato de interfaz que permitió desarrollar ambas partes en paralelo. Los escenarios incluían cambios de opinión, interrupciones, silencios y conflictos de disponibilidad.

## El trabajo en equipo

La crónica pública cuenta cómo el equipo pasó del planteamiento inicial al prototipo y las pruebas durante el hackathon. Es el mejor lugar para ver el proyecto completo, el reparto del trabajo y las decisiones tomadas durante el evento.
