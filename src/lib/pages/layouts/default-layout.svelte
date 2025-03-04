<script>
  import { Spacer } from '@sveltia/ui';
  import Wordmark from '$lib/pages/common/wordmark.svelte';

  /**
   * @typedef {Object} Props
   * @property {boolean} [compact] - コンパクトなレイアウトを使用するかどうか。
   * @property {import('svelte').Snippet} [header] - ヘッダーに表示するコンテンツ。
   * @property {import('svelte').Snippet} [headerExtras] - ヘッダーに付加するコンテンツ。
   * @property {import('svelte').Snippet} [children] - メインコンテンツ。
   */

  /** @type {Props} */
  let {
    /* eslint-disable prefer-const */
    compact = false,
    header = undefined,
    headerExtras = undefined,
    children = undefined,
    /* eslint-enable prefer-const */
  } = $props();
</script>

<div class="wrapper" class:compact>
  <header>
    <h1><Wordmark /></h1>
    {@render header?.()}
    {#if headerExtras}
      <Spacer flex={true} />
      <div class="extras">
        {@render headerExtras()}
      </div>
    {/if}
  </header>
  <div class="content">
    {@render children?.()}
  </div>
</div>

<style lang="scss">
  .wrapper {
    flex: auto;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
    background-color: var(--sui-primary-background-color);

    &::after {
      position: fixed;
      inset: auto -240px -240px auto;
      z-index: 0;
      width: 1024px;
      height: 1024px;
      background-image: url(/images/logo.svg);
      background-size: cover;
      filter: grayscale(1) opacity(0.1);
      content: '';
    }

    &.compact h1 {
      @media (max-width: 767px) {
        display: none;
      }
    }
  }

  header {
    z-index: 1;
    flex: none;
    display: flex;
    gap: 16px var(--page-padding);
    justify-content: flex-start;
    align-items: flex-start;
    padding: var(--page-padding);

    @media (max-width: 1023px) {
      flex-wrap: wrap;
    }

    h1 {
      margin: 0;

      :global(img) {
        height: 40px;
      }
    }

    .extras {
      display: flex;
      gap: 8px;
      align-items: center;
      min-height: 40px;
    }
  }

  .content {
    z-index: 1;
    flex: auto;
    overflow-y: auto;
    padding: 0 var(--page-padding) var(--page-padding);
  }
</style>
