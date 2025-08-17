<script>
  import { Alert, Button, Icon } from '@sveltia/ui';
  import { waitForVisibility } from '@sveltia/utils/element';
  import { onMount } from 'svelte';
  import { _, locale as appLocale } from 'svelte-i18n';
  import VideoThumbnail from '$lib/pages/history/video-thumbnail.svelte';
  import { completeViewingHistoryItem, viewingHistory } from '$lib/services/history';
  import { formatDateTime } from '$lib/services/i18n';
  import { goto, openTab } from '$lib/services/navigation';
  import { settings } from '$lib/services/settings';
  import StatsVisualizer from '$lib/services/stats-visualizer';

  /**
   * @typedef {Object} Props
   * @property {HistoryItem} [historyItem] - 履歴アイテム。
   * @property {number} [tabId] - 再生中のタブの ID。
   * @property {VideoPlaybackInfo} [playbackInfo] - 再生中の動画の関連情報。
   * @property {boolean} [horizontal] - レイアウトを横並びにするかどうか。
   * @property {boolean} [playing] - 指定された履歴の動画が再生中かどうか。
   */

  /** @type {Props} */
  let {
    /* eslint-disable prefer-const */
    historyItem = {},
    tabId = undefined,
    playbackInfo,
    horizontal = false,
    playing = false,
    /* eslint-enable prefer-const */
  } = $props();

  /**
   * @type {HTMLElement}
   */
  let itemWrapper = $state();

  /**
   * @type {HTMLElement}
   */
  let statsVisualizerPlaceholder = $state();

  /**
   * @type {boolean}
   */
  let statsVisualizerHidden = $state(true);

  /**
   * @type {StatsVisualizer | undefined}
   */
  let statsVisualizer = $state();

  const { key, platform, url, title, thumbnail, startTime, stats } = $derived(historyItem);
  const { calculable, provisionalQoe, finalQoe, isNewerCodec, isLowQuality } = $derived(stats);

  const playAgain = async () => {
    if (platform?.deprecated) {
      return;
    }

    if (tabId) {
      // タブを切り替え
      await chrome.tabs.update(tabId, { active: true });
    } else {
      openTab(url);
    }
  };

  const viewStats = () => {
    if (statsVisualizer) {
      statsVisualizer.open = true;
      statsVisualizerHidden = !statsVisualizerHidden;

      return;
    }

    const keys = $settings.show_duplicate_videos
      ? [key]
      : $viewingHistory.filter((item) => item.url === url).map((item) => item.key);

    if (window.location.hash === '#/history') {
      goto(`#/history/${keys.join(',')}`, { replaceState: true });
    } else {
      openTab(`#/history/${keys.join(',')}`);
    }
  };

  $effect(() => {
    if (playbackInfo) {
      if (!statsVisualizer) {
        statsVisualizer = new StatsVisualizer({ locale: $appLocale, showSummary: false });
        statsVisualizer.attach(statsVisualizerPlaceholder);
      }

      statsVisualizer.update(playbackInfo);
    } else if (statsVisualizer) {
      statsVisualizer.detach();
      statsVisualizer = undefined;
    }
  });

  onMount(() => {
    (async () => {
      await waitForVisibility(itemWrapper);

      if (!('transferSize' in historyItem.stats)) {
        await completeViewingHistoryItem(historyItem);
      }
    })();
  });
</script>

