---
locale: es
slug: diffusion-models
title: Modelos de difusión para generación de imágenes
summary: Estudio e implementación de modelos de difusión aplicados a la síntesis de coches con el conjunto de datos Stanford Cars. Incluye el
  ajuste de una arquitectura existente y el cálculo del FID para comparar versiones.
role: Autor
period: enero - febrero 2024
year: 2024
order: 13
status: shipped
visibility: public
domains:
- modelos generativos
- deep learning
- evaluación de modelos
stack:
- Python
- PyTorch
- Jupyter
links:
  repo: https://github.com/germanpadua/Diffusion
metrics: []
highlights:
- '"No me quedé en ejecutar un cuaderno ajeno: modifiqué capas, el algoritmo de entrenamiento, hiperparámetros y funciones de pérdida, y comparé
  las tres variantes entre sí."'
- Implementé el cálculo del FID para poder comparar versiones con una métrica objetiva en lugar de mirar muestras y opinar.
- Trabajé con la resolución de 32×32 píxeles, que es pequeña y obliga a mirar de cerca el equilibrio entre la arquitectura y el presupuesto de
  cómputo.
limits:
- '"La arquitectura de partida no es mía: adapté y modifiqué un modelo existente. Lo que aporto es el análisis experimental, no el diseño."'
- El cálculo del FID está implementado pero no hay un informe con los valores commiteado, así que no puedo publicar cifras.
- 32×32 es una resolución de juguete comparada con los modelos actuales; sirve para estudiar el mecanismo, no para producir imágenes útiles.
- '"No hay tests ni integración continua: es un trabajo de estudio en cuadernos."'
- El repositorio tiene tres cuadernos y un PDF, con un README de una línea. La explicación está en el PDF, no donde uno la busca.
---

## El interés

Los modelos de difusión generan imágenes aprendiendo a invertir un proceso de ruido. La idea es elegante: se destruye una imagen añadiendo ruido paso a paso, y se entrena una red para deshacer cada paso. Generar es empezar de ruido puro y recorrer el camino al revés.

Quería entender ese mecanismo por dentro, no usar una librería que lo hiciera por mí.

## Qué hice

Partí de una implementación existente y la modifiqué en cuatro frentes: capas de la arquitectura, algoritmo de entrenamiento, hiperparámetros y funciones de pérdida. Cada modificación quedó en su propio cuaderno, para que la comparación fuera honesta y no un promedio de cambios mezclados.

Lo más útil fue implementar el **FID**, una métrica que compara la distribución de las imágenes generadas con la de las reales. Sin ella, evaluar un modelo generativo se reduce a mirar muestras y decidir cuál parece mejor, que es exactamente lo que no hay que hacer.

## Lo que me llevé

Que evaluar es más difícil que generar. Construir el modelo es seguir un artículo; saber si la versión 3 es mejor que la 2 exige una métrica, y la métrica tiene sus propios supuestos que hay que entender.

Y que a 32×32 píxeles se aprende el mecanismo pero no se produce nada presentable. Es una decisión que tomé por presupuesto de cómputo y que volvería a tomar, siempre que quede claro en el enunciado para qué sirve el ejercicio.
