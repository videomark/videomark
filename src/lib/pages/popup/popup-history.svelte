<script>
  import { Button, Icon, SearchBar } from '@sveltia/ui';
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import HistoryItem from '$lib/pages/history/history-item.svelte';
  import NotFound from '$lib/pages/history/not-found.svelte';
  import { viewingHistory } from '$lib/services/history';
  import { openTab } from '$lib/services/navigation';

  let searchTerms = '';
  let playingVideos = [];

  $: history = $viewingHistory
    // Remove duplicates
    .filter((item, index, arr) => arr.findIndex(({ url }) => url === item.url) === index);
  $: previousVideos = history.filter(({ id }) => !playingVideos.find((v) => v.id === id));
  $: searchResults = previousVideos
    .filter(({ title }) =>
      searchTerms ? title.toLocaleLowerCase().includes(searchTerms.toLocaleLowerCase()) : true,
    )
    // Use the latest 10 items
    .slice(0, 10);

  onMount(() => {
    (async () => {
      const tabUrls = (await chrome.tabs.query({ currentWindow: true })).map(({ url }) => url);

      playingVideos = history.filter((item) => tabUrls.includes(item.url));
    })();
  });
</script>

{#if playingVideos.length}
  <section class="playing">
    <header>
      <h2>{$_('popup.playing')}</h2>
    </header>
    <div class="items">
      {#each playingVideos as historyItem (historyItem.id)}
        <HistoryItem {historyItem} horizontal={true} />
      {/each}
    </div>
  </section>
{/if}
{#if previousVideos.length}
  <section class="recent">
    <header>
      <h2>{$_('popup.recent')}</h2>
      <SearchBar placeholder={$_('history.search.input')} bind:value={searchTerms} />
    </header>
    {#if searchResults.length}
      <div class="items">
        {#each searchResults as historyItem (historyItem.id)}
          <HistoryItem {historyItem} horizontal={true} />
        {/each}
      </div>
    {:else}
      <NotFound {searchTerms} --image-width="160px" />
    {/if}
  </section>
{/if}
<footer>
  <Button class="close-popup" on:click={() => openTab('#/history')}>
    <Icon name="history" />
    {$_('popup.seeAll')}
  </Button>
  <Button on:click={() => window.location.replace('#/popup/platforms')}>
    <Icon name="subscriptions" />
    {$_('popup.compatiblePlatforms.title')}
  </Button>
</footer>

<style lang="scss">
  section {
    flex: auto;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &.playing:not(:only-of-type) {
      flex: none;
      max-height: 192px;
    }

    :global(.not-found) {
      padding: 32px;
    }
  }

  header {
    :global(.search-bar) {
      --input--medium--border-radius: 32px;
    }
  }

  header,
  footer {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    padding: 0 16px;
    height: 40px;
    background-color: var(--secondary-background-color);
    white-space: nowrap;
  }

  footer {
    margin: auto 0 0;

    :global(button) {
      font-size: var(--font-size--small);
    }
  }

  h2 {
    font-size: var(--font-size--default);
    font-weight: normal;
  }

  .items {
    flex: auto;
    overflow: auto;

    & > :global(div) {
      margin: 8px;
    }
  }
</style>
