<script>
  import { Alert, Button, Drawer, Group, Icon } from '@sveltia/ui';
  import { _, locale } from 'svelte-i18n';
  import QualityBar from '$lib/pages/history/quality-bar.svelte';
  import VideoThumbnail from '$lib/pages/history/video-thumbnail.svelte';
  import { getHourlyQoe, getRegionalQoe } from '$lib/services/aggregations';
  import {
    completeViewingHistoryItem,
    deleteItemsLater,
    deleteItemsNow,
    deletedHistoryItemKeys,
    undoDeletingItems,
  } from '$lib/services/history';
  import { formatDateTime } from '$lib/services/i18n';
  import { goto, openTab } from '$lib/services/navigation';
  import { isSmallScreen } from '$lib/services/runtime';
  import { formatStats } from '$lib/services/stats';

  /**
   * @typedef {Object} Props
   * @property {boolean} [open] - パネルが開かれているかどうか。
   * @property {HistoryItem[]} [historyItems] - 履歴アイテムのリスト。
   */

  /** @type {Props} */
  let {
    /* eslint-disable prefer-const */
    open = $bindable(false),
    historyItems = [],
    /* eslint-enable prefer-const */
  } = $props();

  const { SODIUM_MARKETING_SITE_URL } = import.meta.env;

  const completeHistory = () => {
    historyItems.forEach(async (historyItem) => {
      if (!('transferSize' in historyItem.stats)) {
        await completeViewingHistoryItem(historyItem);
      }
    });
  };

  const [{ platform, url, title, thumbnail } = {}] = $derived(historyItems);

  $effect(() => {
    if (open) {
      completeHistory();
    }
  });
</script>

<Drawer
  bind:open
  size="medium"
  position={$isSmallScreen ? 'bottom' : 'right'}
  lightDismiss={true}
  onClose={() => {
    goto('#/history', { replaceState: true });
  }}
