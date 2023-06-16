<script>
  import NotFound from '$lib/pages/history/not-found.svelte';
  import { searchCriteria, searchResults } from '$lib/services/history';
  import { settings } from '$lib/services/settings';
  import HistoryItem from './history-item.svelte';

  $: showDuplicates = $settings.show_duplicate_videos;
  $: searchTerms = $searchCriteria.terms.trim();
</script>

{#if $searchResults.length}
  <div class="grid">
    {#each $searchResults as historyItem, index (historyItem.id)}
      {@const firstIndex = $searchResults.findIndex(({ url }) => url === historyItem.url)}
      {#if showDuplicates || firstIndex === index}
        <HistoryItem {historyItem} />
      {/if}
    {/each}
  </div>
{:else}
  <NotFound {searchTerms} />
{/if}

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
</style>
