<script>
  import { Spacer } from '@sveltia/ui';
  import Wordmark from '$lib/pages/common/wordmark.svelte';
</script>

<div class="wrapper">
  <header>
    <h1><Wordmark /></h1>
    <slot name="header" />
    {#if $$slots['header-extras']}
      <Spacer flex={true} />
      <div class="extras">
        <slot name="header-extras" />
      </div>
    {/if}
  </header>
  <div class="content">
    <slot />
  </div>
</div>

<style lang="scss">
  .wrapper {
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding: 32px;
    height: 100%;
    background-color: var(--sui-primary-background-color);

    &::after {
      position: fixed;
      inset: auto -240px -240px auto;
      z-index: 0;
      width: 1024px;
      height: 1024px;
      background-image: url(/images/logo.svg);
      background-size: cover;
      filter: grayscale(1) opacity(0.1);
      content: '';
    }
  }

  header {
    z-index: 1;
    flex: none;
    display: flex;
    gap: 32px;
    justify-content: flex-start;
    align-items: center;

    h1 {
      margin: 0;

      :global(img) {
        height: 40px;
      }
    }
  }

  .content {
    z-index: 1;
    flex: auto;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 64px;
    margin: 0 auto;
    max-width: 1024px;
    text-align: center;

    :global(h2) {
      margin: 0 0 16px;
      font-size: 32px;
    }

    :global(p) {
      margin: 16px 0 0;
    }
  }
</style>
