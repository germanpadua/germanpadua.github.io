---
locale: en
slug: piso-irene
title: Floor plan and renovation editor in 3D
summary: "Apartment editor that runs in the browser offline: 2D floor plan, 3D build-up with furniture, natural light hour by hour and first-person walkthrough. All in a single HTML file."
role: Complete design and implementation
period: September 2026
year: 2026
order: 12
status: in-progress
visibility: case-study
confidentiality: It contains the floor plan of a real home. It will not be published until it is replaced with a synthetic plan.
domains:
  - 3D graphics
  - local tools
  - computational geometry
  - PWA
stack:
  - JavaScript ESM
  - Three.js
  - esbuild
  - Cloudflare Workers
  - happy-dom
  - PWA
metrics:
  - value: 11
    label: Test files
    basis: artifact
    source: tests/
  - value: 38.046
    label: PDF points per metre at the plan's scale
    basis: artifact
    source: LEEME.md
  - value: 1
    label: Portable HTML file with the editor and the plan inside
    basis: artifact
    source: "Piso Irene 3D.html"
highlights:
  - "The whole editor fits in a single HTML file that opens with a double click, no installation and no connection. That requirement shaped the entire architecture and it was the right one: the tool had to work on a construction site with no signal."
  - Solar orientation is computed hour by hour, so you can see whether the renovation leaves the kitchen in the dark at nine in the morning before moving a wall.
  - "The walkthrough mode is first-person and with collision, not an orbit around a model: you go in and you walk."
  - The public deployment sits behind a Cloudflare Worker with a password and an HMAC-signed cookie, precisely because the content is private.
  - The plan's scale is derived from the PDF points, not eyeballed, and the discrepancy of 6.99 points between the two versions of the plan is documented as such.
limits:
  - "It cannot be published as it is. The source plans, the screenshots of current state and renovation, and the exported project carry the real home inside, with the address in the starting file's name. A real floor plan is not anonymised by shifting one coordinate: the assets have to be redone."
  - The plan to publish it is to replace the apartment with a synthetic plan of equivalent layouts and regenerate every screenshot. It is pending.
  - "It is not a technical execution plan: it does not check stairs, doors or habitability, and it is not valid for applying for a building permit."
  - Floors and walls are placed separately, so both have to be adjusted.
  - The data lives in the browser's local storage, with no server. iOS can wipe it, and the backup is a JSON file that has to be exported by hand.
---

## The problem

Renovating an apartment means answering questions nobody answers for you until it is already done: does the sofa fit?, is there room for a table for four?, at what time does the sun come in?, can you see the TV from the kitchen?

Hiring a studio for a neighbourhood apartment makes no sense. And the existing applications want an account, need a connection, and never make clear what is stored where.

## The constraint that defined the design

The whole editor had to fit in **a single HTML file** that opens with a double click, no server and no connection.

That constraint looks like a limitation and it is the feature. You work on it at home on Sunday, carry the file on your phone to the site, and open it where there is no coverage. Nothing to install, nothing to sync, nothing to explain to anyone.

Meeting it forced me to bundle the modular sources into a single bundle with esbuild, to store data in the browser's local storage instead of a backend, and to write the geometry by hand instead of leaning on server-side utilities.

## What it does

The floor plan is drawn in 2D —walls, rooms, doors, windows, dimensions— over the image of the original plan, with the scale derived from the PDF points so the measurements are real and not a visual approximation.

That plan is built up in 3D with parametric furniture. Over it, natural light is simulated **hour by hour** according to orientation, which is the feature that changed decisions the most: seeing the living room in the dark at nine in the morning is more convincing than any advice.

And you can go in and walk around, first-person and with collision, to check whether the gap between the bed and the wardrobe is enough to pass through.

It exports to GLB, to PNG, to a dimensioned plan for printing, and to a text package meant to be pasted to an assistant when a second opinion is needed.

## Why it is not published

Because it contains a real person's home, with their address in the original plan file's name and the exact measurements of every room.

A floor plan is not anonymised by moving a coordinate: the image **is** the data. Publishing it requires designing a fictitious apartment with an equivalent layout, regenerating the model and taking all the screenshots again. It is pending work, not a cleanup detail, and until it is done the project stays as a case-study card.

It is a shame, because technically it is the most eye-catching thing I have: a floor plan editor with a walkthrough mode in a single file sounds like an exaggeration until someone opens it.
