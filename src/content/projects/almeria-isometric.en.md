---
locale: en
slug: almeria-isometric
title: Almería Isometric
summary: An isometric map of Almería built from real public data —PNOA LiDAR, orthophoto and Cadastre— where AI only decides what surfaces look like. Geometry is imposed by the data, not by the model.
role: Design and implementation of the full pipeline
period: September 2026
year: 2026
order: 5
status: in-progress
visibility: case-study
featured: true
confidentiality: "Local project: it has no remote repository or published viewer yet."
domains:
  - geospatial data
  - 3D rendering
  - generative AI
  - pipeline engineering
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
    alt: "Isometric view of Almería rebuilt from LiDAR and Cadastre, with the monuments labelled and the pipeline stage selector along the bottom."
metrics:
  - value: 2.19 pts/m²
    label: Density of the LiDAR used as source of truth
    basis: artifact
    source: docs/historico/estado-auditado-2026-09-16.md
  - value: 97.2 %
    label: Horizontal coverage of 1 m²
    basis: artifact
    source: docs/historico/estado-auditado-2026-09-16.md
  - value: 26°
    label: Camera elevation chosen, out of 35.264°
    basis: artifact
    source: comparison of 51.7 % versus 42.5 % visible facade
  - value: 96 m
    label: Tile size, with resumable per-tile state
    basis: artifact
    source: almeria/teselas/
  - value: 4 / 16
    label: Completed requests and images generated
    basis: artifact
    source: data/cuota_registro.jsonl
  - value: 0
    label: Approved v5 variants
    basis: artifact
    source: data/experimentos/catedral-v5/evaluacion.json
highlights:
  - The project's rule is that fidelity is enforced with data, not requested from the AI. Geometry comes from the LiDAR and the Cadastre; the generative model only picks what a surface looks like.
  - Every specification the LLM produces goes through a bounded grammar, so a hallucination is rejected before it reaches the render instead of ruining the result.
  - The pipeline is five resumable stages with per-tile state, so an interrupted run continues where it left off instead of starting over.
  - "Camera elevation was chosen by measuring: at 26° you see 51.7 % of facade, against 42.5 % at 35.264°. The classic isometric angle shows less building."
  - I later ran an audit that invalidated my own earlier conclusions. It is documented as such, and it is the part of the project I am proudest of.
limits:
  - No tile has been approved and no seam validated. The project works in parts and does not yet produce a complete publishable result.
  - "Aerial LiDAR does not resolve facades: the height is there, the vertical detail is not. It is a limitation of the source, not of the method."
  - All four v5 variants were rejected in evaluation. The quota log shows 4 completed requests out of a generous feasibility budget, and I did not spend more because the quota is 100 requests per month.
  - Seams between tiles are the main risk and are not solved.
  - "The viewer could be published as is, but it is not published, and the project has no remote repository: it exists only locally."
  - The monuments' text comes from Wikipedia and the photos from Wikimedia Commons, with CC BY-SA 4.0 attribution. It is not my own content.
---

## The idea

Image generators make pretty cities that do not exist. LiDAR and the Cadastre describe cities that do exist with centimetre precision, but they look like point clouds.

Almería Isometric attempts the opposite of the usual: **use the data to impose the shape and the AI to choose only the appearance.** Every building is where it is, with the height it has. What the model decides is whether that facade looks whitewashed, brick, or under construction.

It is a distinction that seems minor and is not. If geometry comes from the model, the result is an illustration. If it comes from the data, it is a map.

## How it works

Five chained stages. The data is downloaded and co-registered: LiDAR, orthophoto, cadastral footprints and OSM. From that comes a digital surface model, which is what makes it possible to know what is visible and what is hidden from the camera. Then the scene is extracted and turned into a structured specification with a bounded grammar. That specification goes to appearance generation. And finally it is tiled into 96-metre pieces served as pyramids for the viewer.

Every stage stores its state per tile. When a run dies halfway through —and it dies, because LiDAR is slow— it resumes where it left off.

Occlusion is solved with ray tracing over the surface model, not with Blender's z-buffer. I needed to know which facades are actually visible to decide where it is worth spending a generation request, and that information has to exist before the render.

## The decisions that cost the most

**Camera elevation.** Classic isometric uses a 35.264° angle. I measured it and it shows less facade than 26°, so I broke with convention and argued why. An isometric map that does not read as strict isometric is a price I paid deliberately.

**Not using the orthophoto as reference for the generative model.** I tried it and it contaminates the result: the model copies the photo instead of reinterpreting the surface. It is documented as a decision and as a correction of an earlier decision.

**Rejecting all four v5 variants.** None passed evaluation, and instead of picking the least bad one and presenting it, it was recorded that there is no approved result. A portfolio project that shows its own rejection is more credible than one that shows only what went well.

## Current state

Incomplete, and I say so on the card. There is a working viewer, there is reconstructed geometry, there are measured decisions and there is an honest record of what was rejected. There is no finished city.
