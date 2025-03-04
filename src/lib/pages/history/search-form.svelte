<script>
  import { Button, Drawer, Icon, SearchBar, Toolbar } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import DateFilter from '$lib/pages/history/filters/date-filter.svelte';
  import QualityFilter from '$lib/pages/history/filters/quality-filter.svelte';
  import RegionFilter from '$lib/pages/history/filters/region-filter.svelte';
  import SourceFilter from '$lib/pages/history/filters/source-filter.svelte';
  import TimeFilter from '$lib/pages/history/filters/time-filter.svelte';
  import { searchCriteria } from '$lib/services/history';
  import { isSmallScreen } from '$lib/services/runtime';

  let showDrawer = $state(false);
</script>

{#snippet filters()}
  <DateFilter />
  <SourceFilter />
  <RegionFilter />
  <QualityFilter />
  <TimeFilter />
{/snippet}

<div class="search" role="search">
  <div class="terms">
    <SearchBar placeholder={$_('history.search.input')} bind:value={$searchCriteria.terms} />
    {#if $isSmallScreen}
      <Button
        iconic
        aria-label={$_('history.search.filters.show_filters')}
        onclick={() => {
          showDrawer = !showDrawer;
        }}
      >
        <Icon name="tune" />
      </Button>
    {/if}
  </div>
  {#if $isSmallScreen}
    <Drawer
      bind:open={showDrawer}
      size="medium"
      position="bottom"
      title={$_('history.search.filters.filters')}
      keepContent={true}
    >
      {@render filters()}
    </Drawer>
  {:else}
    <Toolbar aria-label={$_('history.search.filters.filters')}>
      {@render filters()}
    </Toolbar>
  {/if}
</div>

<style lang="scss">
  .search {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    width: 560px;

    :global(.sui.toolbar) {
      justify-content: center;
      gap: 4px;
      width: 100%;
      height: auto;
      min-height: var(--toolbar-size);
      white-space: nowrap;

      :global(.sui.button.medium) {
        gap: 0;
        --sui-button-medium-padding: 0 8px;
      }
    }

    @media (max-width: 1023px) {
      order: 1;
      width: 100%;
    }
  }

  .terms {
    display: flex;
    gap: 8px;
    align-items: center;
    width: 100%;

    :global(.search-bar) {
      flex: auto;
      --sui-input-medium-border-radius: 32px;
    }
  }
</style>
