<script>
  import NotFound from '$lib/pages/history/not-found.svelte';
  import { searchCriteria, viewingHistory } from '$lib/services/history';
  import { settings } from '$lib/services/settings';
  import HistoryItem from './history-item.svelte';

  $: searchTerms = $searchCriteria.terms.trim();

  $: results = $viewingHistory.filter((historyItem) => {
    const {
      title,
      platformId,
      startTime,
      qoe,
      region: { country = '', subdivision = '' } = {},
    } = historyItem;

    const date = new Date(startTime);

    if (
      !!(searchTerms && !title.toLocaleLowerCase().includes(searchTerms.toLocaleLowerCase())) ||
      !!($searchCriteria.dates[0] && new Date($searchCriteria.dates[0]) > date) ||
      !!($searchCriteria.dates[1] && new Date($searchCriteria.dates[1]) < date) ||
      !$searchCriteria.sources.includes(platformId) ||
      (qoe >= 0 && $searchCriteria.quality[0] > qoe) ||
      (qoe >= 0 && $searchCriteria.quality[1] < qoe) ||
      !!(
        country &&
        subdivision &&
        !$searchCriteria.regions.includes(`${country}-${subdivision}`)
      ) ||
      $searchCriteria.hours[0] > date.getHours() ||
      $searchCriteria.hours[1] < date.getHours()
    ) {
      return false;
    }

    return true;
  });
</script>

{#if results.length}
  <div class="grid">
    {#each results as historyItem, index (historyItem.id)}
      {#if $settings.show_duplicate_videos || results.findIndex(({ url }) => url === historyItem.url) === index}
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
