<script>
  import { tick } from 'svelte';
  import DetailPanel from '$lib/pages/history/detail-panel.svelte';
  import SearchForm from '$lib/pages/history/search-form.svelte';
  import SearchResults from '$lib/pages/history/search-results.svelte';
  import SettingsButton from '$lib/pages/history/settings-button.svelte';
  import DefaultLayout from '$lib/pages/layouts/default-layout.svelte';
  import NoHistory from '$lib/pages/onboarding/no-history.svelte';
  import OnboardingWrapper from '$lib/pages/onboarding/onboarding-wrapper.svelte';
  import { viewingHistory } from '$lib/services/history';

  /** @type {HistoryItem[]} */
  let historyItems = $state([]);
  let showDialog = $state(false);

  /**
   * 現在の URL ハッシュを確認して、動画キーが見つかった場合は統計データ詳細パネルを開く。動画キーをハッシュの一部と
   * して渡しているのは、ポップアップ内の動画リストから詳細パネルを開けるようにするため。
   */
  const checkHash = () => {
    const [, args] = window.location.hash.match(/^#\/history\/(.+)$/) || [];

    if (args) {
      const keys = args
        .split(',')
        .filter((arg) => arg.match(/^\d+$/))
        .map((key) => Number(key));

      if (keys.length) {
        historyItems = $viewingHistory.filter((item) => keys.includes(item.key));
        showDialog = !!historyItems.length;
      }
    }
  };

  $effect(() => {
    if ($viewingHistory?.length) {
      (async () => {
        await tick();
        checkHash();
      })();
    }
  });
</script>

<svelte:window onhashchange={() => checkHash()} />

{#if $viewingHistory}
  <DefaultLayout>
    {#snippet header()}
      {#if $viewingHistory.length}
        <SearchForm />
      {/if}
    {/snippet}
    {#snippet headerExtras()}
      <SettingsButton />
    {/snippet}
    {#if $viewingHistory.length}
      <SearchResults />
    {:else}
      <OnboardingWrapper>
        <NoHistory />
      </OnboardingWrapper>
    {/if}
  </DefaultLayout>
{/if}

<DetailPanel bind:open={showDialog} {historyItems} />
