---
locale: en
slug: atruno
title: Atruno
summary: 'A shared space to manage properties: tasks, incidents, expenses and documents, with permissions for each family member.'
role: Design, implementation and deployment
period: July - September 2026
year: 2026
order: 6
status: shipped
visibility: case-study
featured: true
confidentiality: 'Private repository: it contains documentation of a family estate. The application has a public landing page and invitation-only
  authentication.'
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
- file: atruno-concept
  alt: 'Illustrative Atruno view: properties, tasks and documents with fictional data.'
  caption: Illustrative view based on the application; fictional data.
metrics: []
highlights:
- 'The row-level access rules live in the database, not in the application, and every table has a test with the same three-case pattern: anonymous
  user, owner of the space, and a user from another space. If the third one passes, the policy is wrong.'
- Rent charge generation and recurrences are idempotent at the database level, with unique constraints and conflicts resolved in the engine. They
  do not depend on the scheduled job running exactly once.
- 'There is a written decision to **abandon** an idea: a generic search executor that was going to lose type safety, with the compiler evidence
  that proves it. Recording an abandonment is more useful than recording a victory.'
- I deliberately excluded sensitive personal data —national ID, payslips, bank details— because the system does not need any of it for anything
  it does.
limits:
- 'There is no staging environment: migrations are applied by hand against production.'
- The README says milestones 0, 1 and 2 are complete while the roadmap marks milestone 3 closed. It is an outdated line I have not corrected yet.
- It is not a public demo. The application is multi-user and authenticated, so a visitor cannot get in and look around; what is shown are screenshots
  over fictitious data.
- The sample data is deliberately invented ("Fake Street 123", "Pilot Flat"), but the documentation describes the real scope of the estate, so
  the repository stays private.
- The free database tier can be paused for inactivity; I mitigate it with a daily scheduled job, which is a patch and not a solution.
---

## The problem

Managing family properties means sharing tasks, tracking incidents and finding scattered documents. Atruno brings that information into a shared application.

## What I built

I designed the data model and developed the application: properties, contracts, tasks, inventory, insurance and expenses. Invoice extraction combines OCR and a language model to suggest fields for review before saving.

## Using the application

Each member can access the properties and actions assigned to them. Row-level database rules enforce permissions. The project includes permission tests, form validation and interface checks.

The application has a public landing page and invitation-only access. The image in this case study is an illustrative view with fictional content.
