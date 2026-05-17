# AI Agent, Commands, Hooks, Skills Responsibility Split

## 主要結論

PAIでは、AIエージェント設計を「人格」「能力」「自動化」「入口」「記憶」に分けている。これにより大量機能を持ちながら、どこに何を書くべきかの判断基準が比較的明確になる。

## commands / hooks / skills の責務分離

| 要素 | 役割 | 例 | やらないこと | 分類 |
|---|---|---|---|---|
| `commands/` | ユーザーが呼ぶ短縮入口 | `/context-search`, `/pu` | 実ロジックを持ちすぎない | 1. 真似したい構造 |
| `skills/` | ドメイン能力とワークフロー | `ISA`, `Interview`, `Research`, `Knowledge` | セッション横断の常時監視はしない | 1. 真似したい構造 |
| `hooks/` | Claude Codeイベントに反応する自動化 | `PromptProcessing`, `LoadContext`, `SecurityPipeline`, `ISASync` | ユーザー向けの長い作業手順を持たない | 2. 思想だけ採用 / 4. 複雑化リスクあり |
| `agents/` | 作業役割・人格・専門家 | `Engineer`, `Forge`, `Cato`, `Architect` | ドメイン知識全体を抱え込まない | 2. 思想だけ採用 |
| `PAI/TOOLS/` | 決定的処理 | `MemoryRetriever.ts`, `KnowledgeGraph.ts`, `InterviewScan.ts` | promptで代替できる雑ロジックにしない | 1. 真似したい構造 |

## AIエージェント設計で重要な箇所

| 箇所 | 重要性 | 転用先 |
|---|---|---|
| `PAI_SYSTEM_PROMPT.md` | DAの人格、禁止事項、検証、セキュリティを憲法化 | 記憶分身AIの人格核 |
| `CLAUDE.md` | 実行モード、context routing、作業作法を運用化 | AIオーケストレーションの管制塔 |
| `DOCUMENTATION/Agents/AgentSystem.md` | task subagent / named agent / custom agentを分ける | 複数人格・専門家AIの責務設計 |
| `DOCUMENTATION/Algorithm/AlgorithmSystem.md` | 7 phaseで作業を現在状態から理想状態へ進める | 長期大型AIプロジェクト管理 |
| `DOCUMENTATION/Isa/IsaSystem.md` | ISAを仕様・テスト・完了条件・記録に統合 | 3D記憶空間や辞典項目の品質基準 |
| `DOCUMENTATION/Memory/MemorySystem.md` | 記憶をWORK / LEARNING / KNOWLEDGEへ分ける | 記憶玉UIの分類軸 |

## なぜこの構造なのか

PAIは「AIに毎回うまく頼む」構造ではなく、「AIが読むべき世界をあらかじめ作る」構造。これは以下の前提に基づいている。

1. モデル単体より、周囲のcontext scaffoldingが重要。
2. 長期利用では、毎回の会話よりも記録・学習・検索・検証が重要。
3. promptsで処理するより、可能な限りTypeScriptツールやCLIへ落とすほうが安定する。
4. 個人情報を扱うので、public/privateの境界は運用ルールではなく構造に埋め込む必要がある。
5. AIの人格は飾りではなく、ユーザーとの継続関係を支えるUIレイヤーである。

## 複雑化リスク

| リスク | 内容 | 自分のプロジェクトでの扱い |
|---|---|---|
| hook過多 | 37 hooks規模になるとデバッグが難しい | 最初は5個以内: startup, prompt classify, memory write, security guard, completion |
| Algorithm過剰 | E1-E5, ISC大量分解は小規模作業では重い | 「軽量ISA」と「正式ISA」の2段階で始める |
| agent名の増殖 | named/custom/task/cross-vendorが混線する | まずは「分身AI」「調査AI」「検証AI」の3種まで |
| UI面の肥大 | Pulseの22 routesは初期には多すぎる | 最初は「記憶」「人物」「目標」「作業」「システム」だけ |
| 世界観の先行 | Life OSの思想が強く、機能理解前に圧倒される | 自分のプロジェクトでは教材的説明と実用導線を分ける |

## 記憶分身AIへの転用可能性

PAIのDAは「一体のAIがOS全体のインターフェースになる」という思想。記憶分身AIでは、これをさらに「本人の記憶・価値観・言葉遣い・判断軸の代表体」に置き換えられる。

転用するなら、以下の分離が有効。

```text
記憶分身AI
  -> Persona constitution: 口調・価値観・禁止事項
  -> Context routing: どの記憶領域をいつ読むか
  -> Memory graph: 人物・出来事・教え・感情・作品
  -> Skills: 調査、要約、説法生成、辞典検索、対話
  -> Hooks: セッション開始時の記憶ロード、終了時の学習保存
  -> Dashboard: 記憶空間、目標、未整理記憶、最近の学び
```

