<script>
  import { Alert, Button, Drawer, Group, Icon } from '@sveltia/ui';
  import { _, locale } from 'svelte-i18n';
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
  import { isSmallScreen } from '$lib/services/runtime';
  import { formatStats } from '$lib/services/stats';

  export let open = false;
  export let historyItems = [];

  const { SODIUM_MARKETING_SITE_URL } = import.meta.env;

  $: [{ platform, url, title, thumbnail } = {}] = historyItems;
</script>

<Drawer
  bind:open
  size="medium"
  position={$isSmallScreen ? 'bottom' : 'right'}
  lightDismiss={true}
  on:close={() => {
    window.location.replace('#/history');
  }}
>
  <div class="wrapper">
    {#if historyItems.length}
      <header>
        <div class="thumbnail">
          {#if platform?.deprecated}
            <img src={thumbnail} alt="" />
            <div class="overlay">
              <Alert status="error" aria-live="off" --font-size="var(--font-size--small)">
                {$_('history.detail.platformDeprecated')}
              </Alert>
            </div>
          {:else}
            <a href={url} target="_blank">
              <img src={thumbnail} alt={$_('history.detail.playAgain')} />
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
                on:click={() => deleteItemsLater(historyItems.map(({ key }) => key))}
              >
                <Icon slot="start-icon" name="delete_sweep" />
              </Button>
            </div>
          {/if}
        </div>
        {#each historyItems as item (item.id)}
          {@const { key, region = {}, startTime, stats } = item}
          {@const { qoe, isLowQuality } = stats}
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
                  on:click={() => deleteItemsLater([key])}
                >
                  <Icon slot="start-icon" name="delete" />
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
                      on:click={() =>
                        openTab(
                          `${SODIUM_MARKETING_SITE_URL}/${$locale}/faq#cda4d70fc74f8371aaf1b5a52144fe6d`,
                        )}
                    >
                      <Icon name="help" />
                    </Button>
                  </h4>
                  <div>
                    {#if qoe === undefined || qoe === -1}
                      {$_('stats.quality.measuring')}
                    {:else if qoe === -2}
                      <Alert status="error" aria-live="off" --font-size="var(--font-size--small)">
                        {$_('stats.quality.error')}
                      </Alert>
                    {:else}
                      <QualityBar value={qoe} />
                      {#if isLowQuality}
                        <Alert
                          status="warning"
                          aria-live="off"
                          --font-size="var(--font-size--small)"
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
                  <Button variant="tertiary" on:click={() => undoDeletingItems([key])}>
                    {$_('history.detail.deleted.restore')}
                  </Button>
                  <Button variant="tertiary" on:click={() => deleteItemsNow([key])}>
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

      img {
        display: block;
        width: 100%;
        border-radius: 4px;
        aspect-ratio: 16 / 9;
        object-fit: cover;
        background-color: var(--video-background-color);
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
      font-weight: normal;

      :global(button) {
        vertical-align: bottom;

        :global(.icon) {
          color: var(--sui-secondary-foreground-color);
          font-size: var(--sui-font-size-large);
        }
      }

      & + div {
        flex: auto;
      }
    }
  }
</style>
