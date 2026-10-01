---
locale: en
slug: agent-harness
title: Agent harness for Pi and Orca
summary: "A Pi extension that launches subagents as supervised terminals via Orca: declarative model routing, a hash-verified manifest and a diagnosis that found a duplicated language server tree."
role: Author
period: September 2026
year: 2026
order: 15
status: shipped
visibility: case-study
confidentiality: Private repository of personal tooling configuration.
domains:
  - agent orchestration
  - development tools
  - performance
stack:
  - TypeScript
  - Node.js
  - Pi extensions
  - Orca
  - Bash
metrics:
  - value: 284.20 → 9.15 ms
    label: Synthetic benchmark of 30 components by 30 frames
    basis: artifact
    source: docs/performance-diagnosis.md
  - value: 0.6 → 74 %
    label: Idle time in the V8 profile
    basis: artifact
    source: docs/performance-diagnosis.md
  - value: 10,628
    label: Profile samples, with the render loop above 80 %
    basis: artifact
    source: docs/performance-diagnosis.md
  - value: 1.1 GiB
    label: Resident memory per session, due to duplicated language server trees
    basis: artifact
    source: docs/performance-diagnosis.md
highlights:
  - "The diagnosis did not stop at intuition: a V8 profile, counted samples and an idle-time percentage before and after. The document states explicitly what the measurement does **not** prove, which is rarer than it should be."
  - "I found the cause of a memory consumption that did not add up: every session was spinning up its own tree of TypeScript language servers, instead of sharing one. Fixing it was a consequence of measuring it."
  - The subagents' tools are validated with a dedicated script, and the integrity manifest verifies by SHA-256 that the external dependencies are the ones that were reviewed.
  - "I documented a real collision: two environments register the same family of tools and the host rejects duplicate providers. The solution was not to unify them, which is what I wanted, but to understand why they could not be unified."
limits:
  - The synthetic benchmark measures components, not the full application. A 31× improvement in that test implies nothing similar in real usage, and the document itself says so.
  - Memory was measured as resident and not as shared, so the figure exaggerates real consumption when several processes share libraries.
  - The 55 °C versus 51 °C temperature figures are not causally attributed to the change and I do not present them as a result.
  - There is no continuous integration.
  - A Pi update can overwrite the local patch, so the fix is not permanent.
  - It is a niche tool for whoever orchestrates agents locally. Most people reading this will not be interested.
---

## The problem

I work with several agents at once, and the harness that launches them had ended up consuming more resources than the agents themselves. Two symptoms: the machine was heating up and the response felt slow.

## What I did

Instead of optimising by eye, I measured. A V8 profile of 10,628 samples showed that the render loop was hogging more than 80 % of the time and that the process was idle 0.6 % of it. That was not "slow": it was a badly built path being walked continuously.

The second finding was more interesting. Every session spun up its own tree of TypeScript language servers, and each one consumed around 1.1 GiB resident. The memory I was seeing did not come from the agents; it came from the tools' infrastructure.

After the fix, idle time went up to 74 % and a synthetic component benchmark dropped from 284 milliseconds to 9. The important part is what the document does **not** claim: that this is not a 31× improvement of the application, that resident memory is not shared and therefore exaggerates consumption, and that I do not attribute the temperature drop to this change.

## Why I show it

Because it is the only project where the deliverable is a diagnosis. I did not build a new tool: I understood why one I used was slow, fixed it, and wrote down what my own measurement does not prove.

That last part is the one that almost never gets written and the one that separates a technical report from a sales report.

Besides, the project documents a real fight with someone else's architecture: I wanted to unify two agent environments and it could not be done, because both register the same family of tools and the host rejects duplicate providers. The conclusion was to accept two environments and document why, which is less elegant and more useful than forcing the unification.
