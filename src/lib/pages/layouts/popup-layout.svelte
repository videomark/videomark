<script>
  import { Button, Icon } from '@sveltia/ui';
  import { onMount } from 'svelte';
  import { _ } from 'svelte-i18n';
  import { openTab } from '$lib/services/navigation';
  import Wordmark from '$lib/pages/common/wordmark.svelte';

  // Adjust the popup size
  onMount(() => {
    Object.assign(document.body.style, {
      margin: 0,
      width: '400px',
      height: '600px', // = max height in Chrome
    });

    Object.assign(document.querySelector('.app-shell').style, {
      position: 'relative',
      overflow: 'hidden',
      height: '100vh',
    });
  });
</script>

<div
  class="wrapper"
  role="none"
  on:click|capture={(event) => {
    if (event.target.matches('.close-popup')) {
      // Close the popup (after waiting for a new tab being opened)
      window.setTimeout(() => {
        window.close();
      }, 100);
    }
  }}
>
  <header>
    <h1><Wordmark /></h1>
    <Button variant="ghost" iconic class="close-popup" on:click={() => openTab('#/settings')}>
      <Icon slot="start-icon" name="settings" label={$_('settings.title')} />
    </Button>
  </header>
  <slot />
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 100%;
  }

  header {
    flex: none;
    display: flex;
    gap: 32px;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
  }

  h1 {
    margin: 0;

    :global(img) {
      height: 32px;
    }
  }
</style>
