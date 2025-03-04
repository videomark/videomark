<script>
  import { Icon } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';

  /**
   * @typedef {Object} Props
   * @property {{ [key: string]: number | { [key: string]: number } }} [stats] - 最新の統計情報。
   */

  /** @type {Props} */
  let {
    /* eslint-disable prefer-const */
    stats = {},
    /* eslint-enable prefer-const */
  } = $props();

  const qoe = $derived(stats.qoe);
</script>

<summary
  onclick={(event) => {
    event.preventDefault();
  }}
>
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
