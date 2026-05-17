# PAI Major Folder Roles

## 全体構造

`source/Personal_AI_Infrastructure` は、公開説明、パック配布、リリース済みの `.claude` 実体、画像・ツールを同居させた教材的リポジトリになっている。

| フォルダ | 役割 | なぜこの構造か | 分類 |
|---|---|---|---|
| `README.md` | 公開ピッチ、思想、導入導線 | 入口で「何を作っているか」を世界観として提示するため | 1. 真似したい構造 |
| `images/` | 公開README用の概念図 | 抽象概念を図で先に理解させるため | 1. 真似したい構造 |
| `Packs/` | skillの供給元、配布単位 | 機能をOS本体から切り離して追加可能にする | 1. 真似したい構造 |
| `Releases/` | バージョン別の完成スナップショット | 大型AIシステムの進化を履歴ごと教材化する | 1. 真似したい構造 |
| `Releases/v5.0.0/.claude/` | 実際に `~/.claude` へ入るOS本体 | インストール後の実体をそのまま読めるようにする | 1. 真似したい構造 |
| `Tools/` | リポジトリ保守・検証ツール | 配布前の安全性やバックアップを自動化する | 2. 思想だけ採用 |

## v5.0.0 `.claude` 内の役割

| フォルダ | 役割 | 設計意図 | 分類 |
|---|---|---|---|
| `CLAUDE.md` | 運用手順とルーティング表 | 毎セッション読む「操作マニュアル」を一箇所にする | 1. 真似したい構造 |
| `PAI/PAI_SYSTEM_PROMPT.md` | 憲法レイヤー | 絶対に破ってはいけないルールを最上位に固定する | 2. 思想だけ採用 |
| `PAI/DOCUMENTATION/` | サブシステムの設計文書 | 迷ったら読める一次情報を内部に持つ | 1. 真似したい構造 |
| `PAI/ALGORITHM/` | 7 phase実行エンジンの教義 | 作業品質を属人的な勘から手順化する | 2. 思想だけ採用 / 4. 複雑化リスクあり |
| `PAI/MEMORY/` | WORK / LEARNING / KNOWLEDGE | 作業、学習、知識を寿命別に分けて蓄積する | 1. 真似したい構造 / 5. 記憶分身AIへ転用可能 |
| `PAI/USER/` | 個人文脈、TELOS、設定 | systemとuserを分け、公開可能性と個人化を両立する | 1. 真似したい構造 / 5. 記憶分身AIへ転用可能 |
| `PAI/PULSE/` | 常駐daemon、Life Dashboard、通知 | AIが会話外でも動くためのランタイム | 2. 思想だけ採用 / 4. 複雑化リスクあり |
| `PAI/TOOLS/` | TypeScript実行ツール群 | promptsではなくdeterministic codeで処理する | 1. 真似したい構造 |
| `hooks/` | Claude Code lifecycle automation | セッション開始、入力、ツール実行、終了時にOS的処理を走らせる | 2. 思想だけ採用 / 4. 複雑化リスクあり |
| `skills/` | ドメイン能力単位 | AIの能力を自動発火するモジュールとして分割する | 1. 真似したい構造 |
| `agents/` | 役割別エージェント定義 | 専門性と声・人格を作業単位に割り当てる | 2. 思想だけ採用 |
| `commands/` | slash command入口 | よく使う導線を短縮し、実処理はskillへ委譲する | 1. 真似したい構造 |

## 構造の抽象化

PAIの構造は以下の階層で整理できる。

```text
Worldview / Thesis
  -> Constitutional rules
    -> Operational routing
      -> Lifecycle hooks
        -> Skills / Agents / Tools
          -> Memory / ISA / Verification evidence
            -> Pulse dashboard
```

重要なのは、フォルダが技術種類だけでなく「寿命」と「責務」で分かれていること。

- `USER/`: 長期個人文脈
- `MEMORY/WORK/`: タスク単位の短中期記録
- `MEMORY/LEARNING/`: 再利用可能な反省
- `MEMORY/KNOWLEDGE/`: 名前で検索する長期知識
- `skills/`: 能力
- `hooks/`: 自動化
- `commands/`: 呼び出し口
- `PULSE/`: 観測面

