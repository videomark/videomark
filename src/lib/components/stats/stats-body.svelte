<script>
  import { Icon } from '@sveltia/ui';
  import { _, locale } from 'svelte-i18n';
  import StatsRow from '$lib/components/stats/stats-row.svelte';
  import { formatStats } from '$lib/services/stats';

  /**
   * @typedef {Object} Props
   * @property {{ [key: string]: number | { [key: string]: number } }} [stats] - 最新の統計情報。
   * @property {{ [key: string]: number[] }} [log] - これまでの統計情報。
   */

  /** @type {Props} */
  let {
    /* eslint-disable prefer-const */
    stats = {},
    log = {},
    /* eslint-enable prefer-const */
  } = $props();

  const { qoe, isLowQuality } = $derived(stats);
  const formattedStats = $derived(formatStats($locale, stats));

  /**
   * 動画コーデックが H.264 以外 (VP8/VP9/AV1) かどうか。(YouTube のみ)
   * @type {boolean}
   */
  const isNewerCodec = $derived.by(() => {
    try {
      const { codecs } = document.querySelector('#movie_player')?.getStatsForNerds() ?? {};
      const isH264 = codecs?.startsWith('avc1.') ?? false;

      return !isH264;
    } catch {
      return false;
    }
  });
</script>

<table>
  <colgroup>
    {#each ['key', 'value', 'chart'] as className}
      <col class={className} />
    {/each}
  </colgroup>
  {#each Object.entries(formattedStats) as [prop, displayValue] (prop)}
    <StatsRow {prop} label={$_(`stats.${prop}`)} {displayValue} chartData={[...log[prop]]} />
  {/each}
</table>

{#if Number.isFinite(qoe) && isNewerCodec}
  <div class="note">
    <Icon name="warning" />
    {$_('stats.quality.newerCodec')}
  </div>
{:else if isLowQuality}
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
