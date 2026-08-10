# タスク管理アプリ（研修アウトプット）

Vue 3 + Node.js/Express の学習内容を、実際に手を動かしながら復習するために作成したシンプルなタスク管理アプリです。実務案件ではなく、研修で学んだ技術要素を一通り実践することを目的としています。

## 1. プロジェクト概要

- **目的**：研修で学習した Vue 3（Composition API）と Node.js/Express の内容を、シンプルなCRUDアプリを通じて復習・アウトプットする
- **題材**：タスク管理アプリ（一覧表示・追加・編集・削除）
- **作り方**：8つのステップに分割し、1ステップごとに「実装 → 動作確認 → 説明」を繰り返しながら進めた

## 2. 使用技術

| 分類 | 技術 |
|---|---|
| フロントエンド | Vue 3（Composition API / `<script setup>`）、Vite |
| バックエンド | Node.js、Express |
| データ通信 | REST API（JSON）、`fetch` |
| データ保存 | JSONファイル（`tasks.json`） |
| スタイリング | 素のCSS（Flexbox、メディアクエリ、CSSカスタムプロパティ） |

外部UIフレームワークやORMは使わず、標準的な仕組みだけで一通りのCRUDアプリが作れることを確認する構成にしています。

## 3. 実装した機能

- タスク一覧表示（`GET /api/tasks`）
- タスク追加（`POST /api/tasks` ＋ 入力チェック）
- タスク編集（`PUT /api/tasks/:id` ＋ 入力チェック）
- タスク削除（`DELETE /api/tasks/:id` ＋ 確認ダイアログ）
- 入力チェック（未入力エラーをフロント・バック両方で実施）
- APIエラー時のエラーメッセージ表示（通信失敗・404・400などをUIに反映）
- PC / タブレット / スマホでのレスポンシブ対応
- hover / focus による操作フィードバック

## 4. 学習したポイント

### Vue 3 / Composition API
- `<script setup>` と `ref` によるリアクティブな状態管理
- `onMounted` を使った初期データ取得
- 「状態は誰が持つべきか」という設計判断（`App.vue` がタスク一覧の実データを持ち、`TaskItem.vue` は編集中かどうかなどのUI状態だけを自分で持つ、という役割分担）

### Props / Emit
- **Props（親→子、下り）**：`App.vue` → `TaskList.vue`（`tasks`配列） → `TaskItem.vue`（`task`1件）。子は受け取ったpropsを直接書き換えない、という一方向データフローを徹底
- **Emit（子→親、上り）**：
  - IDだけを渡すパターン（`select` / `task-deleted`）
  - データ全体を渡すパターン（`task-created` / `task-updated`）
  - 中間のコンポーネント（`TaskList.vue`）がイベントをそのまま中継する「橋渡し」の役割
- 「Propsは値を渡すだけ、状態を変えるのは常に持ち主（親）」という原則を、追加・編集・削除すべてで一貫して適用した

### フォーム / Validation
- `v-model` による双方向バインディング
- クライアント側チェック（即座にフィードバック・無駄な通信を防ぐ）と、サーバー側チェック（データの整合性を最終的に守る）の**二段構え**が必要な理由を実装を通じて確認

### CRUD / REST API
- `GET` / `POST` / `PUT` / `DELETE` を HTTPメソッドの意味に沿って設計
- リクエスト〜レスポンス〜画面反映までの一連の流れ（例：`POST`成功→レスポンスのタスクをそのまま配列に追加、`fetchTasks`での再取得はしない）

### Error Handling
- バックエンド：`try/catch` + `next(err)` + 共通エラーミドルウェアで、レスポンス形式（`{ error: { message } }`）を一元化
- フロントエンド：`fetch` のレスポンスを共通処理する関数（`handleResponse`）で、バックエンドのエラー形式を`Error`に変換し、呼び出し側は`catch`するだけで済むようにした
- ステータスコードの使い分け（400=入力エラー、404=存在しないリソース、500=想定外のエラー）

### レスポンシブ対応
- ブレークポイントを600pxに統一し、`@media (max-width: 600px)` でスマホ向けレイアウトに切り替え
- Flexboxの `min-width: 0` や `overflow-wrap: anywhere` など、長い文字列でレイアウトが崩れないようにする実践的なテクニック
- CSSカスタムプロパティ（`--color-primary` など）でデザインの値を一元管理

