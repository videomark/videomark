<script>
  import { Icon } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';

  /**
   * 最新の統計情報。
   * @type {{ [key: string]: number | { [key: string]: number } }}
   */
  export let stats = {};

  $: ({ qoe } = stats);
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<summary on:click|preventDefault>
  <div class="label">
    {#if Number.isFinite(qoe)}
      <span class="qoe">{qoe.toFixed(2)}</span>
      <span
        class="stars"
        style:background-image="linear-gradient(to right, #ffce00 0%, #ffce00
        {qoe * 20}%, gray {qoe * 20}%, gray 100%)"
      >
        <Icon name="star" />
        <Icon name="star" />
        <Icon name="star" />
        <Icon name="star" />
        <Icon name="star" />
      </span>
    {:else}
      {$_('stats.quality.measuringShort')}
    {/if}
  </div>
</summary>

<style lang="scss">
  summary {
    font-size: var(--sui-font-size-default);
    font-weight: bold;

    @media (max-width: 599px) {
      font-size: var(--sui-font-size-small);
    }

    .label {
      display: inline-flex;
      gap: 4px;
      align-items: center;
      margin: 0 4px;
    }

    .qoe {
      color: #fff;
    }

    .stars {
      display: inline-block;
      color: transparent;
      -webkit-background-clip: text;
      background-clip: text;
      line-height: 1;

      :global(.icon) {
        display: inline-block;
        font-size: 18px;
        font-variation-settings: 'FILL' 1;

        &:not(:first-child) {
          margin-left: -4px;
        }
      }
    }
  }
</style>
