# Application Map for Your Projects

## 記憶分身AI

PAIから最も強く転用できる。

| PAI概念 | 記憶分身AIでの対応 | 分類 |
|---|---|---|
| DA Identity | 分身AIの名前、声、口調、距離感 | 5. 記憶分身AIへ転用可能 |
| Principal Identity | 本人のプロフィール、価値観、人生文脈 | 5. 記憶分身AIへ転用可能 |
| TELOS | 本人が向かいたい方向、信仰・仕事・人生目標 | 5. 記憶分身AIへ転用可能 |
| MEMORY/WORK | 最近の相談、作業、未整理対話 | 5. 記憶分身AIへ転用可能 |
| MEMORY/LEARNING | 分身AIが学んだ対応改善、言葉遣い、失敗 | 5. 記憶分身AIへ転用可能 |
| MEMORY/KNOWLEDGE | 人物、出来事、教え、概念、作品 | 5. 記憶分身AIへ転用可能 |
| Interview skill | 初回人格・記憶収集インタビュー | 5. 記憶分身AIへ転用可能 |

最小構成:

```text
memory-ai/
  persona/
    principal.md
    avatar.md
    relationship.md
  memory/
    raw/
    episodes/
    insights/
    knowledge/
    unresolved/
  skills/
    Interview/
    Recall/
    SummarizeMemory/
    ConnectMemory/
  ui/
    MemorySpace
    MemoryGraph
    MemoryDetail
```

## 記憶玉UI

PAIのKnowledgeGraphとTELOS graphが参考になる。ただし3Dは最初から全機能を載せない。

| UI要素 | 転用 |
|---|---|
| category color | 記憶玉の種類を色固定 |
| backlink count -> radius | 関連数で玉の大きさを変える |
| focus -> neighbors | 選択中の記憶玉と近傍だけ強調 |
| tooltip | hover/nearで短い要約を出す |
| second click opens | 1 click focus、2 click詳細 |
| zoom-dependent labels | 近距離だけラベル表示 |

分類: 1. 真似したい構造 / 5. 記憶分身AIへ転用可能

## 3D記憶空間

PAIに本格3D実装は見当たらないが、情報設計は転用できる。

推奨設計:

```text
Center: 本人 / 分身AI / TELOS
Orbit 1: 人物
Orbit 2: 出来事
Orbit 3: 教え・概念
Orbit 4: 作品・資料
Orbit 5: 未整理記憶
```

分類: 2. 思想だけ採用 / 5. 記憶分身AIへ転用可能

## 天理教AI大辞典

PAIのKnowledge Archiveがそのまま辞典設計に向く。

| PAI Knowledge type | 辞典での型 |
|---|---|
| People | 教祖、先人、研究者、話者 |
| Ideas | 教理概念、解釈、信仰実践 |
| Research | 文献調査、比較研究、出典付き調査 |
| Companies | 団体、教会、出版元などに置換 |

転用する構造:

- Markdown frontmatter
- wikilinks
- tag
- source/provenance
- confidence/status
- graph view
- citation check skill

分類: 1. 真似したい構造

## AIオーケストレーションシステム

PAIのagent systemから「agentの種類を混ぜない」ことを採用する。

| 種別 | 自分のシステムでの意味 |
|---|---|
| Named agents | 固定人格: 辞典編集者、記憶整理者、検証者 |
| Task agents | 一時作業者: 要約、分類、チェック |
| Custom agents | ユーザー指定で生成する一時人格 |
| Hooks | セッション開始、保存、検証、危険操作前確認 |
| Skills | ドメイン別能力: 教理検索、記憶接続、出典検証 |

分類: 2. 思想だけ採用 / 4. 複雑化リスクあり

