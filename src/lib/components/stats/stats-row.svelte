<script>
  import StatsChart from '$lib/components/stats/stats-chart.svelte';

  /**
   * プロパティ名。例: `bitrate`
   * @type {string}
   */
  export let prop = '';

  /**
   * ラベル。例: "ビットレート"
   * @type {string}
   */
  export let label = '';

  /**
   * 表示する値。例: "1,234 kbps"
   * @type {string}
   */
  export let displayValue = '';

  /**
   * チャートに表示する一連のデータ。
   * @type {number[]}
   */
  export let chartData = [];
</script>

{#if displayValue !== null}
  <tr>
    <th scope="row">{label}</th>
    <td>{displayValue}</td>
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
