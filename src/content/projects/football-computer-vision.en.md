---
locale: en
slug: football-computer-vision
title: Football analysis with computer vision
summary: Player, referee and ball detection on match video with YOLOv8, team identification, trajectory tracking with distance and speed, and position heat maps.
role: Author
period: September 2024
year: 2024
order: 11
status: shipped
visibility: public
domains:
  - computer vision
  - multi-object tracking
  - sport
stack:
  - Python
  - YOLOv8
  - OpenCV
  - supervision
  - Roboflow
  - Jupyter
links:
  repo: https://github.com/germanpadua/Football-Computer-Vision
metrics:
  - value: 2
    label: "Trained detectors: players and pitch keypoints"
    basis: artifact
    source: train_player_detector.ipynb, train_pitch_keypoint_detector.ipynb
  - value: 3
    label: Notebooks, not packaged into modules
    basis: artifact
    source: repository
highlights:
  - The homography from the pitch keypoints is what turns pixels into metres, and without it distances and speeds mean nothing. It is the step that separates a demo from an analysis.
  - I trained the pitch keypoint detector because a generic object model cannot tell the lines of a football pitch apart from any other lines.
  - "Per-player position heat maps are the view that makes the tracking legible: a table of coordinates says nothing, a map says where each one plays."
limits:
  - It is three notebooks, not a system. There are no tests, no continuous integration and no installable package.
  - There is no committed accuracy metric. The trained weights are not in the repository either, so the result cannot be reproduced without retraining.
  - The README explains nothing. A visitor who opens the repository has no idea what to look at.
  - Tracking works well on wide shots and degrades as soon as there is heavy occlusion, which in a match happens constantly.
---

## What it does

It takes a match video and extracts three things: where every player is, which team they belong to, and how much and how they moved. On top of that it builds position heat maps and distance and speed statistics.

## What actually has merit, and what does not

The interesting part of the project is the **homography**. A football camera does not look at the pitch from above or from a constant angle: it looks from a stand. To go from pixels to metres you have to estimate the transformation between the image plane and the pitch plane, and for that you need recognisable keypoints.

I trained a detector for those keypoints because generic models cannot distinguish the lines of a football pitch from any other lines. With the homography solved, distance covered and speed become metres and metres per second instead of pixels.

What has no merit is presenting it as a system. They are notebooks: the detection is solved, the engineering around it does not exist, and there is not a single metric I can show. A model that cannot be retrained because the weights are not in the repository is not reproducible, it is a screenshot with code.

## What I learned

That in computer vision 80 % of the work is preparing the data and 20 % is the model, and that this split never shows in tutorials because tutorials start with the dataset already prepared.

And that a portfolio project without numbers does not convince anyone, however good the visual result. This one is in my portfolio precisely for that reason: it shows what I know how to do and shows, with no dressing up, how far I got.
