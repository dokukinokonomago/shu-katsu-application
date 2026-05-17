import { BookOpenText, CircleCheck, LockKeyhole, Sparkles } from "lucide-react";

const foundations = [
  {
    title: "Memory Capsules",
    body: "人生の出来事、人物、価値観、意思を確認状態つきで整理します。",
    icon: BookOpenText,
  },
  {
    title: "Privacy First",
    body: "共有範囲は最初から記録し、広げる変更には確認を挟みます。",
    icon: LockKeyhole,
  },
  {
    title: "Human Confirmation",
    body: "AI下書きと本人確認済み記録を混ぜず、意思確定は人間操作に限定します。",
    icon: CircleCheck,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-6 py-12">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--line)] px-3 py-1 text-sm text-[var(--muted)]">
            <Sparkles aria-hidden="true" className="size-4" />
            v0 foundation
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            人生の記憶と意思を、確認できる形で残す
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            終活をチェックリストだけで終わらせず、本人の記憶、価値観、関係性、共有範囲を丁寧に整理するためのローカルファーストなWebアプリです。
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {foundations.map((item) => {
            const Icon = item.icon;

            return (
              <article
                className="rounded-lg border border-[var(--line)] bg-[var(--panel)] p-5"
                key={item.title}
              >
                <Icon aria-hidden="true" className="mb-4 size-6 text-[var(--accent)]" />
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 leading-7 text-[var(--muted)]">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

