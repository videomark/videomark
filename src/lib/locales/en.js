export const strings = {
  _: {
    selectAll: 'Select All',
    unselectAll: 'Unselect All',
  },
  platforms: {
    youtube: 'YouTube',
    netflix: 'Netflix',
    paravi: 'Paravi',
    tver: 'TVer',
    fod: 'FOD',
    nicovideo: 'Niconico',
    nicolive: 'Niconico Live',
    nhkondemand: 'NHK On Demand',
    dtv: 'dTV',
    abematv: 'ABEMA',
    amazonprimevideo: 'Prime Video (Japan)',
    iijtwilightconcert: 'TWILIGHT CONCERT',
    gorin: 'gorin.jp',
  },
  subdivisions: {
    JP: {
      1: 'Hokkaido',
      2: 'Aomori',
      3: 'Iwate',
      4: 'Miyagi',
      5: 'Akita',
      6: 'Yamagata',
      7: 'Fukushima',
      8: 'Ibaraki',
      9: 'Tochigi',
      10: 'Gunma',
      11: 'Saitama',
      12: 'Chiba',
      13: 'Tokyo',
      14: 'Kanagawa',
      15: 'Niigata',
      16: 'Toyama',
      17: 'Ishikawa',
      18: 'Fukui',
      19: 'Yamanashi',
      20: 'Nagano',
      21: 'Gifu',
      22: 'Shizuoka',
      23: 'Aichi',
      24: 'Mie',
      25: 'Shiga',
      26: 'Kyoto',
      27: 'Osaka',
      28: 'Hyogo',
      29: 'Nara',
      30: 'Wakayama',
      31: 'Tottori',
      32: 'Shimane',
      33: 'Okayama',
      34: 'Hiroshima',
      35: 'Yamaguchi',
      36: 'Tokushima',
      37: 'Kagawa',
      38: 'Ehime',
      39: 'Kochi',
      40: 'Fukuoka',
      41: 'Saga',
      42: 'Nagasaki',
      43: 'Kumamoto',
      44: 'Oita',
      45: 'Miyazaki',
      46: 'Kagoshima',
      47: 'Okinawa',
    },
  },
  onboarding: {
    navigation: {
      previous: 'Previous',
      next: 'Next',
      start: 'Getting Started',
    },
    visualize: {
      title: 'Visualize video playback quality in numbers',
      description:
        'Open YouTube, Netflix, or other compatible sites and watch videos as usual. The closer the Quality of Experience (QoE) value displayed at the top left corner of the video to 5, the smoother the high-resolution video is playing. This will give you an idea of how good your Internet environment is.',
    },
    dropdown: {
      title: 'Quickly return to recently viewed videos',
      description:
        'Adding the VideoMark button to the browser toolbar makes it easy to access recently watched videos along with their QoE values. This is especially useful for video sites that do not offer history.',
    },
    history: {
      title: 'Search past viewing history by criteria',
      description:
        'The history page lists all videos that have been measured using VideoMark. You can filter your search by viewing title, date, source and other criteria, and view detailed statistics.',
    },
    privacy: {
      title: 'We respect your privacy',
      description:
        'VideoMark is a research project that analyzes the video viewing experience and aims to help improve the quality and effective use of network resources. All viewing records are stored as anonymous data, and some of them are made public as statistical information.',
      extra:
        'By clicking the button below, you acknowledge that you have read and understood our <a terms>Terms of Use</a> and <a privacy>Privacy Policy</a> and agree to provide your viewing data.',
    },
    addToToolbar: {
      title: 'Add VideoMark to Toolbar',
      chrome: [
        'Click on the <icon extension>Extension</icon> button at the top right corner of the browser',
        'Click on the <icon push_pin>Pin</icon> button next to Web VideoMark',
      ],
      firefox: [
        'Click on the <icon extension>Extension</icon> button at the top right corner of the browser',
        'Click on the <icon settings>Settings</icon> button next to Web VideoMark',
        'Click Pin to Toolbar',
      ],
      safari: [],
    },
  },
  history: {
    empty: 'Now let’s watch some videos',
    search: {
      input: 'Search History',
      filters: {
        date: {
          buttonLabel: 'Dates',
          dropdownLabel: 'Viewing Date Range',
          options: {
            all: 'All',
            today: 'Today',
            yesterday: 'Yesterday',
            thisWeek: 'This Week',
            lastWeek: 'Last Week',
            thisMonth: 'This Month',
            lastMonth: 'Last Month',
            last7d: 'Last 7 Days',
            last30d: 'Last 30 Days',
            last90d: 'Last 90 Days',
            custom: 'Custom',
          },
          input: {
            from: 'From',
            to: 'To',
          },
        },
        source: {
          buttonLabel: 'Sources',
          dropdownLabel: 'Video Platforms',
        },
        region: {
          buttonLabel: 'Regions',
          dropdownLabel: 'Viewing Regions',
          unknown: 'Unknown',
        },
        quality: {
          buttonLabel: 'Quality',
          dropdownLabel: 'QoE Value Range and Statuses',
          status: {
            progress: 'Calculating',
            complete: 'Calculated',
            error: 'Error',
          },
          input: {
            min: 'Min.',
            max: 'Max.',
          },
        },
        time: {
          buttonLabel: 'Time',
          dropdownLabel: 'Viewing Time Slot Range',
        },
      },
      notFound: {
        title: 'No videos were found matching the criteria.',
        search: 'Search on YouTube',
      },
    },
    detail: {
      playAgain: 'Play Again',
      viewStats: 'View Stats',
      viewingHistory: 'Viewing History',
      delete: 'Delete',
      deleteAll: 'Delete All',
      deleted: {
        description: 'This item will be deleted next time you use VideoMark.',
        restore: 'Restore',
        deleteNow: 'Delete Now',
      },
    },
  },
  stats: {
    qoe: 'QoE Value',
    qoeWatching: 'Quality of Experience (QoE) value while watching',
    whatIsQOE: 'What is QoE?',
    aggregatedHourlyQoe: 'Average QoE value during the same hour ({hour})',
    aggregatedRegionalQoe: 'Average QoE value in the region ({region})',
    bitrate: 'Bitrate',
    throughput: 'Throughput',
    resolution: 'Resolution',
    frameRate: 'Frame Rate',
    frameDrops: 'Frame Drops',
    waitingTime: 'Waiting Time',
    transferSize: 'Transfer Size',
    dataMissing: 'Data unavailable',
    quality: {
      measuringShort: 'Measuring...',
      measuring: 'QoE value is being measured or calculated.',
      error: 'We could not retrieve QoE values due to the lack of measurement data.',
      frameDrops: 'Actual quality of experience may differ due to frame drops',
      frameDropsShort: 'Actual quality of experience  may differ',
    },
  },
  settings: {
    title: 'Settings',
    backToHistory: 'Back to History',
    requirePageReload: 'Reload the page to reflect the change',
    experimental: 'Experimental',
    noLimit: 'No limit',
    contents: 'Contents',
    displayOnPlayer: 'Display measurements over video',
    history: 'History',
    showDuplicateVideos: 'Show duplicate videos',
    privacy: 'Privacy',
    sessionId: 'Session ID',
    sessionPersistence: 'Session persistence',
    clearData: 'Clear data',
    clear: 'Clear',
    dataSaver: 'Data Saver',
    dataSaverDescription:
      'Bitrate will be selected according to the limit at the start of video playback on the <a>compatible platforms</a>.',
    maxResolution: 'Maximum resolution',
    maxBitrate: 'Maximum bitrate',
    bandwidthQuota: 'Limit once the monthly video traffic exceeds the limit specified.',
    maxBitratePerQuota: 'Maximum bit rate when traffic volume is exceeded',
    primeTimeControl: 'Limit bitrate during peak network congestion times',
    sessionOnly: 'Until a new page is loaded',
    clearDialog: {
      title: 'Clear Data',
      description:
        'All selected items will be erased. Even if the history is cleared, anonymous data stored on the server will remain.',
      settings: 'Settings',
      sessionId: 'Session ID',
      history: 'Viewing history',
      graphCache: 'Stats graph cache',
      confirm: 'Clear Now',
    },
    personalSessionPrompt: 'Please enter your Session ID',
    advancedSettings: 'Advanced Settings',
    maxVideoTtl: 'Maximum measurement unit',
  },
  popup: {
    playing: 'Now Playing',
    recent: 'Recently Played',
    seeAll: 'See All',
    compatiblePlatforms: {
      title: 'Compatible Platforms',
      description:
        'Play any video you like on the following compatible services and check the Quality of Experience value.',
    },
    backToHistory: 'Back to History',
  },
  platformList: {
    title: 'Compatible Platforms',
    limitations: 'Limitations',
  },
};
