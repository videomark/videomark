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

  $: previousVideos = $viewingHistory.filter(({ id }) => !playingVideos.find((v) => v.id === id));
  $: searchResults = previousVideos.filter(({ title }) =>
    searchTerms ? title.toLocaleLowerCase().includes(searchTerms.toLocaleLowerCase()) : true,
  );

  onMount(() => {
    (async () => {
      const tabUrls = (await chrome.tabs.query({ currentWindow: true })).map(({ url }) => url);

      playingVideos = $viewingHistory.filter((item) => tabUrls.includes(item.url));
    })();
  });
</script>

<div class="history">
  {#if playingVideos.length}
    <section>
      <header>
        <h2>{$_('popup.playing')}</h2>
      </header>
      <div class="items">
        {#each playingVideos as historyItem, index (historyItem.id)}
          {#if playingVideos.findIndex(({ url }) => url === historyItem.url) === index}
            <HistoryItem {historyItem} horizontal={true} />
          {/if}
        {/each}
      </div>
    </section>
  {/if}
  {#if previousVideos.length}
    <section>
      <header>
        <h2>{$_('popup.recent')}</h2>
        <SearchBar placeholder={$_('history.search.input')} bind:value={searchTerms} />
      </header>
      {#if searchResults.length}
        <div class="items">
          {#each searchResults as historyItem, index (historyItem.id)}
            {#if searchResults.findIndex(({ url }) => url === historyItem.url) === index}
              <HistoryItem {historyItem} horizontal={true} />
            {/if}
          {/each}
        </div>
      {:else}
        <NotFound {searchTerms} --image-width="160px" />
      {/if}
    </section>
  {/if}
  <footer>
    <Button
      on:click={async () => {
        await openTab('#/history');
        // ポップアップを閉じる
        window.close();
      }}
    >
      <Icon name="history" />
      {$_('popup.seeAll')}
    </Button>
    <Button on:click={() => window.location.replace('#/popup/platforms')}>
      <Icon name="subscriptions" />
      {$_('popup.compatiblePlatforms.title')}
    </Button>
  </footer>
</div>

<style lang="scss">
  .history {
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
    :global(button) {
      font-size: var(--font-size--small);
    }
  }

  h2 {
    font-size: var(--font-size--default);
    font-weight: normal;
  }

  .items {
    overflow: hidden;

    & > :global(div) {
      margin: 8px;
    }
  }
</style>
