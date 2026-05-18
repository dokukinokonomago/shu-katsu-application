"use client";

import {
  ArrowRight,
  BookOpenText,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  HeartHandshake,
  LockKeyhole,
  MessageCircleQuestion,
  PenLine,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  getLifeCompanionSettingsRepository,
  getMemoryCapsuleRepository,
  getPrincipalProfileRepository,
} from "@/lib/db";
import type { Actor, MemoryCapsule, VerificationStatus } from "@/lib/domain";

const steps = [
  "Welcome",
  "Safety",
  "Profile",
  "Companion",
  "Purpose",
  "Memory",
  "Review",
  "Preview",
];

const safetyPromises = [
  "AIの下書きは本人確認前に確定記録になりません。",
  "共有範囲は記憶ごとに選びます。",
  "法務・税務・医療の判断は専門家確認が必要です。",
  "非公開に戻す導線を常に残します。",
];

const memoryPrompts = [
  {
    title: "大切な人について",
    target: "person / episode",
    body: "その人との関係、忘れたくない場面、いつか伝えたいことを残します。",
  },
  {
    title: "忘れたくない出来事",
    target: "episode",
    body: "時期が曖昧でもよいので、人生の意味を作った出来事を記録します。",
  },
  {
    title: "家族に残したい考え",
    target: "value / wish",
    body: "判断軸、感謝、希望、誤解されたくないことを言葉にします。",
  },
];

const defaultForm = {
  displayName: "山田 花子",
  birthYearOrDecade: "1950年代",
  homeRegion: "奈良県",
  purposeForUsingApp: "家族に伝えたいことと、残しておきたい思い出を少しずつ整理したい。",
  companionName: "灯",
  companionTone: "穏やか、簡潔、聞き役中心",
  relationshipStyle: "編集者のように、急かさず整理する",
  topicsToAvoid: "資産や医療の細かい話は、信頼できる人と一緒に確認してから進めたい。",
  memoryBody:
    "父と夕方の商店街を歩き、帰りに小さな菓子を買ってもらった。何気ない時間だったけれど、今でも安心した気持ちを思い出す。",
  relatedPersonName: "父",
  occurredAtText: "小学生の頃",
  privacyNote: "まずは非公開。後で家族共有を検討する。",
};

type OnboardingForm = typeof defaultForm;

