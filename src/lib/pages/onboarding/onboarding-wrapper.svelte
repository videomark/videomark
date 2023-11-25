<div class="onboarding">
  <slot />
</div>

<style lang="scss">
  .onboarding {
    display: flex;
    justify-content: center;
    gap: 64px;
    margin: 0 auto;
    max-width: 1024px;
    height: 100%;
    text-align: center;

    :global(h2) {
      margin: 0 0 16px;
      font-size: 32px;
    }

    :global(p) {
      margin: 16px 0 0;
    }

    :global(.row) {
      display: flex;
      align-items: center;
      gap: 64px;
      min-height: 400px;

      @media (max-width: 1023px) {
        flex-direction: column;
        gap: 32px;
      }
    }

    :global(.col) {
      @media (max-width: 1023px) {
        width: 100%;
        max-width: 640px;
      }
    }
  }
</style>
