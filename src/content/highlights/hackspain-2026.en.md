---
locale: en
slug: hackspain-2026
title: HackSpain 2026, Prosper AI track
issuer: HackSpain, Madrid
kind: competition
period: 18-20 September 2026
order: 2
summary: 36 hours in Madrid to build a voice agent that answers a clinic's phone and makes real bookings. Team of five people.
contribution: I built the fake clinic for testing, the 21 scenarios across 18 failure families and the deterministic field-by-field comparator, so we could iterate without burning the challenge's scored minutes.
links:
  url: https://kermitpanic-hackspain.vercel.app/
  label: The team's chronicle
---

## What it was

HackSpain 2026, 36 hours in Madrid. More than 250 participants, 60 teams and five tracks. We chose the **Prosper AI** track: build a voice receptionist for a fictional clinic that answered calls and executed real bookings within a budget of scored minutes.

Team **KermitPanic**, five people: Hugo, José, Marina, Ginés and me.

## My part

The challenge platform did not work entirely reliably, so we could not iterate against it. I built a fake clinic that answers over WebSocket just like the real one, with 21 scenarios, and a deterministic oracle that compares field by field to tell whether a booking was made correctly.

I worked against a written interface contract instead of against the code of the teammate building the agent, and that let the two of us move in parallel without waiting for each other.

## What I learned

That in a team of five the constraint is not technical capacity, it is coordination.
