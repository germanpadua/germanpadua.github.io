---
locale: es
slug: hackspain-prosper
title: KermitPanic en HackSpain 2026
summary: Agente de voz que atiende el teléfono de una clínica ficticia, negocia citas y ejecuta reservas reales en la plataforma del reto. 36 horas, cinco personas y un arnés de evaluación para no depender del marcador oficial.
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
metrics:
  - value: 21
    label: Escenarios en el arnés, sobre 18 familias de fallo
    basis: artifact
    source: evaluator/
  - value: 4º
    label: Puesto en el marcador en vivo, sábado 21:36
    basis: artifact
    source: cronica/public/fotos/marcador-sabado-2136.webp
  - value: 36 h
    label: Duración del hackathon
    basis: artifact
    source: prueba/scoring.md
  - value: 60
    label: Equipos en cinco tracks
    basis: record
    source: crónica del equipo, capítulo 1
highlights:
  - "El arnés no es un test unitario: es una clínica falsa completa que responde por WebSocket, con un oráculo de escenarios que verifica llamada a llamada si la reserva quedó bien hecha, para no gastar el límite de minutos puntuados del reto."
  - El comparador es determinista y campo por campo, así que un fallo se puede atribuir a un campo concreto en lugar de a "el agente fue mal".
  - Sirve para iterar sin la plataforma oficial delante, que es lo que hace posible mejorar 18 familias de escenarios en 36 horas.
  - "Trabajé contra un contrato de interfaz escrito, no contra el código de otro: el documento fija qué devuelve el agente y qué espera el evaluador, y eso permitió que dos personas avanzaran en paralelo sin pisarse."
limits:
  - "No publico la cifra de 412 tests que aparece en nuestras notas: sólo está en prosa y el mismo repositorio contiene 415, 418 y 533 en otros archivos. Un número que no puedo señalar no entra."
  - El "71 puntos, 4º, líder 76" de las 16:45 sólo existe en prosa. Hay capturas commiteadas de las 13:04, las 14:13 y las 21:36; no hay ninguna de esa hora. Publico el 4º con la captura de las 21:36 y digo de dónde sale.
  - "La organización nunca publicó una clasificación final: el propio equipo dejó escrito que \"no consta una posición oficial\". El 4º es del marcador en vivo, no del resultado final."
  - El arnés produce una estimación local y no es el juez oficial. Sus cifras no explican el marcador del reto.
  - Las cifras de la presentación (94,4 %, 82 %, cero fugas) eran objetivos de piloto, no resultados observados. No las publico como medidas.
  - La ejecución de 120 casos del Voice Lab fue simulada y se guardó en /tmp, nunca se commiteó.
  - El optimizador de franjas que el contrato de interfaz atribuye a mi nombre quedó fuera de alcance y no se entregó. No lo reclamo.
---

## El reto

Una clínica ficticia recibe llamadas de pacientes que quieren pedir cita, cambiarla o cancelarla. El objetivo era un agente de voz que las atendiera de principio a fin y ejecutara la reserva de verdad contra la plataforma del reto, dentro de un límite de minutos que se facturaban.

La parte interesante no es que el agente hable. Es que las acciones que promete tienen que existir después.

## Mi parte

De los cinco, yo llevé el **arnés de evaluación**. La crónica pública del equipo lo resume como "en las pruebas y el laboratorio", y es exacto.

El problema era concreto: la plataforma del reto limitaba los minutos puntuados, así que no se podía iterar contra ella. Construí una clínica falsa que responde por WebSocket igual que la real, con un catálogo de escenarios que cubre 18 familias de fallo —paciente que cambia de idea a mitad de frase, dos personas que quieren la misma franja, fecha imposible, interrupción, silencio— y un oráculo que comprueba, campo por campo, si la reserva final coincide con la que el escenario esperaba.

Determinista a propósito: un comparador difuso habría hecho imposible saber si una iteración mejoró algo o sólo cambió el ruido.

Y trabajé contra un **contrato de interfaz escrito** en lugar de contra el código de Ginés. El documento fija qué expone el agente y qué consume el evaluador. Eso permitió que el desarrollo del agente y el del laboratorio avanzaran en paralelo sin que ninguno de los dos tuviera que esperar al otro ni leer el código del otro a diario.

## Qué aprendí de 36 horas

Que en un equipo de cinco la restricción no es la capacidad técnica, es la coordinación. Y que un contrato escrito vale más que una reunión.

Y algo menos agradable: que en un hackathon se generan más afirmaciones que artefactos. Cuando volví a leer nuestras notas encontré tres cifras de tests distintas, un resultado que sólo existía en un mensaje, y un componente a mi nombre que nunca se entregó. La crónica que publicamos es honesta; las notas internas, no. Este portfolio usa las primeras.
