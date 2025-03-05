<script>
  import { Button } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import { openTab } from '$lib/services/navigation';

  /**
   * @typedef {Object} Props
   * @property {string} [searchTerms] - 検索キーワード。
   */

  /** @type {Props} */
  let {
    /* eslint-disable prefer-const */
    searchTerms = '',
    /* eslint-enable prefer-const */
  } = $props();
</script>

<div class="not-found">
  <div><img src="/images/search/not-found.svg" alt="" /></div>
  <div>{$_('history.search.notFound.title')}</div>
  {#if searchTerms}
    <div>
      <Button
        variant="primary"
        pill
        class="close-popup"
        onclick={() => {
          openTab(
            `https://www.youtube.com/results?search_query=${encodeURIComponent(searchTerms)}`,
          );
        }}
      >
        {$_('history.search.notFound.search')}
      </Button>
    </div>
  {/if}
</div>

<style lang="scss">
  .not-found {
    height: 100%;
    width: 100%;
    display: flex;
    gap: 16px;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    img {
      width: var(--image-width, 400px);
      max-width: 100%;
    }
  }
</style>
