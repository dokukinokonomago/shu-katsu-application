import type {
  Actor,
  AuditEvent,
  MemoryCapsule,
  PrivacyScope,
  VerificationStatus,
} from "./types";
import { auditEventSchema } from "./types";

const privacyRank: Record<PrivacyScope, number> = {
  private: 0,
  trusted_family: 1,
  executor: 2,
  posthumous: 3,
  public: 4,
};

const allowedVerificationTransitions: ReadonlySet<string> = new Set([
  "raw->drafted",
  "drafted->reviewed",
  "drafted->confirmed",
  "reviewed->confirmed",
  "confirmed->reviewed",
  "disputed->reviewed",
]);

const humanRoles = new Set<Actor["role"]>(["principal", "trusted_editor"]);

export type GuardDecision = {
  allowed: boolean;
  requiresHumanConfirmation: boolean;
  reason?: string;
};

export type PacketInclusionDecision = GuardDecision & {
  warnings: string[];
};

export function isHumanActor(actor: Actor): boolean {
  return humanRoles.has(actor.role);
}

export function isPrivacyScopeWidening(from: PrivacyScope, to: PrivacyScope): boolean {
  return privacyRank[to] > privacyRank[from];
}

export function requiresConfirmationForPrivacyChange(
  from: PrivacyScope,
  to: PrivacyScope,
): boolean {
  return isPrivacyScopeWidening(from, to);
}

export function canChangePrivacyScope(
  from: PrivacyScope,
  to: PrivacyScope,
  actor: Actor,
): GuardDecision {
  if (from === to) {
    return { allowed: true, requiresHumanConfirmation: false };
  }

  const requiresHumanConfirmation = requiresConfirmationForPrivacyChange(from, to);

  if (requiresHumanConfirmation && !isHumanActor(actor)) {
    return {
      allowed: false,
      requiresHumanConfirmation,
      reason: "Only a human actor can widen privacy scope.",
    };
  }

  return { allowed: true, requiresHumanConfirmation };
}

export function canSetVerificationStatus(
  from: VerificationStatus,
  to: VerificationStatus,
  actor: Actor,
): GuardDecision {
  if (from === to) {
    return { allowed: true, requiresHumanConfirmation: false };
  }

  const transitionKey = `${from}->${to}`;

  if (!allowedVerificationTransitions.has(transitionKey)) {
    return {
      allowed: false,
      requiresHumanConfirmation: to === "confirmed",
      reason: `Verification transition ${transitionKey} is not allowed.`,
    };
  }

  if (to === "confirmed" && !isHumanActor(actor)) {
    return {
      allowed: false,
      requiresHumanConfirmation: true,
      reason: "Only a human actor can confirm a memory.",
    };
  }

  return {
    allowed: true,
    requiresHumanConfirmation: to === "confirmed",
  };
}

export function canSetConfirmed(memory: MemoryCapsule, actor: Actor): GuardDecision {
  return canSetVerificationStatus(memory.verificationStatus, "confirmed", actor);
}

export function getVerificationStatusAfterContentEdit(
  memory: MemoryCapsule,
): VerificationStatus {
  if (memory.verificationStatus === "confirmed") {
    return "reviewed";
  }

  return memory.verificationStatus;
}

export function canIncludeInLegacyPacket(memory: MemoryCapsule): PacketInclusionDecision {
  const warnings: string[] = [];

  if (memory.privacyScope === "private") {
    warnings.push("Private memories require an explicit warning before packet inclusion.");
  }

  if (memory.verificationStatus !== "confirmed") {
    warnings.push("Unconfirmed memories should be marked as draft material in packet drafts.");
  }

  return {
    allowed: true,
    requiresHumanConfirmation:
      memory.privacyScope !== "private" && memory.verificationStatus === "confirmed"
        ? false
        : true,
    warnings,
  };
}

export function canUseAsAiGrounding(
  memory: MemoryCapsule,
  purpose: "drafting" | "family_facing" | "companion_answer",
): GuardDecision {
  if (memory.privacyScope === "private" && purpose !== "drafting") {
    return {
      allowed: false,
      requiresHumanConfirmation: false,
      reason: "Private memories cannot ground family-facing or companion answers.",
    };
  }

  if (memory.verificationStatus === "confirmed") {
    return { allowed: true, requiresHumanConfirmation: false };
  }

  if (purpose === "drafting" && memory.verificationStatus !== "disputed") {
    return {
      allowed: true,
      requiresHumanConfirmation: false,
      reason: "Unconfirmed memory can only be used as clearly marked draft context.",
    };
  }

  return {
    allowed: false,
    requiresHumanConfirmation: false,
    reason: "Only confirmed memories can ground this purpose.",
  };
}

export function createAuditEvent(input: {
  id: string;
  type: AuditEvent["type"];
  actor: Actor;
  entityType: AuditEvent["entityType"];
  entityId: string;
  occurredAt: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  requiresHumanConfirmation: boolean;
  reversible: boolean;
}): AuditEvent {
  return auditEventSchema.parse(input);
}
