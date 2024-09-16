<script>
  import NotFound from '$lib/pages/history/not-found.svelte';
  import { searchCriteria, searchResults } from '$lib/services/history';
  import { settings } from '$lib/services/settings';
  import { derived } from 'svelte/store';
  import HistoryItem from './history-item.svelte';

  const resultGroupSize = 15;
  const observer = new IntersectionObserver();
  let currentResultGroups = 1; // number of "groups" to be rendered

  $: showDuplicates = $settings.show_duplicate_videos;
  $: searchTerms = $searchCriteria.terms.trim();

  // creating a smaller array from $searchResults
  $: subSearchResults = derived(searchResults, ($searchResults) =>
    $searchResults.slice(0, resultGroupSize),
  );
  $: subSearchDebug = console.log($subSearchResults);
</script>

{#if $subSearchResults.length}
  <div class="grid">
    {#each $subSearchResults as historyItem, index (historyItem.key)}
      {@const firstIndex = $subSearchResults.findIndex(({ url }) => url === historyItem.url)}
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
