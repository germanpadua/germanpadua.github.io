---
locale: en
slug: pseudo-riemannian-gnn
title: Graph Neural Networks on Pseudo-Riemannian Manifolds
summary: 'My bachelor’s thesis connects differential geometry and neural networks for graphs. It is a study of how what a network learns changes when a
  graph is represented in non-Euclidean spaces.'
role: Author of the entire bachelor's thesis
period: September 2023 - June 2024
year: 2024
order: 3
status: shipped
visibility: public
featured: true
domains:
- differential geometry
- learning on graphs
- deep learning
- applied mathematics
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
- value: 9.9/10
  label: Score given by the panel
  basis: record
  source: Academic record, University of Granada
highlights:
- Differential geometry and graph learning foundations.
- Adaptation of geometric operations, training and hyperparameter search.
- Experimental comparison with GCN and GAT.
limits:
- Academic work based on the QGCN/HGCN reference architecture and code.
- Results depend on dataset, configuration and task; visual projections are a simplification.
---

## Why change the geometry?

A graph neural network learns node representations from features and connections. The geometry of the representation space shapes the relationships it can express. My bachelor’s thesis studied these networks on pseudo-Riemannian manifolds.

## From mathematics to training

The work covers indefinite metrics, geodesics and pseudo-hyperboloids. Geodesic completeness and geodesic connectedness are different properties in this setting. Exponential and logarithmic maps connect the manifold and tangent space to implement the network’s operations.

## My contribution

I studied the foundations, adapted the reference implementation, examined geometric operations and optimisation methods, and ran experimental comparisons with GCN and GAT. This includes training, hyperparameter search and analysis of learned representations. QGCN is the original architecture; my contribution is its study, adapted implementation and evaluation.

## Reading the results

The explorer uses projections and metrics from saved project runs. In the selected runs, Photo shows an accuracy improvement; Citeseer, Cora, Disease and Airport score below the baseline. A two-dimensional projection helps reveal structure, but does not replace task evaluation or establish a general improvement.
