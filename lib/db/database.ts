import Dexie, { type EntityTable } from "dexie";
import type {
  AppSettings,
  AuditEvent,
  LegacyPacketDraft,
  LifeCompanionSettings,
  MemoryCapsule,
  Person,
  PrincipalProfile,
} from "@/lib/domain";

export class LifeMemoryDatabase extends Dexie {
  principalProfiles!: EntityTable<PrincipalProfile, "id">;
  companionSettings!: EntityTable<LifeCompanionSettings, "id">;
  memoryCapsules!: EntityTable<MemoryCapsule, "id">;
  people!: EntityTable<Person, "id">;
  legacyPacketDrafts!: EntityTable<LegacyPacketDraft, "id">;
  auditEvents!: EntityTable<AuditEvent, "id">;
  appSettings!: EntityTable<AppSettings, "id">;

  constructor(name = "life-memory-ending-app") {
    super(name);

    this.version(1).stores({
      principalProfiles: "id, updatedAt",
      companionSettings: "id, updatedAt",
      memoryCapsules: "id, verificationStatus, privacyScope, memoryType, updatedAt",
      people: "id, name, updatedAt",
      legacyPacketDrafts: "id, updatedAt",
      auditEvents: "id, type, entityType, entityId, occurredAt",
      appSettings: "id, key, updatedAt",
    });
  }
}

export const db = new LifeMemoryDatabase();

