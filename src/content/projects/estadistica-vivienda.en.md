---
locale: en
slug: estadistica-vivienda
title: Foundations of statistics and classical learning
summary: 'Four assignments from the statistics part of my double degree: classification, segmentation of a real survey, housing price regression
  and multivariate analysis with principal components and factor analysis in R.'
role: Author
period: 2023 - 2024
year: 2024
order: 14
status: shipped
visibility: public
domains:
- applied statistics
- classical learning
- exploratory analysis
stack:
- R
- R Markdown
- Python
- scikit-learn
- KNIME
- Jupyter
links:
  repo: https://github.com/germanpadua/IN-P2
metrics: []
highlights:
- 'They are the four classic problems, one each: supervised classification, unsupervised segmentation, regression and dimensionality reduction.
  Each technique was applied to a different dataset and defended with its own report.'
- For the segmentation I worked on a real voting-intention survey, which forces every clustering to be justified in terms that can be explained,
  not only in a cohesion metric.
- In the multivariate analysis I used R to study normality, outliers and latent structure with principal components and factor analysis, which
  is the part of statistics that holds up everything else.
- 'They are here precisely because they are the foundations: without this, the rest of the projects would be models with no criteria to tell whether
  they are right.'
limits:
- 'It is coursework, and I do not dress it up: they are academic deliverables with their problem statement, not projects with a user behind them.'
- One of them is only KNIME visual workflows, with no code that can be read. It is a legitimate tool and a far less verifiable deliverable.
- The multivariate analysis repository weighs 122 MB because of versioned input data. Same flaw as F1 Data App.
- There are no tests, because the deliverable is a report in HTML or PDF, not a library.
- The notebooks have no useful README; the context is in the attached PDFs.
---

## What they are

Four assignments from the statistics part of my double degree, each one about a different family of problem:

**Supervised classification.** Comparing classification algorithms and justifying the choice by their behaviour, not by their popularity.

**Unsupervised segmentation.** Clustering a real voting-intention survey published in November 2023. The interesting part is not the algorithm, it is that every cluster has to be explainable: a partition that is coherent according to the metric and makes no political sense is not acceptable.

**Regression.** Predicting the price of a home and analysing which variables carry the explanatory power.

**Multivariate analysis in R.** Studying normality, outliers and latent structure on a housing database, applying principal components and factor analysis.

## Why I include them

Because they are the foundations, and a data science portfolio that only shows neural networks and voice agents is telling half the story.

Everything I do afterwards rests on this: knowing whether a variable is normal, why correlation does not imply structure, what it means for a component to explain 60 % of the variance, and why one outlier can ruin a model trained on squared error.

## What they are not

They are not projects with users. They are academic deliverables with their problem statement, their deadline and their report, and I say so on the card itself because a recruiter who opens them is going to see a PDF and a list of columns.

One of them is not even code: they are KNIME visual workflows. It is a legitimate tool in analytics and a deliverable that cannot be reviewed by reading, which is exactly why I prefer notebooks when I have a choice.
