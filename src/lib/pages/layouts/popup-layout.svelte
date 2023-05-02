<script>
  import Wordmark from '$lib/pages/common/wordmark.svelte';
  import { onMount } from 'svelte';

  // ポップアップのサイズを調整
  onMount(() => {
    Object.assign(document.body.style, {
      margin: 0,
      width: '400px',
      'min-height': '40px',
      'max-height': '800px',
    });

    Object.assign(document.querySelector('.app-shell').style, {
      position: 'relative',
      overflow: 'auto',
    });
  });
</script>

<div class="wrapper">
  <header>
    <h1><Wordmark /></h1>
  </header>
  <slot />
</div>

<style lang="scss">
  header {
    display: flex;
    gap: 32px;
    justify-content: flex-start;
    align-items: center;
    padding: 16px;
  }

  h1 {
    margin: 0;

    :global(img) {
      height: 32px;
    }
  }
</style>
