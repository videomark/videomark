<script>
  import { Button } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';

  export let searchTerms = '';
</script>

<div class="not-found">
  <div><img src="/images/search/not-found.svg" alt="" /></div>
  <div>{$_('history.search.notFound.title')}</div>
  {#if searchTerms}
    <div>
      <Button
        class="primary pill"
        on:click={() => {
          window.location.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(
            searchTerms,
          )}`;
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
