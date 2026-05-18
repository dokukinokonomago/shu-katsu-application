import type { Table } from "dexie";
import {
  canChangePrivacyScope,
  canSetVerificationStatus,
  createAuditEvent,
  getVerificationStatusAfterContentEdit,
  memoryCapsuleSchema,
  type Actor,
  type AuditEvent,
  type MemoryCapsule,
  type PrivacyScope,
  type VerificationStatus,
} from "@/lib/domain";
import { db, type LifeMemoryDatabase } from "./database";

type MemoryPatch = Partial<
  Omit<
    MemoryCapsule,
    "id" | "createdAt" | "updatedAt" | "verificationStatus" | "privacyScope"
  >
>;

export type MemoryListFilter = {
  verificationStatus?: VerificationStatus;
  privacyScope?: PrivacyScope;
};

function createId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function getNow(): string {
  return new Date().toISOString();
}

function createStatusAuditEvent(input: {
  actor: Actor;
  memoryId: string;
  occurredAt: string;
  before: VerificationStatus;
  after: VerificationStatus;
  requiresHumanConfirmation: boolean;
  reason?: string;
}): AuditEvent {
  return createAuditEvent({
    id: createId("audit"),
    type: "verification_status_changed",
    actor: input.actor,
    entityType: "memory_capsule",
    entityId: input.memoryId,
    occurredAt: input.occurredAt,
    before: { verificationStatus: input.before },
    after: { verificationStatus: input.after },
    reason: input.reason,
    requiresHumanConfirmation: input.requiresHumanConfirmation,
    reversible: true,
  });
}

function createPrivacyAuditEvent(input: {
  actor: Actor;
  memoryId: string;
  occurredAt: string;
  before: PrivacyScope;
  after: PrivacyScope;
  requiresHumanConfirmation: boolean;
  reason?: string;
}): AuditEvent {
  return createAuditEvent({
    id: createId("audit"),
    type: "privacy_scope_changed",
    actor: input.actor,
    entityType: "memory_capsule",
    entityId: input.memoryId,
    occurredAt: input.occurredAt,
    before: { privacyScope: input.before },
    after: { privacyScope: input.after },
    reason: input.reason,
    requiresHumanConfirmation: input.requiresHumanConfirmation,
    reversible: true,
  });
}

export class MemoryCapsuleRepository {
  constructor(private readonly database: LifeMemoryDatabase = db) {}

  async createMemoryCapsule(
    input: Omit<MemoryCapsule, "createdAt" | "updatedAt"> &
      Partial<Pick<MemoryCapsule, "createdAt" | "updatedAt">>,
    actor: Actor,
  ): Promise<MemoryCapsule> {
    const now = getNow();
    const memory = memoryCapsuleSchema.parse({
      ...input,
      createdAt: input.createdAt ?? now,
      updatedAt: input.updatedAt ?? now,
    });

    const auditEvent = createAuditEvent({
      id: createId("audit"),
      type: "memory_created",
      actor,
      entityType: "memory_capsule",
      entityId: memory.id,
      occurredAt: now,
      after: memory,
      requiresHumanConfirmation: false,
      reversible: true,
    });

    await this.database.transaction(
      "rw",
      this.database.memoryCapsules,
      this.database.auditEvents,
      async () => {
        await this.database.memoryCapsules.add(memory);
        await this.database.auditEvents.add(auditEvent);
      },
    );

    return memory;
  }

  async updateMemoryCapsule(
    id: string,
    patch: MemoryPatch,
    actor: Actor,
  ): Promise<MemoryCapsule> {
    const existing = await this.getRequiredMemory(id);
    const now = getNow();
    const nextVerificationStatus = getVerificationStatusAfterContentEdit(existing);
    const updated = memoryCapsuleSchema.parse({
      ...existing,
      ...patch,
      verificationStatus: nextVerificationStatus,
      updatedAt: now,
    });

    const auditEvents: AuditEvent[] = [
      createAuditEvent({
        id: createId("audit"),
        type: "memory_updated",
        actor,
        entityType: "memory_capsule",
        entityId: id,
        occurredAt: now,
        before: existing,
        after: updated,
        requiresHumanConfirmation: false,
        reversible: true,
      }),
    ];

    if (existing.verificationStatus !== updated.verificationStatus) {
      auditEvents.push(
        createStatusAuditEvent({
          actor,
          memoryId: id,
          occurredAt: now,
          before: existing.verificationStatus,
          after: updated.verificationStatus,
          requiresHumanConfirmation: false,
          reason: "Confirmed content was edited and returned to reviewed.",
        }),
      );
    }

    await this.database.transaction(
      "rw",
      this.database.memoryCapsules,
      this.database.auditEvents,
      async () => {
        await this.database.memoryCapsules.put(updated);
        await this.database.auditEvents.bulkAdd(auditEvents);
      },
    );

    return updated;
  }

