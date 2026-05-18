# Technical Foundation

この文書は、v0実装に入る前の技術選定、保存方式、AI接続方式、UI基盤、テスト方針を定義する。

## Decision Summary

v0は、Webアプリとして最小実装する。

| Area | Decision |
|---|---|
| App framework | Next.js App Router |
| Language | TypeScript |
| UI | React, Tailwind CSS, small custom components |
| Icons | lucide-react |
| Local data | IndexedDB via Dexie |
| Schema validation | Zod or equivalent runtime schema layer |
| AI integration | Provider adapter, OpenAI Responses API-compatible first |
| AI output shape | Structured JSON matching app schemas |
| Auth | Not in v0 |
| Cloud database | Not in v0 |
| External sharing | Not in v0 |
| Tests | Unit tests for domain logic, browser checks for flows |

The principle: keep v0 private, local, typed, and easy to inspect.

## Why This Stack

### Next.js App Router + TypeScript

The app needs structured routes, a real browser UI, API route support for AI calls, and a path to future deployment. Next.js App Router provides a stable application shell for this without requiring a separate backend in v0.

Use TypeScript from the beginning because this product depends on precise state boundaries: `verification_status`, `privacy_scope`, AI inference separation, and audit events should not be informal strings spread across the UI.

### Local-First IndexedDB

The app handles personal memories, family context, end-of-life wishes, and possibly sensitive documents later. v0 should not require cloud storage or accounts.

Use IndexedDB through Dexie for v0 because it gives browser-local persistence without running a server database. This keeps early testing private and avoids premature account, sync, and access-control complexity.

Tradeoffs:

- Good: no backend required, private by default, works for prototypes.
- Good: enough structure for Memory Capsules, People, Packets, and Audit Events.
- Limitation: no multi-device sync.
- Limitation: browser storage can be cleared by the user or browser policy.
- Limitation: backup/export must be designed before real use.

### AI as Optional Adapter

AI must be a replaceable service, not the center of the app. The core app should work without AI.

AI responsibilities in v0:

- draft summaries
- suggest titles
- extract people, emotions, values
- generate unresolved questions
- draft family-facing packet text

AI must not:

- set `confirmed`
- expand `privacy_scope`
- send, share, publish, or delete
- speak as if it is the person
- make legal, medical, tax, or financial determinations

## Architecture Layers

```text
app/
  routes and screens

components/
  reusable UI components

lib/domain/
  Memory Capsule, Person, Packet, Audit types and state rules

lib/db/
  Dexie database, repositories, import/export

lib/ai/
  provider adapter, prompts, structured output schemas

lib/privacy/
  privacy scope rules, confirmation guards

lib/audit/
  AuditEvent creation and query helpers
```

Do not put domain rules only inside React components. State transitions and privacy rules must live in domain helpers that can be tested.

## Proposed Route Map

```text
/
/onboarding
/onboarding/profile
/onboarding/purpose
/onboarding/memory
/onboarding/review
/memories
/memories/[id]
/timeline
/people
/people/[id]
/graph
/packets
/packets/[id]
/settings
```

Route groups can be adjusted during implementation, but v0 should keep the main product surfaces visible and simple.

## Data Model Ownership

The source of truth for data shapes should be TypeScript schemas in `lib/domain/`.

Initial objects:

```text
PrincipalProfile
LifeCompanionSettings
MemoryCapsule
Person
LegacyPacketDraft
AuditEvent
AiInference
```

Rules:

- UI imports domain types.
- Database repositories store and retrieve domain objects.
- AI output is parsed into draft domain objects, never trusted directly.
- `AuditEvent` is created by domain operations, not manually scattered through UI code.

## State Guards

Implement explicit helpers for dangerous transitions.

Required guards:

```text
canSetConfirmed(memory, actor)
canChangePrivacyScope(from, to, actor)
requiresConfirmationForPrivacyChange(from, to)
canIncludeInLegacyPacket(memory)
canUseAsAiGrounding(memory, purpose)
```

Required behavior:

- `drafted -> confirmed` requires a user action.
- `confirmed -> reviewed` occurs when confirmed content is edited.
- narrower privacy changes can happen immediately.
- wider privacy changes require confirmation.
- `private` memories included in packet drafts show warnings.
- no external sharing exists in v0.

