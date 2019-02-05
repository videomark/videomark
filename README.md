# 拡張機能の使い方
1. Chromeの"その他のツール"から"拡張機能"を選択
2. "拡張機能"タブのデベロッパーモードにチェックを付ける
3. "パッケージ化されていない拡張機能を読み込む"をクリック
4. ./ChromeExtensionを指定する

上記の手順を実行すると"拡張機能"タブに Performance Statistics Extension が読み込まれ有効にチェックが入ります。

この状態で動画再生ページを表示すれば fluentd にデータを送信することができます。

# 拡張機能が保存するデータ
拡張機能は以下のデータを Chrome に保存します。これらのデータは拡張機能をアンインストールするとすべて削除されます。

| field | value |
--- | ---
| session_id     | セッション ID - 動画ページの読み込み毎に乱数生成する文字列 |
| video_id       | ビデオ ID - video タグで読み込む動画が切り替わる毎に乱数生成する文字列 |
| domain_name    | 計測対象動画のドメイン名 |
| start_time     | 視聴開始時刻 Date.now() の値 |
| end_time       | 視聴終了時刻 Date.now() の値 |
| latest_qoe     | 暫定 QoE 値と時刻の配列 [{date: Date.now()の値, qoe: 暫定QoE値}] |
| location       | 動画視聴時の URL |
| media_size     | 動画の再生時間(秒) |
| resolution     | 動画の解像度 {max: {width:XXX, height:YYY}, min: {width:xxx, height:yyy}} |
| thumbnail      | 動画のサムネイル URL |
| title          | 動画のタイトル |
| user_agent     | ユーザーエージェント文字列 |

これらのデータは、chrome.storage.localに保存されます。
また、latest_qoeは、20個まで保存されます。すべての暫定 QoE 値を保存したい場合は、sodium.js の Config.num_of_latest_qoe の値を０に設定してください。

## 拡張機能に保存されるデータの扱い
### 開発ツール上で確認する方法
1. 計測結果確認ページを開く
2. Chrome DevTools を立ち上げる
3. 下記の JS を実行

```JavaScript
chrome.storage.local.get(null, results => {
    Object.keys(results).forEach(e => {
        console.log('JSON size:' + results[e].length);
        console.log(JSON.parse(results[e]));
    });
});
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
