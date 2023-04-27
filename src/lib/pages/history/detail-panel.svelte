<script>
  import QualityBar from '$lib/pages/history/quality-bar.svelte';
  import { getHourlyQoe, getRegionalQoe } from '$lib/services/aggregations';
  import {
    deleteItemsLater,
    deleteItemsNow,
    deletedHistoryItemKeys,
    undoDeletingItems,
  } from '$lib/services/history';
  import { formatDateTime } from '$lib/services/i18n';
  import { openTab } from '$lib/services/navigation';
  import { Button, Drawer, Group, Icon } from '@sveltia/ui';
  import { _, locale } from 'svelte-i18n';

  export let open = false;
  export let historyItems = [];

  const { SODIUM_MARKETING_SITE_URL } = import.meta.env;

  $: [{ platformId, url, title, thumbnail } = {}] = historyItems;
</script>

<Drawer bind:open size="medium" closeOnBackdropClick={true}>
  <div class="wrapper">
    {#if historyItems.length}
      <header>
        <div class="thumbnail">
          <a href={url} target="_blank">
            <img src={thumbnail} alt={$_('history.detail.playAgain')} />
          </a>
        </div>
        <div class="title">
          <div class="platform">{$_(`platforms.${platformId}`)}</div>
          <h2>{title}</h2>
        </div>
      </header>
      <Group>
        <div class="header">
          <div>{$_('history.detail.viewingHistory')}</div>
          {#if historyItems.length > 1}
            <div>
              <Button
                class="tertiary"
                label={$_('history.detail.deleteAll')}
                on:click={() => deleteItemsLater(historyItems.map(({ key }) => key))}
              >
                <Icon slot="start-icon" name="delete_sweep" />
              </Button>
            </div>
          {/if}
        </div>
        {#each historyItems as item (item.id)}
          {@const {
            key,
            region = {},
            startTime,
            qoe,
            isLowQuality,
            transferSize,
            qualityDetails,
          } = item}
          {@const { country, subdivision } = region}
          {@const {
            bitrate,
            resolution,
            framerate,
            speed,
            droppedVideoFrames,
            totalVideoFrames,
            timing: { waiting = 0, pause = 0 } = {},
            creationDate,
          } = qualityDetails}
          {@const playback = creationDate - startTime - pause}
          {@const deleted = $deletedHistoryItemKeys.includes(key)}
          <Group class="view-item">
            <div class="header">
              <h3>{formatDateTime(startTime, { full: true })}</h3>
              <div>
                <Button
                  class="tertiary iconic"
                  disabled={deleted}
                  on:click={() => deleteItemsLater([key])}
                >
                  <Icon slot="start-icon" name="delete" label={$_('history.detail.delete')} />
                </Button>
              </div>
            </div>
            <div class="body">
              <div class="detail" inert={deleted || undefined}>
                <section class="row">
                  <h4>
                    {$_('stats.qoe')}
                    <Button
                      on:click={() =>
                        openTab(
                          `${SODIUM_MARKETING_SITE_URL}/${$locale}/faq#cda4d70fc74f8371aaf1b5a52144fe6d`,
                        )}
                    >
                      <Icon name="help" label={$_('stats.whatIsQOE')} />
                    </Button>
                  </h4>
                  <div>
                    {#if qoe === undefined || qoe === -1}
                      {$_('stats.quality.measuring')}
                    {:else if qoe === -2}
                      <span class="alert error">
                        <Icon name="error" />
                        {$_('stats.quality.error')}
                      </span>
                    {:else}
                      <QualityBar value={qoe} />
                      {#if isLowQuality}
                        <span class="alert warning">
                          <Icon name="warning" />
                          {$_('stats.quality.frameDrops')}
                        </span>
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
                <section class="row">
                  <h4>{$_('stats.bitrate')}</h4>
                  <div>
                    {#if bitrate > 0}
                      {new Intl.NumberFormat(locale, {
                        useGrouping: false,
                        maximumFractionDigits: 0,
                      }).format(bitrate / 1024)} kbps
                    {:else}
                      {$_('stats.dataMissing')}
                    {/if}
                  </div>
                </section>
                <section class="row">
                  <h4>{$_('stats.resolution')}</h4>
                  <div>
                    {#if resolution.width > 0 && resolution.height > 0}
                      {resolution.width} × {resolution.height}
                    {:else}
                      {$_('stats.dataMissing')}
                    {/if}
                  </div>
                </section>
                <section class="row">
                  <h4>{$_('stats.frameRate')}</h4>
                  <div>
                    {#if framerate > 0}
                      {new Intl.NumberFormat(locale, {
                        useGrouping: false,
                      }).format(framerate)} fps
                      {#if speed > 1}
                        × {speed}
                      {/if}
                    {:else}
                      {$_('stats.dataMissing')}
                    {/if}
                  </div>
                </section>
                <section class="row">
                  <h4>{$_('stats.frameDrops')}</h4>
                  <div>
                    {#if Number.isFinite(droppedVideoFrames / totalVideoFrames)}
                      {new Intl.NumberFormat(locale, {
                        style: 'percent',
                        useGrouping: false,
                        maximumFractionDigits: 2,
                      }).format(droppedVideoFrames / totalVideoFrames)}
                      ({new Intl.NumberFormat(locale, {
                        useGrouping: false,
                      }).format(droppedVideoFrames)}
                      / {new Intl.NumberFormat(locale, {
                        useGrouping: false,
                      }).format(totalVideoFrames)})
                    {:else}
                      {$_('stats.dataMissing')}
                    {/if}
                  </div>
                </section>
                <section class="row">
                  <h4>{$_('stats.waitingTime')}</h4>
                  <div>
                    {#if Number.isFinite(waiting / playback)}
                      {new Intl.NumberFormat(locale, {
                        style: 'unit',
                        unit: 'second',
                        useGrouping: false,
                        maximumFractionDigits: 2,
                      }).format(waiting / 1000)}
                      ({new Intl.NumberFormat(locale, {
                        style: 'percent',
                        useGrouping: false,
                        maximumFractionDigits: 2,
                      }).format(waiting / playback)})
                    {:else}
                      {$_('stats.dataMissing')}
                    {/if}
                  </div>
                </section>
                <section class="row">
                  <h4>{$_('stats.playbackTime')}</h4>
                  <div>
                    {#if Number.isFinite(playback)}
                      {new Intl.NumberFormat(locale, {
                        style: 'unit',
                        unit: 'second',
                        useGrouping: false,
                        maximumFractionDigits: 0,
                      }).format(playback / 1000)}
                    {:else}
                      {$_('stats.dataMissing')}
                    {/if}
                  </div>
                </section>
                <section class="row">
                  <h4>{$_('stats.transferSize')}</h4>
                  <div>
                    {#if Number.isFinite(transferSize)}
                      {new Intl.NumberFormat(locale, {
                        style: 'unit',
                        unit: 'megabyte',
                        useGrouping: false,
                        maximumFractionDigits: 2,
                      }).format(transferSize / 1024 / 1024)}
                    {:else}
                      {$_('stats.dataMissing')}
                    {/if}
                  </div>
                </section>
              </div>
              <div class="deleted-overlay" inert={!deleted || undefined}>
                <p>{$_('history.detail.deleted.description')}</p>
                <div class="buttons">
                  <Button class="tertiary" on:click={() => undoDeletingItems([key])}>
                    {$_('history.detail.deleted.restore')}
                  </Button>
                  <Button class="tertiary" on:click={() => deleteItemsNow([key])}>
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
    margin: 0 0 16px;

    .thumbnail {
      flex: none;
      width: calc(50% - 8px);
      aspect-ratio: 16 / 9;

      a {
        display: block;
      }

      img {
        display: block;
        width: 100%;
        border-radius: 4px;
        aspect-ratio: 16 / 9;
        object-fit: contain;
        background-color: var(--video-background-color);
      }
    }

    .title {
      .platform {
        color: var(--tertiary-foreground-color);
      }

      h2 {
        margin: 8px 0 0;
        font-size: var(--font-size--x-large);
        display: -webkit-box;
        overflow: hidden;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 5;
      }
    }

    & + :global(.sui.group) {
      flex: auto;
      overflow-y: auto;
    }
  }

  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .wrapper {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;

    :global(.view-item) {
      margin: 16px 0 0;
      border: 1px solid var(--control-border-color);
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
      background-color: var(--secondary-background-color-translucent);
      backdrop-filter: blur(4px);
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 16px;
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
    border-top: 1px solid var(--control-border-color);
    padding: 8px 0;

    h4 {
      flex: none;
      width: calc(50% - 8px);
      font-weight: normal;

      :global(button) {
        vertical-align: bottom;

        :global(.icon) {
          color: var(--secondary-foreground-color);
          font-size: var(--font-size--large);
        }
      }

      & + div {
        flex: auto;
      }
    }

    .alert {
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-width: 1px;
      border-style: solid;
      border-radius: 4px;
      font-size: var(--font-size--small);

      &.error {
        border-color: var(--danger-border-color);
        color: var(--danger-foreground-color);
        background-color: var(--danger-background-color);
      }

      &.warning {
        border-color: var(--warning-border-color);
        color: var(--warning-foreground-color);
        background-color: var(--warning-background-color);
      }
    }
  }
</style>
