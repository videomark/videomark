<script>
  import { Alert, Button, Icon } from '@sveltia/ui';
  import { waitForVisibility } from '@sveltia/utils/element';
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import VideoThumbnail from '$lib/pages/history/video-thumbnail.svelte';
  import { completeViewingHistoryItem, viewingHistory } from '$lib/services/history';
  import { formatDateTime } from '$lib/services/i18n';
  import { goto, openTab } from '$lib/services/navigation';
  import { settings } from '$lib/services/settings';

  /** @type {HistoryItem} */
  export let historyItem = {};
  export let horizontal = false;

  /**
   * 指定された履歴の動画が再生中かどうか。
   * @type {boolean}
   */
  export let playing = false;

  /**
   * @type {HTMLElement}
   */
  let itemWrapper;

  $: ({ key, platform, url, title, thumbnail, startTime, stats } = historyItem);
  $: ({ calculable, provisionalQoe, finalQoe, isLowQuality } = stats);

  const playAgain = () => {
    if (!platform?.deprecated) {
      openTab(url);
    }
  };

  const viewStats = () => {
    const keys = $settings.show_duplicate_videos
      ? [key]
      : $viewingHistory.filter((item) => item.url === url).map((item) => item.key);

    if (window.location.hash === '#/history') {
      goto(`#/history/${keys.join(',')}`, { replaceState: true });
    } else {
      openTab(`#/history/${keys.join(',')}`);
    }
  };

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
    on:click|stopPropagation={() => {
      playAgain();
    }}
    on:keydown={(event) => {
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
          <Icon slot="start-icon" name="play_circle" />
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
    on:click|stopPropagation={() => {
      viewStats();
    }}
    on:keydown={(event) => {
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
          {#if isLowQuality}
            <Icon name="warning" aria-label={$_('stats.quality.frameDrops')} />
          {:else}
            <Icon name="equalizer" />
          {/if}
          {finalQoe.toFixed(2)}
        {/if}
      </div>
      <div class="actions close-popup">
        <Button
          variant="secondary"
          size={horizontal ? 'small' : 'medium'}
          class="close-popup view-stats"
        >
          <Icon slot="start-icon" name="monitoring" />
          <span class="label">
            {$_('history.detail.viewStats')}
          </span>
        </Button>
      </div>
    </div>
  </div>
</div>

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
