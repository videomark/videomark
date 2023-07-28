<script>
  import { Alert, Button, Icon } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import { viewingHistory } from '$lib/services/history';
  import { formatDateTime } from '$lib/services/i18n';
  import { openTab } from '$lib/services/navigation';
  import { settings } from '$lib/services/settings';

  export let historyItem = {};
  export let horizontal = false;

  /**
   * 指定された履歴の動画が再生中かどうか。
   * @type {boolean}
   */
  export let playing = false;

  $: ({ key, platform, url, title, thumbnail, startTime, stats } = historyItem || {});
  $: ({ qoe, isLowQuality } = stats);
</script>

<div class="item" class:horizontal>
  <div class="primary">
    <div class="hero">
      <img class="thumbnail" src={thumbnail} alt="" />
    </div>
  </div>
  <div class="secondary">
    <div class="body">
      <div class="title">{title}</div>
    </div>
    <div class="meta">
      <div class="time">
        {formatDateTime(startTime)}
      </div>
      <div class="qoe">
        {#if qoe === undefined || qoe === -1}
          <Icon name="hourglass_empty" label={$_('stats.quality.measuring')} />
        {:else if qoe === -2}
          <Icon name="error" label={$_('stats.quality.error')} />
        {:else}
          {#if isLowQuality}
            <Icon name="warning" label={$_('stats.quality.frameDrops')} />
          {:else}
            <Icon name="equalizer" />
          {/if}
          {qoe}
        {/if}
      </div>
    </div>
  </div>
  <div
    class="actions close-popup"
    role="none"
    on:click|stopPropagation={() => {
      if (!platform?.deprecated) {
        openTab(url);
      }
    }}
  >
    {#if platform?.deprecated}
      <Alert type="error" aria-live="off" --font-size="var(--font-size--small)">
        {$_('history.detail.platformDeprecated')}
      </Alert>
    {:else}
      <Button
        class="primary close-popup"
        on:click={(event) => {
          openTab(url);
          event.stopPropagation();
        }}
      >
        <Icon slot="start-icon" name="play_circle" />
        {#if playing}
          {$_('history.detail.switchToTab')}
        {:else}
          {$_('history.detail.playAgain')}
        {/if}
      </Button>
    {/if}
    <Button
      class="secondary close-popup"
      on:click={(event) => {
        const keys = $settings.show_duplicate_videos
          ? [key]
          : $viewingHistory.filter((item) => item.url === url).map((item) => item.key);

        openTab(`#/history/${keys.join(',')}`);
        event.stopPropagation();
      }}
    >
      <Icon slot="start-icon" name="monitoring" />
      {$_('history.detail.viewStats')}
    </Button>
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

    &:hover,
    &:active {
      .primary .thumbnail {
        transform: scale(110%);
      }
    }

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

    .thumbnail {
      width: 100%;
      aspect-ratio: 16 / 9;
      object-fit: contain;
      background-color: var(--sui-video-background-color);
      transition: all 0.5s;
    }
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
      line-height: 1.75;
    }
  }

  .meta {
    height: 32px;
    padding: 0 16px;
    color: var(--sui-tertiary-foreground-color);
    background-color: var(--sui-tertiary-background-color);
    font-size: var(--sui-font-size-small);
    display: flex;
    justify-content: space-between;
    align-items: center;

    & > div {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    .qoe {
      :global(.icon) {
        font-size: var(--sui-font-size-xx-large);
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

    .item:hover &,
    .item:focus-within & {
      opacity: 1;
    }

    :global(button) {
      white-space: nowrap;
    }
  }
</style>
