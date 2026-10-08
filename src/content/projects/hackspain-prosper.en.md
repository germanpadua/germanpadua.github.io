---
locale: en
slug: hackspain-prosper
title: KermitPanic · Voice Agents
summary: A voice agent to manage medical appointments, notify the corresponding doctor and keep track of everything that happens. Project developed
  for HackSpain.
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
metrics: []
highlights:
- A simulated clinic to test without consuming challenge minutes.
- Scenarios for bookings, changes, cancellations and interruptions.
- Deterministic verification of final bookings and an integration contract with the agent.
limits:
- Local evaluation with a simulated clinic that is not equivalent to the official judge.
images:
- file: kermitpanic-concept
  alt: Illustrative voice agent view and appointment confirmation.
  caption: Illustrative workflow view; example content.
---

## The challenge

At HackSpain 2026, my team built a voice agent to handle calls and manage appointments in a fictional clinic. The agent had to converse with the patient and execute the operation against the Prosper AI challenge platform.

## My contribution

I built the evaluation environment, a scenario catalogue and a comparator that verifies each field of the final booking. This let us test changes without consuming the official platform’s limited minutes and evaluate our agent’s performance.
