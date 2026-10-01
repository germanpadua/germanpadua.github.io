---
locale: es
slug: actas-visitas-obras
title: Actas de visitas de obra
summary: Un bot de Telegram donde el técnico de obra dicta y fotografía lo que ha visto, y el sistema le devuelve un borrador de acta en Word que él edita y firma. Mide cuánto del borrador sobrevive a su edición.
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
metrics:
  - value: 452
    label: Tests en verde en el registro de commits
    basis: artifact
    source: historial de commits del proyecto
  - value: ≥ 80 %
    label: Objetivo de retención borrador → acta final
    basis: target
    source: docs/GATE.md
  - value: 10-20 s
    label: Latencia de generación por nota
    basis: unverified
    source: notas del proyecto, no medido
  - value: 13
    label: Decisiones de arquitectura registradas como ADR
    basis: artifact
    source: docs/adr/0001…0013
  - value: 38
    label: Archivos de test
    basis: artifact
    source: tests/
highlights:
  - El núcleo de captura es determinista y sólo un conjunto cerrado de herramientas tipadas escribe. Las correcciones conservan el historial en lugar de sobrescribir.
  - El LLM devuelve un plan en JSON que se valida antes de ejecutarse, y nunca tiene permiso de escritura directa. Si el plan no valida, se degrada a reglas.
  - Cada nota tiene un presupuesto de llamadas a modelo, así que una conversación rara no se convierte en una factura sorpresa.
  - La métrica de calidad del piloto no es "¿el texto es bonito?", sino cuánto del borrador sobrevive a la edición del técnico. Es la que importa y es la que el cliente nota.
  - Las plantillas de Word son de dos capas para sobrevivir a cómo Word parte las etiquetas de reemplazo por dentro, que es un problema que sólo aparece cuando ya está en producción.
limits:
  - El objetivo de retención del 80 % es un **criterio de aceptación**, no una medición. El script que lo evalúa escribe el informe en un directorio temporal que no está commiteado, así que no puedo publicar un resultado. Pongo el objetivo y digo que es un objetivo.
  - El almacenamiento en ficheros JSON sirve para el piloto y para nada más.
  - Cada acta se genera desde cero, sin arrastrar la anterior, así que el sistema no aprende el estilo del técnico entre visitas.
  - Entre 10 y 20 segundos por nota es lento para alguien de pie en una obra.
  - Depende de una pasarela de inferencia con varios modelos, alguno de pago.
  - "\"El repositorio se queda privado: contiene actas reales de un cliente con nombre de empresa, de obra y fotografías de campo. No se publica ni se describe en detalle.\""
---

## El problema

Un técnico visita una obra, mira, fotografía y dicta notas de voz. Después, en la oficina, tiene que escribir un acta en Word. El trabajo real no es la visita: es la segunda parte.

El objetivo del sistema es quitarle esa segunda parte sin quitarle el control del documento. Y la forma de medirlo no es preguntarle si le gusta, sino ver **cuánto de lo que escribió el sistema sobrevive cuando él lo edita**. Si reescribe el 80 % de cada borrador, el sistema no sirvió para nada.

## La arquitectura que elegí, y por qué

La tentación con LLMs es dejar que el modelo haga el trabajo. Aquí la regla es la contraria: el modelo **propone**, el sistema **valida** y sólo un núcleo determinista **escribe**.

El flujo es el siguiente. Llega una nota —texto, foto o audio— y se clasifica. Para cada tipo de nota hay un grafo de reglas que decide qué herramientas tipadas hay que ejecutar. Cuando hace falta interpretación, el modelo devuelve un plan en JSON con las llamadas a esas herramientas; el plan se valida contra un esquema y, si no pasa, se descarta y se cae a reglas. La conversión a documento la hace `python-docx` sobre una plantilla, no el modelo.

Eso significa que un modelo equivocado puede producir un borrador peor, pero nunca puede escribir en el expediente. Y como cada nota tiene su presupuesto de llamadas, un caso raro degrada la calidad en lugar de multiplicar el coste.

## Lo que aprendí

Que en un sistema de documentos el problema difícil no es el modelo, es el formato. Las plantillas de Word dan muchísimo menos control de lo que parece: Word parte las etiquetas de reemplazo internamente y una sustitución ingenua corrompe el diseño. La solución de dos capas salió de ahí, y es el tipo de detalle que no aparece hasta que un usuario real abre el archivo.

Y que la métrica correcta casi nunca es la cómoda. La retención es incómoda porque puede dar 40 % y arruinarte la semana, y es precisamente por eso la que hay que medir.

## El error que no repetiría

Este proyecto también me enseñó lo que ya me había enseñado el TFM: un proyecto que toca datos de un cliente necesita una política de datos antes de la primera línea. Aquí las actas reales acabaron en el historial del repositorio, y aunque el repositorio sea privado, eso es un problema que hay que limpiar. Un `.gitignore` escrito al final no arregla una decisión que había que tomar al principio.
