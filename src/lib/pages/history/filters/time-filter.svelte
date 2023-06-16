<script>
  import { Slider } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import FilterItem from '$lib/pages/history/filters/filter-item.svelte';
  import { searchCriteria } from '$lib/services/history';
</script>

<FilterItem
  buttonLabel={$_('history.search.filters.time.buttonLabel')}
  dropdownLabel={$_('history.search.filters.time.dropdownLabel')}
>
  <div class="row">
    <Slider
      bind:values={$searchCriteria.timeRange}
      sliderLabels={['min', 'max']}
      min={0}
      max={24}
      step={1}
      optionLabels={[0, 6, 12, 18, 24]}
    />
  </div>
</FilterItem>
