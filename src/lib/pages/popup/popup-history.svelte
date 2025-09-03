<script>
  import { Button, Icon, SearchBar } from '@sveltia/ui';
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import HistoryItemComponent from '$lib/pages/history/history-item.svelte';
  import NotFound from '$lib/pages/history/not-found.svelte';
  import { viewingHistory } from '$lib/services/history';
  import { goto, openTab } from '$lib/services/navigation';

  let searchTerms = $state('');

  /**
   * @type {Record<string, { tabId: number, playbackInfo: VideoPlaybackInfo, timer: number }>}
   */
  const playingVideoMap = $state({});

  /**
   * @type {{ historyItem: HistoryItem, tabId: number, playbackInfo: VideoPlaybackInfo }[]}
   */
  const playingVideos = $derived(
    Object.entries(playingVideoMap)
      .map(([url, { tabId, playbackInfo }]) => {
        const historyItem = $viewingHistory.find((item) => item.url === url);

        if (historyItem) {
          return { historyItem, tabId, playbackInfo: $state.snapshot(playbackInfo) };
        }

        return null;
      })
      .filter(Boolean),
  );

  const history = $derived(
    $viewingHistory
      // Remove duplicates
      .filter((item, index, arr) => arr.findIndex(({ url }) => url === item.url) === index),
  );

  const previousVideos = $derived(
    history.filter(({ key }) => !playingVideos.find(({ historyItem }) => historyItem.key === key)),
  );

  const searchResults = $derived(
    previousVideos
      .filter(({ title }) =>
        searchTerms ? title.toLocaleLowerCase().includes(searchTerms.toLocaleLowerCase()) : true,
      )
      // Use the latest 10 items
      .slice(0, 10),
  );

  /**
   * コンテンツスクリプトから受信したメッセージを処理する。`updatePlaybackInfo` メッセージは動画の再生中に各タブ
   * から毎秒送信される。{@link playingVideoMap} を使用して再生中の動画情報を保持し、ポップアップ内で現在再生中の
   * 動画を表示する。タイマーを使って動画が再生されなくなった場合にリストから削除する。
   * @param {{ method: string, args: any[] }} request - メソッドと引数を含むリクエストオブジェクト。
   * @param {{ tab: { id: number } }} sender - タブ情報を含む送信者オブジェクト。
   */
  const handleMessage = ({ method, args }, { tab }) => {
    if (method !== 'updatePlaybackInfo') {
      return;
    }

    /** @type {VideoPlaybackInfo | undefined} */
    const playbackInfo = args[0];

    if (!playbackInfo) {
      return;
    }

    const videoURL = playbackInfo.video.url;
    const { timer } = playingVideoMap[videoURL] ?? {};

    if (timer) {
      window.clearTimeout(timer);
    }

    playingVideoMap[videoURL] = {
      tabId: tab.id,
      playbackInfo,
      timer: window.setTimeout(() => {
        delete playingVideoMap[videoURL];
      }, 3000),
    };
  };

  onMount(() => {
    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  });
</script>

<div class="body">
  {#if playingVideos.length}
    <section class="playing">
      <header>
        <h2>{$_('popup.playing')}</h2>
      </header>
      <div class="items">
        {#each playingVideos as { historyItem, tabId, playbackInfo } (historyItem.key)}
          <HistoryItemComponent
            {historyItem}
            {tabId}
            {playbackInfo}
            horizontal={true}
            playing={true}
          />
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
            <HistoryItemComponent {historyItem} horizontal={true} />
          {/each}
        </div>
      {:else}
        <NotFound {searchTerms} --image-width="160px" />
      {/if}
    </section>
  {/if}
</div>

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
  .body {
    position: relative;
    overflow: auto;
  }

  section {
    flex: auto;
    background-color: var(--sui-primary-background-color);

    &.playing:not(:only-of-type) {
      flex: none;
    }

    :global(.not-found) {
      padding: 32px;
      aspect-ratio: 1 / 1;
    }
  }

  header {
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 0 16px;

    :global(.search-bar) {
      --sui-textbox-singleline-min-width: 200px;
      --sui-input-medium-border-radius: 32px;
    }
  }

  header,
  footer {
    flex: none;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
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
