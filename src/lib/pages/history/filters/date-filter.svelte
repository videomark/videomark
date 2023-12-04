<script>
  import { Radio, RadioGroup } from '@sveltia/ui';
  import { _ } from 'svelte-i18n';
  import FilterItem from '$lib/pages/history/filters/filter-item.svelte';
  import { searchCriteria } from '$lib/services/history';

  const dateRangeOptions = [
    { value: 'all', selected: true },
    { value: 'today' },
    { value: 'yesterday' },
    { value: 'thisWeek' },
    { value: 'lastWeek' },
    { value: 'thisMonth' },
    { value: 'lastMonth' },
    { value: 'last7d' },
    { value: 'last30d' },
    { value: 'last90d' },
    { value: 'custom' },
  ];

  /**
   * 与えられた `Date` オブジェクトをローカルタイムゾーンの `YYYY-MM-DD` 表記に変換する。
   * `Date.prototype.toJSON()` は UTC 基準なので使ってはいけない。
   * @param {Date} date 日時。
   * @returns {string} `YYYY-MM-DD`.
   */
  const getYMD = (date) =>
    [
      String(date.getFullYear()),
      String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0'),
    ].join('-');

  const updateDateRange = (range) => {
    const d1 = new Date();
    let d2 = new Date();
    let start;
    let end;

    if (range === 'today') {
      start = d1;
      end = d1;
    }

    if (range === 'yesterday') {
      d1.setDate(d1.getDate() - 1);
      start = d1;
      end = d1;
    }

    if (range.match(/^(this|last)Week$/)) {
      d1.setDate(d1.getDate() - d1.getDay() - (RegExp.$1 === 'last' ? 7 : 0));
      d2 = new Date(d1);
      d2.setDate(d2.getDate() + 6);
      start = d1;
      end = d2;
    }

    if (range.match(/^(this|last)Month$/)) {
      d1.setMonth(d1.getMonth() - (RegExp.$1 === 'last' ? 1 : 0), 1); // 1st day of this/last month
      d2 = new Date(d1);
      d2.setMonth(d2.getMonth() + 1, 0); // 1st day of the next month minus 1 day
      start = d1;
      end = d2;
    }

    if (range.match(/^last(\d+)d$/)) {
      d1.setDate(d1.getDate() - Number(RegExp.$1) + 1);
      start = d1;
      end = d2;
    }

    $searchCriteria.dateRange[0] = start ? getYMD(start) : '';
    $searchCriteria.dateRange[1] = end ? getYMD(end) : '';
  };

  let selectedDateRange = 'all';
  let startDateInput;
  let endDateInput;

  $: {
    if (endDateInput && $searchCriteria.dateRange) {
      [endDateInput.min] = $searchCriteria.dateRange;
    }
  }

  $: {
    if (startDateInput && $searchCriteria.dateRange) {
      [, startDateInput.max] = $searchCriteria.dateRange;
    }
  }

  $: updateDateRange(selectedDateRange);
</script>

<FilterItem
  buttonLabel={$_('history.search.filters.date.buttonLabel')}
  dropdownLabel={$_('history.search.filters.date.dropdownLabel')}
>
  <div class="row">
    <RadioGroup
      orientation="vertical"
      on:change={({ detail: { value } }) => {
        selectedDateRange = value;
      }}
    >
      {#each dateRangeOptions as { value } (value)}
        <Radio
          label={$_(`history.search.filters.date.options.${value}`)}
          {value}
          checked={selectedDateRange === value}
        />
      {/each}
    </RadioGroup>
  </div>
  {#if selectedDateRange === 'custom'}
    <div class="row">
      <div class="label">
        {$_('history.search.filters.date.input.from')}
      </div>
      <div class="input">
        <input
          type="date"
          bind:this={startDateInput}
          bind:value={$searchCriteria.dateRange[0]}
          on:click|stopPropagation
        />
      </div>
    </div>
    <div class="row">
      <div class="label">
        {$_('history.search.filters.date.input.to')}
      </div>
      <div class="input">
        <input
          type="date"
          bind:this={endDateInput}
          bind:value={$searchCriteria.dateRange[1]}
          on:click|stopPropagation
        />
      </div>
    </div>
  {/if}
</FilterItem>

<style lang="scss">
  input[type='date'] {
    outline: 0;
    border: 0;
    color: inherit;
    width: auto;
    text-transform: uppercase;
    background-color: transparent;
  }
</style>
