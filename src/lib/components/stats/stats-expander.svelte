<svelte:options customElement="vm-stats" />

<script>
  import StatsBody from '$lib/components/stats/stats-body.svelte';
  import StatsSummary from '$lib/components/stats/stats-summary.svelte';
  import { initAppLocales } from '$lib/services/i18n';

  /**
   * UI ロケール。
   * @type {string}
   */
  export let locale = '';

  /**
   * 最新の統計情報。
   * @type {{ [key: string]: number | { [key: string]: number } }}
   */
  export let stats = {};

  /**
   * これまでの統計情報。
   * @type {{ [key: string]: number[] }}
   */
  export let log = {};

  /**
   * 詳細情報が表示されているかどうか。
   * @type {boolean}
   */
  let open = false;

  $: initAppLocales(locale);
</script>

<!--
  ホストされているページ内で CSS を読み込むことで、ウェブコンポーネント内でフォントが読み込まれない問題を回避。
  @see https://github.com/google/material-design-icons/issues/1165
-->
<svelte:head>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Merriweather+Sans:ital,wght@0,300;0,600;1,300&family=Noto+Sans+Mono&display=swap"
  />
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
  />
</svelte:head>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
  role="button"
  tabindex="0"
  class="root"
  on:click|stopPropagation={() => {
    open = !open;
  }}
>
  <details {open}>
    <StatsSummary {stats} />
    {#if open}
      <StatsBody {stats} {log} />
    {/if}
  </details>
</div>

<style lang="scss">
  @use 'node_modules/@sveltia/ui/package/styles/core.scss';

  :host {
    all: initial;
  }

  .root {
    color: rgba(255, 255, 255, 0.8);
    background-color: rgba(28, 28, 28, 0.8);
    font-family: var(--sui-font-family-default);
    font-size: var(--sui-font-size-default);
    line-height: 1.75;
    font-weight: var(--sui-font-weight-normal);
    -webkit-user-select: none;
    user-select: none;
    cursor: default;
    border-radius: 8px;
    padding: 8px 16px;
  }

  :focus {
    outline: 0;
  }

  details {
    pointer-events: none;
  }
</style>
