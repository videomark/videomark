<script>
  import { Icon } from '@sveltia/ui';
  import { _, locale } from 'svelte-i18n';
  import StatsRow from '$lib/components/stats/stats-row.svelte';
  import { formatStats } from '$lib/services/stats';

  /**
   * 最新の統計情報。
   * @type {{ [key: string]: number | { [key: string]: number } }}
   */
  export let stats = {};

  /**
   * これまでの統計情報。
   * @type {{ [key: string]: number[] }}
   */
  export let log = {};

  $: ({ isLowQuality } = stats);
  $: formattedStats = formatStats($locale, stats);
</script>

<table>
  <colgroup>
    <col />
    <col />
    <col />
  </colgroup>
  {#each Object.entries(formattedStats) as [prop, displayValue] (prop)}
    <StatsRow {prop} label={$_(`stats.${prop}`)} {displayValue} chartData={log[prop]} />
  {/each}
</table>

{#if isLowQuality}
  <div class="note">
    <Icon name="warning" />
    {$_('stats.quality.frameDrops')}
  </div>
{/if}

<style lang="scss">
  table {
    table-layout: fixed;
    font-size: var(--sui-font-size-small);

    @media (max-width: 599px) {
      font-size: var(--sui-font-size-x-small);
    }
  }

  col {
    &:not(:last-child) {
      min-width: 120px;

      @media (max-width: 599px) {
        min-width: 80px;
      }
    }
  }

  .note {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: var(--sui-font-size-x-small);

    :global(.icon) {
      font-size: 14px;
    }
  }
</style>
