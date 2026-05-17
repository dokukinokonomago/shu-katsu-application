import { describe, expect, it } from "vitest";
import {
  canChangePrivacyScope,
  canIncludeInLegacyPacket,
  canSetConfirmed,
  canSetVerificationStatus,
  canUseAsAiGrounding,
  createAuditEvent,
  getVerificationStatusAfterContentEdit,
  isPrivacyScopeWidening,
  memoryCapsuleSchema,
  requiresConfirmationForPrivacyChange,
  type Actor,
  type MemoryCapsule,
} from "./index";

const principal: Actor = {
  id: "actor-principal",
  role: "principal",
  displayName: "Principal",
};

const aiActor: Actor = {
  id: "actor-ai",
  role: "ai",
  displayName: "Life Companion",
};

function makeMemory(overrides: Partial<MemoryCapsule> = {}): MemoryCapsule {
  return {
    id: "memory-1",
    title: "First memory",
    summary: "A short family-readable summary.",
    body: "The full memory body.",
    memoryType: "episode",
    occurredAtText: "1980s",
    relatedPeople: [],
    emotions: ["gratitude"],
    values: ["family"],
    verificationStatus: "drafted",
    privacyScope: "private",
    unresolvedQuestions: [],
    aiInferences: [],
    createdAt: "2026-05-18T00:00:00.000Z",
    updatedAt: "2026-05-18T00:00:00.000Z",
    ...overrides,
  };
}

describe("domain schemas", () => {
  it("parses a valid memory capsule", () => {
    expect(memoryCapsuleSchema.parse(makeMemory()).id).toBe("memory-1");
  });
});

describe("verification status guards", () => {
  it("allows a principal to confirm a drafted memory with confirmation required", () => {
    const decision = canSetConfirmed(makeMemory(), principal);

    expect(decision).toEqual({
      allowed: true,
      requiresHumanConfirmation: true,
    });
  });

  it("blocks AI from confirming a memory", () => {
    const decision = canSetConfirmed(makeMemory(), aiActor);

    expect(decision.allowed).toBe(false);
    expect(decision.requiresHumanConfirmation).toBe(true);
    expect(decision.reason).toContain("Only a human actor");
  });

  it("moves confirmed memory back to reviewed after content edits", () => {
    expect(
      getVerificationStatusAfterContentEdit(
        makeMemory({ verificationStatus: "confirmed" }),
      ),
    ).toBe("reviewed");
  });

  it("rejects unsupported verification jumps", () => {
    const decision = canSetVerificationStatus("raw", "confirmed", principal);

    expect(decision.allowed).toBe(false);
  });
});

describe("privacy scope guards", () => {
  it("detects privacy widening", () => {
    expect(isPrivacyScopeWidening("private", "trusted_family")).toBe(true);
    expect(isPrivacyScopeWidening("posthumous", "private")).toBe(false);
  });

  it("requires confirmation when privacy scope expands", () => {
    expect(requiresConfirmationForPrivacyChange("private", "executor")).toBe(true);
    expect(requiresConfirmationForPrivacyChange("executor", "private")).toBe(false);
  });

  it("blocks AI from widening privacy scope", () => {
    const decision = canChangePrivacyScope("private", "trusted_family", aiActor);

    expect(decision.allowed).toBe(false);
    expect(decision.requiresHumanConfirmation).toBe(true);
  });

  it("allows narrowing privacy scope without human confirmation", () => {
    const decision = canChangePrivacyScope("posthumous", "private", aiActor);

    expect(decision).toEqual({
      allowed: true,
      requiresHumanConfirmation: false,
    });
  });
});

describe("legacy packet and AI grounding guards", () => {
  it("warns when private or unconfirmed memories are included in packet drafts", () => {
    const decision = canIncludeInLegacyPacket(makeMemory());

    expect(decision.allowed).toBe(true);
    expect(decision.requiresHumanConfirmation).toBe(true);
    expect(decision.warnings).toHaveLength(2);
  });

  it("allows confirmed trusted-family memories in packet drafts without warnings", () => {
    const decision = canIncludeInLegacyPacket(
      makeMemory({
        verificationStatus: "confirmed",
        privacyScope: "trusted_family",
      }),
    );

    expect(decision.allowed).toBe(true);
    expect(decision.requiresHumanConfirmation).toBe(false);
    expect(decision.warnings).toEqual([]);
  });

  it("allows unconfirmed memories only for draft AI context", () => {
    expect(canUseAsAiGrounding(makeMemory(), "drafting").allowed).toBe(true);
    expect(canUseAsAiGrounding(makeMemory(), "companion_answer").allowed).toBe(false);
  });

  it("allows confirmed non-private memories for companion answers", () => {
    const decision = canUseAsAiGrounding(
      makeMemory({
        verificationStatus: "confirmed",
        privacyScope: "trusted_family",
      }),
      "companion_answer",
    );

    expect(decision.allowed).toBe(true);
  });
});

describe("audit events", () => {
  it("creates an audit event for status changes", () => {
    const event = createAuditEvent({
      id: "audit-1",
      type: "verification_status_changed",
      actor: principal,
      entityType: "memory_capsule",
      entityId: "memory-1",
      occurredAt: "2026-05-18T00:00:00.000Z",
      before: { verificationStatus: "drafted" },
      after: { verificationStatus: "confirmed" },
      requiresHumanConfirmation: true,
      reversible: true,
    });

    expect(event.type).toBe("verification_status_changed");
    expect(event.requiresHumanConfirmation).toBe(true);
  });
});

