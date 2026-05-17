# V0 Spec

この文書は、終活・人生記録アプリのv0で作る範囲を定義する。v0の目的は、完成版の縮小コピーではなく、プロダクトの核である「本人が人生記憶を安全に残し、確認し、あとで家族へ渡せる形に育てる」体験を検証すること。

## V0 Goal

初回利用者が、30分以内に以下を完了できる状態を作る。

1. 本人プロフィールを作る。
2. Life Companionの基本設定を作る。
3. 最初のMemory Capsuleを1から3件作る。
4. 各Memory Capsuleに `verification_status` と `privacy_scope` を設定する。
5. 作った記憶を一覧、年表、簡易関係表示で確認する。
6. 家族向けLegacy Packetの下書き候補を1つ作る。

v0では、記憶の安全な作成と確認状態の区別を最優先する。派手な3D表現、本格AI人格、外部共有は後回しにする。

## Product Slice

v0は以下の3層を最小形で実装する。

| Layer | V0 Scope |
|---|---|
| Life Memory OS | Memory Capsule、Person、Legacy Packet draft、状態と共有範囲 |
| Memory Space | 一覧、年表、簡易グラフ、詳細表示 |
| Life Companion | オンボーディング質問、要約下書き、未確認点の提示 |

## In Scope

### 1. Onboarding Interview

v0の入口。`docs/onboarding-ux.md` の流れを最小化して実装する。

必須ステップ:

- Welcome
- Safety and privacy baseline
- Principal profile
- Life Companion naming
- Purpose interview
- First Memory Capsule creation
- Review and save
- Memory Space preview

v0では「最初の3記憶」を理想としつつ、1件でも完了できるようにする。

### 2. Principal Profile

本人の基本文脈を保存する。

必須フィールド:

- display_name
- birth_year_or_decade
- home_region
- purpose_for_using_app
- companion_name
- companion_tone

任意フィールド:

- occupation_or_life_work
- important_relationships_note
- faith_or_values_note
- topics_to_avoid

### 3. Memory Capsule

v0の中心データ。

必須フィールド:

- id
- title
- summary
- body
- memory_type
- occurred_at_text
- related_people
- emotions
- values
- verification_status
- privacy_scope
- unresolved_questions
- ai_inferences
- created_at
- updated_at

v0では添付ファイルの実体保存は必須にしない。写真、音声、PDFは「将来の添付」欄またはメモとして扱う。

### 4. Verification Flow

本人確認の区別を最初から入れる。

許可する状態:

| Status | V0 Meaning |
|---|---|
| drafted | 作成直後、またはAI要約を含む未確認状態 |
| reviewed | 本人が読んだが、確定しない状態 |
| confirmed | 本人が確認済みにした状態 |

v0では `raw` と `disputed` はデータモデルに残してよいが、主要UIでは簡易表示に留める。

禁止:

- AIが自動で `confirmed` にすること。
- `confirmed` と `drafted` を同じ見た目で表示すること。
- 未確認のAI推測を本文の事実として混ぜること。

### 5. Privacy Scope

共有範囲を必須にする。

v0で使う範囲:

| Scope | V0 Meaning |
|---|---|
| private | 本人だけ |
| trusted_family | 将来、指定家族へ共有可能 |
| executor | 将来、代理人・支援者へ共有可能 |
| posthumous | 将来、死後共有候補 |

`public` はv0では非表示でもよい。共有機能そのものは実装しないが、共有範囲の意思だけ先に記録する。

### 6. Memory Views

v0のMemory Spaceは2D中心にする。

必須ビュー:

- Memory list
- Memory detail
- Timeline
- People list
- Simple relationship graph

簡易グラフは、Memory CapsuleとPersonの関係が見えればよい。3D空間、粒子演出、複雑なズーム操作はv0範囲外。

### 7. People

人物はMemory Capsuleから自然に増える補助データとして扱う。

必須フィールド:

- id
- name
- relationship_label
- notes
- related_memory_ids

v0では人物単独の高度なプロフィール管理はしない。

### 8. Legacy Packet Draft

v0では外部共有せず、下書きだけを作る。

必須機能:

- Memory Capsuleを選んでPacket候補に入れる。
- Packet titleを付ける。
- 家族向けの短い説明を作る。
- 含まれる記憶の `verification_status` と `privacy_scope` を表示する。

禁止:

- 外部送信
- 共有リンク作成
- PDF自動送信
- 死後送信予約

### 9. AI Assistance

v0のAIは、Life Companionの完全人格ではなく、記憶整理の補助に限定する。

許可:

- 入力文の要約
- タイトル候補
- 感情、価値観、人物候補の抽出
- 未確認点の質問化
- 家族向け説明の下書き
- 関連記憶候補の提示

禁止:

