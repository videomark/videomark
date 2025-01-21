/**
 * 動画プラットフォームのプロパティ。
 * @typedef {object} VideoPlatform
 * @property {string} id 固有の ID。
 * @property {string} url サービス URL。
 * @property {string} brandColor ブランドカラー。
 * @property {string[]} hosts サービスのホスト名リスト。`manifest.json` や `request_rules.json` など複数
 * 箇所で利用され、自動的に正規表現やドメインのみの表記に変換される。サブドメインが複数ある場合はワイルドカードを使うこ
 * とも可能。例えば `*.youtube.com` は `youtube.com` とそのサブドメインすべてに一致する。
 * @property {RegExp[]} hostREs 正規表現で表したサービスのホスト名リスト。`hosts` のワイルドカード表記より細かい
 * 設定が可能。指定されていない場合は `hosts` を自動的に正規表現に変換して使用。
 * @property {boolean} [deprecated] 廃止されたサービスは `true`。
 * @property {boolean} [experimental] 試験的に対応しているサービスは `true`。
 */

/**
 * 視聴履歴アイテム。
 * @typedef {object} HistoryItem
 * @property {number} key IndexedDB レコードのキー。
 * @property {string} playbackId プレーバック UUID。再生するたびに異なる。
 * @property {string} sessionId セッション UUID.
 * @property {string} viewingId プレーバック UUID とセッション UUID をアンダースコアで結合したもの。
 * @property {VideoPlatform} platform 動画プラットフォームの詳細。
 * @property {string} title 動画タイトル。
 * @property {string} url プラットフォーム上の動画再生ページの URL.
 * @property {string | undefined} thumbnail 動画サムネイル URL。
 * @property {number} startTime 再生開始時刻のタイムスタンプ。
 * @property {object | undefined} region 視聴地域。
 * @property {string} region.country 国コード。
 * @property {string} region.subdivision 日本の都道府県あるいは各国の州コード。
 * @property {boolean} calculable 当該プラットフォームにおいて QoE 値を計算可能かどうか。
 * @property {HistoryItemStats} stats 統計情報。
 */

/**
 * 視聴履歴アイテムの統計情報。
 * @typedef {object} HistoryItemStats
 * @property {number | undefined} provisionalQoe 暫定 QoE 値。
 * @property {number | undefined} finalQoe 確定 QoE 値。通常は正の値だが、`-1` は計算未完了、`-2` は何らかの
 * 理由による取得エラーを表す。
 * @property {number} throughput スループット。
 * @property {number} transferSize 転送データ量。
 * @property {boolean} isLowQuality QoE が低品質かどうか。
 */

/**
 * 視聴履歴アイテムの最終 QoE 値取得状況。
 * @typedef {'pending' | 'complete' | 'error' | 'unavailable'} QualityStatus
 */
