<script>
  /** @type {string} */
  export let id;
  export let title = '';
  export let description = '';
</script>

<section id={id ? `setting-${id}` : undefined} {...$$restProps}>
  <div class="row">
    <div>
      <h3 id={id ? `setting-${id}-title` : undefined}>{title}</h3>
      {#if description}
        <p>{description}</p>
      {/if}
    </div>
    <div id={id ? `setting-${id}-value` : undefined}>
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
    gap: 16px;
    min-height: 32px;

    @media (max-width: 599px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      margin: 16px;
    }

    @media (min-width: 600px) and (max-width: 767px) {
      margin: 12px 16px;
    }

    @media (min-width: 768px) {
      margin: 12px 24px;
    }

    h3 {
      font-weight: normal;
      font-size: inherit;
      line-height: 1.5;

      & + p {
        margin: 4px 0 0;
        font-size: smaller;
        white-space: nowrap;
        color: var(--sui-secondary-foreground-color);
      }
    }

    & > :first-child {
      flex: auto;
    }
  }
</style>
