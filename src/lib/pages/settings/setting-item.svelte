<script>
  export let title = '';
  export let description = '';
</script>

<section>
  <div class="row">
    <div>
      <h3>{title}</h3>
      {#if description}
        <p>{description}</p>
      {/if}
    </div>
    <div>
      <slot />
    </div>
  </div>
</section>

<style lang="scss">
  section {
    display: flow-root;
    margin: 4px 0;
    border-radius: 4px;
    background-color: var(--sui-secondary-background-color-translucent);
  }

  .row {
    display: flex;
    align-items: center;
    margin: 12px 24px;
    min-height: 32px;
    white-space: nowrap;

    h3 {
      font-weight: normal;
      font-size: inherit;

      & + p {
        margin: 4px 0 0;
        font-size: smaller;
        color: var(--sui-secondary-foreground-color);
      }
    }

    & > :first-child {
      flex: auto;
    }
  }
</style>
