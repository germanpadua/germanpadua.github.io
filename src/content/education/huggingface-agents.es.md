---
locale: es
order: 2
title: Agentes y LLMs
institution: Hugging Face
kind: certification
period: diciembre 2025
start: 2025-12
end: 2025-12
summary: Formación sobre construcción de agentes de IA, pipelines de recuperación aumentada y orquestación de modelos con LangGraph.
highlights:
  - "Desarrollo de agentes con herramientas, memoria y control de flujo, incluyendo cuándo conviene que el modelo decida y cuándo no."
  - "\"Pipelines de RAG, con la parte que casi nunca se cubre: evaluar si la recuperación está trayendo lo que hay que traer.\""
  - "Orquestación de varios modelos dentro de un mismo flujo, que es donde aparecen los fallos que no se ven en una demo de un solo paso."
---

## Para qué me sirvió

No para aprender a llamar a una API, que eso se aprende en una tarde. Para entender **dónde no hay que dejar decidir al modelo**.

La idea que me llevé y que aplico en todo lo que construyo después: un agente útil es el que tiene herramientas tipadas, un contrato claro sobre qué puede escribir y un presupuesto de llamadas. Todo lo demás es una demo que impresiona en vídeo y se rompe con el primer usuario real.

Eso es exactamente lo que apliqué en el proyecto de actas de visitas de obra: el modelo propone un plan, el sistema lo valida, y sólo un núcleo determinista escribe. La certificación no me dio esa arquitectura; me dio el vocabulario para explicarla y las ganas de mirar por dentro de las herramientas en lugar de usarlas a ciegas.

## Contexto

Es una certificación de plataforma, no un título. La pongo en su sitio: lo verificable de verdad es el código que escribo, y ahí está el proyecto de actas, la pasarela de inferencia y el detector de telemetría.