### 開発環境まわり（副次的な学び）
- GitHub Codespaces のようなポート転送環境では、フロントの `fetch` にAPIのURLを直書きするとブラウザ側の `localhost` を参照してしまい失敗すること、Vite の `server.proxy` と相対パスでこれを解決できること

## 5. ファイル構成

```
training/
├── README.md                    # 本ファイル（成果物まとめ）
├── backend/                     # Node.js + Express（REST API）
│   ├── package.json
│   ├── server.js                # エントリーポイント（ミドルウェア登録）
│   ├── routes/
│   │   └── tasks.js             # /api/tasks の CRUD ルーティング
│   ├── middleware/
│   │   └── errorHandler.js      # 共通エラーハンドリング（404 / エラー整形）
│   └── data/
│       └── tasks.json           # 簡易データストア
│
└── frontend/                    # Vue 3 + Vite
    ├── package.json
    ├── vite.config.js           # dev server の /api プロキシ設定
    ├── index.html
    └── src/
        ├── main.js
        ├── App.vue              # 状態管理の起点（tasks配列を一元管理）
        ├── style.css            # グローバルリセット + デザイントークン
        ├── api/
        │   └── tasks.js         # fetch ラッパー（GET/POST/PUT/DELETE）
        └── components/
            ├── TaskForm.vue     # タスク追加フォーム（Validation含む）
            ├── TaskList.vue     # 一覧表示・イベント中継
            └── TaskItem.vue     # 1件表示・編集モード・削除
```

## 6. 動作確認方法

### 起動
```bash
# ターミナル1：バックエンド
cd backend
npm install
node server.js
# → http://localhost:3000

# ターミナル2：フロントエンド
cd frontend
npm install
npm run dev
# → http://localhost:5174 （ポートが空いていれば5173）
```

ブラウザで `http://localhost:5174/`（Codespaces等ではポート転送されたURL）を開く。

### 確認できる操作
1. **一覧表示**：起動直後に既存タスクが表示される
2. **追加**：入力欄に文字を入れて「追加」→ 一覧に即時反映、空欄では追加不可
3. **編集**：「編集」ボタン→入力欄に現在の値が表示→書き換えて「保存」→一覧に即時反映。「キャンセル」で変更なしに戻る
4. **削除**：「削除」ボタン→確認ダイアログ→「OK」で一覧から即時削除
5. **エラー表示**：バックエンドを停止した状態で操作すると、通信エラーがメッセージとして表示される
6. **レスポンシブ**：ブラウザのレスポンシブモードでPC幅・スマホ幅を切り替え、レイアウトが崩れないことを確認

### バックエンド単体の確認（curl例）
```bash
curl http://localhost:3000/api/tasks
curl -X POST http://localhost:3000/api/tasks -H "Content-Type: application/json" -d '{"title":"サンプル"}'
curl -X PUT http://localhost:3000/api/tasks/1 -H "Content-Type: application/json" -d '{"title":"更新後"}'
curl -X DELETE http://localhost:3000/api/tasks/1
```

## 7. 今後改善できる点

学習用の最小構成として意図的に省略・簡略化した部分です。研修の範囲を超えるため今回は未対応ですが、次のステップとして挙げられます。

- **データ永続化**：JSONファイルではなく実際のデータベース（SQLite / PostgreSQL など）への置き換え
- **完了/未完了の切り替えUI**：`done` フィールドはAPI・データ構造には用意済みだが、チェックボックスなどのUIは未実装
- **一覧の絞り込み・並び替え**：完了/未完了フィルタ、作成日順ソートなど
- **テストコードの追加**：バックエンドのAPIテスト（Jest / Supertestなど）、フロントの単体テスト（Vitest）
- **認証・ユーザー管理**：現状は誰でも全タスクを操作できる単一ユーザー向けの構成
- **本番環境向けの設定**：APIのベースURLの環境変数化、`.env` の利用、ビルド成果物の配信方法の検討
- **アクセシビリティの強化**：`aria-*` 属性やキーボード操作のさらなる改善
- **同時編集時の競合対策**：複数タブ・複数ユーザーが同時に同じタスクを編集した場合の考慮（現状は未考慮）

---
研修（Vue 3 / Composition API / Props・Emit / フォーム・Validation / CRUD / レスポンシブ対応 / Node.js / Express / REST API / JSON / Error Handling）の復習・アウトプットとして、8ステップに分けて実装しました。
