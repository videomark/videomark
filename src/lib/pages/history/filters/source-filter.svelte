<script>
  import { Button, Checkbox, CheckboxGroup } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import FilterItem from '$lib/pages/history/filters/filter-item.svelte';
  import { searchCriteria, viewingHistorySources } from '$lib/services/history';
  import { toggleListItem } from '$lib/services/utils';
  import { videoPlatforms } from '$lib/services/video-platforms';

  const platformIds = $derived(
    videoPlatforms.filter(({ experimental }) => !experimental).map(({ id }) => id),
  );
</script>

<FilterItem
  buttonLabel={$_('history.search.filters.source.buttonLabel')}
  dropdownLabel={$_('history.search.filters.source.dropdownLabel')}
>
  {#if $viewingHistorySources.length > 1}
    <div class="row">
      <Button
        variant="tertiary"
        size="small"
        disabled={$searchCriteria.sources.length === platformIds.length}
        onclick={() => {
          $searchCriteria.sources = [...platformIds];
        }}
      >
        {$_('_.selectAll')}
      </Button>
      <Button
        variant="tertiary"
        size="small"
        disabled={!$searchCriteria.sources.length}
        onclick={() => {
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
          onChange={({ detail: { checked } }) => {
            $searchCriteria.sources = toggleListItem($searchCriteria.sources, source, checked);
          }}
        >
          {$_(`platforms.${source}`)}
        </Checkbox>
      {/each}
    </CheckboxGroup>
  </div>
</FilterItem>
