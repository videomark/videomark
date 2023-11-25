<script>
  import { _, json, locale } from 'svelte-i18n';
  import PlatformList from '$lib/pages/common/platform-list.svelte';
  import { browserName, isMobile } from '$lib/services/runtime';
</script>

<div class="row">
  <div class="col">
    <section>
      <h2>{$_('history.empty')}</h2>
      <PlatformList />
    </section>
  </div>
  <div class="col">
    {#if !$isMobile}
      <section class="toolbar-instruction {$browserName}">
        <h2>{$_('onboarding.addToToolbar.title')}</h2>
        <div>
          <img src="/images/onboarding/toolbar-{$browserName}.{$locale}.png" alt="" />
        </div>
        <ol>
          {#each $json(`onboarding.addToToolbar.${$browserName}`) as step}
            <li>
              {@html step.replace(
                /<icon (.+?)>(.+?)<\/icon>/,
                '<span class="sui icon material-symbols-outlined" aria-label="$2">$1</span>',
              )}
            </li>
          {/each}
        </ol>
      </section>
    {/if}
  </div>
</div>

<style lang="scss">
  .col {
    @media (min-width: 1024px) {
      width: calc(50% - 16px);
    }
  }

  .toolbar-instruction {
    background-color: var(--sui-primary-background-color-translucent);
    border-radius: 8px;
    padding: 32px;

    h2 {
      font-size: var(--sui-font-size-xxx-large);
    }

    img {
      width: 80%;
    }

    ol {
      margin: 16px 0 0;
      padding: 0;
    }

    li {
      margin: 4px 0 0;
      padding: 0;
      list-style-position: inside;

      :global(.icon) {
        vertical-align: bottom;
      }
    }

    &.chrome {
      li :global(.icon) {
        font-variation-settings: 'FILL' 1;
      }
    }
  }
</style>
