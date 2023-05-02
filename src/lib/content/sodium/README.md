[![Netlify Status](https://api.netlify.app/api/v1/badges/2557c75c-0b3c-450b-b4dc-0f7b9fda88dd/deploy-status)](https://app.netlify.app/sites/sodium-js/deploys)

# sodium.js

計測用スクリプト (sodium.js) の設定方法、送信データ構造、サンプルデータについて説明します。

## 設定方法

以下のファイルの変数に設定する値を入れてください。

ChromeExtension/sodium.js

    // playback quality の取得インターバル(ミリ秒単位)
    Config.collect_interval = 1 * 1000;
    // 送信インターバル(ミリ秒単位)
    Config.trans_interval = 5 * 1000;
    // videoタグ検索インターバル(ミリ秒単位)
    Config.search_video_interval = 1 * 1000;
    // 暫定QoE値取得(回数)　Config.trans_interval x この値 が暫定QoE値取得インターバルになる
    Config.latest_qoe_update = 5;
    // fluentd サーバーのエンドポイント
    Config.fluent_url = 'https://sodium.webdino.org/sodium';
    // SodiumServerのエンドポイント
    Config.sodium_server_url = 'https://sodium.webdino.org:8443/api';
    // イベントデータのサイズの Max 値
    // server's default request body size x 0.8 (1mb x 0.8 x 1024)
    Config.event_data_max_size = 819200;
    // 暫定QoE値保持数
    Config.num_of_latest_qoe = 20; // 0に設定した場合すべての値を保存します。
    // 記録するイベントの種類のリスト
    Config.event_type_names = ['play', 'pause', 'seeking', 'seeked', 'ended', 'stalled', 'progress', 'waiting', 'canplay'];
    // ステータス表示のフォーマット
    Config.status_format = "{total : ${TOTAL}, dropped : ${DROPPED}, qoe : ${QOE}}";
    // ステータス表示のスタイル
    // youtube
    Config.style.youtube = `#player:after, #movie_player:after {
            content: 'QoE: ';
            opacity: 0;
            position: absolute; top: 0; left:0;
            z-index: 1000001;
            top: 12px;
            left: 12px;
            background: rgba(0, 161, 255, 0.5);
            padding: 5px 10px;
            border-radius: 12px;
            color: white;
            font-size: 16px;
            line-height: 1;
            transition: .5s cubic-bezier(0.4, 0.09, 0, 1.6);
        }
        #player:hover:after, #movie_player:hover:after {
            opacity: 1;
        }
        #movie_player.ytp-autohide:hover:after {
            opacity: 0;
        }`;

    // tver
    Config.style.tver = `#playerWrapper > .video-js:after {
                content: 'QoE: ';
                opacity: 0;
                position: absolute; top: 0; left:0;
                z-index: 1000001;
                top: 12px;
                left: 12px;
                background: rgba(0, 161, 255, 0.5);
                padding: 5px 10px;
                border-radius: 12px;
                color: white;
                font-size: 16px;
                line-height: 1;
                transition: .5s cubic-bezier(0.4, 0.09, 0, 1.6);
            }
            #playerWrapper > .video-js.vjs-user-active:hover:after {
                opacity: 1;
            }
            #playerWrapper.vjs-paused > .video-js:hover:after {
                opacity: 0;
            }`;

    // paravi
    Config.style.paravi = `.paravi-player .controls:after {
            content: 'QoE: ';
            opacity: 0;
            position: absolute; top: 0; left:0;
            z-index: 1000001;
            top: 12px;
            left: 12px;
            background: rgba(0, 161, 255, 0.5);
            padding: 5px 10px;
            border-radius: 12px;
            color: white;
            font-size: 16px;
            line-height: 1;
            transition: .5s cubic-bezier(0.4, 0.09, 0, 1.6);
        }
        .paravi-player .controls:hover:after {
            opacity: 1;
        }
        .paravi-player .controls.inactive:hover:after {
            opacity: 0;
    }`;

    // デフォルトResourceTiminingAPIのバッファサイズ
    Config.DEFAULT_RESOURCE_BUFFER_SIZE = 150;

ステータス表示は、次のコードで div タグを作成し DOM に追加し値を表示しています。

        status_elm = document.createElement("div");
        Object.assign(status_elm.style, status_style);
        document.body.appendChild(status_elm);
        status_elm.appendChild(document.createTextNode(status_format.replace('${TOTAL}', 0).replace('${DROPPED}', 0)));

## 送信データ構造

### 共通部分

1 送信毎のデータ

| 項目            | 値                                                |
| --------------- | ------------------------------------------------- |
| version         | sodium.js のバージョン(v1.3.0)                    |
| date            | 送信日時(Date.now())                              |
| startTime       | データ収集開始時間(DOMHighResTimeStamp, 初回は 0) |
| endTime         | データ収集終了時間(DOMHighResTimeStamp)           |
| session         | セッション ID(UUID)                               |
| location        | window.location.href                              |
| locationIp      | location (配信サイト) の IPv4/v6 アドレス。但し Proxy 接続時は Proxy サーバの Ip |
| userAgent       | ユーザーエージェント                              |
| sequence        | 同一セッション内のシーケンス番号(0 から連番)      |
| calc            | QoE 計算可能フラグ                                |
| resource_timing | -                                                 |

### netinfo

Network Information API より取得した情報を送信する
http://wicg.github.io/netinfo/#networkinformation-interface

| 項目          | 値                                                                                                                                              |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| downlink      | 下り速度(Mbps)<br>※ Videomark Browser または隠しオプション enable-experimental-web-platform-features 有効時                                     |
| downlinkMax   | 最大下り速度(Mbps)                                                                                                                              |
| effectiveType | 有効なタイプ                                                                                                                                    |
| rtt           | RTT                                                                                                                                             |
| type          | デバイスがネットワーク通信に使用している接続の種類<br>※ Videomark Browser または隠しオプション enable-experimental-web-platform-features 有効時 |
| apn           | アクセスポイント<br>※ Videomark Browser 独自拡張                                                                                                |
| plmn          | ルーティングエリア<br>※ Videomark Browser 独自拡張                                                                                              |
| sim           | SIM<br>※ Videomark Browser 独自拡張                                                                                                             |

※ firefox デスクトップ版では、Network Information API が無効となっているため、送信されない

### video

video 単位のデータ

#### property

video の属性情報

| 項目                | 値                                                                                  |
| ------------------- | ----------------------------------------------------------------------------------- |
| uuid                | video を識別するための UUID                                                         |
| viewCount           | 対象の video が YouTube の場合、video の再生回数　他のサイトや取得ができない場合 -1 |
| src                 | video タグの src 属性<br>※ blob URL の場合は除外                                    |
| domainName          | video のセグメント配布ドメイン                                                      |
| holderId            | サービスが付加した ID                                                               |
| width               | video タグの表示幅                                                                  |
| height              | video タグの表示高さ                                                                |
| videoWidth          | video の幅                                                                          |
| videoHeight         | video の高さ                                                                        |
| mediaSize           | video の再生時間                                                                    |
| defaultPlaybackRate | デフォルト再生速度                                                                  |
| playbackRate        | 再生速度                                                                            |
| playStartTime       | 視聴開始時刻(Date.now()) 未視聴の場合 -1                                            |
| playEndTime         | 視聴終了時刻(Date.now()) 終了していない場合 -1                                      |
| currentPlayPos      | 現在再生位置の秒                                                                    |
| currentPlayTime     | 再生開始からの経過時間                                                              |

#### playback_quality

再生品質情報

定期的に収集した video の再生品質の情報 video 毎に複数の品質情報を送信する

| 項目                    | 値                                       |
| ----------------------- | ---------------------------------------- |
| totalVideoFrames        | 総フレーム数                             |
| droppedVideoFrames      | 損失フレーム数                           |
| creationTime            | 計測時刻(DOMHighResTimeStamp)            |
| creationDate            | 計測時刻(Date.nwo())                     |
| representation          | representationID                         |
| bitrate                 | 音声、ビデオの合計ビットレート           |
| videoBitrate            | ビデオのビットレート                     |
| receiveBuffer           | 受信済み動画再生時間 取得不可能の場合 -1 |
| framerate               | フレームレート                           |
| speed                   | 再生速度                                 |
| deltaTotalVideoFrames   | 総フレーム数のデルタ値                   |
| deltaDroppedVideoFrames | 損失フレーム数のデルタ値                 |
| deltaTime               | 計測時間のデルタ値                       |

##### 総フレーム数、損失フレーム数の取得方法について
chrome と firefox では取得方法が異なる

|項目|chrome|firefox|
|-|-|-|
|総フレーム数|webkitDecodedFrameCount|mozParsedFrames|
|損失フレーム数|webkitDroppedFrameCount|mozParsedFrames - mozPresentedFrames|

プロパティの仕様については、以下のサイトを参照のこと。  
https://wiki.whatwg.org/wiki/Video_Metrics#Collection_of_Proposals.2FImplementations

#### throughput_info

| 項目                    | 値                                 |
| ----------------------- | ---------------------------------- |
| downloadTime            | チャンクダウンロードにかかった時間 |
| throughput              | ダウンロード時のスループット(bps)  |
| downloadSize            | チャンクのサイズ                   |
| start                   | ダウンロード開始時刻               |
| end                     | ダウンロード終了時刻               |
| startUnplayedBufferSize | ダウンロード開始時未再生バッファ   |
| endUnplayedBufferSize   | ダウンロード終了時未再生バッファ   |
| bitrate                 | ビットレート                       |
| representationId        | Representation ID                  |
| timings.domainLookupStart | リクエスト全体の開始からDNSルックアップ開始までの経過時間(ms) |
| timings.connectStart      | リクエスト全体の開始からサーバ接続開始までの経過時間(ms) |
| timings.requestStart      | リクエスト全体の開始からリクエスト送信開始までの経過時間(ms) |
| timings.responseStart     | リクエスト全体の開始からレスポンス受け取り開始までの経過時間(ms) |

#### play_list_info

| 項目             | 値                   |
| ---------------- | -------------------- |
| representationId | ストリーム ID        |
| bps              | ビットレート         |
| videoWidth       | video の幅           |
| videoHeight      | video の高さ         |
| fps              | フレームレート       |
| chunkDuration    | チャンクの再生時間   |
| container        | コンテナ             |
| codec            | コーデック           |
| serverIp         | 動画チャンクの配布元(FQDN) |

#### Event

再生時の Event 情報

| 項目     | 値                                      |
| -------- | --------------------------------------- |
| time     | 発生時間(DOMHighResTimeStamp)           |
| dateTime | 発生時間(Date.now())                    |
| delta    | 発生時間(DOMHighResTimeStamp)のデルタ値 |
| dateTime | 発生時間(Date.now())のデルタ値          |
| playPos  | 現在再生位置の秒                        |
| playTime | 再生開始からの経過時間                  |

##### Event の種類

Event は、以下の種類ものと前回発生時との差分の delta 値を含む

| 種類     | 発生タイミング |
| -------- | -------------- |
| play     | 再生開始       |
| pause    | 停止           |
| seeking  | シーク開始     |
| seeked   | シーク終了     |
| ended    | 再生終了       |
| stalled  | 再生失敗       |
| progress | ロード         |
| waiting  | ロード待ち     |
| canplay  | 再生開始可能   |

##### cmHistory

| 項目 | 値                                                                                                            |
| ---- | ------------------------------------------------------------------------------------------------------------- |
| type | CM または、Main に切り替わったことを示す文字列。CM に切り替わった場合、"cm"　 Main に切り替わった場合、"main" |
| time | 発生時間(Date.now())                                                                                          |

### QoE サーバー対応

QoE サーバーに対応するために以下のデータを追加した。

| filed                                | QoE                                                 | detail                                   |
| ------------------------------------ | --------------------------------------------------- | ---------------------------------------- |
| userAgent                            | requestNotificationBasicInformation.osInfo          | ユーザーエージェント                     |
| video.property.mediaSize             | requestNotificationBasicInformation.mediaSize       | video の再生時間(秒)                     |
| video.property.domainName            | requestNotificationViewingInformation.domainName    | video のセグメント配布ドメイン           |
| video.playback_quality.bitrate       | requestNotificationQoeInformation.bitrateHistory    | ビットレート                             |
| video.playback_quality.receiveBuffer | requestNotificationQoeInformation.receiveBuffer     | \*取得済み動画サイズ(秒)                 |
| video.playback_quality.framerate     | requestNotificationQoeInformation.framerateHistory  | フレームレート                           |
| video.property.playStartTime         | requestNotificationViewingInformation.eventType Str | 視聴開始時刻(Date.now()) 未視聴の場合 -1 |
| video.event\_\*.datetime             | requestNotificationViewingInformation.eventType     | イベント 1 発生時間(Date.now())          |
| video.event\_\*.playPos              | requestNotificationViewingInformation.eventType     | 現在再生位置の秒                         |
| video.event\_\*.playTime             | requestNotificationViewingInformation.eventType     | 再生開始からの経過時間                   |

#### Paravi 固有の対応

Paravi は、Video.js + Shaka Player で実装されている。上記のフィールドの値は以下の API を使用し取得している

- userAgent
  - window.navigator.userAgent の値
- video.property.mediaSize
  - Class: videojs.Player duration()
- video.property.domainName
  - document.domain の値
- video.playback_quality.bitrate
  - Class: shaka.Player getStats(), getVariantTracks()
- video.playback_quality.receiveBuffer
  - videojs.Player bufferedEnd()
- video.playback_quality.framerate
  - Class: shaka.Player getStats(), getVariantTracks()
- video.property.playStartTime
  - Class: shaka.Player getStats() もしくは、video tag の play event
- video.event\_\*.datetime
  - Date.nwo()の値
- video.event\_\*.playPos
  - videojs.Player currentTime()
- video.event\_\*.playTime
  - イベント発生時の Date.now()の値から playStartTime を引いた値

プレイヤー依存実装と互換性確認のコードは [ParaviTypeHandler.js](https://github.com/videomark/sodium.js/blob/master/src/js/modules/ParaviTypeHandler.js) にて定義されている。

#### TVer 固有の対応 (フジテレビ(CX)以外)

TVer は、Video.js で実装されている。上記のフィールドの値は以下の API を使用し取得している

- userAgent
  - window.navigator.userAgent の値
- video.property.mediaSize
  - Class: videojs.Player duration()
- video.property.domainName
  - Class: videojs.Player selectPlaylist()
- video.playback_quality.bitrate
  - Class: videojs.Player selectPlaylist()
- video.playback_quality.receiveBuffer
  - videojs.Player bufferedEnd()
- video.playback_quality.framerate
  - TVer の場合 M3U8 ファイルにフレームレートが含まれていないため-1 固定
- video.property.playStartTime
  - video tag の play event
- video.event\_\*.datetime
  - Date.nwo()の値
- video.event\_\*.playPos
  - videojs.Player currentTime()
- video.event\_\*.playTime
  - イベント発生時の Date.now()の値から playStartTime を引いた値

プレイヤー依存実装と互換性確認のコードは [TVerTypeHandler.js](https://github.com/videomark/sodium.js/blob/master/src/js/modules/TVerTypeHandler.js) にて定義されている。

上記 2 つの対応は、実装時点 (20180827) のものに対応した、これらの取得方法は、提供者側のさじ加減ひとつで変わってしまう。そのため、より汎用的な取得方法が望ましい。

#### YouTube 固有の対応

YouTube の iFrameAPI を使用して上記のフィールドの値を取得している

- userAgent
  - window.navigator.userAgent の値
- video.property.mediaSize
  - getDuration()
- video.property.domainName
  - getVideoStats() getPlayerResponse()
- video.playback_quality.bitrate
  - getVideoStats() getPlayerResponse()
- video.playback_quality.receiveBuffer
  - getVideoLoadedFraction() getDuration()
- video.playback_quality.framerate
  - getVideoStats() getPlayerResponse()
- video.property.playStartTime
  - video tag の play event
- video.event\_\*.datetime
  - Date.nwo()の値
- video.event\_\*.playPos
  - videojs.Player currentTime()
- video.event\_\*.playTime
  - イベント発生時の Date.now()の値から playStartTime を引いた値

プレイヤー依存実装と互換性確認のコードは [YouTubeTypeHandler.js](https://github.com/videomark/sodium.js/blob/master/src/js/modules/YouTubeTypeHandler.js) にて定義されている。

##### YouTube (モバイル) 固有の対応

モバイル版 YouTube は、PC 版の YouTube と iFrameAPI の仕様が違うため、以下の部分が違います。

- video.property.domainName
  - getVideoStats()
- video.playback_quality.bitrate
  - getPlaybackQuality() getVideoStats()
- video.playback_quality.framerate
  - getVideoStats()

## 保存データ構造

Chrome Extension のストレージに以下のデータを記録する。

    {
        session_id              : セッション ID (UUID)
        video_id                : videoを識別するための UUID
        user_agent              : ユーザーエージェント
        location                : window.location.href
        resolution              : 最大、最小の解像度
        media_size              : videoの再生時間(秒)
        domain_name             : videoのセグメント配布ドメイン
        start_time              : 視聴開始時間
        end_time                : -1
        thumbnail               : サムネイル画像の URL
        title                   : 動画のタイトル
        calc                    : QoE計算可否
        log                     : 動画品質のログ [{ date: (Date | number), qoe?: (number | null), quality?: { totalVideoFramesなど } }]
    }

## 送信サンプルデータ

    https://www.paravi.jp/watch/10534
    BooBo日和
    ---------------------------------
    {
      "date": "2018-11-20T10:21:24.943Z",
      "startTime": 177946.19999994757,
      "endTime": 180944.599999988,
      "session": "84d282e2-1167-4bfd-9464-aac37d52898d",
      "location": "https://www.paravi.jp/watch/10534",
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36",
      "appVersion": "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36",
      "sequence": 55,
      "video": [{
        "property": {
          "uuid": "b141bb95-b804-42cd-847e-c7f52647ccce",
          "id": "vjs_video_3_html5_api",
          "class": ["vjs-tech"],
          "src": "blob:https://www.paravi.jp/22680c6d-eb58-4b33-bea8-671bbd010812",
          "domainName": "www.paravi.jp",
          "width": 0,
          "height": 0,
          "videoWidth": 1920,
          "videoHeight": 1080,
          "mediaSize": 370.042,
          "defaultPlaybackRate": 1,
          "playbackRate": 1,
          "playStartTime": 1542709119628.0,
          "playEndTime": 1542709284487.0,
          "currentPlayPos": 370.042,
          "currentPlayTime": 164.827
        },
        "playback_quality": [{
          "totalVideoFrames": 4090,
          "droppedVideoFrames": 19,
          "creationTime": 178945.09999995353,
          "deltaTotalVideoFrames": 30,
          "deltaDroppedVideoFrames": 0,
          "deltaTime": 1000.5999999702908,
          "bitrate": 4805000,
          "receiveBuffer": 370.042,
          "framerate": -1,
          "speed": 1
        }, {
          "totalVideoFrames": 4120,
          "droppedVideoFrames": 19,
          "creationTime": 179943.79999995,
          "deltaTotalVideoFrames": 30,
          "deltaDroppedVideoFrames": 0,
          "deltaTime": 998.699999996461,
          "bitrate": 4805000,
          "receiveBuffer": 370.042,
          "framerate": -1,
          "speed": 1
        }, {
          "totalVideoFrames": 4130,
          "droppedVideoFrames": 19,
          "creationTime": 180943.79999995,
          "deltaTotalVideoFrames": 10,
          "deltaDroppedVideoFrames": 0,
          "deltaTime": 1000,
          "bitrate": 4805000,
          "receiveBuffer": 370.042,
          "framerate": -1,
          "speed": 1
        }],
        "event_play": [],
        "event_play_delta": [],
        "event_pause": [{
          "time": 180471.79999999935,
          "dateTime": 1542709284470.0,
          "playPos": 370.042,
          "playTime": 164.842
        }],
        "event_pause_delta": [{
          "delta": 180471.79999999935,
          "dateTime": 1542709284470.0,
          "playPos": 370.042,
          "playTime": 164.842
        }],
        "event_seeking": [],
        "event_seeking_delta": [],
        "event_seeked": [],
        "event_seeked_delta": [],
        "event_ended": [{
          "time": 180489.0000000014,
          "dateTime": 1542709284487.0,
          "playPos": 370.042,
          "playTime": 164.859
        }],
        "event_ended_delta": [{
          "delta": 180489.0000000014,
          "dateTime": 1542709284487.0,
          "playPos": 370.042,
          "playTime": 164.859
        }],
        "event_stalled": [],
        "event_stalled_delta": [],
        "event_progress": [],
        "event_progress_delta": [],
        "event_waiting": [],
        "event_waiting_delta": [],
        "event_canplay": [],
        "event_canplay_delta": []
      }],
      "resource_timing": []
    }
