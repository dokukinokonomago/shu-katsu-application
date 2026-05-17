# CLAUDE.md

このリポジトリは、終活と人生記録のためのアプリを設計・実装するための作業場です。現時点の中心資料は `research/pai-analysis/` のPAI分析と、`docs/` 配下のプロダクト設計文書です。

## Product Direction

このアプリは、単なる終活チェックリストやデジタル遺品管理ではない。本人の人生の記憶、価値観、関係性、判断軸を整理し、必要な時に本人と家族が参照できる「人生記録OS」を目指す。

PAI分析から採用する中心思想:

- OS / UI / AI人格を分ける。
- 現在状態から理想状態へ進む構造を全体の背骨にする。
- 記憶を寿命と信頼度で分ける。
- 初回導線は設定画面ではなく、人格と人生文脈を作る会話にする。
- 3Dやグラフ表現は探索に使い、編集・確認・長文閲覧は2D UIに逃がす。
- 常駐daemon、外部メッセージ連携、音声必須体験は初期スコープに入れない。

## Core Documents

作業前に必要に応じて以下を読む。

| Document | Role |
|---|---|
| `docs/product-thesis.md` | プロダクトの存在理由、非目標、設計原則 |
| `docs/v0-spec.md` | 初期版で作る範囲、作らない範囲、受け入れ基準 |
| `docs/memory-model.md` | 記憶データの型、寿命、信頼度、変換パイプライン |
| `docs/onboarding-ux.md` | 初回体験、質問設計、プログレッシブ開示 |
| `docs/workflow.md` | ブランチ運用、PR運用、Codexとの作業手順 |
| `AUTOMATION_RULEBOOK.md` | 自動化、フルオート機能、AIエージェント実行の安全境界 |
| `research/pai-analysis/` | PAIから抽出した設計原則の根拠 |

## Architecture Vocabulary

このプロジェクトでは以下の語彙を一貫して使う。

| Term | Meaning |
|---|---|
| Life Memory OS | 記憶、人物、意思、書類、AI対話を束ねる中核 |
| Memory Space | 記憶を探索する2D/3D/グラフUI |
| Life Companion | 本人の言葉遣い、価値観、文脈を参照して対話するAI人格 |
| Principal | 記録の主体である本人 |
| Memory Capsule | 1つの記憶単位。出来事、人物、感情、資料、未確認点を持つ |
| Legacy Packet | 家族や代理人へ渡せる、確認済みの意思・資料・説明の束 |
| Raw Capture | 音声、写真、メモ、会話ログなどの未整理素材 |
| Canonical Memory | 本人確認済みで、分身AIや共有資料の根拠にできる記憶 |

## Design Boundaries

終活領域は情報の重みが大きい。便利さよりも、本人の尊厳、確認可能性、共有範囲の明確さを優先する。

- AIが本人の意思を勝手に確定しない。
- 推測は推測として保存し、本人確認済みの記憶と混ぜない。
- 家族共有、代理人共有、公開可能情報、完全非公開情報をUIとデータ構造の両方で分ける。
- 法務、税務、医療の判断をAI単独で断定しない。
- 死後に外部へ通知・送信・共有する機能は、明示的な承認、監査ログ、取り消し導線なしに作らない。

## Initial Product Scope

初期版は以下に集中する。

1. 人生記録の初回インタビュー
2. 記憶カプセルの作成、編集、確認
3. 人物、出来事、価値観、書類、意思の整理
4. 記憶同士の関連表示
5. 家族へ共有する情報と非共有情報の分離
6. Life Companionの応答根拠を確認済み記憶に限定する仕組み

初期版で避けるもの:

- 常駐daemon
- Telegram / iMessage / 外部SNS連携
- 音声必須体験
- 複数AI人格の大量投入
- 法的効力をうたう遺言作成
- 全情報を3D空間だけで編集するUI

## Implementation Guidance

実装に入る場合は、既存文書を更新してからコードを書く。仕様が曖昧なままUIやデータモデルを先に作らない。

優先順位:

1. データの信頼度と共有範囲を壊さない。
2. 本人が後から確認・修正できる。
3. 家族が読んだ時に意味が伝わる。
4. AIの根拠が追跡できる。
5. UIが高齢者や非技術者にも過度に難しくならない。

## Completion Reporting

作業完了時の最終報告には、必ず未来へつなぐコメントを含める。

含める内容:

- 今回どこまで完了したか。
- 次の作業は何か。
- なぜそれが次に最適か。
- 必要なら、次に触るべきファイルやブランチ名。

例:

```text
次の作業は `docs/workflow.md` の作成です。今は作業ルールと自動化境界が固まり始めているので、ブランチ運用とPR運用を文書化するのが最適です。
```

## Automation Safety

自動化、フルオート機能、AIエージェント実行、外部共有、定期ジョブに関わる設計または実装を行う前に、必ず `AUTOMATION_RULEBOOK.md` を読む。

基本原則:

- 自動化してよいのは、整理、分類、下書き、提案、検証補助まで。
- 本人の意思確定、共有、削除、外部送信、法務・医療・財務判断は、人間の明示的な確認なしに実行しない。
- `drafted` と `confirmed` を混ぜない。
- `privacy_scope` を広げる変更は自動実行しない。
- AI推測を本人の言葉として扱わない。

## File Organization Proposal

今後実装する場合の候補構造:

```text
app/
  memory-space/
  onboarding/
  people/
  legacy-packets/
  companion/
components/
lib/
  memory/
  privacy/
  companion/
  validation/
docs/
research/
```

これは確定アーキテクチャではない。実装フレームワーク選定後に、`docs/product-thesis.md` と `docs/memory-model.md` に沿って調整する。
