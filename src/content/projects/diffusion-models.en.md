---
locale: en
slug: diffusion-models
title: Diffusion models for image generation
summary: Study and implementation of diffusion models applied to car synthesis with the Stanford Cars dataset. It includes tuning an existing architecture and computing FID to compare versions.
role: Author
period: January - February 2024
year: 2024
order: 13
status: shipped
visibility: public
domains:
  - generative models
  - deep learning
  - model evaluation
stack:
  - Python
  - PyTorch
  - Jupyter
links:
  repo: https://github.com/germanpadua/Diffusion
metrics:
  - value: 3
    label: Model variants compared against each other
    basis: artifact
    source: modificacion1.ipynb, modificacion2.ipynb, modificacion3.ipynb
  - value: 0
    label: Metrics committed with their result
    basis: unverified
    source: FID is implemented and computed, but there is no report with the figures
highlights:
  - "I did not stop at running someone else's notebook: I modified layers, the training algorithm, hyperparameters and loss functions, and compared the three variants against each other."
  - I implemented the FID computation so I could compare versions with an objective metric instead of looking at samples and giving opinions.
  - I worked at the 32×32 pixel resolution, which is small and forces a close look at the balance between the architecture and the compute budget.
limits:
  - "The starting architecture is not mine: I adapted and modified an existing model. What I contribute is the experimental analysis, not the design."
  - The FID computation is implemented but there is no committed report with the values, so I cannot publish figures.
  - 32×32 is a toy resolution compared with current models; it works for studying the mechanism, not for producing useful images.
  - "There are no tests and no continuous integration: it is study work in notebooks."
  - The repository has three notebooks and a PDF, with a one-line README. The explanation is in the PDF, not where one would look for it.
---

## The interest

Diffusion models generate images by learning to reverse a noise process. The idea is elegant: an image is destroyed by adding noise step by step, and a network is trained to undo each step. Generating means starting from pure noise and walking the path backwards.

I wanted to understand that mechanism from the inside, not use a library that did it for me.

## What I did

I started from an existing implementation and modified it on four fronts: architecture layers, training algorithm, hyperparameters and loss functions. Each modification got its own notebook, so the comparison would be honest and not an average of mixed changes.

The most useful part was implementing **FID**, a metric that compares the distribution of generated images with that of real ones. Without it, evaluating a generative model reduces to looking at samples and deciding which one seems better, which is exactly what you are not supposed to do.

## What I took away

That evaluating is harder than generating. Building the model is following a paper; knowing whether version 3 is better than version 2 demands a metric, and the metric has assumptions of its own that have to be understood.

And that at 32×32 pixels you learn the mechanism but produce nothing presentable. It is a decision I made because of compute budget and would make again, as long as the statement makes clear what the exercise is for.