- 本人意思の確定
- `confirmed` への自動昇格
- 共有範囲を広げる自動変更
- 法務、医療、財務の断定
- 本人そっくりの代弁人格として振る舞うこと

AIなしでもv0の主要操作は成立させる。AIが使えない場合は、手入力でMemory Capsuleを作れることを必須にする。

## Out of Scope

v0では作らない。

- 本格3D記憶空間
- 音声クローン
- 本人を再現する高度な分身AI
- 家族アカウント招待
- 代理人アカウント招待
- 外部共有リンク
- メール、LINE、SNS、SMS送信
- 死後共有の自動実行
- 法的効力のある遺言作成
- 医療、税務、法律判断
- 決済
- モバイルアプリ化
- 常駐daemon
- 定期オートメーション

## Screens

v0で必要な画面。

| Screen | Purpose |
|---|---|
| Welcome | 価値と安全境界を短く伝える |
| Safety Baseline | AI、共有、専門判断の扱いを確認する |
| Profile Setup | PrincipalとLife Companionの基本設定 |
| Purpose Interview | 何を残したいかを聞く |
| Memory Create | 最初の記憶を入力する |
| Memory Review | AI下書き、状態、共有範囲を確認する |
| Memory List | 記憶を一覧する |
| Memory Detail | 本文、状態、共有範囲、関連を確認・編集する |
| Timeline | 人生時期で見る |
| People | 関連人物を見る |
| Graph | 記憶と人物の関係を見る |
| Legacy Packet Draft | 家族向け下書きを作る |

## Data Objects

v0の最小データ。

```text
PrincipalProfile
LifeCompanionSettings
MemoryCapsule
Person
LegacyPacketDraft
AuditEvent
```

`AuditEvent` はv0でも入れる。特に `verification_status` と `privacy_scope` の変更は履歴を残す。

## State Transitions

### Verification Status

```text
drafted -> reviewed
drafted -> confirmed
reviewed -> confirmed
confirmed -> reviewed
```

`confirmed -> reviewed` は、本人が修正した時に使う。確認済み記憶を変更した場合は、再確認が必要になる。

### Privacy Scope

狭くする変更は即時反映してよい。

```text
trusted_family -> private
executor -> private
posthumous -> private
```

広げる変更は確認UIを必須にする。

```text
private -> trusted_family
trusted_family -> executor
executor -> posthumous
```

v0では実際の共有は行わないが、将来共有されうる意味を明示する。

## Acceptance Criteria

v0完了条件:

- ユーザーがオンボーディングを開始できる。
- Principal profileを保存できる。
- Life Companionの名前と口調を保存できる。
- Memory Capsuleを1件以上作成できる。
- Memory Capsuleに `verification_status` と `privacy_scope` が必ず入る。
- AI下書きと本人確認済み記録をUI上で区別できる。
- Memory Capsuleを一覧、詳細、年表で見られる。
- Personとの関連を表示できる。
- 簡易グラフでMemory CapsuleとPersonの関係を見られる。
- Legacy Packet Draftを作れる。
- `verification_status` と `privacy_scope` の変更がAuditEventに残る。
- 外部共有、削除、送信、専門判断が自動実行されない。

## Validation Checklist

実装時に確認する。

- 記憶作成時に共有範囲未設定の状態が発生しない。
- `confirmed` への変更はユーザー操作が必要。
- AIが生成した推測は `ai_inferences` として本文と分離される。
- `private` な記憶がLegacy Packet Draftに入る時に警告が出る。
- `posthumous` は「将来共有候補」であり、自動送信ではないと表示される。
- 法務、医療、財務の文脈では専門家確認が必要な注意を表示する。
- AIが使えない状態でも手入力で記憶を保存できる。

## Technical Notes

技術選定はこの文書では確定しない。次の設計文書で決める。

ただしv0実装では以下を満たす必要がある。

- 型付きデータモデルを持つ。
- 状態遷移をUIだけでなくロジックでも制約する。
- 共有範囲の拡大には確認ステップを挟む。
- 監査ログを保存できる。
- AI機能を無効化しても基本操作が壊れない。

## Open Questions

- v0の保存先をローカル、クラウド、または両方のどれにするか。
- 認証をv0から入れるか、単一ユーザー前提で始めるか。
- AIプロバイダをどれにするか。
- Legacy Packet Draftの出力形式を画面だけにするか、PDF下書きまで含めるか。
- 写真や音声の添付をv0でメタ情報だけにするか、実体アップロードまで含めるか。

## Next After V0 Spec

この文書の次は、技術選定とアプリ基盤の設計に進む。

推奨する次文書:

```text
docs/technical-foundation.md
```

そこで、Next.jsなどのフレームワーク、保存方式、AI接続方式、UIコンポーネント方針、テスト方針を決める。

