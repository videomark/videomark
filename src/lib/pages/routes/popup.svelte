<!--
  @component
  ポップアップに表示されるページ。モバイルでは、このページはポップアップではなく拡張機能専用ページで開かれる。ポップ
  アップの内容を表示するのは冗長なので、直接履歴ページを開く。
-->
<script>
  import PopupContent from '$lib/pages/popup/popup-content.svelte';
  import HistoryPage from '$lib/pages/routes/history.svelte';
  import { isPopupOpen } from '$lib/services/runtime';
</script>

{#await isPopupOpen() then isOpen}
  {#if isOpen}
    <PopupContent />
  {:else}
    <HistoryPage />
  {/if}
{/await}
