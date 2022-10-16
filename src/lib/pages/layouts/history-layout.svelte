<script>
  import { Spacer } from '@sveltia/ui';
</script>

<div class="wrapper">
  <header>
    <h1><img src="images/logo-invert.png" alt="VideoMark" /></h1>
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
    background-color: var(--primary-background-color);

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
    align-items: flex-start;

    h1 {
      margin: 0;

      img {
        height: 40px;
      }
    }

    .extras {
      display: flex;
      gap: 8px;
      align-items: center;
      min-height: 40px;
    }
  }

  .content {
    z-index: 1;
    flex: auto;
    overflow: auto;
  }
</style>
