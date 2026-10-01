---
locale: es
slug: pseudo-riemannian-gnn
title: Redes neuronales para grafos en variedades pseudo-riemannianas
summary: Trabajo de Fin de Grado, 9,9 sobre 10. Implementación y estudio de convoluciones sobre grafos en espacios que no son euclídeos, con la aplicación exponencial como solución al problema de la conectividad geodésica.
role: Autor del TFG completo
period: septiembre 2023 - junio 2024
year: 2024
order: 3
status: shipped
visibility: public
featured: true
domains:
  - geometría diferencial
  - aprendizaje sobre grafos
  - deep learning
  - matemáticas aplicadas
stack:
  - Python
  - PyTorch
  - NumPy
  - NetworkX
  - Jupyter
  - conda
links:
  repo: https://github.com/germanpadua/GCN-Pseudo-Riemannian-Manifold
metrics:
  - value: 9,9/10
    label: Calificación del tribunal
    basis: record
    source: Expediente académico, Universidad de Granada
  - value: 3
    label: "Espacios de curvatura: euclídeo, hiperbólico y pseudo-hiperbólico"
    basis: artifact
    source: manifolds/
  - value: MIT
    label: Licencia del código
    basis: artifact
    source: LICENSE
highlights:
  - "El núcleo matemático está escrito a mano: las operaciones de cada capa (euclídea, hiperbólica y pseudo-hiperbólica) están implementadas de forma explícita en layers/ y manifolds/, no delegadas a una librería de geometría."
  - El problema central es la falta de conectividad geodésica en el pseudo-hiperboloide, que se resuelve mediante la aplicación exponencial en lugar de forzar una métrica que no existe.
  - El repositorio incluye la búsqueda de hiperparámetros y los resultados completos, no sólo la ejecución que salió bien.
  - Es público y con licencia MIT, así que el código se puede leer y reutilizar legalmente.
limits:
  - El código parte de la implementación de referencia de Pseudo-Riemannian GCN, que a su vez deriva de HGCN. Mi aporte es el estudio, la adaptación, la reimplementación y el análisis experimental, no el diseño original de la arquitectura. Decirlo es lo honesto.
  - "El alcance es un trabajo de fin de grado: reconstrucción de grafos y análisis sobre conjuntos de datos académicos, sin aplicación a producción."
  - Los datos de las ejecuciones están commiteados como resultados, no como artefactos con manifiesto de procedencia reproducible paso a paso.
  - "El repositorio tiene un README breve: la explicación completa está en el cuaderno y en la memoria, no en la puerta de entrada."
---

## El problema

Las convoluciones funcionan sobre retículas: píxeles, señales, secuencias. Un grafo no es una retícula, y durante años se resolvió empotrándolo en un espacio euclídeo de dimensión alta, donde la geometría deja de significar nada.

Los espacios hiperbólicos codifican mejor las jerarquías porque crecen exponencialmente, como un árbol. Pero hay estructuras que no piden curvatura negativa pura, y ahí entran las variedades pseudo-riemannianas: espacios donde la métrica no es definida positiva, así que la distancia entre dos puntos distintos puede ser cero o negativa.

Eso es potente y es un dolor de cabeza. Una variedad pseudo-riemanniana **no tiene una distancia geodésica bien definida entre cualquier par de puntos**, y sin eso las capas convolucionales no tienen por dónde propagar la información.

## La solución

Mediante la **aplicación exponencial**, que lleva un vector del espacio tangente a un punto de la variedad. En lugar de calcular la geodésica entre dos puntos cualesquiera, se trabaja en el espacio tangente, donde sí hay estructura, y se proyecta de vuelta.

Todo eso está implementado a mano en `manifolds/` y `layers/`: cada operación, para cada uno de los tres espacios de curvatura, con sus gradientes.

## Qué hice y qué no

Aquí quiero ser preciso, porque es la parte que más se infla en los portfolios.

La arquitectura la propuso el artículo *Pseudo-Riemannian Graph Convolutional Networks*. Yo no la inventé. Lo que hice fue estudiarla hasta entenderla, implementar las operaciones geométricas, adaptar el entrenamiento, montar la búsqueda de hiperparámetros y evaluar el comportamiento en reconstrucción de grafos, comparando con el caso euclídeo e hiperbólico.

Eso es exactamente lo que un trabajo de fin de grado debería ser: no una contribución original al estado del arte, sino la demostración de que podés leer matemáticas duras, implementarlas y medirlas. El 9,9 que le puso el tribunal es una opinión informada sobre eso, y la memoria está disponible para quien quiera discutirla.

## Por qué lo pongo primero

Porque resume mejor que nada lo que hago: entender un formalismo, bajarlo a código que corre y no exagerar el resultado. Un portfolio de ciencia de datos lleno de modelos de juguete dice menos que uno con un trabajo donde la parte difícil era la matemática y la parte honesta es separar la contribución propia de la ajena.
