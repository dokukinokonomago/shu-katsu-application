# Workflow

この文書は、終活・人生記録アプリの設計、実装、ドキュメント更新、AI自動化作業を進めるための標準ワークフローを定義する。

## Core Rule

`main` は常に安定した基準点にする。日々の作業は目的ごとにブランチを切り、PRで確認してから `main` へ入れる。

```text
main
  -> feature/<topic>
    -> commit
    -> push
    -> PR
    -> review / adjust
    -> merge to main
```

## Branch Types

| Type | Example | Use |
|---|---|---|
| `docs/` | `docs/workflow-rules` | 設計、仕様、運用ルールの更新 |
| `feature/` | `feature/onboarding-interview` | 新機能の実装 |
| `research/` | `research/legal-care-context` | 調査、分析、参考資料整理 |
| `fix/` | `fix/privacy-scope-transition` | バグ修正 |
| `chore/` | `chore/project-setup` | 開発環境、CI、依存関係、整理 |

1ブランチにつき1目的にする。複数の目的が混ざったら、作業を分ける。

## Starting Work

作業開始時は、現在位置を確認してから始める。

```sh
git status --short --branch
git switch main
git pull
git switch -c feature/<topic>
```

すでに進行中のブランチがある場合は、無理に新しいブランチを切らない。現在のブランチの目的に合う作業かを確認する。

## Before Editing

編集前に読むべき文書を決める。

| Work Area | Read First |
|---|---|
| プロダクト方針 | `docs/product-thesis.md` |
| 記憶データ、共有範囲、AI根拠 | `docs/memory-model.md` |
| 初回体験、質問設計 | `docs/onboarding-ux.md` |
| 自動化、AIエージェント、外部共有 | `AUTOMATION_RULEBOOK.md` |
| 作業手順、ブランチ運用 | `docs/workflow.md` |
| PAI由来の判断根拠 | `research/pai-analysis/` |

設計が曖昧なままコードを書かない。実装中に仕様判断が発生した場合は、該当する `docs/` を更新する。

## Commit Rules

コミットは小さく、目的が読める単位にする。

良い例:

```text
Add automation safety rulebook
Document onboarding memory review flow
Implement memory capsule status model
Fix privacy scope transition guard
```

避ける例:

```text
Update stuff
WIP
Fix
Big changes
```

コミット前に確認する。

```sh
git status --short
git diff
```

## Push and PR

作業ブランチはリモートへ push する。

```sh
git push -u origin <branch>
```

PRには以下を書く。

- 何を変更したか
- なぜ変更したか
- 確認したこと
- 未確認、未実装、次にやること
- 自動化や共有範囲に影響する場合は、`AUTOMATION_RULEBOOK.md` への適合

## Main Branch Rules

`main` へ直接作業しない。例外は、リポジトリ初期化や緊急修正など、ユーザーが明示した場合のみ。

`main` に入れる前の条件:

- 作業目的が明確である。
- 関連ドキュメントが更新されている。
- 可能な範囲で確認コマンドを実行している。
- 自動化、共有、削除、外部送信に関わる変更がルールブックに反していない。
- 次の作業が説明できる。

## Documentation-First Areas

以下の領域は、実装より先に設計文書を更新する。

- 記憶状態の変更
- `privacy_scope` の追加や変更
- `verification_status` の変更
- Life Companionの応答方針
- 家族共有、代理人共有、死後共有
- 自動化、定期ジョブ、外部送信
- 法務、医療、財務に近い機能
- オンボーディング質問の追加や削除

このアプリでは、データの意味と安全境界がUIより重要になる場面が多い。

## Automation Workflow

自動化作業は以下の順で進める。

1. 目的を決める。
2. `AUTOMATION_RULEBOOK.md` で許可範囲を確認する。
3. 自動で行う処理と、人間確認が必要な処理を分ける。
4. 必要なら `docs/memory-model.md` に状態遷移や監査ログを追加する。
5. 実装する。
6. 確認コマンドを実行する。
7. 最終報告で次の作業を示す。

自動化してよいのは、整理、分類、下書き、提案、検証補助まで。本人の意思確定、共有、削除、外部送信、専門判断は人間確認を必須にする。

## Codex Collaboration Rules

Codexに作業を依頼する時は、できるだけ以下を明確にする。

- 目的
- 触ってよいファイル
- まだ実装しない範囲
- コミットやpushまで行うか
- 調査だけか、実装まで行うか

Codex側の基本動作:

- 作業前に `git status --short --branch` を確認する。
- 既存文書を読んでから編集する。
- 変更前に何を編集するか短く説明する。
- 手動編集は `apply_patch` を使う。
- 作業後に差分、状態、必要な確認を行う。
- 最終報告には必ず次の作業と、その理由を含める。

## Verification

現時点では実装基盤がないため、ドキュメント作業では以下を確認する。

```sh
git diff
rg -n "TODO|TBD|confirmed|privacy_scope|AUTOMATION_RULEBOOK" .
```

実装基盤が入った後は、プロジェクト標準の確認コマンドをこの文書へ追記する。

候補:

```sh
npm run lint
npm run typecheck
npm test
```

## Completion Report

各作業の最後には、以下を報告する。

- 完了したこと
- 変更したファイル
- 実行した確認
- コミットとpushの有無
- 次の作業
- 次の作業が今最適な理由

例:

```text
次の作業はMemory ListとMemory Detailの作成です。オンボーディング保存がDBへつながったので、次は保存したMemory Capsuleを閲覧・確認できる画面を作るのが最適です。
```

## Recommended Next Sequence

現時点の推奨順序:

1. Memory ListとMemory Detailを作る。
2. TimelineとPeople viewsを作る。
3. Legacy Packet Draftを実装する。
4. Life Companionの最小AI補助を作る。
