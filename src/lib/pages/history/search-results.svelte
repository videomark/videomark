<script>
  import { derived } from 'svelte/store';
  import NotFound from '$lib/pages/history/not-found.svelte';
  import { searchCriteria, searchResults } from '$lib/services/history';
  import scroll from '$lib/services/infinite-scroll';
  import { settings } from '$lib/services/settings';
  import HistoryItem from './history-item.svelte';

  const resultGroupSize = 50; // constant number of results in each rendered group
  let currentResultGroups = 1; // number of groups to be rendered

  $: showDuplicates = $settings.show_duplicate_videos;
  $: searchTerms = $searchCriteria.terms.trim();

  // creating a smaller derived array from $searchResults
  $: subSearchResults = derived(searchResults, ($searchResults) =>
    $searchResults.slice(0, resultGroupSize * currentResultGroups),
  );

  const renderScroll = () => {
    if (resultGroupSize * currentResultGroups < $searchResults.length) {
      currentResultGroups += 1;
    }
  };
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
  {#if $subSearchResults.length < $searchResults.length}
    <div class="loading" use:scroll on:infiniteScroll={renderScroll}></div>
  {/if}
{:else}
  <NotFound {searchTerms} />
{/if}

<style lang="scss">
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .loading {
    margin: auto;
    margin-top: 16px;
    border: 4px dotted var(--sui-secondary-foreground-color);
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 4s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(1turn);
    }
  }
</style>
