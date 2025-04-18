<script>
  import { Button, Icon, SearchBar } from '@sveltia/ui';
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import HistoryItem from '$lib/pages/history/history-item.svelte';
  import NotFound from '$lib/pages/history/not-found.svelte';
  import { viewingHistory } from '$lib/services/history';
  import { goto, openTab } from '$lib/services/navigation';

  let searchTerms = $state('');
  let playingVideos = $state([]);

  const history = $derived(
    $viewingHistory
      // Remove duplicates
      .filter((item, index, arr) => arr.findIndex(({ url }) => url === item.url) === index),
  );

  const previousVideos = $derived(
    history.filter(({ key }) => !playingVideos.find((v) => v.key === key)),
  );

  const searchResults = $derived(
    previousVideos
      .filter(({ title }) =>
        searchTerms ? title.toLocaleLowerCase().includes(searchTerms.toLocaleLowerCase()) : true,
      )
      // Use the latest 10 items
      .slice(0, 10),
  );

  onMount(() => {
    (async () => {
      const tabUrls = await new Promise((resolve) => {
        chrome.tabs.query({ currentWindow: true }, (tabs) => {
          resolve(tabs.map(({ url }) => url));
        });
      });

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
      {#each playingVideos as historyItem (historyItem.key)}
        <HistoryItem {historyItem} horizontal={true} playing={true} />
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
        {#each searchResults as historyItem (historyItem.key)}
          <HistoryItem {historyItem} horizontal={true} />
        {/each}
      </div>
    {:else}
      <NotFound {searchTerms} --image-width="160px" />
    {/if}
  </section>
{/if}
<footer>
  <Button class="close-popup" onclick={() => openTab('#/history')}>
    <Icon name="history" />
    {$_('popup.seeAll')}
  </Button>
  <Button onclick={() => goto('#/popup/platforms')}>
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
    padding: 0 16px;

    :global(.search-bar) {
      --sui-input-medium-border-radius: 32px;
    }
  }

  header,
  footer {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    height: 40px;
    background-color: var(--sui-secondary-background-color);
    white-space: nowrap;
  }

  footer {
    margin: auto 0 0;

    :global(button) {
      font-size: var(--sui-font-size-small);
    }
  }

  h2 {
    font-size: var(--sui-font-size-default);
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
