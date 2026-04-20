# Bugs

Track active production issues here. Keep entries short and update status as fixes ship.

## Open

1. Sorting can show generic failure copy
- Reported: 2026-04-20
- Symptom: Kids see "Hmm, let us try that again." when sorting instead of a specific reason.
- Status: In progress
- Notes: Error mapping has been expanded; monitor production logs and user reports.

2. No quest management controls
- Reported: 2026-04-20
- Symptom: Quest board exists but parents cannot manage or configure quests.
- Status: Open (feature gap)
- Notes: Define quest model (create/edit/archive) and parent UI.

3. Manual top-up and profile changes can crash with Server Components render error
- Reported: 2026-04-20
- Symptom: Production shows generic "An error occurred in the Server Components render" after form submissions.
- Status: In progress
- Notes: Added action hardening and store corruption recovery. Validate on production after deploy.

## Recently fixed

1. Child profile deletion missing
- Reported: 2026-04-20
- Fixed: 2026-04-20
- Notes: Added delete action, store cleanup, and admin UI delete button.
