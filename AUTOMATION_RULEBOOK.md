# Automation Rulebook

この文書は、終活・人生記録アプリにおける自動化、フルオート機能、AIエージェント実行の安全境界を定義する。

このアプリは、本人の記憶、意思、家族共有、死後共有に関わる。便利さよりも、本人確認、共有範囲、監査可能性を優先する。

## Core Rule

自動化してよいのは、整理、分類、下書き、提案、検証補助まで。

本人の意思確定、共有、削除、外部送信、法務・医療・財務判断は、人間の明示的な確認なしに実行してはいけない。

```text
Full auto allowed:
  collect, classify, summarize, link, draft, suggest, validate

Human confirmation required:
  confirm, share, delete, send, publish, decide
```

## Automation Levels

| Level | Name | Meaning | Allowed In Early Version |
|---|---|---|---|
| 0 | Manual Only | ユーザーが全操作を行う | Yes |
| 1 | Assisted | AIが候補や質問を出す | Yes |
| 2 | Draft Automation | AIが下書きや分類を自動生成する | Yes |
| 3 | Scheduled Drafting | 定期的に未整理素材を処理して下書きを作る | Later |
| 4 | Rule-Bound Auto Update | 確認済みルール内で自動反映する | Later, limited |
| 5 | External Action Automation | 共有、送信、通知、公開を自動実行する | No |

初期版はLevel 0から2までを基本とする。Level 3以上は、監査ログ、取り消し導線、権限設計ができるまで入れない。

## Fully Automated Allowed

以下はフルオート実行してよい。ただし結果は原則として `drafted` または提案状態に置く。

- Raw CaptureからDraft Memory候補を作る。
- 音声、メモ、写真説明、会話ログを要約する。
- 人物、場所、時期、感情、価値観の候補を抽出する。
- 関連しそうなMemory Capsuleを提案する。
- 未確認点を質問リストへ変換する。
- Legacy Packetの下書きを作る。
- 重複していそうな記憶を検出する。
- 共有範囲未設定、根拠不足、日付不明などの品質問題を検出する。
- 設計文書やテストの不足を指摘する。
- GitHubブランチ上で、明示された範囲のコード生成、テスト、lint、ドキュメント更新を行う。

## Human Confirmation Required

以下は、本人または権限を持つ人間の明示確認が必要。

- Draft MemoryをCanonical Memoryへ昇格する。
- `verification_status` を `confirmed` にする。
- `privacy_scope` をより広い共有範囲へ変更する。
- 家族、代理人、専門家を招待する。
- Legacy Packetを共有可能状態にする。
- 死後共有、指定日共有、外部通知の設定を有効化する。
- 記憶、添付ファイル、人物情報を削除する。
- 医療、介護、葬儀、財産、相続に関する意思を確定扱いにする。
- AI人格の口調や回答方針を、本人らしさとして固定する。

確認UIには、何が変わるか、誰が見られるようになるか、取り消せるかを表示する。

## Never Automate

以下は自動化してはいけない。

- 本人確認なしに意思や希望を確定する。
- 本人確認なしに家族へ情報を送る。
- 非公開記憶を共有範囲外の相手へ見せる。
- AI推測を本人の言葉として表示する。
- 法的効力のある遺言、契約、同意を自動作成・確定する。
- 医療判断、財務判断、税務判断を断定する。
- 死亡判定や死後処理の開始をアプリ単独で決める。
- 監査ログなしに共有、削除、権限変更を行う。
- ユーザーが理解できない形で外部連携を有効化する。

## Memory State Rules

記憶状態は自動化の安全境界になる。

| State | Automation Rule |
|---|---|
| raw | 自動分類・要約可。AI応答の根拠には原則不可 |
| drafted | 自動更新可。ただし未確認表示を必須にする |
| reviewed | 本人が読んだ状態。AIが勝手にconfirmedへ進めない |
| confirmed | 本人確認済み。変更時は履歴を残す |
| disputed | 矛盾あり。共有時に警告し、自動確定しない |

AIが生成した情報は、本文へ混ぜ込む前に `ai_inferences` または下書きとして分離する。

## Privacy Scope Rules

共有範囲は狭い方へは自動変更してよい。広い方へは自動変更してはいけない。

```text
Allowed automatically:
  trusted_family -> private
  posthumous -> private
  public -> private

Not allowed automatically:
  private -> trusted_family
  trusted_family -> executor
  executor -> posthumous
  posthumous -> public
```

共有範囲を広げる提案はできる。ただし変更は人間確認を必須にする。

## Sharing and External Actions

外部に影響する操作は、初期版ではすべて人間確認を必須にする。

対象:

- メール送信
- SMS、LINE、SNS、メッセンジャー送信
- 家族招待
- 代理人招待
- ファイル共有リンク作成
- PDFやLegacy Packetの外部共有
- カレンダー、通知、死後送信予約
- GitHub issue、PR、releaseなど外部に見える公開操作

実装時は、操作前に確認画面を出し、操作後に監査ログを残す。

## AI Companion Rules

Life Companionは、本人の代弁者ではなく、まず記憶整理の伴走者として振る舞う。

許可:

- 本人の記録を探す。
- 確認済み記憶を根拠に要約する。
- 家族向け説明の下書きを作る。
- 本人に追加質問をする。
- 未確認情報であることを明示して仮説を出す。

禁止:

- 「本人はこう望んでいる」と根拠なく断定する。
- AI生成文を本人の発言として扱う。
- 未確認の記憶を確認済みのように話す。
- 共有範囲外の記憶を会話に出す。
- 専門家判断が必要な内容を確定する。

## GitHub and Development Automation

開発作業の自動化は許可する。ただし、作業ブランチ上で行い、`main` へ直接 push しない。

許可:

- 作業ブランチ作成
- docs更新
- 実装
- lint、test、typecheck実行
- PR本文の下書き
- CI失敗調査
- 依存関係の調査

確認必須:

- `main` へのmerge
- release作成
- production deploy
- 大量ファイル削除
- ライセンスや個人情報を含むファイル追加
- 外部APIキー、secret、credentialの追加

## Audit Log Requirements

以下の操作は監査ログを残す設計にする。

- `verification_status` の変更
- `privacy_scope` の変更
- Legacy Packetの作成、更新、共有
- 添付ファイルの追加、削除
- 家族、代理人、専門家の招待
- AIによる要約、昇格提案、共有提案
- 外部連携設定の変更

監査ログには最低限、日時、実行者、変更前、変更後、根拠、取り消し可否を持たせる。

## Review Checklist

自動化機能を設計または実装する前に確認する。

- この処理は整理、下書き、提案の範囲に収まっているか。
- `confirmed` への昇格を自動で行っていないか。
- 共有範囲を広げる処理が自動化されていないか。
- AI推測と本人確認済み情報が分離されているか。
- 操作前確認が必要な処理に確認UIがあるか。
- 監査ログが必要な処理にログ設計があるか。
- 家族が読んだ時に、本人の言葉とAI要約を区別できるか。
- 法務、医療、財務の断定をしていないか。

