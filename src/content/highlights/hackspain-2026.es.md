---
locale: es
slug: hackspain-2026
title: HackSpain 2026, track Prosper AI
issuer: HackSpain, Madrid
kind: competition
period: 18-20 septiembre 2026
order: 2
headline:
  value: 4º
  label: Marcador en vivo a las 21:36, sobre 60 equipos
  basis: artifact
  source: cronica/public/fotos/marcador-sabado-2136.webp
summary: 36 horas en Madrid para construir un agente de voz que atiende el teléfono de una clínica y reserva citas de verdad. Equipo de cinco personas; yo llevé el arnés de evaluación y la integración.
contribution: Construí la clínica falsa que responde por WebSocket, los 21 escenarios sobre 18 familias de fallo y el comparador determinista campo por campo, para poder iterar sin gastar los minutos puntuados del reto.
limits:
  - El 4º es del marcador en vivo, no de una clasificación final. La organización nunca publicó una oficial y el propio equipo dejó escrito que no consta.
  - No publico los puntos ni la cifra de tests que circulan en las notas internas del equipo; ninguna de las dos tiene artefacto y los recuentos de tests se contradicen entre archivos.
  - Las cifras de la presentación eran objetivos de piloto, no resultados observados.
links:
  url: https://kermitpanic-hackspain.vercel.app/
  label: La crónica del equipo
---

## Qué fue

HackSpain 2026, 36 horas en Madrid. Más de 250 participantes, 60 equipos y cinco tracks. Elegimos el track **Prosper AI**: construir una recepcionista de voz para una clínica ficticia que atendiera llamadas y ejecutara reservas reales dentro de un límite de minutos puntuados.

Equipo **KermitPanic**, cinco personas: Hugo, José, Marina, Ginés y yo.

## Mi parte

El arnés de evaluación. La crónica pública del equipo lo resume como *"en las pruebas y el laboratorio"*, y es exacto.

La plataforma del reto facturaba los minutos, así que no se podía iterar contra ella. Construí una clínica falsa que responde por WebSocket igual que la real, con 21 escenarios que cubren 18 familias de fallo, y un oráculo determinista que compara campo por campo para saber si una reserva quedó bien hecha.

Trabajé contra un contrato de interfaz escrito en lugar de contra el código del compañero que hacía el agente, y eso permitió que los dos avanzáramos en paralelo sin esperarnos.

## Lo que aprendí

Que en un equipo de cinco la restricción no es la capacidad técnica, es la coordinación. Y que un hackathon genera más afirmaciones que artefactos: al volver a leer nuestras notas encontré tres cifras distintas de tests, un resultado que sólo existía en un mensaje, y un componente a mi nombre que nunca llegó a entregarse. La crónica que publicamos es honesta; las notas internas no lo eran, y este portfolio usa las primeras.