## Persistence

Use Dexie stores for v0.

Suggested tables:

```text
principalProfiles
companionSettings
memoryCapsules
people
legacyPacketDrafts
auditEvents
appSettings
```

Repository functions should be narrow:

```text
createMemoryCapsule(input)
updateMemoryCapsule(id, patch)
setMemoryVerificationStatus(id, status)
setMemoryPrivacyScope(id, scope)
listMemories(filter)
getMemory(id)
createAuditEvent(event)
```

Do not allow arbitrary UI code to mutate IndexedDB directly.

## AI Integration

Use a provider adapter so that the app is not locked to one model provider.

```text
lib/ai/
  adapter.ts
  schemas.ts
  prompts/
    memory-draft.ts
    packet-draft.ts
```

Adapter interface:

```ts
export interface AiAdapter {
  draftMemory(input: DraftMemoryInput): Promise<DraftMemoryOutput>;
  draftLegacyPacket(input: DraftPacketInput): Promise<DraftPacketOutput>;
}
```

For OpenAI-compatible implementation, use structured outputs so the returned data can be parsed into known fields before it touches app state.

AI request boundaries:

- Send only the text needed for the current draft.
- Do not send private unrelated memories as context.
- Show that AI was used.
- Store AI output under `ai_inferences` or draft fields.
- Let the user edit before saving as reviewed or confirmed.

API keys must never be stored in client-side code. If AI is enabled, use a server route and environment variable.

## UI Foundation

The UI should feel quiet, clear, and work-focused.

V0 UI priorities:

- readable typography
- clear status badges for `drafted`, `reviewed`, `confirmed`
- clear privacy badges for `private`, `trusted_family`, `executor`, `posthumous`
- high-contrast action buttons for confirm/save/cancel
- visible warnings before wider privacy changes
- no decorative 3D in v0
- no cards inside cards
- no marketing landing page as the primary app screen

Use cards only for repeated items, detail panels, and modal-like surfaces. Onboarding and workspace pages should be full-width layouts with constrained content.

## Testing Strategy

V0 testing should focus on safety-critical behavior before visual polish.

Unit test:

- verification status transitions
- privacy scope widening and narrowing
- packet inclusion warnings
- AI output parsing
- audit event creation

Integration/browser check:

- onboarding creates a profile
- onboarding creates a Memory Capsule
- status and privacy are required
- confirmed memories show differently from drafted memories
- editing confirmed memory returns it to reviewed
- packet draft shows privacy warnings

Manual visual check:

- desktop viewport
- mobile viewport
- text does not overflow buttons or cards
- status and privacy badges remain readable

## Environment

Expected local commands after app scaffold:

```sh
npm run dev
npm run lint
npm run typecheck
npm test
```

If the scaffold uses another package manager, update this section and `docs/workflow.md`.

Environment variables:

```text
OPENAI_API_KEY
```

Do not require `OPENAI_API_KEY` for the app to boot. AI features should show a disabled or manual mode when the key is absent.

## Deployment Stance

V0 can run locally and can be deployed for UI review with fake or test data.

Do not run a real-user production deployment until these exist:

- account model
- backup/export
- privacy review
- encryption strategy
- clear data deletion policy
- external sharing confirmation flow

## References Checked

These references informed the technical direction as of 2026-05-17:

- [Next.js App Router docs](https://nextjs.org/docs/app), [Next.js TypeScript docs](https://nextjs.org/docs/app/api-reference/config/typescript), and [create-next-app installation docs](https://nextjs.org/docs/app/getting-started/installation).
- [React TypeScript docs](https://react.dev/learn/typescript).
- [Dexie docs](https://dexie.org/docs) for IndexedDB-backed local browser storage.
- [OpenAI Responses API reference](https://platform.openai.com/docs/api-reference/responses) and [Structured Outputs guide](https://platform.openai.com/docs/guides/structured-outputs).

## Next Implementation Sequence

After this document is accepted:

1. Build static onboarding screens.
2. Wire onboarding to local persistence.
3. Add Memory List and Memory Detail.
4. Add Timeline and People views.
5. Add Legacy Packet Draft.
6. Add minimal AI adapter behind a feature flag.
