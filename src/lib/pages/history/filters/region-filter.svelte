<script>
  import { Button, Checkbox, CheckboxGroup } from '@sveltia/ui';
  import { _, locale } from 'svelte-i18n';
  import FilterItem from '$lib/pages/history/filters/filter-item.svelte';
  import { searchCriteria, viewingHistoryRegions } from '$lib/services/history';
  import { toggleListItem } from '$lib/services/utils';
</script>

<FilterItem
  buttonLabel={$_('history.search.filters.region.buttonLabel')}
  dropdownLabel={$_('history.search.filters.region.dropdownLabel')}
>
  {#if $viewingHistoryRegions.length > 1}
    <div class="row">
      <Button
        class="small tertiary"
        disabled={$searchCriteria.regions.length === $viewingHistoryRegions.length}
        on:click={() => {
          $searchCriteria.regions = [...$viewingHistoryRegions];
        }}
      >
        {$_('_.selectAll')}
      </Button>
      <Button
        class="small tertiary"
        disabled={!$searchCriteria.regions.length}
        on:click={() => {
          $searchCriteria.regions = [];
        }}
      >
        {$_('_.unselectAll')}
      </Button>
    </div>
  {/if}
  <div class="row">
    <CheckboxGroup orientation="vertical">
      {#each $viewingHistoryRegions || [] as region}
        <Checkbox
          value={region}
          checked={$searchCriteria.regions.includes(region)}
          on:change={({ detail: { checked } }) => {
            $searchCriteria.regions = toggleListItem($searchCriteria.regions, region, checked);
          }}
        >
          {#if region === 'unknown'}
            {$_('history.search.filters.region.unknown')}
          {:else}
            {@const [country, subdivision] = region.split('-')}
            {new Intl.DisplayNames($locale, { type: 'region' }).of(country)}
            /
            {$_(`subdivisions.${country}.${subdivision}`, { default: subdivision })}
          {/if}
        </Checkbox>
      {/each}
    </CheckboxGroup>
  </div>
</FilterItem>
