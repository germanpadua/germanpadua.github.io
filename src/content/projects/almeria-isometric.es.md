---
locale: es
slug: almeria-isometric
title: Almería Isométrica
summary: Un mapa isométrico de Almería construido con datos públicos reales —LiDAR del PNOA, ortofoto y Catastro— donde la IA sólo decide el aspecto de las superficies. La geometría la impone el dato, no el modelo.
role: Diseño e implementación del pipeline completo
period: septiembre 2026
year: 2026
order: 5
status: in-progress
visibility: case-study
featured: true
confidentiality: "Proyecto local: todavía no tiene repositorio remoto ni visor publicado."
domains:
  - datos geoespaciales
  - render 3D
  - IA generativa
  - ingeniería de pipelines
stack:
  - Python
  - LiDAR PNOA
  - Blender
  - OpenSeadragon
  - DeepSeek
  - FLUX
  - DZI
images:
  - file: almeria-isometric
    alt: "Vista isométrica de Almería reconstruida desde LiDAR y Catastro, con los monumentos etiquetados y el selector de etapas del pipeline al pie."
metrics:
  - value: 2,19 pts/m²
    label: Densidad del LiDAR usado como fuente de verdad
    basis: artifact
    source: docs/historico/estado-auditado-2026-09-16.md
  - value: 97,2 %
    label: Cobertura horizontal de 1 m²
    basis: artifact
    source: docs/historico/estado-auditado-2026-09-16.md
  - value: 26°
    label: Elevación de cámara elegida, sobre 35,264°
    basis: artifact
    source: comparación 51,7 % frente a 42,5 % de fachada visible
  - value: 96 m
    label: Tamaño de tesela, con estado reanudable por tesela
    basis: artifact
    source: almeria/teselas/
  - value: 4 / 16
    label: Peticiones completadas e imágenes generadas
    basis: artifact
    source: data/cuota_registro.jsonl
  - value: 0
    label: Variantes v5 aprobadas
    basis: artifact
    source: data/experimentos/catedral-v5/evaluacion.json
highlights:
  - La regla del proyecto es que la fidelidad se impone con datos, no se le pide a la IA. La geometría sale del LiDAR y del Catastro; el modelo generativo sólo elige cómo se ve una superficie.
  - Toda especificación que produce el LLM pasa por una gramática acotada, así que una alucinación se rechaza antes de llegar al render en lugar de estropear el resultado.
  - El pipeline son cinco etapas reanudables con estado por tesela, así que una ejecución interrumpida continúa donde quedó en vez de empezar de nuevo.
  - "\"La elevación de cámara se eligió midiendo: a 26° se ve el 51,7 % de fachada, frente al 42,5 % a 35,264°. El ángulo isométrico clásico muestra menos edificio.\""
  - Hice una auditoría posterior que invalidó conclusiones mías anteriores. Eso está documentado como tal, y es la parte del proyecto de la que estoy más contento.
limits:
  - No hay ninguna tesela aprobada ni costura validada. El proyecto funciona por partes y todavía no produce un resultado publicable completo.
  - "\"El LiDAR aéreo no resuelve fachadas: la altura está, el detalle vertical no. Es una limitación de la fuente, no del método.\""
  - Las cuatro variantes v5 se rechazaron en la evaluación. El registro de cuota marca 4 peticiones completadas de un presupuesto de viabilidad holgado, y no gasté más porque la cuota es de 100 peticiones al mes.
  - Las costuras entre teselas son el riesgo principal y no están resueltas.
  - "\"El visor se puede publicar tal cual, pero no está publicado, y el proyecto no tiene repositorio remoto: existe sólo en local.\""
  - El texto de los monumentos es de Wikipedia y las fotos de Wikimedia Commons, con atribución CC BY-SA 4.0. No es contenido propio.
---

## La idea

Los generadores de imágenes hacen ciudades bonitas que no existen. El LiDAR y el Catastro describen ciudades que existen con precisión centimétrica, pero se ven como nubes de puntos.

Almería Isométrica intenta lo contrario de lo habitual: **usar el dato para imponer la forma y la IA para elegir sólo el aspecto.** Cada edificio está donde está, con la altura que tiene. Lo que decide el modelo es si esa fachada parece encalada, de ladrillo o en obra.

Es una distinción que parece menor y no lo es. Si la geometría viene del modelo, el resultado es una ilustración. Si viene del dato, es un mapa.

## Cómo funciona

Cinco etapas encadenadas. Los datos se descargan y corregistran: LiDAR, ortofoto, huellas catastrales y de OSM. De ahí sale un modelo digital de superficie, que es lo que permite saber qué se ve y qué queda oculto desde la cámara. Después se extrae la escena y se convierte en una especificación estructurada con una gramática acotada. Esa especificación pasa a la generación de aspecto. Y por último se tesela en piezas de 96 metros que se sirven como pirámides para el visor.

Cada etapa guarda su estado por tesela. Cuando una ejecución se cae a mitad —y se cae, porque el LiDAR es lento— se retoma donde quedó.

El ocultamiento se resuelve con trazado de rayos sobre el modelo de superficie, no con el z-buffer de Blender. Necesitaba saber qué fachadas se ven realmente para decidir dónde vale la pena gastar una petición de generación, y esa información tiene que estar antes del render.

## Las decisiones que más costaron

**La elevación de cámara.** La isométrica clásica tiene un ángulo de 35,264°. Lo medí y muestra menos fachada que 26°, así que rompí la convención y argumenté por qué. Un mapa isométrico que no se lee como isométrico estricto es un precio que pagué a conciencia.

**No usar la ortofoto como referencia del modelo generativo.** Lo intenté y contamina el resultado: el modelo copia la foto en lugar de reinterpretar la superficie. Está documentado como decisión y como corrección de una decisión anterior.

**Rechazar las cuatro variantes v5.** Ninguna pasó la evaluación, y en lugar de elegir la menos mala y presentarla, quedó registrado que no hay resultado aprobado. Un proyecto de portfolio que enseña su propio rechazo es más creíble que uno que enseña sólo lo que salió bien.

## Estado actual

Incompleto, y lo digo en la ficha. Hay un visor que funciona, hay geometría reconstruida, hay decisiones medidas y hay un registro honesto de lo que se rechazó. No hay una ciudad terminada.