>
  <div class="wrapper">
    {#if historyItems.length}
      <header>
        <div class="thumbnail">
          {#if platform?.deprecated}
            <VideoThumbnail src={thumbnail} />
            <div class="overlay">
              <Alert status="error" aria-live="off" --font-size="var(--sui-font-size-small)">
                {$_('history.detail.platformDeprecated')}
              </Alert>
            </div>
          {:else}
            <a href={url} target="_blank" aria-label={$_('history.detail.playAgain')}>
              <VideoThumbnail src={thumbnail} />
            </a>
          {/if}
        </div>
        <div class="title">
          <div class="platform">{$_(`platforms.${platform?.id}`)}</div>
          <h2>{title}</h2>
        </div>
      </header>
      <Group>
        <div class="header">
          <div>{$_('history.detail.viewingHistory')}</div>
          {#if historyItems.length > 1}
            <div>
              <Button
                variant="tertiary"
                label={$_('history.detail.deleteAll')}
                onclick={() => deleteItemsLater(historyItems.map(({ key }) => key))}
              >
                {#snippet startIcon()}
                  <Icon name="delete_sweep" />
                {/snippet}
              </Button>
            </div>
          {/if}
        </div>
        {#each historyItems as item (item.key)}
          {@const { key, region = {}, startTime, stats } = item}
          {@const { calculable, provisionalQoe, finalQoe, isLowQuality } = stats}
          {@const { country, subdivision } = region ?? {}}
          {@const formattedStats = formatStats($locale, stats)}
          {@const deleted = $deletedHistoryItemKeys.includes(key)}
          <Group class="view-item">
            <div class="header">
              <h3>{formatDateTime(startTime, { full: true })}</h3>
              <div>
                <Button
                  variant="tertiary"
                  iconic
                  disabled={deleted}
                  aria-label={$_('history.detail.delete')}
                  onclick={() => deleteItemsLater([key])}
                >
                  {#snippet startIcon()}
                    <Icon name="delete" />
                  {/snippet}
                </Button>
              </div>
            </div>
            <div class="body">
              <div class="detail" inert={deleted || undefined}>
                <section class="row">
                  <h4>
                    {$_('stats.qoeWatching')}
                    <Button
                      aria-label={$_('stats.whatIsQOE')}
                      onclick={() =>
                        openTab(
                          `${SODIUM_MARKETING_SITE_URL}/${$locale}/faq#cda4d70fc74f8371aaf1b5a52144fe6d`,
                        )}
                    >
                      <Icon name="help" />
                    </Button>
                  </h4>
                  <div>
                    {#if !calculable}
                      {$_('stats.quality.unavailable')}
                    {:else if finalQoe === undefined || finalQoe === -1}
                      {#if Number.isFinite(provisionalQoe)}
                        <QualityBar value={provisionalQoe} />
                        <Alert
                          status="warning"
                          aria-live="off"
                          --font-size="var(--sui-font-size-small)"
                        >
                          {$_('stats.quality.provisional')}
                        </Alert>
                      {:else}
                        {$_('stats.quality.measuring')}
                      {/if}
                    {:else if finalQoe === -2}
                      <Alert
                        status="error"
                        aria-live="off"
                        --font-size="var(--sui-font-size-small)"
                      >
                        {$_('stats.quality.error')}
                      </Alert>
                    {:else}
                      <QualityBar value={finalQoe} />
                      {#if isLowQuality}
                        <Alert
                          status="warning"
                          aria-live="off"
                          --font-size="var(--sui-font-size-small)"
                        >
                          {$_('stats.quality.frameDrops')}
                        </Alert>
                      {/if}
                    {/if}
                  </div>
                </section>
                {#if country && subdivision}
                  {#await getRegionalQoe(country, subdivision) then average}
                    {#if average}
                      <section class="row">
                        <h4>
                          {$_('stats.aggregatedRegionalQoe', {
                            values: {
                              region: $_(`subdivisions.${country}.${subdivision}`, {
                                default: subdivision,
                              }),
                            },
                          })}
                        </h4>
                        <div>
                          <QualityBar value={average} />
                        </div>
                      </section>
                    {/if}
                  {/await}
                {/if}
                {#await getHourlyQoe(new Date(startTime).getHours()) then average}
                  {#if average}
                    <section class="row">
                      <h4>
                        {$_('stats.aggregatedHourlyQoe', {
                          values: {
                            hour: new Date(startTime)
                              .toLocaleTimeString($locale, { hour: 'numeric', hour12: true })
                              .replace(/\b(\w+)\b/g, ' $1 ') // 英数字の前後に空白を追加
                              .replace(/\s{2,}/, ' ')
                              .trim(),
                          },
                        })}
                      </h4>
                      <div>
                        <QualityBar value={average} />
                      </div>
                    </section>
                  {/if}
                {/await}
                {#each Object.entries(formattedStats) as [prop, displayValue] (prop)}
                  {#if prop !== 'qoe'}
                    <section class="row">
                      <h4>{$_(`stats.${prop}`)}</h4>
                      <div>{displayValue || $_('stats.dataMissing')}</div>
                    </section>
                  {/if}
                {/each}
              </div>
              <div class="deleted-overlay" inert={!deleted || undefined}>
                <p>{$_('history.detail.deleted.description')}</p>
                <div class="buttons">
                  <Button variant="tertiary" onclick={() => undoDeletingItems([key])}>
                    {$_('history.detail.deleted.restore')}
                  </Button>
                  <Button variant="tertiary" onclick={() => deleteItemsNow([key])}>
                    {$_('history.detail.deleted.deleteNow')}
                  </Button>
                </div>
              </div>
            </div>
          </Group>
        {/each}
      </Group>
    {/if}
  </div>
</Drawer>

<style lang="scss">
  header {
    flex: none;
    display: flex;
    gap: 16px;
    margin: 24px;

    .thumbnail {
      flex: none;
      position: relative;
      width: calc(50% - 8px);
      aspect-ratio: 16 / 9;

      .overlay {
        position: absolute;
        inset: 8px;
        display: flex;
        align-items: center;
      }

      a {
        display: block;
      }

      :global(.thumbnail) {
        border-radius: 4px;
      }
    }

    .title {
      .platform {
        color: var(--sui-tertiary-foreground-color);
      }

      h2 {
        margin: 8px 0 0;
        font-size: var(--sui-font-size-x-large);
        display: -webkit-box;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 5;
        line-clamp: 5;
      }
    }

    & + :global(.sui.group) {
      flex: auto;
      overflow-y: auto;
      padding: 0 24px 24px;
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
      font-size: var(--sui-font-size-large);
    }
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    margin: -24px;
    height: calc(100% + 48px);

    :global(.view-item) {
      margin: 16px 0 0;
      border: 1px solid var(--sui-control-border-color);
      border-radius: 4px;
      padding: 16px;
    }

    .body {
      position: relative;
      margin: 8px 0 0;
    }

    .deleted-overlay {
      position: absolute;
      inset: -8px;
      backdrop-filter: blur(8px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 16px;
      text-align: center;
      opacity: 1;
      transition: all 250ms;

      &[inert] {
        opacity: 0;
      }

      p {
        margin: 0;
      }

      .buttons {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }
  }

  section.row {
    display: flex;
    gap: 16px;
    border-top: 1px solid var(--sui-control-border-color);
    padding: 8px 0;

    h4 {
      flex: none;
      width: calc(50% - 8px);
      font-size: var(--sui-font-size-default);
      font-weight: normal;

      :global(button) {
        padding: 0;
        width: var(--sui-font-size-large);
        height: var(--sui-font-size-large);
        vertical-align: middle;

        :global(.icon) {
          color: var(--sui-secondary-foreground-color);
          font-size: var(--sui-font-size-large);
        }
      }

      & + div {
        flex: auto;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
    }
  }
</style>
