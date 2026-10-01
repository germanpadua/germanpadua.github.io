---
locale: es
slug: telemetry-sentinel
title: Telemetry Sentinel
summary: Detector causal de pérdidas de velocidad en telemetría pública de Fórmula 1. Sólo mira el pasado, así que sus alertas se pueden defender en directo, y cada una llega con la evidencia que la justifica.
role: Diseño, implementación y evaluación
period: septiembre - octubre 2026
year: 2026
order: 1
status: shipped
visibility: case-study
featured: true
confidentiality: Repositorio privado mientras preparo la publicación del sitio de presentación.
domains:
  - detección de anomalías
  - series temporales
  - inferencia causal
  - ingeniería de datos
stack:
  - Python 3.12
  - FastF1
  - PyArrow / Parquet
  - scikit-learn
  - MLflow
  - pytest
  - Docker
  - React + Vite
metrics:
  - value: 1,00
    label: Recall en Monza 2023, a ciegas
    basis: artifact
    source: reports/metrics/2023-monza-r-test-*.json
  - value: 0
    label: Falsas alarmas en 1,19 horas de coche
    basis: artifact
    source: reports/report.md §4
  - value: 2,3 s
    label: Retardo medio de detección
    basis: artifact
    source: reports/report.md §4
  - value: 414/415
    label: Tests que pasan (1 omitido)
    basis: artifact
    source: openspec/changes/add-provenance-integrity/tasks.md
  - value: 0,00
    label: Falsas alarmas por hora en validación (España)
    basis: artifact
    source: reports/metrics/validation-2023-spain-r-tune-*.json
highlights:
  - "La causalidad está impuesta por construcción, no prometida: tests de invariancia de prefijo y de perturbación del futuro, con testigo en vivo para cada componente con estado."
  - Las reglas de supresión se revisaron viendo las falsas alarmas de validación y después se congelaron antes del test ciego, que es el orden correcto y el que casi nadie respeta.
  - Cada número publicado apunta a un fichero de métricas commiteado y a una ejecución concreta de MLflow. Una métrica no definida es una etiqueta, nunca un cero.
  - "El detector suprime lo que el contexto ya explica: entrada a boxes, bandera amarilla, coche de seguridad y bandera azul."
limits:
  - El test ciego tuvo un solo positivo real, y un positivo no es una tasa. El intervalo de confianza es tan ancho que el 1,00 se lee como "no falló en el único caso que había".
  - "No publico la cifra de 957 tests que aparece en las notas del proyecto: sólo está en prosa, sin artefacto, y los recuentos commiteados dicen 414, 418 y 533 según el momento y el alcance. Un número que no puedo señalar no va."
  - "Hay un defecto medido y sin arreglar: 40 alertas posteriores a la bandera a cuadros."
  - Un único anotador humano, sin acuerdo entre anotadores. La segunda pasada se retiró.
  - El fin de carrera depende de un mensaje que el feed público a veces omite.
  - El sitio de presentación reproduce ejecuciones precalculadas y exige regenerar la exportación, que no está commiteada.
---

## El problema

En una carrera, un coche que pierde velocidad de golpe puede ser un pinchazo, un problema mecánico o simplemente que entró a boxes. Los datos son públicos y abundan, pero la parte difícil no es detectar la caída: es **descartar las que el contexto ya explica** sin descartar la que importaba.

## Por qué sólo mira el pasado

Un detector que usa la ventana completa de la carrera es más fácil de escribir y más preciso en el laboratorio. Y es inservible en directo, porque en la vuelta 20 no tiene la vuelta 50.

Aquí la causalidad no es una promesa en la documentación: está impuesta por construcción y verificada con dos familias de tests. Los de invariancia de prefijo comprueban que truncar el futuro no cambia el resultado. Los de perturbación del futuro comprueban que alterarlo tampoco. Cada componente con estado tiene un testigo en vivo que falla si la garantía se rompe.

## Cómo se decide qué es una anomalía

La referencia no es un umbral fijo, sino un modelo robusto por cada 25 metros de pista: la mediana de las cinco vueltas limpias anteriores del mismo coche, con su desviación absoluta mediana. El umbral es el máximo entre un absoluto y cuatro veces esa dispersión, así que se adapta al coche y a la vuelta sin perder interpretabilidad.

Competir con ese modelo hay uno contextual entrenado sólo con la mediana de la distribución de residuos, sin etiquetas, porque las etiquetas humanas eran demasiado pocas para entrenar nada serio.

## El orden que importa

Las reglas de supresión se ajustaron **después** de ver las falsas alarmas de la validación en España, y se congelaron **antes** del test ciego en Monza. Ajustar después del test sería hacer trampa; ajustar sin mirar la validación sería negligencia. La configuración congelada tiene hash y manifiesto de assets.

En Monza el detector no produjo ninguna falsa alarma en 1,19 horas de coche y detectó el único positivo en 2,3 segundos. Eso no demuestra que el sistema sea bueno: demuestra que no falló en un caso. El informe lo dice así de claro, y por eso el proyecto me parece más defendible que uno con métricas mejores y peores explicaciones.
