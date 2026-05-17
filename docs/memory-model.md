# Memory Model

## Purpose

この文書は、終活・人生記録アプリにおける記憶データの型、寿命、信頼度、共有範囲を定義する。PAIの `WORK / LEARNING / KNOWLEDGE` 分離を参考にしつつ、本人確認と家族共有に耐えるモデルへ変換する。

## Core Idea

すべての入力をすぐに「本人の記憶」として扱わない。音声、写真、メモ、AI要約、家族の証言、本人が確認した記録は、それぞれ信頼度と扱い方が違う。

このアプリでは、記憶を次のパイプラインで育てる。

```text
Raw Capture
  -> Draft Memory
    -> Memory Capsule
      -> Canonical Memory
        -> Legacy Packet
```

AIはこの変換を補助するが、本人確認なしにCanonical Memoryへ昇格させない。

## Memory Layers

| Layer | Meaning | Editable By | AI Can Use As Grounding |
|---|---|---|---|
| Raw Capture | 未整理の素材。音声、写真、メモ、会話ログ | 本人、許可された支援者 | 原則不可。整理候補としてのみ |
| Draft Memory | AIまたは本人が仮に構造化した記憶 | 本人、AI提案 | 限定可。未確認であることを明示 |
| Memory Capsule | 1つの出来事・人物・価値観として読める単位 | 本人中心 | 可。ただし確認状態を表示 |
| Canonical Memory | 本人が確認済みの記憶 | 本人。変更時は履歴を残す | 可。Life Companionの主要根拠 |
| Legacy Packet | 家族や代理人へ渡すために編集された束 | 本人、共有権限者 | 可。共有先に応じて制御 |

## Memory Capsule Schema

最小単位は `Memory Capsule`。実装時のフィールド候補は以下。

| Field | Type | Notes |
|---|---|---|
| id | string | 安定ID |
| title | string | 本人またはAIが付ける短い題名 |
| summary | string | 家族にも読める短い説明 |
| body | markdown | 本文。長文、会話、引用を含めてよい |
| memory_type | enum | episode, person, value, wish, document, object, place, lesson |
| life_period | enum/string | 幼少期、学生時代、仕事、結婚、子育て、晩年など |
| occurred_at | date/date_range/unknown | 不明を許容する |
| people | relation[] | 関連人物 |
| places | place[] | 関連場所 |
| emotions | string[] | 喜び、後悔、感謝、葛藤など |
| values | string[] | 大切にしている価値観 |
| artifacts | attachment[] | 写真、音声、PDF、手紙など |
| source_refs | source[] | どの素材から作られたか |
| ai_inferences | inference[] | AIが推測した要素。本文と分離 |
| verification_status | enum | raw, drafted, reviewed, confirmed, disputed |
| privacy_scope | enum | private, trusted_family, executor, posthumous, public |
| share_after | enum/date/null | 今すぐ、死後、指定日、共有しない |
| unresolved_questions | string[] | 本人や家族に聞くべきこと |
| related_memory_ids | string[] | グラフ接続 |
| version_history | revision[] | 重要変更の履歴 |

## Memory Types

| Type | Use |
|---|---|
| episode | 出来事。人生記録の中心 |
| person | 人物に関する記憶、関係性、伝えたいこと |
| value | 信念、判断軸、人生で大切にしたこと |
| wish | 医療、介護、葬儀、相続、家族への希望 |
| document | 保険、口座、契約、遺言、証明書などの所在と説明 |
| object | 形見、作品、道具、家、写真など |
| place | 故郷、職場、思い出の場所 |
| lesson | 人生から得た教訓、後世へ伝えたいこと |

`wish` と `document` は特に注意する。AIは法的効力を断定せず、専門家確認が必要な項目を明示する。

## Verification Status

| Status | Meaning | UX Requirement |
|---|---|---|
| raw | 未整理素材 | Inboxに置く。AI応答根拠にはしない |
| drafted | AIまたは本人が仮整理 | 未確認バッジを出す |
| reviewed | 本人が読んだが未確定 | 修正依頼と未解決質問を残す |
| confirmed | 本人確認済み | AI応答と共有の根拠にできる |
| disputed | 本人、家族、資料で矛盾あり | 共有時に注意表示する |

## Privacy Scope

PAIのpublic/private境界を、このアプリでは共有範囲としてデータ構造に埋め込む。

| Scope | Meaning |
|---|---|
| private | 本人だけが見る |
| trusted_family | 指定した家族だけ |
| executor | 代理人、遺言執行者、支援者向け |
| posthumous | 死後に共有可能。ただし自動送信は初期非対応 |
| public | 公開可能な作品、講話、経歴など |

共有範囲は記憶単位だけでなく、添付ファイル、本文の一部、AI要約にも必要になる。将来的にはフィールド単位の共有制御を検討する。

## Source and Provenance

記憶の信頼性は、何から作られたかで大きく変わる。すべてのMemory Capsuleは `source_refs` を持つ。

| Source Type | Example | Trust Notes |
|---|---|---|
| principal_voice | 本人の音声 | 強いが文字起こしミスに注意 |
| principal_text | 本人の手書き、メモ、入力 | 強い |
| family_testimony | 家族の証言 | 本人確認前は補助情報 |
| document | 契約書、証明書、写真 | 原本性と日付が重要 |
| ai_summary | AI生成の要約 | 根拠にはできるが事実扱いしない |
| imported_data | 外部サービスからのインポート | 取得元と日時を残す |

## AI Inference Rules

AIができること:

- 入力を要約する。
- 出来事、人物、場所、感情の候補を抽出する。
- 関連しそうな記憶を提案する。
- 家族向け説明文の下書きを作る。
- 未確認点を質問に変える。

AIがしてはいけないこと:

- 本人確認なしにCanonical Memoryへ昇格する。
- 推測した感情や動機を事実として本文へ混ぜる。
- 法的、医療的、財務的な結論を断定する。
- 共有範囲を勝手に広げる。
- 死後共有や外部送信を自動で実行する。

## Relationship Graph

記憶空間では、ノードとエッジで関係を見る。

### Nodes

- Memory Capsule
- Person
- Place
- Value
- Document
- Artifact
- Legacy Packet

### Edges

| Edge | Meaning |
|---|---|
| mentions | 本文中で言及 |
| happened_with | 一緒に起きた |
| belongs_to_period | 人生時期に属する |
| expresses_value | 価値観を表す |
| supports_wish | 意思や希望の背景になる |
| derived_from | 素材から生成された |
| included_in_packet | Legacy Packetに含まれる |

3D記憶空間を作る場合も、このグラフを直接編集対象にしない。探索、近傍表示、思い出し補助に使い、確認と編集は詳細画面で行う。

## Legacy Packet

Legacy Packetは、特定の相手や目的のために編集された記憶の束。

例:

- 家族に伝えたいこと
- 医療・介護の希望
- 葬儀の希望
- 事業や作品の引き継ぎ
- 大切な写真と説明
- 子どもや孫へ残す人生の教訓

Legacy PacketはMemory Capsuleへの参照を持つ。内容をコピーして孤立させるのではなく、根拠記憶へ戻れるようにする。

## Open Design Questions

- 本人が亡くなった後の状態遷移をどう扱うか。
- 家族が追記した記憶と本人確認済み記憶をどう並べるか。
- フィールド単位の共有制御を初期から入れるか。
- 音声や写真からの自動抽出をどこまで許すか。
- 日本の法務・相続・介護文脈に必要な専門家確認フラグをどう設計するか。

