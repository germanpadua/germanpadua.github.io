---
locale: en
slug: f1-data-app
title: F1 Data App
summary: 'A published web application that analyses Formula 1 races and qualifying sessions from the public Ergast and FastF1 APIs: the grid,
  lap times, position evolution and pace distribution.'
role: Author
period: March - August 2024
year: 2024
order: 10
status: shipped
visibility: public
domains:
- data analysis
- visualization
- sports domain
stack:
- Python
- Streamlit
- FastF1
- Ergast
- pandas
- Plotly
links:
  repo: https://github.com/germanpadua/F1-Data-App
metrics: []
highlights:
- 'It is the project that led me to understand that the hard part of a data application is the gaps in the source: laps deleted by race control,
  cars that retire mid-lap and sessions with a different format depending on the season.'
- The application is built on the public APIs, with no proprietary data, and published so it can be used without installing anything.
- The lap-by-lap position evolution is the view that works best for explaining a race, and it is not the one people ask for most.
limits:
- The repository weighs 732 MB because `cache/` and `data/` are versioned. It is a hygiene defect, not a decision, and it has to be cleaned up
  before showing it off.
- The Streamlit Cloud deployment redirects to a login screen, so today it is not a real public demo. Either I open it up or I do not link it as
  a demo.
- It has no tests and no continuous integration. It is a notebook turned into an application, and it shows.
- The dependencies were last updated in August 2024, so it may not start as-is with the current versions of FastF1.
- 'No useful README: the application explains itself or it does not get explained.'
---

## What it is

A web application that takes public Formula 1 data and turns it into something you can look at: the starting grid, the qualifying times, how the order changed lap by lap, and how the pace of each car was distributed.

I built it because I wanted to know things the broadcasts do not tell you, and it ended up being the project with which I learned to fight with real public APIs.

## What I learned

Public F1 data looks clean and is not. There are laps that race control voids, cars that retire mid-lap, sessions that arrive in a different format depending on the season, and gaps in the telemetry that are documented nowhere.

None of that appears in a tutorial. It appears when you are two weeks in, the view of a specific Grand Prix breaks, and you do not know why.

I also learned that the visualization that cost me the most is the one that gets used the least: the lap-by-lap position evolution explains a race better than any table, and it is not the one people reach for first.

## What I would not do the same way

Versioning `cache/` and `data/`. The repository weighs 732 MB because of data that can be downloaded again, and a public repository that size is a bad signal on a profile, regardless of what it contains.

And leaving it as a notebook. I turned it into an application and did not give it a single test, because "it is just a demo". It now has two-year-old dependencies and I do not know whether it starts without touching anything, which is exactly what happens when a demo is not cared for.