  async setMemoryVerificationStatus(
    id: string,
    status: VerificationStatus,
    actor: Actor,
    reason?: string,
  ): Promise<MemoryCapsule> {
    const existing = await this.getRequiredMemory(id);
    const decision = canSetVerificationStatus(existing.verificationStatus, status, actor);

    if (!decision.allowed) {
      throw new Error(decision.reason ?? "Verification status transition is not allowed.");
    }

    const now = getNow();
    const updated = memoryCapsuleSchema.parse({
      ...existing,
      verificationStatus: status,
      updatedAt: now,
    });
    const auditEvent = createStatusAuditEvent({
      actor,
      memoryId: id,
      occurredAt: now,
      before: existing.verificationStatus,
      after: status,
      requiresHumanConfirmation: decision.requiresHumanConfirmation,
      reason,
    });

    await this.database.transaction(
      "rw",
      this.database.memoryCapsules,
      this.database.auditEvents,
      async () => {
        await this.database.memoryCapsules.put(updated);
        await this.database.auditEvents.add(auditEvent);
      },
    );

    return updated;
  }

  async setMemoryPrivacyScope(
    id: string,
    scope: PrivacyScope,
    actor: Actor,
    reason?: string,
  ): Promise<MemoryCapsule> {
    const existing = await this.getRequiredMemory(id);
    const decision = canChangePrivacyScope(existing.privacyScope, scope, actor);

    if (!decision.allowed) {
      throw new Error(decision.reason ?? "Privacy scope transition is not allowed.");
    }

    const now = getNow();
    const updated = memoryCapsuleSchema.parse({
      ...existing,
      privacyScope: scope,
      updatedAt: now,
    });
    const auditEvent = createPrivacyAuditEvent({
      actor,
      memoryId: id,
      occurredAt: now,
      before: existing.privacyScope,
      after: scope,
      requiresHumanConfirmation: decision.requiresHumanConfirmation,
      reason,
    });

    await this.database.transaction(
      "rw",
      this.database.memoryCapsules,
      this.database.auditEvents,
      async () => {
        await this.database.memoryCapsules.put(updated);
        await this.database.auditEvents.add(auditEvent);
      },
    );

    return updated;
  }

  async listMemories(filter: MemoryListFilter = {}): Promise<MemoryCapsule[]> {
    let collection = this.database.memoryCapsules.toCollection();

    if (filter.verificationStatus) {
      collection = collection.filter(
        (memory) => memory.verificationStatus === filter.verificationStatus,
      );
    }

    if (filter.privacyScope) {
      collection = collection.filter((memory) => memory.privacyScope === filter.privacyScope);
    }

    return collection.sortBy("updatedAt");
  }

  async getMemory(id: string): Promise<MemoryCapsule | undefined> {
    return this.database.memoryCapsules.get(id);
  }

  async getAuditEventsForEntity(entityId: string): Promise<AuditEvent[]> {
    return this.database.auditEvents
      .where("entityId")
      .equals(entityId)
      .sortBy("occurredAt");
  }

  private async getRequiredMemory(id: string): Promise<MemoryCapsule> {
    const memory = await this.database.memoryCapsules.get(id);

    if (!memory) {
      throw new Error(`Memory capsule ${id} was not found.`);
    }

    return memory;
  }
}

export function getMemoryCapsuleRepository(database: LifeMemoryDatabase = db) {
  return new MemoryCapsuleRepository(database);
}

export async function clearDatabase(database: LifeMemoryDatabase = db): Promise<void> {
  const tables: Table[] = [
    database.principalProfiles,
    database.companionSettings,
    database.memoryCapsules,
    database.people,
    database.legacyPacketDrafts,
    database.auditEvents,
    database.appSettings,
  ];

  await database.transaction("rw", tables, async () => {
    await Promise.all(tables.map((table) => table.clear()));
  });
}

