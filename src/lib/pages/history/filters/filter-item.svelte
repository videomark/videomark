<script>
  import { Button, Icon } from '@sveltia/ui';
  import { isSmallScreen } from '$lib/services/runtime';

  /**
   * @typedef {Object} Props
   * @property {string} [buttonLabel] - ボタン上に表示するラベル。
   * @property {string} [dropdownLabel] - ドロップダウンリスト内に表示するラベル。
   * @property {import('svelte').Snippet} [children] - ドロップダウンリスト内に表示するコンテンツ。
   */

  /** @type {Props} */
  let {
    /* eslint-disable prefer-const */
    buttonLabel = '',
    dropdownLabel = '',
    children = undefined,
    /* eslint-enable prefer-const */
  } = $props();
</script>

{#if $isSmallScreen}
  <!-- Shown in a Drawer -->
  <section>
    <header>
      <h4>{dropdownLabel}</h4>
    </header>
    {@render children?.()}
  </section>
{:else}
  <!-- Shown in a Toolbar -->
  <Button variant="ghost" label={buttonLabel} aria-haspopup="dialog">
    {#snippet endIcon()}
      <Icon name="arrow_drop_down" />
    {/snippet}
    {#snippet popup()}
      <section>
        <header>
          <h4>{dropdownLabel}</h4>
        </header>
        {@render children?.()}
      </section>
    {/snippet}
  </Button>
{/if}

<style lang="scss">
  section {
    padding: 16px;

    header {
      margin: 0 0 12px;

      h4 {
        font-size: var(--sui-font-size-default);
      }
    }

    :global(.row) {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 0 0;

      & > :global(.label) {
        flex: none;
        width: 64px;
      }
    }

    &:not(:first-of-type) {
      margin-top: 16px;
    }
  }
</style>
