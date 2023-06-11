<script>
  import { Button, Checkbox, CheckboxGroup } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import FilterItem from '$lib/pages/history/filters/filter-item.svelte';
  import { searchCriteria, viewingHistorySources } from '$lib/services/history';
  import { toggleListItem } from '$lib/services/utils';
  import { videoPlatforms } from '$lib/services/video-platforms';

  $: platformIds = videoPlatforms.filter(({ experimental }) => !experimental).map(({ id }) => id);
</script>

<FilterItem
  buttonLabel={$_('history.search.filters.source.buttonLabel')}
  dropdownLabel={$_('history.search.filters.source.dropdownLabel')}
>
  {#if $viewingHistorySources.length > 1}
    <div class="row">
      <Button
        class="small tertiary"
        disabled={$searchCriteria.sources.length === platformIds.length}
        on:click={() => {
          $searchCriteria.sources = [...platformIds];
        }}
      >
        {$_('_.selectAll')}
      </Button>
      <Button
        class="small tertiary"
        disabled={!$searchCriteria.sources.length}
        on:click={() => {
          $searchCriteria.sources = [];
        }}
      >
        {$_('_.unselectAll')}
      </Button>
    </div>
  {/if}
  <div class="row">
    <CheckboxGroup orientation="vertical">
      {#each platformIds as source}
        <Checkbox
          value={source}
          disabled={!$viewingHistorySources.includes(source)}
          checked={$searchCriteria.sources.includes(source)}
          on:change={({ detail: { checked } }) => {
            $searchCriteria.sources = toggleListItem($searchCriteria.sources, source, checked);
          }}
        >
          {$_(`platforms.${source}`)}
        </Checkbox>
      {/each}
    </CheckboxGroup>
  </div>
</FilterItem>
