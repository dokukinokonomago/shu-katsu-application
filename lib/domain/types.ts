import { z } from "zod";

export const verificationStatusSchema = z.enum([
  "raw",
  "drafted",
  "reviewed",
  "confirmed",
  "disputed",
]);

export type VerificationStatus = z.infer<typeof verificationStatusSchema>;

export const v0VerificationStatusSchema = z.enum(["drafted", "reviewed", "confirmed"]);

export type V0VerificationStatus = z.infer<typeof v0VerificationStatusSchema>;

export const privacyScopeSchema = z.enum([
  "private",
  "trusted_family",
  "executor",
  "posthumous",
  "public",
]);

export type PrivacyScope = z.infer<typeof privacyScopeSchema>;

export const v0PrivacyScopeSchema = z.enum([
  "private",
  "trusted_family",
  "executor",
  "posthumous",
]);

export type V0PrivacyScope = z.infer<typeof v0PrivacyScopeSchema>;

export const memoryTypeSchema = z.enum([
  "episode",
  "person",
  "value",
  "wish",
  "document",
  "object",
  "place",
  "lesson",
]);

export type MemoryType = z.infer<typeof memoryTypeSchema>;

export const actorRoleSchema = z.enum(["principal", "trusted_editor", "ai", "system"]);

export type ActorRole = z.infer<typeof actorRoleSchema>;

export const actorSchema = z.object({
  id: z.string().min(1),
  role: actorRoleSchema,
  displayName: z.string().min(1),
});

export type Actor = z.infer<typeof actorSchema>;

export const aiInferenceSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(["summary", "title", "person", "emotion", "value", "question", "relation"]),
  content: z.string().min(1),
  createdAt: z.string().min(1),
  sourceText: z.string().optional(),
});

export type AiInference = z.infer<typeof aiInferenceSchema>;

export const relatedPersonRefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  relationshipLabel: z.string().optional(),
});

export type RelatedPersonRef = z.infer<typeof relatedPersonRefSchema>;

export const memoryCapsuleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  body: z.string().min(1),
  memoryType: memoryTypeSchema,
  occurredAtText: z.string().min(1),
  relatedPeople: z.array(relatedPersonRefSchema),
  emotions: z.array(z.string().min(1)),
  values: z.array(z.string().min(1)),
  verificationStatus: verificationStatusSchema,
  privacyScope: privacyScopeSchema,
  unresolvedQuestions: z.array(z.string().min(1)),
  aiInferences: z.array(aiInferenceSchema),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type MemoryCapsule = z.infer<typeof memoryCapsuleSchema>;

export const personSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  relationshipLabel: z.string().min(1),
  notes: z.string(),
  relatedMemoryIds: z.array(z.string().min(1)),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type Person = z.infer<typeof personSchema>;

export const legacyPacketDraftSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  audience: z.string().min(1),
  description: z.string(),
  memoryIds: z.array(z.string().min(1)),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export type LegacyPacketDraft = z.infer<typeof legacyPacketDraftSchema>;

export const auditEventTypeSchema = z.enum([
  "verification_status_changed",
  "privacy_scope_changed",
  "memory_created",
  "memory_updated",
  "legacy_packet_created",
  "legacy_packet_updated",
  "ai_draft_created",
]);

export type AuditEventType = z.infer<typeof auditEventTypeSchema>;

export const auditEventSchema = z.object({
  id: z.string().min(1),
  type: auditEventTypeSchema,
  actor: actorSchema,
  entityType: z.enum(["memory_capsule", "person", "legacy_packet_draft", "ai_inference"]),
  entityId: z.string().min(1),
  occurredAt: z.string().min(1),
  before: z.unknown().optional(),
  after: z.unknown().optional(),
  reason: z.string().optional(),
  requiresHumanConfirmation: z.boolean(),
  reversible: z.boolean(),
});

export type AuditEvent = z.infer<typeof auditEventSchema>;

