---
locale: en
slug: hackspain-2026
title: HackSpain 2026, Prosper AI track
issuer: HackSpain, Madrid
kind: competition
period: 18-20 September 2026
order: 2
headline:
  value: 4th
  label: Live scoreboard at 21:36, out of 60 teams
  basis: artifact
  source: cronica/public/fotos/marcador-sabado-2136.webp
summary: 36 hours in Madrid to build a voice agent that answers a clinic's phone and makes real bookings. Team of five people; I owned the evaluation harness and the integration.
contribution: I built the fake clinic that answers over WebSocket, the 21 scenarios over 18 failure families and the deterministic field-by-field comparator, so we could iterate without burning the challenge's scored minutes.
limits:
  - "The 4th place is from the live scoreboard, not a final ranking. The organisation never published an official one and the team itself put in writing that none exists."
  - "I do not publish the points or the test count that circulate in the team's internal notes; neither has an artifact and the test counts contradict each other between files."
  - "The figures in the presentation were pilot targets, not observed results."
links:
  url: https://kermitpanic-hackspain.vercel.app/
  label: The team's chronicle
---

## What it was

HackSpain 2026, 36 hours in Madrid. More than 250 participants, 60 teams and five tracks. We chose the **Prosper AI** track: build a voice receptionist for a fictional clinic that answered calls and executed real bookings within a budget of scored minutes.

Team **KermitPanic**, five people: Hugo, José, Marina, Ginés and me.

## My part

The evaluation harness. The team's public chronicle summarises it as *"in the tests and the lab"*, and it is accurate.

The challenge platform billed the minutes, so you could not iterate against it. I built a fake clinic that answers over WebSocket just like the real one, with 21 scenarios covering 18 failure families, and a deterministic oracle that compares field by field to tell whether a booking was made correctly.

I worked against a written interface contract instead of against the code of the teammate building the agent, and that let the two of us move in parallel without waiting for each other.

## What I learned

That in a team of five the constraint is not technical capacity, it is coordination. And that a hackathon produces more claims than artifacts: re-reading our notes I found three different test counts, a result that only existed in one message, and a component under my name that never got delivered. The chronicle we published is honest; the internal notes were not, and this portfolio uses the former.
