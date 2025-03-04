<script>
  import StatsChart from '$lib/components/stats/stats-chart.svelte';

  /**
   * @typedef {Object} Props
   * @property {string} [prop] - プロパティ名。例: `bitrate`
   * @property {string} [label] - ラベル。例: "ビットレート"
   * @property {string} [displayValue] - 表示する値。例: "1,234 kbps"
   * @property {number[]} [chartData] - チャートに表示する一連のデータ。
   */

  /** @type {Props} */
  let {
    /* eslint-disable prefer-const */
    prop = '',
    label = '',
    displayValue = '',
    chartData = [],
    /* eslint-enable prefer-const */
  } = $props();
</script>

{#if displayValue !== null || chartData.some(Boolean)}
  <tr>
    <th scope="row">{label}</th>
    <td>{displayValue ?? '–'}</td>
    <td>
      <StatsChart {prop} {chartData} />
    </td>
  </tr>
{/if}

<style lang="scss">
  th,
  td {
    padding: 0;

    &:not(:last-child) {
      padding-right: 8px;
    }
  }

  th {
    font-weight: bold;
    text-align: left;
  }
</style>
