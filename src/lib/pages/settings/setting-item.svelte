<script>
  /**
   * @typedef {Object} Props
   * @property {string} id - 設定項目 ID。
   * @property {string} [title] - タイトル。
   * @property {string} [description] - 説明文。
   * @property {string} [class] - セクションに付加するクラス名。
   * @property {import('svelte').Snippet} [children] - メインコンテンツ。
   */

  /** @type {Props & Record<string, any>} */
  let {
    /* eslint-disable prefer-const */
    id,
    title = '',
    description = '',
    class: className = undefined,
    children = undefined,
    /* eslint-enable prefer-const */
  } = $props();
</script>

<section id={id ? `setting-${id}` : undefined} class={className}>
  <div class="row">
    <div>
      <h3 id={id ? `setting-${id}-title` : undefined}>{title}</h3>
      {#if description}
        <p>{description}</p>
      {/if}
    </div>
    <div id={id ? `setting-${id}-value` : undefined}>
      {@render children?.()}
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
