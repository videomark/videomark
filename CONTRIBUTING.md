[![Netlify Status](https://api.netlify.app/api/v1/badges/0d2a4ed0-102a-47db-8291-c241d66a909b/deploy-status)](https://app.netlify.app/sites/sodium-extension/deploys)

# 拡張機能に保存されるデータ

Web VideoMark 拡張機能では以下のデータを Chrome に保存します。これらのデータは拡張機能をアンインストールするとすべて削除されます。削除されたデータの復元方法はありません。

| field       | value                                                                     |
| ----------- | ------------------------------------------------------------------------- |
| session_id  | セッション ID - 動画ページの読み込み毎に乱数生成する文字列                |
| video_id    | ビデオ ID - video タグで読み込む動画が切り替わる毎に乱数生成する文字列    |
| domain_name | 計測対象動画のドメイン名                                                  |
| start_time  | 視聴開始時刻 Date.now() の値                                              |
| end_time    | 視聴終了時刻 Date.now() の値                                              |
| latest_qoe  | 暫定 QoE 値と時刻の配列 [{date: Date.now()の値, qoe: 暫定 QoE 値}]        |
| location    | 動画視聴時の URL                                                          |
| media_size  | 動画の再生時間(秒)                                                        |
| resolution  | 動画の解像度 {max: {width:XXX, height:YYY}, min: {width:xxx, height:yyy}} |
| thumbnail   | 動画のサムネイル URL                                                      |
| title       | 動画のタイトル                                                            |
| user_agent  | ユーザーエージェント文字列                                                |

これらのデータは、chrome.storage.local に保存されます。
latest_qoe は初期設定で 20 件まで保存されます。すべての暫定 QoE 値を保存したい場合は、sodium.js の Config.num_of_latest_qoe の値を０に設定してください。

## 拡張機能に保存されるデータの扱い

### 開発ツール上で確認する方法

1. 計測結果確認ページを開く
2. Chrome DevTools を立ち上げる
3. 下記の JS を実行

```JavaScript
chrome.storage.local.get((value) => console.log(value));
```

## エクスポート方法

1. 計測結果確認ページを開く
2. Chrome DevTools を立ち上げる
3. 下記の JS を実行

```JavaScript
chrome.storage.local.get((value) => console.log(JSON.stringify(value)));
```

4. 出力された内容の最後にある `Copy` ボタンをクリック

## インポート方法

1. 計測結果確認ページを開く
2. Chrome DevTools を立ち上げる
3. 下記の JS を実行

```JavaScript
chrome.storage.local.set(...); // 引数にはエクスポートで取得した内容
```
