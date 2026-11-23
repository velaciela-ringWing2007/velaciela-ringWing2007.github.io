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
├── color-mixer/               # いろ まぜまぜ（色合成）
│   ├── index.html
│   └── manifest.json
├── light-lab/                 # ひかりの じっけん（光の実験）
│   ├── index.html
│   └── manifest.json
├── airflow-lab/               # くうきの ながれ（流体・揚力）
│   ├── index.html
│   └── manifest.json
├── threat-map/                # 攻撃監視コンソール
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

## 🎨 いろ まぜまぜ

https://velaciela-ringWing2007.github.io/color-mixer/

子供向けの色合成アプリ。色を選んでドラッグし、重ねて混ざる様子を遊びながら学べます。

### 機能

- **ひかりの いろ（加法混色）** - 黒背景に赤・緑・青の光源を重ねる。重なると明るくなる（赤+緑=黄、3つで白）
- **いろガラス（減法混色）** - 白背景にシアン・マゼンタ・イエローの色ガラスを重ねる。重なると暗くなる（水色+黄=緑、3つで黒）
- **えのぐ（顔料混色）** - 白い紙に赤・黄・青の絵の具を重ねる。絵の具らしく混ざる（赤+黄=橙、黄+青=緑、赤+青=紫、3つで茶）。RYBモデルでキャンバスに描画
- **3げんしょく ⇄ 12いろ 切り替え** - 各モードで「三原色だけ」か「色鉛筆の代表12色」を選べる
- **ドラッグ操作** - タップで色を出し、指/マウスで重ねる（光/ガラスは `mix-blend-mode`、絵の具はキャンバス計算で混色）
- ダブルタップで1つ消す / ぜんぶ けす・さいしょから ボタン

---

## 🔬 ひかりの じっけん

https://velaciela-ringWing2007.github.io/light-lab/

子供向けの光の実験アプリ。光源・鏡・物などをドラッグして、光のふるまいを遊びながら学べます。

### 機能

- **かがみ（直進・反射）** - 光はまっすぐ進み、鏡で「入射角＝反射角」で反射。複数の鏡で何度もバウンド
- **プリズム（分散）** - 白い光がプリズムで屈折し、7色の虹に分かれる（スネルの法則で計算）
- **かげ（影）** - 光源と物で影ができる。光源を動かすと影が伸び縮み・移動。影ができる理由（光の直進）を線で表示
- Canvas描画＋ドラッグ操作。各モード「さいしょから」でリセット

---

## 💨 くうきの ながれ

https://velaciela-ringWing2007.github.io/airflow-lab/

子供向けの流体シミュレーション。空気の流れを線で見ながら「なぜ浮くの？」を体験できます。

### 機能

- **ふうせん（送風機／ベルヌーイ）** - 上向きジェット気流に風船が浮く。横にズレても速い空気側（低圧）に引き戻されて中心に戻る。風船をドラッグして浮く位置を探せる。ジェットの向きも変更可。「ちからを みる」で重力・空気の力・中心へ戻る力を矢印表示
- **つばさ（翼の揚力）** - 翼まわりの流線（円柱＋循環のポテンシャル流）。迎え角をドラッグで変えると上面の流れが速くなり揚力が増える。上げすぎると失速表示
- リアルタイム物理シミュレーション（Canvas）。物理定数はNodeで挙動検証済み

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
