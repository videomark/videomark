<script>
  /**
   * QoE 値。最小 1、最大 5。棒グラフは直感的に見て分かりやすいように 0 起点としている。
   */
  export let value = 5;

  $: percent = Number.parseInt(value * 20, 10);
</script>

<div class="base">
  <div class="bar">
    <div
      class="indicator"
      style:width="{percent}%"
      style:background-color="hsl({percent}, 70%, 40%)"
    />
  </div>
  <div class="number">{value}</div>
</div>

<style lang="scss">
  .base {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .bar {
    flex: auto;
    position: relative;
    overflow: hidden;
    width: 100%;
    height: 8px;
    border: 1px solid var(--sui-control-border-color);
    border-radius: 4px;
    background-color: var(--sui-tertiary-background-color);

    .indicator {
      position: absolute;
      inset: 0;
      height: 100%;
      border-radius: 4px;
    }
  }

  .number {
    min-width: 40px;
    text-align: right;
  }
</style>
