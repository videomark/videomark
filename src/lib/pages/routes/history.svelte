<script>
  import { tick } from 'svelte';
  import DetailPanel from '$lib/pages/history/detail-panel.svelte';
  import SearchForm from '$lib/pages/history/search-form.svelte';
  import SearchResults from '$lib/pages/history/search-results.svelte';
  import SettingsButton from '$lib/pages/history/settings-button.svelte';
  import HistoryLayout from '$lib/pages/layouts/history-layout.svelte';
  import OnboardingLayout from '$lib/pages/layouts/onboarding-layout.svelte';
  import NoHistory from '$lib/pages/onboarding/no-history.svelte';
  import { viewingHistory } from '$lib/services/history';

  let historyItems = [];
  let showDialog = false;

  /**
   * 現在の URL ハッシュを確認して、動画キーが見つかった場合は統計データ詳細パネルを開く。動画キーをハッシュの一部と
   * して渡しているのは、ポップアップ内の動画リストから詳細パネルを開けるようにするため。
   */
  const checkHash = () => {
    const [, args] = window.location.hash.match(/^#\/history\/(.+)$/) || [];

    if (args) {
      const keys = args.split(',').filter((arg) => arg.match(/^\d+$/));

      if (keys.length) {
        historyItems = $viewingHistory.filter((item) => keys.includes(item.key));
        showDialog = !!historyItems.length;
      }
    }
  };

  $: {
    if ($viewingHistory?.length) {
      (async () => {
        await tick();
        checkHash();
      })();
    }
  }
</script>

<svelte:window on:hashchange={() => checkHash()} />

{#if $viewingHistory}
  {#if $viewingHistory.length}
    <HistoryLayout>
      <SearchForm slot="header" />
      <SettingsButton slot="header-extras" />
      <SearchResults />
    </HistoryLayout>
  {:else}
    <OnboardingLayout>
      <SettingsButton slot="header-extras" />
      <NoHistory />
    </OnboardingLayout>
  {/if}
{/if}

<DetailPanel bind:open={showDialog} {historyItems} />
