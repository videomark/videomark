export const strings = {
  _: {
    selectAll: 'すべて選択',
    unselectAll: '選択を解除',
  },
  platforms: {
    youtube: 'YouTube',
    netflix: 'Netflix',
    paravi: 'Paravi',
    tver: 'TVer',
    fod: 'FOD',
    nicovideo: 'ニコニコ動画',
    nicolive: 'ニコニコ生放送',
    nhkondemand: 'NHK オンデマンド',
    dtv: 'dTV',
    abematv: 'ABEMA',
    amazonprimevideo: 'Prime Video (日本)',
    iijtwilightconcert: 'TWILIGHT CONCERT',
    gorin: 'gorin.jp',
    lemino: 'Lemino',
  },
  subdivisions: {
    JP: {
      '01': '北海道',
      '02': '青森県',
      '03': '岩手県',
      '04': '宮城県',
      '05': '秋田県',
      '06': '山形県',
      '07': '福島県',
      '08': '茨城県',
      '09': '栃木県',
      10: '群馬県',
      11: '埼玉県',
      12: '千葉県',
      13: '東京都',
      14: '神奈川県',
      15: '新潟県',
      16: '富山県',
      17: '石川県',
      18: '福井県',
      19: '山梨県',
      20: '長野県',
      21: '岐阜県',
      22: '静岡県',
      23: '愛知県',
      24: '三重県',
      25: '滋賀県',
      26: '京都府',
      27: '大阪府',
      28: '兵庫県',
      29: '奈良県',
      30: '和歌山県',
      31: '鳥取県',
      32: '島根県',
      33: '岡山県',
      34: '広島県',
      35: '山口県',
      36: '徳島県',
      37: '香川県',
      38: '愛媛県',
      39: '高知県',
      40: '福岡県',
      41: '佐賀県',
      42: '長崎県',
      43: '熊本県',
      44: '大分県',
      45: '宮崎県',
      46: '鹿児島県',
      47: '沖縄県',
    },
  },
  onboarding: {
    navigation: {
      previous: '前へ',
      next: '次へ',
      start: '使い始める',
    },
    visualize: {
      title: '動画の再生品質を<wbr>数字で確認してみよう',
      description:
        'YouTube、Netflix などの対応サイトを開いて、普段通りに動画を見てください。左上に表示される体感品質 (QoE) 値が 5 に近いほど、高解像度の動画を滑らかに再生できています。これはネット環境の優劣を知るひとつの目安となります。',
    },
    dropdown: {
      title: '最近見た動画に<wbr>すばやく戻れる',
      description:
        'ブラウザーのツールバーに VideoMark ボタンを追加すれば、最近見た動画を QoE 値とともに簡単に見ることができます。履歴を提供していない動画サイトでは特に便利な機能です。',
    },
    history: {
      title: '過去の視聴履歴を<wbr>条件で検索',
      description:
        '履歴ページには、VideoMark を使って計測されたすべての動画が一覧で表示されます。タイトル、視聴日、配信元などの条件によって絞り込んで検索したり、詳しい計測結果を確認したりすることも可能です。',
    },
    privacy: {
      title: 'プライバシーを尊重します',
      description:
        'VideoMark は動画視聴体験を分析し、ネットワーク資源の有効活用と品質向上に役立てることを目的とした調査研究プロジェクトです。すべての視聴履歴は匿名データとして蓄積し、一部は統計情報として公開しています。',
      extra:
        '以下のボタンをクリックすることで、<a terms>利用規約</a>と<a privacy>プライバシーポリシー</a>を読んで理解し、視聴データの提供に同意したものとみなされます。',
    },
    addToToolbar: {
      title: 'ツールバーに VideoMark を追加',
      chrome: [
        'ブラウザー右上にある <icon extension>拡張機能</icon> ボタンをクリック',
        'Web VideoMark の横にある <icon push_pin>ピン留め</icon> ボタンをクリック',
      ],
      firefox: [
        'ブラウザー右上にある <icon extension>拡張機能</icon> ボタンをクリック',
        'Web VideoMark の横にある <icon settings>設定</icon> ボタンをクリック',
        '「ツールバーにピン留め」をクリック',
      ],
      safari: [],
    },
  },
  history: {
    empty: 'さっそく、なにか動画を見てみましょう！',
    search: {
      input: '履歴を検索',
      filters: {
        filters: '検索フィルター',
        show_filters: '検索フィルターを表示',
        date: {
          buttonLabel: '視聴日',
          dropdownLabel: '視聴期間',
          options: {
            all: 'すべて',
            today: '今日',
            yesterday: '昨日',
            thisWeek: '今週',
            lastWeek: '先週',
            thisMonth: '今月',
            lastMonth: '先月',
            last7d: '過去 7 日間',
            last30d: '過去 30 日間',
            last90d: '過去 90 日間',
            custom: '任意',
          },
          input: {
            from: '開始日',
            to: '終了日',
          },
        },
        source: {
          buttonLabel: '配信元',
          dropdownLabel: '動画サイト',
        },
        region: {
          buttonLabel: '地域',
          dropdownLabel: '視聴地域',
          unknown: '不明',
        },
        quality: {
          buttonLabel: '品質',
          dropdownLabel: 'QoE 値の範囲とステータス',
          status: {
            pending: '計算中',
            complete: '計算済み',
            error: 'エラー',
            unavailable: '非対応',
          },
          input: {
            min: '最小値',
            max: '最大値',
          },
        },
        time: {
          buttonLabel: '時間帯',
          dropdownLabel: '視聴時間帯',
        },
      },
      notFound: {
        title: '条件に該当する動画は見つかりませんでした。',
        search: 'YouTube で検索',
      },
    },
    detail: {
      switchToTab: 'タブを表示',
      playAgain: 'もう一度見る',
      platformDeprecated: '配信元のサービス終了により、この動画は再生できなくなりました。',
      viewStats: '統計データを表示',
      viewingHistory: '視聴履歴',
      delete: '削除',
      deleteAll: 'すべて削除',
      deleted: {
        description: 'このアイテムは次回 VideoMark 使用時に削除されます。',
        restore: '元に戻す',
        deleteNow: '今すぐ削除',
      },
    },
  },
  stats: {
    qoe: 'QoE 値',
    qoeWatching: '視聴時の体感品質 (QoE) 値',
    whatIsQOE: 'QoE とは？',
    aggregatedHourlyQoe: '同時間帯 ({hour}台) の平均 QoE 値',
    aggregatedRegionalQoe: '同地域 ({region}) の平均 QoE 値',
    bitrate: 'ビットレート',
    throughput: 'スループット',
    resolution: '解像度',
    frameRate: 'フレームレート',
    frameDrops: 'フレームドロップ',
    waitingTime: '待機時間',
    transferSize: '通信量',
    dataMissing: 'データ不足',
    quality: {
      unavailable: 'この動画サービスは QoE 評価に対応していません。',
      measuringShort: '計測中...',
      measuring: 'QoE 値を計測または計算中です。',
      provisional: 'これは暫定 QoE 値です。確定値は計算中です。',
      error: '計測データ不足あるいはその他の理由により QoE 値を取得できませんでした。',
      frameDrops: 'フレームドロップが発生したため実際の体感品質とは異なる可能性があります。',
      frameDropsShort: '実際の体感品質とは異なる可能性があります。',
    },
  },
  settings: {
    show_latest_qoe_enabled: '最新QoE値の表示',
    title: '設定',
    backToHistory: '履歴へ戻る',
    requirePageReload: 'ページを再読み込みすると変更が反映されます',
    experimental: '実験的機能',
    noLimit: '制限なし',
    contents: 'コンテンツ',
    displayOnPlayer: '計測値を動画に重ねて表示する',
    history: '履歴',
    showDuplicateVideos: '重複した動画を表示',
    privacy: 'プライバシー',
    sessionId: 'セッション ID',
    sessionPersistence: 'セッション保持期限',
    clearData: 'データの消去',
    clear: '消去',
    dataSaver: 'データ節約モード',
    dataSaverDescription:
      '<a>対応サイト</a>上で動画再生開始時に制限値に応じてビットレート選択が行われます。',
    maxResolution: '最大解像度',
    maxBitrate: '最大ビットレート',
    bandwidthQuota: '月間の動画通信量が指定値を超えたら制限する',
    maxBitratePerQuota: '通信量超過時の最大ビットレート',
    primeTimeControl: 'ネットワークの混雑する時間帯にビットレートを制限する',
    sessionOnly: '新しいページを読み込むまで',
    clearDialog: {
      title: 'データの消去',
      description:
        '選択した項目がすべて消去されます。履歴を消去してもサーバーに保存されている匿名データは残ります。',
      timeRange: '期間',
      timeRangeOptions: {
        all: '全期間',
        lastHour: '1 時間以内',
        lastDay: '過去 24 時間',
        lastWeek: '過去 7 日間',
        lastMonth: '過去 4 週間',
      },
      settings: '設定',
      sessionId: 'セッション ID',
      history: '視聴履歴',
      graphCache: '統計グラフのキャッシュ',
      confirm: '今すぐ消去',
    },
    personalSessionPrompt: 'セッション ID を入力してください',
    advancedSettings: '上級者向け設定',
    maxVideoTtl: '最大計測単位',
  },
  popup: {
    playing: '再生中の動画',
    recent: '最近見た動画',
    seeAll: 'すべて見る',
    compatiblePlatforms: {
      title: '対応サービス',
      description: '以下の対応サービスで好きな動画を再生し、体感品質値を確認してみましょう。',
    },
    backToHistory: '履歴へ戻る',
  },
  platformList: {
    title: '対応サービス一覧',
    limitations: '制限事項',
  },
};
