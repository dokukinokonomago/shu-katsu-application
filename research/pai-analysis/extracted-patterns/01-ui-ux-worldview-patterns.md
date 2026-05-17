# UI/UX and Worldview Patterns Extracted from PAI

## 重要なUI/UX箇所

| 箇所 | 内容 | なぜ重要か | 分類 |
|---|---|---|---|
| `README.md` hero | logo、typing SVG、badges、動画、one-line install | 最初に世界観、信頼性、導線を同時提示 | 1. 真似したい構造 |
| `Releases/v5.0.0/README.md` | Life OS、DA中心図、skills constellation、ISA図 | 抽象概念を視覚メタファーで理解させる | 1. 真似したい構造 |
| `PAI/PULSE/Observability/src/components/AppHeader.tsx` | Life navとSystem navの二段ナビ | 個人生活領域とAIシステム領域を分離 | 5. 記憶分身AIへ転用可能 |
| `telos/_v7/hero.tsx` | narrative + current/ideal rings | 数値だけでなく「今どこに向かっているか」を物語化 | 5. 記憶分身AIへ転用可能 |
| `telos/_v7/app.tsx` | columns / tree / graph切替 | 同じ情報を用途別に表示する | 1. 真似したい構造 |
| `components/wiki/KnowledgeGraph.tsx` | canvas + d3 force layout | 大量知識をノードと関係で探索可能にする | 5. 記憶分身AIへ転用可能 |
| `PAI-Install/public/*` | dark glassmorphic installer | installを作業ではなく導入体験に変える | 2. 思想だけ採用 |

## 世界観設計

PAIの世界観は「AIツール」ではなく「Life Operating System」。世界観は飾りではなく、情報設計の最上位概念として機能している。

| 世界観要素 | 構造上の対応 | 効果 |
|---|---|---|
| Life OS | `PAI/` と `Pulse` と `DA` の三層 | ツール群ではなく生活基盤として理解できる |
| DA | `DA_IDENTITY.md`, voice, assistant route | ユーザーが対話する相手を一体化する |
| TELOS | `USER/TELOS/`, `/interview`, `/telos` | 理想状態をAI判断の中心に置く |
| Current -> Ideal | Algorithm, ISA, dashboard rings | 作業も人生も同じ差分解消モデルで扱う |
| Memory compounds | `MEMORY/WORK`, `LEARNING`, `KNOWLEDGE` | 使うほど賢くなる感覚を構造化 |
| Pulse | dashboard, daemon, voice, hooks | 見えないAI処理を見えるOSにする |

## 大量情報を破綻させない整理方法

PAIは大量情報を「全部を一覧化」するのではなく、複数の軸で分割している。

1. 生活領域とシステム領域をナビで分ける。
2. 記憶をWORK / LEARNING / KNOWLEDGEに分ける。
3. 知識はPeople / Companies / Ideas / Researchの型で分ける。
4. 作業はISAに集約し、仕様・テスト・記録を分散させない。
5. skillはTitleCase public、_ALLCAPS privateで公開境界を命名に埋め込む。
6. hooksはイベント別に分け、ユーザー導線とは混ぜない。
7. PulseはLife, Work, Health, Finance, Businessなどの生活ルートと、Hooks, Skills, Agents, Securityなどのsystemルートを分ける。

## 宇宙空間型 / 3DパーティクルUIとして見た場合

PAI自体はThree.jsの本格3D空間を中心にしているわけではない。観測できた実装は主に以下。

- `KnowledgeGraph.tsx`: canvas + d3 force layoutによるノードグラフ。
- `telos/_v7/app.tsx`: SVGによるconcentric radial graph。
- `telos/_v7/rings.tsx`: SVG ringでcurrent/ideal gapを可視化。
- `globals.css`, `styles.css`: dark navy、radial-gradient、glow、glass panel、CRT scanline風演出。

つまり「宇宙空間型3DパーティクルUI」として直接真似する対象というより、PAIから抽出すべきは以下。

| 抽象パターン | 3D記憶空間への転用 |
|---|---|
| ノードは情報単位、エッジは意味関係 | 記憶玉を人物・出来事・教え・感情で接続 |
| 中心にmission/telosを置き、外側へ具体化 | 中心に本人/教義/テーマ、外周に記憶玉 |
| zoom時だけlabelを出す | 3D空間で近づいた記憶玉だけ詳細表示 |
| categoryごとに色を固定 | 記憶種別ごとに色・軌道・粒度を固定 |
| focus時に近傍だけ強調 | 記憶玉選択時、関連記憶だけ光らせる |
| columns/tree/graph切替 | 3Dだけでなく一覧・年表・辞典表示を併設 |

## UIで真似したい構造

| Pattern | 転用案 | 分類 |
|---|---|---|
| 二段ナビ | 「記憶世界」navと「AIシステム」navを分ける | 1. 真似したい構造 |
| Current vs Ideal rings | 現在の記憶整理度、信頼度、未整理度をring化 | 5. 記憶分身AIへ転用可能 |
| Graph focus interaction | 記憶玉クリックで近傍記憶をハイライト | 5. 記憶分身AIへ転用可能 |
| EmptyStateGuide | 初期データがない時に「何を入れるか」を示す | 1. 真似したい構造 |
| Observer mode | 個人情報非表示モード | 5. 記憶分身AIへ転用可能 |
| Voice feedback | 長期処理や保存時に短い音声確認 | 2. 思想だけ採用 |

## 注意点

PAIのUIは情報密度が高く、世界観も強い。3D化する場合、いきなり全情報を宇宙空間に置くと破綻する。

推奨:

```text
Level 1: 5-7カテゴリだけを星系として見せる
Level 2: 選択カテゴリ内で記憶玉を表示
Level 3: 近傍/関連のみをパーティクル接続
Level 4: 詳細はカード/辞典/会話パネルで読む
```

3D空間は「探索」と「記憶の位置感覚」に使い、編集・検証・長文閲覧は2D UIに逃がすのが現実的。