function Field({
  label,
  value,
  onChange,
  multiline = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-[var(--foreground)]">{label}</span>
      {multiline ? (
        <textarea
          className="min-h-28 w-full resize-none rounded-md border border-[var(--line)] bg-white px-3 py-3 leading-7 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      ) : (
        <input
          className="min-h-11 w-full rounded-md border border-[var(--line)] bg-white px-3 text-[var(--foreground)] outline-none focus:border-[var(--accent)]"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </label>
  );
}

export default function OnboardingPage() {
  const [form, setForm] = useState<OnboardingForm>(defaultForm);
  const [savedMemory, setSavedMemory] = useState<MemoryCapsule | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [saveMessage, setSaveMessage] = useState("");

  const reviewFields = useMemo(
    () => [
      ["タイトル", "父と歩いた商店街の帰り道"],
      ["確認状態", savedMemory?.verificationStatus ?? "drafted"],
      ["共有範囲", savedMemory?.privacyScope ?? "private"],
      ["関連人物", form.relatedPersonName],
      ["感情・価値観", "感謝 / 家族 / 継承"],
      ["未確認点", "何年頃の出来事か。誰に共有してよいか。"],
    ],
    [form.relatedPersonName, savedMemory],
  );

  function updateField(field: keyof OnboardingForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function saveOnboarding(targetStatus: VerificationStatus) {
    setSaveStatus("saving");
    setSaveMessage("");

    try {
      const actor: Actor = {
        id: "principal-default",
        role: "principal",
        displayName: form.displayName.trim() || "Principal",
      };
      const profileRepository = getPrincipalProfileRepository();
      const companionRepository = getLifeCompanionSettingsRepository();
      const memoryRepository = getMemoryCapsuleRepository();

      await profileRepository.upsertPrincipalProfile({
        id: "principal-default",
        displayName: form.displayName,
        birthYearOrDecade: form.birthYearOrDecade,
        homeRegion: form.homeRegion,
        purposeForUsingApp: form.purposeForUsingApp,
        topicsToAvoid: form.topicsToAvoid,
      });
      await companionRepository.upsertLifeCompanionSettings({
        id: "companion-default",
        companionName: form.companionName,
        companionTone: form.companionTone,
        relationshipStyle: form.relationshipStyle,
      });

      const memory = await memoryRepository.createMemoryCapsule(
        {
          id: `memory-${crypto.randomUUID()}`,
          title: "父と歩いた商店街の帰り道",
          summary: "父と歩いた何気ない帰り道が、安心感と家族への感謝として残っている。",
          body: form.memoryBody,
          memoryType: "episode",
          occurredAtText: form.occurredAtText,
          relatedPeople: [
            {
              id: `person-${crypto.randomUUID()}`,
              name: form.relatedPersonName,
              relationshipLabel: "家族",
            },
          ],
          emotions: ["感謝"],
          values: ["家族", "継承"],
          verificationStatus: "drafted",
          privacyScope: "private",
          unresolvedQuestions: ["何年頃の出来事か。", "誰に共有してよいか。"],
          aiInferences: [],
        },
        actor,
      );
      const finalMemory =
        targetStatus === "confirmed"
          ? await memoryRepository.setMemoryVerificationStatus(
              memory.id,
              "confirmed",
              actor,
              "Principal confirmed the onboarding memory.",
            )
          : memory;

      setSavedMemory(finalMemory);
      setSaveStatus("saved");
      setSaveMessage(
        targetStatus === "confirmed"
          ? "プロフィール、Companion設定、確認済みMemory CapsuleをローカルDBへ保存しました。"
          : "プロフィール、Companion設定、下書きMemory CapsuleをローカルDBへ保存しました。",
      );
    } catch (error) {
      setSaveStatus("error");
      setSaveMessage(error instanceof Error ? error.message : "保存に失敗しました。");
    }
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--line)] bg-[var(--panel)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link className="text-sm font-semibold" href="/">
            Life Memory
          </Link>
          <div className="text-sm text-[var(--muted)]">local persistence prototype</div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-8 lg:grid-cols-[260px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <p className="mb-3 text-sm font-semibold text-[var(--muted)]">v0 flow</p>
          <ol className="space-y-2">
            {steps.map((step, index) => (
              <li
                className="flex items-center gap-3 rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-2 text-sm"
                key={step}
              >
                {index < 2 ? (
                  <CheckCircle2 aria-hidden="true" className="size-4 text-[var(--accent)]" />
                ) : (
                  <Circle aria-hidden="true" className="size-4 text-[var(--muted)]" />
                )}
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </aside>

        <div className="space-y-8">
          <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="py-4">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-1 text-sm text-[var(--muted)]">
                <HeartHandshake aria-hidden="true" className="size-4" />
                Welcome
              </div>
              <h1 className="text-4xl font-semibold leading-tight sm:text-5xl">
                最初は、3つの記憶から始めます
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
                終活情報を急いで埋めるのではなく、本人の文脈、AIとの距離感、共有範囲、安全境界を確認しながら記憶カプセルを作ります。
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <button className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[var(--accent)] px-5 text-sm font-semibold text-white">
                  はじめる
                  <ArrowRight aria-hidden="true" className="size-4" />
                </button>
                <button className="inline-flex min-h-11 items-center rounded-md border border-[var(--line)] px-5 text-sm font-semibold">
                  共有とAIの扱いを読む
                </button>
              </div>
            </div>

            <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck aria-hidden="true" className="size-5 text-[var(--accent)]" />
                <h2 className="text-lg font-semibold">最初に確認する4つの約束</h2>
              </div>
              <ul className="space-y-3">
                {safetyPromises.map((promise) => (
                  <li className="flex gap-3 leading-7 text-[var(--muted)]" key={promise}>
                    <CheckCircle2
                      aria-hidden="true"
                      className="mt-1 size-4 shrink-0 text-[var(--accent)]"
                    />
                    <span>{promise}</span>
                  </li>
                ))}
              </ul>
            </section>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
              <div className="mb-5 flex items-center gap-2">
                <UserRound aria-hidden="true" className="size-5 text-[var(--accent)]" />
                <h2 className="text-xl font-semibold">Principal Profile</h2>
              </div>
              <div className="grid gap-4">
                <Field
                  label="呼ばれたい名前"
                  value={form.displayName}
                  onChange={(value) => updateField("displayName", value)}
                />
                <Field
                  label="生年または年代"
                  value={form.birthYearOrDecade}
                  onChange={(value) => updateField("birthYearOrDecade", value)}
                />
                <Field
                  label="主な居住地域"
                  value={form.homeRegion}
                  onChange={(value) => updateField("homeRegion", value)}
                />
                <Field
                  label="このアプリを使う理由"
                  multiline
                  value={form.purposeForUsingApp}
                  onChange={(value) => updateField("purposeForUsingApp", value)}
                />
              </div>
            </div>

            <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
              <div className="mb-5 flex items-center gap-2">
                <MessageCircleQuestion
                  aria-hidden="true"
                  className="size-5 text-[var(--accent)]"
                />
                <h2 className="text-xl font-semibold">Life Companion</h2>
              </div>
              <div className="grid gap-4">
                <Field
                  label="Companionの名前"
                  value={form.companionName}
                  onChange={(value) => updateField("companionName", value)}
                />
                <Field
                  label="口調"
                  value={form.companionTone}
                  onChange={(value) => updateField("companionTone", value)}
                />
                <Field
                  label="距離感"
                  value={form.relationshipStyle}
                  onChange={(value) => updateField("relationshipStyle", value)}
                />
                <Field
                  label="残したくない、または今は触れたくない領域"
                  multiline
                  value={form.topicsToAvoid}
                  onChange={(value) => updateField("topicsToAvoid", value)}
                />
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center gap-2">
              <BookOpenText aria-hidden="true" className="size-5 text-[var(--accent)]" />
              <h2 className="text-xl font-semibold">First Memory Prompts</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {memoryPrompts.map((prompt) => (
                <article
                  className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5"
                  key={prompt.title}
                >
                  <div className="mb-3 text-xs font-semibold uppercase text-[var(--accent)]">
                    {prompt.target}
                  </div>
                  <h3 className="text-lg font-semibold">{prompt.title}</h3>
                  <p className="mt-3 leading-7 text-[var(--muted)]">{prompt.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
              <div className="mb-5 flex items-center gap-2">
                <PenLine aria-hidden="true" className="size-5 text-[var(--accent)]" />
                <h2 className="text-xl font-semibold">Memory Create</h2>
              </div>
              <div className="grid gap-4">
                <Field
                  label="何がありましたか"
                  multiline
                  value={form.memoryBody}
                  onChange={(value) => updateField("memoryBody", value)}
                />
                <Field
                  label="誰が関係していますか"
                  value={form.relatedPersonName}
                  onChange={(value) => updateField("relatedPersonName", value)}
                />
                <Field
                  label="いつ頃ですか"
                  value={form.occurredAtText}
                  onChange={(value) => updateField("occurredAtText", value)}
                />
                <Field
                  label="誰に見せてもよいですか"
                  value={form.privacyNote}
                  onChange={(value) => updateField("privacyNote", value)}
                />
              </div>
            </div>

            <div className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
              <div className="mb-5 flex items-center gap-2">
                <ClipboardCheck aria-hidden="true" className="size-5 text-[var(--accent)]" />
                <h2 className="text-xl font-semibold">Memory Review</h2>
              </div>
              <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
                {reviewFields.map(([label, value]) => (
                  <div className="grid gap-2 py-3 sm:grid-cols-[140px_1fr]" key={label}>
                    <div className="text-sm font-semibold text-[var(--muted)]">{label}</div>
                    <div className="leading-7">{value}</div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  className="inline-flex min-h-11 items-center rounded-md bg-[var(--accent)] px-4 text-sm font-semibold text-white disabled:opacity-60"
                  disabled={saveStatus === "saving"}
                  onClick={() => void saveOnboarding("confirmed")}
                >
                  確認済みにする
                </button>
                <button
                  className="inline-flex min-h-11 items-center rounded-md border border-[var(--line)] px-4 text-sm font-semibold disabled:opacity-60"
                  disabled={saveStatus === "saving"}
                  onClick={() => void saveOnboarding("drafted")}
                >
                  下書きのまま保存
                </button>
                <button
                  className="inline-flex min-h-11 items-center gap-2 rounded-md border border-[var(--line)] px-4 text-sm font-semibold disabled:opacity-60"
                  disabled={saveStatus === "saving"}
                  onClick={() => void saveOnboarding("drafted")}
                >
                  <LockKeyhole aria-hidden="true" className="size-4" />
                  非公開にする
                </button>
              </div>
              {saveMessage ? (
                <p
                  className={`mt-4 rounded-md border px-3 py-2 text-sm ${
                    saveStatus === "error"
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-[var(--line)] bg-white text-[var(--muted)]"
                  }`}
                >
                  {saveMessage}
                </p>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5">
            <h2 className="text-xl font-semibold">Memory Space Preview</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-[180px_1fr]">
              <div className="flex min-h-40 items-center justify-center rounded-lg border border-dashed border-[var(--accent)] text-center font-semibold text-[var(--accent)]">
                本人
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {["人物", "出来事", "価値観"].map((label) => (
                  <div
                    className="flex min-h-28 items-center justify-center rounded-lg border border-[var(--line)] bg-white text-sm font-semibold"
                    key={label}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
