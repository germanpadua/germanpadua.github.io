---
locale: en
slug: pseudo-riemannian-gnn
title: Graph Neural Networks on Pseudo-Riemannian Manifolds
summary: Bachelor's thesis, 9.9 out of 10. Implementation and study of graph convolutions in spaces that are not Euclidean, with the exponential map as the solution to the geodesic connectivity problem.
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
  - value: 3
    label: "Curvature spaces: Euclidean, hyperbolic and pseudo-hyperbolic"
    basis: artifact
    source: manifolds/
  - value: MIT
    label: Code licence
    basis: artifact
    source: LICENSE
highlights:
  - "The mathematical core is written by hand: the operations of each layer (Euclidean, hyperbolic and pseudo-hyperbolic) are implemented explicitly in layers/ and manifolds/, not delegated to a geometry library."
  - The central problem is the lack of geodesic connectivity on the pseudo-hyperboloid, which is solved by means of the exponential map instead of forcing a metric that does not exist.
  - The repository includes the hyperparameter search and the full results, not only the run that went well.
  - It is public and MIT-licensed, so the code can be read and reused legally.
limits:
  - The code builds on the reference implementation of Pseudo-Riemannian GCN, which in turn derives from HGCN. My contribution is the study, the adaptation, the reimplementation and the experimental analysis, not the original design of the architecture. Saying so is the honest thing to do.
  - "The scope is a bachelor's thesis: graph reconstruction and analysis on academic datasets, with no production application."
  - The run data is committed as results, not as artifacts with a provenance manifest reproducible step by step.
  - "The repository has a short README: the full explanation lives in the notebook and in the thesis report, not at the front door."
---

## The problem

Convolutions work on grids: pixels, signals, sequences. A graph is not a grid, and for years the answer was to embed it in a high-dimensional Euclidean space, where geometry stops meaning anything.

Hyperbolic spaces encode hierarchies better because they grow exponentially, like a tree. But there are structures that do not ask for pure negative curvature, and that is where pseudo-Riemannian manifolds come in: spaces where the metric is not positive definite, so the distance between two distinct points can be zero or negative.

That is powerful and it is a headache. A pseudo-Riemannian manifold **has no well-defined geodesic distance between every pair of points**, and without that, convolutional layers have no way to propagate information.

## The solution

The **exponential map**, which carries a vector from the tangent space to a point on the manifold. Instead of computing the geodesic between any two points, the work happens in the tangent space, where there is structure, and gets projected back.

All of that is implemented by hand in `manifolds/` and `layers/`: every operation, for each of the three curvature spaces, with its gradients.

## What I did and what I did not

I want to be precise here, because this is the part that gets most inflated in portfolios.

The architecture was proposed by the paper *Pseudo-Riemannian Graph Convolutional Networks*. I did not invent it. What I did was study it until I understood it, implement the geometric operations, adapt the training, build the hyperparameter search and evaluate the behaviour on graph reconstruction, comparing against the Euclidean and hyperbolic cases.

That is exactly what a bachelor's thesis should be: not an original contribution to the state of the art, but the demonstration that you can read hard mathematics, implement it and measure it. The 9.9 the panel gave it is an informed opinion about that, and the thesis report is available for anyone who wants to argue with it.

## Why I put it first

Because it summarises better than anything what I do: understand a formalism, bring it down to code that runs, and not exaggerate the result. A data science portfolio full of toy models says less than one with a piece of work where the hard part was the mathematics and the honest part is separating my contribution from everyone else's.
