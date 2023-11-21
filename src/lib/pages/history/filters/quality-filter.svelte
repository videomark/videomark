<script>
  import { Button, Checkbox, CheckboxGroup, Icon, NumberInput, Slider } from '@sveltia/ui';
  import { _, locale } from 'svelte-i18n';
  import FilterItem from '$lib/pages/history/filters/filter-item.svelte';
  import { searchCriteria, validQualityStatuses } from '$lib/services/history';
  import { openTab } from '$lib/services/navigation';
  import { toggleListItem } from '$lib/services/utils';

  const { SODIUM_MARKETING_SITE_URL } = import.meta.env;

  let minInputValue = '';
  let maxInputValue = '';

  const onSliderUpdate = () => {
    const minValue = $searchCriteria.qualityRange[0].toFixed(2);
    const maxValue = $searchCriteria.qualityRange[1].toFixed(2);

    if (minInputValue !== minValue) {
      minInputValue = minValue;
    }

    if (maxInputValue !== maxValue) {
      maxInputValue = maxValue;
    }
  };

  const onInputValueUpdate = (index, value) => {
    const _value = Number(value);

    if (!Number.isNaN(_value) && $searchCriteria.qualityRange[index] !== _value) {
      $searchCriteria.qualityRange[index] = _value;
    }
  };

  $: onSliderUpdate($searchCriteria.qualityRange);
  $: onInputValueUpdate(0, minInputValue);
  $: onInputValueUpdate(1, maxInputValue);
</script>

<FilterItem
  buttonLabel={$_('history.search.filters.quality.buttonLabel')}
  dropdownLabel={$_('history.search.filters.quality.dropdownLabel')}
>
  <div class="row">
    <Slider
      bind:values={$searchCriteria.qualityRange}
      sliderLabels={['min', 'max']}
      min={1}
      max={5}
      step={0.05}
      optionLabels={[1, 2, 3, 4, 5]}
    />
  </div>
  <div class="row">
    <div class="label">
      {$_('history.search.filters.quality.input.min')}
    </div>
    <div class="input">
      <NumberInput bind:value={minInputValue} min={1} max={Number(maxInputValue)} step={0.05} />
    </div>
  </div>
  <div class="row">
    <div class="label">
      {$_('history.search.filters.quality.input.max')}
    </div>
    <div class="input">
      <NumberInput bind:value={maxInputValue} min={Number(minInputValue)} max={5} step={0.05} />
    </div>
  </div>
  <div class="row">
    <CheckboxGroup orientation="vertical">
      {#each validQualityStatuses as status}
        <Checkbox
          value={status}
          checked={$searchCriteria.qualityStatuses.includes(status)}
          on:change={({ detail: { checked } }) => {
            $searchCriteria.qualityStatuses = toggleListItem(
              $searchCriteria.qualityStatuses,
              status,
              checked,
            );
          }}
        >
          {$_(`history.search.filters.quality.status.${status}`)}
        </Checkbox>
      {/each}
    </CheckboxGroup>
  </div>
  <div class="row">
    <Button
      variant="link"
      on:click={() =>
        openTab(`${SODIUM_MARKETING_SITE_URL}/${$locale}/faq#cda4d70fc74f8371aaf1b5a52144fe6d`)}
    >
      <Icon name="help" />
      {$_('stats.whatIsQOE')}
    </Button>
  </div>
</FilterItem>

<style lang="scss">
  .input {
    --sui-textbox-singleline-min-width: 80px;
  }
</style>
