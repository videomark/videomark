<script>
  import { SearchBar, Toolbar } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import DateFilter from '$lib/pages/history/filters/date-filter.svelte';
  import QualityFilter from '$lib/pages/history/filters/quality-filter.svelte';
  import RegionFilter from '$lib/pages/history/filters/region-filter.svelte';
  import SourceFilter from '$lib/pages/history/filters/source-filter.svelte';
  import TimeFilter from '$lib/pages/history/filters/time-filter.svelte';
  import { searchCriteria } from '$lib/services/history';
</script>

<div class="search" role="search">
  <div class="terms">
    <SearchBar placeholder={$_('history.search.input')} bind:value={$searchCriteria.terms} />
  </div>
  <Toolbar>
    <DateFilter />
    <SourceFilter />
    <RegionFilter />
    <QualityFilter />
    <TimeFilter />
  </Toolbar>
</div>

<style lang="scss">
  .search {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    width: 560px;

    :global(.sui.toolbar) {
      flex-wrap: wrap;
      justify-content: center;
      gap: 4px;
      width: 100%;
      height: auto;
      min-height: var(--toolbar-size);
      white-space: nowrap;

      :global(.sui.button.medium) {
        gap: 0;
        --button--medium--padding: 0 8px;
      }
    }

    @media (max-width: 1023px) {
      order: 1;
      width: 100%;
    }
  }

  .terms {
    width: 100%;

    :global(.search-bar) {
      width: 100%;
      --input--medium--border-radius: 32px;
    }
  }
</style>
