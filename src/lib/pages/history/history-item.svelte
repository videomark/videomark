<script>
  import { viewingHistory } from '$lib/services/history';
  import { formatDateTime } from '$lib/services/i18n';
  import { openTab } from '$lib/services/navigation';
  import { settings } from '$lib/services/settings';
  import { Button, Icon } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';

  export let historyItem = {};
  export let horizontal = false;

  $: ({ key, url, title, thumbnail, startTime, qoe, isLowQuality } = historyItem || {});

  const _openTab = async (url) => {
    await openTab(url);

    if (window.location.hash === '#/popup') {
      // ポップアップを閉じる
      window.close();
    }
  };
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
          <Icon name="hourglass_empty" label={$_('history.detail.quality.calculating')} />
        {:else if qoe === -2}
          <Icon name="error" label={$_('history.detail.quality.error')} />
        {:else}
          {#if isLowQuality}
            <Icon name="warning" label={$_('history.detail.quality.frameDrops')} />
          {:else}
            <Icon name="equalizer" />
          {/if}
          {qoe}
        {/if}
      </div>
    </div>
  </div>
  <!-- svelte-ignore a11y-click-events-have-key-events -->
  <div class="actions" on:click|stopPropagation={() => _openTab(url)}>
    <Button
      class="primary"
      on:click={(event) => {
        _openTab(url);
        event.stopPropagation();
      }}
    >
      <Icon slot="start-icon" name="play_circle" />
      {$_('history.detail.playAgain')}
    </Button>
    <Button
      class="secondary"
      on:click={(event) => {
        const keys = $settings.show_duplicate_videos
          ? [key]
          : $viewingHistory.filter((item) => item.url === url).map((item) => item.key);

        _openTab(`#/history/${keys.join(',')}`);
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
    background-color: var(--secondary-background-color);
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
      background-color: var(--video-background-color);
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
    color: var(--tertiary-foreground-color);
    background-color: var(--tertiary-background-color);
    font-size: var(--font-size--small);
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
        font-size: var(--font-size--xx-large);
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
    background-color: var(--secondary-background-color-translucent);
    opacity: 0;
    transition: all 0.5s;
    cursor: pointer;

    .item:hover &,
    .item:focus-within & {
      opacity: 1;
    }
  }
</style>