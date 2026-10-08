# Nebukin's Tools

日常で使える便利なWebツール集です。

## 📱 PWA対応

各アプリは個別にスマホにインストール可能です（Android Chrome推奨）。
アプリのURLにアクセス → メニュー → 「ホーム画面に追加」

## 📁 ファイル構成

```
.
├── index.html                 # トップページ
├── manifest.json              # PWAマニフェスト（トップ）
├── service-worker.js          # Service Worker
├── icons/
│   └── icon.svg               # 共通アイコン
├── common/
│   ├── storage.js             # ストレージ共通ライブラリ
│   ├── themes.css             # テーマ用CSS変数
│   └── theme-switcher.js      # テーマ切り替え
├── countdown-timer/           # カウントダウンタイマー
│   ├── index.html
│   ├── settings.html
│   └── manifest.json
├── clock-print/               # 時計プリント
│   ├── index.html
│   └── manifest.json
├── cost-timer/                # コストタイマー
│   ├── index.html
│   ├── settings.html
│   └── manifest.json
├── interval-timer/            # インターバルタイマー
│   ├── index.html
│   ├── settings.html
│   └── manifest.json
├── paint-calculator/          # 塗料計算
│   ├── index.html
│   └── manifest.json
├── threat-map/                # 攻撃監視コンソール
│   ├── index.html
│   └── README.md
├── unchi-catch/               # うんちキャッチ（ミニゲーム）
│   ├── index.html
│   └── README.md
└── README.md
```

## 🛠️ 使用技術

- HTML5 / CSS3 / JavaScript (jQuery)
- Bootstrap 5.3
- PWA (Progressive Web App)

## 🌐 デモ

https://velaciela-ringWing2007.github.io/

---

## ⏱️ カウントダウンタイマー

https://velaciela-ringWing2007.github.io/countdown-timer/

日常の様々なイベントまでの残り時間をリアルタイムで表示します。

### 機能

- **複数タイマー同時表示** - 起床時刻、勤務開始、定時退勤、就寝時間など
- **4種類のタイマー形式**
  - 毎日（例: `08:20:00`）
  - 毎週（例: 月曜 09:00）
  - 毎月（例: 25日 18:00）
  - 特定日時（例: `2024-01-01T00:00:00`）
- **グループ機能** - 複数のタイマーセットを切り替え可能
- **視覚的なアラート** - 残り時間に応じて色変化・点滅
- **エクスポート/インポート** - JSONファイルでバックアップ

### 設定例

```json
{
  "active": 0,
  "groups": [
    {
      "name": "仕事用",
      "timers": [
        {"title": "起床時刻", "targetTime": "08:20:00"},
        {"title": "定時まで", "targetTime": "18:00:00"}
      ]
    }
  ]
}
```

---

## 💰 コストタイマー

https://velaciela-ringWing2007.github.io/cost-timer/

ミーティングの参加者と時給からコストをリアルタイムで計算・表示します。

### 機能

- **リアルタイムコスト計算** - 参加者の時給から現在のコストを自動計算
- **時間管理** - 経過時間・残り時間・超過時間を表示
- **参加者プリセット** - よく使う参加者構成を保存
- **10種類のテーマ切り替え**

---

## 🏃 インターバルタイマー

https://velaciela-ringWing2007.github.io/interval-timer/

タバタ式・HIIT・ポモドーロ対応のインターバルタイマー。

### 機能

- **プリセット** - タバタ式、HIIT、ポモドーロなど
- **カスタム設定** - 運動時間・休憩時間・セット数を自由に設定
- **音声通知** - カウントダウン、開始・終了時に音で通知
- **テーマ切り替え**

---

## 🕐 時計プリント

https://velaciela-ringWing2007.github.io/clock-print/

子供の時間学習用、印刷可能なアナログ時計。

### 機能

- **複数時計** - 複数の時計を同時に表示
- **時刻設定** - 時・分・秒を自由に設定
- **針の色カスタマイズ** - カラーピッカーで変更
- **A4印刷対応**

---

## 🎨 塗料計算

https://velaciela-ringWing2007.github.io/paint-calculator/

塗料の硬化剤・希釈液の配合量を計算。

---

## 🌐 攻撃監視コンソール

https://velaciela-ringWing2007.github.io/threat-map/

世界地図に攻撃線が飛び交う、サイバー攻撃監視画面の演出（シミュレーション）。攻撃イベントはすべてブラウザ内でランダム生成しています。

### 機能

- **日本中心の世界地図** - 16拠点から標的を複数選択可能
- **RANDOM / RETALIATE / 攻殻MAX モード**
- **コマンドコンソール** - `nmap osaka` などで能動的に線を飛ばせる
- **防衛支援AI〈ククリ〉** - 選択肢式アシスタント

詳細は [threat-map/README.md](threat-map/README.md) を参照。

---

## 💩 うんちキャッチ

https://velaciela-ringWing2007.github.io/unchi-catch/

上を飛び回るネズミが落とす💩を、ペンギンが🍚と🧹を持ち替えながらさばくインベーダー風ミニゲーム。

### 機能

- **🍚 / 🧹 の持ち替え** - 🍚の間は飯ptが貯まり、🧹で💩をキャッチすると箒pt
- **3つの稼ぎ方** - 避けて飯pt / キャッチで箒pt / 直撃狙いでマイナス最高点
- **初級〜上級** - ネズミの数と💩の量で難易度が変わる
- **キーボード・スマホ両対応**、難易度別ハイスコア保存

詳細は [unchi-catch/README.md](unchi-catch/README.md) を参照。

---

## 📦 共通ライブラリ（common/）

### storage.js
localStorageのCRUD操作を提供。Cookie→localStorage移行機能付き。

```javascript
const storage = createStorage('keyName', defaultValue);
storage.save(data);
const data = storage.load();
```

### themes.css
CSS変数でテーマカラーを定義。各アプリで共通利用。

### theme-switcher.js
テーマ切り替えUIを提供。

```javascript
ThemeSwitcher.init('selectElementId', {
    defaultTheme: 'white',
    storageKey: 'appTheme'
});
```

---

## 📝 データ保存について

- 設定はブラウザの**localStorage**に保存されます
- ブラウザのデータを削除すると設定がリセットされます
- エクスポート機能でバックアップを推奨

---

## 📜 ライセンス

MIT License
