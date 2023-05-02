<script>
  import PopupLayout from '$lib/pages/layouts/popup-layout.svelte';
  import PopupHistory from '$lib/pages/popup/popup-history.svelte';
  import PopupPlatformList from '$lib/pages/popup/popup-platform-list.svelte';
  import { viewingHistory } from '$lib/services/history';
  import { onMount } from 'svelte';

  let currentPage = 'history';

  const checkHash = () => {
    currentPage = window.location.hash === '#/popup/platforms' ? 'platforms' : 'history';
  };

  onMount(() => {
    checkHash();
  });
</script>

<svelte:window on:hashchange={() => checkHash()} />

<PopupLayout>
  {#if $viewingHistory}
    {#if !$viewingHistory.length || currentPage === 'platforms'}
      <PopupPlatformList />
    {:else}
      <PopupHistory />
    {/if}
  {/if}
</PopupLayout>
