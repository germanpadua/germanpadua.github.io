---
locale: en
slug: hackspain-prosper
title: KermitPanic at HackSpain 2026
summary: A voice agent for medical appointments. In the KermitPanic team I built the evaluation environment and integration with the hackathon
  platform.
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
metrics: []
highlights:
- A simulated WebSocket clinic to test without consuming challenge minutes.
- Scenarios for bookings, changes, cancellations and interruptions.
- Deterministic verification of final bookings and an integration contract with the agent.
limits:
- Local evaluation with a simulated clinic; not the official judge.
- The live event leaderboard is not an official final ranking.
images:
- file: kermitpanic-concept
  alt: Illustrative voice agent view and appointment confirmation.
  caption: Illustrative workflow view; example content.
---

## The challenge

At HackSpain 2026, the KermitPanic team built a voice agent to handle calls and manage appointments in a fictional clinic. The agent had to converse with the patient and execute the operation against the challenge platform.

## My contribution

I built the evaluation environment: a simulated WebSocket clinic, a scenario catalogue and a comparator that verifies each field of the final booking. This let us test changes without consuming the platform’s limited minutes.

I also worked on agent integration, using an interface contract so the agent and evaluator could be developed in parallel. Scenarios included changes of mind, interruptions, silence and availability conflicts.

## Teamwork

The public chronicle documents the team’s route from the initial idea to the prototype and tests. It gives context for the complete project, division of work and decisions during the event.
