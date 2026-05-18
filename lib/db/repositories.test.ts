import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import type { Actor, MemoryCapsule } from "@/lib/domain";
import { LifeMemoryDatabase } from "./database";
import {
  clearDatabase,
  LifeCompanionSettingsRepository,
  MemoryCapsuleRepository,
  PrincipalProfileRepository,
} from "./repositories";

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

function createTestDatabase(): LifeMemoryDatabase {
  return new LifeMemoryDatabase(`test-db-${crypto.randomUUID()}`);
}

function makeMemory(overrides: Partial<MemoryCapsule> = {}): Omit<
  MemoryCapsule,
  "createdAt" | "updatedAt"
> &
  Partial<Pick<MemoryCapsule, "createdAt" | "updatedAt">> {
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
    ...overrides,
  };
}

let database = createTestDatabase();

afterEach(async () => {
  await clearDatabase(database);
  database.close();
  database = createTestDatabase();
});

describe("MemoryCapsuleRepository", () => {
  it("creates memory capsules with audit events", async () => {
    const repository = new MemoryCapsuleRepository(database);
    const memory = await repository.createMemoryCapsule(makeMemory(), principal);

    expect(memory.createdAt).toBeTruthy();
    expect(memory.updatedAt).toBeTruthy();

    const auditEvents = await repository.getAuditEventsForEntity(memory.id);
    expect(auditEvents).toHaveLength(1);
    expect(auditEvents[0]?.type).toBe("memory_created");
  });

  it("blocks AI from confirming memory capsules", async () => {
    const repository = new MemoryCapsuleRepository(database);
    const memory = await repository.createMemoryCapsule(makeMemory(), principal);

    await expect(
      repository.setMemoryVerificationStatus(memory.id, "confirmed", aiActor),
    ).rejects.toThrow("Only a human actor can confirm");
  });

  it("allows principal confirmation and records a status audit event", async () => {
    const repository = new MemoryCapsuleRepository(database);
    const memory = await repository.createMemoryCapsule(makeMemory(), principal);
    const confirmed = await repository.setMemoryVerificationStatus(
      memory.id,
      "confirmed",
      principal,
      "Principal reviewed the memory.",
    );

    expect(confirmed.verificationStatus).toBe("confirmed");

    const auditEvents = await repository.getAuditEventsForEntity(memory.id);
    expect(auditEvents.map((event) => event.type)).toContain(
      "verification_status_changed",
    );
    expect(
      auditEvents.find((event) => event.type === "verification_status_changed")
        ?.requiresHumanConfirmation,
    ).toBe(true);
  });

  it("moves confirmed memory back to reviewed when content changes", async () => {
    const repository = new MemoryCapsuleRepository(database);
    const memory = await repository.createMemoryCapsule(
      makeMemory({ verificationStatus: "confirmed" }),
      principal,
    );
    const updated = await repository.updateMemoryCapsule(
      memory.id,
      { body: "Edited body." },
      principal,
    );

    expect(updated.verificationStatus).toBe("reviewed");
  });

  it("blocks AI from widening privacy scope", async () => {
    const repository = new MemoryCapsuleRepository(database);
    const memory = await repository.createMemoryCapsule(makeMemory(), principal);

    await expect(
      repository.setMemoryPrivacyScope(memory.id, "trusted_family", aiActor),
    ).rejects.toThrow("Only a human actor can widen");
  });

  it("allows narrowing privacy scope without human confirmation", async () => {
    const repository = new MemoryCapsuleRepository(database);
    const memory = await repository.createMemoryCapsule(
      makeMemory({ privacyScope: "posthumous" }),
      principal,
    );
    const updated = await repository.setMemoryPrivacyScope(
      memory.id,
      "private",
      aiActor,
      "Narrowing privacy scope is allowed automatically.",
    );

    expect(updated.privacyScope).toBe("private");

    const auditEvents = await repository.getAuditEventsForEntity(memory.id);
    expect(
      auditEvents.find((event) => event.type === "privacy_scope_changed")
        ?.requiresHumanConfirmation,
    ).toBe(false);
  });

  it("filters memories by status and privacy scope", async () => {
    const repository = new MemoryCapsuleRepository(database);
    await repository.createMemoryCapsule(
      makeMemory({ id: "memory-private", privacyScope: "private" }),
      principal,
    );
    await repository.createMemoryCapsule(
      makeMemory({
        id: "memory-family",
        verificationStatus: "confirmed",
        privacyScope: "trusted_family",
      }),
      principal,
    );

    const memories = await repository.listMemories({
      verificationStatus: "confirmed",
      privacyScope: "trusted_family",
    });

    expect(memories).toHaveLength(1);
    expect(memories[0]?.id).toBe("memory-family");
  });
});

describe("onboarding profile repositories", () => {
  it("upserts principal profile and preserves createdAt", async () => {
    const repository = new PrincipalProfileRepository(database);
    const profile = await repository.upsertPrincipalProfile({
      id: "principal-default",
      displayName: "山田 花子",
      birthYearOrDecade: "1950年代",
      homeRegion: "奈良県",
      purposeForUsingApp: "家族に伝えたいことを整理したい。",
    });
    const updated = await repository.upsertPrincipalProfile({
      id: "principal-default",
      displayName: "山田 花子",
      birthYearOrDecade: "1950年代",
      homeRegion: "奈良県",
      purposeForUsingApp: "思い出も整理したい。",
    });

    expect(updated.createdAt).toBe(profile.createdAt);
    expect(updated.updatedAt).toBeTruthy();
    expect(updated.purposeForUsingApp).toBe("思い出も整理したい。");
  });

  it("upserts life companion settings", async () => {
    const repository = new LifeCompanionSettingsRepository(database);
    const settings = await repository.upsertLifeCompanionSettings({
      id: "companion-default",
      companionName: "灯",
      companionTone: "穏やか、簡潔",
      relationshipStyle: "編集者のように整理する",
    });

    expect(settings.companionName).toBe("灯");
    expect(await repository.getLatestLifeCompanionSettings()).toMatchObject({
      id: "companion-default",
    });
  });
});
