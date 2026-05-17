# 10 Transferable Lessons from PAI

## 1. OS / Dashboard / Assistantを分ける

PAIは `PAI = OS`, `Pulse = Dashboard`, `DA = interface` と明確に分けている。

転用: 記憶分身AIでも「記憶OS」「記憶空間UI」「分身AI人格」を分ける。

分類: 1. 真似したい構造 / 5. 記憶分身AIへ転用可能

## 2. 理想状態を中心概念にする

PAIの全作業は Current State -> Ideal State。これはタスク管理だけでなく人生設計まで貫いている。

転用: 天理教AI大辞典なら「ユーザーが到達したい理解状態」、記憶玉UIなら「未整理記憶 -> 意味づけ済み記憶」として設計できる。

分類: 1. 真似したい構造 / 5. 記憶分身AIへ転用可能

## 3. 記憶を寿命で分ける

PAIは `WORK`, `LEARNING`, `KNOWLEDGE` を分ける。これは非常に強い。

転用: 記憶分身AIでは `RAW_MEMORY`, `EPISODE`, `INSIGHT`, `CANONICAL_KNOWLEDGE`, `PERSONA_RULE` のように段階化する。

分類: 1. 真似したい構造 / 5. 記憶分身AIへ転用可能

## 4. commandsは入口、skillsは能力、hooksは自動化

PAIはslash commandにロジックを詰めず、skillsへ redirect している。

転用: AIオーケストレーションでも `/remember`, `/dictionary`, `/ritual`, `/summon` などは入口にし、実処理はskill/workflowへ置く。

分類: 1. 真似したい構造

## 5. SkillはSKILL.md + Workflows + Toolsで作る

PAIのskillは、説明、呼び出し条件、手順、実行コードを同居させるが、責務は分ける。

転用: 天理教AI大辞典なら `DoctrineSearch`, `TermExplain`, `SermonDraft`, `CitationCheck` のskill化が向く。

分類: 1. 真似したい構造

## 6. public/private境界を命名規則に埋め込む

PAIではpublic skillは `TitleCase`、private skillは `_ALLCAPS`。人間の注意ではなく構造で漏洩を防ぐ。

転用: 記憶分身AIでは公開可能な辞典知識と、個人記憶・相談履歴を命名またはzoneで明確に分ける。

分類: 1. 真似したい構造 / 5. 記憶分身AIへ転用可能

## 7. 初回導線は設定ではなく人格生成にする

PAI installerは名前、DA名、声、TELOSへ導く。これは単なる設定より記憶に残る。

転用: 「あなたの記憶分身に名前をつける」「どんな時に呼び出す存在か決める」「最初の記憶玉を3つ作る」導線が良い。

分類: 5. 記憶分身AIへ転用可能

## 8. Graph UIは全情報表示ではなく探索補助に使う

PAIのKnowledgeGraphはcanvas+d3でノードを描くが、focus、zoom、category色、tooltipで情報量を制御している。

転用: 3D記憶空間では、常に全ラベルを出さず、近づいた記憶玉だけ名前・感情・関連を出す。

分類: 1. 真似したい構造 / 5. 記憶分身AIへ転用可能

## 9. ISAの考え方を「記憶玉の品質基準」に使う

PAIのISAは仕様、テスト、done condition、記録を一つにする。

転用: 記憶玉ごとに「事実」「出典」「感情」「関連人物」「未確認点」「更新履歴」を持たせると、思い出と知識が混ざっても品質を保てる。

分類: 2. 思想だけ採用 / 5. 記憶分身AIへ転用可能

## 10. 常駐daemonは最後でよい

Pulseは強力だが、daemon、launchd、dashboard、voice、scheduler、hooks APIを一体化しており重い。

転用: 最初は常駐daemonを作らず、ローカルWeb app + 明示的同期 + 手動保存でよい。後で「記憶の定期整理」「朝の振り返り」「未整理記憶通知」だけdaemon化する。

分類: 4. 複雑化リスクあり

## 採用優先順位

| 優先 | 採用するもの | 理由 |
|---|---|---|
| A | OS / UI / AI人格の三層分離 | 全体設計の背骨になる |
| A | WORK / LEARNING / KNOWLEDGE 型の記憶分離 | 記憶玉UIの破綻を防ぐ |
| A | Graph focus interaction | 3D記憶空間に直結 |
| A | Onboarding interview | 記憶分身AIの初回体験に直結 |
| B | SKILL.md / Workflows / Tools | AIオーケストレーションの拡張単位 |
| B | ISAの品質基準 | 記憶玉と辞典項目の検証に使える |
| C | hooks | 最小構成から始める |
| C | Pulse daemon | 後期に採用 |
| C | cross-vendor agents | 高度化後でよい |

## 自分には不要または後回し

| 項目 | 判断 |
|---|---|
| 45 skills規模の初期投入 | 3. 自分には不要 |
| E4/E5の128/256 ISC分解 | 4. 複雑化リスクあり |
| launchd + menu bar app | 4. 複雑化リスクあり |
| Telegram/iMessage統合 | 2. 思想だけ採用 |
| release shadow tooling全移植 | 2. 思想だけ採用 |
