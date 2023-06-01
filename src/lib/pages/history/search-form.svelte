<script>
  import { Button, Checkbox, Icon, SearchBar, Slider, Toolbar } from '@sveltia/ui';
  import { _, locale } from 'svelte-i18n';
  import { searchCriteria, viewingHistoryRegions } from '$lib/services/history';
  import { videoPlatforms } from '$lib/services/video-platforms';

  let startDateInput;
  let endDateInput;

  $: {
    if (endDateInput && $searchCriteria.dates) {
      [endDateInput.min] = $searchCriteria.dates;
    }
  }

  $: {
    if (startDateInput && $searchCriteria.dates) {
      [, startDateInput.max] = $searchCriteria.dates;
    }
  }
</script>

<div class="search" role="search">
  <div class="terms">
    <SearchBar placeholder={$_('history.search.input')} bind:value={$searchCriteria.terms} />
  </div>
  <Toolbar>
    <Button class="ghost" label={$_('history.search.filters.dates')} aria-haspopup="dialog">
      <Icon slot="end-icon" name="arrow_drop_down" />
      <div slot="popup" class="popup">
        <div class="row">
          <div class="label">
            {$_('history.search.filters.dateOptions.from')}
          </div>
          <div class="input">
            <input
              type="date"
              bind:this={startDateInput}
              bind:value={$searchCriteria.dates[0]}
              on:click|stopPropagation
            />
          </div>
        </div>
        <div class="row">
          <div class="label">
            {$_('history.search.filters.dateOptions.to')}
          </div>
          <div class="input">
            <input
              type="date"
              bind:this={endDateInput}
              bind:value={$searchCriteria.dates[1]}
              on:click|stopPropagation
            />
          </div>
        </div>
      </div>
    </Button>
    <Button class="ghost" label={$_('history.search.filters.sources')} aria-haspopup="dialog">
      <Icon slot="end-icon" name="arrow_drop_down" />
      <div slot="popup" class="popup">
        {#each videoPlatforms.filter(({ experimental, deprecated }) => !(experimental || deprecated)) as { id } (id)}
          <div class="row">
            <Checkbox
              value={id}
              checked={$searchCriteria.sources.includes(id)}
              on:change={({ detail: { checked } }) => {
                const _sources = new Set($searchCriteria.sources);

                if (checked) {
                  _sources.add(id);
                } else {
                  _sources.delete(id);
                }

                $searchCriteria.sources = [..._sources];
              }}
            >
              {$_(`platforms.${id}`)}
            </Checkbox>
          </div>
        {/each}
      </div>
    </Button>
    <Button class="ghost" label={$_('history.search.filters.quality')} aria-haspopup="dialog">
      <Icon slot="end-icon" name="arrow_drop_down" />
      <div slot="popup" class="popup">
        <Slider
          bind:values={$searchCriteria.quality}
          sliderLabels={['min', 'max']}
          min={1}
          max={5}
          step={0.5}
          optionLabels={[1, 2, 3, 4, 5]}
        />
      </div>
    </Button>
    <Button class="ghost" label={$_('history.search.filters.regions')} aria-haspopup="dialog">
      <Icon slot="end-icon" name="arrow_drop_down" />
      <div slot="popup" class="popup">
        {#each $viewingHistoryRegions || [] as region}
          {@const [country, subdivision] = region.split('-')}
          <div class="row">
            <Checkbox
              value={region}
              checked={$searchCriteria.regions.includes(region)}
              on:change={({ detail: { checked } }) => {
                const _regions = new Set($searchCriteria.regions);

                if (checked) {
                  _regions.add(region);
                } else {
                  _regions.delete(region);
                }

                $searchCriteria.regions = [..._regions];
              }}
            >
              {new Intl.DisplayNames($locale, { type: 'region' }).of(country)}
              /
              {$_(`subdivisions.${country}.${subdivision}`, { default: subdivision })}
            </Checkbox>
          </div>
        {/each}
      </div>
    </Button>
    <Button class="ghost" label={$_('history.search.filters.hours')} aria-haspopup="dialog">
      <Icon slot="end-icon" name="arrow_drop_down" />
      <div slot="popup" class="popup">
        <Slider
          bind:values={$searchCriteria.hours}
          sliderLabels={['min', 'max']}
          min={0}
          max={24}
          step={3}
          optionLabels={[0, 6, 12, 18, 24]}
        />
      </div>
    </Button>
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

  .popup {
    padding: 8px;
  }

  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 4px;

    .label {
      flex: none;
      width: 64px;
    }
  }

  input[type='date'] {
    outline: 0;
    border: 0;
    color: inherit;
    width: auto;
    text-transform: uppercase;
    background-color: transparent;
  }

  :global(:root[data-theme='dark']) {
    input[type='date']::-webkit-calendar-picker-indicator {
      filter: invert(1);
    }
  }
</style>
