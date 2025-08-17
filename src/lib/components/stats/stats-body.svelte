<script>
  import { Icon } from '@sveltia/ui';
  import { onMount } from 'svelte';
  import { _, locale } from 'svelte-i18n';
  import StatsRow from '$lib/components/stats/stats-row.svelte';
  import { YOUTUBE_PLAYER_SELECTOR } from '$lib/content/sodium/modules/Config';
  import { formatStats } from '$lib/services/stats';

  /**
   * @typedef {Object} Props
   * @property {{ [key: string]: number | { [key: string]: number } }} [stats] - 最新の統計情報。
   * @property {{ [key: string]: (number | null)[] }} [log] - これまでの統計情報。
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
  let isNewerCodec = $state(false);

  /**
   * チャートに表示するデータを取得する。`runtime.onMessage` で受信したデータは JSON シリアライズされており、
   * `NaN` が `null` に変換されてしまうため、チャートで描画できるよう再度 `NaN` に変換する。
   * @param {string} prop - 統計情報のプロパティ名。
   * @returns {number[]} - チャートに表示するデータの配列。
   */
  const getChartData = (prop) => log[prop].map((value) => (value === null ? NaN : value));

  onMount(() => {
    try {
      const player = document.querySelector(YOUTUBE_PLAYER_SELECTOR);
      const { codecs } = player?.getStatsForNerds() ?? {};
      const isH264 = codecs?.startsWith('avc1.') ?? false;

      isNewerCodec = !isH264;
    } catch {
      //
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
    {#if prop !== 'qoe'}
      <StatsRow {prop} label={$_(`stats.${prop}`)} {displayValue} chartData={getChartData(prop)} />
    {/if}
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
    width: 100%;
    max-width: 400px;
    font-size: 11px;
    white-space: nowrap;
  }

  col {
    &:not(:last-child) {
      min-width: 120px;

      @media (max-width: 599px) {
        min-width: 80px;
      }
    }

    &.chart {
      width: 0; // 最小幅
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
