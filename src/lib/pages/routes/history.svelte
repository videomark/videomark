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

  let historyItems = [];
  let showDialog = false;

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

<!-- 以下レイアウトが重複しているが、ひとつにしてネストさせると `slot` が使えないので別々のままにする -->
{#if $viewingHistory}
  {#if $viewingHistory.length}
    <DefaultLayout>
      <SearchForm slot="header" />
      <SettingsButton slot="header-extras" />
      <SearchResults />
    </DefaultLayout>
  {:else}
    <DefaultLayout>
      <SettingsButton slot="header-extras" />
      <OnboardingWrapper>
        <NoHistory />
      </OnboardingWrapper>
    </DefaultLayout>
  {/if}
{/if}

<DetailPanel bind:open={showDialog} {historyItems} />
