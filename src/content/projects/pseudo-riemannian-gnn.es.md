---
locale: es
slug: pseudo-riemannian-gnn
title: Geometría para aprender sobre grafos
summary: 'Mi TFG conecta geometría diferencial y deep learning: estudio cómo cambia lo que aprende una red al representar un grafo en espacios
  no euclídeos.'
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
highlights:
- Fundamentos de geometría diferencial y aprendizaje sobre grafos.
- Adaptación de operaciones geométricas, entrenamiento y búsqueda de hiperparámetros.
- Comparación experimental con GCN y GAT.
limits:
- Trabajo académico basado en la arquitectura y el código de referencia de QGCN/HGCN.
- Los resultados dependen del dataset, la configuración y la tarea; las proyecciones visuales son una simplificación.
---

## ¿Por qué cambiar la geometría?

Una red neuronal para grafos aprende representaciones de nodos a partir de sus características y conexiones. La geometría del espacio en el que sitúa esas representaciones condiciona las relaciones que puede expresar. En mi TFG estudié la extensión de estas redes a variedades pseudo-riemannianas.

## De las matemáticas al entrenamiento

El trabajo aborda variedades con métrica indefinida, geodésicas y pseudo-hiperboloides. Uno de los retos es que completitud geodésica y conectividad geodésica no son equivalentes en este contexto. Las aplicaciones exponencial y logarítmica permiten trabajar entre la variedad y el espacio tangente para construir las operaciones de la red.

## Mi aportación

Estudié los fundamentos, adapté la implementación de referencia, analicé las operaciones geométricas y los métodos de optimización, y realicé comparaciones experimentales con GCN y GAT. El proyecto incluye entrenamiento, búsqueda de hiperparámetros y análisis de las representaciones aprendidas. La arquitectura original procede del trabajo de QGCN; mi contribución es su estudio, implementación adaptada y evaluación.

## Leer los resultados

El explorador de esta página usa proyecciones y métricas de ejecuciones guardadas en el proyecto. En las ejecuciones seleccionadas, Photo muestra una mejora de accuracy; Citeseer, Cora, Disease y Airport muestran resultados inferiores a la referencia. Una proyección en dos dimensiones ayuda a observar la estructura, pero no sustituye a la evaluación de la tarea ni demuestra una mejora general.
