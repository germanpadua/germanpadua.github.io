---
locale: es
slug: piso-irene
title: Editor de planos y reforma en 3D
summary: 'Editor de vivienda que corre en el navegador sin conexión: plano en 2D, levantamiento en 3D con mobiliario, luz natural hora a hora
  y recorrido en primera persona. Todo en un solo archivo HTML.'
role: Diseño e implementación completos
period: septiembre 2026
year: 2026
order: 12
status: in-progress
visibility: case-study
confidentiality: Contiene el plano de una vivienda real. No se publica hasta sustituirlo por un plano sintético.
domains:
- gráficos 3D
- herramientas locales
- geometría computacional
- PWA
stack:
- JavaScript ESM
- Three.js
- esbuild
- Cloudflare Workers
- happy-dom
- PWA
metrics: []
highlights:
- '"El editor entero cabe en un único archivo HTML que se abre con doble clic, sin instalación y sin conexión. Ese requisito condicionó toda la
  arquitectura y fue el correcto: la herramienta tenía que funcionar en una obra sin cobertura."'
- La orientación solar se calcula por hora, así que se puede ver si la reforma deja la cocina a oscuras a las nueve de la mañana antes de mover
  un tabique.
- '"El modo de recorrido es en primera persona y con colisión, no una órbita alrededor de la maqueta: se entra y se camina."'
- El despliegue público va detrás de un Worker de Cloudflare con contraseña y una cookie firmada con HMAC, precisamente porque el contenido es
  privado.
- La escala del plano está derivada de los puntos del PDF, no estimada a ojo, y la discrepancia de 6,99 puntos entre las dos versiones del plano
  está documentada como tal.
limits:
- '"No se puede publicar tal como está. Los planos de origen, las capturas de estado actual y reformado, y el proyecto exportado llevan la vivienda
  real dentro, con la dirección en el nombre del archivo de partida. Un plano real no se anonimiza desplazando una coordenada: hay que rehacer
  los assets."'
- El plan para publicarlo es sustituir la vivienda por un plano sintético de distribuciones equivalentes y regenerar todas las capturas. Está
  pendiente.
- '"No es un plano técnico de ejecución: no comprueba escaleras, puertas ni habitabilidad, y no vale para pedir licencia de obra."'
- Los suelos y las paredes se colocan por separado, así que hay que ajustar los dos.
- Los datos viven en el almacenamiento local del navegador, sin servidor. iOS puede vaciarlo, y la copia de seguridad es un archivo JSON que hay
  que exportar a mano.
---

## El problema

Reformar un piso exige responder preguntas que nadie te contesta hasta que ya está hecho: ¿entra el sofá?, ¿queda sitio para una mesa de cuatro?, ¿a qué hora entra el sol?, ¿se ve la tele desde la cocina?

Contratar un estudio para un piso de barrio no tiene sentido. Y las aplicaciones que existen piden cuenta, funcionan con conexión y no dejan claro qué se guarda dónde.

## La restricción que definió el diseño

Todo el editor tenía que caber en **un solo archivo HTML** que se abre con doble clic, sin servidor y sin conexión.

Esa restricción parece una limitación y es la característica. Se trabaja en casa el domingo, se lleva el archivo en el móvil a la obra, y se abre allí donde no hay cobertura. Nada que instalar, nada que sincronizar, nada que explicar a nadie.

Cumplirla obligó a empaquetar las fuentes modulares en un único bundle con esbuild, a guardar en el almacenamiento local del navegador en vez de en un backend, y a escribir la geometría a mano en lugar de apoyarse en utilidades del servidor.

## Lo que hace

Se dibuja el plano en 2D —muros, habitaciones, puertas, ventanas, cotas— sobre la imagen del plano original, con la escala derivada de los puntos del PDF para que las medidas sean reales y no una aproximación visual.

Ese plano se levanta en 3D con mobiliario paramétrico. Sobre él se simula la luz natural **hora a hora** según la orientación, que es la función que más cambió decisiones: ver el salón a oscuras a las nueve de la mañana convence más que cualquier consejo.

Y se puede entrar y caminar, en primera persona y con colisión, para comprobar si el hueco entre la cama y el armario da para pasar.

Se exporta a GLB, a PNG, a un plano acotado para imprimir y a un paquete de texto pensado para pegarle a un asistente cuando hace falta una segunda opinión.

## Por qué no está publicado

Porque contiene la vivienda real de una persona, con su dirección en el nombre del archivo de plano original y las medidas exactas de cada habitación.

Un plano no se anonimiza moviendo una coordenada: la imagen **es** el dato. Publicarlo exige diseñar una vivienda ficticia con una distribución equivalente, regenerar el modelo y volver a tomar todas las capturas. Es trabajo pendiente, no un detalle de limpieza, y hasta que esté hecho el proyecto se queda como ficha.

Es una lástima, porque técnicamente es lo más vistoso que tengo: un editor de planos con modo de paseo en un solo archivo suena a exageración hasta que alguien lo abre.
