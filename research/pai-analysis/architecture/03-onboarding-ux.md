# PAI Onboarding and Install UX Analysis

## オンボーディングの流れ

PAIの初回導線は、単なるインストールではなく「AIに人格と目的地を与える」儀式として設計されている。

```text
READMEで世界観を提示
  -> one-line install
    -> installer wizard
      -> prerequisites検出
      -> identity入力
      -> DA voice選択
      -> Pulse起動
      -> validation
        -> /interview
          -> TELOS
          -> IDEAL_STATE
          -> preferences
          -> identity tuning
```

## Install UXの設計

`PAI-Install/README.md` と `engine/steps.ts` から、installは9段階の状態機械になっている。

| Step | 役割 | UX上の意味 | 分類 |
|---|---|---|---|
| System Detection | OS、tool、既存install確認 | ユーザーが何を準備すべきか考えなくてよい | 1. 真似したい構造 |
| Prerequisites | Git, Bun, Claude Code | 依存関係をwizard側で吸収 | 1. 真似したい構造 |
| API Keys | ElevenLabs key | 音声をoptionalにし、失敗しても継続 | 1. 真似したい構造 |
| Identity | user name, DA name, timezone | AIを「道具」から「自分のDA」に変える | 5. 記憶分身AIへ転用可能 |
| Repository | clone/update | 実体を `~/.claude` に配置 | 2. 思想だけ採用 |
| Configuration | settings, env, alias | 使用開始に必要な面倒を隠す | 1. 真似したい構造 |
| Voice | voice selection, Pulse | DAに声を与え、存在感を作る | 5. 記憶分身AIへ転用可能 |
| Telegram optional | 外部接点 | 常時接続性の布石 | 2. 思想だけ採用 |
| Validation | health check | 「入ったはず」を「動く」に変える | 1. 真似したい構造 |

## Interview UX

`skills/Interview/SKILL.md` は初回の個人化を「フォーム入力」ではなく「会話」にしている。

重要な設計:

- Phase 1はTELOS。使命、目標、問題、戦略、信念、知恵を先に埋める。
- Phase 2はIDEAL_STATE。健康、お金、自由、関係性、創造性など。
- Phase 3は嗜好。本、映画、食、学習、地域など。
- Phase 4は現在状態と本人identity。
- 1問ずつ聞く。スキーマ入力はAIが代行する。
- 完成度80%以上はReview mode、未満はFill mode。
- 大きな編集前はbackup。

## なぜこの構造なのか

PAIは「AIを入れる」だけでは価値が出ない。ユーザーの理想状態、価値観、人格、関係性が入って初めてLife OSになる。だから初回導線は以下の順で設計されている。

1. 世界観に納得させる。
2. installを1行にする。
3. wizardで不安を減らす。
4. DAに名前と声を与える。
5. TELOSで目的地を与える。
6. Pulseで状態を見える化する。

## 自分のプロジェクトへの示唆

| 転用案 | 対象プロジェクト | 分類 |
|---|---|---|
| 初回に「あなたの分身の名前」を決める | 記憶分身AI | 5. 記憶分身AIへ転用可能 |
| 初回に「人生/信仰/学習の目的地」を聞く | 天理教AI大辞典, 記憶分身AI | 5. 記憶分身AIへ転用可能 |
| API keyや連携はoptionalにする | AIオーケストレーション | 1. 真似したい構造 |
| install後にvalidation checklistを出す | 全体 | 1. 真似したい構造 |
| 一括フォームではなく会話式スキャンにする | 記憶玉UI | 1. 真似したい構造 |
| voiceやvisual identityを後回しにせず初期体験に入れる | 3D記憶空間 | 2. 思想だけ採用 |

## 不要または注意

| 項目 | 判断 | 理由 |
|---|---|---|
| Electron installer | 3. 自分には不要 | 初期検証段階ではWebだけで十分 |
| launchd常駐 | 4. 複雑化リスクあり | 常時daemonはデバッグと権限設計が重い |
| voice必須体験 | 4. 複雑化リスクあり | 日本語音声品質や費用がUXを左右する |
| Telegram/iMessage | 2. 思想だけ採用 | 外部接続は成熟後でよい |

