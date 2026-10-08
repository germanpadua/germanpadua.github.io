---
locale: es
slug: hackspain-2026
title: HackSpain 2026, track Prosper AI
issuer: HackSpain, Madrid
kind: competition
period: 18-20 septiembre 2026
order: 2
summary: 36 horas en Madrid para construir un agente de voz que atiende el teléfono de una clínica y reserva citas de verdad. Equipo de cinco personas.
contribution: Construí la clínica falsa para hacer pruebas, los 21 escenarios sobre 18 familias de fallo y el comparador determinista campo por campo, para poder iterar sin gastar los minutos puntuados del reto.
links:
  url: https://kermitpanic-hackspain.vercel.app/
  label: La crónica del equipo
---

## Qué fue

HackSpain 2026, 36 horas en Madrid. Más de 250 participantes, 60 equipos y cinco tracks. Elegimos el track **Prosper AI**: construir una recepcionista de voz para una clínica ficticia que atendiera llamadas y ejecutara reservas reales dentro de un límite de minutos puntuados.

Equipo **KermitPanic**, cinco personas: Hugo, José, Marina, Ginés y yo.

## Mi parte

La plataforma del reto no funciona del todo bien, así que no se podía iterar contra ella. Construí una clínica falsa que responde por WebSocket igual que la real, con 21 escenarios, y un oráculo determinista que compara campo por campo para saber si una reserva quedó bien hecha.

Trabajé contra un contrato de interfaz escrito en lugar de contra el código del compañero que hacía el agente, y eso permitió que los dos avanzáramos en paralelo sin esperarnos.

## Lo que aprendí

Que en un equipo de cinco la restricción no es la capacidad técnica, es la coordinación.