<div class="item" class:horizontal bind:this={itemWrapper}>
  <div
    class="primary hover"
    tabindex="0"
    role="button"
    onclick={(event) => {
      event.stopPropagation();
      playAgain();
    }}
    onkeydown={(event) => {
      if (event.key === 'Enter') {
        playAgain();
      }
    }}
  >
    <div class="hero">
      <VideoThumbnail src={thumbnail} />
    </div>
    <div class="actions close-popup">
      {#if platform?.deprecated}
        <Alert status="error" aria-live="off" --font-size="var(--sui-font-size-small)">
          {$_('history.detail.platformDeprecated')}
        </Alert>
      {:else}
        <Button
          variant="primary"
          size={horizontal ? 'small' : 'medium'}
          class="close-popup play-again"
        >
          {#snippet startIcon()}
            <Icon name="play_circle" />
          {/snippet}
          <span class="label">
            {#if playing}
              {$_('history.detail.switchToTab')}
            {:else}
              {$_('history.detail.playAgain')}
            {/if}
          </span>
        </Button>
      {/if}
    </div>
  </div>
  <div
    class="secondary hover"
    tabindex="0"
    role="button"
    onclick={(event) => {
      event.stopPropagation();
      viewStats();
    }}
    onkeydown={(event) => {
      if (event.key === 'Enter') {
        viewStats();
      }
    }}
  >
    <div class="body">
      <div class="title">{title}</div>
    </div>
    <div class="meta">
      <div class="time">
        {formatDateTime(startTime)}
      </div>
      <div class="qoe">
        {#if !calculable}
          <!--  -->
        {:else if finalQoe === undefined || finalQoe === -1}
          <Icon name="hourglass_empty" aria-label={$_('stats.quality.measuring')} />
          {#if Number.isFinite(provisionalQoe)}
            {provisionalQoe.toFixed(2)}
          {/if}
        {:else if finalQoe === -2}
          <Icon name="error" aria-label={$_('stats.quality.error')} />
        {:else}
          {#if isNewerCodec}
            <Icon name="warning" aria-label={$_('stats.quality.newerCodec')} />
          {:else if isLowQuality}
            <Icon name="warning" aria-label={$_('stats.quality.frameDrops')} />
          {:else}
            <Icon name="equalizer" />
          {/if}
          {finalQoe.toFixed(2)}
        {/if}
      </div>
      <div class="actions {statsVisualizer ? '' : 'close-popup'}">
        <Button
          variant="secondary"
          size={horizontal ? 'small' : 'medium'}
          class="view-stats {statsVisualizer ? '' : 'close-popup'}"
        >
          {#snippet startIcon()}
            <Icon name="monitoring" />
          {/snippet}
          <span class="label">
            {#if statsVisualizer}
              {#if statsVisualizerHidden}
                {$_('history.detail.showLiveStats')}
              {:else}
                {$_('history.detail.hideLiveStats')}
              {/if}
            {:else}
              {$_('history.detail.viewHistory')}
            {/if}
          </span>
        </Button>
      </div>
    </div>
  </div>
</div>

<div
  class="latest-stats"
  bind:this={statsVisualizerPlaceholder}
  hidden={statsVisualizerHidden}
></div>

<style lang="scss">
  .item {
    position: relative;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border-radius: 4px;
    background-color: var(--sui-secondary-background-color);
    box-shadow: 1px 1px 2px #0003;

    &.horizontal {
      flex-direction: row;

      .hero {
        width: 160px;
      }

      .actions {
        flex-direction: row;
      }
    }
  }

  .primary {
    flex: none;
  }

  .secondary {
    flex: auto;
  }

  .hero {
    flex: none;
    position: relative;
    overflow: hidden;
    aspect-ratio: 16 / 9;
  }

  .body {
    flex: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 16px;
    height: 64px;

    .title {
      display: -webkit-box;
      overflow: hidden;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      line-clamp: 2;
      line-height: 1.75;
    }
  }

  .meta {
    min-height: 32px;
    padding: 0 16px;
    color: var(--sui-tertiary-foreground-color);
    background-color: var(--sui-tertiary-background-color);
    font-size: var(--sui-font-size-small);
    display: flex;
    align-items: center;
    gap: 16px;

    & > div {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .time {
      flex: auto;
    }

    .qoe {
      :global(.icon) {
        font-size: var(--sui-font-size-xx-large);
      }
    }
  }

  .hover {
    position: relative;
  }

  @media (pointer: fine) {
    .item {
      &:hover,
      &:active {
        .primary :global(.thumbnail) {
          transform: scale(110%);
        }
      }
    }

    .actions {
      position: absolute;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      background-color: var(--sui-secondary-background-color-translucent);
      opacity: 0;
      transition: all 0.5s;
      cursor: pointer;

      .hover:hover &,
      .hover:focus-within & {
        opacity: 1;
      }
    }
  }

  @media (pointer: coarse) {
    .primary {
      .actions {
        display: none;
      }
    }

    .secondary {
      .meta {
        padding: 4px 4px 4px 16px;
      }

      .actions {
        // Make the button small
        :global(button) {
          border-radius: var(--sui-button-small-border-radius);
          padding: var(--sui-button-small-padding);
          height: var(--sui-button-small-height);
          font-size: var(--sui-font-size-small);

          :global(.icon) {
            font-size: var(--sui-font-size-large);
          }
        }
      }
    }
  }
</style>
