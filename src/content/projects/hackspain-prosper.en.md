---
locale: en
slug: hackspain-prosper
title: KermitPanic at HackSpain 2026
summary: "Voice agent for a fictional clinic: answers the phone, negotiates appointments and books for real on the challenge platform. 36 hours, five people and an evaluation harness so as not to depend on the official scoreboard."
role: Evaluation harness and integration
period: 18-20 September 2026
year: 2026
order: 4
status: shipped
visibility: public
featured: true
domains:
  - voice agents
  - LLMs
  - evaluation
  - teamwork
stack:
  - Python
  - FastAPI
  - pipecat
  - Gemini Live
  - Twilio Media Streams
  - Next.js
  - Astro
  - Fly.io
links:
  repo: https://github.com/rh45-one/hackspain-kermit-prosper
  demo: https://kermitpanic-hackspain.vercel.app/
team:
  name: KermitPanic
  size: 5
  contribution: The complete evaluation harness, the integration between the agent and the challenge platform, and the technical documentation.
metrics:
  - value: 21
    label: Scenarios in the harness, over 18 failure families
    basis: artifact
    source: evaluator/
  - value: 4º
    label: Position on the live scoreboard, Saturday 21:36
    basis: artifact
    source: cronica/public/fotos/marcador-sabado-2136.webp
  - value: 36 h
    label: Duration of the hackathon
    basis: artifact
    source: prueba/scoring.md
  - value: 60
    label: Teams across five tracks
    basis: record
    source: the team's chronicle, chapter 1
highlights:
  - "The harness is not a unit test: it is a full fake clinic that answers over WebSocket, with a scenario oracle that verifies call by call whether the booking ended up right, so as not to spend the challenge's limit of scored minutes."
  - The comparator is deterministic and field by field, so a failure can be attributed to a specific field instead of to "the agent did badly".
  - It makes it possible to iterate without the official platform in front of you, which is what makes improving 18 families of scenarios in 36 hours possible.
  - "I worked against a written interface contract, not against someone else's code: the document fixes what the agent returns and what the evaluator expects, and that let two people move in parallel without stepping on each other."
limits:
  - "I do not publish the figure of 412 tests that appears in our notes: it only exists in prose and the same repository contains 415, 418 and 533 in other files. A number I cannot point at does not go in."
  - The "71 points, 4th, leader 76" from 16:45 only exists in prose. There are committed screenshots from 13:04, 14:13 and 21:36; there is none from that time. I publish the 4th with the 21:36 screenshot and say where it comes from.
  - "The organisation never published a final ranking: the team itself wrote down that \\\"there is no official position on record\\\". The 4th is from the live scoreboard, not from the final result."
  - The harness produces a local estimate and is not the official judge. Its figures do not explain the challenge scoreboard.
  - The figures from the presentation (94.4 %, 82 %, zero leaks) were pilot targets, not observed results. I do not publish them as measurements.
  - The Voice Lab run of 120 cases was simulated and saved to /tmp, never committed.
  - The slot optimiser that the interface contract attributes to my name was left out of scope and was not delivered. I do not claim it.
---

## The challenge

A fictional clinic receives calls from patients who want to book, change or cancel an appointment. The goal was a voice agent that would handle them from start to finish and actually execute the booking against the challenge platform, within a limit of minutes that were being billed.

The interesting part is not that the agent talks. It is that the actions it promises have to exist afterwards.

## My part

Out of the five of us, I carried the **evaluation harness**. The team's public chronicle sums it up as "the testing and the laboratory", and that is accurate.

The problem was concrete: the challenge platform limited the scored minutes, so you could not iterate against it. I built a fake clinic that answers over WebSocket just like the real one, with a catalogue of scenarios covering 18 failure families — a patient who changes their mind mid-sentence, two people who want the same slot, an impossible date, an interruption, silence — and an oracle that checks, field by field, whether the final booking matches the one the scenario expected.

Deterministic on purpose: a fuzzy comparator would have made it impossible to know whether an iteration improved something or just changed the noise.

And I worked against a **written interface contract** instead of against Ginés's code. The document fixes what the agent exposes and what the evaluator consumes. That let the agent's development and the laboratory's move in parallel without either having to wait for the other or read the other's code daily.

## What I learned in 36 hours

That in a team of five the constraint is not technical capacity, it is coordination. And that a written contract is worth more than a meeting.

And something less pleasant: that a hackathon generates more claims than artifacts. When I reread our notes I found three different test figures, a result that only existed in a message, and a component in my name that was never delivered. The chronicle we published is honest; the internal notes are not. This portfolio uses the former.
