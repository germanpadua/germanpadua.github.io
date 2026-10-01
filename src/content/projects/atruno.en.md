---
locale: en
slug: atruno
title: Atruno
summary: "Multi-user web application to manage several properties in a family: tasks and issues, documents, expenses, rental contracts, inventory and insurance. With row-level access rules on every table and 1402 tests."
role: Design, implementation and deployment
period: July - September 2026
year: 2026
order: 6
status: shipped
visibility: case-study
featured: true
confidentiality: "Private repository: it contains documentation of a family estate. The application has a public landing page and invitation-only authentication."
domains:
  - web applications
  - databases
  - security
  - data modelling
stack:
  - Next.js 16
  - React 19
  - TypeScript
  - PostgreSQL
  - Supabase
  - Tailwind
  - Zod
  - Vitest
  - Playwright
  - Vercel
images:
  - file: atruno-panel
    alt: "Atruno's main panel over the project's fictitious sample data: incidents, tasks and the state of each property."
  - file: atruno-gastos
    alt: "Expenses and rent charges, over the project's invented sample data."
  - file: atruno-inmuebles
    alt: "Property list and inventory, over the project's invented sample data."
metrics:
  - value: 1402
    label: Tests passing in 127.80 s
    basis: artifact
    source: reports/c5-stop-rule.md
  - value: 121
    label: Unit test files
    basis: artifact
    source: reports/c5-stop-rule.md
  - value: 32
    label: Versioned database migrations
    basis: artifact
    source: supabase/migrations/
  - value: 14
    label: Architecture decisions recorded as ADRs
    basis: artifact
    source: docs/decisions/
  - value: 0 €/month
    label: Operating cost
    basis: artifact
    source: docs/architecture.md §10
highlights:
  - "The row-level access rules live in the database, not in the application, and every table has a test with the same three-case pattern: anonymous user, owner of the space, and a user from another space. If the third one passes, the policy is wrong."
  - Rent charge generation and recurrences are idempotent at the database level, with unique constraints and conflicts resolved in the engine. They do not depend on the scheduled job running exactly once.
  - "There is a written decision to **abandon** an idea: a generic search executor that was going to lose type safety, with the compiler evidence that proves it. Recording an abandonment is more useful than recording a victory."
  - I deliberately excluded sensitive personal data —national ID, payslips, bank details— because the system does not need any of it for anything it does.
limits:
  - "There is no staging environment: migrations are applied by hand against production."
  - The README says milestones 0, 1 and 2 are complete while the roadmap marks milestone 3 closed. It is an outdated line I have not corrected yet.
  - It is not a public demo. The application is multi-user and authenticated, so a visitor cannot get in and look around; what is shown are screenshots over fictitious data.
  - The sample data is deliberately invented ("Fake Street 123", "Pilot Flat"), but the documentation describes the real scope of the estate, so the repository stays private.
  - The free database tier can be paused for inactivity; I mitigate it with a daily scheduled job, which is a patch and not a solution.
---

## The problem

Managing several properties in a family always ends the same way: a folder of invoices, a spreadsheet of expenses, a message thread where issues get lost, and nobody knowing whether the garage insurance was renewed.

Atruno puts all of that in one place, with real per-person permissions and zero operating cost.

## The decision that defines the project

The first question was where to put the security. The comfortable answer is filtering in the application: every query adds a `where` clause with the user's identifier and their space.

That works until someone adds a new query and forgets the `where`. Then the failure is not a visible error, it is a silent leak.

So the access rules are **in PostgreSQL**, on every table, enforced by the engine. The application cannot skip them, not even by accident. And because database security is hard to review by eye, every table has a test with the same pattern: anonymous user, owner of the space, and an authenticated user from **another** space. The third case is the one that matters: if an outsider sees something, the policy is badly written even if the application seems to work.

## Idempotency in the engine

Rental contracts generate a charge every month. The temptation is to do it with a scheduled job that checks whether it already exists before inserting.

The problem is that then correctness depends on the job running exactly once, and that is never guaranteed: a retry, an overlap, or a manual run duplicate charges.

The answer lives in the database: unique constraints and conflicts resolved in the engine itself. The job can run ten times and the result is the same.

## And the decision to stop

One part of the system looked up records by arbitrary filters. I designed a generic executor that built queries at runtime, and when I looked at the compiler evidence I saw it lost type checking on the filters: an invented field would have reached the database and failed there, in production, with the user waiting.

I left it out and documented it as a decision with its rejected alternative. A portfolio tells the story of the things you build; the ones you discard in time are engineering too.
