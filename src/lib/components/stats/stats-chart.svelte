<script>
  import sparkline from '@videomark/sparkline';

  /**
   * @typedef {Object} Props
   * @property {string} [prop] - プロパティ名。例: `bitrate`
   * @property {number[]} [chartData] - チャートに表示する一連のデータ。
   */

  /** @type {Props} */
  let {
    /* eslint-disable prefer-const */
    prop = '',
    chartData = [],
    /* eslint-enable prefer-const */
  } = $props();

  /**
   * チャートを表示する SVG 要素。
   * @type {SVGElement}
   */
  let chartElement = $state();

  const chartOptions = $derived({ qoe: { min: 1.0, max: 5.0 } }[prop]);

  $effect(() => {
    if (chartElement && chartData.length) {
      sparkline(chartElement, chartData, chartOptions);
    }
  });
</script>

<svg role="none" data-prop={prop} bind:this={chartElement} />

<style lang="scss">
  svg {
    width: 120px;
    height: 1.25em;
    vertical-align: middle;
    stroke-width: 2px;

    &[data-prop='frameDrops'],
    &[data-prop='waitingTime'],
    &[data-prop='transferSize'] {
      stroke: rgb(255, 75, 0);
      fill: rgba(255, 75, 0, 0.3);
    }

    &[data-prop='bitrate'],
    &[data-prop='throughput'],
    &[data-prop='qoe'] {
      stroke: rgb(3, 175, 122);
      fill: rgba(3, 175, 122, 0.3);
    }

    &[data-prop='resolution'],
    &[data-prop='frameRate'] {
      stroke: rgb(0, 90, 255);
      fill: rgba(0, 90, 255, 0.3);
    }
  }
</style>
