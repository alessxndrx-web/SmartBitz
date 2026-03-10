# Contribution Delivery Discipline

All meaningful implementation work (human or AI-assisted) should be delivered with this structure:

1. Analysis
2. Problems found
3. Implementation plan
4. Code changes made
5. Files modified
6. Validation steps
7. Risks / follow-ups

## Practical rules

- Prefer minimal safe changes over broad refactors.
- Keep platform-admin and tenant-app boundaries explicit.
- Never bypass tenant/RBAC protections for speed.
- Update tests and docs when behavior or architecture changes.

## Pull request expectations

- Include scope and impacted modules.
- List commands executed and observed results.
- Explicitly mention known risks, gaps, and next steps.
